import React, { useState, useEffect } from 'react';
import { Mail, Lock, KeyRound, ShieldCheck, AlertCircle, X, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { loginWithEmail, registerWithEmail, sendPasswordResetOTP, verifyOTPAndResetPassword } from '../lib/supabase';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (user: any) => void;
}

type AuthMode = 'signin' | 'forgot_email' | 'forgot_otp';

export default function AuthModal({ onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Forgot Password fields
  const [otpToken, setOtpToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);

  // Restore reset mode and email from URL parameters or localStorage on mount
  useEffect(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const modeParam = searchParams.get('mode');
      const emailParam = searchParams.get('email') || searchParams.get('reset_email');
      const savedEmail = localStorage.getItem('meca_reset_otp_email');

      const targetEmail = emailParam || savedEmail || '';
      if (
        modeParam === 'reset_password' || 
        searchParams.has('reset_otp') || 
        searchParams.has('reset_email') || 
        (savedEmail && localStorage.getItem('meca_reset_otp_mode') === 'forgot_otp')
      ) {
        if (targetEmail) {
          setEmail(targetEmail);
          setSuccessMsg(`OTP code has been sent to ${targetEmail}. Please check your inbox.`);
        }
        setMode('forgot_otp');
      }
    } catch (e) {
      console.warn('Restore reset state error:', e);
    }
  }, []);

  // Sync mode and email with URL and localStorage
  useEffect(() => {
    try {
      if (mode === 'forgot_otp' && email) {
        localStorage.setItem('meca_reset_otp_email', email);
        localStorage.setItem('meca_reset_otp_mode', 'forgot_otp');
        const params = new URLSearchParams(window.location.search);
        params.set('mode', 'reset_password');
        params.set('email', email);
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.replaceState(null, '', newUrl);

        if (!successMsg && !error) {
          setSuccessMsg(`OTP code has been sent to ${email}. Please check your inbox.`);
        }
      } else if (mode === 'signin') {
        localStorage.removeItem('meca_reset_otp_email');
        localStorage.removeItem('meca_reset_otp_mode');
        const params = new URLSearchParams(window.location.search);
        if (params.get('mode') === 'reset_password' || params.has('reset_email') || params.has('reset_otp')) {
          params.delete('mode');
          params.delete('email');
          params.delete('reset_email');
          params.delete('reset_otp');
          const newQuery = params.toString();
          const newUrl = newQuery ? `${window.location.pathname}?${newQuery}` : window.location.pathname;
          window.history.replaceState(null, '', newUrl);
        }
      }
    } catch (e) {
      console.warn('Sync reset URL error:', e);
    }
  }, [mode, email]);

  const handleModalClose = () => {
    try {
      localStorage.removeItem('meca_reset_otp_email');
      localStorage.removeItem('meca_reset_otp_mode');
      const params = new URLSearchParams(window.location.search);
      if (params.get('mode') === 'reset_password' || params.has('reset_email') || params.has('reset_otp')) {
        params.delete('mode');
        params.delete('email');
        params.delete('reset_email');
        params.delete('reset_otp');
        const newQuery = params.toString();
        const newUrl = newQuery ? `${window.location.pathname}?${newQuery}` : window.location.pathname;
        window.history.replaceState(null, '', newUrl);
      }
    } catch (e) {}
    onClose();
  };

  // Timer countdown for Resend OTP (60s)
  useEffect(() => {
    if (mode !== 'forgot_otp' || resendCooldown <= 0) return;

    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [mode, resendCooldown]);

  // Handle Standard Sign In / Auto Register
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const inputVal = email.trim();
    if (!inputVal) {
      setError("অনুগ্রহ করে আপনার ইমেইল ঠিকানা লিখুন।");
      return;
    }
    if (!inputVal.includes('@')) {
      setError("অনুগ্রহ করে একটি সঠিক ইমেইল ঠিকানা লিখুন।");
      return;
    }
    if (!password.trim()) {
      setError("অনুগ্রহ করে আপনার পাসওয়ার্ড লিখুন।");
      return;
    }
    if (password.length < 6) {
      setError("পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে।");
      return;
    }

    setLoading(true);
    try {
      let loggedUser;
      
      // Step 1: Attempt to login
      try {
        loggedUser = await loginWithEmail(inputVal, password);
      } catch (loginErr: any) {
        const loginErrMsg = (loginErr?.message || '').toLowerCase();
        const loginErrCode = (loginErr?.code || '').toLowerCase();
        
        // Check for Supabase invalid credentials or user not found errors
        const isCredentialOrNotFound = 
          loginErrMsg.includes('invalid login credentials') ||
          loginErrMsg.includes('invalid credentials') ||
          loginErrMsg.includes('user not found') ||
          loginErrMsg.includes('user_not_found') ||
          loginErrCode.includes('invalid') ||
          loginErrCode.includes('not_found') ||
          loginErrCode.includes('not-found');

        if (isCredentialOrNotFound) {
          // Step 2: Attempt automatic registration for new users
          const finalName = inputVal.split('@')[0];
          
          try {
            loggedUser = await registerWithEmail(inputVal, password, finalName);
          } catch (regErr: any) {
            const regErrMsg = (regErr?.message || '').toLowerCase();
            const regErrCode = (regErr?.code || '').toLowerCase();
            
            const isAlreadyRegistered = 
              regErrMsg.includes('already registered') ||
              regErrMsg.includes('already in use') ||
              regErrMsg.includes('already exists') ||
              regErrCode.includes('user_already_exists') ||
              regErrCode.includes('email_already_in_use') ||
              regErrCode.includes('email_exists');

            if (isAlreadyRegistered) {
              throw new Error("ভুল পাসওয়ার্ড! অনুগ্রহ করে এই অ্যাকাউন্টের সঠিক পাসওয়ার্ড প্রদান করুন।");
            } else {
              throw regErr;
            }
          }
        } else {
          throw loginErr;
        }
      }

      if (loggedUser) {
        try {
          localStorage.setItem('current_user_pwd', password);
        } catch (e) {
          console.warn('Failed to save password in localStorage:', e);
        }
        onSuccess(loggedUser);
        onClose();
      }
    } catch (err: any) {
      console.warn("Auth submit error:", err);
      const errorMessage = err?.message || '';
      const errorCode = (err?.code || '').toLowerCase();
      const errLower = errorMessage.toLowerCase();

      if (errorMessage.includes("Incorrect password") || errorMessage.includes("ভুল পাসওয়ার্ড") || errLower.includes("incorrect password") || errLower.includes("invalid login credentials")) {
        setError("ভুল পাসওয়ার্ড! অনুগ্রহ করে এই অ্যাকাউন্টের সঠিক পাসওয়ার্ড প্রদান করুন।");
      } else if (errLower.includes("security purposes") || errLower.includes("rate limit") || errLower.includes("request this after")) {
        const secMatch = errorMessage.match(/after (\d+)\s*seconds/i) || errorMessage.match(/(\d+)\s*seconds/i);
        if (secMatch && secMatch[1]) {
          setError(`For security purposes, you can try again after ${secMatch[1]} seconds.`);
        } else {
          setError("For security purposes, please wait a moment before trying again.");
        }
      } else if (errLower.includes("email not confirmed")) {
        setError("আপনার ইমেইল ঠিকানা এখনো নিশ্চিত করা হয়নি। অনুগ্রহ করে ইনবক্স বা স্প্যাম ফোল্ডার চেক করুন।");
      } else if (errorCode.includes('invalid') || errorCode.includes('wrong') || errLower.includes('invalid')) {
        setError("ভুল পাসওয়ার্ড বা তথ্য! অনুগ্রহ করে সঠিক পাসওয়ার্ড প্রদান করে আবার চেষ্টা করুন।");
      } else if (errorCode.includes('weak') || errLower.includes('weak')) {
        setError("পাসওয়ার্ডটি খুব দুর্বল। অন্তত ৬ অক্ষরের পাসওয়ার্ড ব্যবহার করুন।");
      } else {
        setError("লগইন করতে ব্যর্থ হয়েছে। অনুগ্রহ করে তথ্য পরীক্ষা করে আবার চেষ্টা করুন।");
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Send Forgot Password OTP
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const targetEmail = email.trim();
    if (!targetEmail || !targetEmail.includes('@')) {
      setError("অনুগ্রহ করে একটি সঠিক ইমেইল ঠিকানা লিখুন।");
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetOTP(targetEmail);
      setSuccessMsg(`OTP code has been sent to ${targetEmail}. Please check your inbox.`);
      setResendCooldown(60);
      setMode('forgot_otp');
    } catch (err: any) {
      console.warn("Send OTP error:", err);
      let errMsg = err?.message || (typeof err === 'string' ? err : '');
      const errLower = errMsg.toLowerCase();

      if (errLower.includes("security purposes") || errLower.includes("rate limit") || errLower.includes("request this after")) {
        const secMatch = errMsg.match(/after (\d+)\s*seconds/i) || errMsg.match(/(\d+)\s*seconds/i);
        if (secMatch && secMatch[1]) {
          errMsg = `For security purposes, you can try again after ${secMatch[1]} seconds.`;
        } else {
          errMsg = "For security purposes, please wait a moment before requesting another OTP.";
        }
      } else if (errLower.includes("not registered") || errLower.includes("not_found") || errLower.includes("user not found") || errLower.includes("signups not allowed")) {
        errMsg = "ইমেইলটি নিবন্ধিত নয়";
      } else if (errLower.includes("sorry server down") || errLower.includes("smtp") || errLower.includes("unable to send") || errLower.includes("error sending")) {
        errMsg = "Sorry server down";
      } else if (!errMsg || errMsg === '{}' || typeof errMsg === 'object') {
        errMsg = "Sorry server down";
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const token = otpToken.trim();
    if (!token) {
      setError("আপনার ইমেইলে পাঠানো ওটিপি (OTP) কোডটি লিখুন।");
      return;
    }
    if (!newPassword.trim() || newPassword.length < 6) {
      setError("নতুন পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে।");
      return;
    }

    setLoading(true);
    try {
      const resetUser = await verifyOTPAndResetPassword(email.trim(), token, newPassword.trim());
      if (resetUser) {
        try {
          localStorage.setItem('current_user_pwd', newPassword.trim());
        } catch (e) {}
        onSuccess(resetUser);
        handleModalClose();
      }
    } catch (err: any) {
      console.warn("Reset Password error:", err);
      let msg = err?.message || (typeof err === 'string' ? err : '');
      const msgLower = msg.toLowerCase();
      if (msgLower.includes("invalid") || msgLower.includes("expired") || msgLower.includes("otp")) {
        msg = "ভুল বা মেয়াদোত্তীর্ণ ওটিপি (OTP) কোড। অনুগ্রহ করে কোডটি পরীক্ষা করে আবার চেষ্টা করুন।";
      } else if (!msg || msg === '{}' || typeof msg === 'object') {
        msg = "ভুল বা মেয়াদোত্তীর্ণ ওটিপি (OTP) কোড। অনুগ্রহ করে কোডটি দিয়ে আবার চেষ্টা করুন।";
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="auth-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fadeIn text-neutral-800">
      <div id="auth-modal-card" className="relative bg-white rounded-[32px] max-w-sm w-full shadow-2xl border-2 border-neutral-900/90 overflow-hidden my-8 animate-scaleIn p-6 md:p-8">
        
        {/* Close Button */}
        <button 
          id="auth-modal-close"
          onClick={handleModalClose}
          className="absolute top-5 right-5 z-10 w-8 h-8 rounded-full bg-neutral-100 text-neutral-400 hover:bg-red-50 hover:text-red-500 transition-colors flex items-center justify-center cursor-pointer border border-neutral-200"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Title */}
        <div className="text-center mt-2 mb-6">
          <h2 id="auth-brand-title" className="text-3xl font-black tracking-tight text-neutral-900 font-sans">
            Meca Learning
          </h2>
          <p id="auth-brand-subtitle" className="text-base font-bold text-neutral-500 mt-1">
            {mode === 'signin' && "Sign in / Login"}
            {mode === 'forgot_email' && "Forgot Password"}
            {mode === 'forgot_otp' && "Verify OTP & Reset"}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div id="auth-error-box" className="p-3.5 mb-5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-start gap-2.5 animate-shake text-left">
            <AlertCircle className="w-4.5 h-4.5 shrink-0 text-red-500 mt-0.5" />
            <p className="leading-normal">{error}</p>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div id="auth-success-box" className="p-3.5 mb-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-start gap-2.5 text-left">
            <CheckCircle2 className="w-4.5 h-4.5 shrink-0 text-emerald-600 mt-0.5" />
            <p className="leading-normal">{successMsg}</p>
          </div>
        )}

        {/* MODE 1: Standard Sign In */}
        {mode === 'signin' && (
          <form onSubmit={handleSignIn} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1">
              <label htmlFor="auth-email-input" className="block text-xs font-bold text-neutral-700 px-1">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-neutral-500">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  id="auth-email-input"
                  type="email"
                  required
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white border-2 border-neutral-900 text-neutral-900 text-sm font-semibold rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-neutral-900 transition-all placeholder:text-neutral-400"
                  placeholder="Email Address"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label htmlFor="auth-password-input" className="block text-xs font-bold text-neutral-700 px-1">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-neutral-500">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  id="auth-password-input"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white border-2 border-neutral-900 text-neutral-900 text-sm font-semibold rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-neutral-900 transition-all placeholder:text-neutral-400"
                  placeholder="Password"
                />
              </div>

              {/* Notice & Forgot Password link under Password Box */}
              <div className="flex items-start justify-between pt-1 px-1 gap-2">
                <p className="text-[11px] font-bold text-neutral-500 leading-tight">
                  * অ্যাকাউন্ট রেজিস্ট্রেশন না থাকলে অটোমেটিক রেজিস্ট্রেশন হয়ে যাবে
                </p>
                <button
                  type="button"
                  id="forgot-password-btn"
                  onClick={() => {
                    setError(null);
                    setSuccessMsg(null);
                    setMode('forgot_email');
                  }}
                  className="text-xs font-extrabold text-neutral-900 hover:text-black hover:underline cursor-pointer transition-colors whitespace-nowrap ml-auto"
                >
                  Forgot password?
                </button>
              </div>
            </div>

            {/* Sign in / Login submit button */}
            <button
              id="auth-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-white hover:bg-neutral-50 active:bg-neutral-100 border-2 border-neutral-900 text-neutral-900 text-sm font-extrabold rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)] active:translate-y-1 active:shadow-none"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <KeyRound className="w-4 h-4" />
              )}
              Sign in / Login
            </button>
          </form>
        )}

        {/* MODE 2: Forgot Password - Request OTP */}
        {mode === 'forgot_email' && (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <p className="text-xs font-medium text-neutral-600 text-center mb-2">
              Enter your email address to receive an OTP verification code.
            </p>

            <div className="space-y-1">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-neutral-500">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  id="forgot-email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white border-2 border-neutral-900 text-neutral-900 text-sm font-semibold rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-neutral-900 transition-all placeholder:text-neutral-400"
                  placeholder="Email Address"
                />
              </div>
            </div>

            <button
              id="send-otp-btn"
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-white hover:bg-neutral-50 active:bg-neutral-100 border-2 border-neutral-900 text-neutral-900 text-sm font-extrabold rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)] active:translate-y-1 active:shadow-none"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Send OTP Code"
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setSuccessMsg(null);
                  setMode('signin');
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-600 hover:text-neutral-900 cursor-pointer transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign in
              </button>
            </div>
          </form>
        )}

        {/* MODE 3: Enter OTP & New Password */}
        {mode === 'forgot_otp' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            {/* OTP Input */}
            <div className="space-y-1">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-neutral-500">
                  <ShieldCheck className="w-4 h-4" />
                </span>
                <input
                  id="otp-token-input"
                  type="text"
                  required
                  maxLength={8}
                  value={otpToken}
                  onChange={(e) => setOtpToken(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white border-2 border-neutral-900 text-neutral-900 text-sm font-mono font-bold tracking-widest rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-neutral-900 transition-all placeholder:font-sans placeholder:tracking-normal placeholder:text-neutral-400 placeholder:font-normal"
                  placeholder="Enter OTP"
                />
              </div>
            </div>

            {/* New Password Input */}
            <div className="space-y-1">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-neutral-500">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  id="new-password-input"
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white border-2 border-neutral-900 text-neutral-900 text-sm font-semibold rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-neutral-900 transition-all placeholder:text-neutral-400"
                  placeholder="New Password"
                />
              </div>
            </div>

            <button
              id="reset-password-btn"
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-white hover:bg-neutral-50 active:bg-neutral-100 border-2 border-neutral-900 text-neutral-900 text-sm font-extrabold rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)] active:translate-y-1 active:shadow-none"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Reset Password & Login"
              )}
            </button>

            <div className="flex items-center justify-between text-xs font-bold pt-2 px-1">
              <button
                type="button"
                onClick={handleSendOTP}
                disabled={loading || resendCooldown > 0}
                className="text-orange-600 hover:text-orange-700 hover:underline cursor-pointer disabled:opacity-60 disabled:no-underline disabled:cursor-not-allowed"
              >
                Resend OTP {resendCooldown > 0 ? `(${resendCooldown}s)` : ''}
              </button>
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setSuccessMsg(null);
                  setMode('signin');
                }}
                className="inline-flex items-center gap-1 text-neutral-600 hover:text-neutral-900 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Sign in
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}

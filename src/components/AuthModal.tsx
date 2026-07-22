import React, { useState } from 'react';
import { Mail, Lock, KeyRound, AlertCircle, X, ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react';
import { loginWithEmail, registerWithEmail, sendPasswordResetOTP, verifyPasswordResetOTP, updatePassword } from '../lib/supabase';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (user: any) => void;
}

type AuthMode = 'login' | 'forgot_email' | 'forgot_otp' | 'forgot_new_password' | 'forgot_success';

export default function AuthModal({ onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  
  // Login fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Forgot Password fields
  const [resetEmail, setResetEmail] = useState('');
  const [otpToken, setOtpToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Main login / auto-register submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const inputEmail = email.trim();
    if (!inputEmail || !inputEmail.includes('@')) {
      setError("দয়া করে একটি সঠিক ইমেইল এড্রেস প্রদান করুন।");
      return;
    }
    if (!password.trim()) {
      setError("দয়া করে পাসওয়ার্ড প্রদান করুন।");
      return;
    }
    if (password.length < 6) {
      setError("পাসওয়ার্ড অবশ্যই কমপক্ষে ৬ অক্ষরের হতে হবে।");
      return;
    }

    setLoading(true);
    try {
      let loggedUser;
      
      // Step 1: Attempt to login
      try {
        loggedUser = await loginWithEmail(inputEmail, password);
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
          const defaultName = inputEmail.split('@')[0];
          
          try {
            loggedUser = await registerWithEmail(inputEmail, password, defaultName);
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
              throw new Error("ভুল পাসওয়ার্ড। এই ইমেইল দিয়ে তৈরি অ্যাকাউন্টের জন্য সঠিক পাসওয়ার্ড দিন।");
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

      if (errorMessage.includes("ভুল পাসওয়ার্ড")) {
        setError(errorMessage);
      } else if (errorMessage.toLowerCase().includes("email not confirmed")) {
        setError("আপনার ইমেইলটি এখনো কনফার্ম করা হয়নি। দয়া করে আপনার ইমেইল ইনবক্স চেক করুন।");
      } else if (errorCode.includes('invalid') || errorCode.includes('wrong') || errorMessage.toLowerCase().includes('invalid')) {
        setError("ভুল পাসওয়ার্ড প্রদান করেছেন। দয়া করে সঠিক পাসওয়ার্ড দিয়ে আবার চেষ্টা করুন।");
      } else if (errorCode.includes('weak') || errorMessage.toLowerCase().includes('weak')) {
        setError("পাসওয়ার্ডটি খুবই দুর্বল। দয়া করে কমপক্ষে ৬ অক্ষরের একটি শক্তিশালী পাসওয়ার্ড দিন।");
      } else {
        setError(errorMessage || "অথেনটিকেশন সম্পন্ন করতে ত্রুটি হয়েছে। দয়া করে সঠিক তথ্য দিয়ে আবার চেষ্টা করুন।");
      }
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password Step 1: Send OTP to Email
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const targetEmail = resetEmail.trim();
    if (!targetEmail || !targetEmail.includes('@')) {
      setError("দয়া করে একটি সঠিক ইমেইল এড্রেস দিন।");
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetOTP(targetEmail);
      setSuccessMsg(`আমরা ${targetEmail} ইমেইলে একটি ওটিপি/রিসোট কোড পাঠিয়েছি।`);
      setMode('forgot_otp');
    } catch (err: any) {
      console.error("Send OTP error:", err);
      setError(err?.message || "ওটিপি পাঠাতে সমস্যা হয়েছে। ইমেইলটি সঠিক কিনা তা যাচাই করুন।");
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password Step 2: Verify OTP Token
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const token = otpToken.trim();
    if (!token) {
      setError("দয়া করে ইমেইলে পাওয়া ওটিপি কোডটি দিন।");
      return;
    }

    setLoading(true);
    try {
      await verifyPasswordResetOTP(resetEmail.trim(), token);
      setSuccessMsg("ওটিপি সফলভাবে ভেরিফাই হয়েছে! এবার আপনার নতুন পাসওয়ার্ড সেট করুন।");
      setMode('forgot_new_password');
    } catch (err: any) {
      console.error("Verify OTP error:", err);
      setError("অকার্যকর বা ভুল ওটিপি কোড। দয়া করে সঠিক ওটিপি দিন।");
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password Step 3: Update to New Password
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!newPassword.trim()) {
      setError("দয়া করে নতুন পাসওয়ার্ড দিন।");
      return;
    }
    if (newPassword.length < 6) {
      setError("পাসওয়ার্ড অবশ্যই কমপক্ষে ৬ অক্ষরের হতে হবে।");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("নতুন পাসওয়ার্ড এবং কনফার্ম পাসওয়ার্ড দুটি একই হতে হবে।");
      return;
    }

    setLoading(true);
    try {
      await updatePassword(newPassword);
      setSuccessMsg("পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে! এখন নতুন পাসওয়ার্ড দিয়ে লগইন করুন।");
      setEmail(resetEmail);
      setPassword(newPassword);
      setMode('forgot_success');
    } catch (err: any) {
      console.error("Update password error:", err);
      setError(err?.message || "পাসওয়ার্ড আপডেট করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
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
          onClick={onClose}
          className="absolute top-5 right-5 z-10 w-8 h-8 rounded-full bg-neutral-100 text-neutral-400 hover:bg-red-50 hover:text-red-500 transition-colors flex items-center justify-center cursor-pointer border border-neutral-200"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center mt-2 mb-6">
          <h2 id="auth-brand-title" className="text-3xl font-black tracking-tight text-neutral-900 font-sans">
            Meca Learning
          </h2>
          <p id="auth-brand-subtitle" className="text-sm font-bold text-neutral-500 mt-1">
            {mode === 'login' && 'Sign in / Login'}
            {mode === 'forgot_email' && 'Reset Password (পাসওয়ার্ড রিকভারি)'}
            {mode === 'forgot_otp' && 'Verify OTP Code (ওটিপি যাচাই)'}
            {mode === 'forgot_new_password' && 'Set New Password (নতুন পাসওয়ার্ড)'}
            {mode === 'forgot_success' && 'Password Reset Complete'}
          </p>
        </div>

        {/* Error Indicator */}
        {error && (
          <div id="auth-error-box" className="p-3.5 mb-5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-start gap-2.5 animate-shake text-left">
            <AlertCircle className="w-4.5 h-4.5 shrink-0 text-red-500 mt-0.5" />
            <p className="leading-normal">{error}</p>
          </div>
        )}

        {/* Success Indicator */}
        {successMsg && (
          <div id="auth-success-box" className="p-3.5 mb-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-start gap-2.5 text-left">
            <CheckCircle2 className="w-4.5 h-4.5 shrink-0 text-emerald-600 mt-0.5" />
            <p className="leading-normal">{successMsg}</p>
          </div>
        )}

        {/* ================= MODE 1: LOGIN ================= */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            
            {/* Email field */}
            <div className="space-y-1">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-neutral-500">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  id="auth-identifier-input"
                  type="email"
                  required
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white border-2 border-neutral-900 text-neutral-900 text-sm font-semibold rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-neutral-900 transition-all placeholder:text-neutral-400"
                  placeholder="ইমেইল এড্রেস (যেমন: user@gmail.com)"
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-1">
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
                  placeholder="পাসওয়ার্ড"
                />
              </div>

              {/* Forget Password Link right under password box */}
              <div className="flex justify-end px-1 pt-1">
                <button
                  type="button"
                  id="auth-forgot-password-btn"
                  onClick={() => {
                    setError(null);
                    setSuccessMsg(null);
                    setResetEmail(email);
                    setMode('forgot_email');
                  }}
                  className="text-xs font-bold text-neutral-800 hover:text-orange-600 transition-colors underline decoration-neutral-400 underline-offset-4 cursor-pointer"
                >
                  Forget password? (পাসওয়ার্ড ভুলে গেছেন?)
                </button>
              </div>
              
              {/* Auto-registration instruction */}
              <p className="text-[11px] font-bold text-neutral-500 px-1 mt-2 leading-relaxed">
                *অ্যাকাউন্ট না থাকলে পাসওয়ার্ড দিলে অটোমেটিক অ্যাকাউন্ট তৈরি হয়ে যাবে।
              </p>
            </div>

            {/* Sign in / Login submit button */}
            <button
              id="auth-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-white hover:bg-neutral-50 active:bg-neutral-100 border-2 border-neutral-900 text-neutral-900 text-sm font-extrabold rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)] active:translate-y-1 active:shadow-none"
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

        {/* ================= MODE 2: FORGOT PASSWORD - EMAIL INPUT ================= */}
        {mode === 'forgot_email' && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <p className="text-xs text-neutral-600 font-medium leading-relaxed">
              আপনার নিবন্ধিত ইমেইল এড্রেসটি দিন। আমরা একটি ওটিপি (OTP) রিসেট কোড পাঠিয়ে দেব।
            </p>

            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-neutral-500">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white border-2 border-neutral-900 text-neutral-900 text-sm font-semibold rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-neutral-900 transition-all placeholder:text-neutral-400"
                placeholder="ইমেইল এড্রেস"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-extrabold rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)]"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "ওটিপি পাঠান (Send OTP)"
              )}
            </button>

            <button
              type="button"
              onClick={() => { setError(null); setSuccessMsg(null); setMode('login'); }}
              className="w-full py-2 text-xs font-bold text-neutral-600 hover:text-neutral-900 flex items-center justify-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> লগইন পেজে ফিরে যান
            </button>
          </form>
        )}

        {/* ================= MODE 3: FORGOT PASSWORD - OTP INPUT ================= */}
        {mode === 'forgot_otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-neutral-500">
                <ShieldCheck className="w-4 h-4" />
              </span>
              <input
                type="text"
                required
                value={otpToken}
                onChange={(e) => setOtpToken(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white border-2 border-neutral-900 text-neutral-900 text-sm font-bold tracking-widest rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-neutral-900 transition-all placeholder:text-neutral-400"
                placeholder="৮ বা ৬ ডিজিট ওটিপি কোড"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-extrabold rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)]"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "ওটিপি যাচাই করুন (Verify OTP)"
              )}
            </button>

            <button
              type="button"
              onClick={() => { setError(null); setSuccessMsg(null); setMode('forgot_email'); }}
              className="w-full py-2 text-xs font-bold text-neutral-600 hover:text-neutral-900 flex items-center justify-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> আবার ইমেইল পরিবর্তন করুন
            </button>
          </form>
        )}

        {/* ================= MODE 4: SET NEW PASSWORD ================= */}
        {mode === 'forgot_new_password' && (
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="space-y-3">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-neutral-500">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white border-2 border-neutral-900 text-neutral-900 text-sm font-semibold rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-neutral-900 transition-all placeholder:text-neutral-400"
                  placeholder="নতুন পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)"
                />
              </div>

              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-neutral-500">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white border-2 border-neutral-900 text-neutral-900 text-sm font-semibold rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-neutral-900 transition-all placeholder:text-neutral-400"
                  placeholder="পাসওয়ার্ড নিশ্চিত করুন"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white text-sm font-extrabold rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)]"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "পাসওয়ার্ড আপডেট করুন (Update Password)"
              )}
            </button>
          </form>
        )}

        {/* ================= MODE 5: RESET SUCCESS ================= */}
        {mode === 'forgot_success' && (
          <div className="space-y-4 text-center">
            <button
              type="button"
              onClick={() => { setError(null); setSuccessMsg(null); setMode('login'); }}
              className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-extrabold rounded-2xl transition-all cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)]"
            >
              এখন নতুন পাসওয়ার্ড দিয়ে লগইন করুন
            </button>
          </div>
        )}

      </div>
    </div>
  );
}


import React, { useState } from 'react';
import { Mail, Lock, KeyRound, ShieldCheck, AlertCircle, X } from 'lucide-react';
import { loginWithEmail, registerWithEmail } from '../lib/supabase';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (user: any) => void;
}

export default function AuthModal({ onClose, onSuccess }: AuthModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const inputVal = email.trim();
    if (!inputVal) {
      setError("দয়া করে আপনার ইমেইল এড্রেস প্রদান করুন।");
      return;
    }
    if (!inputVal.includes('@')) {
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
        setError("আপনার ইমেইলটি এখনো কনফার্ম করা হয়নি। দয়া করে ইনবক্স অথবা স্প্যাম ফোল্ডার চেক করুন।");
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

        {/* Content Centered Layout matching user sketch */}
        <div className="text-center mt-2 mb-6">
          <h2 id="auth-brand-title" className="text-3xl font-black tracking-tight text-neutral-900 font-sans">
            Meca Learning
          </h2>
          <p id="auth-brand-subtitle" className="text-lg font-bold text-neutral-500 mt-1">
            Sign in / Login
          </p>
        </div>

        {/* Error Indicator */}
        {error && (
          <div id="auth-error-box" className="p-3.5 mb-5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-start gap-2.5 animate-shake text-left">
            <AlertCircle className="w-4.5 h-4.5 shrink-0 text-red-500 mt-0.5" />
            <p className="leading-normal">{error}</p>
          </div>
        )}

        {/* Form aligned with sketch styling */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email field matching image layout */}
          <div className="space-y-1">
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
                placeholder="ইমেইল এড্রেস"
              />
            </div>
          </div>

          {/* Password field with squiggly/key vibe */}
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
            
            {/* Instruction right below password box as requested */}
            <p className="text-[11px] font-bold text-neutral-950 px-2 mt-1.5 leading-relaxed">
              *অ্যাকাউন্ট রেজিস্ট্রেশন না থাকলে অটোমেটিক রেজিস্ট্রেশন হয়ে যাবে
            </p>
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
      </div>
    </div>
  );
}

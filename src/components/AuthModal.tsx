import React, { useState } from 'react';
import { Mail, Lock, KeyRound, ShieldCheck, AlertCircle, X, Smartphone } from 'lucide-react';
import { loginWithEmail, registerWithEmail } from '../lib/firebase';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (user: any) => void;
}

export default function AuthModal({ onClose, onSuccess }: AuthModalProps) {
  const [identifier, setIdentifier] = useState(''); // Email or Mobile
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const inputVal = identifier.trim();
    if (!inputVal) {
      setError("দয়া করে আপনার ইমেইল অথবা মোবাইল নাম্বার প্রদান করুন।");
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

    const isEmail = inputVal.includes('@');
    const cleanPhone = inputVal.replace(/[^0-9]/g, '');

    if (!isEmail && cleanPhone.length < 11) {
      setError("দয়া করে একটি সঠিক ইমেইল অথবা ১১ ডিজিটের মোবাইল নাম্বার প্রদান করুন।");
      return;
    }

    const targetEmail = isEmail ? inputVal : `${cleanPhone}@phone.maca.com`;

    setLoading(true);
    try {
      let loggedUser;
      
      // Step 1: Attempt to login
      try {
        loggedUser = await loginWithEmail(targetEmail, password);
      } catch (loginErr: any) {
        const loginErrCode = loginErr.code || '';
        
        // Step 2: If user not found, register them automatically
        if (loginErrCode === 'auth/user-not-found' || loginErrCode === 'auth/invalid-credential') {
          const finalName = isEmail ? inputVal.split('@')[0] : `User ${cleanPhone}`;
          
          try {
            loggedUser = await registerWithEmail(targetEmail, password, finalName);
          } catch (regErr: any) {
            const regErrCode = regErr.code || '';
            if (regErrCode === 'auth/email-already-in-use') {
              throw new Error("ভুল পাসওয়ার্ড। এই ইমেইল/মোবাইলটি ইতিমধ্যে নিবন্ধিত রয়েছে।");
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
          sessionStorage.setItem('current_user_pwd', password);
        } catch (e) {
          console.warn('Failed to save password in sessionStorage:', e);
        }
        onSuccess(loggedUser);
        onClose();
      }
    } catch (err: any) {
      console.warn("Auth submit error:", err);
      const errorCode = err.code || '';
      const errorMessage = err.message || '';

      if (errorMessage.includes("ভুল পাসওয়ার্ড")) {
        setError(errorMessage);
      } else if (errorCode === 'auth/invalid-credential' || errorCode === 'auth/wrong-password') {
        setError("ভুল পাসওয়ার্ড প্রদান করেছেন। দয়া করে সঠিক পাসওয়ার্ড দিয়ে আবার চেষ্টা করুন।");
      } else if (errorCode === 'auth/weak-password') {
        setError("পাসওয়ার্ডটি খুবই দুর্বল। দয়া করে কমপক্ষে ৬ অক্ষরের একটি শক্তিশালী পাসওয়ার্ড দিন।");
      } else if (errorCode === 'auth/invalid-email') {
        setError("প্রদত্ত ইমেইল এড্রেসটি সঠিক নয়।");
      } else {
        setError(err.message || "অথেনটিকেশন সম্পন্ন করতে ত্রুটি হয়েছে। দয়া করে সঠিক তথ্য দিয়ে আবার চেষ্টা করুন।");
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
          
          {/* Email or Phone field matching image layout */}
          <div className="space-y-1">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-neutral-500">
                <Smartphone className="w-4 h-4" />
              </span>
              <input
                id="auth-identifier-input"
                type="text"
                required
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                inputMode="email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white border-2 border-neutral-900 text-neutral-900 text-sm font-semibold rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-neutral-900 transition-all placeholder:text-neutral-400"
                placeholder="ইমেইল বা মোবাইল"
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

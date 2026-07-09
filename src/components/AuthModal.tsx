import React, { useState } from 'react';
import { Mail, Lock, User, KeyRound, ShieldCheck, AlertCircle, X, Phone } from 'lucide-react';
import { loginWithEmail, registerWithEmail } from '../lib/firebase';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (user: any) => void;
}

export default function AuthModal({ onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [authType, setAuthType] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic validation
    if (authType === 'email') {
      if (!email.trim() || !password.trim()) {
        setError("দয়া করে ইমেইল এবং পাসওয়ার্ড দুটিই প্রদান করুন।");
        return;
      }
    } else {
      if (!phone.trim() || !password.trim()) {
        setError("দয়া করে মোবাইল নাম্বার এবং পাসওয়ার্ড দুটিই প্রদান করুন।");
        return;
      }
      // Simple validation for Bangladeshi phone number or any generic phone number length
      const cleanPhone = phone.trim().replace(/[^0-9]/g, '');
      if (cleanPhone.length < 11) {
        setError("দয়া করে একটি সঠিক মোবাইল নাম্বার প্রদান করুন (কমপক্ষে ১১ ডিজিট)।");
        return;
      }
    }

    if (mode === 'register' && !name.trim()) {
      setError("দয়া করে আপনার নাম প্রদান করুন।");
      return;
    }
    if (password.length < 6) {
      setError("পাসওয়ার্ড অবশ্যই কমপক্ষে ৬ অক্ষরের হতে হবে।");
      return;
    }

    setLoading(true);
    try {
      let loggedUser;
      const targetEmail = authType === 'email' 
        ? email.trim() 
        : `${phone.trim().replace(/[^0-9]/g, '')}@phone.maca.com`;

      if (mode === 'login') {
        loggedUser = await loginWithEmail(targetEmail, password);
      } else {
        // We can pass name, but let's append phone details if registering with phone number
        const displayName = authType === 'phone' ? `${name.trim()} (${phone.trim()})` : name.trim();
        loggedUser = await registerWithEmail(targetEmail, password, displayName);
      }
      onSuccess(loggedUser);
      onClose();
    } catch (err: any) {
      console.error("Auth submit error:", err);
      // Localize common firebase auth error messages
      const errorCode = err.code || '';
      if (errorCode === 'auth/invalid-credential' || errorCode === 'auth/wrong-password' || errorCode === 'auth/user-not-found') {
        setError("ভুল তথ্য প্রদান করেছেন। দয়া করে সঠিক ইমেইল/মোবাইল এবং পাসওয়ার্ড দিয়ে আবার চেষ্টা করুন।");
      } else if (errorCode === 'auth/email-already-in-use') {
        setError(authType === 'email' 
          ? "এই ইমেইলটি ইতিমধ্যে নিবন্ধিত রয়েছে। লগইন করার চেষ্টা করুন।" 
          : "এই মোবাইল নাম্বারটি ইতিমধ্যে নিবন্ধিত রয়েছে। লগইন করার চেষ্টা করুন।");
      } else if (errorCode === 'auth/invalid-email') {
        setError("প্রদত্ত ইমেইল এড্রেসটি সঠিক নয়।");
      } else if (errorCode === 'auth/weak-password') {
        setError("পাসওয়ার্ডটি খুবই দুর্বল। দয়া করে আরো শক্তিশালী পাসওয়ার্ড দিন।");
      } else {
        setError(err.message || "অথেনটিকেশন সম্পন্ন করতে ত্রুটি হয়েছে। দয়া করে সঠিক তথ্য দিয়ে আবার চেষ্টা করুন।");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fadeIn text-neutral-800">
      <div className="relative bg-white rounded-3xl max-w-md w-full shadow-2xl border border-neutral-100 overflow-hidden my-8 animate-scaleIn">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-neutral-50 text-neutral-400 hover:bg-red-50 hover:text-red-500 transition-colors flex items-center justify-center cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Banner (Styled fully white) */}
        <div className="bg-white text-neutral-900 p-6 pb-5 text-center relative overflow-hidden border-b border-neutral-100/80">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-neutral-100 text-neutral-900 mx-auto mb-3 border border-neutral-200/50">
            <KeyRound className="w-6 h-6 animate-pulse" />
          </div>
          <h3 className="text-xl font-black tracking-tight text-neutral-900">ম্যাকা লার্নিং ড্যাশবোর্ড</h3>
          <p className="text-xs text-neutral-500 font-semibold mt-1">
            {mode === 'login' ? 'আপনার অ্যাকাউন্টে লগইন করে শেখা শুরু করুন' : 'নতুন একটি অ্যাকাউন্ট তৈরি করে যুক্ত হোন আমাদের সাথে'}
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 md:p-8 space-y-6">
          
          {/* Error Indicator */}
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-700 text-xs font-semibold flex items-start gap-2.5 animate-shake">
              <AlertCircle className="w-4.5 h-4.5 shrink-0 text-red-500 mt-0.5" />
              <p className="leading-normal">{error}</p>
            </div>
          )}

          {/* Email / Phone Tabs */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-neutral-100/80 rounded-2xl">
            <button
              type="button"
              onClick={() => {
                setError(null);
                setAuthType('email');
              }}
              className={`py-2 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authType === 'email'
                  ? 'bg-neutral-950 text-white shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-850'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              ইমেইল দিয়ে
            </button>
            <button
              type="button"
              onClick={() => {
                setError(null);
                setAuthType('phone');
              }}
              className={`py-2 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authType === 'phone'
                  ? 'bg-neutral-950 text-white shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-850'
              }`}
            >
              <Phone className="w-3.5 h-3.5" />
              মোবাইল নাম্বার দিয়ে
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Name Field (Only for registration) */}
            {mode === 'register' && (
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-neutral-400 block">আপনার পুরো নাম:</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-neutral-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 hover:bg-neutral-100/50 focus:bg-white border border-neutral-200 text-neutral-800 text-xs font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-950/20 focus:border-neutral-950 transition-all"
                    placeholder="যেমন: জাহিদ হাসান"
                  />
                </div>
              </div>
            )}

            {/* Email / Phone Field */}
            {authType === 'email' ? (
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-neutral-400 block">ইমেইল এড্রেস:</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-neutral-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 hover:bg-neutral-100/50 focus:bg-white border border-neutral-200 text-neutral-800 text-xs font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-950/20 focus:border-neutral-950 transition-all"
                    placeholder="name@example.com"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-neutral-400 block">মোবাইল নাম্বার:</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-neutral-400">
                    <Phone className="w-4 h-4" />
                  </span>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 hover:bg-neutral-100/50 focus:bg-white border border-neutral-200 text-neutral-800 text-xs font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-950/20 focus:border-neutral-950 transition-all"
                    placeholder="যেমন: 017XXXXXXXX"
                  />
                </div>
              </div>
            )}

            {/* Password Field */}
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-neutral-400 block">সিক্রেট পাসওয়ার্ড:</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-neutral-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 hover:bg-neutral-100/50 focus:bg-white border border-neutral-200 text-neutral-800 text-xs font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-950/20 focus:border-neutral-950 transition-all"
                  placeholder="কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড"
                />
              </div>
            </div>

            {/* Primary Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-neutral-950 hover:bg-neutral-900 text-white text-xs font-black rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <ShieldCheck className="w-4 h-4" />
              )}
              {mode === 'login' ? 'লগইন করুন' : 'রেজিস্ট্রেশন সম্পূর্ণ করুন'}
            </button>
          </form>

          {/* Footer state switcher */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setError(null);
                setMode(mode === 'login' ? 'register' : 'login');
              }}
              className="text-xs font-bold text-neutral-600 hover:text-neutral-950 hover:underline transition-all cursor-pointer"
            >
              {mode === 'login' 
                ? "নতুন অ্যাকাউন্ট তৈরি করতে চান? এখানে ক্লিক করুন" 
                : "ইতিমধ্যে অ্যাকাউন্ট রয়েছে? লগইন করুন"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

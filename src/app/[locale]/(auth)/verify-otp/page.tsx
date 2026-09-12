'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { 
  Key, ArrowLeft, ArrowRight, WarningCircle, EnvelopeSimple, 
  ShieldCheck, Sparkle, LockKey, GraduationCap 
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/use-auth-store';
import Link from 'next/link';
import { LanguageSwitcher } from '@/components/layout/language-switcher';
import { getApiBaseUrl } from '@/lib/api';

function VerifyOtpForm() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = (params?.locale as string) || 'km';
  const isKm = locale === 'km';

  const emailParam = searchParams.get('email') || '';
  const devOtp = searchParams.get('dev_otp');

  const { setAuth } = useAuthStore();
  const [activeOtp, setActiveOtp] = useState<string | null>(devOtp || null);
  const [otp, setOtp] = useState<string[]>(devOtp && devOtp.length === 6 ? devOtp.split('') : ['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (emailParam) {
      const apiBase = getApiBaseUrl();
      fetch(`${apiBase}/auth/latest-otp?email=${encodeURIComponent(emailParam)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.code) {
            setActiveOtp(data.code);
            setOtp(data.code.split(''));
          }
        })
        .catch(() => {});
    }
  }, [emailParam]);

  useEffect(() => {
    if (devOtp && devOtp.length === 6) {
      setActiveOtp(devOtp);
      setOtp(devOtp.split(''));
    }
  }, [devOtp]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(-1);
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) {
      setError(isKm ? 'សូមបញ្ចូលលេខកូដឱ្យគ្រប់ ៦ ខ្ទង់' : 'Please enter all 6 digits.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const apiBase = getApiBaseUrl();
      const res = await fetch(`${apiBase}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailParam,
          otp_code: code,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || (isKm ? 'លេខកូដ OTP មិនត្រឹមត្រូវ' : 'Invalid OTP code'));
      }

      const data = await res.json();
      setAuth(data.access_token, data.user);
      const userRole = data.user?.role || 'teacher';
      if (userRole === 'student') {
        router.push(`/${locale}/student/dashboard`);
      } else {
        router.push(`/${locale}/dashboard`);
      }
    } catch (err: any) {
      setError(err.message || (isKm ? 'ការផ្ទៀងផ្ទាត់បរាជ័យ' : 'Verification failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto z-20">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 text-white shadow-xl shadow-blue-500/25 mb-3 ring-4 ring-white/10">
          <Key size={32} weight="fill" />
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight">
          {isKm ? 'ផ្ទៀងផ្ទាត់លេខកូដ OTP' : 'Verify Email OTP'}
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
          {isKm ? 'លេខកូដសម្ងាត់ ៦ ខ្ទង់ត្រូវបានផ្ញើទៅកាន់:' : 'A 6-digit verification code has been sent to:'}
        </p>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 mt-2 rounded-full bg-slate-900 border border-slate-800 text-blue-400 text-xs font-mono font-bold">
          <EnvelopeSimple size={14} />
          <span>{emailParam || 'user@school.edu.kh'}</span>
        </div>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80 space-y-5">

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-start gap-2.5">
            <WarningCircle size={16} weight="fill" className="shrink-0 mt-0.5 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-6">
          <div className="flex justify-between gap-2 sm:gap-2.5">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => { inputRefs.current[idx] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-black rounded-2xl bg-slate-950 border border-slate-800 text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition shadow-inner font-mono"
              />
            ))}
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 text-xs font-bold rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
          >
            <span>{loading ? (isKm ? 'កំពុងផ្ទៀងផ្ទាត់...' : 'Verifying...') : (isKm ? 'បញ្ជាក់ & ចូលប្រព័ន្ធ' : 'Verify & Continue')}</span>
            <ArrowRight size={15} weight="bold" />
          </Button>
        </form>

        <div className="pt-2 text-center">
          <Link
            href={`/${locale}/login`}
            className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white transition font-medium"
          >
            <ArrowLeft size={14} />
            <span>{isKm ? 'ត្រឡប់ទៅកាន់ទំព័រ Login' : 'Back to Login'}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-violet-600/20 rounded-full blur-[120px] pointer-events-none" />

      <header className="absolute top-6 right-6 z-30">
        <LanguageSwitcher />
      </header>

      <Suspense fallback={
        <div className="text-white text-xs flex items-center gap-2">
          <span>Loading...</span>
        </div>
      }>
        <VerifyOtpForm />
      </Suspense>
    </div>
  );
}

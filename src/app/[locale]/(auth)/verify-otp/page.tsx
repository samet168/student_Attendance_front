'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import {
  Key, ArrowLeft, ArrowRight, WarningCircle, EnvelopeSimple,
  ShieldCheck, CheckCircle, LockKey, GraduationCap, Timer, ArrowClockwise
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/use-auth-store';
import Link from 'next/link';
import { LanguageSwitcher } from '@/components/layout/language-switcher';
import { ThemeSwitcher } from '@/components/layout/theme-switcher';
import { getApiBaseUrl } from '@/lib/api';

const RESEND_COOLDOWN = 30;

function VerifyOtpForm() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = (params?.locale as string) || 'km';
  const isKm = locale === 'km';

  const emailParam = searchParams.get('email') || '';

  const { setAuth } = useAuthStore();
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendMsg, setResendMsg] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

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

  const handleResend = async () => {
    if (!emailParam || cooldown > 0 || loading) return;

    setResendMsg(null);
    setError(null);
    try {
      const apiBase = getApiBaseUrl();
      const res = await fetch(`${apiBase}/auth/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailParam }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || (isKm ? 'ការផ្ញើកូដបរាជ័យ' : 'Failed to resend code'));
      }

      const resData = await res.json().catch(() => ({}));
      if (resData.dev_otp) {
        setDevOtp(resData.dev_otp);
      }

      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      setCooldown(RESEND_COOLDOWN);
      timerRef.current = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      setResendMsg(isKm ? 'លេខកូដថ្មីត្រូវបានផ្ញើទៅអ៊ីមែលរបស់អ្នក' : 'A new code has been sent to your email');
    } catch (err) {
      setError(err instanceof Error ? err.message : (isKm ? 'ការផ្ញើកូដបរាជ័យ' : 'Failed to resend code'));
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
    } catch (err) {
      setError(err instanceof Error ? err.message : (isKm ? 'ការផ្ទៀងផ្ទាត់បរាជ័យ' : 'Verification failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white flex items-center justify-center p-4 sm:p-6 lg:p-10 relative overflow-hidden font-sans">
      {/* Subtle monochrome watermark */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-neutral-100 dark:bg-neutral-900/60 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-neutral-100 dark:bg-neutral-900/60 blur-3xl pointer-events-none" />

      {/* Top Bar (Language & Theme switchers) */}
      <header className="absolute top-4 sm:top-6 right-4 sm:right-8 z-30 flex items-center gap-2.5">
        <ThemeSwitcher />
        <LanguageSwitcher />
      </header>

      {/* Main Container */}
      <div className="w-full max-w-md lg:max-w-5xl grid grid-cols-1 lg:grid-cols-12 rounded-3xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xl shadow-neutral-900/[0.06] dark:shadow-black/50 z-20">

        {/* Left Side: Visual Showcase */}
        <div className="hidden lg:flex lg:col-span-5 bg-neutral-50 dark:bg-neutral-950 p-8 sm:p-10 flex-col justify-between relative border-b lg:border-b-0 lg:border-r border-neutral-200 dark:border-neutral-800">
          <div>
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center shadow-md">
                <GraduationCap size={28} weight="fill" />
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight text-neutral-900 dark:text-white leading-tight">Smart School</h1>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-semibold tracking-[0.18em] uppercase">
                  {isKm ? 'ប្រព័ន្ធគ្រប់គ្រងសាលាឆ្លាតវៃ' : 'Academic Portal'}
                </p>
              </div>
            </div>

            {/* Main Headline */}
            <div className="space-y-2 mb-8">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border border-neutral-900 dark:border-white">
                <ShieldCheck size={12} weight="fill" />
                {isKm ? 'ការការពារសុវត្ថិភាព ២០២៦' : 'Security Verified 2026'}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white leading-snug tracking-tight">
                {isKm ? 'បញ្ជាក់អត្តសញ្ញាណរបស់អ្នក ដោយសុវត្ថិភាព' : 'Confirm Your Identity Securely'}
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                {isKm
                  ? 'បញ្ចូលលេខកូដ ៦ ខ្ទង់ដែលបានផ្ញើទៅអ៊ីមែលរបស់អ្នក ដើម្បីបញ្ចប់ការផ្ទៀងផ្ទាត់គណនី។'
                  : 'Enter the 6-digit code sent to your email to finish verifying your account.'}
              </p>
            </div>

            {/* Feature Highlight Cards */}
            <div className="space-y-2.5">
              <div className="p-3 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-white flex items-center justify-center border border-neutral-200 dark:border-neutral-800 shrink-0">
                  <EnvelopeSimple size={18} weight="fill" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-neutral-900 dark:text-white">{isKm ? 'ផ្ញើតាមអ៊ីមែល' : 'Email Delivery'}</h3>
                  <p className="text-[10px] text-neutral-500 dark:text-neutral-400">{isKm ? 'លេខកូដដែលអាចប្រើបានតែម្ដង' : 'One-time verification code, delivered instantly'}</p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-white flex items-center justify-center border border-neutral-200 dark:border-neutral-800 shrink-0">
                  <Timer size={18} weight="fill" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-neutral-900 dark:text-white">{isKm ? 'មានរយៈពេលកំណត់' : 'Time-Limited'}</h3>
                  <p className="text-[10px] text-neutral-500 dark:text-neutral-400">{isKm ? 'លេខកូដផុតកំណត់ដើម្បីការពារគណនី' : 'Codes expire quickly to protect your account'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer badge */}
          <div className="pt-6 mt-6 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400 dark:text-neutral-500">
            <span>© 2026 Smart School</span>
            <span className="text-neutral-600 dark:text-neutral-300 flex items-center gap-1 font-semibold">
              <CheckCircle size={13} weight="fill" />
              {isKm ? 'ប្រព័ន្ធដំណើរការធម្មតា' : 'Systems Operational'}
            </span>
          </div>
        </div>

        {/* Right Side: OTP Verification Form */}
        <div className="lg:col-span-7 p-5 sm:p-6 lg:p-10 flex flex-col justify-center bg-white dark:bg-neutral-900">
          <div className="max-w-md w-full mx-auto space-y-6">

            {/* Mobile brand header */}
            <div className="flex items-center gap-3 mb-6 lg:hidden">
              <div className="w-11 h-11 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center shadow-md shrink-0">
                <GraduationCap size={26} weight="fill" />
              </div>
              <div className="min-w-0">
                <h1 className="text-base font-black tracking-tight text-neutral-900 dark:text-white leading-tight truncate">Smart School</h1>
                <p className="text-[10px] text-neutral-500 dark:text-neutral-400 font-semibold tracking-[0.18em] uppercase truncate">
                  {isKm ? 'ប្រព័ន្ធគ្រប់គ្រងសាលាឆ្លាតវៃ' : 'Academic Portal'}
                </p>
              </div>
            </div>

            {/* Form Header */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-md mb-3.5">
                <Key size={28} weight="fill" />
              </div>
              <h2 className="text-xl font-black text-neutral-900 dark:text-white tracking-tight">
                {isKm ? 'ផ្ទៀងផ្ទាត់លេខកូដ OTP' : 'Verify Email OTP'}
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-xs mx-auto">
                {isKm ? 'លេខកូដសម្ងាត់ ៦ ខ្ទង់ត្រូវបានផ្ញើទៅកាន់:' : 'A 6-digit verification code has been sent to:'}
              </p>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 mt-2.5 rounded-full bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-200 text-xs font-mono font-bold">
                <EnvelopeSimple size={14} />
                <span>{emailParam || 'user@school.edu.kh'}</span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
                <WarningCircle size={17} weight="fill" className="shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Resend success Message */}
            {resendMsg && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
                <CheckCircle size={17} weight="fill" className="shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                <span>{resendMsg}</span>
              </div>
            )}

            <form onSubmit={handleVerify} className="space-y-5">
              {/* OTP Inputs */}
              <div>
                <label className="block text-center text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-3">
                  {isKm ? 'បញ្ចូលលេខកូដ ៦ ខ្ទង់' : 'Enter the 6-digit code'}
                </label>
                <div className="flex justify-between gap-2 sm:gap-2.5" dir="ltr">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => { inputRefs.current[idx] = el; }}
                      type="text"
                      inputMode="numeric"
                      autoComplete={idx === 0 ? 'one-time-code' : 'off'}
                      maxLength={1}
                      value={digit}
                      aria-label={`Digit ${idx + 1}`}
                      onChange={(e) => handleChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-black rounded-2xl font-mono border transition-all focus:outline-none focus:ring-2 cursor-text ${
                        digit
                          ? 'bg-neutral-900 dark:bg-white border-neutral-900 dark:border-white text-white dark:text-neutral-900 shadow-sm shadow-neutral-900/20 dark:shadow-none'
                          : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white focus:ring-neutral-900/10 dark:focus:ring-white/20 focus:border-neutral-900 dark:focus:border-white'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full py-3 h-12 min-h-12 text-sm font-bold rounded-xl bg-neutral-900 dark:bg-white hover:bg-[#27272a] dark:hover:bg-neutral-200 text-white dark:text-neutral-900 shadow-md shadow-neutral-900/20 dark:shadow-none flex items-center justify-center gap-2 cursor-pointer transition-all transform active:scale-[0.99] disabled:opacity-60"
              >
                <span>{loading ? (isKm ? 'កំពុងផ្ទៀងផ្ទាត់...' : 'Verifying...') : (isKm ? 'បញ្ជាក់ & ចូលប្រព័ន្ធ' : 'Verify & Continue')}</span>
                <ArrowRight size={15} weight="bold" />
              </Button>
            </form>

            {/* Resend Code */}
            <div className="flex items-center justify-center gap-1.5 text-xs">
              <span className="text-neutral-400 dark:text-neutral-500">
                {isKm ? 'មិនទាន់ទទួលបានកូដទេ?' : "Didn't receive the code?"}
              </span>
              <button
                type="button"
                onClick={handleResend}
                disabled={cooldown > 0 || loading || !emailParam}
                className="inline-flex items-center gap-1 font-bold text-neutral-900 dark:text-white hover:underline underline-offset-4 cursor-pointer transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowClockwise size={13} weight="bold" />
                <span>
                  {cooldown > 0
                    ? (isKm ? `រង់ចាំ ${cooldown}s` : `Resend in ${cooldown}s`)
                    : (isKm ? 'ផ្ញើម្ដងទៀត' : 'Resend Code')}
                </span>
              </button>
            </div>

            {/* Back to Login */}
            <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 text-center">
              <Link
                href={`/${locale}/login`}
                className="inline-flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition font-medium cursor-pointer"
              >
                <ArrowLeft size={14} />
                <span>{isKm ? 'ត្រឡប់ទៅកាន់ទំព័រ Login' : 'Back to Login'}</span>
              </Link>
            </div>

            {/* Security Note */}
            <p className="flex items-center justify-center gap-1.5 text-[10px] text-neutral-400 dark:text-neutral-500">
              <LockKey size={12} weight="fill" />
              {isKm
                ? 'លេខកូដត្រូវបានអ៊ិនគ្រីបដោយវគ្គសុវត្ថិភាព (TLS)'
                : 'Codes are encrypted over a secure session (TLS)'}
            </p>

          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center">
        <div className="text-xs text-neutral-500 dark:text-neutral-400 animate-pulse">
          Loading...
        </div>
      </div>
    }>
      <VerifyOtpForm />
    </Suspense>
  );
}

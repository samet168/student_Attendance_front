'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  GraduationCap, EnvelopeSimple, LockKey, WarningCircle,
  ArrowRight, ShieldCheck, IdentificationBadge, UserGear,
  Eye, EyeSlash, CheckCircle, ChalkboardTeacher,
  Brain
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/use-auth-store';
import { LanguageSwitcher } from '@/components/layout/language-switcher';
import { ThemeSwitcher } from '@/components/layout/theme-switcher';
import { getApiBaseUrl } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || 'km';
  const isKm = locale === 'km';

  const { setAuth } = useAuthStore();

  const [authMethod, setAuthMethod] = useState<'password' | 'otp'>('password');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'teacher' | 'student'>('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const apiBase = getApiBaseUrl();
      if (authMethod === 'otp') {
        const res = await fetch(`${apiBase}/auth/request-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim().toLowerCase() }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.detail || (isKm ? 'អ៊ីមែលនេះមិនទាន់បានចុះឈ្មោះក្នុងប្រព័ន្ធទេ' : 'Email not registered.'));
        }

        const data = await res.json();
        // dev_otp returned when SMTP not configured — pass to verify page for auto-fill
        const devOtp = data.dev_otp ? `&dev_otp=${encodeURIComponent(data.dev_otp)}` : '';
        router.push(`/${locale}/verify-otp?email=${encodeURIComponent(email.trim().toLowerCase())}${devOtp}`);
        return;
      }

      // Password login
      const res = await fetch(`${apiBase}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || (isKm ? 'អ៊ីមែល ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវ' : 'Invalid email or password'));
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
      setError(err instanceof Error ? err.message : (isKm ? 'ការចូលប្រើប្រាស់បរាជ័យ' : 'Login failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRole = (roleKey: 'admin' | 'teacher' | 'student') => {
    setSelectedRole(roleKey);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white flex items-center justify-center p-4 sm:p-6 lg:p-10 relative overflow-hidden font-sans">
      {/* Subtle monochrome watermark */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-neutral-100 dark:bg-neutral-900/60 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-neutral-100 dark:bg-neutral-900/60 blur-3xl pointer-events-none" />

      {/* Top Bar (Language switcher) */}
      <header className="absolute top-4 sm:top-6 right-4 sm:right-8 z-30 flex items-center gap-2.5">
        <ThemeSwitcher />
        <LanguageSwitcher />
      </header>

      {/* Main Container — mobile-first single column card, split panel on lg+ */}
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
                {isKm ? 'បច្ចេកវិទ្យាអប់រំទំនើប ២០២៦' : 'EdTech Platform 2026'}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white leading-snug tracking-tight">
                {isKm ? 'គ្រប់គ្រងការសិក្សា កិច្ចការ និងវត្តមានដោយសុវត្ថិភាព' : 'Unified Secure Platform for Academics & Roles'}
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                {isKm
                  ? 'ប្រព័ន្ធសុវត្ថិភាពខ្ពស់ ផ្ដល់សិទ្ធិច្បាស់លាស់ដល់ Admin គ្រូបង្រៀន និងសិស្សានុសិស្ស ជាមួយការការពារទិន្នន័យយ៉ាងម៉ត់ចត់។'
                  : 'Enterprise security with isolated access scopes for Administrators, Teachers, and Students.'}
              </p>
            </div>

            {/* Feature Highlight Cards */}
            <div className="space-y-2.5">
              <div className="p-3 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-white flex items-center justify-center border border-neutral-200 dark:border-neutral-800 shrink-0">
                  <Brain size={18} weight="fill" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-neutral-900 dark:text-white">{isKm ? 'AI Study Assistant' : 'AI Study Assistant'}</h3>
                  <p className="text-[10px] text-neutral-500 dark:text-neutral-400">{isKm ? 'ណែនាំគន្លឹះរៀនពូកែ និងកាលវិភាគសិក្សា' : 'Smart revision plans & learning recommendations'}</p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-white flex items-center justify-center border border-neutral-200 dark:border-neutral-800 shrink-0">
                  <ShieldCheck size={18} weight="fill" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-neutral-900 dark:text-white">{isKm ? 'RBAC & Cloud Security' : 'Role-Based Access Control'}</h3>
                  <p className="text-[10px] text-neutral-500 dark:text-neutral-400">{isKm ? 'ការពារទិន្នន័យដោយ Bcrypt & JWT Encryption' : 'Strict teacher isolation & student privacy'}</p>
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

        {/* Right Side: Secure Login Form */}
        <div className="lg:col-span-7 p-5 sm:p-6 lg:p-10 flex flex-col justify-center bg-white dark:bg-neutral-900">
          <div className="max-w-md w-full mx-auto space-y-6">

            {/* Mobile brand header — desktop: hidden */}
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
            <div>
              <h2 className="text-xl font-black text-neutral-900 dark:text-white tracking-tight">
                {isKm ? 'ចូលប្រើប្រាស់គណនី' : 'Welcome Back'}
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                {isKm ? 'សូមជ្រើសរើសតួនាទី និងបញ្ចូលព័ត៌មានគណនីរបស់អ្នក' : 'Select your role and enter your account credentials'}
              </p>
            </div>

            {/* Role Selection Tabs */}
            <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => handleSelectRole('admin')}
                className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-12 ${
                  selectedRole === 'admin'
                    ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-900 dark:border-white shadow-sm'
                    : 'text-neutral-500 dark:text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 border border-transparent'
                }`}
              >
                <UserGear size={16} weight={selectedRole === 'admin' ? 'fill' : 'regular'} className="mb-0.5" />
                <span>Admin</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectRole('teacher')}
                className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-12 ${
                  selectedRole === 'teacher'
                    ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-900 dark:border-white shadow-sm'
                    : 'text-neutral-500 dark:text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 border border-transparent'
                }`}
              >
                <ChalkboardTeacher size={16} weight={selectedRole === 'teacher' ? 'fill' : 'regular'} className="mb-0.5" />
                <span>{isKm ? 'គ្រូបង្រៀន' : 'Teacher'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectRole('student')}
                className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-12 ${
                  selectedRole === 'student'
                    ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-900 dark:border-white shadow-sm'
                    : 'text-neutral-500 dark:text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 border border-transparent'
                }`}
              >
                <IdentificationBadge size={16} weight={selectedRole === 'student' ? 'fill' : 'regular'} className="mb-0.5" />
                <span>{isKm ? 'សិស្ស' : 'Student'}</span>
              </button>
            </div>

            {/* Auth Method Tabs: Password vs OTP */}
            <div className="flex border-b border-neutral-200 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setAuthMethod('password')}
                className={`flex-1 pb-2.5 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition cursor-pointer ${
                  authMethod === 'password'
                    ? 'border-neutral-900 dark:border-white text-neutral-900 dark:text-white'
                    : 'border-transparent text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
                }`}
              >
                <LockKey size={15} weight={authMethod === 'password' ? 'fill' : 'regular'} />
                <span>{isKm ? 'ពាក្យសម្ងាត់ (Password)' : 'Password Sign In'}</span>
              </button>
              <button
                type="button"
                onClick={() => setAuthMethod('otp')}
                className={`flex-1 pb-2.5 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition cursor-pointer ${
                  authMethod === 'otp'
                    ? 'border-neutral-900 dark:border-white text-neutral-900 dark:text-white'
                    : 'border-transparent text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
                }`}
              >
                <EnvelopeSimple size={15} weight={authMethod === 'otp' ? 'fill' : 'regular'} />
                <span>{isKm ? 'កូដ OTP (Email)' : 'Email OTP Code'}</span>
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
                <WarningCircle size={17} weight="fill" className="shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  {isKm ? 'អាសយដ្ឋានអ៊ីមែល (Email Address)' : 'Email Address'} *
                </label>
                <div className="relative">
                  <EnvelopeSimple size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@school.edu.kh"
                    className="w-full pl-10 pr-4 py-3 min-h-[48px] text-sm rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 dark:focus:ring-white/20 focus:border-neutral-900 dark:focus:border-white transition"
                  />
                </div>
              </div>

              {authMethod === 'password' && (
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    {isKm ? 'ពាក្យសម្ងាត់ (Password)' : 'Password'} *
                  </label>
                  <div className="relative">
                    <LockKey size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-3 min-h-[48px] text-sm rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 dark:focus:ring-white/20 focus:border-neutral-900 dark:focus:border-white transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer"
                    >
                      {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full py-3 h-12 min-h-12 text-sm font-bold rounded-xl bg-neutral-900 dark:bg-white hover:bg-[#27272a] dark:hover:bg-neutral-200 text-white dark:text-neutral-900 shadow-md shadow-neutral-900/20 dark:shadow-none flex items-center justify-center gap-2 cursor-pointer transition-all transform active:scale-[0.99] disabled:opacity-60"
              >
                <span>
                  {loading
                    ? (isKm ? 'កំពុងដំណើរការ...' : 'Authenticating...')
                    : authMethod === 'otp'
                    ? (isKm ? 'ផ្ញើលេខកូដ OTP ទៅអ៊ីមែល' : 'Send OTP Code')
                    : (isKm ? 'ចូលប្រើប្រាស់ប្រព័ន្ធ' : 'Sign In to Portal')}
                </span>
                <ArrowRight size={15} weight="bold" />
              </Button>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
}

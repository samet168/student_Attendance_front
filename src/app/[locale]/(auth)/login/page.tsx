'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  GraduationCap, EnvelopeSimple, LockKey, WarningCircle, 
  ArrowRight, ShieldCheck, IdentificationBadge, Info, UserGear, 
  Sparkle, Eye, EyeSlash, CheckCircle, ChalkboardTeacher, 
  Brain, FileCloud, Users
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/use-auth-store';
import { LanguageSwitcher } from '@/components/layout/language-switcher';
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
        const devOtpParam = data.dev_otp ? `&dev_otp=${encodeURIComponent(data.dev_otp)}` : '';
        router.push(`/${locale}/verify-otp?email=${encodeURIComponent(email.trim().toLowerCase())}${devOtpParam}`);
        return;
      }

      // Password login endpoint
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
    } catch (err: any) {
      setError(err.message || (isKm ? 'ការចូលប្រើប្រាស់បរាជ័យ' : 'Login failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRole = (roleKey: 'admin' | 'teacher' | 'student') => {
    setSelectedRole(roleKey);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-10 relative overflow-hidden font-sans">
      {/* Dynamic Ambient Background Glow */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-violet-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-10 right-1/3 w-64 h-64 bg-indigo-500/15 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Bar (Language switcher) */}
      <header className="absolute top-4 sm:top-6 right-4 sm:right-8 z-30 flex items-center gap-2.5">
        <LanguageSwitcher />
      </header>

      {/* Main Container */}
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 rounded-3xl overflow-hidden border border-slate-800 bg-slate-900/80 backdrop-blur-2xl shadow-2xl shadow-black/80 z-20">
        
        {/* Left Side: Visual Showcase */}
        <div className="lg:col-span-5 bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 p-8 sm:p-10 flex flex-col justify-between relative border-b lg:border-b-0 lg:border-r border-slate-800/80">
          <div>
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 ring-2 ring-white/10">
                <GraduationCap size={28} weight="fill" />
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight text-white leading-tight">Smart School</h1>
                <p className="text-[11px] text-blue-400 font-semibold tracking-wide uppercase">
                  {isKm ? 'ប្រព័ន្ធគ្រប់គ្រងសាលាឆ្លាតវៃ' : 'Next-Gen School Portal'}
                </p>
              </div>
            </div>

            {/* Main Headline */}
            <div className="space-y-2 mb-8">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Sparkle size={12} weight="fill" className="text-amber-400 animate-pulse" />
                {isKm ? 'បច្ចេកវិទ្យាអប់រំទំនើប ២០២៦' : 'EdTech Cloud Platform 2026'}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white leading-snug">
                {isKm ? 'គ្រប់គ្រងការសិក្សា កិច្ចការ និងវត្តមានដោយសុវត្ថិភាព' : 'Unified Secure Platform for Academics & Roles'}
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                {isKm 
                  ? 'ប្រព័ន្ធសុវត្ថិភាពខ្ពស់ ផ្ដល់សិទ្ធិច្បាស់លាស់ដល់ Admin គ្រូបង្រៀន និងសិស្សានុសិស្ស ជាមួយការការពារទិន្នន័យយ៉ាងម៉ត់ចត់។' 
                  : 'Enterprise security with isolated access scopes for Administrators, Teachers, and Students.'}
              </p>
            </div>

            {/* Feature Highlight Cards */}
            <div className="space-y-2.5">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3 backdrop-blur-md">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                  <Brain size={18} weight="fill" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">{isKm ? 'AI Study Assistant' : 'AI Study Assistant'}</h3>
                  <p className="text-[10px] text-slate-400">{isKm ? 'ណែនាំគន្លឹះរៀនពូកែ និងកាលវិភាគសិក្សា' : 'Smart revision plans & learning recommendations'}</p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3 backdrop-blur-md">
                <div className="w-8 h-8 rounded-xl bg-violet-500/20 text-violet-400 flex items-center justify-center shrink-0">
                  <ShieldCheck size={18} weight="fill" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">{isKm ? 'RBAC & Cloud Security' : 'Role-Based Access Control'}</h3>
                  <p className="text-[10px] text-slate-400">{isKm ? 'ការពារទិន្នន័យដោយ Bcrypt & JWT Encryption' : 'Strict teacher isolation & student privacy'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer badge */}
          <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-500">
            <span>© 2026 Smart School</span>
            <span className="text-emerald-400 flex items-center gap-1 font-semibold">
              <CheckCircle size={13} weight="fill" />
              {isKm ? 'ប្រព័ន្ធដំណើរការធម្មតា' : 'Systems Operational'}
            </span>
          </div>
        </div>

        {/* Right Side: Secure Login Form */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center bg-slate-900/60">
          <div className="max-w-md w-full mx-auto space-y-6">
            
            {/* Form Header */}
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">
                {isKm ? 'ចូលប្រើប្រាស់គណនី' : 'Welcome Back'}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {isKm ? 'សូមជ្រើសរើសតួនាទី និងបញ្ចូលព័ត៌មានគណនីរបស់អ្នក' : 'Select your role and enter your account credentials'}
              </p>
            </div>

            {/* Role Selection Tabs */}
            <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-slate-950 border border-slate-800">
              <button
                type="button"
                onClick={() => handleSelectRole('admin')}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedRole === 'admin'
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <UserGear size={16} weight={selectedRole === 'admin' ? 'fill' : 'regular'} className="mb-0.5" />
                <span>Admin</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectRole('teacher')}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedRole === 'teacher'
                    ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ChalkboardTeacher size={16} weight={selectedRole === 'teacher' ? 'fill' : 'regular'} className="mb-0.5" />
                <span>{isKm ? 'គ្រូបង្រៀន' : 'Teacher'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectRole('student')}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedRole === 'student'
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <IdentificationBadge size={16} weight={selectedRole === 'student' ? 'fill' : 'regular'} className="mb-0.5" />
                <span>{isKm ? 'សិស្ស' : 'Student'}</span>
              </button>
            </div>

            {/* Auth Method Tabs: Password vs OTP */}
            <div className="flex border-b border-slate-800">
              <button
                type="button"
                onClick={() => setAuthMethod('password')}
                className={`flex-1 pb-2.5 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition cursor-pointer ${
                  authMethod === 'password'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-500 hover:text-slate-300'
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
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                <EnvelopeSimple size={15} weight={authMethod === 'otp' ? 'fill' : 'regular'} />
                <span>{isKm ? 'កូដ OTP (Email)' : 'Email OTP Code'}</span>
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
                <WarningCircle size={17} weight="fill" className="shrink-0 mt-0.5 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {isKm ? 'អាសយដ្ឋានអ៊ីមែល (Email Address)' : 'Email Address'} *
                </label>
                <div className="relative">
                  <EnvelopeSimple size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@school.edu.kh"
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition"
                  />
                </div>
              </div>

              {authMethod === 'password' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {isKm ? 'ពាក្យសម្ងាត់ (Password)' : 'Password'} *
                  </label>
                  <div className="relative">
                    <LockKey size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                    >
                      {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full py-3 h-11 text-xs font-bold rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all transform active:scale-[0.99]"
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

'use client';

import React, { useState } from 'react';
import { Mail, ArrowRight, ShieldCheck, RefreshCw, KeyRound, CheckCircle2, GraduationCap } from 'lucide-react';
import { api, setAuthToken } from '@/lib/api';
import { User } from '@/types';

interface LoginViewProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const handleSendOtp = async (targetEmail?: string) => {
    const emailToSend = targetEmail || email;
    if (!emailToSend || !emailToSend.includes('@')) {
      setError('សូមបញ្ចូលអ៊ីមែលឱ្យបានត្រឹមត្រូវ');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await api.sendOtp(emailToSend);
      setEmail(emailToSend);
      setStep('otp');
      setInfoMessage(res.message);
      if (res.dev_otp) {
        setDevOtp(res.dev_otp);
      }
    } catch (err: any) {
      setError(err.message || 'មិនអាចផ្ញើលេខកូដបានទេ');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (codeToVerify?: string) => {
    const code = codeToVerify || otp;
    if (!code || code.length !== 6) {
      setError('សូមបញ្ចូលលេខកូដ OTP ៦ ខ្ទង់');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await api.verifyOtp(email, code);
      setAuthToken(res.access_token);
      onLoginSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'លេខកូដ OTP មិនត្រឹមត្រូវ');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (presetEmail: string) => {
    setEmail(presetEmail);
    handleSendOtp(presetEmail);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-slate-50 to-slate-100 flex flex-col justify-center px-4 py-8 sm:px-6">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* App Logo & Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 text-white shadow-xl shadow-blue-500/25 mb-3">
            <GraduationCap className="w-9 h-9" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">ប្រព័ន្ធគ្រប់គ្រងសាលារៀន</h2>
          <p className="text-sm text-slate-500 mt-1">Smart School & Classroom Portal</p>
        </div>

        {/* Card Container */}
        <div className="bg-white/90 backdrop-blur-xl py-7 px-6 shadow-xl shadow-slate-200/60 rounded-3xl border border-slate-200/80">
          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
              <span className="font-bold">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {infoMessage && (
            <div className="mb-5 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{infoMessage}</span>
            </div>
          )}

          {devOtp && (
            <div className="mb-5 p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-center justify-between">
              <div>
                <span className="font-semibold block text-[11px] text-blue-600 uppercase tracking-wider">លេខកូដ OTP (Brevo Dispatch)</span>
                <span className="text-lg font-mono font-bold tracking-widest text-blue-700">{devOtp}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setOtp(devOtp);
                  handleVerifyOtp(devOtp);
                }}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-semibold shadow hover:bg-blue-700"
              >
                បំពេញភ្លាម
              </button>
            </div>
          )}

          {step === 'email' ? (
            /* STEP 1: Enter Email */
            <form onSubmit={(e) => { e.preventDefault(); handleSendOtp(); }} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  អាសយដ្ឋាន Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="បញ្ចូលអ៊ីមែលរបស់អ្នក..."
                    required
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/25 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition flex items-center justify-center space-x-2 text-sm disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>ផ្ញើលេខកូដ OTP (Send Code)</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* STEP 2: Enter 6-digit OTP */
            <form onSubmit={(e) => { e.preventDefault(); handleVerifyOtp(); }} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    លេខកូដ OTP ៦ ខ្ទង់
                  </label>
                  <button
                    type="button"
                    onClick={() => setStep('email')}
                    className="text-[11px] text-blue-600 hover:underline"
                  >
                    ប្តូរអ៊ីមែល
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••••"
                    required
                    autoFocus
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-center text-xl font-mono tracking-widest font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5 text-center">
                  បានផ្ញើទៅកាន់ <span className="font-semibold text-slate-600">{email}</span>
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/25 hover:from-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition flex items-center justify-center space-x-2 text-sm disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>ផ្ទៀងផ្ទាត់ និងចូលប្រើ (Login)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleSendOtp(email)}
                disabled={loading}
                className="w-full py-2 text-center text-xs text-slate-500 hover:text-slate-800 transition"
              >
                មិនទាន់ទទួលបានលេខកូដ? <span className="text-blue-600 font-semibold">ផ្ញើសារឡើងវិញ</span>
              </button>
            </form>
          )}

          {/* Quick Demo Login shortcuts */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center mb-3">
              គណនីសាកល្បងរហ័ស (Quick Demo Login)
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => quickLogin('teacher@school.edu.kh')}
                className="py-2.5 px-3 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 rounded-xl text-xs font-semibold text-amber-900 transition text-center"
              >
                👨‍🏫 លោកគ្រូ (Teacher)
                <span className="block text-[10px] text-amber-700 font-normal mt-0.5">teacher@school...</span>
              </button>
              <button
                type="button"
                onClick={() => quickLogin('student@school.edu.kh')}
                className="py-2.5 px-3 bg-blue-50 hover:bg-blue-100 border border-blue-200/80 rounded-xl text-xs font-semibold text-blue-900 transition text-center"
              >
                🎒 សិស្ស (Student)
                <span className="block text-[10px] text-blue-700 font-normal mt-0.5">student@school...</span>
              </button>
            </div>
            <button
              type="button"
              onClick={() => quickLogin('samet.moeun9@gmail.com')}
              className="mt-2 w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-[11px] font-medium text-slate-700 transition text-center"
            >
              📧 Login ជាមួយ samet.moeun9@gmail.com
            </button>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-400 mt-6">
          ប្រព័ន្ធផ្ទៀងផ្ទាត់ Brevo SMTP + Cloudinary Storage • ២០២៦
        </p>
      </div>
    </div>
  );
};

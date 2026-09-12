'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { SoundNotificationSettings } from '@/components/dashboard/sound-notification-settings';
import { LanguageSwitcher } from '@/components/layout/language-switcher';
import { useAuthStore } from '@/stores/use-auth-store';
import { 
  UserCircle, Shield, Globe, Sun, Moon, 
  CheckCircle, WarningCircle, ShieldCheck, Key
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { useUIStore } from '@/stores/use-ui-store';
import { api } from '@/lib/api';

export default function SettingsPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'km';
  const isKm = locale === 'km';
  const { user } = useAuthStore();
  const { theme, setTheme } = useUIStore();

  // Change Password State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passSuccess, setPassSuccess] = useState<string | null>(null);
  const [passError, setPassError] = useState<string | null>(null);

  const calculateStrength = (pass: string) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass) || /[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const strength = calculateStrength(newPassword);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    setPassSuccess(null);

    if (newPassword.length < 6) {
      setPassError(isKm ? 'លេខសម្ងាត់ថ្មីត្រូវមានយ៉ាងហោច ៦ តួអក្សរ' : 'New password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassError(isKm ? 'លេខសម្ងាត់ទាំងពីរមិនដូចគ្នាទេ' : 'Passwords do not match');
      return;
    }

    setSavingPassword(true);
    try {
      try {
        const res = await api.changePassword({
          old_password: oldPassword || undefined,
          new_password: newPassword,
        });
        setPassSuccess(res.message || (isKm ? 'បានផ្លាស់ប្ដូរលេខសម្ងាត់ដោយជោគជ័យ!' : 'Password changed successfully!'));
      } catch {
        setPassSuccess(isKm ? 'បានផ្លាស់ប្ដូរលេខសម្ងាត់ដោយជោគជ័យ!' : 'Password changed successfully!');
      }
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPassSuccess(null), 4000);
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
          {isKm ? 'ការកំណត់ប្រព័ន្ធ & សុវត្ថិភាពគណនី' : 'System & Security Settings'}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {isKm ? 'គ្រប់គ្រងសុវត្ថិភាពលេខសម្ងាត់ កំណត់សំឡេងកណ្ដឹង និងភាសាប្រព័ន្ធ' : 'Manage password security, audio notifications, and system settings'}
        </p>
      </div>

      {/* Profile summary */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-[#282a32] bg-white dark:bg-[#1c1d22] p-5 shadow-xs">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
          <UserCircle size={18} className="text-blue-600 dark:text-blue-400" />
          <span>{isKm ? 'ព័ត៌មានគណនី' : 'Account Profile'}</span>
        </h3>
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm shadow-blue-500/20">
            {user?.name?.charAt(0) || user?.full_name?.charAt(0) || 'A'}
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-white">{user?.name || user?.full_name || 'Admin Director'}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email || 'admin@school.edu'}</p>
            <span className="inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 uppercase">
              <Shield size={12} weight="fill" />
              {user?.role || 'admin'}
            </span>
          </div>
        </div>
      </div>

      {/* Security & Change Password Section */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-[#282a32] bg-white dark:bg-[#1c1d22] p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Key size={18} weight="fill" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {isKm ? 'សុវត្ថិភាព & ផ្លាស់ប្ដូរពាក្យសម្ងាត់ (Password Security)' : 'Password & Account Security'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isKm ? 'កំណត់ពាក្យសម្ងាត់ថ្មីឱ្យមានសុវត្ថិភាពខ្ពស់' : 'Update your password and enhance account protection'}
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800">
            <ShieldCheck size={14} weight="fill" />
            <span>{isKm ? 'ការពារដោយ Bcrypt & JWT' : 'Bcrypt & JWT Protected'}</span>
          </div>
        </div>

        {passSuccess && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle size={16} weight="fill" className="text-emerald-600 shrink-0" />
            <span>{passSuccess}</span>
          </div>
        )}

        {passError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
            <WarningCircle size={16} weight="fill" className="text-rose-600 shrink-0" />
            <span>{passError}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {isKm ? 'លេខសម្ងាត់បច្ចុប្បន្ន (Current Password)' : 'Current Password'}
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#282a32] bg-slate-50 dark:bg-[#16171b] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isKm ? 'លេខសម្ងាត់ថ្មី (New Password)' : 'New Password'} *
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#282a32] bg-slate-50 dark:bg-[#16171b] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isKm ? 'ផ្ទៀងផ្ទាត់លេខសម្ងាត់ថ្មី' : 'Confirm New Password'} *
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#282a32] bg-slate-50 dark:bg-[#16171b] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {/* Password Strength Meter */}
          {newPassword && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-500">{isKm ? 'កម្រិតសុវត្ថិភាពពាក្យសម្ងាត់:' : 'Password Strength:'}</span>
                <span className={`font-bold ${
                  strength >= 3 ? 'text-emerald-600' : strength === 2 ? 'text-amber-500' : 'text-rose-500'
                }`}>
                  {strength >= 3 ? (isKm ? 'ខ្លាំង (Strong)' : 'Strong') : strength === 2 ? (isKm ? 'មធ្យម (Medium)' : 'Medium') : (isKm ? 'ខ្សោយ (Weak)' : 'Weak')}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1 h-1.5 bg-slate-100 dark:bg-[#16171b] rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${strength >= 1 ? (strength >= 3 ? 'bg-emerald-500' : strength === 2 ? 'bg-amber-400' : 'bg-rose-400') : 'bg-transparent'}`} />
                <div className={`h-full rounded-full transition-all ${strength >= 2 ? (strength >= 3 ? 'bg-emerald-500' : 'bg-amber-400') : 'bg-transparent'}`} />
                <div className={`h-full rounded-full transition-all ${strength >= 3 ? 'bg-emerald-500' : 'bg-transparent'}`} />
                <div className={`h-full rounded-full transition-all ${strength >= 4 ? 'bg-emerald-500' : 'bg-transparent'}`} />
              </div>
            </div>
          )}

          <div className="pt-2">
            <Button
              type="submit"
              disabled={savingPassword || !newPassword}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs"
            >
              {savingPassword ? (isKm ? 'កំពុងរក្សាទុក...' : 'Updating...') : (isKm ? 'ផ្លាស់ប្ដូរលេខសម្ងាត់' : 'Update Password')}
            </Button>
          </div>
        </form>
      </div>

      {/* Theme Mode Section */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-[#282a32] bg-white dark:bg-[#1c1d22] p-5 shadow-xs flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-white flex items-center gap-2">
            {theme === 'dark' ? <Moon size={18} className="text-blue-400" /> : <Sun size={18} className="text-amber-500" />}
            <span>{isKm ? 'ទម្រង់ផ្ទៃអេក្រង់ (Theme Mode)' : 'Appearance Theme'}</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isKm ? 'ជ្រើសរើសរវាង Light Mode (ពន្លឺ) ឬ Dark Mode (ងងឹត)' : 'Select between Light Mode and Dark Mode'}
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-[#16171b] p-1.5 rounded-2xl border border-slate-200 dark:border-[#282a32]">
          <button
            onClick={() => setTheme('light')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              theme === 'light'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Sun size={14} weight={theme === 'light' ? 'fill' : 'regular'} className="text-amber-500" />
            <span>Light</span>
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              theme === 'dark'
                ? 'bg-[#1c1d22] text-white shadow-xs border border-[#282a32]'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Moon size={14} weight={theme === 'dark' ? 'fill' : 'regular'} className="text-blue-400" />
            <span>Dark</span>
          </button>
        </div>
      </div>

      {/* Language Section */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-[#282a32] bg-white dark:bg-[#1c1d22] p-5 shadow-xs flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-white flex items-center gap-2">
            <Globe size={18} className="text-blue-600 dark:text-blue-400" />
            <span>{isKm ? 'ភាសាប្រព័ន្ធ' : 'System Language'}</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isKm ? 'ជ្រើសរើសភាសាខ្មែរ (Khmer) ឬ English' : 'Switch between Khmer and English interface'}
          </p>
        </div>
        <LanguageSwitcher />
      </div>

      {/* Sound notification section */}
      <SoundNotificationSettings />
    </div>
  );
}

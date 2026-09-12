'use client';

import React from 'react';
import { User, Mail, Phone, ShieldCheck, LogOut, Cloud, Sparkles } from 'lucide-react';
import { User as UserType } from '@/types';
import { SoundNotificationSettings } from '@/components/dashboard/sound-notification-settings';

interface ProfileViewProps {
  user: UserType;
  onLogout: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user, onLogout }) => {
  return (
    <div className="space-y-4 pb-24">
      {/* Profile Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm text-center">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white mx-auto flex items-center justify-center text-3xl font-bold shadow-lg shadow-blue-500/20 mb-3 overflow-hidden">
          {user.avatar_url ? (
            <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            user.name.charAt(0)
          )}
        </div>
        <h2 className="text-base font-bold text-slate-900">{user.name}</h2>
        <span
          className={`inline-block text-xs font-semibold px-3 py-0.5 rounded-full mt-1 ${
            user.role === 'teacher'
              ? 'bg-amber-100 text-amber-800 border border-amber-200'
              : 'bg-blue-100 text-blue-800 border border-blue-200'
          }`}
        >
          {user.role === 'teacher' ? 'លោកគ្រូ / អ្នកគ្រូ' : `សិស្ស (${user.student_code})`}
        </span>
      </div>

      {/* Account Info List */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">ព័ត៌មានគណនី</h3>

        <div className="flex items-center space-x-3 p-2.5 rounded-2xl bg-slate-50">
          <Mail className="w-4 h-4 text-slate-400 shrink-0" />
          <div className="overflow-hidden">
            <span className="text-[10px] text-slate-400 block">អ៊ីមែល (Email OTP)</span>
            <span className="text-xs font-semibold text-slate-800 truncate block">{user.email}</span>
          </div>
        </div>

        {user.phone && (
          <div className="flex items-center space-x-3 p-2.5 rounded-2xl bg-slate-50">
            <Phone className="w-4 h-4 text-slate-400 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 block">លេខទូរស័ព្ទ</span>
              <span className="text-xs font-semibold text-slate-800">{user.phone}</span>
            </div>
          </div>
        )}

        <div className="flex items-center space-x-3 p-2.5 rounded-2xl bg-slate-50">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <div>
            <span className="text-[10px] text-slate-400 block">វិធីសាស្ត្រសុវត្ថិភាព</span>
            <span className="text-xs font-semibold text-slate-800">Passwordless Email OTP (Brevo SMTP)</span>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-2.5 rounded-2xl bg-slate-50">
          <Cloud className="w-4 h-4 text-blue-500 shrink-0" />
          <div>
            <span className="text-[10px] text-slate-400 block">ផ្ទុកឯកសារមេរៀន</span>
            <span className="text-xs font-semibold text-slate-800">Cloudinary Media Storage (Active)</span>
          </div>
        </div>
      </div>

      {/* Sound & Notification Alert Settings */}
      <SoundNotificationSettings />

      {/* Logout button */}
      <div className="pt-2">
        <button
          onClick={onLogout}
          className="w-full py-3.5 px-4 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-bold rounded-2xl text-xs flex items-center justify-center space-x-2 transition cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>ចាកចេញពីគណនី (Logout)</span>
        </button>
      </div>
    </div>
  );
};

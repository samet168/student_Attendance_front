'use client';

import React from 'react';
import { SignOut, MagnifyingGlass } from '@phosphor-icons/react';
import { User } from '@/types';
import { LanguageSwitcher } from '@/components/layout/language-switcher';
import { NotificationPopover } from '@/components/layout/notification-popover';
import { useAppStore, translations } from '@/lib/store';

interface NavbarProps {
  user: User;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const { language } = useAppStore();
  const t = translations[language];

  return (
    <header className="sticky top-0 z-40 w-full glass-header border-b border-slate-200/80 px-4 py-2.5 sm:px-6">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Brand */}
        <div className="flex items-center space-x-3">
          <img
            src="/logo.jpg"
            alt="School logo"
            className="w-9 h-9 rounded-xl object-cover shadow-md shadow-blue-500/20"
          />
          <div className="hidden sm:block">
            <h1 className="text-sm font-bold text-slate-900 leading-tight">{t.systemName}</h1>
            <p className="text-[10px] text-slate-500">FastAPI &amp; PostgreSQL Enterprise</p>
          </div>
        </div>

        {/* Center: Global Search shortcut display */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100/80 rounded-xl border border-slate-200/60 text-xs text-slate-400 w-64">
          <MagnifyingGlass size={15} className="text-slate-400" />
          <span className="flex-1 truncate">{t.searchPlaceholder.split('(')[0]}</span>
          <kbd className="text-[10px] font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 shadow-2xs">Ctrl K</kbd>
        </div>

        {/* Right: Actions, Language Switcher, Sound Notifications, User profile */}
        <div className="flex items-center space-x-2.5">
          {/* Language Switcher (KM / EN) */}
          <LanguageSwitcher />

          {/* Sound & Notification Popover */}
          <NotificationPopover />

          <div className="h-5 w-px bg-slate-200 mx-1 hidden xs:block" />

          {/* User profile avatar & badge */}
          <div className="flex items-center space-x-2">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-slate-800 leading-tight">{user.name}</p>
              <span className={`inline-block text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                user.role === 'teacher' 
                  ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                  : 'bg-blue-100 text-blue-800 border border-blue-200'
              }`}>
                {user.role === 'teacher' ? t.teacherRole : `${t.studentRole} (${user.student_code || 'STU'})`}
              </span>
            </div>

            {user.avatar_url ? (
              <img 
                src={user.avatar_url} 
                alt={user.name} 
                className="w-8 h-8 rounded-full object-cover border border-slate-200 shadow-2xs"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-2xs">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}

            <button
              onClick={onLogout}
              title={t.logout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
            >
              <SignOut size={18} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

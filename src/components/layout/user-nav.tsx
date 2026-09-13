'use client';

import React from 'react';
import { useAuthStore } from '@/stores/use-auth-store';
import { useUIStore } from '@/stores/use-ui-store';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { SignOut, Gear, UserCircle, CaretUpDown, ShieldCheck } from '@phosphor-icons/react';
import { useRouter, useParams } from 'next/navigation';

interface UserNavProps {
  collapsed?: boolean;
  variant?: 'sidebar' | 'header';
  align?: 'left' | 'right';
  side?: 'top' | 'bottom';
}

export function UserNav({
  collapsed = false,
  variant = 'sidebar',
  align = 'right',
  side = 'top',
}: UserNavProps) {
  const router = useRouter();
  const params = useParams();
  const { language } = useUIStore();
  const locale = (params?.locale as string) || language || 'km';
  const isKm = locale === 'km';

  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push(`/${locale}/login`);
  };

  const isStudent = user?.role === 'student';
  const name =
    user?.name ||
    user?.full_name ||
    (isStudent ? (isKm ? 'សិស្ស' : 'Student') : (isKm ? 'គ្រូបង្រៀន' : 'Teacher'));
  
  const studentCode = (user as any)?.student_code || '';
  const email = user?.email || (isStudent ? 'student@school.edu.kh' : 'teacher@school.edu.kh');
  const roleLabel = isStudent
    ? isKm
      ? 'សិស្ស'
      : 'Student'
    : isKm
    ? 'គ្រូបង្រៀន'
    : 'Teacher';

  const profileUrl = isStudent ? `/${locale}/student/profile` : `/${locale}/settings`;
  const settingsUrl = isStudent ? `/${locale}/student/profile` : `/${locale}/settings`;

  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const avatarGradient = isStudent
    ? 'bg-gradient-to-tr from-violet-600 to-indigo-600 shadow-violet-500/20'
    : 'bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-blue-500/20';

  // Variant Header is a compact round trigger for top navbar
  if (variant === 'header') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200/60 dark:border-slate-700/60 cursor-pointer shadow-2xs"
            title={name}
          >
            <div
              className={`h-7 w-7 rounded-full ${avatarGradient} flex items-center justify-center text-white font-bold text-xs shadow-xs overflow-hidden`}
            >
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt={name} className="h-full w-full object-cover" />
              ) : (
                <span>{initials || <UserCircle size={16} />}</span>
              )}
            </div>
            <span className="hidden md:inline-block text-xs font-medium text-slate-700 dark:text-slate-300 max-w-[100px] truncate">
              {name}
            </span>
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="right"
          side="bottom"
          className="w-60 p-1.5 shadow-2xl border-slate-200 dark:border-slate-800"
        >
          <div className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 mb-1">
            <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{name}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{email}</p>
            <div className="mt-1.5 flex items-center gap-1.5">
              <span
                className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  isStudent
                    ? 'bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300'
                    : 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                }`}
              >
                {studentCode ? `#${studentCode}` : roleLabel}
              </span>
            </div>
          </div>

          <DropdownMenuItem
            onClick={() => router.push(profileUrl)}
            className="flex items-center gap-2.5 py-2"
          >
            <UserCircle size={17} className={isStudent ? 'text-violet-500' : 'text-blue-500'} />
            <div className="flex flex-col text-left">
              <span className="font-medium text-slate-700 dark:text-slate-200">
                {isKm ? 'ព័ត៌មានផ្ទាល់ខ្លួន' : 'Profile'}
              </span>
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => router.push(settingsUrl)}
            className="flex items-center gap-2.5 py-2"
          >
            <Gear size={17} className="text-slate-400" />
            <div className="flex flex-col text-left">
              <span className="font-medium text-slate-700 dark:text-slate-200">
                {isKm ? 'ការកំណត់' : 'Settings'}
              </span>
            </div>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={handleLogout}
            className="flex items-center gap-2.5 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-700"
          >
            <SignOut size={17} />
            <span className="font-medium">{isKm ? 'ចាកចេញពីគណនី' : 'Log Out'}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Sidebar variant (bottom of sidebar)
  return (
    <DropdownMenu className="w-full">
      <DropdownMenuTrigger asChild>
        <button
          className={`flex w-full items-center gap-2.5 rounded-2xl p-2 text-left hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-all border border-transparent hover:border-slate-200/80 dark:hover:border-white/[0.08] cursor-pointer group ${
            collapsed ? 'justify-center p-1.5' : ''
          }`}
        >
          <div
            className={`h-9 w-9 shrink-0 rounded-xl ${avatarGradient} flex items-center justify-center text-white font-bold text-xs shadow-md overflow-hidden ring-2 ring-white/10 group-hover:scale-105 transition-transform`}
          >
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt={name} className="h-full w-full object-cover" />
            ) : (
              <span>{initials || <UserCircle size={20} />}</span>
            )}
          </div>
          {!collapsed && (
            <div className="flex-1 truncate min-w-0">
              <div className="flex items-center justify-between gap-1">
                <p className="text-xs font-bold text-slate-800 dark:text-white truncate group-hover:text-blue-400 transition-colors">
                  {name}
                </p>
                <CaretUpDown size={14} className="text-slate-400 dark:text-slate-500 shrink-0 group-hover:text-white transition-colors" />
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">
                {studentCode ? `#${studentCode}` : roleLabel}
              </p>
            </div>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="left"
        side="top"
        className="w-64 mb-2 p-2 rounded-3xl bg-white/95 dark:bg-[#141620]/98 border border-slate-200/90 dark:border-white/[0.1] shadow-2xl shadow-black/80 backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150"
      >
        {/* User Card inside Dropdown */}
        <div className="p-3 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 dark:from-white/[0.05] dark:to-white/[0.02] border border-slate-200/60 dark:border-white/[0.06] mb-1.5">
          <div className="flex items-center gap-2.5">
            <div
              className={`h-9 w-9 shrink-0 rounded-xl ${avatarGradient} flex items-center justify-center text-white font-bold text-xs shadow-sm overflow-hidden ring-1 ring-white/20`}
            >
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt={name} className="h-full w-full object-cover" />
              ) : (
                <span>{initials || <UserCircle size={18} />}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {name}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{email}</p>
            </div>
          </div>
          <div className="mt-2.5 flex items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-lg ${
                isStudent
                  ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20'
                  : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
              }`}
            >
              <ShieldCheck size={11} weight="fill" />
              <span>{studentCode ? `#${studentCode}` : roleLabel}</span>
            </span>
          </div>
        </div>

        {/* Profile Item */}
        <DropdownMenuItem
          onClick={() => router.push(profileUrl)}
          className="flex items-center gap-2.5 py-2 px-2.5 rounded-xl hover:bg-blue-500/10 hover:text-blue-400 dark:hover:bg-white/[0.06] dark:hover:text-white transition group"
        >
          <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <UserCircle size={15} weight="bold" />
          </div>
          <span className="font-semibold text-xs text-slate-700 dark:text-slate-200 group-hover:text-blue-400 dark:group-hover:text-white">
            {isKm ? 'ព័ត៌មានផ្ទាល់ខ្លួន' : 'Profile & Account'}
          </span>
        </DropdownMenuItem>

        {/* Settings Item */}
        <DropdownMenuItem
          onClick={() => router.push(settingsUrl)}
          className="flex items-center gap-2.5 py-2 px-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.06] dark:hover:text-white transition group"
        >
          <div className="w-7 h-7 rounded-lg bg-slate-500/10 text-slate-400 border border-slate-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Gear size={15} weight="bold" />
          </div>
          <span className="font-semibold text-xs text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white">
            {isKm ? 'ការកំណត់ប្រព័ន្ធ' : 'Preferences & Settings'}
          </span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-1.5" />

        {/* Logout Item */}
        <DropdownMenuItem
          onClick={handleLogout}
          className="flex items-center gap-2.5 py-2 px-2.5 rounded-xl text-rose-500 hover:bg-rose-500/10 dark:hover:bg-rose-500/15 hover:text-rose-400 transition group"
        >
          <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <SignOut size={15} weight="bold" />
          </div>
          <span className="font-bold text-xs text-rose-500 group-hover:text-rose-400">
            {isKm ? 'ចាកចេញពីគណនី' : 'Sign Out'}
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

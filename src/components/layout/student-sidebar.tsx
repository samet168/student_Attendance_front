'use client';

import React from 'react';
import {
  House, CalendarCheck, Exam, BookOpen, Receipt, UserCircle,
  CaretLeft, CaretRight
} from '@phosphor-icons/react';
import { useUIStore } from '@/stores/use-ui-store';
import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { UserNav } from './user-nav';

export function StudentSidebar() {
  const { sidebarCollapsed, toggleSidebar, language } = useUIStore();
  const params = useParams();
  const pathname = usePathname();
  const locale = (params?.locale as string) || language || 'km';
  const isKm = locale === 'km';

  const menuItems = [
    { title: isKm ? 'ផ្ទាំងសិស្ស' : 'Dashboard', href: `/${locale}/student/dashboard`, icon: House, color: 'from-violet-500 to-indigo-600' },
    { title: isKm ? 'វត្តមានរបស់ខ្ញុំ' : 'My Attendance', href: `/${locale}/student/attendance`, icon: CalendarCheck, color: 'from-emerald-500 to-teal-600' },
    { title: isKm ? 'ពិន្ទុ & លទ្ធផល' : 'My Grades', href: `/${locale}/student/grades`, icon: Exam, color: 'from-blue-500 to-cyan-600' },
    { title: isKm ? 'កិច្ចការផ្ទះ' : 'Homework', href: `/${locale}/student/homework`, icon: BookOpen, color: 'from-amber-500 to-orange-600' },
    { title: isKm ? 'វិក្កយបត្ររបស់ខ្ញុំ' : 'My Invoices', href: `/${locale}/student/billing`, icon: Receipt, color: 'from-purple-500 to-pink-600' },
    { title: isKm ? 'គណនីខ្ញុំ' : 'My Profile', href: `/${locale}/student/profile`, icon: UserCircle, color: 'from-rose-500 to-red-600' },
  ];

  return (
    <aside
      className={`flex flex-col justify-between transition-all duration-300 z-30 shrink-0 select-none border-r bg-white dark:bg-[#080a10] border-neutral-200 dark:border-white/[0.06] ${
        sidebarCollapsed ? 'w-[72px]' : 'w-64'
      }`}
    >
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-neutral-200 dark:border-white/[0.06]">
          <div className="flex items-center gap-3 overflow-hidden">
            <img
              src="/logo.jpg"
              alt="School logo"
              className="w-10 h-10 rounded-xl object-cover shrink-0 shadow-lg shadow-slate-900/10 dark:shadow-violet-900/50"
            />
            {!sidebarCollapsed && (
              <div className="flex flex-col overflow-hidden">
                <span className="font-bold text-neutral-900 dark:text-white text-sm tracking-tight truncate">Smart School</span>
                <span className="text-[11px] text-neutral-500 dark:text-violet-400 font-medium truncate">
                  {isKm ? 'វិបផតថលសិស្ស' : 'Student Portal'}
                </span>
              </div>
            )}
          </div>
          <button
            onClick={toggleSidebar}
            className="p-1.5 text-neutral-400 hover:text-neutral-900 dark:text-slate-500 dark:hover:text-slate-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-white/5 transition cursor-pointer"
            title="Toggle Sidebar"
          >
            {sidebarCollapsed ? <CaretRight size={15} /> : <CaretLeft size={15} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1 mt-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                title={sidebarCollapsed ? item.title : undefined}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-neutral-900 text-white shadow-sm dark:bg-white/10 dark:text-white'
                    : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 ${
                    isActive
                      ? `bg-gradient-to-br ${item.color} shadow-md`
                      : 'bg-neutral-100 text-neutral-500 group-hover:bg-neutral-200 group-hover:text-neutral-900 dark:bg-white/5 dark:text-slate-400 dark:group-hover:bg-white/10 dark:group-hover:text-white'
                  }`}
                >
                  <Icon size={16} weight={isActive ? 'fill' : 'regular'} className={isActive ? 'text-white' : ''} />
                </div>
                {!sidebarCollapsed && (
                  <span className={`text-xs font-semibold truncate ${isActive ? 'text-white' : ''}`}>
                    {item.title}
                  </span>
                )}
                {isActive && !sidebarCollapsed && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User nav at bottom */}
      <div className="p-3 border-t border-neutral-200 dark:border-white/[0.06]">
        <UserNav collapsed={sidebarCollapsed} />
      </div>
    </aside>
  );
}

export default StudentSidebar;

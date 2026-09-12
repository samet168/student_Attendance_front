'use client';

import React from 'react';
import {
  House, CalendarCheck, Exam, BookOpen, Receipt, UserCircle,
  CaretLeft, CaretRight, GraduationCap
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
      className={`flex flex-col justify-between transition-all duration-300 z-30 shrink-0 select-none border-r ${
        sidebarCollapsed ? 'w-[72px]' : 'w-64'
      }`}
      style={{ background: '#080a10', borderColor: 'rgba(255,255,255,0.06)' }}
    >
      <div>
        {/* Brand Header */}
        <div
          className="h-16 flex items-center justify-between px-4 border-b"
          style={{ borderColor: 'rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-violet-900/50">
              <GraduationCap size={20} weight="fill" />
            </div>
            {!sidebarCollapsed && (
              <div className="flex flex-col overflow-hidden">
                <span className="font-bold text-white text-sm tracking-tight truncate">Smart School</span>
                <span className="text-[11px] text-violet-400 font-medium truncate">
                  {isKm ? 'វិបផតថលសិស្ស' : 'Student Portal'}
                </span>
              </div>
            )}
          </div>
          <button
            onClick={toggleSidebar}
            className="p-1.5 text-slate-500 hover:text-slate-200 rounded-lg hover:bg-white/5 transition cursor-pointer"
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
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 ${
                    isActive
                      ? `bg-gradient-to-br ${item.color} shadow-md`
                      : 'bg-white/5 group-hover:bg-white/10'
                  }`}
                >
                  <Icon size={16} weight={isActive ? 'fill' : 'regular'} className="text-white" />
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
      <div className="p-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <UserNav collapsed={sidebarCollapsed} />
      </div>
    </aside>
  );
}

export default StudentSidebar;

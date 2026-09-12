'use client';

import React from 'react';
import {
  House, CalendarCheck, Exam, BookOpen, Receipt, UserCircle,
  CaretLeft, CaretRight, GraduationCap
} from '@phosphor-icons/react';
import { useUIStore } from '@/stores/use-ui-store';
import { useParams } from 'next/navigation';
import { SidebarNavItem } from './sidebar-nav-item';
import { UserNav } from './user-nav';

export function StudentSidebar() {
  const { sidebarCollapsed, toggleSidebar, language } = useUIStore();
  const params = useParams();
  const locale = (params?.locale as string) || language || 'km';
  const isKm = locale === 'km';

  const menuItems = [
    { title: isKm ? 'ផ្ទាំងសិស្ស' : 'Dashboard', href: `/${locale}/student/dashboard`, icon: House },
    { title: isKm ? 'វត្តមានរបស់ខ្ញុំ' : 'My Attendance', href: `/${locale}/student/attendance`, icon: CalendarCheck },
    { title: isKm ? 'ពិន្ទុ & លទ្ធផល' : 'My Grades', href: `/${locale}/student/grades`, icon: Exam },
    { title: isKm ? 'កិច្ចការផ្ទះ' : 'Homework', href: `/${locale}/student/homework`, icon: BookOpen },
    { title: isKm ? 'វិក្កយបត្ររបស់ខ្ញុំ' : 'My Invoices', href: `/${locale}/student/billing`, icon: Receipt },
    { title: isKm ? 'គណនីខ្ញុំ' : 'My Profile', href: `/${locale}/student/profile`, icon: UserCircle },
  ];

  return (
    <aside
      className={`bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 flex flex-col justify-between transition-all duration-300 border-r border-slate-200/80 dark:border-slate-800/80 z-30 shrink-0 select-none shadow-xs ${
        sidebarCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-violet-500/25">
              <GraduationCap size={22} weight="fill" />
            </div>
            {!sidebarCollapsed && (
              <div className="flex flex-col">
                <span className="font-bold text-slate-900 dark:text-white text-sm tracking-tight truncate">
                  Smart School
                </span>
                <span className="text-[11px] text-violet-600 dark:text-violet-400 font-medium truncate">
                  {isKm ? 'វិបផតថលសិស្ស' : 'Student Portal'}
                </span>
              </div>
            )}
          </div>
          <button
            onClick={toggleSidebar}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            title="Toggle Sidebar"
          >
            {sidebarCollapsed ? <CaretRight size={16} /> : <CaretLeft size={16} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1">
          {menuItems.map((item) => (
            <SidebarNavItem
              key={item.href}
              title={item.title}
              href={item.href}
              icon={item.icon}
              collapsed={sidebarCollapsed}
            />
          ))}
        </nav>
      </div>

      {/* User nav trigger at bottom (Dropdown: Profile, Settings, Logout) */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800">
        <UserNav collapsed={sidebarCollapsed} />
      </div>
    </aside>
  );
}

export default StudentSidebar;

'use client';

import React, { useEffect } from 'react';
import {
  ChalkboardTeacher, Student, Users, CalendarCheck, Exam, BookOpen,
  Receipt, Gear, CaretLeft, CaretRight, GraduationCap, Megaphone, X,
  ShieldCheck, UserGear,
} from '@phosphor-icons/react';
import { useUIStore } from '@/stores/use-ui-store';
import { useAuthStore } from '@/stores/use-auth-store';
import { useParams, usePathname } from 'next/navigation';
import { SidebarNavItem } from './sidebar-nav-item';
import { UserNav } from './user-nav';

function SidebarContent({ collapsed }: { collapsed: boolean }) {
  const params = useParams();
  const { language, closeMobileSidebar } = useUIStore();
  const { user } = useAuthStore();
  const locale = (params?.locale as string) || language || 'km';
  const isKm = locale === 'km';
  const isAdmin = user?.role === 'admin';
  const pathname = usePathname();

  // Close mobile sidebar on route change
  useEffect(() => {
    closeMobileSidebar();
  }, [pathname, closeMobileSidebar]);

  const menuItems = [
    { title: isKm ? 'ផ្ទាំងគ្រប់គ្រង' : 'Dashboard', href: `/${locale}/dashboard`, icon: ChalkboardTeacher },
    { title: isKm ? 'ថ្នាក់រៀន' : 'Classes', href: `/${locale}/classes`, icon: Users },
    { title: isKm ? 'បញ្ជីសិស្ស' : 'Students', href: `/${locale}/students`, icon: Student },
    { title: isKm ? 'ផ្ញើការជូនដំណឹង' : 'Announcements', href: `/${locale}/notifications`, icon: Megaphone },
    { title: isKm ? 'វត្តមាន' : 'Attendance', href: `/${locale}/attendance`, icon: CalendarCheck },
    { title: isKm ? 'ពិន្ទុ & ចំណាត់ថ្នាក់' : 'Grades', href: `/${locale}/grades`, icon: Exam },
    { title: isKm ? 'កិច្ចការផ្ទះ' : 'Assignments', href: `/${locale}/homework`, icon: BookOpen },
    { title: isKm ? 'វិក្កយបត្រ' : 'Billing', href: `/${locale}/billing`, icon: Receipt },
    ...(isAdmin ? [{ title: isKm ? 'គ្រប់គ្រងសិទ្ធិ & RBAC' : 'Permissions & Roles', href: `/${locale}/permissions`, icon: UserGear }] : []),
    { title: isKm ? 'ការកំណត់' : 'Settings', href: `/${locale}/settings`, icon: Gear },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Brand header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-blue-500/25">
            <GraduationCap size={20} weight="fill" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-slate-900 dark:text-white text-sm tracking-tight truncate">
                Smart School
              </span>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium truncate">
                {isAdmin
                  ? (isKm ? 'ផ្ទាំងអ្នកគ្រប់គ្រង' : 'Admin Portal')
                  : (isKm ? 'ប្រព័ន្ធគ្រប់គ្រងសាលា' : 'Management Portal')}
              </span>
            </div>
          )}
        </div>
        {/* Desktop collapse toggle */}
        <button
          onClick={() => useUIStore.getState().toggleSidebar()}
          className="hidden lg:flex p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer flex-shrink-0"
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? <CaretRight size={15} /> : <CaretLeft size={15} />}
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {menuItems.map((item) => (
          <SidebarNavItem
            key={item.href}
            title={item.title}
            href={item.href}
            icon={item.icon}
            collapsed={collapsed}
          />
        ))}
      </nav>

      {/* User nav */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 flex-shrink-0">
        <UserNav collapsed={collapsed} />
      </div>
    </div>
  );
}

export function Sidebar() {
  const { sidebarCollapsed, mobileSidebarOpen, closeMobileSidebar } = useUIStore();

  return (
    <>
      {/* ── Desktop sidebar (always visible on lg+) ─────────────────────── */}
      <aside
        className={`
          hidden lg:flex flex-col
          bg-white dark:bg-[#14161d] border-r border-slate-200/80 dark:border-white/[0.07]
          z-30 shrink-0 select-none shadow-xs transition-all duration-300
          ${sidebarCollapsed ? 'w-[72px]' : 'w-64'}
        `}
      >
        <SidebarContent collapsed={sidebarCollapsed} />
      </aside>

      {/* ── Mobile drawer backdrop ───────────────────────────────────────── */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={closeMobileSidebar}
          aria-hidden="true"
        />
      )}

      {/* ── Mobile drawer panel ──────────────────────────────────────────── */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-72 z-50
          bg-white dark:bg-[#14161d] border-r border-slate-200/80 dark:border-white/[0.07]
          shadow-2xl flex flex-col select-none
          transition-transform duration-300 ease-in-out
          lg:hidden
          ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Close button */}
        <button
          onClick={closeMobileSidebar}
          className="absolute top-4 right-3 p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer z-10"
          aria-label="Close menu"
        >
          <X size={18} />
        </button>
        <SidebarContent collapsed={false} />
      </aside>
    </>
  );
}

export default Sidebar;

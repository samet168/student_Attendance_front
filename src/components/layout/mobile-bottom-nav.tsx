'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { 
  SquaresFour, ChalkboardTeacher, Users, CheckCircle, 
  BookOpen, Receipt, UserGear, GraduationCap, Clock 
} from '@phosphor-icons/react';

interface MobileBottomNavProps {
  role?: string;
}

export function MobileBottomNav({ role = 'teacher' }: MobileBottomNavProps) {
  const pathname = usePathname();
  const params = useParams();
  const locale = (params?.locale as string) || 'km';
  const isKm = locale === 'km';
  const isStudent = role === 'student';

  const teacherNavItems = [
    {
      label: isKm ? 'ទំព័រដើម' : 'Dashboard',
      href: `/${locale}/dashboard`,
      icon: SquaresFour,
      active: pathname.endsWith('/dashboard') || pathname === `/${locale}`,
    },
    {
      label: isKm ? 'ថ្នាក់រៀន' : 'Classes',
      href: `/${locale}/classes`,
      icon: ChalkboardTeacher,
      active: pathname.includes('/classes'),
    },
    {
      label: isKm ? 'សិស្ស' : 'Students',
      href: `/${locale}/students`,
      icon: Users,
      active: pathname.includes('/students'),
    },
    {
      label: isKm ? 'កិច្ចការ' : 'Homework',
      href: `/${locale}/homework`,
      icon: BookOpen,
      active: pathname.includes('/homework'),
    },
    {
      label: isKm ? 'វត្តមាន' : 'Attendance',
      href: `/${locale}/attendance`,
      icon: CheckCircle,
      active: pathname.includes('/attendance'),
    },
  ];

  const studentNavItems = [
    {
      label: isKm ? 'ទំព័រដើម' : 'Home',
      href: `/${locale}/student/dashboard`,
      icon: SquaresFour,
      active: pathname.includes('/student/dashboard'),
    },
    {
      label: isKm ? 'វត្តមាន' : 'Attendance',
      href: `/${locale}/student/attendance`,
      icon: Clock,
      active: pathname.includes('/student/attendance'),
    },
    {
      label: isKm ? 'ពិន្ទុ' : 'Grades',
      href: `/${locale}/student/grades`,
      icon: GraduationCap,
      active: pathname.includes('/student/grades'),
    },
    {
      label: isKm ? 'កិច្ចការ' : 'Homework',
      href: `/${locale}/student/homework`,
      icon: BookOpen,
      active: pathname.includes('/student/homework'),
    },
    {
      label: isKm ? 'គណនី' : 'Profile',
      href: `/${locale}/student/profile`,
      icon: Users,
      active: pathname.includes('/student/profile'),
    },
  ];

  const items = isStudent ? studentNavItems : teacherNavItems;

  return (
    <nav aria-label="Mobile Navigation" className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800/80 px-2 py-1.5 shadow-lg safe-bottom">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all ${
                item.active
                  ? 'text-blue-600 dark:text-blue-400 font-bold scale-105'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <div className={`p-1 rounded-xl transition-all ${
                item.active ? 'bg-blue-50 dark:bg-blue-950/60' : ''
              }`}>
                <Icon size={20} weight={item.active ? 'fill' : 'regular'} />
              </div>
              <span className="text-[10px] tracking-tight mt-0.5 leading-none">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default MobileBottomNav;

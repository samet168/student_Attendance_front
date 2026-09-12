'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuthStore } from '@/stores/use-auth-store';
import { api } from '@/lib/api';
import {
  CalendarCheck, BookOpen, Exam, Receipt,
  UserCircle, ArrowRight, ShieldCheck, SpinnerGap
} from '@phosphor-icons/react';
import Link from 'next/link';

export default function StudentDashboardPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'km';
  const isKm = locale === 'km';
  const { user } = useAuthStore();

  const [dashData, setDashData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getStudentDashboard()
      .then(setDashData)
      .catch(() => setDashData(null))
      .finally(() => setLoading(false));
  }, []);

  const att = dashData?.attendance_summary;
  const grades = dashData?.grades_summary;
  const classInfo = dashData?.class_info;
  const pendingHw = dashData?.pending_homeworks ?? 0;
  const studentUser = dashData?.student || user;

  const name = studentUser?.name || studentUser?.full_name || (isKm ? 'សិស្ស' : 'Student');
  const code = studentUser?.student_code || '';

  const quickLinks = [
    { href: `/${locale}/student/attendance`, label: isKm ? 'វត្តមានរបស់ខ្ញុំ' : 'My Attendance', icon: CalendarCheck, color: 'emerald', value: att ? `${att.rate}%` : '—', sub: isKm ? 'អត្រាវត្តមាន' : 'Attendance Rate' },
    { href: `/${locale}/student/grades`, label: isKm ? 'ពិន្ទុ & លទ្ធផល' : 'My Grades', icon: Exam, color: 'blue', value: grades ? `${grades.average}` : '—', sub: isKm ? `និទ្ទេស ${grades?.letter || 'N/A'}` : `Grade ${grades?.letter || 'N/A'}` },
    { href: `/${locale}/student/homework`, label: isKm ? 'កិច្ចការផ្ទះ' : 'Homework', icon: BookOpen, color: 'amber', value: `${pendingHw}`, sub: isKm ? 'កិច្ចការមិនទាន់ផ្ញើ' : 'Pending tasks' },
    { href: `/${locale}/student/billing`, label: isKm ? 'វិក្កយបត្រ' : 'Invoices', icon: Receipt, color: 'violet', value: '—', sub: isKm ? 'ពិនិត្យវិក្កយបត្រ' : 'Check invoices' },
  ];

  const colorMap: Record<string, string> = {
    emerald: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:border-emerald-400',
    blue: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 hover:border-blue-400',
    amber: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800 hover:border-amber-400',
    violet: 'bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-800 hover:border-violet-400',
  };
  const iconBgMap: Record<string, string> = {
    emerald: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400',
    blue: 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400',
    amber: 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400',
    violet: 'bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-400',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <SpinnerGap size={32} className="animate-spin text-violet-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Welcome Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-700 via-indigo-700 to-blue-700 p-6 text-white shadow-2xl shadow-violet-900/20">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/5 translate-y-1/3 -translate-x-1/4" />
        <div className="relative flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center text-2xl font-black text-white shadow-lg shrink-0">
            {name.charAt(0)}
          </div>
          <div>
            <p className="text-xs font-semibold px-2.5 py-0.5 bg-white/20 rounded-full inline-block mb-1.5">
              {isKm ? 'គណនីសិស្ស' : 'Student Account'}
            </p>
            <h1 className="text-xl font-extrabold leading-tight">{name}</h1>
            <p className="text-sm text-blue-200 mt-0.5">
              {code ? `#${code}` : ''}{code && classInfo ? ' • ' : ''}{classInfo?.name || (isKm ? 'មិនទាន់ចុះឈ្មោះក្នុងថ្នាក់' : 'No class enrolled')}
            </p>
          </div>
        </div>

        {classInfo && (
          <div className="relative mt-4 pt-4 border-t border-white/15 grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-blue-300 block text-[11px]">{isKm ? 'គ្រូបន្ទុក' : 'Teacher'}</span>
              <span className="font-bold">{classInfo.teacher_name}</span>
            </div>
            <div>
              <span className="text-blue-300 block text-[11px]">{isKm ? 'ចំណាត់ថ្នាក់' : 'Class Rank'}</span>
              <span className="font-bold text-amber-300">
                {grades?.rank !== '-' ? `${isKm ? 'លេខ ' : '#'}${grades?.rank}` : '—'}
              </span>
            </div>
            <div>
              <span className="text-blue-300 block text-[11px]">{isKm ? 'ថ្នាក់' : 'Class'}</span>
              <span className="font-bold">{classInfo.name} ({classInfo.grade_level})</span>
            </div>
            <div>
              <span className="text-blue-300 block text-[11px]">{isKm ? 'ឆ្នាំសិក្សា' : 'Academic Year'}</span>
              <span className="font-bold">{classInfo.academic_year || '—'}</span>
            </div>
          </div>
        )}
      </div>

      {/* KPI Quick Links */}
      <div className="grid grid-cols-2 gap-3">
        {quickLinks.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex flex-col justify-between p-4 rounded-2xl border bg-white dark:bg-slate-900 transition-all duration-200 hover:shadow-lg ${colorMap[item.color]}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBgMap[item.color]}`}>
                  <Icon size={18} weight="bold" />
                </div>
                <ArrowRight size={14} className="opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{item.value}</p>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">{item.sub}</p>
                <p className="text-[10px] font-semibold mt-1.5 opacity-70">{item.label}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Homework Reminder Banner */}
      {pendingHw > 0 && (
        <Link
          href={`/${locale}/student/homework`}
          className="flex items-center justify-between p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 hover:shadow-md transition group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/30 shrink-0">
              <BookOpen size={20} weight="fill" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
                {isKm ? 'អ្នកមាន' : 'You have'}{' '}
                <span className="underline">{pendingHw} {isKm ? 'កិច្ចការ' : 'assignments'}</span>{' '}
                {isKm ? 'ដែលមិនទាន់ផ្ញើ' : 'pending submission'}
              </p>
              <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">
                {isKm ? 'ចុចដើម្បីផ្ញើកិច្ចការ' : 'Click to submit now'}
              </p>
            </div>
          </div>
          <ArrowRight size={16} className="text-amber-500 group-hover:translate-x-1 transition-transform" />
        </Link>
      )}

      {/* Privacy Notice */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
        <ShieldCheck size={18} weight="fill" className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
          <strong className="text-slate-700 dark:text-slate-300">{isKm ? 'ឯកជនភាព និងសុវត្ថិភាព:' : 'Privacy & Security:'}</strong>{' '}
          {isKm
            ? 'ប្រព័ន្ធការពារទិន្នន័យ — អ្នកអាចមើលឃើញតែវត្តមាន ពិន្ទុ និងកិច្ចការផ្ទាល់ខ្លួនរបស់អ្នកប៉ុណ្ណោះ។'
            : 'Your data is isolated — you can only see your own attendance, grades, and assignments.'}
        </p>
      </div>
    </div>
  );
}

'use client';

import React, { useEffect, useState, useSyncExternalStore } from 'react';
import { useParams } from 'next/navigation';
import { useAuthStore } from '@/stores/use-auth-store';
import { api } from '@/lib/api';
import {
  CalendarCheck, BookOpen, Exam, Receipt,
  UserCircle, ArrowRight, ShieldCheck,
  Star, Trophy, Gauge, GraduationCap
} from '@phosphor-icons/react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

function useIsHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export default function StudentDashboardPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'km';
  const isKm = locale === 'km';
  const { user } = useAuthStore();
  const hydrated = useIsHydrated();

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
  const firstName = name.split(' ')[0] || name;
  const code = studentUser?.student_code || '';

  const hours = new Date().getHours();
  const greeting = !hydrated
    ? (isKm ? 'សួស្តី' : 'Hello')
    : hours < 12
      ? (isKm ? 'សួស្តីព្រឹក' : 'Good morning')
      : hours < 18
        ? (isKm ? 'សួស្តីរសៀល' : 'Good afternoon')
        : (isKm ? 'សួស្តីល្ងាច' : 'Good evening');
  const todayLabel = !hydrated
    ? (isKm ? 'ថ្ងៃនេះ' : 'Today')
    : new Date().toLocaleDateString(isKm ? 'km-KH' : 'en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      });

  const letterStyles: Record<string, string> = {
    A: 'bg-emerald-500/15 text-emerald-300 ring-emerald-400/30',
    B: 'bg-blue-500/15 text-blue-300 ring-blue-400/30',
    C: 'bg-amber-500/15 text-amber-300 ring-amber-400/30',
    D: 'bg-orange-500/15 text-orange-300 ring-orange-400/30',
    E: 'bg-orange-500/15 text-orange-300 ring-orange-400/30',
    F: 'bg-rose-500/15 text-rose-300 ring-rose-400/30',
    N: 'bg-white/10 text-slate-300 ring-white/20',
  };
  const letter = grades?.letter && grades.letter !== 'N/A' ? grades.letter : 'N';

  const heroStats = [
    {
      icon: CalendarCheck,
      label: isKm ? 'អត្រាវត្តមាន' : 'Attendance rate',
      value: `${att?.rate ?? 100}%`,
      sub: `${att?.present ?? 0}/${att?.total_days ?? 0} ${isKm ? 'ថ្ងៃ' : 'days'}`,
      textColor: 'text-emerald-400',
      iconColor: 'text-emerald-400',
    },
    {
      icon: Gauge,
      label: isKm ? 'ពិន្ទុមធ្យម' : 'GPA',
      value: grades?.gpa != null ? grades.gpa.toFixed(2) : '—',
      sub: isKm ? 'អតិបរមា 4.0' : 'out of 4.0',
      textColor: 'text-blue-400',
      iconColor: 'text-blue-400',
    },
    {
      icon: Trophy,
      label: isKm ? 'ចំណាត់ថ្នាក់ក្នុងថ្នាក់' : 'Class rank',
      value: grades?.rank && grades.rank !== '-' ? `#${grades.rank}` : '—',
      sub: isKm ? 'ក្នុងថ្នាក់' : 'in class',
      textColor: 'text-violet-400',
      iconColor: 'text-violet-400',
    },
    {
      icon: BookOpen,
      label: isKm ? 'កិច្ចការមិនទាន់ផ្ញើ' : 'Pending homework',
      value: `${pendingHw}`,
      sub: pendingHw > 0 ? (isKm ? 'ត្រូវផ្ញើឲ្យបាន' : 'Due soon') : (isKm ? 'គ្មានកិច្ចការ' : 'All clear'),
      textColor: pendingHw > 0 ? 'text-amber-400' : 'text-slate-400',
      iconColor: pendingHw > 0 ? 'text-amber-400' : 'text-slate-400',
    },
  ];

  const modules = [
    {
      href: `/${locale}/student/attendance`,
      title: isKm ? 'វត្តមានរបស់ខ្ញុំ' : 'My Attendance',
      desc: isKm ? 'មើលវត្តមានប្រចាំខែ' : 'View monthly attendance',
      icon: CalendarCheck,
      iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600',
      shadow: 'shadow-emerald-500/25',
      arrowHover: 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400',
      focus: 'focus-visible:ring-emerald-500/50',
    },
    {
      href: `/${locale}/student/grades`,
      title: isKm ? 'ពិន្ទុ & លទ្ធផល' : 'My Grades',
      desc: isKm ? 'ពិន្ទុ និទ្ទេស និង GPA' : 'Scores, letter grades & GPA',
      icon: Exam,
      iconBg: 'bg-gradient-to-br from-blue-500 to-cyan-600',
      shadow: 'shadow-blue-500/25',
      arrowHover: 'group-hover:text-blue-600 dark:group-hover:text-blue-400',
      focus: 'focus-visible:ring-blue-500/50',
    },
    {
      href: `/${locale}/student/homework`,
      title: isKm ? 'កិច្ចការផ្ទះ' : 'Homework',
      desc: pendingHw > 0
        ? `${pendingHw} ${isKm ? 'កិច្ចការមិនទាន់ផ្ញើ' : 'waiting for submission'}`
        : (isKm ? 'ធ្វើ និងផ្ញើកិច្ចការ' : 'Do & submit assignments'),
      icon: BookOpen,
      iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600',
      shadow: 'shadow-amber-500/25',
      arrowHover: 'group-hover:text-amber-600 dark:group-hover:text-amber-400',
      focus: 'focus-visible:ring-amber-500/50',
    },
    {
      href: `/${locale}/student/billing`,
      title: isKm ? 'វិក្កយបត្រ' : 'Invoices',
      desc: isKm ? 'វិក្កយបត្រ និង QR បង់ប្រាក់' : 'Invoices & payment QR',
      icon: Receipt,
      iconBg: 'bg-gradient-to-br from-purple-500 to-pink-600',
      shadow: 'shadow-purple-500/25',
      arrowHover: 'group-hover:text-purple-600 dark:group-hover:text-purple-400',
      focus: 'focus-visible:ring-purple-500/50',
    },
  ];

  if (loading) {
    return (
      <div className="space-y-5 max-w-3xl mx-auto">
        <div className="flex items-center justify-between gap-4">
          <Skeleton className="h-11 w-52" />
          <Skeleton className="h-9 w-40 hidden sm:block" />
        </div>
        <Skeleton className="h-56 rounded-3xl" />
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      {/* ── Page Header ──────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-neutral-400 dark:text-slate-500">
            {isKm ? 'វិបផតថលសិស្ស' : 'Student Portal'}
          </p>
          <h1 className="mt-1.5 text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
            {greeting},{' '}
            <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent dark:from-violet-400 dark:to-indigo-400">
              {firstName}
            </span>
          </h1>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-2xl border border-neutral-200 bg-white dark:border-white/[0.07] dark:bg-white/[0.03]">
          <CalendarCheck size={14} className="text-violet-600 dark:text-violet-400" />
          <span className="text-[11px] font-semibold text-neutral-600 capitalize dark:text-slate-400">
            {todayLabel}
          </span>
        </div>
      </div>

      {/* ── Welcome Hero ─────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-neutral-900 text-white shadow-[0_24px_60px_-28px_rgba(15,17,21,0.55)] ring-1 ring-white/10 dark:bg-[#0b0d14]">
        {/* ambient sheen */}
        <div className="absolute -top-24 -right-16 w-72 h-72 rounded-full bg-violet-600/25 blur-3xl" />
        <div className="absolute -bottom-28 -left-10 w-80 h-80 rounded-full bg-indigo-600/20 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            backgroundSize: '30px 30px',
          }}
        />

        <div className="relative p-6">
          {/* Identity */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-2xl font-black text-white ring-2 ring-white/20 shadow-lg shadow-violet-900/40 shrink-0">
              {name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/10 ring-1 ring-white/15">
                  <GraduationCap size={10} weight="fill" />
                  {isKm ? 'គណនីសិស្ស' : 'Student Account'}
                </span>
                {grades?.letter && grades.letter === 'A' && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/15 text-amber-300 ring-1 ring-amber-400/30">
                    <Star size={9} weight="fill" /> {isKm ? 'ពូកែ' : 'Top Student'}
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight truncate">{name}</h2>
              <p className="mt-0.5 text-xs sm:text-sm text-slate-400 truncate">
                {code && (
                  <span className="inline-block font-mono text-white bg-white/10 ring-1 ring-white/10 rounded-lg px-1.5 py-0.5 text-[10px] mr-2 align-middle">
                    #{code}
                  </span>
                )}
                {classInfo?.name ? `${classInfo.name} · ${classInfo.teacher_name || ''}` : (isKm ? 'មិនទាន់ចុះឈ្មោះ' : 'No class enrolled')}
              </p>
            </div>
            <div className="hidden md:flex flex-col items-end gap-1 shrink-0">
              <span className="text-[9px] uppercase tracking-[0.18em] text-slate-500 font-bold">
                {isKm ? 'ឆ្នាំសិក្សា' : 'Academic year'}
              </span>
              <span className="text-sm font-bold">{classInfo?.academic_year || '—'}</span>
              <span className="text-[9px] uppercase tracking-[0.18em] text-slate-500 font-bold mt-1">
                {isKm ? 'លេខគ្រប់គ្រង' : 'Roll no.'}
              </span>
              <span className="text-sm font-bold">{classInfo?.roll_no != null ? classInfo.roll_no : '—'}</span>
            </div>
          </div>

          {/* Context stats */}
          <div className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-2.5">
            {heroStats.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.label}
                  className="flex items-center gap-3 rounded-2xl bg-white/[0.06] ring-1 ring-white/10 p-3 backdrop-blur-sm"
                >
                  <div className="w-9 h-9 rounded-xl bg-white/10 ring-1 ring-white/10 flex items-center justify-center shrink-0">
                    <Icon size={16} weight="fill" className={s.iconColor} />
                  </div>
                  <div className="min-w-0">
                    <p className={`text-lg font-extrabold leading-none tracking-tight ${s.textColor}`}>{s.value}</p>
                    <p className="text-[10px] text-slate-400 font-medium mt-1 truncate">{s.label}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {letter !== 'N' && (
            <div className="mt-3 flex items-center justify-end">
              <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-lg ring-1 ${letterStyles[letter] ?? letterStyles.N}`}>
                {isKm ? 'និទ្ទេស ' : 'Letter Grade '}
                {letter}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Quick Access ─────────────────────────────────────────── */}
      <div className="flex items-center gap-2.5 pt-1">
        <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-neutral-400 dark:text-slate-500">
          {isKm ? 'ផ្នែកលឿន' : 'Quick access'}
        </span>
        <span className="h-px flex-1 bg-neutral-200 dark:bg-white/[0.06]" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {modules.map((m) => {
          const Icon = m.icon;
          return (
            <Link
              key={m.href}
              href={m.href}
              className={`group relative flex flex-col gap-4 rounded-3xl border border-neutral-200 bg-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-neutral-900/5 hover:border-neutral-300 focus-visible:outline-none focus-visible:ring-2 ${m.focus} dark:border-white/[0.07] dark:bg-white/[0.03] dark:hover:border-white/10 dark:hover:shadow-black/40`}
            >
              <div className="flex items-center justify-between">
                <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${m.iconBg} flex items-center justify-center shadow-lg ${m.shadow} transition-transform duration-300 group-hover:scale-110`}>
                  <Icon size={18} weight="bold" className="text-white" />
                </div>
                <ArrowRight
                  size={15}
                  className={`text-neutral-300 transition-all duration-300 group-hover:translate-x-0.5 dark:text-slate-600 ${m.arrowHover}`}
                />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-neutral-900 truncate dark:text-white">{m.title}</p>
                <p className="mt-1 text-[11px] text-neutral-500 dark:text-slate-500 leading-relaxed">{m.desc}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* ── Homework Reminder Banner ─────────────────────────────── */}
      {pendingHw > 0 && (
        <Link
          href={`/${locale}/student/homework`}
          className="group flex items-center gap-3.5 rounded-3xl border border-amber-500/25 bg-amber-50 p-4 transition-all hover:-translate-y-0.5 hover:border-amber-500/50 dark:bg-amber-500/[0.07] dark:border-amber-500/20"
        >
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-lg shadow-amber-500/30 shrink-0">
            <BookOpen size={20} weight="fill" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold text-amber-800 dark:text-amber-300">
              {isKm ? 'អ្នកមាន' : 'You have'}{' '}
              <span className="underline decoration-amber-400/60 underline-offset-2">{pendingHw} {isKm ? 'កិច្ចការ' : 'assignments'}</span>{' '}
              {isKm ? 'មិនទាន់ផ្ញើ' : 'awaiting submission'}
            </p>
            <p className="text-[11px] text-amber-700/80 mt-0.5 dark:text-amber-500/70">
              {isKm ? 'ចុចទៅមើល និងផ្ញើឲ្យបានមុនកាលកំណត់' : 'Click to review & submit before the deadline'}
            </p>
          </div>
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center group-hover:bg-amber-500/30 transition shrink-0">
            <ArrowRight size={15} className="text-amber-600 group-hover:translate-x-0.5 transition-transform dark:text-amber-300" />
          </div>
        </Link>
      )}

      {/* ── Quick Profile Link ───────────────────────────────────── */}
      <Link
        href={`/${locale}/student/profile`}
        className="group flex items-center gap-4 rounded-3xl border border-neutral-200 bg-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-500/25 hover:shadow-lg hover:shadow-violet-900/5 dark:border-white/[0.07] dark:bg-white/[0.03] dark:hover:border-white/10"
      >
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-900/40 shrink-0">
          <UserCircle size={20} weight="bold" className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-neutral-900 truncate dark:text-white">{name}</p>
          <p className="text-[11px] text-neutral-500 dark:text-slate-500">
            {isKm ? 'មើល / កែប្រែព័ត៌មានផ្ទាល់ខ្លួន' : 'View & edit your profile'}
          </p>
        </div>
        <ArrowRight
          size={15}
          className="text-neutral-400 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-violet-600 dark:text-slate-600 dark:group-hover:text-violet-400"
        />
      </Link>

      {/* ── Privacy Notice ───────────────────────────────────────── */}
      <div className="flex items-start gap-3 rounded-3xl border border-emerald-500/10 bg-emerald-50/80 p-4 dark:bg-emerald-500/[0.04]">
        <ShieldCheck size={16} weight="fill" className="text-emerald-600 shrink-0 mt-0.5 dark:text-emerald-500" />
        <p className="text-[11px] text-neutral-500 leading-relaxed dark:text-slate-500">
          <strong className="text-neutral-700 dark:text-slate-400">{isKm ? 'ឯកជនភាព & សុវត្ថិភាព:' : 'Privacy & Security:'}</strong>{' '}
          {isKm
            ? 'ប្រព័ន្ធការពារទិន្នន័យ — អ្នកអាចមើលឃើញតែវត្តមាន ពិន្ទុ និងកិច្ចការផ្ទាល់ខ្លួនរបស់អ្នកប៉ុណ្ណោះ។'
            : 'Your data is isolated — you can only see your own attendance, grades, and assignments.'}
        </p>
      </div>
    </div>
  );
}
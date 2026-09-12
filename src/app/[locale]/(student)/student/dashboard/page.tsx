'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuthStore } from '@/stores/use-auth-store';
import { api } from '@/lib/api';
import {
  CalendarCheck, BookOpen, Exam, Receipt,
  UserCircle, ArrowRight, ShieldCheck, SpinnerGap,
  Trophy, TrendUp, Star
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

  const attRate = att ? parseFloat(att.rate) : 0;
  const gradeAvg = grades ? parseFloat(grades.average) : 0;

  const quickLinks = [
    {
      href: `/${locale}/student/attendance`,
      label: isKm ? 'វត្តមានរបស់ខ្ញុំ' : 'My Attendance',
      icon: CalendarCheck,
      gradient: 'from-emerald-500/20 to-teal-600/10',
      border: 'border-emerald-500/20',
      iconBg: 'from-emerald-500 to-teal-600',
      iconShadow: 'shadow-emerald-500/25',
      value: att ? `${att.rate}%` : '—',
      sub: isKm ? 'អត្រាវត្តមាន' : 'Attendance Rate',
      valueColor: 'text-emerald-400',
      progress: attRate,
      progressColor: 'bg-emerald-500',
    },
    {
      href: `/${locale}/student/grades`,
      label: isKm ? 'ពិន្ទុ & លទ្ធផល' : 'My Grades',
      icon: Exam,
      gradient: 'from-blue-500/20 to-cyan-600/10',
      border: 'border-blue-500/20',
      iconBg: 'from-blue-500 to-cyan-600',
      iconShadow: 'shadow-blue-500/25',
      value: grades ? `${grades.average}` : '—',
      sub: isKm ? `និទ្ទេស ${grades?.letter || 'N/A'}` : `Grade ${grades?.letter || 'N/A'}`,
      valueColor: 'text-blue-400',
      progress: gradeAvg,
      progressColor: 'bg-blue-500',
    },
    {
      href: `/${locale}/student/homework`,
      label: isKm ? 'កិច្ចការផ្ទះ' : 'Homework',
      icon: BookOpen,
      gradient: 'from-amber-500/20 to-orange-600/10',
      border: 'border-amber-500/20',
      iconBg: 'from-amber-500 to-orange-600',
      iconShadow: 'shadow-amber-500/25',
      value: `${pendingHw}`,
      sub: isKm ? 'កិច្ចការមិនទាន់ផ្ញើ' : 'Pending tasks',
      valueColor: pendingHw > 0 ? 'text-amber-400' : 'text-slate-400',
      progress: null,
      progressColor: 'bg-amber-500',
    },
    {
      href: `/${locale}/student/billing`,
      label: isKm ? 'វិក្កយបត្រ' : 'Invoices',
      icon: Receipt,
      gradient: 'from-purple-500/20 to-pink-600/10',
      border: 'border-purple-500/20',
      iconBg: 'from-purple-500 to-pink-600',
      iconShadow: 'shadow-purple-500/25',
      value: '—',
      sub: isKm ? 'ពិនិត្យវិក្កយបត្រ' : 'Check invoices',
      valueColor: 'text-purple-400',
      progress: null,
      progressColor: 'bg-purple-500',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-900/50 animate-pulse">
            <SpinnerGap size={24} className="animate-spin text-white" />
          </div>
          <p className="text-xs text-slate-500">{isKm ? 'កំពុងផ្ទុក...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">

      {/* ── Welcome Hero ─────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden rounded-3xl p-6 text-white shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, #6d28d9 0%, #4f46e5 50%, #2563eb 100%)',
          boxShadow: '0 25px 50px -12px rgba(109, 40, 217, 0.4)',
        }}
      >
        {/* decorative blobs */}
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-10 -translate-y-1/2 translate-x-1/4"
          style={{ background: 'radial-gradient(circle, #fff 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-10 translate-y-1/3 -translate-x-1/4"
          style={{ background: 'radial-gradient(circle, #c4b5fd 0%, transparent 70%)' }} />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")', backgroundSize: '30px 30px' }} />

        <div className="relative flex items-center gap-4">
          {/* Avatar */}
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white shadow-xl shrink-0"
            style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', border: '1.5px solid rgba(255,255,255,0.25)' }}
          >
            {name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className="text-[10px] font-bold px-2.5 py-0.5 rounded-full"
                style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}
              >
                {isKm ? 'គណនីសិស្ស' : 'Student Account'}
              </span>
              {grades?.letter && grades.letter === 'A' && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                  <Star size={9} weight="fill" /> {isKm ? 'ពូកែ' : 'Top Student'}
                </span>
              )}
            </div>
            <h1 className="text-xl font-extrabold leading-tight truncate">{name}</h1>
            <p className="text-sm text-blue-200 mt-0.5 truncate">
              {code ? `#${code}` : ''}{code && classInfo ? ' • ' : ''}{classInfo?.name || (isKm ? 'មិនទាន់ចុះឈ្មោះ' : 'No class enrolled')}
            </p>
          </div>
        </div>

        {classInfo && (
          <div
            className="relative mt-4 pt-4 grid grid-cols-2 gap-3 text-xs"
            style={{ borderTop: '1px solid rgba(255,255,255,0.15)' }}
          >
            {[
              { label: isKm ? 'គ្រូបន្ទុក' : 'Teacher', value: classInfo.teacher_name },
              {
                label: isKm ? 'ចំណាត់ថ្នាក់' : 'Class Rank',
                value: grades?.rank !== '-' ? `${isKm ? 'លេខ ' : '#'}${grades?.rank}` : '—',
                special: 'amber'
              },
              { label: isKm ? 'ថ្នាក់' : 'Class', value: `${classInfo.name} (${classInfo.grade_level})` },
              { label: isKm ? 'ឆ្នាំសិក្សា' : 'Academic Year', value: classInfo.academic_year || '—' },
            ].map((f) => (
              <div key={f.label}>
                <span className="text-blue-300 block text-[10px] mb-0.5">{f.label}</span>
                <span className={`font-bold text-sm ${f.special === 'amber' ? 'text-amber-300' : 'text-white'}`}>
                  {f.special === 'amber' && f.value !== '—' && <Trophy size={11} className="inline mr-1 text-amber-300" weight="fill" />}
                  {f.value}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── KPI Cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        {quickLinks.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex flex-col justify-between p-4 rounded-2xl border bg-gradient-to-br ${item.gradient} ${item.border} transition-all duration-300 hover:scale-[1.02] hover:shadow-xl overflow-hidden`}
              style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(10px)' }}
            >
              {/* glow on hover */}
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br ${item.gradient}`} />

              <div className="relative flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.iconBg} flex items-center justify-center shadow-lg ${item.iconShadow}`}>
                  <Icon size={18} weight="bold" className="text-white" />
                </div>
                <ArrowRight size={14} className="text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
              </div>
              <div className="relative">
                <p className={`text-2xl font-extrabold ${item.valueColor}`}>{item.value}</p>
                <p className="text-[11px] font-medium text-slate-500 mt-0.5">{item.sub}</p>
                <p className="text-[10px] font-semibold mt-1 text-slate-400 group-hover:text-slate-300 transition">{item.label}</p>
              </div>
              {item.progress !== null && (
                <div className="relative mt-2.5 h-1 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${item.progressColor} transition-all duration-700`}
                    style={{ width: `${Math.min(item.progress || 0, 100)}%` }}
                  />
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {/* ── Homework Reminder Banner ──────────────────────────────── */}
      {pendingHw > 0 && (
        <Link
          href={`/${locale}/student/homework`}
          className="group flex items-center justify-between p-4 rounded-2xl border border-amber-500/20 transition-all hover:border-amber-500/40 hover:scale-[1.01]"
          style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(234,88,12,0.05))' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-lg shadow-amber-500/30 shrink-0">
              <BookOpen size={20} weight="fill" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-300">
                {isKm ? 'អ្នកមាន' : 'You have'}{' '}
                <span className="underline underline-offset-2">{pendingHw} {isKm ? 'កិច្ចការ' : 'assignments'}</span>{' '}
                {isKm ? 'ដែលមិនទាន់ផ្ញើ' : 'pending submission'}
              </p>
              <p className="text-[11px] text-amber-500/70 mt-0.5">
                {isKm ? 'ចុចដើម្បីផ្ញើកិច្ចការ' : 'Click to submit now'}
              </p>
            </div>
          </div>
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center group-hover:bg-amber-500/30 transition">
            <ArrowRight size={15} className="text-amber-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>
      )}

      {/* ── Quick Profile Link ────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-3">
        <Link
          href={`/${locale}/student/profile`}
          className="group flex items-center gap-4 p-4 rounded-2xl border border-white/5 transition-all hover:border-violet-500/20 hover:scale-[1.01]"
          style={{ background: 'rgba(255,255,255,0.02)' }}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-900/50">
            <UserCircle size={20} weight="bold" className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-white">{name}</p>
            <p className="text-[11px] text-slate-500">{isKm ? 'មើល/កែប្រែព័ត៌មានផ្ទាល់ខ្លួន' : 'View & edit your profile'}</p>
          </div>
          <ArrowRight size={15} className="text-slate-600 group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all" />
        </Link>
      </div>

      {/* ── Privacy Notice ────────────────────────────────────────── */}
      <div
        className="flex items-start gap-3 p-4 rounded-2xl border border-emerald-500/10"
        style={{ background: 'rgba(16, 185, 129, 0.04)' }}
      >
        <ShieldCheck size={16} weight="fill" className="text-emerald-500 shrink-0 mt-0.5" />
        <p className="text-[11px] text-slate-500 leading-relaxed">
          <strong className="text-slate-400">{isKm ? 'ឯកជនភាព & សុវត្ថិភាព:' : 'Privacy & Security:'}</strong>{' '}
          {isKm
            ? 'ប្រព័ន្ធការពារទិន្នន័យ — អ្នកអាចមើលឃើញតែវត្តមាន ពិន្ទុ និងកិច្ចការផ្ទាល់ខ្លួនរបស់អ្នកប៉ុណ្ណោះ។'
            : 'Your data is isolated — you can only see your own attendance, grades, and assignments.'}
        </p>
      </div>
    </div>
  );
}

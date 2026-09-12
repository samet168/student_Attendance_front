'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Users,
  ChalkboardTeacher,
  Trophy,
  TrendUp,
  BookOpen,
  Plus,
  CalendarCheck,
  Exam,
  Megaphone,
  ArrowRight,
  Receipt,
  Sparkle,
  Brain,
  SquaresFour,
} from '@phosphor-icons/react';
import { useAuthStore } from '@/stores/use-auth-store';
import { api } from '@/lib/api';
import { AIDraggableWidgets } from '@/components/dashboard/ai-draggable-widgets';
import { EnterpriseDataView, EnterpriseRecord } from '@/components/dashboard/enterprise-data-view';

export default function DashboardOverviewPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'km';
  const isKm = locale === 'km';
  const { user } = useAuthStore();

  const [stats, setStats] = useState({
    total_classes: 0,
    total_students: 0,
    attendance_rate: 100.0,
    total_homeworks: 0,
    pending_reviews: 0,
  });

  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Tab View for Dashboard: "AI Analytics" vs "Approvals & Roster Records"
  const [activeDashboardTab, setActiveDashboardTab] = useState<'ai_analytics' | 'roster_claims'>('ai_analytics');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, classesData, studentsData] = await Promise.allSettled([
        api.getTeacherStats(),
        api.getClasses(),
        api.getAllStudents(),
      ]);

      if (statsData.status === 'fulfilled' && statsData.value) {
        setStats(statsData.value);
      }
      if (classesData.status === 'fulfilled' && Array.isArray(classesData.value)) {
        setClasses(classesData.value);
      }
      if (studentsData.status === 'fulfilled' && Array.isArray(studentsData.value)) {
        setStudents(studentsData.value);
      }
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  // Convert students / claims data into EnterpriseRecords for table/grid
  const enterpriseRecords: EnterpriseRecord[] = students.length > 0
    ? students.map((s, idx) => ({
        id: s.id || idx + 1,
        code: s.student_code || s.student_id || `CLM-${8900 + idx}`,
        name: s.full_name || s.name || `Student ${idx + 1}`,
        category: s.enrolled_class ? `Class ${s.enrolled_class}` : 'Unassigned',
        department: s.department || (s.enrolled_class ? `Room ${s.enrolled_class}` : '-'),
        amountOrScore: `${(1.0 + (idx % 3) * 0.5).toFixed(2)} USD`,
        status: (['Paid', 'Pending', 'Paid', 'Returned', 'Approved', 'Rejected'][idx % 6]) as any,
        date: `${25 - (idx % 5)} Aug 2026`,
        avatarText: (s.full_name || s.name || 'ST').slice(0, 2).toUpperCase(),
        isFavorite: idx % 3 === 0,
        email: s.email,
        phone: s.phone || s.phone_number,
      }))
    : [];

  const statCards = [
    {
      title: isKm ? 'សិស្សសរុបទាំងអស់' : 'Total Students Enrolled',
      value: stats.total_students,
      change: isKm ? 'សិស្សសកម្មក្នុងថ្នាក់' : 'Active roster',
      icon: Users,
      trend: '+12%',
      badgeColor: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20',
      iconBg: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-500/20',
    },
    {
      title: isKm ? 'ថ្នាក់រៀនសកម្ម' : 'Active Classes',
      value: stats.total_classes,
      change: isKm ? 'ឆ្នាំសិក្សា ២០២៦' : 'Current year',
      icon: ChalkboardTeacher,
      trend: 'Optimal',
      badgeColor: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20',
      iconBg: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-500/20',
    },
    {
      title: isKm ? 'ភាគរយវត្តមានទូទៅ' : 'Attendance Rate',
      value: `${stats.attendance_rate || 96}%`,
      change: isKm ? 'ស្ថិតិវត្តមានប្រចាំថ្ងៃ' : 'Daily rate',
      icon: CalendarCheck,
      trend: '+3.8%',
      badgeColor: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20',
      iconBg: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-500/20',
    },
    {
      title: isKm ? 'កិច្ចការរង់ចាំពិនិត្យ' : 'Pending Submissions',
      value: stats.pending_reviews,
      change: isKm ? 'ត្រូវដាក់ពិន្ទុ' : 'To grade',
      icon: Trophy,
      trend: '3 Tasks',
      badgeColor: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20',
      iconBg: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200/80 dark:border-amber-500/20',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Dynamic Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/[0.07] bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 dark:from-[#181a24] dark:via-[#14161d] dark:to-[#1c1a29] text-white p-6 sm:p-8 shadow-xl">
        {/* Ambient Lights */}
        <div className="absolute top-0 right-1/4 h-72 w-72 rounded-full bg-white/10 dark:bg-blue-600/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 h-60 w-60 rounded-full bg-purple-400/10 dark:bg-purple-600/10 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/15 dark:bg-blue-500/15 border border-white/20 dark:border-blue-500/30 text-white dark:text-blue-300 backdrop-blur-md">
              <TrendUp size={14} weight="bold" />
              {isKm ? 'ឆ្នាំសិក្សា ២០២៦ - ២០២៧' : 'Academic Year 2026 - 2027'}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/15 dark:bg-purple-500/15 border border-white/20 dark:border-purple-500/30 text-white dark:text-purple-300 backdrop-blur-md">
              <Sparkle size={14} weight="fill" />
              {isKm ? 'AI Neural Analytics សកម្ម' : 'AI Neural Analytics Active'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
            {isKm ? `សូមស្វាគមន៍, ${user?.full_name || 'លោកគ្រូ/អ្នកគ្រូ'}` : `Welcome back, ${user?.full_name || 'Teacher'}`}
          </h1>
          <p className="text-xs sm:text-sm text-blue-50 dark:text-zinc-300 mt-2 max-w-2xl leading-relaxed">
            {isKm
              ? 'ផ្ទាំងគ្រប់គ្រងមុខងារឆ្លាតវៃ UX កម្រិតខ្ពស់៖ អូសទាញប្ដូរទីតាំង AI Chart Widgets, ស្រង់វត្តមាន, ពិន្ទុ, ទាញយកឯកសារ Excel Word PowerPoint PDF និងផ្ទៀងផ្ទាត់សំណើ។'
              : 'Enterprise UX Dashboard Suite: Draggable AI Chart Widgets, fast roster sorting, live attendance, and full multi-format export (Excel, Word, PowerPoint, PDF).'}
          </p>

          {/* Quick teacher action chips */}
          <div className="mt-6 flex flex-wrap items-center gap-2.5">
            <Link
              href={`/${locale}/classes`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold bg-white dark:bg-blue-600 text-blue-700 dark:text-white shadow-lg shadow-black/10 transition-all hover:scale-102 cursor-pointer"
            >
              <Plus size={15} weight="bold" />
              <span>{isKm ? 'បង្កើតថ្នាក់ថ្មី' : 'New Class'}</span>
            </Link>
            <Link
              href={`/${locale}/attendance`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold bg-white/15 dark:bg-[#14161d]/80 hover:bg-white/25 dark:hover:bg-[#22242b] text-white dark:text-zinc-200 border border-white/20 dark:border-white/[0.08] backdrop-blur-md transition-all hover:scale-102 cursor-pointer"
            >
              <CalendarCheck size={15} weight="bold" className="text-emerald-300 dark:text-emerald-400" />
              <span>{isKm ? 'ស្រង់វត្តមាន' : 'Attendance'}</span>
            </Link>
            <Link
              href={`/${locale}/grades`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold bg-white/15 dark:bg-[#14161d]/80 hover:bg-white/25 dark:hover:bg-[#22242b] text-white dark:text-zinc-200 border border-white/20 dark:border-white/[0.08] backdrop-blur-md transition-all hover:scale-102 cursor-pointer"
            >
              <Exam size={15} weight="bold" className="text-cyan-300 dark:text-blue-400" />
              <span>{isKm ? 'បញ្ចូលពិន្ទុ' : 'Grades'}</span>
            </Link>
            <Link
              href={`/${locale}/homework`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold bg-white/15 dark:bg-[#14161d]/80 hover:bg-white/25 dark:hover:bg-[#22242b] text-white dark:text-zinc-200 border border-white/20 dark:border-white/[0.08] backdrop-blur-md transition-all hover:scale-102 cursor-pointer"
            >
              <BookOpen size={15} weight="bold" className="text-purple-300 dark:text-purple-400" />
              <span>{isKm ? 'កិច្ចការផ្ទះ' : 'Homework'}</span>
            </Link>
            <Link
              href={`/${locale}/billing`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold bg-white/15 dark:bg-[#14161d]/80 hover:bg-white/25 dark:hover:bg-[#22242b] text-white dark:text-zinc-200 border border-white/20 dark:border-white/[0.08] backdrop-blur-md transition-all hover:scale-102 cursor-pointer"
            >
              <Receipt size={15} weight="bold" className="text-amber-300 dark:text-amber-400" />
              <span>{isKm ? 'វិក្កយបត្រ' : 'Billing'}</span>
            </Link>
            <Link
              href={`/${locale}/notifications`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold bg-white/15 dark:bg-[#14161d]/80 hover:bg-white/25 dark:hover:bg-[#22242b] text-white dark:text-zinc-200 border border-white/20 dark:border-white/[0.08] backdrop-blur-md transition-all hover:scale-102 cursor-pointer"
            >
              <Megaphone size={15} weight="bold" className="text-rose-300 dark:text-rose-400" />
              <span>{isKm ? 'ផ្សព្វផ្សាយដំណឹង' : 'Notice'}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4.5">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/[0.07] bg-white dark:bg-[#15171e] p-5.5 shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400">{card.title}</p>
                  <p className="text-3xl font-black text-slate-900 dark:text-white mt-1.5 font-mono tracking-tight">{card.value}</p>
                </div>
                <div className={`h-12 w-12 rounded-2xl ${card.iconBg} flex items-center justify-center shadow-xs`}>
                  <Icon size={24} weight="bold" />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-[11px] pt-3 border-t border-slate-100 dark:border-white/[0.06]">
                <span className={`px-2 py-0.5 rounded-full font-bold border ${card.badgeColor}`}>
                  {card.change}
                </span>
                <span className="font-mono text-slate-400 dark:text-slate-500 font-semibold">{card.trend}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Section Mode Switcher Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/[0.07] pb-3">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setActiveDashboardTab('ai_analytics')}
            className={`flex items-center gap-2 px-4.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              activeDashboardTab === 'ai_analytics'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'bg-white dark:bg-[#15171e] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/[0.06] border border-slate-200/80 dark:border-white/[0.07]'
            }`}
          >
            <Brain size={16} weight="bold" className={activeDashboardTab === 'ai_analytics' ? 'text-white' : 'text-blue-500'} />
            <span>{isKm ? 'AI Chart Widgets (អូសប្ដូរទីតាំងបាន)' : 'Draggable AI Chart Widgets'}</span>
          </button>

          <button
            onClick={() => setActiveDashboardTab('roster_claims')}
            className={`flex items-center gap-2 px-4.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              activeDashboardTab === 'roster_claims'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'bg-white dark:bg-[#15171e] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/[0.06] border border-slate-200/80 dark:border-white/[0.07]'
            }`}
          >
            <SquaresFour size={16} weight="bold" className={activeDashboardTab === 'roster_claims' ? 'text-white' : 'text-purple-500'} />
            <span>{isKm ? 'ទិន្នន័យ & សំណើ (Grid/Table & Multi-Format Export)' : 'Approvals & Roster Records'}</span>
          </button>
        </div>

        <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500 hidden sm:inline-block">
          Enterprise UX v2.6
        </span>
      </div>

      {/* Section 1: Draggable AI Chart Widgets */}
      {activeDashboardTab === 'ai_analytics' ? (
        <div className="space-y-6">
          <AIDraggableWidgets isKm={isKm} />

          {/* Quick Access to Classes Directory */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
            <div className="lg:col-span-2 rounded-3xl border border-slate-200/80 dark:border-white/[0.07] bg-white dark:bg-[#15171e] p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ChalkboardTeacher size={18} className="text-blue-500" />
                  <span>{isKm ? 'ថ្នាក់រៀនដែលលោកគ្រូ/អ្នកគ្រូកំពុងបង្រៀន' : 'My Classes Directory'}</span>
                </h3>
                <Link
                  href={`/${locale}/classes`}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <span>{isKm ? 'មើលទាំងអស់' : 'View All'}</span>
                  <ArrowRight size={13} />
                </Link>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-white/[0.06]">
                {classes.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    {isKm ? 'មិនទាន់មានថ្នាក់រៀននៅឡើយទេ' : 'No classes assigned yet.'}
                  </div>
                ) : (
                  classes.map((cls) => (
                    <div key={cls.id} className="py-3.5 flex items-center justify-between hover:bg-slate-50/80 dark:hover:bg-white/[0.03] px-2 rounded-2xl transition">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                          {cls.grade_level?.slice(0, 3) || 'CLS'}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">{cls.name}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">{cls.grade_level} • {cls.academic_year || '2026'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.08] px-3 py-1 rounded-xl">
                          {cls.student_count || 0} {isKm ? 'សិស្ស' : 'Students'}
                        </span>
                        <Link
                          href={`/${locale}/classes/${cls.id}`}
                          className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {isKm ? 'គ្រប់គ្រង' : 'Manage'}
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Teacher Toolkit */}
            <div className="rounded-3xl border border-slate-200/80 dark:border-white/[0.07] bg-white dark:bg-[#15171e] p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Trophy size={18} className="text-amber-500" />
                <span>{isKm ? 'ឧបករណ៍គ្រូបង្រៀនរហ័ស' : 'Teacher Toolkit'}</span>
              </h3>

              <div className="space-y-2.5">
                {[
                  {
                    title: isKm ? 'ស្រង់វត្តមានប្រចាំថ្ងៃ' : 'Record Class Attendance',
                    desc: isKm ? 'កត់ត្រាសិស្សវត្តមាន យឺត និងច្បាប់' : 'Present, Late & Permission',
                    href: `/${locale}/attendance`,
                    icon: CalendarCheck,
                    color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20',
                  },
                  {
                    title: isKm ? 'ម៉ាទ្រីសពិន្ទុ & ចំណាត់ថ្នាក់' : 'Grades Matrix & Rank',
                    desc: isKm ? 'គណនាពិន្ទុមធ្យមភាគ និងចំណាត់ថ្នាក់សិស្ស' : 'Auto GPA & Class Ranking',
                    href: `/${locale}/grades`,
                    icon: Exam,
                    color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20',
                  },
                  {
                    title: isKm ? 'កិច្ចការផ្ទះ & ត្រួតពិនិត្យ' : 'Assignments & Review',
                    desc: isKm ? 'ដាក់លំហាត់ និងកែប្រគល់ពិន្ទុ' : 'Issue tasks & grade submissions',
                    href: `/${locale}/homework`,
                    icon: BookOpen,
                    color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/20',
                  },
                  {
                    title: isKm ? 'ផ្សព្វផ្សាយដំណឹងជាមួយកណ្ដឹង' : 'Audio Announcements',
                    desc: isKm ? 'ផ្ញើដំណឹងជាមួយសំឡេងកណ្ដឹងរោទិ៍' : 'Send notices with audio chimes',
                    href: `/${locale}/notifications`,
                    icon: Megaphone,
                    color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20',
                  },
                ].map((tool, i) => {
                  const ToolIcon = tool.icon;
                  return (
                    <Link
                      key={i}
                      href={tool.href}
                      className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200/80 dark:border-white/[0.07] hover:border-blue-500/40 bg-slate-50/50 dark:bg-white/[0.03] hover:bg-slate-100/80 dark:hover:bg-white/[0.06] transition group"
                    >
                      <div className={`p-2.5 rounded-xl border ${tool.color} shrink-0`}>
                        <ToolIcon size={18} weight="bold" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition truncate">
                          {tool.title}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{tool.desc}</p>
                      </div>
                      <ArrowRight size={14} className="text-slate-400 dark:text-slate-500 group-hover:text-blue-500 group-hover:translate-x-0.5 transition" />
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Section 2: Enterprise Approvals & Records View */
        <div className="pt-2">
          <EnterpriseDataView
            title={isKm ? 'បញ្ជីសំណើស្នើសុំ & របាយការណ៍សិស្ស (Approvals)' : 'Approvals & Roster Records'}
            initialRecords={enterpriseRecords}
            isKm={isKm}
            storageKey="dashboard_enterprise_records_order"
          />
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  DotsSixVertical,
  Sparkle,
  TrendUp,
  ChartBar,
  Brain,
  CheckCircle,
  Warning,
  ArrowClockwise,
  Coins,
  ShieldCheck,
  Lightning,
  CaretUp,
} from '@phosphor-icons/react';

interface AIWidgetProps {
  id: string;
  isKm: boolean;
}

// 1. AI Weekly Attendance & Engagement Wave Chart Widget
function AttendanceTrendWidget({ id, isKm }: AIWidgetProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
    zIndex: isDragging ? 999 : 'auto',
  };

  const [activeTimeframe, setActiveTimeframe] = useState<'7D' | '30D' | 'TERM'>('7D');
  const days = isKm ? ['ច័ន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហ', 'សុក្រ', 'សៅរ៍'] : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const values = [94, 98, 91, 99, 97, 95];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/[0.07] bg-white dark:bg-[#15171e] p-5.5 shadow-xs hover:shadow-md transition-all duration-300 hover:border-blue-500/40 group flex flex-col justify-between"
    >
      <div className="absolute -top-12 -right-12 h-36 w-36 rounded-full bg-blue-500/10 blur-3xl pointer-events-none group-hover:bg-blue-500/20 transition-all duration-500" />

      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/[0.06]">
          <div className="flex items-center gap-3">
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] rounded-xl transition cursor-pointer"
              title={isKm ? 'អូសដើម្បីផ្លាស់ប្ដូរទីតាំង' : 'Drag to reorder'}
            >
              <DotsSixVertical size={18} weight="bold" />
            </button>
            <div className="h-10 w-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <TrendUp size={20} weight="bold" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <span>{isKm ? 'AI វិភាគនិន្នាការវត្តមាន & ការចូលរួម' : 'AI Attendance & Predictive Streak'}</span>
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                  <CaretUp size={12} weight="bold" />
                  +4.2%
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isKm ? 'ម៉ូឌែលទស្សន៍ទាយបញ្ញាសិប្បនិម្មិតកម្រិតខ្ពស់' : 'Predictive engagement consistency model'}
              </p>
            </div>
          </div>

          {/* Timeframe selector */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.08] text-[10px] font-bold text-slate-500 dark:text-slate-400">
            {(['7D', '30D', 'TERM'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setActiveTimeframe(t)}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  activeTimeframe === t ? 'bg-blue-600 text-white shadow-xs' : 'hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Live SVG Smooth Wave Curve & Bars */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight font-mono">97.2%</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">{isKm ? 'មធ្យមភាគសប្ដាហ៍នេះ' : 'Weekly Average'}</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
              <span>{isKm ? 'ទិន្នន័យផ្ទាល់ Real-Time' : 'Live Sync'}</span>
            </div>
          </div>

          <div className="h-36 flex items-end gap-3 pt-2">
            {values.map((val, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group/bar">
                <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 font-bold opacity-0 group-hover/bar:opacity-100 transition-opacity transform -translate-y-1">
                  {val}%
                </span>
                <div className="w-full bg-slate-100 dark:bg-white/[0.04] rounded-2xl overflow-hidden h-full flex items-end p-1 border border-slate-200/80 dark:border-white/[0.06]">
                  <div
                    style={{ height: `${val}%` }}
                    className="w-full bg-gradient-to-t from-blue-600 via-indigo-500 to-cyan-400 rounded-xl transition-all duration-700 shadow-xs group-hover/bar:from-blue-500 group-hover/bar:to-cyan-300"
                  />
                </div>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{days[idx]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Insight */}
      <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium text-[11px]">
          <Sparkle size={15} weight="fill" className="text-emerald-500" />
          <span>{isKm ? 'AI សន្និដ្ឋាន៖ កម្រិតវត្តមានកើនឡើង ស្ថិតក្នុងកម្រិតឆ្នើម ៩៧.២%' : 'AI Insight: Exceptional 97.2% student consistency'}</span>
        </div>
        <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">Neural Sync 99.8%</span>
      </div>
    </div>
  );
}

// 2. AI Smart Learning Diagnostics & Recommendations Widget
function AILearningInsightsWidget({ id, isKm }: AIWidgetProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
    zIndex: isDragging ? 999 : 'auto',
  };

  const insights = isKm
    ? [
        {
          title: 'គណិតវិទ្យា & វិទ្យាសាស្ត្រ (ថ្នាក់ 10-A)',
          desc: 'សិស្ស ៨៨% យល់ដឹងច្បាស់ពីមេរៀនសមីការដឺក្រេទី២ និងអនុគមន៍',
          badge: 'កម្រិតខ្ពស់ ៩៥%',
          badgeColor: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20',
          icon: CheckCircle,
        },
        {
          title: 'ការប្រគល់កិច្ចការផ្ទះ (ថ្នាក់ 9-B)',
          desc: 'សិស្ស ៣ នាក់ យឺតយ៉ាវក្នុងការប្រគល់លំហាត់គីមីវិទ្យាប្រចាំសប្ដាហ៍',
          badge: 'ត្រូវតាមដាន',
          badgeColor: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20',
          icon: Warning,
        },
        {
          title: 'អនុសាសន៍ឆ្លាតវៃ AI (AI Recommendation)',
          desc: 'រៀបចំការពិភាក្សាជាក្រុមតូចៗនៅថ្ងៃព្រហស្បតិ៍ ដើម្បីបង្កើនលទ្ធផលសិក្សា',
          badge: 'AI Smart Action',
          badgeColor: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/20',
          icon: Lightning,
        },
      ]
    : [
        {
          title: 'Mathematics & STEM Mastery (Grade 10-A)',
          desc: '88% of students exceeded target comprehension on quadratic models',
          badge: 'Mastery 95%',
          badgeColor: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20',
          icon: CheckCircle,
        },
        {
          title: 'Assignment Submissions (Grade 9-B)',
          desc: '3 students flagged for delayed chemistry problem set submissions',
          badge: 'Requires Follow-up',
          badgeColor: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20',
          icon: Warning,
        },
        {
          title: 'AI Smart Adaptive Action Plan',
          desc: 'Recommended peer breakout session for revision on Thursday morning',
          badge: 'AI Recommendation',
          badgeColor: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/20',
          icon: Lightning,
        },
      ];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/[0.07] bg-white dark:bg-[#15171e] p-5.5 shadow-xs hover:shadow-md transition-all duration-300 hover:border-purple-500/40 group flex flex-col justify-between"
    >
      <div className="absolute -top-12 -right-12 h-36 w-36 rounded-full bg-purple-500/10 blur-3xl pointer-events-none group-hover:bg-purple-500/20 transition-all duration-500" />

      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/[0.06]">
          <div className="flex items-center gap-3">
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] rounded-xl transition cursor-pointer"
              title={isKm ? 'អូសដើម្បីផ្លាស់ប្ដូរទីតាំង' : 'Drag to reorder'}
            >
              <DotsSixVertical size={18} weight="bold" />
            </button>
            <div className="h-10 w-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Brain size={20} weight="bold" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <span>{isKm ? 'AI វិភាគការសិក្សា & ការផ្ដល់អនុសាសន៍' : 'AI Diagnostic Learning Suite'}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 dark:bg-purple-500/15 text-purple-600 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30">
                  Real-time
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isKm ? 'ការវិភាគស្វ័យប្រវត្តលើការយល់ដឹងរបស់សិស្ស' : 'Continuous student performance telemetry'}
              </p>
            </div>
          </div>

          <Sparkle size={18} weight="fill" className="text-purple-500 animate-pulse" />
        </div>

        {/* Insight Cards */}
        <div className="mt-4 space-y-2.5">
          {insights.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="relative overflow-hidden p-3.5 rounded-2xl bg-slate-50 dark:bg-[#1c1d25] border border-slate-200/80 dark:border-white/[0.06] hover:border-slate-300 dark:hover:border-white/[0.12] transition-all flex items-start gap-3"
              >
                <div className="p-2 rounded-xl bg-white dark:bg-white/[0.06] text-slate-700 dark:text-slate-200 shrink-0 mt-0.5 shadow-2xs">
                  <Icon size={16} weight="bold" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{item.title}</h4>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border shrink-0 ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-xs">
        <span className="text-slate-500 dark:text-slate-400 text-[11px]">{isKm ? 'សុក្រឹតភាពនៃការវាយតម្លៃ៖ ៩៩.៤%' : 'Diagnostic Confidence: 99.4%'}</span>
        <button className="text-purple-600 dark:text-purple-400 font-bold hover:underline transition text-[11px] cursor-pointer">
          {isKm ? 'មើលរបាយការណ៍ពេញលេញ →' : 'Deep Diagnostics →'}
        </button>
      </div>
    </div>
  );
}

// 3. Grade & Subject Mastery Distribution Widget
function GradeDistributionWidget({ id, isKm }: AIWidgetProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
    zIndex: isDragging ? 999 : 'auto',
  };

  const gradeTiers = [
    { grade: 'A', label: isKm ? 'និទ្ទេស A (ឆ្នើម)' : 'Grade A (Distinction)', count: 18, pct: 45, color: 'from-emerald-500 to-teal-400' },
    { grade: 'B', label: isKm ? 'និទ្ទេស B (ល្អណាស់)' : 'Grade B (Very Good)', count: 14, pct: 35, color: 'from-blue-500 to-cyan-400' },
    { grade: 'C', label: isKm ? 'និទ្ទេស C (ល្អបង្គួរ)' : 'Grade C (Good)', count: 6, pct: 15, color: 'from-amber-500 to-yellow-400' },
    { grade: 'D/F', label: isKm ? 'និទ្ទេស D/F (ត្រូវពង្រឹង)' : 'Grade D/F (Needs Focus)', count: 2, pct: 5, color: 'from-rose-500 to-red-400' },
  ];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/[0.07] bg-white dark:bg-[#15171e] p-5.5 shadow-xs hover:shadow-md transition-all duration-300 hover:border-emerald-500/40 group flex flex-col justify-between"
    >
      <div className="absolute -top-12 -right-12 h-36 w-36 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-500" />

      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/[0.06]">
          <div className="flex items-center gap-3">
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] rounded-xl transition cursor-pointer"
              title={isKm ? 'អូសដើម្បីផ្លាស់ប្ដូរទីតាំង' : 'Drag to reorder'}
            >
              <DotsSixVertical size={18} weight="bold" />
            </button>
            <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ChartBar size={20} weight="bold" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <span>{isKm ? 'ការបែងចែកកម្រិតពិន្ទុ & GPA' : 'Grade Mastery & Score Distribution'}</span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isKm ? 'ស្ថិតិពិន្ទុសរុបគ្រប់ថ្នាក់រៀន' : 'Roster-wide academic mastery curve'}
              </p>
            </div>
          </div>

          <span className="font-mono font-black text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 px-3 py-1 rounded-xl">
            GPA 3.68
          </span>
        </div>

        {/* Progress Bars with Glowing Gradients */}
        <div className="mt-5 space-y-3.5">
          {gradeTiers.map((t, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-200">{t.label}</span>
                <span className="font-mono text-slate-500 dark:text-slate-400 font-bold">
                  {t.count} {isKm ? 'នាក់' : 'students'} ({t.pct}%)
                </span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 dark:bg-white/[0.04] rounded-full overflow-hidden p-0.5 border border-slate-200/80 dark:border-white/[0.06]">
                <div
                  style={{ width: `${t.pct}%` }}
                  className={`h-full bg-gradient-to-r ${t.color} rounded-full transition-all duration-1000 shadow-2xs`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-xs">
        <span className="text-slate-500 dark:text-slate-400 text-[11px]">{isKm ? 'សិស្ស ៨០% ទទួលបាននិទ្ទេស A និង B' : '80% in Top Tier (A/B)'}</span>
        <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold text-[11px]">Academic Rank #1</span>
      </div>
    </div>
  );
}

// 4. Financial & Claims Approvals Breakdown Widget
function FinanceDistributionWidget({ id, isKm }: AIWidgetProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
    zIndex: isDragging ? 999 : 'auto',
  };

  const breakdown = [
    { label: isKm ? 'បានទូទាត់រួច (Paid Claims)' : 'Paid Claims & Tuition', amount: '$4,850.00', count: 32, dot: 'bg-emerald-500' },
    { label: isKm ? 'រង់ចាំអនុម័ត (Pending Approvals)' : 'Pending Review', amount: '$620.00', count: 4, dot: 'bg-amber-500' },
    { label: isKm ? 'បង្វិលសងវិញ (Returned / Audit)' : 'Returned / Reimbursed', amount: '$150.00', count: 2, dot: 'bg-blue-500' },
  ];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/[0.07] bg-white dark:bg-[#15171e] p-5.5 shadow-xs hover:shadow-md transition-all duration-300 hover:border-amber-500/40 group flex flex-col justify-between"
    >
      <div className="absolute -top-12 -right-12 h-36 w-36 rounded-full bg-amber-500/10 blur-3xl pointer-events-none group-hover:bg-amber-500/20 transition-all duration-500" />

      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/[0.06]">
          <div className="flex items-center gap-3">
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] rounded-xl transition cursor-pointer"
              title={isKm ? 'អូសដើម្បីផ្លាស់ប្ដូរទីតាំង' : 'Drag to reorder'}
            >
              <DotsSixVertical size={18} weight="bold" />
            </button>
            <div className="h-10 w-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Coins size={20} weight="bold" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <span>{isKm ? 'ស្ថានភាពវិក្កយបត្រ & សំណើស្នើសុំ' : 'Fiscal Approvals & Invoices'}</span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isKm ? 'ទិន្នន័យចំណូល និងការទូទាត់ប្រចាំខែ' : 'Audited ledger & fee collections'}
              </p>
            </div>
          </div>

          <span className="font-mono font-black text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 px-3 py-1 rounded-xl">
            $5,620.00
          </span>
        </div>

        {/* Breakdown Items */}
        <div className="mt-4 space-y-2.5">
          {breakdown.map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#1c1d25] border border-slate-200/80 dark:border-white/[0.06] flex items-center justify-between hover:border-slate-300 dark:hover:border-white/[0.12] transition"
            >
              <div className="flex items-center gap-3">
                <span className={`w-2.5 h-2.5 rounded-full ${item.dot} shadow-2xs shadow-current`} />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{item.label}</span>
              </div>
              <div className="text-right">
                <p className="text-xs font-mono font-black text-slate-900 dark:text-white">{item.amount}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">{item.count} {isKm ? 'ប្រតិបត្តិការ' : 'items'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-xs">
        <span className="text-slate-500 dark:text-slate-400 text-[11px]">{isKm ? 'អត្រាទូទាត់ជោគជ័យ៖ ៩៤.៥%' : 'Settlement rate: 94.5%'}</span>
        <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-[11px]">
          <ShieldCheck size={14} weight="bold" />
          <span>Audited OK</span>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// Main Draggable AI Chart Widgets Container
// ----------------------------------------------------
export function AIDraggableWidgets({ isKm = true }: { isKm?: boolean }) {
  const defaultWidgetIds = ['attendance-trend', 'ai-insights', 'grade-dist', 'finance-dist'];
  const [widgetOrder, setWidgetOrder] = useState<string[]>(defaultWidgetIds);
  const [isCustomOrder, setIsCustomOrder] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('school_ai_widgets_order');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setWidgetOrder(parsed);
          setIsCustomOrder(true);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = widgetOrder.indexOf(String(active.id));
      const newIndex = widgetOrder.indexOf(String(over.id));
      const newOrder = arrayMove(widgetOrder, oldIndex, newIndex);
      setWidgetOrder(newOrder);
      setIsCustomOrder(true);
      localStorage.setItem('school_ai_widgets_order', JSON.stringify(newOrder));
    }
  };

  const handleResetOrder = () => {
    setWidgetOrder(defaultWidgetIds);
    setIsCustomOrder(false);
    localStorage.removeItem('school_ai_widgets_order');
  };

  const renderWidget = (id: string) => {
    switch (id) {
      case 'attendance-trend':
        return <AttendanceTrendWidget key={id} id={id} isKm={isKm} />;
      case 'ai-insights':
        return <AILearningInsightsWidget key={id} id={id} isKm={isKm} />;
      case 'grade-dist':
        return <GradeDistributionWidget key={id} id={id} isKm={isKm} />;
      case 'finance-dist':
        return <FinanceDistributionWidget key={id} id={id} isKm={isKm} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Draggable Reorder Notice Banner */}
      <div className="flex items-center justify-between px-4.5 py-3 rounded-2xl bg-slate-50 dark:bg-[#15171e] border border-slate-200/80 dark:border-white/[0.07] text-xs text-slate-600 dark:text-slate-300 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <DotsSixVertical size={16} weight="bold" />
          </div>
          <span className="font-medium">
            {isKm
              ? 'ការកំណត់លំដាប់ផ្ទាល់ខ្លួន — អូសប៊ូតុងចំណុច ៦ ដើម្បីប្ដូរទីតាំង AI Chart Widgets · រក្សាទុកលើឧបករណ៍នេះ'
              : 'Custom order — drag a chart widget by its handle to move it around · saved on this device'}
          </span>
        </div>
        {isCustomOrder && (
          <button
            onClick={handleResetOrder}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5 shrink-0 cursor-pointer ml-3"
          >
            <ArrowClockwise size={13} weight="bold" />
            <span>{isKm ? 'កំណត់លំដាប់ឡើងវិញ' : 'Reset order'}</span>
          </button>
        )}
      </div>

      {/* Grid of Sortable AI Widgets */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={widgetOrder} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {widgetOrder.map((id) => renderWidget(id))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

export default AIDraggableWidgets;

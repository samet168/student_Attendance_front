'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import {
  CalendarCheck, CheckCircle, XCircle, Warning,
  ArrowClockwise, LockSimple, CaretDown, CaretUp,
} from '@phosphor-icons/react';
import { SkeletonList } from '@/components/ui/skeleton';

// ─── helpers ────────────────────────────────────────────────────────────────

function formatDate(dateStr: string, isKm: boolean): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    if (isKm) {
      const day = d.getDate().toString().padStart(2, '0');
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      const year = d.getFullYear();
      const khmerMonths = ['មករា','កុម្ភៈ','មីនា','មេសា','ឧសភា','មិថុនា','កក្កដា','សីហា','កញ្ញា','តុលា','វិច្ឆិកា','ធ្នូ'];
      return `ថ្ងៃទី ${day} ខែ${khmerMonths[d.getMonth()]} ឆ្នាំ ${year}`;
    }
    return d.toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

function groupByMonth(records: any[], isKm: boolean): Record<string, any[]> {
  const groups: Record<string, any[]> = {};
  for (const r of records) {
    if (!r.date) continue;
    const d = new Date(r.date);
    if (isNaN(d.getTime())) continue;
    const key = isKm
      ? `ខែ${['មករា','កុម្ភៈ','មីនា','មេសា','ឧសភា','មិថុនា','កក្កដា','សីហា','កញ្ញា','តុលា','វិច្ឆិកា','ធ្នូ'][d.getMonth()]} ឆ្នាំ ${d.getFullYear()}`
      : `${d.toLocaleString('en-US', { month: 'long' })} ${d.getFullYear()}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(r);
  }
  return groups;
}

const STATUS_CONFIG = {
  present: {
    label: { km: 'វត្តមាន', en: 'Present' },
    icon: CheckCircle,
    dot: 'bg-cyan-500',
    badge: 'text-cyan-700 bg-cyan-50 border-cyan-200 dark:text-cyan-300 dark:bg-cyan-500/10 dark:border-cyan-500/20',
    row: 'border-cyan-500/30',
  },
  absent: {
    label: { km: 'អវត្តមាន', en: 'Absent' },
    icon: XCircle,
    dot: 'bg-rose-500',
    badge: 'text-rose-700 bg-rose-50 border-rose-200 dark:text-rose-300 dark:bg-rose-500/10 dark:border-rose-500/20',
    row: 'border-rose-500/30',
  },
  late: {
    label: { km: 'មកយឺត', en: 'Late' },
    icon: Warning,
    dot: 'bg-amber-500',
    badge: 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-500/10 dark:border-amber-500/20',
    row: 'border-amber-500/30',
  },
  permission: {
    label: { km: 'ច្បាប់', en: 'Leave' },
    icon: Warning,
    dot: 'bg-violet-500',
    badge: 'text-violet-700 bg-violet-50 border-violet-200 dark:text-violet-300 dark:bg-violet-500/10 dark:border-violet-500/20',
    row: 'border-violet-500/30',
  },
} as const;

// ─── component ───────────────────────────────────────────────────────────────

export default function StudentAttendancePage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'km';
  const isKm = locale === 'km';

  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'present' | 'absent' | 'permission'>('all');
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.getStudentAttendance();
      setRecords(Array.isArray(data) ? data : []);
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const presentCount   = records.filter((r) => r.status === 'present').length;
  const absentCount    = records.filter((r) => r.status === 'absent').length;
  const permissionCount = records.filter((r) => r.status === 'permission').length;
  const lateCount      = records.filter((r) => r.status === 'late').length;
  const total = records.length;
  const attendedDays = presentCount + permissionCount;
  const rate = total > 0 ? ((attendedDays / total) * 100).toFixed(1) : '100.0';
  const rateNum = parseFloat(rate);

  const filtered = filter === 'all' ? records : records.filter((r) => r.status === filter);
  const grouped  = groupByMonth(filtered, isKm);
  const groupKeys = Object.keys(grouped);

  const toggleGroup = (key: string) =>
    setCollapsedGroups((prev) => ({ ...prev, [key]: !prev[key] }));

  const pills = [
    { key: 'all',        label: isKm ? `ទាំងអស់ (${total})` : `All (${total})` },
    { key: 'present',   label: isKm ? `វត្តមាន (${presentCount})` : `Present (${presentCount})` },
    { key: 'absent',    label: isKm ? `អវត្តមាន (${absentCount})` : `Absent (${absentCount})` },
    { key: 'permission',label: isKm ? `ច្បាប់ (${permissionCount})` : `Leave (${permissionCount})` },
  ] as const;

  return (
    <div className="space-y-4 sm:space-y-5 max-w-2xl mx-auto">

      {/* Header Stats Card */}
      <div
        className="relative rounded-3xl overflow-hidden text-white shadow-2xl border border-cyan-500/10"
        style={{
          background: 'linear-gradient(135deg, #0c1115 0%, #0e1620 55%, #0a2b36 100%)',
          boxShadow: '0 20px 40px -12px rgba(6,182,212,0.28)',
        }}
      >
        {/* Brand glow */}
        <div
          className="absolute -top-16 -right-16 w-56 h-56 rounded-full opacity-25 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #22d3ee 0%, transparent 70%)' }}
        />
        {/* Top section */}
        <div className="relative p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4 sm:mb-5 gap-3">
            <div className="min-w-0">
              <p className="text-[11px] sm:text-xs font-semibold text-cyan-300 mb-0.5 flex items-center gap-1.5">
                <LockSimple size={11} weight="fill" />
                <span className="truncate">{isKm ? 'ទិន្នន័យជំនួសរបស់អ្នក' : 'Your Private Data'}</span>
              </p>
              <h1 className="text-lg sm:text-xl font-extrabold truncate">{isKm ? 'វត្តមានរបស់ខ្ញុំ' : 'My Attendance'}</h1>
              <p className="text-[11px] text-slate-300 mt-0.5 truncate">
                {isKm ? `ថ្ងៃសិក្សា ${total} ថ្ងៃ` : `${total} school days recorded`}
              </p>
            </div>
            {/* Circular progress */}
            <div className="relative w-[72px] h-[72px] sm:w-20 sm:h-20 shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                <defs>
                  <linearGradient id="brandArc" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#22d3ee" />
                    <stop offset="100%" stopColor="#0284c7" />
                  </linearGradient>
                </defs>
                <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
                <circle
                  cx="40" cy="40" r="32" fill="none"
                  stroke="url(#brandArc)" strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 32}`}
                  strokeDashoffset={`${2 * Math.PI * 32 * (1 - rateNum / 100)}`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-base sm:text-lg font-black text-white leading-none">{rate}%</p>
                <p className="text-[8px] text-slate-300 font-medium leading-none mt-0.5">{isKm ? 'វត្តមាន' : 'Rate'}</p>
              </div>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
            {[
              { label: isKm ? 'វត្តមាន' : 'Present', value: presentCount, icon: CheckCircle, color: 'text-cyan-300', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
              { label: isKm ? 'អវត្តមាន' : 'Absent',  value: absentCount, icon: XCircle, color: 'text-rose-300', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
              { label: isKm ? 'ច្បាប់' : 'Leave',     value: permissionCount, icon: CalendarCheck, color: 'text-violet-300', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
              { label: isKm ? 'យឺត' : 'Late',          value: lateCount, icon: Warning, color: 'text-amber-300', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
            ].map((s) => {
              const SIcon = s.icon;
              return (
                <div key={s.label} className={`text-center ${s.bg} ${s.border} border rounded-2xl py-2.5 sm:py-3 px-2 backdrop-blur-sm`}>
                  <SIcon size={13} weight="fill" className={`${s.color} mx-auto mb-1 opacity-90`} />
                  <p className={`text-base sm:text-lg font-black ${s.color}`}>{s.value}</p>
                  <p className="text-[9px] text-slate-300 font-medium truncate">{s.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filter + Refresh */}
      <div className="flex items-center gap-2 flex-wrap">
        {pills.map((p) => {
          const isActive = filter === p.key;
          return (
            <button
              key={p.key}
              onClick={() => setFilter(p.key as any)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition cursor-pointer border ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500 to-sky-500 border-cyan-400/40 text-white shadow-md shadow-cyan-500/25'
                  : 'border-neutral-200 bg-white text-neutral-500 hover:text-neutral-900 hover:border-cyan-500/30 hover:bg-cyan-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400 dark:hover:text-white dark:hover:border-cyan-500/30 dark:hover:bg-cyan-500/5'
              }`}
            >
              {p.label}
            </button>
          );
        })}
        <button
          onClick={load}
          className="ml-auto p-2 rounded-xl border border-neutral-200 bg-white text-neutral-500 hover:text-cyan-600 hover:border-cyan-500/30 hover:bg-cyan-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400 dark:hover:text-cyan-300 dark:hover:border-cyan-500/30 transition cursor-pointer"
          title={isKm ? 'ធ្វើបច្ចុប្បន្នភាព' : 'Refresh'}
        >
          <ArrowClockwise size={14} />
        </button>
      </div>

      {/* Records grouped by Month */}
      {loading ? (
        <SkeletonList count={5} withAvatar={false} />
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-neutral-500 dark:text-slate-500 rounded-2xl border border-dashed border-neutral-200 dark:border-white/10 bg-white dark:bg-white/[0.02]">
          <CalendarCheck size={36} className="mb-2 opacity-30 text-cyan-600 dark:text-cyan-400" />
          <p className="text-xs text-neutral-500 dark:text-slate-400">{isKm ? 'មិនមានកំណត់ត្រាក្នុងប្រភេទនេះ' : 'No records in this category'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {groupKeys.map((monthKey) => {
            const monthRecords = grouped[monthKey];
            const isCollapsed = collapsedGroups[monthKey];
            const mPresent = monthRecords.filter((r) => r.status === 'present').length;
            const mAbsent  = monthRecords.filter((r) => r.status === 'absent').length;
            const mPerm    = monthRecords.filter((r) => r.status === 'permission').length;
            const mRate = monthRecords.length > 0 ? Math.round(((mPresent + mPerm) / monthRecords.length) * 100) : 0;

            return (
              <div
                key={monthKey}
                className="rounded-2xl overflow-hidden border border-cyan-200/70 bg-white shadow-sm dark:border-cyan-500/10 dark:bg-[#10151c] dark:shadow-lg dark:shadow-black/20"
              >
                {/* Month header */}
                <button
                  onClick={() => toggleGroup(monthKey)}
                  className="w-full flex items-center justify-between flex-wrap gap-x-3 gap-y-2 px-4 py-3 hover:bg-cyan-50 dark:hover:bg-cyan-500/[0.04] transition cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <CalendarCheck size={14} className="text-cyan-400 shrink-0" />
                    <span className="text-xs font-bold text-neutral-900 dark:text-white truncate">{monthKey}</span>
                    <span className="text-[10px] text-slate-500 shrink-0">{monthRecords.length} {isKm ? 'ថ្ងៃ' : 'days'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="text-[10px] font-bold text-cyan-700 bg-cyan-50 border border-cyan-200 px-2 py-0.5 rounded-full dark:text-cyan-300 dark:bg-cyan-500/10 dark:border-cyan-500/20">
                      {mPresent} {isKm ? 'វ' : 'P'}
                    </span>
                    {mAbsent > 0 && (
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full dark:text-rose-300 dark:bg-rose-500/10 dark:border-rose-500/20">
                        {mAbsent} {isKm ? 'អ' : 'A'}
                      </span>
                    )}
                    {mPerm > 0 && (
                      <span className="text-[10px] font-bold text-violet-700 bg-violet-50 border border-violet-200 px-2 py-0.5 rounded-full dark:text-violet-300 dark:bg-violet-500/10 dark:border-violet-500/20">
                        {mPerm} {isKm ? 'ច' : 'L'}
                      </span>
                    )}
                    <span className="text-[10px] font-bold text-cyan-700 bg-cyan-50 border border-cyan-200 px-2 py-0.5 rounded-full dark:text-cyan-300 dark:bg-cyan-500/[0.08] dark:border-cyan-500/20">{mRate}%</span>
                    {isCollapsed ? <CaretDown size={12} className="text-slate-500 shrink-0" /> : <CaretUp size={12} className="text-slate-500 shrink-0" />}
                  </div>
                </button>

                {/* Day rows */}
                {!isCollapsed && (
                  <div className="divide-y divide-neutral-100 border-t border-neutral-100 dark:divide-white/[0.05] dark:border-white/[0.05]">
                    {monthRecords.map((r, idx) => {
                      const cfg = STATUS_CONFIG[r.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.absent;
                      const Icon = cfg.icon;
                      return (
                        <div
                          key={idx}
                          className={`flex items-center justify-between gap-2 px-3 sm:px-4 py-3 border-l-2 hover:bg-neutral-50 dark:hover:bg-white/[0.03] transition ${cfg.row}`}
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot} shrink-0`} />
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-neutral-800 dark:text-slate-200 truncate">
                                {formatDate(r.date, isKm)}
                              </p>
                              {r.notes ? (
                                <p className="text-[10px] text-neutral-500 dark:text-slate-500 italic mt-0.5 truncate">{r.notes}</p>
                              ) : (
                                <p className="text-[10px] text-neutral-400 dark:text-slate-600 mt-0.5">{isKm ? 'គ្មានចំណាំ' : 'No notes'}</p>
                              )}
                            </div>
                          </div>
                          <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-xl border ${cfg.badge} shrink-0 whitespace-nowrap`}>
                            <Icon size={11} weight="fill" />
                            {isKm ? cfg.label.km : cfg.label.en}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

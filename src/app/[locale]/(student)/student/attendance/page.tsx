'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import {
  CalendarCheck, CheckCircle, XCircle, Warning, SpinnerGap,
  ArrowClockwise, LockSimple, CaretDown, CaretUp,
} from '@phosphor-icons/react';

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
    dot: 'bg-emerald-500',
    badge: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    row: 'border-emerald-500/10',
  },
  absent: {
    label: { km: 'អវត្តមាន', en: 'Absent' },
    icon: XCircle,
    dot: 'bg-rose-500',
    badge: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    row: 'border-rose-500/10',
  },
  late: {
    label: { km: 'មកយឺត', en: 'Late' },
    icon: Warning,
    dot: 'bg-sky-500',
    badge: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
    row: 'border-sky-500/10',
  },
  permission: {
    label: { km: 'ច្បាប់', en: 'Leave' },
    icon: Warning,
    dot: 'bg-amber-500',
    badge: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    row: 'border-amber-500/10',
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
    <div className="space-y-5 max-w-2xl mx-auto">

      {/* Header Stats Card */}
      <div
        className="rounded-3xl overflow-hidden text-white shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, #059669 0%, #0d9488 100%)',
          boxShadow: '0 20px 40px -12px rgba(5,150,105,0.4)',
        }}
      >
        {/* Top section */}
        <div className="p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-xs font-semibold text-emerald-200 mb-0.5 flex items-center gap-1.5">
                <LockSimple size={11} weight="fill" />
                {isKm ? 'ទិន្នន័យជំនួសរបស់អ្នក' : 'Your Private Data'}
              </p>
              <h1 className="text-xl font-extrabold">{isKm ? 'វត្តមានរបស់ខ្ញុំ' : 'My Attendance'}</h1>
              <p className="text-[11px] text-emerald-200 mt-0.5">
                {isKm ? `ថ្ងៃសិក្សា ${total} ថ្ងៃ` : `${total} school days recorded`}
              </p>
            </div>
            {/* Circular progress */}
            <div className="relative w-20 h-20 shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                <circle
                  cx="40" cy="40" r="32" fill="none"
                  stroke="rgba(255,255,255,0.85)" strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 32}`}
                  strokeDashoffset={`${2 * Math.PI * 32 * (1 - rateNum / 100)}`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-lg font-black text-white leading-none">{rate}%</p>
                <p className="text-[8px] text-emerald-200 font-medium leading-none mt-0.5">{isKm ? 'វត្តមាន' : 'Rate'}</p>
              </div>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { label: isKm ? 'វត្តមាន' : 'Present', value: presentCount, color: 'text-white', bg: 'bg-white/10' },
              { label: isKm ? 'អវត្តមាន' : 'Absent',  value: absentCount, color: 'text-rose-300', bg: 'bg-rose-500/20' },
              { label: isKm ? 'ច្បាប់' : 'Leave',     value: permissionCount, color: 'text-amber-300', bg: 'bg-amber-500/20' },
              { label: isKm ? 'យឺត' : 'Late',          value: lateCount, color: 'text-sky-300', bg: 'bg-sky-500/20' },
            ].map((s) => (
              <div key={s.label} className={`text-center ${s.bg} rounded-2xl py-2.5`}>
                <p className={`text-lg font-black ${s.color}`}>{s.value}</p>
                <p className="text-[9px] text-emerald-200 font-medium">{s.label}</p>
              </div>
            ))}
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
                  ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/25'
                  : 'border-white/5 text-slate-400 hover:text-white hover:border-white/10'
              }`}
              style={!isActive ? { background: 'rgba(255,255,255,0.03)' } : {}}
            >
              {p.label}
            </button>
          );
        })}
        <button
          onClick={load}
          className="ml-auto p-2 rounded-xl border border-white/5 text-slate-500 hover:text-emerald-400 transition cursor-pointer"
          style={{ background: 'rgba(255,255,255,0.03)' }}
          title={isKm ? 'ធ្វើបច្ចុប្បន្នភាព' : 'Refresh'}
        >
          <ArrowClockwise size={14} />
        </button>
      </div>

      {/* Records grouped by Month */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-500">
          <SpinnerGap size={28} className="animate-spin text-emerald-500 mb-2" />
          <p className="text-xs">{isKm ? 'កំពុងទាញទិន្នន័យ...' : 'Loading records...'}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-500">
          <CalendarCheck size={36} className="mb-2 opacity-20" />
          <p className="text-xs">{isKm ? 'មិនមានកំណត់ត្រាក្នុងប្រភេទនេះ' : 'No records in this category'}</p>
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
                className="rounded-2xl overflow-hidden border"
                style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)' }}
              >
                {/* Month header */}
                <button
                  onClick={() => toggleGroup(monthKey)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <CalendarCheck size={14} className="text-emerald-500" />
                    <span className="text-xs font-bold text-white">{monthKey}</span>
                    <span className="text-[10px] text-slate-500">{monthRecords.length} {isKm ? 'ថ្ងៃ' : 'days'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                      {mPresent} {isKm ? 'វ' : 'P'}
                    </span>
                    {mAbsent > 0 && (
                      <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full">
                        {mAbsent} {isKm ? 'អ' : 'A'}
                      </span>
                    )}
                    {mPerm > 0 && (
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                        {mPerm} {isKm ? 'ច' : 'L'}
                      </span>
                    )}
                    <span className="text-[10px] font-bold text-slate-400">{mRate}%</span>
                    {isCollapsed ? <CaretDown size={12} className="text-slate-500" /> : <CaretUp size={12} className="text-slate-500" />}
                  </div>
                </button>

                {/* Day rows */}
                {!isCollapsed && (
                  <div className="divide-y" style={{ borderTop: '1px solid rgba(255,255,255,0.04)', divideColor: 'rgba(255,255,255,0.04)' }}>
                    {monthRecords.map((r, idx) => {
                      const cfg = STATUS_CONFIG[r.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.absent;
                      const Icon = cfg.icon;
                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between px-4 py-3 hover:bg-white/[0.02] transition"
                          style={{ borderTop: idx > 0 ? '1px solid rgba(255,255,255,0.04)' : undefined }}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot} shrink-0`} />
                            <div>
                              <p className="text-xs font-semibold text-slate-200">
                                {formatDate(r.date, isKm)}
                              </p>
                              {r.notes ? (
                                <p className="text-[10px] text-slate-500 italic mt-0.5">{r.notes}</p>
                              ) : (
                                <p className="text-[10px] text-slate-600 mt-0.5">{isKm ? 'គ្មានចំណាំ' : 'No notes'}</p>
                              )}
                            </div>
                          </div>
                          <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-xl border ${cfg.badge}`}>
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

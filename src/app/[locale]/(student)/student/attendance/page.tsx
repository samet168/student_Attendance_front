'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import {
  CalendarCheck, CheckCircle, XCircle, Warning, SpinnerGap,
  ArrowClockwise
} from '@phosphor-icons/react';

export default function StudentAttendancePage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'km';
  const isKm = locale === 'km';

  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'present' | 'absent' | 'permission'>('all');

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.getStudentAttendance();
      setRecords(data);
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const presentCount = records.filter((r) => r.status === 'present').length;
  const absentCount = records.filter((r) => r.status === 'absent').length;
  const permissionCount = records.filter((r) => r.status === 'permission').length;
  const total = records.length;
  const rate = total > 0 ? ((presentCount / total) * 100).toFixed(1) : '100.0';
  const filtered = filter === 'all' ? records : records.filter((r) => r.status === filter);

  const pills = [
    { key: 'all', label: isKm ? `ទាំងអស់ (${total})` : `All (${total})`, active: 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900', inactive: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300' },
    { key: 'present', label: isKm ? `វត្តមាន (${presentCount})` : `Present (${presentCount})`, active: 'bg-emerald-600 text-white', inactive: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400' },
    { key: 'absent', label: isKm ? `អវត្តមាន (${absentCount})` : `Absent (${absentCount})`, active: 'bg-red-600 text-white', inactive: 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400' },
    { key: 'permission', label: isKm ? `ច្បាប់ (${permissionCount})` : `Leave (${permissionCount})`, active: 'bg-amber-500 text-white', inactive: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400' },
  ] as const;

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      {/* Header Stats Card */}
      <div className="rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-900/15 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-semibold text-emerald-200 mb-0.5">{isKm ? 'ប្រវត្តិវត្តមានផ្ទាល់ខ្លួន' : 'Personal Attendance Record'}</p>
            <h1 className="text-lg font-extrabold">{isKm ? 'វត្តមានរបស់ខ្ញុំ' : 'My Attendance'}</h1>
          </div>
          <div className="text-right">
            <p className="text-4xl font-black text-white">{rate}%</p>
            <p className="text-[11px] text-emerald-200">{isKm ? 'អត្រាវត្តមាន' : 'Attendance Rate'}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/15">
          {[
            { label: isKm ? 'វត្តមាន' : 'Present', value: presentCount, color: 'text-white' },
            { label: isKm ? 'អវត្តមាន' : 'Absent', value: absentCount, color: 'text-red-300' },
            { label: isKm ? 'ច្បាប់' : 'Leave', value: permissionCount, color: 'text-amber-300' },
          ].map((s) => (
            <div key={s.label} className="text-center bg-white/10 rounded-2xl py-2.5">
              <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-emerald-200 font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filter + Refresh */}
      <div className="flex items-center gap-2 flex-wrap">
        {pills.map((p) => (
          <button
            key={p.key}
            onClick={() => setFilter(p.key as any)}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition cursor-pointer ${filter === p.key ? p.active : p.inactive}`}
          >
            {p.label}
          </button>
        ))}
        <button
          onClick={load}
          className="ml-auto p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-emerald-600 transition cursor-pointer"
          title={isKm ? 'ធ្វើបច្ចុប្បន្នភាព' : 'Refresh'}
        >
          <ArrowClockwise size={14} />
        </button>
      </div>

      {/* Records List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <SpinnerGap size={28} className="animate-spin text-emerald-500 mb-2" />
          <p className="text-xs">{isKm ? 'កំពុងទាញទិន្នន័យ...' : 'Loading records...'}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <CalendarCheck size={36} className="mb-2 opacity-30" />
          <p className="text-xs">{isKm ? 'មិនមានកំណត់ត្រាក្នុងប្រភេទនេះ' : 'No records in this category'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((r, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between bg-white dark:bg-slate-900 rounded-2xl px-4 py-3 border border-slate-200/80 dark:border-slate-800 shadow-xs"
            >
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">{r.date}</p>
                {r.notes ? (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 italic mt-0.5">"{r.notes}"</p>
                ) : (
                  <p className="text-[10px] text-slate-400 mt-0.5">{isKm ? 'ធម្មតា' : 'Normal'}</p>
                )}
              </div>
              {r.status === 'present' ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-xl">
                  <CheckCircle size={13} weight="fill" /> {isKm ? 'វត្តមាន' : 'Present'}
                </span>
              ) : r.status === 'absent' ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 px-2.5 py-1 rounded-xl">
                  <XCircle size={13} weight="fill" /> {isKm ? 'អវត្តមាន' : 'Absent'}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-2.5 py-1 rounded-xl">
                  <Warning size={13} weight="fill" /> {isKm ? 'ច្បាប់' : 'Leave'}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

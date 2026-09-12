'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import {
  Exam, BookOpen, SpinnerGap, ArrowClockwise, LockSimple,
  Trophy, CalendarBlank, CaretDown, CaretUp, ChartBar,
} from '@phosphor-icons/react';

// ─── helpers ────────────────────────────────────────────────────────────────

const KH_MONTHS = ['មករា','កុម្ភៈ','មីនា','មេសា','ឧសភា','មិថុនា','កក្កដា','សីហា','កញ្ញា','តុលា','វិច្ឆិកា','ធ្នូ'];

function formatDateFull(dateStr: string, isKm: boolean): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    if (isKm) {
      const day = d.getDate().toString().padStart(2, '0');
      return `ថ្ងៃទី ${day} ខែ${KH_MONTHS[d.getMonth()]} ឆ្នាំ ${d.getFullYear()}`;
    }
    return d.toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'long', year: 'numeric' });
  } catch { return dateStr; }
}

function monthKey(dateStr: string, isKm: boolean): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return isKm
      ? `ខែ${KH_MONTHS[d.getMonth()]} ឆ្នាំ ${d.getFullYear()}`
      : `${d.toLocaleString('en-US', { month: 'long' })} ${d.getFullYear()}`;
  } catch { return dateStr; }
}

function letterGrade(score: number, max = 100) {
  const p = (score / max) * 100;
  if (p >= 90) return 'A';
  if (p >= 80) return 'B';
  if (p >= 70) return 'C';
  if (p >= 60) return 'D';
  if (p >= 50) return 'E';
  return 'F';
}

const LETTER_CONFIG: Record<string, { color: string; bg: string; border: string }> = {
  A: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  B: { color: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/20' },
  C: { color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20' },
  D: { color: 'text-orange-400',  bg: 'bg-orange-500/10',  border: 'border-orange-500/20' },
  E: { color: 'text-rose-400',    bg: 'bg-rose-500/10',    border: 'border-rose-500/20' },
  F: { color: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/20' },
};

const BAR_COLOR = (score: number) =>
  score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-blue-500' : score >= 50 ? 'bg-amber-500' : 'bg-rose-500';

const SUBJECT_GRADIENTS: Record<number, string> = {
  0: 'from-violet-600 to-indigo-600',
  1: 'from-blue-600 to-cyan-600',
  2: 'from-emerald-600 to-teal-600',
  3: 'from-amber-600 to-orange-600',
  4: 'from-rose-600 to-pink-600',
  5: 'from-purple-600 to-violet-600',
};

// ─── component ───────────────────────────────────────────────────────────────

export default function StudentGradesPage() {
  const params = useParams();
  const locale  = (params?.locale as string) || 'km';
  const isKm   = locale === 'km';

  const [grades,   setGrades]   = useState<any[]>([]);
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading,  setLoading]  = useState(true);
  const [activeTab, setActiveTab] = useState<'list' | 'subject'>('subject');
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const load = async () => {
    setLoading(true);
    try {
      const [gradesData, dash] = await Promise.allSettled([
        api.getStudentGrades(),
        api.getStudentDashboard(),
      ]);
      if (gradesData.status === 'fulfilled') setGrades(Array.isArray(gradesData.value) ? gradesData.value : []);
      if (dash.status === 'fulfilled')       setDashboard(dash.value);
    } catch {
      setGrades([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const avg    = grades.length > 0 ? grades.reduce((a, g) => a + g.score, 0) / grades.length : 0;
  const letter = letterGrade(avg);
  const rank   = dashboard?.grades_summary?.rank ?? '-';
  const gpa    = dashboard?.grades_summary?.gpa  ?? (avg / 25).toFixed(2);

  const groupedByMonth = useMemo(() => {
    const map: Record<string, any[]> = {};
    for (const g of grades) {
      const k = monthKey(g.date, isKm);
      if (!map[k]) map[k] = [];
      map[k].push(g);
    }
    return map;
  }, [grades, isKm]);

  const groupedBySubject = useMemo(() => {
    const map: Record<string, { scores: number[]; exams: any[] }> = {};
    for (const g of grades) {
      const subj = g.subject || (isKm ? 'ផ្សេងៗ' : 'Other');
      if (!map[subj]) map[subj] = { scores: [], exams: [] };
      map[subj].scores.push(g.score);
      map[subj].exams.push(g);
    }
    return Object.entries(map).map(([subject, { scores, exams }]) => ({
      subject,
      avg: scores.reduce((a, b) => a + b, 0) / scores.length,
      count: scores.length,
      exams,
    })).sort((a, b) => b.avg - a.avg);
  }, [grades, isKm]);

  const toggleGroup = (k: string) =>
    setCollapsedGroups((prev) => ({ ...prev, [k]: !prev[k] }));

  const lc = LETTER_CONFIG[letter] || LETTER_CONFIG.F;

  return (
    <div className="space-y-5 max-w-2xl mx-auto">

      {/* Header Card */}
      <div
        className="rounded-3xl p-5 text-white shadow-2xl relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #1d4ed8 0%, #4f46e5 50%, #7c3aed 100%)',
          boxShadow: '0 20px 40px -12px rgba(79,70,229,0.4)',
        }}
      >
        {/* decorative */}
        <div className="absolute top-0 right-0 w-56 h-56 rounded-full opacity-10 -translate-y-1/3 translate-x-1/4"
          style={{ background: 'radial-gradient(circle, #fff 0%, transparent 70%)' }} />

        <div className="relative flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-blue-200 mb-0.5 flex items-center gap-1.5">
              <LockSimple size={11} weight="fill" />
              {isKm ? 'ព្រឹត្តិបត្រពិន្ទុផ្ទាល់ខ្លួន' : 'Personal Academic Record'}
            </p>
            <h1 className="text-xl font-extrabold leading-tight">
              {isKm ? 'ពិន្ទុ & លទ្ធផលសិក្សា' : 'Grades & Academic Results'}
            </h1>
            <p className="text-[11px] text-blue-300 mt-1">
              {isKm ? `ការប្រឡង ${grades.length} លើក` : `${grades.length} exam entries recorded`}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-4xl font-black text-white">{avg.toFixed(1)}</p>
            <p className={`text-2xl font-black ${lc.color}`}>
              {isKm ? `និទ្ទេស ${letter}` : `Grade ${letter}`}
            </p>
            <p className="text-[11px] text-blue-300 mt-0.5">{isKm ? 'មធ្យមភាគ' : 'Average'}</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="relative grid grid-cols-3 gap-2 mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.12)' }}>
          <div className="text-center bg-white/10 rounded-2xl py-2.5 backdrop-blur-sm">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <Trophy size={13} className="text-amber-300" />
              <p className="text-lg font-black text-white">{rank}</p>
            </div>
            <p className="text-[10px] text-blue-200 font-medium">{isKm ? 'ចំណាត់ថ្នាក់' : 'Class Rank'}</p>
          </div>
          <div className="text-center bg-white/10 rounded-2xl py-2.5 backdrop-blur-sm">
            <p className="text-lg font-black text-white">{Number(gpa).toFixed(2)}</p>
            <p className="text-[10px] text-blue-200 font-medium">GPA (/4.0)</p>
          </div>
          <div className="text-center bg-white/10 rounded-2xl py-2.5 backdrop-blur-sm">
            <p className="text-lg font-black text-white">{groupedBySubject.length}</p>
            <p className="text-[10px] text-blue-200 font-medium">{isKm ? 'មុខវិជ្ជា' : 'Subjects'}</p>
          </div>
        </div>
      </div>

      {/* Tabs + Refresh */}
      <div className="flex items-center justify-between gap-2">
        <div
          className="flex items-center gap-1 p-1 rounded-xl border"
          style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)' }}
        >
          {[
            { key: 'subject', icon: ChartBar, label: isKm ? 'តាមមុខវិជ្ជា' : 'By Subject' },
            { key: 'list', icon: CalendarBlank, label: isKm ? 'រាយបញ្ជី' : 'By Date' },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon size={13} />
                {tab.label}
              </button>
            );
          })}
        </div>
        <button
          onClick={load}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-white/5 text-slate-500 hover:text-blue-400 transition cursor-pointer"
          style={{ background: 'rgba(255,255,255,0.03)' }}
        >
          <ArrowClockwise size={13} /> {isKm ? 'ធ្វើបច្ចុប្បន្នភាព' : 'Refresh'}
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-500">
          <SpinnerGap size={28} className="animate-spin text-blue-500 mb-2" />
          <p className="text-xs">{isKm ? 'កំពុងផ្ទុកពិន្ទុ...' : 'Loading grades...'}</p>
        </div>
      ) : grades.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-500">
          <Exam size={36} className="mb-2 opacity-20" />
          <p className="text-xs">{isKm ? 'មិនទាន់មានពិន្ទុដែលបានបញ្ចូលទេ' : 'No grades recorded yet'}</p>
        </div>

      ) : activeTab === 'subject' ? (
        /* ── Subject Summary View ──────────────────────────────── */
        <div className="space-y-3">
          {groupedBySubject.map(({ subject, avg: sAvg, count, exams }, idx) => {
            const sl = letterGrade(sAvg);
            const slc = LETTER_CONFIG[sl] || LETTER_CONFIG.F;
            const pct = Math.min(100, Math.max(0, sAvg));
            const isCollapsed = collapsedGroups[subject];
            const gradient = SUBJECT_GRADIENTS[idx % Object.keys(SUBJECT_GRADIENTS).length];
            return (
              <div
                key={subject}
                className="rounded-2xl overflow-hidden border"
                style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)' }}
              >
                <button
                  onClick={() => toggleGroup(subject)}
                  className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-white/[0.02] transition cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md shrink-0`}>
                      <BookOpen size={15} weight="bold" className="text-white" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-white">{subject}</p>
                      <p className="text-[10px] text-slate-500">
                        {count} {isKm ? 'ការប្រឡង' : 'exams'} • {isKm ? 'មធ្យម' : 'avg'}: {sAvg.toFixed(1)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-black px-2 py-0.5 rounded-lg border ${slc.color} ${slc.bg} ${slc.border}`}>
                      {sl}
                    </span>
                    <span className="text-xs font-black text-blue-400 w-10 text-right">
                      {sAvg.toFixed(1)}
                    </span>
                    {isCollapsed ? <CaretDown size={12} className="text-slate-500" /> : <CaretUp size={12} className="text-slate-500" />}
                  </div>
                </button>

                {/* Progress bar */}
                <div className="h-0.5 bg-white/5">
                  <div className={`h-full ${BAR_COLOR(sAvg)} transition-all duration-700`} style={{ width: `${pct}%` }} />
                </div>

                {/* Exam breakdown */}
                {!isCollapsed && (
                  <div>
                    {exams.map((exam, ei) => {
                      const el = letterGrade(exam.score, exam.max_score || 100);
                      const elc = LETTER_CONFIG[el] || LETTER_CONFIG.F;
                      const ep = Math.min(100, (exam.score / (exam.max_score || 100)) * 100);
                      return (
                        <div
                          key={exam.id}
                          className="px-4 py-3 flex items-center justify-between"
                          style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
                        >
                          <div>
                            <p className="text-xs font-semibold text-slate-300">
                              {exam.exam_type || (isKm ? 'ការប្រឡង' : 'Exam')}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <CalendarBlank size={10} className="text-slate-600" />
                              <p className="text-[10px] text-slate-500">
                                {formatDateFull(exam.date, isKm)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-white/5 rounded-full h-1.5 overflow-hidden">
                              <div className={`h-full rounded-full ${BAR_COLOR(exam.score)} transition-all`} style={{ width: `${ep}%` }} />
                            </div>
                            <span className="text-xs font-black text-white w-8 text-right">{exam.score}</span>
                            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md border ${elc.color} ${elc.bg} ${elc.border}`}>
                              {el}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      ) : (
        /* ── Chronological List View ────────────────────────────── */
        <div className="space-y-3">
          {Object.entries(groupedByMonth).map(([mk, items]) => {
            const isCollapsed = collapsedGroups[mk];
            const mAvg = items.reduce((a, g) => a + g.score, 0) / items.length;
            const mlc = LETTER_CONFIG[letterGrade(mAvg)] || LETTER_CONFIG.F;
            return (
              <div
                key={mk}
                className="rounded-2xl overflow-hidden border"
                style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)' }}
              >
                <button
                  onClick={() => toggleGroup(mk)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.02] transition cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <CalendarBlank size={13} className="text-blue-400" />
                    <span className="text-xs font-bold text-white">{mk}</span>
                    <span className="text-[10px] text-slate-500">
                      {items.length} {isKm ? 'ការប្រឡង' : 'exams'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-blue-400">
                      {isKm ? 'មធ្យម: ' : 'avg: '}{mAvg.toFixed(1)}
                    </span>
                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md border ${mlc.color} ${mlc.bg} ${mlc.border}`}>
                      {letterGrade(mAvg)}
                    </span>
                    {isCollapsed ? <CaretDown size={12} className="text-slate-500" /> : <CaretUp size={12} className="text-slate-500" />}
                  </div>
                </button>

                {!isCollapsed && (
                  <div>
                    {items.map((item) => {
                      const pct = Math.min(100, Math.max(0, (item.score / (item.max_score || 100)) * 100));
                      const gl  = letterGrade(item.score, item.max_score || 100);
                      const glc = LETTER_CONFIG[gl] || LETTER_CONFIG.F;
                      return (
                        <div
                          key={item.id}
                          className="px-4 py-3.5 space-y-2"
                          style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                                <BookOpen size={14} weight="bold" />
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-xs font-bold text-white truncate">{item.subject}</h4>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <CalendarBlank size={10} className="text-slate-600 flex-shrink-0" />
                                  <p className="text-[10px] text-slate-500">
                                    {formatDateFull(item.date, isKm)}
                                  </p>
                                </div>
                                <p className="text-[10px] text-slate-600 mt-0.5">
                                  {item.exam_type || (isKm ? 'ការប្រឡង' : 'Exam')}
                                  {item.class_name ? ` • ${item.class_name}` : ''}
                                </p>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="flex items-baseline gap-1 justify-end">
                                <span className="text-sm font-extrabold text-blue-400">{item.score}</span>
                                <span className="text-[10px] text-slate-600">/ {item.max_score || 100}</span>
                              </div>
                              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md border ${glc.color} ${glc.bg} ${glc.border}`}>
                                {isKm ? 'និទ្ទេស ' : ''}{gl}
                              </span>
                            </div>
                          </div>
                          <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${BAR_COLOR(item.score)}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
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

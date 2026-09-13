'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import {
  Exam, BookOpen, ArrowClockwise, LockSimple,
  Trophy, CalendarBlank, CaretDown, CaretUp, ChartBar,
  DownloadSimple, FilePdf, Medal, CheckCircle, Student
} from '@phosphor-icons/react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SkeletonList } from '@/components/ui/skeleton';

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
  A: { color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-200 dark:border-emerald-500/20' },
  B: { color: 'text-blue-700 dark:text-blue-400',       bg: 'bg-blue-50 dark:bg-blue-500/10',       border: 'border-blue-200 dark:border-blue-500/20' },
  C: { color: 'text-amber-700 dark:text-amber-400',     bg: 'bg-amber-50 dark:bg-amber-500/10',     border: 'border-amber-200 dark:border-amber-500/20' },
  D: { color: 'text-orange-700 dark:text-orange-400',   bg: 'bg-orange-50 dark:bg-orange-500/10',   border: 'border-orange-200 dark:border-orange-500/20' },
  E: { color: 'text-rose-700 dark:text-rose-400',       bg: 'bg-rose-50 dark:bg-rose-500/10',       border: 'border-rose-200 dark:border-rose-500/20' },
  F: { color: 'text-red-700 dark:text-red-400',         bg: 'bg-red-50 dark:bg-red-500/10',         border: 'border-red-200 dark:border-red-500/20' },
};

const LETTER_BRIGHT: Record<string, string> = {
  A: 'text-emerald-300',
  B: 'text-blue-300',
  C: 'text-amber-300',
  D: 'text-orange-300',
  E: 'text-rose-300',
  F: 'text-red-300',
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
  const [activeTab, setActiveTab] = useState<'subject' | 'list'>('subject');
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
  const studentInfo = dashboard?.student || {};

  const handleDownloadTranscriptPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header Title
    doc.setFillColor(30, 41, 59); // Slate-800
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('SMART SCHOOL MANAGEMENT SYSTEM', pageWidth / 2, 18, { align: 'center' });

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('OFFICIAL ACADEMIC TRANSCRIPT & REPORT CARD', pageWidth / 2, 28, { align: 'center' });

    // Student Information Block
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');

    const startY = 48;
    doc.text(`Student Name: ${studentInfo.full_name || studentInfo.name || 'Student'}`, 14, startY);
    doc.text(`Student ID: ${studentInfo.student_code || studentInfo.student_id || '-'}`, 14, startY + 6);
    doc.text(`Class: ${studentInfo.class_name || studentInfo.enrolled_class || '-'}`, 14, startY + 12);

    doc.text(`Academic Year: 2025-2026`, pageWidth - 14, startY, { align: 'right' });
    doc.text(`Cumulative GPA: ${gpa} (${letter})`, pageWidth - 14, startY + 6, { align: 'right' });
    doc.text(`Class Rank: #${rank}`, pageWidth - 14, startY + 12, { align: 'right' });

    // Table of Grades
    const tableBody = grades.map((g, idx) => [
      idx + 1,
      g.subject || 'Subject',
      g.exam_type || 'Monthly Exam',
      g.date || '-',
      g.score,
      g.max_score || 100,
      letterGrade(g.score, g.max_score || 100)
    ]);

    autoTable(doc, {
      startY: startY + 20,
      head: [['#', 'Subject', 'Examination', 'Date', 'Score', 'Max', 'Grade']],
      body: tableBody,
      theme: 'grid',
      headStyles: {
        fillColor: [79, 70, 229], // Indigo
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
      },
      styles: {
        fontSize: 8.5,
        cellPadding: 4,
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
    });

    // Summary at Bottom
    const finalY = (doc as any).lastAutoTable.finalY + 12;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 116, 139);
    doc.text(`Generated on: ${new Date().toLocaleDateString('en-US')} - Validated by School Examination Office`, 14, finalY);

    // Signature Area
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('Academic Dean / Principal', pageWidth - 20, finalY + 20, { align: 'right' });
    doc.line(pageWidth - 70, finalY + 18, pageWidth - 14, finalY + 18);

    doc.save(`Academic_Transcript_${studentInfo.student_code || 'Report'}.pdf`);
  };

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
            <p className={`text-2xl font-black ${LETTER_BRIGHT[letter] || 'text-white'}`}>
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
        <div className="flex items-center gap-1 p-1 rounded-xl border bg-neutral-100 border-neutral-200 dark:bg-white/[0.03] dark:border-white/[0.06]">
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
                    : 'text-neutral-500 hover:text-neutral-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <Icon size={13} />
                {tab.label}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadTranscriptPDF}
            disabled={grades.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-blue-600/10 hover:bg-blue-600/20 text-blue-700 border border-blue-300 transition shadow-sm cursor-pointer disabled:opacity-40 dark:bg-blue-600/20 dark:hover:bg-blue-600/30 dark:text-blue-400 dark:border-blue-500/30"
          >
            <DownloadSimple size={13} weight="bold" />
            <FilePdf size={13} weight="fill" className="text-rose-400" />
            <span>{isKm ? 'ទាញយកព្រឹត្តិបត្រពិន្ទុ (PDF)' : 'Download Transcript'}</span>
          </button>
          <button
            onClick={load}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-neutral-200 text-neutral-600 hover:text-blue-600 hover:border-blue-300 transition cursor-pointer dark:border-white/5 dark:text-slate-500 dark:hover:text-blue-400 dark:bg-white/[0.03]"
          >
            <ArrowClockwise size={13} /> {isKm ? 'ធ្វើបច្ចុប្បន្នភាព' : 'Refresh'}
          </button>
        </div>
      </div>

      {loading ? (
        <SkeletonList count={5} withAvatar={false} />
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
                className="rounded-2xl overflow-hidden border bg-white border-neutral-200 dark:bg-white/[0.02] dark:border-white/[0.06]"
              >
                <button
                  onClick={() => toggleGroup(subject)}
                  className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-neutral-50 dark:hover:bg-white/[0.02] transition cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md shrink-0`}>
                      <BookOpen size={15} weight="bold" className="text-white" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-neutral-900 dark:text-white">{subject}</p>
                      <p className="text-[10px] text-slate-500">
                        {count} {isKm ? 'ការប្រឡង' : 'exams'} • {isKm ? 'មធ្យម' : 'avg'}: {sAvg.toFixed(1)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-black px-2 py-0.5 rounded-lg border ${slc.color} ${slc.bg} ${slc.border}`}>
                      {sl}
                    </span>
                    <span className="text-xs font-black text-blue-600 dark:text-blue-400 w-10 text-right">
                      {sAvg.toFixed(1)}
                    </span>
                    {isCollapsed ? <CaretDown size={12} className="text-slate-500" /> : <CaretUp size={12} className="text-slate-500" />}
                  </div>
                </button>

                {/* Progress bar */}
                <div className="h-0.5 bg-slate-100 dark:bg-white/5">
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
                          className="px-4 py-3 flex items-center justify-between border-t border-neutral-100 dark:border-white/[0.04]"
                        >
                          <div>
                            <p className="text-xs font-semibold text-neutral-800 dark:text-slate-300">
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
                            <div className="w-16 bg-slate-100 dark:bg-white/5 rounded-full h-1.5 overflow-hidden">
                              <div className={`h-full rounded-full ${BAR_COLOR(exam.score)} transition-all`} style={{ width: `${ep}%` }} />
                            </div>
                            <span className="text-xs font-black text-neutral-900 dark:text-white w-8 text-right">{exam.score}</span>
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
                className="rounded-2xl overflow-hidden border bg-white border-neutral-200 dark:bg-white/[0.02] dark:border-white/[0.06]"
              >
                <button
                  onClick={() => toggleGroup(mk)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-neutral-50 dark:hover:bg-white/[0.02] transition cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <CalendarBlank size={13} className="text-blue-400" />
                    <span className="text-xs font-bold text-neutral-900 dark:text-white">{mk}</span>
                    <span className="text-[10px] text-slate-500">
                      {items.length} {isKm ? 'ការប្រឡង' : 'exams'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-blue-600 dark:text-blue-400">
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
                          className="px-4 py-3.5 space-y-2 border-t border-neutral-100 dark:border-white/[0.04]"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400">
                                <BookOpen size={14} weight="bold" />
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-xs font-bold text-neutral-900 dark:text-white truncate">{item.subject}</h4>
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
                                <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400">{item.score}</span>
                                <span className="text-[10px] text-slate-600">/ {item.max_score || 100}</span>
                              </div>
                              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md border ${glc.color} ${glc.bg} ${glc.border}`}>
                                {isKm ? 'និទ្ទេស ' : ''}{gl}
                              </span>
                            </div>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-white/5 rounded-full h-1 overflow-hidden">
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

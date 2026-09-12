'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  ArrowLeft, CheckCircle, FileText,
  DownloadSimple, X, Trophy, SpinnerGap, WarningCircle,
  Sparkle, Check, XCircle, ListNumbers, Eye
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { StatusBadge } from '@/components/dashboard/table/status-badge';
import { api } from '@/lib/api';

interface QCMAnswerItem {
  question_id: number;
  question_text: string;
  choices: string[];
  chosen_answer: number;
  correct_answer?: number;
  is_correct?: boolean;
}

interface SubmissionItem {
  id: number;
  homework_id?: number;
  student_id: number;
  student_name: string;
  student_code?: string;
  avatar_url?: string | null;
  file_url?: string;
  file_name?: string;
  student_note?: string;
  score?: number | null;
  teacher_feedback?: string | null;
  feedback?: string | null;
  submitted_at: string;
  graded_at?: string;
  status: string;
  is_qcm?: boolean;
  qcm_answers?: QCMAnswerItem[];
  correct_count?: number;
  total_questions?: number;
}

const DEFAULT_SUBMISSIONS: SubmissionItem[] = [
  {
    id: 101,
    student_id: 1,
    student_name: 'សុខ ចិន្តា (Sok Chenda)',
    student_code: 'STU-1001',
    file_url: 'https://res.cloudinary.com/demo/image/upload/sample.pdf',
    file_name: 'homework_sok_chenda.pdf',
    student_note: 'ខ្ញុំបានធ្វើលំហាត់ទាំង ១០ រួចរាល់ហើយលោកគ្រូ។',
    score: 95,
    teacher_feedback: 'ធ្វើបានល្អណាស់ និងមានរបៀបរៀបរយត្រឹមត្រូវ!',
    submitted_at: '2026-09-11 14:30',
    status: 'Graded',
    is_qcm: false,
  },
];

export default function HomeworkReviewPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'km';
  const homeworkIdParam = (params?.homeworkId as string) || '1';
  const homeworkIdNum = parseInt(homeworkIdParam, 10) || 1;
  const isKm = locale === 'km';

  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSub, setSelectedSub] = useState<SubmissionItem | null>(null);
  const [viewingQcmSub, setViewingQcmSub] = useState<SubmissionItem | null>(null);
  const [gradeScore, setGradeScore] = useState<string>('90');
  const [feedback, setFeedback] = useState<string>('ធ្វើបានល្អណាស់ (Great work!)');
  const [grading, setGrading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isQcmHomework = submissions.some((s) => s.is_qcm);

  useEffect(() => {
    loadSubmissions();
  }, [homeworkIdNum]);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const data = await api.getHomeworkSubmissions(homeworkIdNum);
      if (Array.isArray(data)) {
        setSubmissions(data);
      } else {
        setSubmissions([]);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error loading submissions');
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenGradeModal = (sub: SubmissionItem) => {
    setSelectedSub(sub);
    setGradeScore(sub.score !== null && sub.score !== undefined ? String(sub.score) : '90');
    setFeedback(sub.teacher_feedback || sub.feedback || (isKm ? 'ធ្វើបានល្អណាស់ (Good job!)' : 'Well done!'));
  };

  const handleSaveGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub) return;

    setGrading(true);
    setErrorMessage(null);
    const scoreVal = parseFloat(gradeScore) || 0;
    try {
      await api.gradeSubmission(selectedSub.id, scoreVal, feedback.trim());
      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === selectedSub.id
            ? { ...s, score: scoreVal, teacher_feedback: feedback.trim(), feedback: feedback.trim(), status: 'Graded' }
            : s
        )
      );
      setSelectedSub(null);
      setStatusMessage(isKm ? 'បានដាក់ពិន្ទុ និងផ្ញើមតិកែលម្អដោយជោគជ័យ!' : 'Submission graded and feedback sent!');
      setTimeout(() => setStatusMessage(null), 3500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error saving grade');
    } finally {
      setGrading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href={`/${locale}/homework`}
            className="p-2.5 bg-white dark:bg-[#15171e] border border-slate-200/80 dark:border-white/[0.08] rounded-2xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/[0.04] transition shadow-2xs cursor-pointer"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                {isKm ? `ត្រួតពិនិត្យការប្រគល់កិច្ចការ (Assignment #${homeworkIdNum})` : `Review Submissions (#${homeworkIdNum})`}
              </h1>
              {isQcmHomework && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-lg bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20">
                  <Sparkle size={12} weight="fill" />
                  <span>QCM Auto-Graded</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isQcmHomework
                ? (isKm ? 'កិច្ចការតេស្តពហុជ្រើសរើស (QCM) — ពិន្ទុត្រូវបានកែស្វ័យប្រវត្តិតាមប្រព័ន្ធ' : 'QCM Quiz — Automatically evaluated and scored by the system')
                : (isKm ? 'ពិនិត្យឯកសារដែលសិស្សបានប្រគល់ ដាក់ពិន្ទុ (/100) និងផ្ដល់មតិកែលម្អ' : 'Review student homework files, assign grades, and submit feedback')}
            </p>
          </div>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2 shadow-xs animate-in fade-in">
          <CheckCircle size={18} weight="fill" className="text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <WarningCircle size={18} weight="fill" className="text-rose-600 dark:text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-rose-600 hover:text-rose-800 cursor-pointer">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Submissions Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400 bg-white dark:bg-[#15171e] rounded-3xl border border-slate-200/80 dark:border-white/[0.07]">
          <SpinnerGap size={28} className="animate-spin text-blue-600 mb-2" />
          <p className="text-xs font-medium">{isKm ? 'កំពុងទាញបញ្ជីការប្រគល់...' : 'Loading submissions...'}</p>
        </div>
      ) : submissions.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 dark:border-white/[0.1] bg-white dark:bg-[#15171e] p-12 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/[0.05] text-slate-400 flex items-center justify-center mb-3">
            <FileText size={24} />
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">
            {isKm ? 'មិនទាន់មានសិស្សប្រគល់កិច្ចការនៅឡើយទេ' : 'No students have turned in this assignment yet'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
            {isKm ? 'នៅពេលសិស្សផ្ញើកិច្ចការពីគណនីរបស់ពួកគេ លទ្ធផលនឹងបង្ហាញនៅទីនេះដោយស្វ័យប្រវត្តិ។' : 'When students submit their homework, their results will appear here automatically.'}
          </p>
        </div>
      ) : (
        <div className="rounded-3xl border border-slate-200/80 dark:border-white/[0.07] bg-white dark:bg-[#15171e] p-5 shadow-xs overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-100 dark:border-white/[0.06]">
                <TableHead className="font-bold text-xs">{isKm ? 'អត្តលេខ' : 'Student ID'}</TableHead>
                <TableHead className="font-bold text-xs">{isKm ? 'ឈ្មោះសិស្ស' : 'Student Name'}</TableHead>
                <TableHead className="font-bold text-xs">{isKm ? 'ថ្ងៃប្រគល់' : 'Submitted At'}</TableHead>
                {/* Dynamically adjust column header based on QCM or regular homework */}
                <TableHead className="font-bold text-xs">
                  {isQcmHomework ? (isKm ? 'លទ្ធផល QCM' : 'QCM Results') : (isKm ? 'ឯកសារភ្ជាប់' : 'Attached File')}
                </TableHead>
                <TableHead className="font-bold text-xs">{isKm ? 'ចំណាំសិស្ស' : 'Student Note'}</TableHead>
                <TableHead className="font-bold text-xs">{isKm ? 'ស្ថានភាព' : 'Status'}</TableHead>
                <TableHead className="text-center font-bold text-xs">{isKm ? 'ពិន្ទុ (/100)' : 'Grade (/100)'}</TableHead>
                <TableHead className="text-right font-bold text-xs">{isKm ? 'សកម្មភាព' : 'Action'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map((sub) => (
                <TableRow key={sub.id} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.03] border-slate-100 dark:border-white/[0.06] transition">
                  <TableCell className="font-mono text-xs text-blue-600 dark:text-blue-400 font-bold">
                    {sub.student_code || `STU-${sub.student_id}`}
                  </TableCell>
                  <TableCell className="font-semibold text-slate-900 dark:text-white text-xs">
                    {sub.student_name}
                  </TableCell>
                  <TableCell className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    {sub.submitted_at || '-'}
                  </TableCell>
                  
                  {/* Dynamic Column Content */}
                  <TableCell className="text-xs">
                    {sub.is_qcm ? (
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/20 font-bold text-[11px]">
                          <ListNumbers size={13} weight="bold" />
                          <span>{sub.correct_count ?? 0}/{sub.total_questions ?? 0} {isKm ? 'ត្រូវ' : 'correct'}</span>
                        </span>
                        {sub.qcm_answers && sub.qcm_answers.length > 0 && (
                          <button
                            onClick={() => setViewingQcmSub(sub)}
                            className="p-1 text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200 hover:bg-purple-50 dark:hover:bg-purple-500/20 rounded-md transition cursor-pointer"
                            title={isKm ? 'មើលចម្លើយលម្អិត' : 'View Detailed Answers'}
                          >
                            <Eye size={15} weight="bold" />
                          </button>
                        )}
                      </div>
                    ) : sub.file_url ? (
                      <a
                        href={sub.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                      >
                        <DownloadSimple size={14} weight="bold" />
                        <span className="truncate max-w-[150px]">{sub.file_name || (isKm ? 'មើលឯកសារ' : 'View File')}</span>
                      </a>
                    ) : (
                      <span className="text-slate-400 font-mono">-</span>
                    )}
                  </TableCell>

                  <TableCell className="text-xs text-slate-500 dark:text-slate-400 max-w-xs truncate">
                    {sub.student_note || '-'}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={(sub.status || (sub.score !== null ? 'Graded' : 'Pending')).toLowerCase()} />
                  </TableCell>
                  <TableCell className="text-center font-bold text-xs text-slate-900 dark:text-white">
                    {sub.score !== null && sub.score !== undefined ? (
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-black font-mono">
                        {sub.score} / 100
                      </span>
                    ) : (
                      <span className="text-slate-400 font-mono">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <button
                      onClick={() => handleOpenGradeModal(sub)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 border border-blue-200 dark:border-blue-800 transition cursor-pointer"
                    >
                      {sub.score !== null && sub.score !== undefined ? (isKm ? 'កែពិន្ទុ' : 'Edit Grade') : (isKm ? 'ដាក់ពិន្ទុ' : 'Grade')}
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* ── View QCM Student Answers Modal ──────────────────────── */}
      {viewingQcmSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl max-h-[85vh] flex flex-col bg-white dark:bg-[#15171e] rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-white/[0.1]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/[0.06] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Sparkle size={20} weight="fill" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {isKm ? 'ចម្លើយសំណួរ QCM របស់សិស្ស' : 'Student QCM Answers Breakdown'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {viewingQcmSub.student_name} ({viewingQcmSub.student_code}) • {isKm ? 'ពិន្ទុ:' : 'Score:'} <span className="font-bold text-purple-600">{viewingQcmSub.score}/100</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingQcmSub(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {viewingQcmSub.qcm_answers && viewingQcmSub.qcm_answers.length > 0 ? (
                viewingQcmSub.qcm_answers.map((ans, idx) => (
                  <div key={ans.question_id || idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center text-[11px] font-bold shrink-0">
                          {idx + 1}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white pt-0.5">
                          {ans.question_text}
                        </h4>
                      </div>
                      {ans.is_correct ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md shrink-0">
                          <Check size={12} weight="bold" /> {isKm ? 'ត្រឹមត្រូវ' : 'Correct'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-md shrink-0">
                          <XCircle size={12} weight="bold" /> {isKm ? 'ខុស' : 'Wrong'}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1.5 pl-7">
                      {ans.choices.map((choice, cIdx) => {
                        const isStudentChoice = ans.chosen_answer === cIdx;
                        const isCorrectChoice = ans.correct_answer === cIdx;
                        const letter = String.fromCharCode(65 + cIdx);

                        let badgeStyle = 'bg-white dark:bg-[#1c1d25] border-slate-200/80 dark:border-white/[0.06] text-slate-700 dark:text-slate-300';
                        if (isCorrectChoice) {
                          badgeStyle = 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 font-semibold';
                        } else if (isStudentChoice && !ans.is_correct) {
                          badgeStyle = 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-700 text-rose-800 dark:text-rose-300 font-semibold';
                        }

                        return (
                          <div key={cIdx} className={`flex items-center justify-between p-2.5 rounded-xl border text-xs ${badgeStyle}`}>
                            <div className="flex items-center gap-2">
                              <span className="font-bold">{letter}.</span>
                              <span>{choice}</span>
                            </div>
                            <div className="flex items-center gap-1 text-[10px]">
                              {isStudentChoice && (
                                <span className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold">
                                  {isKm ? 'ចម្លើយសិស្ស' : 'Student Choice'}
                                </span>
                              )}
                              {isCorrectChoice && (
                                <span className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold">
                                  {isKm ? 'ចម្លើយត្រឹមត្រូវ ✓' : 'Correct ✓'}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400 text-xs">
                  {isKm ? 'គ្មានទិន្នន័យចម្លើយលម្អិត' : 'No breakdown data available'}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-white/[0.06] flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setViewingQcmSub(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-white/[0.08] text-slate-700 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
              >
                {isKm ? 'បិទ' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grade Submission Modal */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white dark:bg-[#15171e] rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-white/[0.1]">
            <button
              onClick={() => setSelectedSub(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-2xl bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                <Trophy size={22} weight="fill" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {isKm ? 'ដាក់ពិន្ទុកិច្ចការសិស្ស' : 'Grade Student Submission'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {selectedSub.student_name} ({selectedSub.student_code})
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveGrade} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isKm ? 'ពិន្ទុ (/100)' : 'Score (/100)'} *
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  required
                  value={gradeScore}
                  onChange={(e) => setGradeScore(e.target.value)}
                  className="w-full px-3.5 py-2 text-center text-lg font-black rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#1c1d25] text-blue-600 dark:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isKm ? 'មតិកែលម្អរបស់គ្រូ (Teacher Feedback)' : 'Teacher Feedback'}
                </label>
                <textarea
                  rows={3}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder={isKm ? 'ផ្ដល់យោបល់ និងការលើកទឹកចិត្តដល់សិស្ស...' : 'Enter feedback for student...'}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#1c1d25] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setSelectedSub(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
                >
                  {isKm ? 'បោះបង់' : 'Cancel'}
                </button>
                <Button
                  type="submit"
                  disabled={grading}
                  className="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs cursor-pointer"
                >
                  {grading ? (isKm ? 'កំពុងរក្សាទុក...' : 'Saving...') : (isKm ? 'រក្សាទុកពិន្ទុ' : 'Save Grade')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

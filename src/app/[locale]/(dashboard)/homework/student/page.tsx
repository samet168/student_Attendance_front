'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  BookOpen, Clock, CheckCircle, ListChecks, FileText, UploadSimple,
  X, WarningCircle, SpinnerGap, ArrowLeft, Trophy, SealCheck,
  Smiley, SmileyMeh, SmileySad, ArrowRight,
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface QCMQuestion {
  id: number;
  homework_id: number;
  question_text: string;
  choices: string[];
  order_index: number;
}

interface AnswerResultItem {
  question_id: number;
  question_text: string;
  choices: string[];
  chosen_answer: number;
  correct_answer: number;
  is_correct: boolean;
}

interface QCMResult {
  submission_id: number;
  homework_id: number;
  total_questions: number;
  correct_count: number;
  score: number;
  submitted_at?: string;
  answers: AnswerResultItem[];
}

interface HomeworkItem {
  id: number;
  title: string;
  subject: string;
  description?: string;
  deadline: string;
  file_url?: string;
  file_name?: string;
  is_qcm: boolean;
  question_count?: number;
  submission_id?: number | null;
  score?: number | null;
  feedback?: string | null;
  teacher_feedback?: string | null;
  submitted_at?: string | null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function scoreEmoji(pct: number) {
  if (pct >= 80) return <Smiley size={20} weight="fill" className="text-emerald-500" />;
  if (pct >= 50) return <SmileyMeh size={20} weight="fill" className="text-amber-500" />;
  return <SmileySad size={20} weight="fill" className="text-rose-500" />;
}

function scoreColor(pct: number) {
  if (pct >= 80) return 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800';
  if (pct >= 50) return 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800';
  return 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800';
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function StudentHomeworkPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'km';
  const isKm = locale === 'km';

  // ── homework list ──────────────────────────────────────────────────────
  const [homeworks, setHomeworks] = useState<HomeworkItem[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [classId, setClassId] = useState<number | null>(null);

  // ── view states ────────────────────────────────────────────────────────
  // 'list' | 'qcm-quiz' | 'qcm-result' | 'file-submit'
  const [view, setView] = useState<'list' | 'qcm-quiz' | 'qcm-result' | 'file-submit'>('list');
  const [activeHw, setActiveHw] = useState<HomeworkItem | null>(null);

  // ── QCM quiz state ─────────────────────────────────────────────────────
  const [questions, setQuestions] = useState<QCMQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({}); // question_id → chosen index
  const [submittingQCM, setSubmittingQCM] = useState(false);
  const [qcmResult, setQcmResult] = useState<QCMResult | null>(null);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  // ── file submit state ──────────────────────────────────────────────────
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [studentNote, setStudentNote] = useState('');
  const [uploading, setUploading] = useState(false);

  // ── feedback ────────────────────────────────────────────────────────────
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // ── load ────────────────────────────────────────────────────────────────

  const showStatus = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const loadHomeworks = useCallback(async (cid: number) => {
    setLoadingList(true);
    setErrorMessage(null);
    try {
      const data = await api.getHomeworks(cid);
      setHomeworks(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error loading homework');
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    // Fetch student dashboard to get class_id
    api.getStudentDashboard().then((dash) => {
      const cid = dash?.class_info?.id ?? dash?.class_id;
      if (cid) {
        setClassId(cid);
        loadHomeworks(cid);
      } else {
        setLoadingList(false);
      }
    }).catch(() => setLoadingList(false));
  }, [loadHomeworks]);

  // ── open QCM quiz ────────────────────────────────────────────────────────

  const openQCMQuiz = async (hw: HomeworkItem) => {
    setActiveHw(hw);
    setAnswers({});
    setErrorMessage(null);

    // If already submitted, show result directly
    if (hw.submission_id) {
      await loadQCMResult(hw);
      return;
    }

    setLoadingQuestions(true);
    setView('qcm-quiz');
    try {
      const qs = await api.getQuestions(hw.id);
      setQuestions(Array.isArray(qs) ? qs : []);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error loading questions');
    } finally {
      setLoadingQuestions(false);
    }
  };

  const loadQCMResult = async (hw: HomeworkItem) => {
    setLoadingQuestions(true);
    setView('qcm-result');
    try {
      const res = await api.getMyQCMResult(hw.id);
      if (res.submitted && res.result) {
        setQcmResult(res.result);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error loading result');
    } finally {
      setLoadingQuestions(false);
    }
  };

  // ── submit QCM ──────────────────────────────────────────────────────────

  const handleSubmitQCM = async (e: React.FormEvent) => {
    e.preventDefault();

    const unanswered = questions.filter((q) => answers[q.id] === undefined);
    if (unanswered.length > 0) {
      setErrorMessage(
        isKm
          ? `សូមឆ្លើយសំណួរទាំង ${unanswered.length} ដែលនៅសល់`
          : `Please answer all ${unanswered.length} remaining questions`
      );
      return;
    }

    setSubmittingQCM(true);
    setErrorMessage(null);
    try {
      const payload = {
        answers: questions.map((q) => ({
          question_id: q.id,
          chosen_answer: answers[q.id],
        })),
      };
      const res = await api.submitQCM(activeHw!.id, payload);
      setQcmResult(res);
      setView('qcm-result');
      showStatus(isKm ? 'បានប្រគល់ QCM ដោយជោគជ័យ! លទ្ធផលបានដាក់ពិន្ទុស្វ័យប្រវត្តិ' : 'QCM submitted! Auto-graded instantly.');
      if (classId) await loadHomeworks(classId);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error submitting answers');
    } finally {
      setSubmittingQCM(false);
    }
  };

  // ── open file submit ────────────────────────────────────────────────────

  const openFileSubmit = (hw: HomeworkItem) => {
    setActiveHw(hw);
    setUploadFile(null);
    setStudentNote('');
    setErrorMessage(null);
    setView('file-submit');
  };

  // ── submit file ─────────────────────────────────────────────────────────

  const handleSubmitFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile || !activeHw) return;

    setUploading(true);
    setErrorMessage(null);
    try {
      const uploaded = await api.uploadFile(uploadFile);
      await api.submitHomework(activeHw.id, {
        file_url: uploaded.file_url,
        file_name: uploaded.file_name,
        student_note: studentNote.trim() || undefined,
      });
      setView('list');
      showStatus(isKm ? 'បានផ្ញើកិច្ចការទៅកាន់លោកគ្រូរួចរាល់!' : 'Homework submitted to teacher!');
      if (classId) await loadHomeworks(classId);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error submitting homework');
    } finally {
      setUploading(false);
    }
  };

  const backToList = () => {
    setView('list');
    setActiveHw(null);
    setQcmResult(null);
    setQuestions([]);
    setErrorMessage(null);
  };

  // ---------------------------------------------------------------------------
  // Render helpers
  // ---------------------------------------------------------------------------

  const renderBanners = () => (
    <>
      {statusMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle size={18} weight="fill" className="text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <WarningCircle size={18} weight="fill" className="text-rose-600 dark:text-rose-400 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)}><X size={14} /></button>
        </div>
      )}
    </>
  );

  // ---------------------------------------------------------------------------
  // VIEW: List
  // ---------------------------------------------------------------------------

  if (view === 'list') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            {isKm ? 'កិច្ចការផ្ទះរបស់ខ្ញុំ' : 'My Homework'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isKm
              ? 'ឆ្លើយ QCM ឬ ផ្ញើឯកសារកិច្ចការទៅលោកគ្រូ'
              : 'Answer QCM quizzes or submit file assignments to your teacher'}
          </p>
        </div>

        {renderBanners()}

        {loadingList ? (
          <div className="flex flex-col items-center justify-center py-16">
            <SpinnerGap size={28} className="animate-spin text-blue-600 mb-2" />
            <p className="text-xs text-slate-400">{isKm ? 'កំពុងទាញ...' : 'Loading...'}</p>
          </div>
        ) : homeworks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 p-12 text-center flex flex-col items-center">
            <BookOpen size={32} className="text-slate-300 mb-3" />
            <p className="text-sm font-bold text-slate-700 dark:text-white">
              {isKm ? 'មិនទាន់មានកិច្ចការ' : 'No homework yet'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {isKm ? 'គ្រូមិនទាន់ដាក់កិច្ចការ' : 'Your teacher hasn\'t assigned anything yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {homeworks.map((hw) => {
              const isSubmitted = !!hw.submission_id;
              const isGraded = hw.score !== null && hw.score !== undefined;
              const isPast = new Date(hw.deadline) < new Date();

              return (
                <div
                  key={hw.id}
                  className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs hover:shadow-md transition"
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        {hw.subject}
                      </span>
                      {hw.is_qcm && (
                        <span className="px-2 py-1 rounded-full text-[11px] font-semibold bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800 flex items-center gap-1">
                          <ListChecks size={11} weight="bold" />
                          QCM
                        </span>
                      )}
                    </div>
                    <span className={`text-[11px] flex items-center gap-1 flex-shrink-0 ${isPast ? 'text-rose-500' : 'text-amber-600 dark:text-amber-400'}`}>
                      <Clock size={13} />
                      {new Date(hw.deadline).toLocaleDateString(isKm ? 'km-KH' : 'en-US', { day: '2-digit', month: 'short' })}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white leading-snug">{hw.title}</h3>

                  {hw.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2">{hw.description}</p>
                  )}

                  {/* Teacher file attachment */}
                  {hw.file_url && (
                    <a
                      href={hw.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <FileText size={13} />
                      {hw.file_name || (isKm ? 'ឯកសាររបស់គ្រូ' : 'Teacher material')}
                    </a>
                  )}

                  {hw.is_qcm && (
                    <p className="mt-2 text-[11px] text-violet-600 dark:text-violet-400 flex items-center gap-1">
                      <ListChecks size={13} />
                      {hw.question_count ?? 0} {isKm ? 'សំណួរ' : 'questions'}
                    </p>
                  )}

                  {/* Bottom row: status + action */}
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      {isSubmitted ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-full">
                          <CheckCircle size={12} weight="fill" />
                          {isKm ? 'បានប្រគល់' : 'Submitted'}
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2.5 py-1 rounded-full border border-rose-200 dark:border-rose-800">
                          {isKm ? 'មិនទាន់ប្រគល់' : 'Not submitted'}
                        </span>
                      )}
                      {isGraded && (
                        <span className={`text-[11px] font-black px-2.5 py-1 rounded-full border ${scoreColor(hw.score!)}`}>
                          {hw.score} / 100
                        </span>
                      )}
                    </div>

                    {/* CTA button */}
                    {hw.is_qcm ? (
                      <button
                        onClick={() => openQCMQuiz(hw)}
                        className={`inline-flex items-center gap-1 text-xs font-bold px-3.5 py-2 rounded-xl transition cursor-pointer ${
                          isSubmitted
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                            : 'bg-violet-600 hover:bg-violet-700 text-white shadow-xs'
                        }`}
                      >
                        <ListChecks size={14} weight="bold" />
                        {isSubmitted
                          ? (isKm ? 'មើលលទ្ធផល' : 'View Result')
                          : (isKm ? 'ចាប់ផ្ដើមធ្វើ QCM' : 'Start Quiz')}
                      </button>
                    ) : (
                      <button
                        onClick={() => openFileSubmit(hw)}
                        className={`inline-flex items-center gap-1 text-xs font-bold px-3.5 py-2 rounded-xl transition cursor-pointer ${
                          isSubmitted
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                        }`}
                      >
                        <UploadSimple size={14} weight="bold" />
                        {isSubmitted
                          ? (isKm ? 'ផ្ញើឡើងវិញ' : 'Resubmit')
                          : (isKm ? 'ផ្ញើកិច្ចការ' : 'Submit')}
                      </button>
                    )}
                  </div>

                  {/* Teacher feedback */}
                  {isGraded && (hw.feedback || hw.teacher_feedback) && (
                    <div className="mt-3 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900">
                      <p className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 mb-0.5">
                        💬 {isKm ? 'មតិរបស់គ្រូ:' : 'Teacher feedback:'}
                      </p>
                      <p className="text-xs text-indigo-900 dark:text-indigo-200 italic">
                        "{hw.teacher_feedback || hw.feedback}"
                      </p>
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

  // ---------------------------------------------------------------------------
  // VIEW: QCM Quiz
  // ---------------------------------------------------------------------------

  if (view === 'qcm-quiz') {
    const answeredCount = Object.keys(answers).length;
    const progress = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

    return (
      <div className="space-y-6">
        {/* Back + header */}
        <div className="flex items-center gap-3">
          <button
            onClick={backToList}
            className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base font-bold text-slate-900 dark:text-white truncate">
                {activeHw?.title}
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-100 dark:bg-violet-900/60 text-violet-700 dark:text-violet-300">
                QCM
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {activeHw?.subject} • {answeredCount}/{questions.length} {isKm ? 'ចម្លើយ' : 'answered'}
            </p>
          </div>
        </div>

        {renderBanners()}

        {/* Progress bar */}
        {questions.length > 0 && (
          <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-violet-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {loadingQuestions ? (
          <div className="flex flex-col items-center justify-center py-16">
            <SpinnerGap size={28} className="animate-spin text-violet-600 mb-2" />
            <p className="text-xs text-slate-400">{isKm ? 'កំពុងទាញសំណួរ...' : 'Loading questions...'}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmitQCM} className="space-y-5">
            {questions.map((q, qi) => (
              <div
                key={q.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-xs"
              >
                <p className="text-xs font-bold text-violet-700 dark:text-violet-300 mb-2">
                  {isKm ? `សំណួរទី ${qi + 1}` : `Question ${qi + 1}`}
                </p>
                <p className="text-sm font-semibold text-slate-800 dark:text-white mb-4 leading-relaxed">
                  {q.question_text}
                </p>

                <div className="space-y-2">
                  {q.choices.map((choice, ci) => {
                    const isSelected = answers[q.id] === ci;
                    return (
                      <label
                        key={ci}
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                          isSelected
                            ? 'border-violet-400 dark:border-violet-500 bg-violet-50 dark:bg-violet-950/40'
                            : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-violet-300 dark:hover:border-violet-600 hover:bg-violet-50/50 dark:hover:bg-violet-950/20'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`q-${q.id}`}
                          value={ci}
                          checked={isSelected}
                          onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: ci }))}
                          className="accent-violet-600 cursor-pointer flex-shrink-0"
                        />
                        <span className={`text-xs ${isSelected ? 'font-semibold text-violet-800 dark:text-violet-200' : 'text-slate-700 dark:text-slate-300'}`}>
                          <span className="font-bold mr-1.5 text-slate-400 dark:text-slate-500">
                            {String.fromCharCode(65 + ci)}.
                          </span>
                          {choice}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Submit button */}
            {questions.length > 0 && (
              <div className="sticky bottom-4">
                <Button
                  type="submit"
                  disabled={submittingQCM || answeredCount < questions.length}
                  className="w-full py-3 text-sm font-bold bg-violet-600 hover:bg-violet-700 text-white rounded-2xl shadow-lg shadow-violet-500/20 cursor-pointer disabled:opacity-60"
                >
                  {submittingQCM
                    ? (isKm ? 'កំពុងផ្ញើ...' : 'Submitting...')
                    : answeredCount < questions.length
                      ? (isKm ? `នៅខ្វះ ${questions.length - answeredCount} ចម្លើយ` : `${questions.length - answeredCount} unanswered`)
                      : (isKm ? 'ផ្ញើ QCM & មើលពិន្ទុ' : 'Submit Quiz & See Score')}
                </Button>
              </div>
            )}
          </form>
        )}
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // VIEW: QCM Result
  // ---------------------------------------------------------------------------

  if (view === 'qcm-result') {
    return (
      <div className="space-y-6">
        {/* Back */}
        <div className="flex items-center gap-3">
          <button
            onClick={backToList}
            className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-base font-bold text-slate-900 dark:text-white">
              {isKm ? 'លទ្ធផល QCM' : 'QCM Result'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">{activeHw?.title}</p>
          </div>
        </div>

        {renderBanners()}

        {loadingQuestions ? (
          <div className="flex flex-col items-center justify-center py-16">
            <SpinnerGap size={28} className="animate-spin text-violet-600 mb-2" />
          </div>
        ) : qcmResult ? (
          <>
            {/* Score card */}
            <div className={`rounded-2xl border p-6 text-center ${scoreColor(qcmResult.score)}`}>
              <div className="flex items-center justify-center gap-2 mb-2">
                {scoreEmoji(qcmResult.score)}
                <span className="text-3xl font-black">{qcmResult.score}%</span>
              </div>
              <p className="text-sm font-bold">
                {qcmResult.correct_count} / {qcmResult.total_questions} {isKm ? 'ចម្លើយត្រឹមត្រូវ' : 'correct answers'}
              </p>
              {qcmResult.score >= 80 && (
                <p className="text-xs mt-1 opacity-80">
                  {isKm ? '🎉 ធ្វើបានល្អណាស់!' : '🎉 Excellent work!'}
                </p>
              )}
            </div>

            {/* Per-question breakdown */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-slate-800 dark:text-white">
                {isKm ? 'ការវិភាគតាមមួយសំណួរ' : 'Question Breakdown'}
              </h2>
              {qcmResult.answers.map((a, idx) => (
                <div
                  key={a.question_id}
                  className={`rounded-2xl border p-4 ${a.is_correct ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20' : 'border-rose-200 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/20'}`}
                >
                  <div className="flex items-start gap-2 mb-3">
                    {a.is_correct
                      ? <SealCheck size={18} weight="fill" className="text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                      : <X size={18} weight="bold" className="text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />}
                    <div>
                      <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-0.5">
                        {isKm ? `សំណួរទី ${idx + 1}` : `Question ${idx + 1}`}
                      </p>
                      <p className="text-xs font-semibold text-slate-800 dark:text-white leading-relaxed">
                        {a.question_text}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5 ml-6">
                    {a.choices.map((choice, ci) => {
                      const isChosen = a.chosen_answer === ci;
                      const isCorrect = a.correct_answer === ci;
                      return (
                        <div
                          key={ci}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs ${
                            isCorrect
                              ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 font-semibold'
                              : isChosen
                                ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-800 dark:text-rose-200 line-through'
                                : 'text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          <span className="font-bold text-slate-400 flex-shrink-0">
                            {String.fromCharCode(65 + ci)}.
                          </span>
                          <span className="flex-1">{choice}</span>
                          {isCorrect && <SealCheck size={14} weight="fill" className="text-emerald-600 dark:text-emerald-400 flex-shrink-0" />}
                          {isChosen && !isCorrect && <X size={14} weight="bold" className="text-rose-600 dark:text-rose-400 flex-shrink-0" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={backToList}
              className="w-full py-3 text-xs font-bold text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              ← {isKm ? 'ត្រឡប់ទៅបញ្ជីកិច្ចការ' : 'Back to homework list'}
            </button>
          </>
        ) : (
          <p className="text-xs text-slate-400 text-center py-8">
            {isKm ? 'មិនមានទិន្នន័យ' : 'No result data'}
          </p>
        )}
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // VIEW: File Submit
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* Back */}
      <div className="flex items-center gap-3">
        <button
          onClick={backToList}
          className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-base font-bold text-slate-900 dark:text-white">
            {isKm ? 'ផ្ញើកិច្ចការ' : 'Submit Homework'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">{activeHw?.title}</p>
        </div>
      </div>

      {renderBanners()}

      {/* Teacher file reference */}
      {activeHw?.file_url && (
        <div className="rounded-2xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 p-4 flex items-center gap-3">
          <FileText size={22} className="text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <div>
            <p className="text-xs font-bold text-blue-800 dark:text-blue-200">
              {isKm ? 'ឯកសារពីគ្រូ:' : 'Teacher material:'}
            </p>
            <a href={activeHw.file_url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
              {activeHw.file_name || (isKm ? 'ទាញយក' : 'Download')}
            </a>
          </div>
        </div>
      )}

      {/* Description */}
      {activeHw?.description && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
          <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
            {isKm ? 'ការណែនាំ:' : 'Instructions:'}
          </p>
          <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">{activeHw.description}</p>
        </div>
      )}

      {/* Upload form */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
        <form onSubmit={handleSubmitFile} className="space-y-4">
          {/* File picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              {isKm ? 'ជ្រើសរើសឯកសារ (PDF, Word, រូបភាព)' : 'Choose file (PDF, Word, Image)'} *
            </label>
            <label className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-dashed cursor-pointer transition ${uploadFile ? 'border-blue-400 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-950/20' : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50/30 dark:hover:bg-blue-950/10'}`}>
              <UploadSimple size={28} className={uploadFile ? 'text-blue-500' : 'text-slate-400'} />
              <span className="text-xs text-slate-500 dark:text-slate-400 text-center">
                {uploadFile
                  ? uploadFile.name
                  : (isKm ? 'ចុចដើម្បីជ្រើស ឬ ទម្លាក់ File នៅទីនេះ' : 'Click to choose or drop file here')}
              </span>
              <input
                type="file"
                required
                className="hidden"
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.xlsx,.pptx"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              />
            </label>
          </div>

          {/* Student note */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              {isKm ? 'ចំណាំបន្ថែមទៅគ្រូ (ជម្រើស)' : 'Note to teacher (optional)'}
            </label>
            <textarea
              rows={3}
              value={studentNote}
              onChange={(e) => setStudentNote(e.target.value)}
              placeholder={isKm ? 'ចំណាំ ឬ សំណួរ...' : 'Notes or questions for your teacher...'}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={backToList}
              className="flex-1 py-2.5 text-xs font-semibold border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              {isKm ? 'បោះបង់' : 'Cancel'}
            </button>
            <Button
              type="submit"
              disabled={uploading || !uploadFile}
              className="flex-1 py-2.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl cursor-pointer disabled:opacity-60"
            >
              {uploading
                ? (isKm ? 'កំពុង Upload...' : 'Uploading...')
                : (isKm ? 'ផ្ញើទៅគ្រូ' : 'Send to Teacher')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

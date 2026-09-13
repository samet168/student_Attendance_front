'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import {
  BookOpen, Upload, FileText, CheckCircle, Clock, ArrowSquareOut,
  PaperPlaneTilt, SpinnerGap, X, ArrowClockwise, ChatText, WarningCircle,
  DownloadSimple, ListNumbers, Check, Sparkle, Trophy
} from '@phosphor-icons/react';
import { SkeletonList } from '@/components/ui/skeleton';

interface QCMQuestion {
  id: number;
  homework_id: number;
  question_text: string;
  choices: string[];
  order_index: number;
}

export default function StudentHomeworkPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'km';
  const isKm = locale === 'km';

  const [homeworks, setHomeworks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dashData, setDashData] = useState<any>(null);

  const [submittingHw, setSubmittingHw] = useState<any | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [studentNote, setStudentNote] = useState('');
  const [uploading, setUploading] = useState(false);

  const [activeQcmHw, setActiveQcmHw] = useState<any | null>(null);
  const [qcmQuestions, setQcmQuestions] = useState<QCMQuestion[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [qcmLoading, setQcmLoading] = useState(false);
  const [qcmSubmitting, setQcmSubmitting] = useState(false);
  const [qcmResult, setQcmResult] = useState<any | null>(null);

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [dash, hw] = await Promise.allSettled([
        api.getStudentDashboard(),
        api.getStudentHomework(),
      ]);
      if (dash.status === 'fulfilled') setDashData(dash.value);
      if (hw.status === 'fulfilled') setHomeworks(Array.isArray(hw.value) ? hw.value : []);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error loading homework data');
      setHomeworks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleFileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingHw || !uploadFile) return;
    setUploading(true);
    setErrorMsg(null);
    try {
      const uploadRes = await api.uploadFile(uploadFile);
      await api.submitHomework(submittingHw.id, {
        file_url: uploadRes.file_url,
        file_name: uploadRes.file_name,
        student_note: studentNote,
      });
      setSubmittingHw(null);
      setUploadFile(null);
      setStudentNote('');
      setSuccessMsg(isKm ? 'បានផ្ញើកិច្ចការទៅកាន់លោកគ្រូដោយជោគជ័យ!' : 'Homework submitted successfully!');
      setTimeout(() => setSuccessMsg(null), 4000);
      await load();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : (isKm ? 'មានបញ្ហាក្នុងការផ្ញើកិច្ចការ' : 'Error submitting homework'));
    } finally {
      setUploading(false);
    }
  };

  const handleOpenQcm = async (hw: any) => {
    setActiveQcmHw(hw);
    setQcmLoading(true);
    setErrorMsg(null);
    setQcmResult(null);
    setSelectedAnswers({});
    try {
      const questions = await api.getQuestions(hw.id);
      setQcmQuestions(Array.isArray(questions) ? questions : []);
      if (hw.status === 'submitted' || hw.submission) {
        try {
          const res = await api.getMyQCMResult(hw.id);
          setQcmResult(res);
        } catch { /* ignore */ }
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : (isKm ? 'មិនអាចទាញយកសំណួរ QCM បានទេ' : 'Failed to load QCM questions'));
    } finally {
      setQcmLoading(false);
    }
  };

  const handleSelectChoice = (questionId: number, choiceIdx: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: choiceIdx }));
  };

  const handleQcmSubmit = async () => {
    if (!activeQcmHw) return;
    const answeredCount = Object.keys(selectedAnswers).length;
    if (answeredCount < qcmQuestions.length) {
      if (!confirm(isKm ? `អ្នកបានឆ្លើយតែ ${answeredCount}/${qcmQuestions.length} សំណួរទេ។ ផ្ញើ?` : `You have answered ${answeredCount}/${qcmQuestions.length} questions. Submit anyway?`)) return;
    }
    setQcmSubmitting(true);
    setErrorMsg(null);
    try {
      const payloadAnswers = Object.entries(selectedAnswers).map(([qId, choiceIdx]) => ({
        question_id: Number(qId),
        chosen_answer: choiceIdx,
      }));
      const res = await api.submitQCM(activeQcmHw.id, { answers: payloadAnswers, student_note: studentNote });
      setQcmResult(res);
      setSuccessMsg(isKm ? `បានផ្ញើចម្លើយ QCM! ពិន្ទុ: ${res.score}/100` : `QCM submitted! Score: ${res.score}/100`);
      setTimeout(() => setSuccessMsg(null), 5000);
      await load();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : (isKm ? 'មានបញ្ហាក្នុងការផ្ញើ QCM' : 'Error submitting QCM'));
    } finally {
      setQcmSubmitting(false);
    }
  };

  const statusBadge = (hw: any) => {
    if (hw.status === 'submitted' || hw.submission) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-lg dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20">
          <CheckCircle size={11} weight="fill" /> {isKm ? 'បានផ្ញើ' : 'Submitted'}
        </span>
      );
    }
    if (hw.status === 'late') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-lg dark:text-rose-400 dark:bg-rose-500/10 dark:border-rose-500/20">
          <Clock size={11} weight="fill" /> {isKm ? 'ហួសកំណត់' : 'Late'}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-lg dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/20">
        <Clock size={11} weight="fill" /> {isKm ? 'រង់ចាំ' : 'Pending'}
      </span>
    );
  };

  const pending = homeworks.filter((h) => !h.submission && h.status !== 'submitted').length;
  const submitted = homeworks.filter((h) => h.submission || h.status === 'submitted').length;

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            {isKm ? 'កិច្ចការផ្ទះ & មេរៀន' : 'Homework & Assignments'}
          </h1>
          <p className="text-xs text-neutral-500 dark:text-slate-500 mt-0.5">
            {isKm ? 'ថ្នាក់: ' : 'Class: '}
            <span className="font-semibold text-blue-600 dark:text-blue-400">
              {dashData?.class_info?.name || (isKm ? 'ថ្នាក់ទី ១០-A' : 'Grade 10-A')}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* Quick stats */}
          {!loading && homeworks.length > 0 && (
            <div className="hidden sm:flex items-center gap-2">
              <div className="px-3 py-1.5 rounded-xl border border-amber-500/20 text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-500/[0.08] text-xs font-bold">
                {pending} {isKm ? 'រង់ចាំ' : 'Pending'}
              </div>
              <div className="px-3 py-1.5 rounded-xl border border-emerald-500/20 text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/[0.08] text-xs font-bold">
                {submitted} {isKm ? 'បានផ្ញើ' : 'Submitted'}
              </div>
            </div>
          )}
          <button
            onClick={load}
            className="p-2 rounded-xl border border-neutral-200 text-neutral-500 hover:text-blue-600 transition cursor-pointer dark:border-white/5 dark:text-slate-500 dark:hover:text-blue-400 dark:bg-white/[0.03]"
            title={isKm ? 'ផ្ទុកឡើងវិញ' : 'Refresh'}
          >
            <ArrowClockwise size={15} />
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-2xl border border-emerald-500/20 text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/[0.08] text-xs flex items-center gap-2">
          <CheckCircle size={16} weight="fill" className="text-emerald-500 shrink-0" />
          <span className="font-medium">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-2xl border border-rose-500/20 text-rose-700 bg-rose-50 dark:text-rose-400 dark:bg-rose-500/[0.08] text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <WarningCircle size={16} weight="fill" className="text-rose-500 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-rose-500 hover:text-rose-700 dark:hover:text-rose-300 cursor-pointer">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Homework List */}
      {loading ? (
        <SkeletonList count={4} withAvatar={false} />
      ) : homeworks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-neutral-500 dark:text-slate-500 rounded-2xl border border-dashed border-neutral-200 bg-white p-8 dark:border-white/5 dark:bg-white/[0.01]">
          <BookOpen size={36} className="mb-2 opacity-20 text-blue-500" />
          <p className="text-xs font-semibold text-neutral-500 dark:text-slate-400">
            {isKm ? 'មិនទាន់មានកិច្ចការសម្រាប់ថ្នាក់របស់អ្នកទេ' : 'No assignments assigned to your class yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {homeworks.map((hw) => {
            const sub = hw.submission;
            const isGraded = sub && sub.score !== null && sub.score !== undefined;
            const isQcm = Boolean(hw.is_qcm);
            const isSubmitted = hw.status === 'submitted' || !!sub;

            return (
              <div
                key={hw.id}
                className={`rounded-2xl p-5 border transition-all space-y-3.5 ${
                  isSubmitted
                    ? 'bg-emerald-50/70 border-emerald-200 hover:border-emerald-300 dark:bg-emerald-500/[0.03] dark:border-emerald-500/15 dark:hover:border-white/10'
                    : 'bg-white border-neutral-200 hover:border-neutral-300 dark:bg-white/[0.025] dark:border-white/[0.07] dark:hover:border-white/10'
                }`}
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                      <span className="inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20">
                        {hw.subject}
                      </span>
                      {isQcm && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20">
                          <Sparkle size={10} weight="fill" />
                          QCM Quiz
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-neutral-900 dark:text-white leading-snug">{hw.title}</h3>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {statusBadge(hw)}
                    <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                      <Clock size={10} />
                      {new Date(hw.deadline).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {hw.description && (
                  <p className="text-xs text-neutral-600 dark:text-slate-400 p-3 rounded-xl border border-neutral-200 bg-neutral-50 dark:border-white/5 dark:bg-white/[0.03] leading-relaxed">
                    {hw.description}
                  </p>
                )}

                {/* Teacher's file attachment */}
                {hw.file_url && (
                  <div className="flex items-center justify-between p-3 rounded-xl border border-blue-500/15 bg-blue-50/70 transition hover:border-blue-500/25 dark:bg-blue-500/[0.06]">
                    <div className="flex items-center gap-2.5 min-w-0 pr-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20">
                        <FileText size={16} weight="bold" />
                      </div>
                      <div className="min-w-0">
                        <span className="block text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                          {isKm ? 'ឯកសារពីលោកគ្រូ' : 'Teacher Material'}
                        </span>
                        <p className="text-xs font-semibold text-neutral-800 dark:text-slate-300 truncate max-w-[200px] sm:max-w-xs">
                          {hw.file_name || (isKm ? 'ឯកសារ.pdf' : 'material.pdf')}
                        </p>
                      </div>
                    </div>
                    <a
                      href={hw.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition shadow-md shadow-blue-900/30 shrink-0 cursor-pointer"
                    >
                      <DownloadSimple size={12} weight="bold" />
                      {isKm ? 'ទាញ / បើក' : 'Download'}
                    </a>
                  </div>
                )}

                {/* Submitted work */}
                {sub && (
                  <div className="p-3.5 rounded-xl border border-emerald-500/15 bg-emerald-50/60 space-y-2 dark:bg-emerald-500/[0.05]">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle size={13} weight="fill" />
                        {isKm ? 'កិច្ចការដែលបានប្រគល់:' : 'Your Submitted Work:'}
                      </span>
                      {sub.submitted_at && (
                        <span className="text-[10px] text-slate-500 font-mono">
                          {typeof sub.submitted_at === 'string' ? sub.submitted_at.slice(0, 16).replace('T', ' ') : ''}
                        </span>
                      )}
                    </div>
                    {sub.file_url && (
                      <a href={sub.file_url} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:underline font-semibold dark:text-blue-400">
                        <DownloadSimple size={12} weight="bold" />
                        {sub.file_name || (isKm ? 'ឯកសារបានផ្ញើ' : 'Submitted File')}
                      </a>
                    )}
                    {sub.student_note && (
                      <p className="text-[11px] text-slate-500 italic">&ldquo;{sub.student_note}&rdquo;</p>
                    )}
                    {isGraded && (
                      <div className="pt-2 border-t border-emerald-500/10 flex flex-col gap-1.5">
                        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg w-fit dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20">
                          {isKm ? 'ពិន្ទុ: ' : 'Grade: '}<span className="text-sm font-black">{sub.score}</span> / 100
                        </div>
                        {sub.feedback && (
                          <div className="flex items-start gap-1.5 text-xs text-blue-800 bg-blue-50 border border-blue-100 p-2.5 rounded-xl dark:text-blue-300 dark:bg-blue-500/8 dark:border-blue-500/15">
                            <ChatText size={14} weight="fill" className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                            <div>
                              <strong className="block text-[10px] uppercase tracking-wider text-blue-600 dark:text-blue-400 font-bold mb-0.5">
                                {isKm ? 'មតិពីលោកគ្រូ' : 'Teacher Feedback'}
                              </strong>
                              {sub.feedback}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end pt-1 border-t border-neutral-200 dark:border-white/5">
                  {isQcm ? (
                    sub ? (
                      <button onClick={() => handleOpenQcm(hw)}
                        className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 dark:bg-purple-500/10 dark:hover:bg-purple-500/20 dark:text-purple-400 dark:border-purple-500/20">
                        <ListNumbers size={14} weight="bold" />
                        {isKm ? 'មើលលទ្ធផល QCM' : 'View QCM Results'}
                      </button>
                    ) : (
                      <button onClick={() => handleOpenQcm(hw)}
                        className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer text-white shadow-lg shadow-purple-900/30"
                        style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
                        <ListNumbers size={14} weight="bold" />
                        {isKm ? 'ធ្វើតេស្ត QCM' : 'Take QCM Quiz'}
                      </button>
                    )
                  ) : sub ? (
                    <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
                      <CheckCircle size={14} weight="fill" />
                      {isKm ? 'បានប្រគល់ (ម្តង)' : 'Submitted'}
                    </div>
                  ) : (
                    <button onClick={() => setSubmittingHw(hw)}
                      className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer text-white shadow-lg shadow-blue-900/30"
                      style={{ background: 'linear-gradient(135deg, #2563eb, #4f46e5)' }}>
                      <PaperPlaneTilt size={13} weight="bold" />
                      {isKm ? 'ផ្ញើកិច្ចការ' : 'Submit Homework'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── File Submit Modal ──────────────────────────────────── */}
      {submittingHw && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative rounded-3xl w-full max-w-md p-6 shadow-2xl border border-neutral-200 bg-white dark:border-white/10 dark:bg-[#12141f]">
            <button onClick={() => setSubmittingHw(null)} className="absolute top-4 right-4 text-neutral-500 hover:text-neutral-900 cursor-pointer transition dark:text-slate-500 dark:hover:text-white">
              <X size={18} />
            </button>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400">
                <PaperPlaneTilt size={20} weight="bold" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white">{isKm ? 'ផ្ញើកិច្ចការ' : 'Submit Homework'}</h3>
                <p className="text-xs text-neutral-500 dark:text-slate-500">{submittingHw.title}</p>
              </div>
            </div>

            <form onSubmit={handleFileSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-600 dark:text-slate-400 mb-2">
                  {isKm ? 'ជ្រើសរើស File កិច្ចការ' : 'Select Homework File'} *
                </label>
                <div className="border-2 border-dashed border-neutral-300 rounded-2xl p-5 text-center hover:border-blue-500/30 transition cursor-pointer bg-neutral-50 dark:bg-white/[0.02] dark:border-white/10">
                  <Upload size={24} className="text-blue-600 dark:text-blue-400 mx-auto mb-1.5" />
                  <input
                    type="file"
                    required
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    className="w-full text-xs text-neutral-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 cursor-pointer dark:text-slate-400 dark:file:bg-blue-500/10 dark:file:text-blue-400 dark:hover:file:bg-blue-500/20"
                  />
                  <p className="text-[10px] text-neutral-400 mt-1.5 dark:text-slate-600">{isKm ? 'PDF, JPG, PNG, DOCX, XLSX' : 'Supports: PDF, JPG, PNG, DOCX, XLSX'}</p>
                </div>
                {uploadFile && (
                  <p className="text-[11px] text-blue-600 font-semibold mt-1.5 ml-1 dark:text-blue-400">✓ {uploadFile.name}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-600 dark:text-slate-400 mb-1.5">
                  {isKm ? 'ចំណាំបន្ថែម (ជម្រើស)' : 'Note to Teacher (Optional)'}
                </label>
                <textarea
                  rows={2}
                  value={studentNote}
                  onChange={(e) => setStudentNote(e.target.value)}
                  placeholder={isKm ? 'សរសេរចំណាំ...' : 'Add a note if needed...'}
                  className="w-full px-3.5 py-2 rounded-xl text-xs text-neutral-900 bg-neutral-50 border border-neutral-300 outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 resize-none transition dark:text-white dark:bg-white/[0.05] dark:border-white/8"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-neutral-200 dark:border-white/6">
                <button type="button" onClick={() => setSubmittingHw(null)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold border border-neutral-300 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition cursor-pointer dark:border-white/8 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5">
                  {isKm ? 'បោះបង់' : 'Cancel'}
                </button>
                <button type="submit" disabled={uploading || !uploadFile}
                  className="flex-1 py-2.5 rounded-xl text-white text-xs font-bold disabled:opacity-50 transition cursor-pointer shadow-lg shadow-blue-900/30"
                  style={{ background: 'linear-gradient(135deg, #2563eb, #4f46e5)' }}>
                  {uploading ? (isKm ? 'Upload...' : 'Uploading...') : (isKm ? 'ផ្ញើ' : 'Submit Now')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── QCM Modal ──────────────────────────────────────────── */}
      {activeQcmHw && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col p-6 shadow-2xl border border-neutral-200 bg-white dark:border-white/10 dark:bg-[#12141f]">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200 shrink-0 dark:border-white/6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center dark:bg-purple-500/10 dark:border-purple-500/20 dark:text-purple-400">
                  <Sparkle size={20} weight="fill" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white">{activeQcmHw.title}</h3>
                  <p className="text-xs text-neutral-500 dark:text-slate-500">{isKm ? 'តេស្តពហុជ្រើសរើស (QCM)' : 'Multiple Choice Quiz'}</p>
                </div>
              </div>
              <button onClick={() => setActiveQcmHw(null)} className="p-1.5 text-neutral-500 hover:text-neutral-900 rounded-lg cursor-pointer transition dark:text-slate-500 dark:hover:text-white">
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto py-4 space-y-6">
              {qcmLoading ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                  <SpinnerGap size={28} className="animate-spin text-purple-500 mb-2" />
                  <p className="text-xs">{isKm ? 'កំពុងទាញ...' : 'Loading...'}</p>
                </div>
              ) : qcmResult ? (
                /* QCM Result */
                <div className="space-y-4">
                  <div className="p-6 rounded-2xl text-center space-y-3 border border-purple-500/15"
                    style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(168,85,247,0.05))' }}>
                    <Trophy size={40} weight="fill" className="text-amber-400 mx-auto" />
                    <h4 className="text-base font-black text-neutral-900 dark:text-white">{isKm ? 'លទ្ធផល QCM' : 'QCM Results'}</h4>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-4xl font-black text-purple-600 font-mono dark:text-purple-400">{qcmResult.score}</span>
                      <span className="text-base font-bold text-slate-500">/ 100</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      {isKm
                        ? `ឆ្លើយត្រូវ ${qcmResult.correct_count} / ${qcmResult.total_questions} (${qcmResult.percentage}%)`
                        : `Correct: ${qcmResult.correct_count} / ${qcmResult.total_questions} (${qcmResult.percentage}%)`}
                    </p>
                  </div>
                  <button onClick={() => setActiveQcmHw(null)}
                    className="w-full px-5 py-2.5 rounded-xl text-white text-xs font-bold cursor-pointer shadow-lg shadow-purple-900/30"
                    style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
                    {isKm ? 'បិទ' : 'Close'}
                  </button>
                </div>
              ) : qcmQuestions.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  {isKm ? 'មិនទាន់មានសំណួរ' : 'No questions added yet.'}
                </div>
              ) : (
                qcmQuestions.map((q, qIdx) => (
                  <div key={q.id} className="p-4 rounded-2xl border border-neutral-200 bg-neutral-50 space-y-3 dark:border-white/6 dark:bg-white/[0.03]">
                    <div className="flex items-start gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center text-xs font-bold shrink-0 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20">
                        {qIdx + 1}
                      </span>
                      <h4 className="text-xs font-bold text-neutral-900 dark:text-white pt-0.5 leading-relaxed">{q.question_text}</h4>
                    </div>

                    <div className="space-y-2 pl-8">
                      {q.choices.map((choiceText, cIdx) => {
                        const isChosen = selectedAnswers[q.id] === cIdx;
                        const letter = String.fromCharCode(65 + cIdx);
                        return (
                          <button
                            key={cIdx}
                            type="button"
                            onClick={() => handleSelectChoice(q.id, cIdx)}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl text-left text-xs font-medium transition cursor-pointer border ${
                              isChosen
                                ? 'bg-purple-50 border-purple-500 text-purple-700 ring-1 ring-purple-500/40 dark:bg-purple-500/15 dark:border-purple-500/50 dark:text-purple-300'
                                : 'border-neutral-300 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 dark:border-white/6 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5'
                            }`}
                            style={!isChosen ? { background: 'rgba(255,255,255,0.03)' } : {}}
                          >
                            <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[11px] font-bold shrink-0 ${
                              isChosen ? 'bg-purple-600 text-white' : 'bg-neutral-100 text-neutral-500 dark:bg-white/5 dark:text-slate-500'
                            }`}>
                              {letter}
                            </span>
                            <span className="flex-1">{choiceText}</span>
                            {isChosen && <Check size={13} weight="bold" className="text-purple-600 dark:text-purple-400" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {!qcmResult && qcmQuestions.length > 0 && (
              <div className="pt-4 border-t border-neutral-200 flex items-center justify-between shrink-0 dark:border-white/6">
                <span className="text-xs text-neutral-500 dark:text-slate-500 font-medium">
                  {isKm
                    ? `ឆ្លើយ: ${Object.keys(selectedAnswers).length}/${qcmQuestions.length}`
                    : `Answered: ${Object.keys(selectedAnswers).length}/${qcmQuestions.length}`}
                </span>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setActiveQcmHw(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold border border-neutral-300 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition cursor-pointer dark:border-white/8 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5">
                    {isKm ? 'បោះបង់' : 'Cancel'}
                  </button>
                  <button type="button" disabled={qcmSubmitting} onClick={handleQcmSubmit}
                    className="px-5 py-2 rounded-xl text-white text-xs font-bold cursor-pointer transition disabled:opacity-50 shadow-lg shadow-purple-900/30"
                    style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
                    {qcmSubmitting ? (isKm ? 'ផ្ញើ...' : 'Submitting...') : (isKm ? 'ផ្ញើចម្លើយ' : 'Submit Answers')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

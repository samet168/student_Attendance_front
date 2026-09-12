'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import {
  BookOpen, Upload, FileText, CheckCircle, Clock, ArrowSquareOut,
  PaperPlaneTilt, SpinnerGap, X, ArrowClockwise, ChatText, WarningCircle,
  DownloadSimple, ListNumbers, Check, Sparkle, Trophy
} from '@phosphor-icons/react';

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

  // File Submit modal state
  const [submittingHw, setSubmittingHw] = useState<any | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [studentNote, setStudentNote] = useState('');
  const [uploading, setUploading] = useState(false);

  // QCM Quiz modal state
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
    } catch (err: any) {
      setErrorMsg(err.message || 'Error loading homework data');
      setHomeworks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // ----------------------------------------------------
  // File Upload Submission Handler
  // ----------------------------------------------------
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
    } catch (err: any) {
      setErrorMsg(err.message || (isKm ? 'មានបញ្ហាក្នុងការផ្ញើកិច្ចការ' : 'Error submitting homework'));
    } finally {
      setUploading(false);
    }
  };

  // ----------------------------------------------------
  // QCM Quiz Handlers
  // ----------------------------------------------------
  const handleOpenQcm = async (hw: any) => {
    setActiveQcmHw(hw);
    setQcmLoading(true);
    setErrorMsg(null);
    setQcmResult(null);
    setSelectedAnswers({});
    try {
      const questions = await api.getQuestions(hw.id);
      setQcmQuestions(Array.isArray(questions) ? questions : []);

      // If already submitted, attempt to fetch result
      if (hw.status === 'submitted' || hw.submission) {
        try {
          const res = await api.getMyQCMResult(hw.id);
          setQcmResult(res);
        } catch {
          // ignore
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || (isKm ? 'មិនអាចទាញយកសំណួរ QCM បានទេ' : 'Failed to load QCM questions'));
    } finally {
      setQcmLoading(false);
    }
  };

  const handleSelectChoice = (questionId: number, choiceIdx: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: choiceIdx,
    }));
  };

  const handleQcmSubmit = async () => {
    if (!activeQcmHw) return;
    const answeredCount = Object.keys(selectedAnswers).length;
    if (answeredCount < qcmQuestions.length) {
      if (!confirm(isKm ? `អ្នកបានឆ្លើយតែ ${answeredCount}/${qcmQuestions.length} សំណួរទេ។ តើអ្នកពិតជាចង់ផ្ញើចម្លើយមែនទេ?` : `You have answered ${answeredCount}/${qcmQuestions.length} questions. Submit anyway?`)) {
        return;
      }
    }

    setQcmSubmitting(true);
    setErrorMsg(null);
    try {
      const payloadAnswers = Object.entries(selectedAnswers).map(([qId, choiceIdx]) => ({
        question_id: Number(qId),
        chosen_answer: choiceIdx,
      }));

      const res = await api.submitQCM(activeQcmHw.id, {
        answers: payloadAnswers,
        student_note: studentNote,
      });

      setQcmResult(res);
      setSuccessMsg(isKm ? `បានផ្ញើចម្លើយ QCM ដោយជោគជ័យ! ពិន្ទុរបស់អ្នក៖ ${res.score}/100` : `QCM submitted! Your score: ${res.score}/100`);
      setTimeout(() => setSuccessMsg(null), 5000);
      await load();
    } catch (err: any) {
      setErrorMsg(err.message || (isKm ? 'មានបញ្ហាក្នុងការផ្ញើចម្លើយ QCM' : 'Error submitting QCM'));
    } finally {
      setQcmSubmitting(false);
    }
  };

  const statusBadge = (hw: any) => {
    if (hw.status === 'submitted' || hw.submission) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 rounded-lg">
          <CheckCircle size={12} weight="fill" /> {isKm ? 'បានផ្ញើ' : 'Submitted'}
        </span>
      );
    }
    if (hw.status === 'late') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 px-2.5 py-0.5 rounded-lg">
          <Clock size={12} weight="fill" /> {isKm ? 'ហួសកំណត់' : 'Late'}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-2.5 py-0.5 rounded-lg">
        <Clock size={12} weight="fill" /> {isKm ? 'រង់ចាំ' : 'Pending'}
      </span>
    );
  };

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {isKm ? 'កិច្ចការផ្ទះ & មេរៀន' : 'Homework & Assignments'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isKm ? 'ថ្នាក់: ' : 'Class: '}
            <span className="font-semibold text-blue-600 dark:text-blue-400">
              {dashData?.class_info?.name || (isKm ? 'ថ្នាក់ទី ១០-A' : 'Grade 10-A')}
            </span>
          </p>
        </div>
        <button 
          onClick={load} 
          className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer shadow-2xs"
          title={isKm ? 'ផ្ទុកឡើងវិញ' : 'Refresh'}
        >
          <ArrowClockwise size={15} />
        </button>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2 shadow-xs animate-in fade-in">
          <CheckCircle size={18} weight="fill" className="text-emerald-600 shrink-0" />
          <span className="font-medium">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <WarningCircle size={18} weight="fill" className="text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-rose-500 hover:text-rose-700 cursor-pointer">
            <X size={15} />
          </button>
        </div>
      )}

      {/* Homework List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400 bg-white dark:bg-[#15171e] rounded-2xl border border-slate-200/80 dark:border-white/[0.07]">
          <SpinnerGap size={28} className="animate-spin text-blue-500 mb-2" />
          <p className="text-xs font-medium">{isKm ? 'កំពុងទាញកិច្ចការ...' : 'Loading assignments...'}</p>
        </div>
      ) : homeworks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400 bg-white dark:bg-[#15171e] rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-8">
          <BookOpen size={36} className="mb-2 opacity-30 text-blue-500" />
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            {isKm ? 'មិនទាន់មានកិច្ចការសម្រាប់ថ្នាក់របស់អ្នកទេ' : 'No assignments assigned to your class yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {homeworks.map((hw) => {
            const sub = hw.submission;
            const isGraded = sub && sub.score !== null && sub.score !== undefined;
            const isQcm = Boolean(hw.is_qcm);

            return (
              <div key={hw.id} className="bg-white dark:bg-[#15171e] rounded-2xl p-5 border border-slate-200/80 dark:border-white/[0.07] shadow-xs space-y-3.5 hover:border-slate-300 dark:hover:border-white/[0.15] transition-all">
                {/* Top row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                      <span className="inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
                        {hw.subject}
                      </span>
                      {isQcm && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20">
                          <Sparkle size={11} weight="fill" />
                          <span>QCM Quiz</span>
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">{hw.title}</h3>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {statusBadge(hw)}
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                      <Clock size={11} className="inline mr-0.5" />
                      {new Date(hw.deadline).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {hw.description && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-white/[0.03] p-3 rounded-xl border border-slate-100 dark:border-white/[0.06] leading-relaxed">
                    {hw.description}
                  </p>
                )}

                {/* Teacher's file attachment */}
                {hw.file_url && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 transition hover:border-blue-300 dark:hover:border-blue-800">
                    <div className="flex items-center gap-2.5 min-w-0 pr-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 dark:bg-blue-400/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                        <FileText size={18} weight="bold" />
                      </div>
                      <div className="min-w-0">
                        <span className="block text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                          {isKm ? 'ឯកសារភ្ជាប់ពីលោកគ្រូ' : 'Teacher Material'}
                        </span>
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[280px] sm:max-w-md">
                          {hw.file_name || (isKm ? 'ឯកសារកិច្ចការ.pdf' : 'homework_material.pdf')}
                        </p>
                      </div>
                    </div>
                    <a
                      href={hw.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition shadow-xs shrink-0 cursor-pointer"
                    >
                      <DownloadSimple size={13} weight="bold" />
                      <span>{isKm ? 'ទាញយក / បើកមើល' : 'Download / View'}</span>
                    </a>
                  </div>
                )}

                {/* Student's submitted details */}
                {sub && (
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.06] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <CheckCircle size={14} weight="fill" className="text-emerald-500" />
                        {isKm ? 'កិច្ចការដែលអ្នកបានប្រគល់:' : 'Your Submitted Assignment:'}
                      </span>
                      {sub.submitted_at && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          {typeof sub.submitted_at === 'string' ? sub.submitted_at.slice(0, 16).replace('T', ' ') : ''}
                        </span>
                      )}
                    </div>
                    {sub.file_url && (
                      <a
                        href={sub.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                      >
                        <DownloadSimple size={13} weight="bold" />
                        <span>{sub.file_name || (isKm ? 'ឯកសារដែលបានផ្ញើ' : 'Submitted File')}</span>
                      </a>
                    )}
                    {sub.student_note && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                        &ldquo;{sub.student_note}&rdquo;
                      </p>
                    )}

                    {/* Graded score and feedback */}
                    {isGraded && (
                      <div className="pt-2 border-t border-slate-200 dark:border-white/[0.06] flex flex-col gap-1.5">
                        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800 w-fit">
                          <span>{isKm ? 'ពិន្ទុដែលទទួលបាន: ' : 'Grade Received: '}</span>
                          <span className="text-sm font-black">{sub.score}</span> / 100
                        </div>
                        {sub.feedback && (
                          <div className="flex items-start gap-1.5 text-xs text-blue-900 dark:text-blue-200 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 p-2.5 rounded-xl">
                            <ChatText size={15} weight="fill" className="text-blue-500 shrink-0 mt-0.5" />
                            <div>
                              <strong className="block text-[10px] uppercase tracking-wider text-blue-500 font-bold mb-0.5">
                                {isKm ? 'មតិកែលម្អពីលោកគ្រូ' : 'Teacher Feedback'}
                              </strong>
                              <span>{sub.feedback}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end pt-1 border-t border-slate-100 dark:border-white/[0.06]">
                  {isQcm ? (
                    sub ? (
                      <button
                        onClick={() => handleOpenQcm(hw)}
                        className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer bg-purple-50 dark:bg-purple-500/15 hover:bg-purple-100 dark:hover:bg-purple-500/25 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30"
                      >
                        <ListNumbers size={15} weight="bold" />
                        <span>{isKm ? 'មើលលទ្ធផល QCM' : 'View QCM Results'}</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOpenQcm(hw)}
                        className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-500/20"
                      >
                        <ListNumbers size={15} weight="bold" />
                        <span>{isKm ? 'ធ្វើតេស្ត QCM' : 'Take QCM Quiz'}</span>
                      </button>
                    )
                  ) : sub ? (
                    <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold">
                      <CheckCircle size={15} weight="fill" className="text-emerald-600 dark:text-emerald-400" />
                      <span>{isKm ? 'បានប្រគល់រួចរាល់ (១ លើក)' : 'Submitted (Completed)'}</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSubmittingHw(hw)}
                      className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20"
                    >
                      <PaperPlaneTilt size={14} weight="bold" />
                      <span>{isKm ? 'ផ្ញើកិច្ចការ' : 'Submit Homework'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── File Submit Modal ────────────────────────────────────── */}
      {submittingHw && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative bg-white dark:bg-[#15171e] rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-200 dark:border-white/[0.1]">
            <button onClick={() => setSubmittingHw(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
              <X size={18} />
            </button>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center">
                <PaperPlaneTilt size={20} weight="bold" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{isKm ? 'ផ្ញើកិច្ចការ' : 'Submit Homework'}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{submittingHw.title}</p>
              </div>
            </div>

            <form onSubmit={handleFileSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  {isKm ? 'ជ្រើសរើស File កិច្ចការ' : 'Select Homework File'} *
                </label>
                <div className="border-2 border-dashed border-slate-200 dark:border-white/[0.1] rounded-2xl p-5 text-center hover:bg-slate-50 dark:hover:bg-white/[0.02] transition cursor-pointer">
                  <Upload size={24} className="text-blue-500 mx-auto mb-1.5" />
                  <input
                    type="file"
                    required
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 dark:file:bg-blue-950/50 file:text-blue-700 dark:file:text-blue-400 hover:file:bg-blue-100 cursor-pointer"
                  />
                  <p className="text-[10px] text-slate-400 mt-1.5">{isKm ? 'គាំទ្រ: PDF, JPG, PNG, DOCX, XLSX' : 'Supports: PDF, JPG, PNG, DOCX, XLSX'}</p>
                </div>
                {uploadFile && (
                  <p className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold mt-1.5 ml-1">
                    ✓ {uploadFile.name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isKm ? 'ចំណាំបន្ថែម (ជម្រើស)' : 'Note to Teacher (Optional)'}
                </label>
                <textarea
                  rows={2}
                  value={studentNote}
                  onChange={(e) => setStudentNote(e.target.value)}
                  placeholder={isKm ? 'សរសេរចំណាំបន្ថែមបើមាន...' : 'Add a note if needed...'}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#1c1d25] border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-white/[0.06]">
                <button type="button" onClick={() => setSubmittingHw(null)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition cursor-pointer">
                  {isKm ? 'បោះបង់' : 'Cancel'}
                </button>
                <button type="submit" disabled={uploading || !uploadFile}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs disabled:opacity-50 transition cursor-pointer">
                  {uploading ? (isKm ? 'កំពុង Upload...' : 'Uploading...') : (isKm ? 'ផ្ញើកិច្ចការ' : 'Submit Now')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Interactive QCM Quiz Modal ────────────────────────────── */}
      {activeQcmHw && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative bg-white dark:bg-[#15171e] rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col p-6 shadow-2xl border border-slate-200 dark:border-white/[0.1]">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/[0.06] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Sparkle size={20} weight="fill" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {activeQcmHw.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {isKm ? 'កិច្ចការតេស្តពហុជ្រើសរើស (QCM Quiz)' : 'Multiple Choice Quiz'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveQcmHw(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* QCM Body */}
            <div className="flex-1 overflow-y-auto py-4 space-y-6">
              {qcmLoading ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                  <SpinnerGap size={28} className="animate-spin text-purple-500 mb-2" />
                  <p className="text-xs">{isKm ? 'កំពុងទាញសំណួរ...' : 'Loading quiz questions...'}</p>
                </div>
              ) : qcmResult ? (
                /* QCM Result Summary */
                <div className="space-y-4">
                  <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-blue-500/10 border border-purple-500/20 text-center space-y-2">
                    <Trophy size={40} weight="fill" className="text-amber-400 mx-auto" />
                    <h4 className="text-base font-black text-slate-900 dark:text-white">
                      {isKm ? 'លទ្ធផលនៃការធ្វើតេស្ត QCM' : 'QCM Quiz Results'}
                    </h4>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-3xl font-black text-purple-600 dark:text-purple-400 font-mono">
                        {qcmResult.score}
                      </span>
                      <span className="text-sm font-bold text-slate-400">/ 100</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {isKm
                        ? `អ្នកឆ្លើយត្រូវ ${qcmResult.correct_count} នៃ ${qcmResult.total_questions} សំណួរ (${qcmResult.percentage}%)`
                        : `Correct answers: ${qcmResult.correct_count} / ${qcmResult.total_questions} (${qcmResult.percentage}%)`}
                    </p>
                  </div>

                  <div className="flex flex-col items-center gap-2 pt-2">
                    <p className="text-[11px] text-slate-400">
                      {isKm ? '✓ អ្នកបានបញ្ចប់ការធ្វើតេស្ត QCM នេះរួចរាល់ហើយ (ធ្វើបានតែម្ដង)' : '✓ You have completed this QCM quiz (Single attempt completed)'}
                    </p>
                    <button
                      onClick={() => setActiveQcmHw(null)}
                      className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md cursor-pointer"
                    >
                      {isKm ? 'បិទផ្ទាំងលទ្ធផល' : 'Close Result'}
                    </button>
                  </div>
                </div>
              ) : qcmQuestions.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  {isKm ? 'មិនទាន់មានសំណួរនៅក្នុងកិច្ចការ QCM នេះនៅឡើយទេ' : 'No questions added to this quiz yet.'}
                </div>
              ) : (
                qcmQuestions.map((q, qIdx) => (
                  <div key={q.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] space-y-3">
                    <div className="flex items-start gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center justify-center text-xs font-bold shrink-0">
                        {qIdx + 1}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white pt-0.5 leading-relaxed">
                        {q.question_text}
                      </h4>
                    </div>

                    <div className="space-y-2 pl-8">
                      {q.choices.map((choiceText, cIdx) => {
                        const isChosen = selectedAnswers[q.id] === cIdx;
                        const letter = String.fromCharCode(65 + cIdx); // A, B, C, D

                        return (
                          <button
                            key={cIdx}
                            type="button"
                            onClick={() => handleSelectChoice(q.id, cIdx)}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl text-left text-xs font-medium transition cursor-pointer border ${
                              isChosen
                                ? 'bg-purple-500/15 border-purple-500 text-purple-700 dark:text-purple-300 ring-1 ring-purple-500 shadow-xs'
                                : 'bg-white dark:bg-[#1c1d25] border-slate-200/80 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06]'
                            }`}
                          >
                            <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[11px] font-bold shrink-0 ${
                              isChosen
                                ? 'bg-purple-600 text-white'
                                : 'bg-slate-100 dark:bg-white/[0.08] text-slate-500'
                            }`}>
                              {letter}
                            </span>
                            <span className="flex-1">{choiceText}</span>
                            {isChosen && <Check size={14} weight="bold" className="text-purple-600 dark:text-purple-400" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* QCM Footer Actions */}
            {!qcmResult && qcmQuestions.length > 0 && (
              <div className="pt-4 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between shrink-0">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {isKm
                    ? `បានឆ្លើយ៖ ${Object.keys(selectedAnswers).length}/${qcmQuestions.length}`
                    : `Answered: ${Object.keys(selectedAnswers).length}/${qcmQuestions.length}`}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveQcmHw(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition cursor-pointer"
                  >
                    {isKm ? 'បោះបង់' : 'Cancel'}
                  </button>
                  <button
                    type="button"
                    disabled={qcmSubmitting}
                    onClick={handleQcmSubmit}
                    className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md cursor-pointer transition disabled:opacity-50"
                  >
                    {qcmSubmitting ? (isKm ? 'កំពុងផ្ញើ...' : 'Submitting...') : (isKm ? 'ផ្ញើចម្លើយ QCM' : 'Submit Answers')}
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

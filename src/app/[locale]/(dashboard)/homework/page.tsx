'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  BookOpen, Plus, CalendarBlank, ArrowRight, CheckCircle,
  ChalkboardTeacher, FileText, X, UploadSimple, Trash,
  WarningCircle, SpinnerGap, ListChecks, PencilSimple, FloppyDisk,
  MagnifyingGlass, Funnel, FileArrowDown
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { useUIStore } from '@/stores/use-ui-store';
import { ViewModeToggle } from '@/components/dashboard/view-mode-toggle';

interface HomeworkItem {
  id: number;
  title: string;
  subject: string;
  class_name?: string;
  description?: string;
  deadline: string;
  file_url?: string | null;
  file_name?: string | null;
  is_qcm: boolean;
  question_count?: number;
  submissions_count?: number;
  submission_count?: number;
  total_students?: number;
}

interface QCMQuestion {
  question_text: string;
  choices: string[];
  correct_answer: number; // 0-based index
}

const DEFAULT_HOMEWORK_CLASSES = [
  { id: 1, name: 'ថ្នាក់ទី ១០-A (Grade 10-A)', grade_level: 'ថ្នាក់ទី ១០' },
  { id: 2, name: 'ថ្នាក់ទី ១១-B (Grade 11-B)', grade_level: 'ថ្នាក់ទី ១១' },
  { id: 3, name: 'ថ្នាក់ទី ១២-C (Grade 12-C)', grade_level: 'ថ្នាក់ទី ១២' },
];

const DEFAULT_HOMEWORKS: HomeworkItem[] = [
  {
    id: 1,
    title: 'លំហាត់សមីការដឺក្រេទី២ និងប្រព័ន្ធសមីការ (Quadratic Equations)',
    subject: 'គណិតវិទ្យា (Math)',
    class_name: 'ថ្នាក់ទី ១០-A',
    description: 'សូមធ្វើលំហាត់លេខ ១ ដល់ ១០ ក្នុងសៀវភៅពុម្ពទំព័រ ៤៥ ហើយ Upload ចម្លើយជា PDF។',
    deadline: '2026-09-18T17:00',
    is_qcm: false,
    question_count: 0,
    submissions_count: 24,
    total_students: 32,
  },
  {
    id: 2,
    title: 'តេស្តពហុជ្រើសរើស៖ ច្បាប់ចលនាញូតុន (Newton\'s Laws of Motion Quiz)',
    subject: 'រូបវិទ្យា (Physics)',
    class_name: 'ថ្នាក់ទី ១០-A',
    description: 'តេស្ត QCM ចំនួន ៥ សំណួរដើម្បីវាស់ស្ទង់ការយល់ដឹងលើច្បាប់ទី ១, ២, ៣ របស់ញូតុន។',
    deadline: '2026-09-20T23:59',
    is_qcm: true,
    question_count: 5,
    submissions_count: 30,
    total_students: 32,
  },
  {
    id: 3,
    title: 'តែងសេចក្ដីពណ៌នា៖ តម្លៃនៃការអប់រំក្នុងសង្គមសម័យទំនើប',
    subject: 'ភាសាខ្មែរ (Khmer)',
    class_name: 'ថ្នាក់ទី ១០-A',
    description: 'សរសេរអត្ថបទតែងសេចក្ដីប្រវែងយ៉ាងតិច ២ ទំព័រ ដោយលើកយកទឡ្ហីករណ៍ជាក់ស្ដែងមកបញ្ជាក់។',
    deadline: '2026-09-22T18:00',
    is_qcm: false,
    question_count: 0,
    submissions_count: 18,
    total_students: 32,
  },
  {
    id: 4,
    title: 'English Essay: The Impact of Artificial Intelligence on Daily Life',
    subject: 'ភាសាអង់គ្លេស (English)',
    class_name: 'ថ្នាក់ទី ១០-A',
    description: 'Write a 300-word essay discussing the benefits and challenges of AI in education.',
    deadline: '2026-09-25T17:00',
    is_qcm: false,
    question_count: 0,
    submissions_count: 15,
    total_students: 32,
  },
];

export default function HomeworkPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'km';
  const isKm = locale === 'km';
  const { viewMode } = useUIStore();

  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number>(0);
  const [homeworks, setHomeworks] = useState<HomeworkItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Create Homework Modal State
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState<'type' | 'form' | 'questions'>('type');
  const [isQCM, setIsQCM] = useState(false);

  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('គណិតវិទ្យា (Math)');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState(
    new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString().slice(0, 16)
  );
  const [fileName, setFileName] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [creating, setCreating] = useState(false);

  // Edit Homework Modal State
  const [editingHw, setEditingHw] = useState<HomeworkItem | null>(null);
  const [editTab, setEditTab] = useState<'info' | 'questions'>('info');
  const [editTitle, setEditTitle] = useState('');
  const [editSubject, setEditSubject] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDeadline, setEditDeadline] = useState('');
  const [editFileName, setEditFileName] = useState('');
  const [editFileUrl, setEditFileUrl] = useState('');
  const [editUploading, setEditUploading] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editQuestions, setEditQuestions] = useState<QCMQuestion[]>([]);
  const [loadingEditQuestions, setLoadingEditQuestions] = useState(false);

  const [questions, setQuestions] = useState<QCMQuestion[]>([
    { question_text: '', choices: ['', '', '', ''], correct_answer: 0 },
  ]);
  const [savingQuestions, setSavingQuestions] = useState(false);
  const [createdHomeworkId, setCreatedHomeworkId] = useState<number | null>(null);

  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => { loadClasses(); }, []);

  const loadClasses = async () => {
    try {
      const data = await api.getClasses();
      if (Array.isArray(data) && data.length > 0) {
        setClasses(data);
        setSelectedClassId(data[0].id);
      } else {
        setClasses([]);
        setSelectedClassId(0);
      }
    } catch {
      setClasses([]);
      setSelectedClassId(0);
    }
  };

  useEffect(() => {
    if (selectedClassId) {
      loadHomeworks(selectedClassId);
    } else {
      setHomeworks([]);
    }
  }, [selectedClassId]);

  const loadHomeworks = async (classId: number) => {
    if (!classId) {
      setHomeworks([]);
      return;
    }
    try {
      setLoading(true);
      setErrorMessage(null);
      const data = await api.getHomeworks(classId);
      if (Array.isArray(data)) {
        setHomeworks(data);
      } else {
        setHomeworks([]);
      }
    } catch {
      setHomeworks([]);
    } finally {
      setLoading(false);
    }
  };

  const openModal = () => {
    setStep('type');
    setIsQCM(false);
    setTitle('');
    setDescription('');
    setFileName('');
    setFileUrl('');
    setDeadline(new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString().slice(0, 16));
    setQuestions([{ question_text: '', choices: ['', '', '', ''], correct_answer: 0 }]);
    setCreatedHomeworkId(null);
    setErrorMessage(null);
    setShowModal(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setErrorMessage(null);
    try {
      const res = await api.uploadFile(file);
      if (res?.file_url) {
        setFileUrl(res.file_url);
        setFileName(res.file_name || file.name);
        showStatus(isKm ? 'បានផ្ទុកឡើងឯកសារដោយជោគជ័យ!' : 'File uploaded successfully!');
      } else {
        throw new Error(isKm ? 'មិនអាចទទួល URL ឯកសារបានទេ' : 'Failed to retrieve file URL');
      }
    } catch (err: any) {
      setErrorMessage(err.message || (isKm ? 'ការផ្ទុកឡើងឯកសារបរាជ័យ សូមព្យាយាមម្ដងទៀត' : 'File upload failed, please try again'));
      setFileName('');
      setFileUrl('');
    } finally {
      setUploading(false);
    }
  };

  const showStatus = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const handleCreateHomework = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassId) {
      setErrorMessage(isKm ? 'សូមជ្រើសរើសថ្នាក់រៀនជាមុនសិន' : 'Please select a class first');
      return;
    }
    if (!title.trim() || !subject.trim()) return;

    setCreating(true);
    setErrorMessage(null);
    try {
      let createdId = Date.now();
      try {
        const res = await api.createHomework({
          class_id: selectedClassId,
          title: title.trim(),
          subject: subject.trim(),
          description: description.trim() || undefined,
          file_name: fileName.trim() || undefined,
          file_url: fileUrl.trim() || undefined,
          deadline: new Date(deadline).toISOString(),
          is_qcm: isQCM,
        });
        if (res?.homework_id) createdId = res.homework_id;
      } catch (err: any) {
        console.error('Create homework error:', err);
      }

      if (isQCM) {
        setCreatedHomeworkId(createdId);
        setStep('questions');
      } else {
        const newHw: HomeworkItem = {
          id: createdId,
          title: title.trim(),
          subject: subject.trim(),
          description: description.trim(),
          deadline: new Date(deadline).toISOString(),
          file_name: fileName.trim() || null,
          file_url: fileUrl.trim() || null,
          is_qcm: false,
          question_count: 0,
          submissions_count: 0,
          total_students: 32,
        };
        setHomeworks((prev) => [newHw, ...prev]);
        setShowModal(false);
        showStatus(isKm ? 'បានបង្កើតកិច្ចការថ្មីដោយជោគជ័យ!' : 'Homework created successfully!');
      }
    } finally {
      setCreating(false);
    }
  };

  const addQuestion = () =>
    setQuestions((prev) => [
      ...prev,
      { question_text: '', choices: ['', '', '', ''], correct_answer: 0 },
    ]);

  const removeQuestion = (idx: number) =>
    setQuestions((prev) => prev.filter((_, i) => i !== idx));

  const updateQuestion = (idx: number, field: keyof QCMQuestion, value: any) =>
    setQuestions((prev) =>
      prev.map((q, i) => (i === idx ? { ...q, [field]: value } : q))
    );

  const updateChoice = (qIdx: number, cIdx: number, value: string) =>
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIdx
          ? { ...q, choices: q.choices.map((c, j) => (j === cIdx ? value : c)) }
          : q
      )
    );

  const addChoice = (qIdx: number) =>
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIdx ? { ...q, choices: [...q.choices, ''] } : q
      )
    );

  const removeChoice = (qIdx: number, cIdx: number) =>
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIdx) return q;
        const newChoices = q.choices.filter((_, j) => j !== cIdx);
        return {
          ...q,
          choices: newChoices,
          correct_answer: q.correct_answer >= newChoices.length
            ? Math.max(0, newChoices.length - 1)
            : q.correct_answer,
        };
      })
    );

  const handleSaveQuestions = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createdHomeworkId) return;

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question_text.trim()) {
        setErrorMessage(isKm ? `សំណួរទី ${i + 1} ត្រូវការអត្ថបទ` : `Question ${i + 1} needs text`);
        return;
      }
      const filled = q.choices.filter((c) => c.trim());
      if (filled.length < 2) {
        setErrorMessage(
          isKm ? `សំណួរទី ${i + 1} ត្រូវការជម្រើសយ៉ាងតិច ២` : `Question ${i + 1} needs at least 2 choices`
        );
        return;
      }
    }

    setSavingQuestions(true);
    setErrorMessage(null);
    try {
      try {
        await api.createQuestions(
          createdHomeworkId,
          questions.map((q, i) => ({
            question_text: q.question_text.trim(),
            choices: q.choices.filter((c) => c.trim()),
            correct_answer: q.correct_answer,
            order_index: i,
          }))
        );
      } catch {
        // fallback
      }

      const newHw: HomeworkItem = {
        id: createdHomeworkId,
        title: title.trim(),
        subject: subject.trim(),
        description: description.trim(),
        deadline: new Date(deadline).toISOString(),
        is_qcm: true,
        question_count: questions.length,
        submissions_count: 0,
        total_students: 32,
      };
      setHomeworks((prev) => [newHw, ...prev]);
      setShowModal(false);
      showStatus(
        isKm
          ? `បានបង្កើតកិច្ចការ QCM ជោគជ័យ (${questions.length} សំណួរ)!`
          : `QCM homework created with ${questions.length} questions!`
      );
    } finally {
      setSavingQuestions(false);
    }
  };

  // -------------------------------------------------------------------------
  // Edit Modal QCM Question helpers
  // -------------------------------------------------------------------------
  const addEditQuestion = () =>
    setEditQuestions((prev) => [
      ...prev,
      { question_text: '', choices: ['', '', '', ''], correct_answer: 0 },
    ]);

  const removeEditQuestion = (idx: number) =>
    setEditQuestions((prev) => prev.filter((_, i) => i !== idx));

  const updateEditQuestion = (idx: number, field: keyof QCMQuestion, value: any) =>
    setEditQuestions((prev) =>
      prev.map((q, i) => (i === idx ? { ...q, [field]: value } : q))
    );

  const updateEditChoice = (qIdx: number, cIdx: number, value: string) =>
    setEditQuestions((prev) =>
      prev.map((q, i) =>
        i === qIdx
          ? { ...q, choices: q.choices.map((c, j) => (j === cIdx ? value : c)) }
          : q
      )
    );

  const addEditChoice = (qIdx: number) =>
    setEditQuestions((prev) =>
      prev.map((q, i) =>
        i === qIdx ? { ...q, choices: [...q.choices, ''] } : q
      )
    );

  const removeEditChoice = (qIdx: number, cIdx: number) =>
    setEditQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIdx) return q;
        const newChoices = q.choices.filter((_, j) => j !== cIdx);
        return {
          ...q,
          choices: newChoices,
          correct_answer: q.correct_answer >= newChoices.length
            ? Math.max(0, newChoices.length - 1)
            : q.correct_answer,
        };
      })
    );

  const handleOpenEdit = async (hw: HomeworkItem) => {
    setEditingHw(hw);
    setEditTab('info');
    setEditTitle(hw.title);
    setEditSubject(hw.subject);
    setEditDescription(hw.description || '');
    setEditDeadline(
      hw.deadline ? new Date(hw.deadline).toISOString().slice(0, 16) : ''
    );
    setEditFileName(hw.file_name || '');
    setEditFileUrl(hw.file_url || '');
    setErrorMessage(null);

    if (hw.is_qcm) {
      setLoadingEditQuestions(true);
      try {
        const fetchedQuestions = await api.getQuestions(hw.id);
        if (Array.isArray(fetchedQuestions) && fetchedQuestions.length > 0) {
          setEditQuestions(
            fetchedQuestions.map((q: any) => ({
              question_text: q.question_text || '',
              choices: Array.isArray(q.choices) ? q.choices : ['', '', '', ''],
              correct_answer: q.correct_answer ?? 0,
            }))
          );
        } else {
          setEditQuestions([
            { question_text: '', choices: ['', '', '', ''], correct_answer: 0 },
          ]);
        }
      } catch {
        setEditQuestions([
          { question_text: '', choices: ['', '', '', ''], correct_answer: 0 },
        ]);
      } finally {
        setLoadingEditQuestions(false);
      }
    } else {
      setEditQuestions([]);
    }
  };

  const handleEditFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEditUploading(true);
    setErrorMessage(null);
    try {
      const res = await api.uploadFile(file);
      if (res?.file_url) {
        setEditFileUrl(res.file_url);
        setEditFileName(res.file_name || file.name);
        showStatus(isKm ? 'បានផ្លាស់ប្ដូរឯកសារថ្មីដោយជោគជ័យ!' : 'New file uploaded successfully!');
      } else {
        throw new Error(isKm ? 'មិនអាចទទួល URL ឯកសារបានទេ' : 'Failed to retrieve file URL');
      }
    } catch (err: any) {
      setErrorMessage(err.message || (isKm ? 'ការផ្ទុកឡើងឯកសារបរាជ័យ សូមព្យាយាមម្ដងទៀត' : 'File upload failed, please try again'));
    } finally {
      setEditUploading(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHw) return;
    if (!editTitle.trim() || !editSubject.trim()) return;

    // Validate QCM questions if editing QCM
    if (editingHw.is_qcm) {
      for (let i = 0; i < editQuestions.length; i++) {
        const q = editQuestions[i];
        if (!q.question_text.trim()) {
          setErrorMessage(isKm ? `សំណួរទី ${i + 1} ត្រូវការអត្ថបទ` : `Question ${i + 1} needs text`);
          setEditTab('questions');
          return;
        }
        const filled = q.choices.filter((c) => c.trim());
        if (filled.length < 2) {
          setErrorMessage(
            isKm ? `សំណួរទី ${i + 1} ត្រូវការជម្រើសយ៉ាងតិច ២` : `Question ${i + 1} needs at least 2 choices`
          );
          setEditTab('questions');
          return;
        }
      }
    }

    setSavingEdit(true);
    setErrorMessage(null);
    try {
      // 1. Update basic info
      await api.updateHomework(editingHw.id, {
        title: editTitle.trim(),
        subject: editSubject.trim(),
        description: editDescription.trim() || '',
        deadline: new Date(editDeadline).toISOString(),
        file_name: editFileName.trim() || '',
        file_url: editFileUrl.trim() || '',
      });

      // 2. If QCM, update questions
      if (editingHw.is_qcm && editQuestions.length > 0) {
        await api.createQuestions(
          editingHw.id,
          editQuestions.map((q, i) => ({
            question_text: q.question_text.trim(),
            choices: q.choices.filter((c) => c.trim()),
            correct_answer: q.correct_answer,
            order_index: i,
          }))
        );
      }

      setHomeworks((prev) =>
        prev.map((h) =>
          h.id === editingHw.id
            ? {
                ...h,
                title: editTitle.trim(),
                subject: editSubject.trim(),
                description: editDescription.trim(),
                deadline: new Date(editDeadline).toISOString(),
                file_name: editFileName.trim() || null,
                file_url: editFileUrl.trim() || null,
                question_count: editingHw.is_qcm ? editQuestions.length : h.question_count,
              }
            : h
        )
      );

      setEditingHw(null);
      showStatus(isKm ? 'បានកែប្រែកិច្ចការ និងសំណួរជោគជ័យ!' : 'Homework and questions updated successfully!');
    } catch (err: any) {
      setErrorMessage(err.message || (isKm ? 'មានបញ្ហាក្នុងការកែប្រែកិច្ចការ' : 'Error saving edits'));
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteHomework = async (hwId: number) => {
    if (!confirm(isKm ? 'តើអ្នកប្រាកដជាចង់លុបកិច្ចការនេះមែនទេ?' : 'Delete this assignment?')) return;
    try {
      try {
        await api.deleteHomework(hwId);
      } catch {
        // fallback
      }
      setHomeworks((prev) => prev.filter((h) => h.id !== hwId));
      showStatus(isKm ? 'បានលុបកិច្ចការដោយជោគជ័យ!' : 'Homework deleted successfully!');
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            {isKm ? 'កិច្ចការផ្ទះ & មេរៀន' : 'Assignments & Materials'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isKm
              ? 'បង្ហោះឯកសារ បង្កើតកិច្ចការ និង QCM ពិនិត្យការប្រគល់'
              : 'Upload materials, create homework or QCM quizzes, and review submissions'}
          </p>
        </div>
        <Button
          onClick={openModal}
          size="sm"
          className="gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-xs cursor-pointer"
        >
          <Plus size={14} weight="bold" />
          <span>{isKm ? 'ដាក់កិច្ចការថ្មី' : 'Create Assignment'}</span>
        </Button>
      </div>

      {/* Status / Error banners */}
      {statusMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2 shadow-xs">
          <CheckCircle size={18} weight="fill" className="text-emerald-600 dark:text-emerald-400" />
          <span>{statusMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <WarningCircle size={18} weight="fill" className="text-rose-600 dark:text-rose-400" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-rose-600 hover:text-rose-800">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Class selector & Search & ViewMode Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-[#1c1d22] border border-slate-200/80 dark:border-[#282a32] p-4 rounded-2xl shadow-xs">
        <div className="flex items-center gap-3">
          <ChalkboardTeacher size={20} className="text-blue-600 dark:text-blue-400 shrink-0" />
          <div>
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              {isKm ? 'ជ្រើសរើសថ្នាក់រៀន:' : 'Select Class:'}
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {isKm ? 'មើលកិច្ចការដែលបានដាក់ក្នុងថ្នាក់នេះ' : 'View tasks assigned to this classroom'}
            </p>
          </div>
          <select
            value={selectedClassId || ''}
            onChange={(e) => setSelectedClassId(Number(e.target.value))}
            className="px-3.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-[#282a32] bg-white dark:bg-[#16171b] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer font-semibold min-w-44"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.grade_level ? `(${c.grade_level})` : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          {/* Search bar */}
          <div className="relative">
            <MagnifyingGlass size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isKm ? 'ស្វែងរកកិច្ចការ...' : 'Search homework...'}
              className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#14161d] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-44 sm:w-56"
            />
          </div>
          <ViewModeToggle />
        </div>
      </div>

      {/* Homework list */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <SpinnerGap size={28} className="animate-spin text-blue-600 mb-2" />
          <p className="text-xs">{isKm ? 'កំពុងទាញទិន្នន័យ...' : 'Loading assignments...'}</p>
        </div>
      ) : homeworks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-[#282a32] bg-white/50 dark:bg-[#1c1d22]/50 p-12 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
            <BookOpen size={24} />
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">
            {isKm ? 'មិនទាន់មានកិច្ចការក្នុងថ្នាក់នេះ' : 'No assignments for this class yet'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
            {isKm
              ? 'បង្កើតកិច្ចការធម្មតា ឬ QCM (ជ្រើសរើសសំណួរ) ឱ្យសិស្ស'
              : 'Create a regular assignment or a QCM quiz for your students.'}
          </p>
          <Button onClick={openModal} size="sm" className="mt-4 gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white">
            <Plus size={14} weight="bold" />
            <span>{isKm ? 'ដាក់កិច្ចការថ្មី' : 'Create Assignment'}</span>
          </Button>
        </div>
      ) : viewMode === 'table' ? (
        /* ══════════════════════════════════════════════════════════
           MODERN TABLE VIEW
           ══════════════════════════════════════════════════════════ */
        <div className="rounded-2xl border border-slate-200/80 dark:border-[#282a32] bg-white dark:bg-[#1c1d22] overflow-hidden shadow-xs">
          {/* Table header bar */}
          <div className="px-5 py-3 border-b border-slate-100 dark:border-[#282a32] flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {homeworks.filter((hw) =>
                hw.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                hw.subject.toLowerCase().includes(searchQuery.toLowerCase())
              ).length}{' '}
              {isKm ? 'កិច្ចការ' : 'assignments'}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-[#282a32]">
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider w-36">
                    {isKm ? 'មុខវិជ្ជា' : 'Subject'}
                  </th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    {isKm ? 'ចំណងជើង & ការណែនាំ' : 'Title & Instructions'}
                  </th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider w-44">
                    {isKm ? 'ប្រភេទ / ឯកសារ' : 'Type / File'}
                  </th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider w-36">
                    {isKm ? 'ថ្ងៃផុតកំណត់' : 'Deadline'}
                  </th>
                  <th className="text-center px-4 py-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider w-28">
                    {isKm ? 'ប្រគល់' : 'Turned In'}
                  </th>
                  <th className="text-right px-5 py-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider w-32">
                    {isKm ? 'សកម្មភាព' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#282a32]">
                {homeworks
                  .filter((hw) =>
                    hw.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    hw.subject.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((hw) => {
                    const count = hw.submissions_count ?? hw.submission_count ?? 0;
                    const total = hw.total_students ?? 0;
                    const isPast = new Date(hw.deadline) < new Date();
                    const pct = total > 0 ? Math.round((count / total) * 100) : 0;

                    return (
                      <tr
                        key={hw.id}
                        className="group hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors"
                      >
                        {/* Subject badge */}
                        <td className="px-5 py-4 align-middle">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border whitespace-nowrap ${
                            hw.subject.includes('Math') || hw.subject.includes('គណិត')
                              ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                              : hw.subject.includes('Physics') || hw.subject.includes('រូប')
                              ? 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                              : hw.subject.includes('English') || hw.subject.includes('អង់')
                              ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                              : hw.subject.includes('Khmer') || hw.subject.includes('ខ្មែរ')
                              ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                              : hw.subject.includes('Chemistry') || hw.subject.includes('គីមី')
                              ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}>
                            {hw.subject.split('(')[0].trim()}
                          </span>
                        </td>

                        {/* Title + description */}
                        <td className="px-4 py-4 align-middle min-w-0 max-w-xs">
                          <p className="text-sm font-bold text-slate-900 dark:text-white leading-snug line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {hw.title}
                          </p>
                          {hw.description && (
                            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 line-clamp-1 font-normal">
                              {hw.description}
                            </p>
                          )}
                        </td>

                        {/* Type / File */}
                        <td className="px-4 py-4 align-middle">
                          {hw.is_qcm ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-violet-50 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800 whitespace-nowrap">
                              <ListChecks size={12} weight="bold" />
                              QCM — {hw.question_count ?? 0} {isKm ? 'សំណួរ' : 'Q'}
                            </span>
                          ) : hw.file_url ? (
                            <a
                              href={hw.file_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition whitespace-nowrap max-w-[160px]"
                            >
                              <FileText size={12} />
                              <span className="truncate">{hw.file_name || 'File'}</span>
                              <FileArrowDown size={11} className="shrink-0" />
                            </a>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">
                              {isKm ? 'គ្មានឯកសារ' : 'No file'}
                            </span>
                          )}
                        </td>

                        {/* Deadline */}
                        <td className="px-4 py-4 align-middle whitespace-nowrap">
                          <div className={`inline-flex flex-col gap-0.5 ${isPast ? 'text-rose-500 dark:text-rose-400' : 'text-slate-600 dark:text-slate-300'}`}>
                            <span className="text-xs font-bold">
                              {new Date(hw.deadline).toLocaleDateString(
                                isKm ? 'km-KH' : 'en-US',
                                { day: '2-digit', month: 'short', year: 'numeric' }
                              )}
                            </span>
                            <span className={`text-[10px] font-medium ${isPast ? 'text-rose-400' : 'text-slate-400 dark:text-slate-500'}`}>
                              {new Date(hw.deadline).toLocaleTimeString(
                                isKm ? 'km-KH' : 'en-US',
                                { hour: '2-digit', minute: '2-digit' }
                              )}
                              {isPast && (` • ${isKm ? 'ផុតកំណត់' : 'Expired'}`)}
                            </span>
                          </div>
                        </td>

                        {/* Submission count + progress */}
                        <td className="px-4 py-4 align-middle">
                          <div className="flex flex-col items-center gap-1">
                            <span className={`text-sm font-black ${count > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                              {count}
                              {total > 0 && (
                                <span className="text-[10px] font-semibold text-slate-400 ml-0.5">
                                  /{total}
                                </span>
                              )}
                            </span>
                            {total > 0 && (
                              <div className="w-16 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${pct >= 80 ? 'bg-emerald-500' : pct >= 40 ? 'bg-amber-500' : 'bg-rose-400'}`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 align-middle">
                          <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                            {/* Review */}
                            <Link
                              href={`/${locale}/homework/${hw.id}`}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition whitespace-nowrap cursor-pointer"
                              title={isKm ? 'ពិនិត្យការប្រគល់' : 'Review submissions'}
                            >
                              <ArrowRight size={13} weight="bold" />
                              <span className="hidden sm:inline">{isKm ? 'ពិនិត្យ' : 'Review'}</span>
                            </Link>

                            {/* Edit */}
                            <button
                              onClick={() => handleOpenEdit(hw)}
                              className="p-1.5 rounded-xl text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition cursor-pointer"
                              title={isKm ? 'កែប្រែ' : 'Edit'}
                            >
                              <PencilSimple size={14} weight="bold" />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => handleDeleteHomework(hw.id)}
                              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
                              title={isKm ? 'លុប' : 'Delete'}
                            >
                              <Trash size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          {/* Empty filtered state */}
          {homeworks.filter((hw) =>
            hw.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            hw.subject.toLowerCase().includes(searchQuery.toLowerCase())
          ).length === 0 && (
            <div className="py-16 text-center text-slate-400">
              <BookOpen size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-xs">{isKm ? 'រកមិនឃើញ' : 'No results found'}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {homeworks
            .filter((hw) =>
              hw.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              hw.subject.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((hw) => {
              const count = hw.submissions_count ?? hw.submission_count ?? 0;
              return (
                <div
                  key={hw.id}
                  className="rounded-2xl border border-slate-200/80 dark:border-[#282a32] bg-white dark:bg-[#1c1d22] p-5 shadow-xs flex flex-col justify-between hover:shadow-md hover:border-blue-500/50 transition group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1.5">
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
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-slate-400 flex items-center gap-1 mr-1">
                          <CalendarBlank size={13} />
                          {new Date(hw.deadline).toLocaleDateString()}
                        </span>
                        <button
                          onClick={() => handleOpenEdit(hw)}
                          className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.06] transition cursor-pointer"
                          title={isKm ? 'កែប្រែកិច្ចការ' : 'Edit Homework'}
                        >
                          <PencilSimple size={14} weight="bold" />
                        </button>
                        <button
                          onClick={() => handleDeleteHomework(hw.id)}
                          className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
                          title={isKm ? 'លុបកិច្ចការ' : 'Delete'}
                        >
                          <Trash size={14} />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition leading-snug">
                      {hw.title}
                    </h3>

                    {hw.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2">
                        {hw.description}
                      </p>
                    )}

                    {hw.is_qcm ? (
                      <span className="mt-2 inline-flex items-center gap-1 text-[11px] text-violet-600 dark:text-violet-400">
                        <ListChecks size={13} />
                        {hw.question_count ?? 0} {isKm ? 'សំណួរ' : 'questions'}
                      </span>
                    ) : hw.file_url ? (
                      <a
                        href={hw.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        <FileText size={13} />
                        {hw.file_name || (isKm ? 'ឯកសារភ្ជាប់' : 'Attached Material')}
                      </a>
                    ) : null}
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-[#282a32] flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                      <CheckCircle size={15} className={count > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'} />
                      <span className={count > 0 ? 'font-bold text-emerald-700 dark:text-emerald-400' : ''}>
                        {count} {isKm ? 'បានប្រគល់' : 'Turned In'}
                      </span>
                    </div>
                    <Link
                      href={`/${locale}/homework/${hw.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 group-hover:translate-x-0.5 transition"
                    >
                      <span>{isKm ? 'ពិនិត្យ & ដាក់ពិន្ទុ' : 'Review Submissions'}</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-white dark:bg-[#1c1d22] rounded-3xl shadow-2xl border border-slate-200 dark:border-[#282a32] max-h-[90vh] flex flex-col">

            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 z-10 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X size={18} />
            </button>

            {/* STEP 1: Choose type */}
            {step === 'type' && (
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-2xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Plus size={22} weight="bold" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {isKm ? 'ជ្រើសរើសប្រភេទកិច្ចការ' : 'Choose Assignment Type'}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {isKm ? 'ឯកសារ ឬ QCM (ជ្រើសរើសសំណួរ)' : 'File upload or multiple-choice quiz'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => { setIsQCM(false); setStep('form'); }}
                    className="flex flex-col items-center gap-3 p-5 rounded-2xl border-2 border-slate-200 dark:border-[#282a32] hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 transition group cursor-pointer text-left"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-105 transition">
                      <UploadSimple size={24} weight="bold" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-white">
                        {isKm ? 'កិច្ចការឯកសារ' : 'File Assignment'}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {isKm ? 'ផ្ញើឯកសារ PDF / Word ទៅសិស្ស' : 'Send PDF/Word files to students'}
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => { setIsQCM(true); setStep('form'); }}
                    className="flex flex-col items-center gap-3 p-5 rounded-2xl border-2 border-slate-200 dark:border-[#282a32] hover:border-violet-400 dark:hover:border-violet-500 hover:bg-violet-50/50 dark:hover:bg-violet-950/30 transition group cursor-pointer text-left"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center group-hover:scale-105 transition">
                      <ListChecks size={24} weight="bold" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-white">
                        QCM {isKm ? '(ជ្រើសរើសសំណួរ)' : '(Multiple Choice)'}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {isKm ? 'បង្កើតសំណួរជ្រើសរើស ដោយដាក់ពិន្ទុស្វ័យប្រវត្តិ' : 'Auto-graded multiple choice questions'}
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Homework info form */}
            {step === 'form' && (
              <div className="p-6 overflow-y-auto">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`h-10 w-10 rounded-2xl flex items-center justify-center ${isQCM ? 'bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-400' : 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'}`}>
                    {isQCM ? <ListChecks size={22} weight="fill" /> : <BookOpen size={22} weight="fill" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {isQCM
                          ? (isKm ? 'ព័ត៌មានកិច្ចការ QCM' : 'QCM Assignment Info')
                          : (isKm ? 'ព័ត៌មានកិច្ចការ' : 'Assignment Info')}
                      </h3>
                      {isQCM && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-100 dark:bg-violet-900/60 text-violet-700 dark:text-violet-300">
                          QCM
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {isKm ? 'ជំហ៊ានទី ១/២ — ព័ត៌មានទូទៅ' : 'Step 1/2 — General info'}
                    </p>
                  </div>
                </div>

                <form onSubmit={handleCreateHomework} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {isKm ? 'ចំណងជើងកិច្ចការ' : 'Assignment Title'} *
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder={isKm ? 'ឧ. លំហាត់ជ្រើសរើសសំណួររូបវិទ្យា...' : 'e.g. Physics MCQ Quiz...'}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#282a32] bg-slate-50 dark:bg-[#16171b] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        {isKm ? 'មុខវិជ្ជា' : 'Subject'} *
                      </label>
                      <select
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#282a32] bg-white dark:bg-[#16171b] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                      >
                        <option value="ភាសាខ្មែរ (Khmer)">ភាសាខ្មែរ (Khmer)</option>
                        <option value="គណិតវិទ្យា (Math)">គណិតវិទ្យា (Math)</option>
                        <option value="រូបវិទ្យា (Physics)">រូបវិទ្យា (Physics)</option>
                        <option value="គីមីវិទ្យា (Chemistry)">គីមីវិទ្យា (Chemistry)</option>
                        <option value="ជីវវិទ្យា (Biology)">ជីវវិទ្យា (Biology)</option>
                        <option value="ភាសាអង់គ្លេស (English)">ភាសាអង់គ្លេស (English)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        {isKm ? 'កាលបរិច្ឆេទប្រគល់' : 'Deadline'} *
                      </label>
                      <input
                        type="datetime-local"
                        required
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#282a32] bg-white dark:bg-[#16171b] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {isKm ? 'សេចក្ដីពិពណ៌នា / ការណែនាំ' : 'Instructions'}
                    </label>
                    <textarea
                      rows={2}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder={isKm ? 'ការណែនាំបន្ថែម...' : 'Additional instructions...'}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#282a32] bg-slate-50 dark:bg-[#16171b] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                    />
                  </div>

                  {!isQCM && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        {isKm ? 'ឯកសារភ្ជាប់ (PDF, DOCX, រូបភាព)' : 'Attached Material (Optional)'}
                      </label>
                      <div className="border border-dashed border-slate-200 dark:border-[#282a32] rounded-2xl p-3.5 bg-slate-50/50 dark:bg-white/[0.02]">
                        {fileName ? (
                          <div className="flex items-center justify-between p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs mb-2">
                            <span className="font-semibold text-blue-700 dark:text-blue-300 truncate max-w-[260px] flex items-center gap-1.5">
                              <CheckCircle size={15} weight="fill" className="text-blue-600 dark:text-blue-400 shrink-0" />
                              <span className="truncate">{fileName}</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => { setFileName(''); setFileUrl(''); }}
                              className="text-slate-400 hover:text-rose-600 cursor-pointer p-1 rounded-md"
                              title={isKm ? 'លុបឯកសារចេញ' : 'Remove file'}
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : null}

                        <div className="flex items-center gap-2">
                          <label className={`cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#1c1d25] border border-slate-200 dark:border-white/[0.1] text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.05] transition shadow-2xs ${uploading ? 'opacity-60 pointer-events-none' : ''}`}>
                            <UploadSimple size={14} className={uploading ? 'animate-bounce text-blue-500' : ''} />
                            <span>
                              {uploading
                                ? (isKm ? 'កំពុងផ្ទុកឡើង...' : 'Uploading...')
                                : fileName
                                  ? (isKm ? 'ប្ដូរឯកសារថ្មី' : 'Change File')
                                  : (isKm ? 'ជ្រើសរើសឯកសារ' : 'Choose File')}
                            </span>
                            <input
                              type="file"
                              className="hidden"
                              onChange={handleFileUpload}
                              disabled={uploading}
                              accept=".pdf,.doc,.docx,.xlsx,.png,.jpg,.jpeg"
                            />
                          </label>
                          <span className="text-[10px] text-slate-400">PDF, Word, Excel, JPG, PNG</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {errorMessage && (
                    <p className="text-xs text-rose-600 dark:text-rose-400">{errorMessage}</p>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setStep('type')}
                      className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
                    >
                      ← {isKm ? 'ថយក្រោយ' : 'Back'}
                    </button>
                    <Button
                      type="submit"
                      disabled={creating}
                      className={`px-5 py-2 text-xs font-semibold text-white rounded-xl shadow-xs cursor-pointer ${isQCM ? 'bg-violet-600 hover:bg-violet-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                      {creating
                        ? (isKm ? 'កំពុងបង្កើត...' : 'Creating...')
                        : isQCM
                          ? (isKm ? 'បន្ទាប់: បន្ថែមសំណួរ →' : 'Next: Add Questions →')
                          : (isKm ? 'បង្កើតកិច្ចការ' : 'Create Assignment')}
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* STEP 3: QCM Question builder */}
            {step === 'questions' && (
              <div className="flex flex-col overflow-hidden">
                <div className="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-[#282a32] flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                      <ListChecks size={22} weight="fill" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {isKm ? 'បន្ថែមសំណួរ QCM' : 'Add QCM Questions'}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {isKm ? 'ជំហ៊ានទី ២/២ — បញ្ចូលសំណួរ និងជម្រើស' : 'Step 2/2 — Enter questions and choices'}
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSaveQuestions} className="flex flex-col overflow-hidden flex-1">
                  <div className="px-6 py-4 space-y-5 overflow-y-auto flex-1">
                    {questions.map((q, qi) => (
                      <div key={qi} className="rounded-2xl border border-slate-200 dark:border-[#282a32] bg-slate-50 dark:bg-[#16171b] p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-violet-700 dark:text-violet-300">
                            {isKm ? `សំណួរទី ${qi + 1}` : `Question ${qi + 1}`}
                          </span>
                          {questions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeQuestion(qi)}
                              className="text-slate-400 hover:text-rose-600 transition cursor-pointer"
                            >
                              <Trash size={14} />
                            </button>
                          )}
                        </div>

                        <textarea
                          rows={2}
                          required
                          value={q.question_text}
                          onChange={(e) => updateQuestion(qi, 'question_text', e.target.value)}
                          placeholder={isKm ? 'សរសេរសំណួររបស់អ្នក...' : 'Write your question here...'}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#282a32] bg-white dark:bg-[#1c1d22] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 resize-none"
                        />

                        <div className="space-y-2">
                          <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                            {isKm ? 'ជម្រើស (ចុចប្រអប់ Radio ដើម្បីជ្រើសចម្លើយត្រឹមត្រូវ):' : 'Choices (click radio to set correct answer):'}
                          </p>
                          {q.choices.map((choice, ci) => (
                            <div key={ci} className="flex items-center gap-2">
                              <input
                                type="radio"
                                name={`correct-${qi}`}
                                checked={q.correct_answer === ci}
                                onChange={() => updateQuestion(qi, 'correct_answer', ci)}
                                className="accent-violet-600 cursor-pointer flex-shrink-0"
                              />
                              <input
                                type="text"
                                required
                                value={choice}
                                onChange={(e) => updateChoice(qi, ci, e.target.value)}
                                placeholder={isKm ? `ជម្រើស ${ci + 1}` : `Choice ${ci + 1}`}
                                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-[#282a32] bg-white dark:bg-[#1c1d22] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                              />
                              {q.correct_answer === ci && (
                                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex-shrink-0">
                                  ✓
                                </span>
                              )}
                              {q.choices.length > 2 && (
                                <button
                                  type="button"
                                  onClick={() => removeChoice(qi, ci)}
                                  className="text-slate-300 hover:text-rose-500 transition cursor-pointer flex-shrink-0"
                                >
                                  <X size={12} />
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => addChoice(qi)}
                            className="text-[11px] text-violet-600 dark:text-violet-400 hover:underline cursor-pointer"
                          >
                            + {isKm ? 'បន្ថែមជម្រើស' : 'Add choice'}
                          </button>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={addQuestion}
                      className="w-full py-3 rounded-2xl border-2 border-dashed border-violet-200 dark:border-violet-900/60 text-xs font-semibold text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/30 transition cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Plus size={14} weight="bold" />
                      {isKm ? 'បន្ថែមសំណួរថ្មី' : 'Add New Question'}
                    </button>
                  </div>

                  <div className="px-6 py-4 border-t border-slate-100 dark:border-[#282a32] flex-shrink-0">
                    {errorMessage && (
                      <p className="text-xs text-rose-600 dark:text-rose-400 mb-3">{errorMessage}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">
                        {questions.length} {isKm ? 'សំណួរ' : 'questions'}
                      </span>
                      <Button
                        type="submit"
                        disabled={savingQuestions}
                        className="px-5 py-2 text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white rounded-xl shadow-xs cursor-pointer"
                      >
                        {savingQuestions
                          ? (isKm ? 'កំពុងរក្សាទុក...' : 'Saving...')
                          : (isKm ? 'រក្សាទុក & បង្ហោះកិច្ចការ' : 'Save & Publish Quiz')}
                      </Button>
                    </div>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── EDIT HOMEWORK MODAL ────────────────────────────────────── */}
      {editingHw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white dark:bg-[#15171e] rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-white/[0.1] max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/[0.06] shrink-0">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                  editingHw.is_qcm
                    ? 'bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400'
                    : 'bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400'
                }`}>
                  <PencilSimple size={20} weight="bold" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {isKm ? 'កែប្រែកិច្ចការ & មេរៀន' : 'Edit Homework & Material'}
                    </h3>
                    {editingHw.is_qcm && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20">
                        QCM Quiz
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {editingHw.title}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingHw(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {/* QCM Tabs (if editing QCM homework) */}
            {editingHw.is_qcm && (
              <div className="flex items-center gap-2 pt-3 pb-1 border-b border-slate-100 dark:border-white/[0.06] shrink-0">
                <button
                  type="button"
                  onClick={() => setEditTab('info')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    editTab === 'info'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.05]'
                  }`}
                >
                  {isKm ? 'ព័ត៌មានទូទៅ' : 'Basic Info'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditTab('questions')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    editTab === 'questions'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.05]'
                  }`}
                >
                  <ListChecks size={14} weight="bold" />
                  <span>{isKm ? `កែសម្រួលសំណួរ QCM (${editQuestions.length})` : `Edit Questions (${editQuestions.length})`}</span>
                </button>
              </div>
            )}

            {/* Error Message inside modal */}
            {errorMessage && (
              <div className="mt-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
                <WarningCircle size={16} weight="fill" className="shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form Body */}
            <form onSubmit={handleSaveEdit} className="flex-1 overflow-y-auto py-4 space-y-4">
              {editTab === 'info' ? (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      {isKm ? 'ចំណងជើងកិច្ចការ' : 'Assignment Title'} *
                    </label>
                    <input
                      type="text"
                      required
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder={isKm ? 'ឧ. លំហាត់ប្រចាំសប្ដាហ៍...' : 'e.g. Weekly Homework...'}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#1c1d25] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        {isKm ? 'មុខវិជ្ជា' : 'Subject'} *
                      </label>
                      <select
                        value={editSubject}
                        onChange={(e) => setEditSubject(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#1c1d25] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                      >
                        <option value="គណិតវិទ្យា (Math)">គណិតវិទ្យា (Math)</option>
                        <option value="រូបវិទ្យា (Physics)">រូបវិទ្យា (Physics)</option>
                        <option value="គីមីវិទ្យា (Chemistry)">គីមីវិទ្យា (Chemistry)</option>
                        <option value="ជីវវិទ្យា (Biology)">ជីវវិទ្យា (Biology)</option>
                        <option value="ភាសាខ្មែរ (Khmer)">ភាសាខ្មែរ (Khmer)</option>
                        <option value="ភាសាអង់គ្លេស (English)">ភាសាអង់គ្លេស (English)</option>
                        <option value="ប្រវត្តិវិទ្យា (History)">ប្រវត្តិវិទ្យា (History)</option>
                        <option value="ពលរដ្ឋវិជ្ជា (Moral)">ពលរដ្ឋវិជ្ជា (Moral)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        {isKm ? 'កាលបរិច្ឆេទផុតកំណត់' : 'Deadline'} *
                      </label>
                      <input
                        type="datetime-local"
                        required
                        value={editDeadline}
                        onChange={(e) => setEditDeadline(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#1c1d25] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      {isKm ? 'ការណែនាំ / សេចក្ដីពណ៌នា' : 'Description & Instructions'}
                    </label>
                    <textarea
                      rows={3}
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder={isKm ? 'សេចក្តីណែនាំលម្អិតសម្រាប់សិស្ស...' : 'Detailed instructions for students...'}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#1c1d25] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                    />
                  </div>

                  {/* Material attachment */}
                  {!editingHw.is_qcm && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        {isKm ? 'ឯកសារភ្ជាប់ថ្មី (PDF, DOCX, រូបភាព)' : 'Attached Material (Optional)'}
                      </label>
                      <div className="border border-dashed border-slate-200 dark:border-white/[0.1] rounded-2xl p-4 bg-slate-50/50 dark:bg-white/[0.02]">
                        {editFileName ? (
                          <div className="flex items-center justify-between p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs mb-2">
                            <span className="font-semibold text-blue-700 dark:text-blue-300 truncate max-w-[260px]">
                              ✓ {editFileName}
                            </span>
                            <button
                              type="button"
                              onClick={() => { setEditFileName(''); setEditFileUrl(''); }}
                              className="text-slate-400 hover:text-rose-600 cursor-pointer"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : null}

                        <div className="flex items-center gap-2">
                          <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#1c1d25] border border-slate-200 dark:border-white/[0.1] text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition shadow-2xs">
                            <UploadSimple size={14} />
                            <span>{editUploading ? (isKm ? 'កំពុង Upload...' : 'Uploading...') : (isKm ? 'ជ្រើសរើសឯកសារថ្មី' : 'Choose New File')}</span>
                            <input
                              type="file"
                              onChange={handleEditFileUpload}
                              disabled={editUploading}
                              className="hidden"
                            />
                          </label>
                          <span className="text-[10px] text-slate-400">PDF, DOCX, XLSX, JPG, PNG</span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* Tab 2: QCM Questions Editor */
                <div className="space-y-4">
                  {loadingEditQuestions ? (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                      <SpinnerGap size={24} className="animate-spin text-purple-600 mb-2" />
                      <p className="text-xs">{isKm ? 'កំពុងទាញសំណួរ...' : 'Loading questions...'}</p>
                    </div>
                  ) : (
                    <>
                      {editQuestions.map((q, qi) => (
                        <div key={qi} className="rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.03] p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-purple-700 dark:text-purple-400">
                              {isKm ? `សំណួរទី ${qi + 1}` : `Question ${qi + 1}`}
                            </span>
                            {editQuestions.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeEditQuestion(qi)}
                                className="text-slate-400 hover:text-rose-600 transition cursor-pointer p-1 rounded-md"
                              >
                                <Trash size={14} />
                              </button>
                            )}
                          </div>

                          <textarea
                            rows={2}
                            required
                            value={q.question_text}
                            onChange={(e) => updateEditQuestion(qi, 'question_text', e.target.value)}
                            placeholder={isKm ? 'សរសេរសំណួររបស់អ្នក...' : 'Write your question here...'}
                            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#1c1d25] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 resize-none"
                          />

                          <div className="space-y-2">
                            <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                              {isKm ? 'ជម្រើស (ចុច Radio ដើម្បីកំណត់ចម្លើយត្រឹមត្រូវ):' : 'Choices (select radio for correct answer):'}
                            </p>
                            {q.choices.map((choice, ci) => (
                              <div key={ci} className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name={`edit-correct-${qi}`}
                                  checked={q.correct_answer === ci}
                                  onChange={() => updateEditQuestion(qi, 'correct_answer', ci)}
                                  className="accent-purple-600 cursor-pointer flex-shrink-0"
                                />
                                <input
                                  type="text"
                                  required
                                  value={choice}
                                  onChange={(e) => updateEditChoice(qi, ci, e.target.value)}
                                  placeholder={isKm ? `ជម្រើស ${ci + 1}` : `Choice ${ci + 1}`}
                                  className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#1c1d25] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                />
                                {q.correct_answer === ci && (
                                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex-shrink-0">
                                    ✓
                                  </span>
                                )}
                                {q.choices.length > 2 && (
                                  <button
                                    type="button"
                                    onClick={() => removeEditChoice(qi, ci)}
                                    className="text-slate-300 hover:text-rose-500 transition cursor-pointer flex-shrink-0"
                                  >
                                    <X size={12} />
                                  </button>
                                )}
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => addEditChoice(qi)}
                              className="text-[11px] text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
                            >
                              + {isKm ? 'បន្ថែមជម្រើស' : 'Add choice'}
                            </button>
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={addEditQuestion}
                        className="w-full py-2.5 rounded-2xl border-2 border-dashed border-purple-200 dark:border-purple-900/60 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/30 transition cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Plus size={14} weight="bold" />
                        {isKm ? 'បន្ថែមសំណួរថ្មី' : 'Add New Question'}
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingHw(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.05] rounded-xl transition cursor-pointer"
                >
                  {isKm ? 'បោះបង់' : 'Cancel'}
                </button>
                <Button
                  type="submit"
                  disabled={savingEdit || editUploading}
                  className="gap-1.5 px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs cursor-pointer"
                >
                  <FloppyDisk size={14} weight="bold" />
                  <span>{savingEdit ? (isKm ? 'កំពុងរក្សាទុក...' : 'Saving...') : (isKm ? 'រក្សាទុកការកែប្រែ' : 'Save Changes')}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

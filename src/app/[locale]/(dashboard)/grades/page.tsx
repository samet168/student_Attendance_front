'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import {
  Exam, Plus, FileXls, CheckCircle,
  ChalkboardTeacher, Printer, X, Trophy, Medal, BookOpen,
  MagnifyingGlass, ArrowsDownUp, CalendarBlank
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { api } from '@/lib/api';
import { useUIStore } from '@/stores/use-ui-store';
import { ViewModeToggle } from '@/components/dashboard/view-mode-toggle';

function formatKhmerDate(dateStr: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const months = ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'];
  return `ថ្ងៃទី ${d.getDate()} ខែ ${months[d.getMonth()]} ឆ្នាំ ${d.getFullYear()}`;
}

interface StudentGrade {
  student_id: number;
  name: string;
  student_code?: string;
  roll_no?: number;
  grades: { subject: string; score: number; exam_type?: string }[];
  average: number;
  letter_grade: string;
  rank: number | string;
  assigned_subjects?: string[] | null;
}

interface RankingResult {
  student_id: number;
  name: string;
  student_code?: string;
  roll_no?: number;
  class_name?: string;
  grade_level?: string;
  average?: number;
  score?: number | null;
  letter_grade?: string;
  rank: number | string;
  subject_scores?: { subject: string; score: number }[];
}

interface RankingData {
  scope: string;
  class_name?: string;
  grade_level?: string;
  subject?: string;
  results: RankingResult[];
}

const SUBJECT_OPTIONS = [
  'គណិតវិទ្យា (Math)',
  'អក្សរសាស្ត្រខ្មែរ (Khmer)',
  'ភាសាអង់គ្លេស (English)',
  'រូបវិទ្យា (Physics)',
  'គីមីវិទ្យា (Chemistry)',
  'ជីវវិទ្យា (Biology)',
  'ប្រវត្តិវិទ្យា (History)',
  'ភូមិវិទ្យា (Geography)',
  'ព័ត៌មានវិទ្យា (IT)',
  'ទូទៅ',
];

const EXAM_TYPES = [
  'ប្រឡងប្រចាំខែ (Monthly)',
  'ឆមាសទី ១ (Semester 1)',
  'ឆមាសទី ២ (Semester 2)',
  'តេស្តប្រចាំសប្ដាហ៍ (Weekly Quiz)',
  'ប្រឡងចុងឆ្នាំ (Final Exam)',
];

function getLetterGrade(score: number) {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  if (score >= 50) return 'E';
  return 'F';
}

function gradeColor(letter: string) {
  switch (letter) {
    case 'A': return 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    case 'B': return 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
    case 'C': return 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
    case 'D': return 'bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800';
    default: return 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800';
  }
}

function rankBadge(rank: number | string) {
  if (rank === 1) return 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700 ring-2 ring-amber-400/30';
  if (rank === 2) return 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-400 dark:border-slate-500';
  if (rank === 3) return 'bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border border-orange-300 dark:border-orange-700';
  return 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700';
}

export default function GradesPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'km';
  const isKm = locale === 'km';

  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number>(0);
  const [gradesData, setGradesData] = useState<StudentGrade[]>([]);
  const [loading, setLoading] = useState(false);

  // Subject filtering
  const [filterSubject, setFilterSubject] = useState<string>('');
  const [classSubjects, setClassSubjects] = useState<any[]>([]);
  const [myRole, setMyRole] = useState<string>('teacher');
  const [assignedSubjects, setAssignedSubjects] = useState<string[]>([]);

  // Enter scores modal
  const [showModal, setShowModal] = useState(false);
  const [subject, setSubject] = useState(SUBJECT_OPTIONS[0]);
  const [examType, setExamType] = useState(EXAM_TYPES[0]);
  const [scoreInputs, setScoreInputs] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Rankings
  const { viewMode } = useUIStore();
  const [rankingDate, setRankingDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState<'grades' | 'ranking-class' | 'ranking-subject' | 'ranking-school'>('grades');
  const [rankingsData, setRankingsData] = useState<RankingData | null>(null);
  const [rankingsLoading, setRankingsLoading] = useState(false);
  const [rankSubject, setRankSubject] = useState<string>('');
  const [rankGradeLevel, setRankGradeLevel] = useState<string>('');
  const [gradeLevels, setGradeLevels] = useState<string[]>([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [clsData, meData] = await Promise.allSettled([
        api.getClasses(),
        api.getMe(),
      ]);
      if (clsData.status === 'fulfilled' && Array.isArray(clsData.value) && clsData.value.length > 0) {
        setClasses(clsData.value);
        setSelectedClassId(clsData.value[0].id);
        // Extract unique grade levels
        const levels = [...new Set(clsData.value.map((c: any) => c.grade_level).filter(Boolean))] as string[];
        setGradeLevels(levels);
        if (levels.length > 0) setRankGradeLevel(levels[0]);
      }
      if (meData.status === 'fulfilled' && meData.value) {
        setMyRole(meData.value.role || 'teacher');
      }
    } catch { /* noop */ }
  };

  useEffect(() => {
    if (!selectedClassId) return;
    loadClassSubjects();
  }, [selectedClassId]);

  const loadClassSubjects = async () => {
    if (!selectedClassId) return;
    try {
      const data = await api.getClassSubjects(selectedClassId);
      setClassSubjects(data || []);
    } catch {
      setClassSubjects([]);
    }
  };

  useEffect(() => {
    if (!selectedClassId) { setGradesData([]); return; }
    loadGrades();
  }, [selectedClassId, filterSubject]);

  const loadGrades = useCallback(async () => {
    if (!selectedClassId) { setGradesData([]); return; }
    setLoading(true);
    try {
      const data = await api.getGradesMatrix(selectedClassId, filterSubject || undefined);
      if (Array.isArray(data) && data.length > 0) {
        setGradesData(data);
        // Extract assigned subjects from first result
        if (data[0]?.assigned_subjects) {
          setAssignedSubjects(data[0].assigned_subjects);
        }
      } else {
        // Try loading student list to populate empty rows
        try {
          const students = await api.getClassStudents(selectedClassId);
          if (Array.isArray(students) && students.length > 0) {
            setGradesData(students.map((s: any, idx: number) => ({
              student_id: s.id,
              name: s.name,
              student_code: s.student_code,
              roll_no: s.roll_no || idx + 1,
              grades: [],
              average: 0.0,
              letter_grade: 'F',
              rank: idx + 1,
            })));
          } else {
            setGradesData([]);
          }
        } catch {
          setGradesData([]);
        }
      }
    } catch {
      setGradesData([]);
    } finally {
      setLoading(false);
    }
  }, [selectedClassId, filterSubject]);

  // Rankings loader
  const loadRankings = useCallback(async () => {
    if (activeTab === 'grades') return;
    setRankingsLoading(true);
    setRankingsData(null);
    try {
      let data: RankingData | null = null;
      if (activeTab === 'ranking-class' && selectedClassId) {
        data = await api.getRankings('class', { classId: selectedClassId });
      } else if (activeTab === 'ranking-subject' && selectedClassId && rankSubject) {
        data = await api.getRankings('subject', { classId: selectedClassId, subject: rankSubject });
      } else if (activeTab === 'ranking-school' && rankGradeLevel) {
        data = await api.getRankings('school', { gradeLevel: rankGradeLevel });
      }
      if (data) setRankingsData(data);
    } catch (e: any) {
      setRankingsData(null);
    } finally {
      setRankingsLoading(false);
    }
  }, [activeTab, selectedClassId, rankSubject, rankGradeLevel]);

  useEffect(() => {
    loadRankings();
  }, [loadRankings]);

  // Determine available subjects in selected class (for subject filter)
  const subjectOptions = classSubjects.length > 0
    ? classSubjects.map((s: any) => s.subject_name)
    : SUBJECT_OPTIONS.slice(0, 6);

  const handleOpenScoreModal = () => {
    const initial: Record<number, string> = {};
    gradesData.forEach((s) => {
      initial[s.student_id] = typeof s.average === 'number' && s.average > 0 ? Math.round(s.average).toString() : '';
    });
    setScoreInputs(initial);
    // Pre-select subject if subject teacher
    if (assignedSubjects.length > 0) setSubject(assignedSubjects[0]);
    setShowModal(true);
  };

  const handleSaveScores = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const dateStr = new Date().toISOString().split('T')[0];
    const records = Object.entries(scoreInputs)
      .filter(([, v]) => v !== '' && !isNaN(Number(v)))
      .map(([studentIdStr, scoreStr]) => ({
        student_id: Number(studentIdStr),
        score: parseFloat(scoreStr) || 0,
      }));
    try {
      await api.saveGrades(selectedClassId, subject, dateStr, records, examType);
      setShowModal(false);
      setStatusMessage(isKm ? 'បានរក្សាទុកពិន្ទុដោយជោគជ័យ!' : 'Grades saved successfully!');
      setTimeout(() => setStatusMessage(null), 3500);
      loadGrades();
    } catch (err: any) {
      setStatusMessage(err.message || 'Error saving grades');
    } finally {
      setSaving(false);
    }
  };

  const handleExportExcel = () => {
    const headers = ['ចំណាត់ថ្នាក់', 'អត្តលេខ', 'ឈ្មោះសិស្ស', 'និទ្ទេស', 'មធ្យមភាគ'];
    const rows = gradesData.map((g) => [
      g.rank, g.student_code || `STU-${g.student_id}`, `"${g.name}"`, g.letter_grade,
      typeof g.average === 'number' ? `${g.average.toFixed(1)}` : g.average,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `Grades_Class_${selectedClassId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const selectedClass = classes.find(c => c.id === selectedClassId);

  const tabs = [
    { id: 'grades', label: isKm ? 'ពិន្ទុ' : 'Grades', icon: <BookOpen size={14} weight="bold" /> },
    { id: 'ranking-class', label: isKm ? 'ចំណាត់ក្នុងថ្នាក់' : 'Class Rank', icon: <Trophy size={14} weight="bold" /> },
    { id: 'ranking-subject', label: isKm ? 'ចំណាត់មុខវិជ្ជា' : 'Subject Rank', icon: <Medal size={14} weight="bold" /> },
    { id: 'ranking-school', label: isKm ? 'ចំណាត់ទូទាំងសាលា' : 'School Rank', icon: <ArrowsDownUp size={14} weight="bold" /> },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            {isKm ? 'ពិន្ទុ & ចំណាត់ថ្នាក់សិស្ស' : 'Grades & Rankings'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isKm ? 'គ្រប់គ្រងពិន្ទុ ចំណាត់ថ្នាក់ក្នុងថ្នាក់/មុខវិជ្ជា/ទូទាំងសាលា' : 'Manage grades and view rankings by class, subject, or school-wide'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => window.print()} variant="outline" size="sm"
            className="gap-1.5 text-xs bg-white dark:bg-[#1c1d22] border-slate-200 dark:border-[#282a32] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#16171b] cursor-pointer">
            <Printer size={14} weight="bold" className="text-blue-600 dark:text-blue-400" />
            <span>PDF</span>
          </Button>
          <Button onClick={handleExportExcel} variant="outline" size="sm"
            className="gap-1.5 text-xs bg-white dark:bg-[#1c1d22] border-slate-200 dark:border-[#282a32] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#16171b] cursor-pointer">
            <FileXls size={14} weight="bold" className="text-emerald-600 dark:text-emerald-400" />
            <span>Excel</span>
          </Button>
          <Button onClick={handleOpenScoreModal} size="sm"
            className="gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white cursor-pointer">
            <Plus size={13} weight="bold" />
            <span>{isKm ? 'បញ្ចូលពិន្ទុ' : 'Enter Scores'}</span>
          </Button>
        </div>
      </div>

      {statusMessage && (
        <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${statusMessage.includes('Error') || statusMessage.includes('error') ? 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300' : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'}`}>
          <CheckCircle size={16} weight="fill" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Class Selector + Subject Filter Bar */}
      <div className="bg-white dark:bg-[#1c1d22] border border-slate-200/80 dark:border-[#282a32] p-4 rounded-2xl shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <ChalkboardTeacher size={18} className="text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              {isKm ? 'ថ្នាក់រៀន:' : 'Class:'}
            </span>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(Number(e.target.value))}
              className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-[#282a32] bg-white dark:bg-[#16171b] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer font-semibold"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name} {c.grade_level ? `(${c.grade_level})` : ''}</option>
              ))}
            </select>
          </div>

          {/* Subject filter */}
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-purple-600 dark:text-purple-400 shrink-0" />
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{isKm ? 'មុខវិជ្ជា:' : 'Subject:'}</span>
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-[#282a32] bg-white dark:bg-[#16171b] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 cursor-pointer font-semibold"
            >
              <option value="">{isKm ? 'ទាំងអស់' : 'All Subjects'}</option>
              {subjectOptions.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Date Picker */}
          <div className="flex items-center gap-2">
            <CalendarBlank size={16} className="text-amber-500 shrink-0" />
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{isKm ? 'ថ្ងៃខែឆ្នាំប្រឡង/ស្រង់ពិន្ទុ:' : 'Date:'}</span>
            <input
              type="date"
              value={rankingDate}
              onChange={(e) => setRankingDate(e.target.value)}
              className="px-3 py-1 text-xs rounded-xl border border-slate-200 dark:border-[#282a32] bg-white dark:bg-[#16171b] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer font-semibold"
            />
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {selectedClass && (
            <div className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              <span className="font-semibold text-slate-700 dark:text-slate-200">{selectedClass.name}</span>
              {selectedClass.grade_level && <span className="ml-1.5 px-2 py-0.5 bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-300 rounded-full text-[10px] font-bold">{selectedClass.grade_level}</span>}
            </div>
          )}
          <ViewModeToggle />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 dark:bg-[#16171b] p-1 rounded-xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-white dark:bg-[#1c1d22] text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ===== GRADES TAB ===== */}
      {activeTab === 'grades' && (
        <div className="rounded-2xl border border-slate-200/80 dark:border-[#282a32] bg-white dark:bg-[#1c1d22] overflow-hidden shadow-xs">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-100 dark:border-[#282a32]">
                <TableHead className="w-14 text-center">{isKm ? 'ចំណាត់' : 'Rank'}</TableHead>
                <TableHead>{isKm ? 'អត្តលេខ' : 'ID'}</TableHead>
                <TableHead>{isKm ? 'ឈ្មោះសិស្ស' : 'Name'}</TableHead>
                <TableHead>{isKm ? 'មុខវិជ្ជា' : 'Subjects'}</TableHead>
                <TableHead className="text-center">{isKm ? 'និទ្ទេស' : 'Grade'}</TableHead>
                <TableHead className="text-right">{isKm ? 'មធ្យមភាគ' : 'Average'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <TableRow key={i} className="border-slate-100 dark:border-[#282a32]">
                      {Array.from({ length: 6 }).map((_, c) => (
                        <TableCell key={c} className="py-3.5">
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </>
              ) : gradesData.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-10 text-xs text-slate-400">{isKm ? 'មិនទាន់មានទិន្នន័យពិន្ទុ' : 'No grade records found.'}</TableCell></TableRow>
              ) : (
                gradesData.map((g) => (
                  <TableRow key={g.student_id} className="hover:bg-slate-50/80 dark:hover:bg-[#16171b] border-slate-100 dark:border-[#282a32]">
                    <TableCell className="text-center">
                      <span className={`inline-flex items-center justify-center h-6 w-6 rounded-full text-xs font-bold ${rankBadge(g.rank)}`}>
                        {g.rank === 1 ? '🥇' : g.rank === 2 ? '🥈' : g.rank === 3 ? '🥉' : g.rank}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-blue-600 dark:text-blue-400 font-bold">
                      {g.student_code || `STU-${g.student_id}`}
                    </TableCell>
                    <TableCell className="font-medium text-slate-800 dark:text-white text-xs">{g.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {g.grades.slice(0, 3).map((gr, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded-md text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                            {gr.subject?.split(' ')[0]} <span className="font-bold text-blue-600 dark:text-blue-400">{gr.score}</span>
                          </span>
                        ))}
                        {g.grades.length > 3 && <span className="text-[10px] text-slate-400">+{g.grades.length - 3}</span>}
                        {g.grades.length === 0 && <span className="text-[10px] text-slate-400">-</span>}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${gradeColor(g.letter_grade || 'F')}`}>
                        {g.letter_grade || '-'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-xs font-black text-blue-600 dark:text-blue-400">
                      {typeof g.average === 'number' ? `${g.average.toFixed(1)}` : '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* ===== CLASS RANKING TAB ===== */}
      {activeTab === 'ranking-class' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl">
            <Trophy size={24} weight="fill" className="text-amber-600 dark:text-amber-400" />
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{isKm ? 'ចំណាត់ថ្នាក់ក្នុងថ្នាក់' : 'Class Rankings'}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{isKm ? `ចំណាត់ថ្នាក់សិស្សទូទៅ - ${selectedClass?.name || ''}` : `Overall student rankings - ${selectedClass?.name || ''}`}</p>
            </div>
          </div>
          <RankingsTable data={rankingsData} loading={rankingsLoading} scope="class" isKm={isKm} date={rankingDate} />
        </div>
      )}

      {/* ===== SUBJECT RANKING TAB ===== */}
      {activeTab === 'ranking-subject' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 border border-purple-200 dark:border-purple-800 rounded-2xl flex-wrap">
            <Medal size={24} weight="fill" className="text-purple-600 dark:text-purple-400 shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{isKm ? 'ចំណាត់ថ្នាក់តាមមុខវិជ្ជា' : 'Subject Rankings'}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{isKm ? 'ចំណាត់ថ្នាក់សិស្សតាមមុខវិជ្ជា' : 'Student rankings by specific subject'}</p>
            </div>
            <select
              value={rankSubject}
              onChange={(e) => setRankSubject(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl border border-purple-200 dark:border-purple-800 bg-white dark:bg-[#16171b] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 cursor-pointer"
            >
              <option value="">{isKm ? '-- ជ្រើសមុខវិជ្ជា --' : '-- Choose Subject --'}</option>
              {subjectOptions.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          {!rankSubject ? (
            <div className="text-center py-10 text-xs text-slate-400">{isKm ? 'សូមជ្រើសរើសមុខវិជ្ជាសិន' : 'Please select a subject first'}</div>
          ) : (
            <RankingsTable data={rankingsData} loading={rankingsLoading} scope="subject" isKm={isKm} date={rankingDate} />
          )}
        </div>
      )}

      {/* ===== SCHOOL RANKING TAB ===== */}
      {activeTab === 'ranking-school' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex-wrap">
            <ArrowsDownUp size={24} weight="bold" className="text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{isKm ? 'ចំណាត់ថ្នាក់ទូទាំងសាលា' : 'School Rankings'}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{isKm ? 'ចំណាត់ថ្នាក់ប្រៀបធៀបសិស្សទូទាំងកម្រិតថ្នាក់' : 'Cross-class student rankings by grade level'}</p>
            </div>
            <select
              value={rankGradeLevel}
              onChange={(e) => setRankGradeLevel(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-[#16171b] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer font-semibold"
            >
              {gradeLevels.map((gl) => <option key={gl} value={gl}>{gl}</option>)}
            </select>
          </div>
          <RankingsTable data={rankingsData} loading={rankingsLoading} scope="school" isKm={isKm} showClass date={rankingDate} />
        </div>
      )}

      {/* Enter Scores Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-white dark:bg-[#1c1d22] rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-[#282a32] max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
              <X size={18} />
            </button>
            <div className="flex items-center gap-3 mb-5">
              <div className="h-10 w-10 rounded-2xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Exam size={22} weight="fill" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{isKm ? 'បញ្ចូលពិន្ទុសិស្ស' : 'Enter Student Scores'}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{isKm ? 'ជ្រើសមុខវិជ្ជា & បញ្ចូលពិន្ទុ (/ 100)' : 'Select subject & enter scores (out of 100)'}</p>
              </div>
            </div>
            <form onSubmit={handleSaveScores} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{isKm ? 'មុខវិជ្ជា' : 'Subject'} *</label>
                  <select value={subject} onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#282a32] bg-white dark:bg-[#16171b] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer">
                    {(assignedSubjects.length > 0 ? assignedSubjects : SUBJECT_OPTIONS).map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{isKm ? 'ប្រភេទប្រឡង' : 'Exam Type'} *</label>
                  <select value={examType} onChange={(e) => setExamType(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#282a32] bg-white dark:bg-[#16171b] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer">
                    {EXAM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-2 border-t border-b border-slate-100 dark:border-[#282a32] py-3 max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-[#282a32]">
                {gradesData.map((s) => (
                  <div key={s.student_id} className="pt-2 first:pt-0 flex items-center justify-between gap-3">
                    <span className="text-xs font-medium text-slate-800 dark:text-white truncate">{s.name}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      <input type="number" min="0" max="100" step="0.5" required
                        value={scoreInputs[s.student_id] || ''}
                        onChange={(e) => setScoreInputs({ ...scoreInputs, [s.student_id]: e.target.value })}
                        className="w-20 px-2.5 py-1 text-center font-bold text-xs rounded-lg border border-slate-200 dark:border-[#282a32] bg-slate-50 dark:bg-[#16171b] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                      <span className="text-xs text-slate-400">/ 100</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer">
                  {isKm ? 'បោះបង់' : 'Cancel'}
                </button>
                <Button type="submit" disabled={saving}
                  className="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl cursor-pointer">
                  {saving ? (isKm ? 'កំពុងរក្សា...' : 'Saving...') : (isKm ? 'រក្សាទុកពិន្ទុ' : 'Save Grades')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== Rankings Table Component =====
function RankingsTable({
  data, loading, scope, isKm, showClass, date
}: {
  data: RankingData | null;
  loading: boolean;
  scope: string;
  isKm: boolean;
  showClass?: boolean;
  date?: string;
}) {
  const { viewMode } = useUIStore();

  if (loading) return (
    <div className="rounded-2xl border border-slate-200 dark:border-[#282a32] bg-white dark:bg-[#1c1d22] p-10 text-center text-xs text-slate-400">
      {isKm ? 'កំពុងទាញ​ចំណាត់ថ្នាក់...' : 'Loading rankings...'}
    </div>
  );
  if (!data || data.results.length === 0) return (
    <div className="rounded-2xl border border-slate-200 dark:border-[#282a32] bg-white dark:bg-[#1c1d22] p-10 text-center text-xs text-slate-400">
      {isKm ? 'មិនទាន់មានទិន្នន័យ' : 'No ranking data available.'}
    </div>
  );

  return (
    <div className="space-y-3">
      {/* Date Banner */}
      {date && (
        <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/25 border border-blue-200/60 dark:border-blue-900/40 text-xs">
          <div className="flex items-center gap-2 font-medium text-blue-900 dark:text-blue-200">
            <CalendarBlank size={16} className="text-blue-500" />
            <span>{isKm ? 'កាលបរិច្ឆេទចំណាត់ថ្នាក់៖' : 'Evaluation Date:'}</span>
            <strong className="font-bold">{formatKhmerDate(date)} ({date})</strong>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-bold">
            {data.results.length} {isKm ? 'សិស្ស' : 'Students'}
          </span>
        </div>
      )}

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {data.results.map((r, idx) => {
            const score = scope === 'subject' ? r.score : r.average;
            const letter = r.letter_grade || (score != null ? getLetterGrade(score) : '-');
            return (
              <div
                key={r.student_id}
                className={`relative rounded-2xl border p-4 bg-white dark:bg-[#15171e] transition-all duration-200 hover:shadow-lg ${
                  idx === 0
                    ? 'border-amber-400/80 shadow-md shadow-amber-500/10 ring-1 ring-amber-400/30'
                    : idx === 1
                    ? 'border-slate-300 dark:border-slate-600'
                    : idx === 2
                    ? 'border-orange-400/60'
                    : 'border-slate-200/80 dark:border-white/[0.07]'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`inline-flex items-center justify-center h-7 w-7 rounded-full text-xs font-bold ${rankBadge(r.rank)}`}>
                    {r.rank === 1 ? '🥇' : r.rank === 2 ? '🥈' : r.rank === 3 ? '🥉' : r.rank}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${gradeColor(letter)}`}>
                    {letter}
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                    {r.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">{r.name}</h4>
                    <p className="text-[11px] font-mono text-blue-600 dark:text-blue-400 font-semibold truncate mt-0.5">
                      {r.student_code || `STU-${r.student_id}`}
                    </p>
                  </div>
                </div>

                {showClass && r.class_name && (
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
                    {isKm ? 'ថ្នាក់៖' : 'Class:'} <span className="font-semibold text-slate-700 dark:text-slate-200">{r.class_name}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    {scope === 'subject' ? (isKm ? 'ពិន្ទុមុខវិជ្ជា' : 'Subject Score') : (isKm ? 'មធ្យមភាគសរុប' : 'Average')}
                  </span>
                  <span className="text-sm font-black text-blue-600 dark:text-blue-400">
                    {score != null ? score.toFixed(1) : '-'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200/80 dark:border-[#282a32] bg-white dark:bg-[#1c1d22] overflow-hidden shadow-xs">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-100 dark:border-[#282a32]">
                <TableHead className="w-16 text-center">{isKm ? 'ចំណាត់' : 'Rank'}</TableHead>
                <TableHead>{isKm ? 'អត្តលេខ' : 'ID'}</TableHead>
                <TableHead>{isKm ? 'ឈ្មោះ' : 'Name'}</TableHead>
                {showClass && <TableHead>{isKm ? 'ថ្នាក់' : 'Class'}</TableHead>}
                <TableHead className="text-center">{isKm ? 'និទ្ទេស' : 'Grade'}</TableHead>
                <TableHead className="text-right">
                  {scope === 'subject' ? (isKm ? 'ពិន្ទុ' : 'Score') : (isKm ? 'មធ្យមភាគ' : 'Average')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.results.map((r, idx) => {
                const score = scope === 'subject' ? r.score : r.average;
                const letter = r.letter_grade || (score != null ? getLetterGrade(score) : '-');
                return (
                  <TableRow key={r.student_id} className={`hover:bg-slate-50/80 dark:hover:bg-[#16171b] border-slate-100 dark:border-[#282a32] ${idx < 3 ? 'bg-gradient-to-r ' + (idx === 0 ? 'from-amber-50/60 dark:from-amber-950/10' : idx === 1 ? 'from-slate-50/80 dark:from-slate-900/10' : 'from-orange-50/60 dark:from-orange-950/10') + ' to-transparent' : ''}`}>
                    <TableCell className="text-center">
                      <span className={`inline-flex items-center justify-center h-7 w-7 rounded-full text-xs font-bold ${rankBadge(r.rank)}`}>
                        {r.rank === 1 ? '🥇' : r.rank === 2 ? '🥈' : r.rank === 3 ? '🥉' : r.rank}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-blue-600 dark:text-blue-400 font-bold">
                      {r.student_code || `STU-${r.student_id}`}
                    </TableCell>
                    <TableCell className="font-medium text-slate-800 dark:text-white text-xs">{r.name}</TableCell>
                    {showClass && <TableCell className="text-xs text-slate-500 dark:text-slate-400">{r.class_name}</TableCell>}
                    <TableCell className="text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${gradeColor(letter)}`}>
                        {letter}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-xs font-black text-blue-600 dark:text-blue-400">
                      {score != null ? score.toFixed(1) : '-'}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

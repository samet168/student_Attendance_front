'use client';

import React, { useState, useEffect } from 'react';
import { Award, PlusCircle, RefreshCw, Save, CheckCircle2, TrendingUp } from 'lucide-react';
import { ClassItem, GradeItem } from '@/types';
import { api } from '@/lib/api';

interface TeacherGradesProps {
  selectedClass: ClassItem | null;
}

const DEFAULT_SUBJECTS = [
  'គណិតវិទ្យា (Math)',
  'ភាសាខ្មែរ (Khmer)',
  'រូបវិទ្យា (Physics)',
  'ភាសាអង់គ្លេស (English)',
  'គីមីវិទ្យា (Chemistry)',
  'ជីវវិទ្យា (Biology)'
];

export const TeacherGrades: React.FC<TeacherGradesProps> = ({ selectedClass }) => {
  const [students, setStudents] = useState<GradeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showInputModal, setShowInputModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(DEFAULT_SUBJECTS[0]);
  const [examDate, setExamDate] = useState(new Date().toISOString().split('T')[0]);
  const [inputScores, setInputScores] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (selectedClass) {
      loadGrades();
    }
  }, [selectedClass]);

  const loadGrades = async () => {
    if (!selectedClass) return;
    setLoading(true);
    try {
      const data = await api.getGradesMatrix(selectedClass.id);
      setStudents(data);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openInputModal = (subj: string) => {
    setSelectedSubject(subj);
    // Pre-populate with existing scores for this subject if any
    const scores: Record<number, string> = {};
    students.forEach((s) => {
      const g = s.grades.find((item) => item.subject.toLowerCase() === subj.toLowerCase());
      if (g) {
        scores[s.student_id] = String(g.score);
      }
    });
    setInputScores(scores);
    setShowInputModal(true);
  };

  const handleSaveScores = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass) return;
    setSaving(true);
    try {
      const records = Object.entries(inputScores)
        .filter(([_, score]) => score !== '' && !isNaN(Number(score)))
        .map(([idStr, score]) => ({
          student_id: Number(idStr),
          score: parseFloat(score),
        }));

      await api.saveGrades(selectedClass.id, selectedSubject, examDate, records);
      setShowInputModal(false);
      setMsg(`បានរក្សាទុកពិន្ទុ ${selectedSubject} ដោយជោគជ័យ!`);
      loadGrades();
      setTimeout(() => setMsg(null), 3000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Header Card */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">គ្រប់គ្រងពិន្ទុ និងចំណាត់ថ្នាក់</h2>
            <p className="text-xs text-slate-500">
              ថ្នាក់: <span className="font-semibold text-blue-600">{selectedClass?.name}</span> • គណនាមធ្យមភាគ និងចំណាត់ថ្នាក់ស្វ័យប្រវត្តិ
            </p>
          </div>

          <button
            onClick={() => openInputModal(selectedSubject)}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 flex items-center justify-center space-x-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>បញ្ចូលពិន្ទុតេស្ត</span>
          </button>
        </div>

        {/* Subject Quick Selector Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          {DEFAULT_SUBJECTS.map((sub) => (
            <button
              key={sub}
              onClick={() => openInputModal(sub)}
              className="px-3 py-1.5 rounded-xl text-[11px] font-semibold bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 whitespace-nowrap transition border border-slate-200"
            >
              + {sub}
            </button>
          ))}
        </div>
      </div>

      {msg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {/* Grade Ranking Table Card */}
      {loading ? (
        <div className="bg-white rounded-3xl p-8 text-center text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
          <p className="text-xs">កំពុងផ្ទុកពិន្ទុ...</p>
        </div>
      ) : students.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center text-slate-400">
          <p className="text-xs">មិនទាន់មានទិន្នន័យសិស្សនៅឡើយទេ</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {students.map((student) => {
            const isTop = student.rank === 1;
            return (
              <div
                key={student.student_id}
                className={`bg-white rounded-2xl p-4 border transition-all ${
                  isTop
                    ? 'border-amber-300 bg-gradient-to-r from-amber-50/50 via-white to-white shadow-md shadow-amber-500/10'
                    : 'border-slate-200/80 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {/* Rank Badge */}
                    <div
                      className={`w-9 h-9 rounded-2xl flex items-center justify-center font-black text-xs shrink-0 ${
                        student.rank === 1
                          ? 'bg-amber-400 text-amber-950 shadow-md shadow-amber-400/40'
                          : student.rank === 2
                          ? 'bg-slate-300 text-slate-800'
                          : student.rank === 3
                          ? 'bg-amber-700 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {student.rank !== '-' ? `លេខ ${student.rank}` : '-'}
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                        <span>{student.name}</span>
                        {isTop && <span className="text-[10px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded-md font-bold">Top 1 🏆</span>}
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        កូដ: {student.student_code} • លេខរៀងទី {student.roll_no}
                      </p>
                    </div>
                  </div>

                  {/* Average & Grade Letter */}
                  <div className="text-right">
                    <div className="flex items-baseline justify-end space-x-1.5">
                      <span className="text-sm font-extrabold text-blue-600">
                        {student.average > 0 ? student.average.toFixed(1) : '-'}
                      </span>
                      <span className="text-[10px] text-slate-400">/ 100</span>
                      <span
                        className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                          student.letter_grade === 'A'
                            ? 'bg-emerald-100 text-emerald-800'
                            : student.letter_grade === 'B'
                            ? 'bg-blue-100 text-blue-800'
                            : student.letter_grade === 'C'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {student.letter_grade}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">មធ្យមភាគ</span>
                  </div>
                </div>

                {/* Mini Subject Scores Tags */}
                {student.grades && student.grades.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap gap-1.5">
                    {student.grades.map((g, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center space-x-1 text-[10px] px-2 py-0.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-600"
                      >
                        <span className="font-semibold">{g.subject.split(' ')[0]}:</span>
                        <span className="font-bold text-blue-700">{g.score}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Input Scores */}
      {showInputModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">បញ្ចូលពិន្ទុ: {selectedSubject}</h3>
                <p className="text-xs text-slate-500">ថ្នាក់: {selectedClass?.name}</p>
              </div>
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none"
              />
            </div>

            {/* Scrollable list of students with score inputs */}
            <form onSubmit={handleSaveScores} className="flex-1 overflow-y-auto py-3 space-y-2.5">
              {students.map((s) => (
                <div
                  key={s.student_id}
                  className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200/80"
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="w-6 h-6 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center text-[11px] font-bold">
                      {s.roll_no}
                    </span>
                    <span className="text-xs font-bold text-slate-800">{s.name}</span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="100"
                      placeholder="ពិន្ទុ"
                      value={inputScores[s.student_id] ?? ''}
                      onChange={(e) =>
                        setInputScores({ ...inputScores, [s.student_id]: e.target.value })
                      }
                      className="w-20 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-center font-bold text-blue-700 outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    <span className="text-[10px] text-slate-400">/ 100</span>
                  </div>
                </div>
              ))}

              <div className="flex items-center space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowInputModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold shadow-md hover:from-blue-700 hover:to-indigo-700"
                >
                  {saving ? 'កំពុងរក្សាទុក...' : 'រក្សាទុកពិន្ទុ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

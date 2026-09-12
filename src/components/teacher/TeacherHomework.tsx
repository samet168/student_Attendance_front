'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, PlusCircle, Upload, FileText, CheckCircle2, Clock, Eye, ExternalLink, RefreshCw } from 'lucide-react';
import { ClassItem, HomeworkItem, SubmissionItem } from '@/types';
import { api } from '@/lib/api';

interface TeacherHomeworkProps {
  selectedClass: ClassItem | null;
}

export const TeacherHomework: React.FC<TeacherHomeworkProps> = ({ selectedClass }) => {
  const [homeworks, setHomeworks] = useState<HomeworkItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedHw, setSelectedHw] = useState<HomeworkItem | null>(null);
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('គណិតវិទ្យា (Math)');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Grading states
  const [gradingScores, setGradingScores] = useState<Record<number, string>>({});
  const [gradingFeedbacks, setGradingFeedbacks] = useState<Record<number, string>>({});

  useEffect(() => {
    if (selectedClass) {
      loadHomeworks();
    }
  }, [selectedClass]);

  const loadHomeworks = async () => {
    if (!selectedClass) return;
    setLoading(true);
    try {
      const data = await api.getHomeworks(selectedClass.id);
      setHomeworks(data);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateHomework = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass || !title || !deadline) return;

    setUploading(true);
    try {
      let fileUrl = '';
      let fileName = '';

      if (selectedFile) {
        // Upload to Cloudinary via backend proxy
        const uploadRes = await api.uploadFile(selectedFile);
        fileUrl = uploadRes.file_url;
        fileName = uploadRes.file_name;
      }

      await api.createHomework({
        class_id: selectedClass.id,
        title,
        subject,
        description,
        file_url: fileUrl,
        file_name: fileName,
        deadline,
      });

      setTitle('');
      setDescription('');
      setSelectedFile(null);
      setShowCreateModal(false);
      loadHomeworks();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  const openReviewModal = async (hw: HomeworkItem) => {
    setSelectedHw(hw);
    setShowReviewModal(true);
    setLoadingSubmissions(true);
    try {
      const data = await api.getHomeworkSubmissions(hw.id);
      setSubmissions(data);

      const scores: Record<number, string> = {};
      const feedbacks: Record<number, string> = {};
      data.forEach((s) => {
        if (s.score !== null && s.score !== undefined) scores[s.id] = String(s.score);
        if (s.feedback) feedbacks[s.id] = s.feedback;
      });
      setGradingScores(scores);
      setGradingFeedbacks(feedbacks);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleSaveGrade = async (subId: number) => {
    const scoreVal = gradingScores[subId];
    if (scoreVal === undefined || isNaN(Number(scoreVal))) {
      alert('សូមបញ្ចូលពិន្ទុឱ្យបានត្រឹមត្រូវ');
      return;
    }

    try {
      await api.gradeSubmission(subId, parseFloat(scoreVal), gradingFeedbacks[subId]);
      alert('បានដាក់ពិន្ទុ និងមតិយោបល់ដោយជោគជ័យ!');
      if (selectedHw) openReviewModal(selectedHw);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Header Card */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">ដាក់កិច្ចការ & មេរៀន (Assignments)</h2>
          <p className="text-xs text-slate-500">
            ថ្នាក់: <span className="font-semibold text-blue-600">{selectedClass?.name}</span> • ផ្ទុកឯកសារទៅកាន់ Cloudinary
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 hover:from-indigo-700 hover:to-violet-700 flex items-center justify-center space-x-1.5"
        >
          <PlusCircle className="w-4 h-4" />
          <span>បង្កើតកិច្ចការថ្មី</span>
        </button>
      </div>

      {/* Homework Cards List */}
      {loading ? (
        <div className="bg-white rounded-3xl p-8 text-center text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
          <p className="text-xs">កំពុងទាញបញ្ជីកិច្ចការ...</p>
        </div>
      ) : homeworks.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center text-slate-400">
          <p className="text-xs">មិនទាន់មានកិច្ចការផ្ទះនៅឡើយទេ</p>
        </div>
      ) : (
        <div className="space-y-3">
          {homeworks.map((hw) => (
            <div
              key={hw.id}
              className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 mb-1">
                    {hw.subject}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">{hw.title}</h3>
                </div>

                <div className="flex items-center space-x-1 text-[11px] font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded-xl shrink-0">
                  <Clock className="w-3.5 h-3.5" />
                  <span>ផុតកំណត់: {hw.deadline}</span>
                </div>
              </div>

              {hw.description && (
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  {hw.description}
                </p>
              )}

              {/* Cloudinary Attachment Preview */}
              {hw.file_url && (
                <a
                  href={hw.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl transition border border-blue-200"
                >
                  <FileText className="w-4 h-4 text-blue-500" />
                  <span className="font-semibold truncate max-w-[200px]">{hw.file_name || 'ទាញយកឯកសារមេរៀន (Cloudinary)'}</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-1" />
                </a>
              )}

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  បានផ្ញើមក: <strong className="text-indigo-600">{hw.submission_count || 0}</strong> / {hw.total_students || 0} នាក់
                </span>

                <button
                  onClick={() => openReviewModal(hw)}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center space-x-1 shadow-sm"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>ពិនិត្យ និងកែពិន្ទុ</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Create Homework */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 mb-4">ដាក់កិច្ចការថ្មី</h3>
            <form onSubmit={handleCreateHomework} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">ចំណងជើងកិច្ចការ</label>
                <input
                  type="text"
                  placeholder="ឧ. លំហាត់សមីការដឺក្រេទី ១"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">មុខវិជ្ជា</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:ring-2 focus:ring-indigo-600"
                >
                  <option value="គណិតវិទ្យា (Math)">គណិតវិទ្យា (Math)</option>
                  <option value="ភាសាខ្មែរ (Khmer)">ភាសាខ្មែរ (Khmer)</option>
                  <option value="រូបវិទ្យា (Physics)">រូបវិទ្យា (Physics)</option>
                  <option value="ភាសាអង់គ្លេស (English)">ភាសាអង់គ្លេស (English)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">ការណែនាំ ឬលំហាត់</label>
                <textarea
                  rows={3}
                  placeholder="សរសេរការណែនាំ ឬកិច្ចការដែលត្រូវធ្វើ..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Upload ឯកសារមេរៀន/រូបភាព (Cloudinary)
                </label>
                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">កាលបរិច្ឆេទផុតកំណត់ (Deadline)</label>
                <input
                  type="datetime-local"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow"
                >
                  {uploading ? 'កំពុង Upload...' : 'បង្ហោះកិច្ចការ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Review & Grade Submissions */}
      {showReviewModal && selectedHw && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">ពិនិត្យកិច្ចការសិស្ស</h3>
                <p className="text-xs text-slate-500">{selectedHw.title}</p>
              </div>
              <button
                onClick={() => setShowReviewModal(false)}
                className="text-xs text-slate-400 hover:text-slate-700 px-2 py-1 rounded-lg"
              >
                ✕ បិទ
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-3">
              {loadingSubmissions ? (
                <div className="py-12 text-center text-slate-400">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
                  <p className="text-xs">កំពុងទាញកិច្ចការដែលបានផ្ញើ...</p>
                </div>
              ) : submissions.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <p className="text-xs">មិនទាន់មានសិស្សណាផ្ញើកិច្ចការមកនៅឡើយទេ</p>
                </div>
              ) : (
                submissions.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">
                          {sub.roll_no}. {sub.student_name}
                        </h4>
                        <p className="text-[10px] text-slate-400">
                          កូដ: {sub.student_code} • ផ្ញើនៅ: {sub.submitted_at?.split('T')[0]}
                        </p>
                      </div>

                      {/* View Student's Attached File from Cloudinary */}
                      <a
                        href={sub.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 text-xs text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-xl font-semibold border border-indigo-200"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>បើកមើល File</span>
                      </a>
                    </div>

                    {sub.student_note && (
                      <p className="text-xs text-slate-600 italic bg-white p-2 rounded-xl border border-slate-100">
                        "{sub.student_note}"
                      </p>
                    )}

                    {/* Grading Form */}
                    <div className="pt-2 border-t border-slate-200 flex items-center space-x-2">
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max="100"
                        placeholder="ពិន្ទុ (0-100)"
                        value={gradingScores[sub.id] ?? ''}
                        onChange={(e) =>
                          setGradingScores({ ...gradingScores, [sub.id]: e.target.value })
                        }
                        className="w-24 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-indigo-700 outline-none focus:ring-2 focus:ring-indigo-600"
                      />
                      <input
                        type="text"
                        placeholder="មតិយោបល់ / Feedback..."
                        value={gradingFeedbacks[sub.id] ?? ''}
                        onChange={(e) =>
                          setGradingFeedbacks({ ...gradingFeedbacks, [sub.id]: e.target.value })
                        }
                        className="flex-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-600"
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveGrade(sub.id)}
                        className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold shadow hover:bg-indigo-700"
                      >
                        ដាក់ពិន្ទុ
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

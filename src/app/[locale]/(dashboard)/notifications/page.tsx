'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useUIStore } from '@/stores/use-ui-store';
import { 
  Megaphone, SpeakerHigh, SpeakerSlash, CheckCircle, 
  Trash, Broadcast, Clock, DownloadSimple 
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { SkeletonList } from '@/components/ui/skeleton';
import { playNotificationSound } from '@/lib/audio';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/use-auth-store';

interface NotificationItem {
  id: number;
  title: string;
  message: string;
  sender_name?: string;
  class_name?: string;
  type: string;
  sound_type: string;
  file_url?: string | null;
  file_name?: string | null;
  created_at: string;
  is_read?: boolean;
}

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 1,
    title: 'កាលវិភាគប្រឡងឆមាសទី ១ ប្រចាំឆ្នាំសិក្សា ២០២៦ (Final Exam Schedule)',
    message: 'សូមសិស្សានុសិស្សទាំងអស់ពិនិត្យមើលកាលវិភាគប្រឡងផ្លូវការ និងបន្ទប់ប្រឡងតាមមុខវិជ្ជា។',
    sender_name: 'ការិយាល័យសិក្សា',
    class_name: 'សិស្សទាំងអស់ (All)',
    type: 'announcement',
    sound_type: 'bell',
    file_name: 'exam_schedule_2026.pdf',
    file_url: 'https://res.cloudinary.com/demo/image/upload/sample.pdf',
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    is_read: true,
  },
  {
    id: 2,
    title: 'កិច្ចការផ្ទះគណិតវិទ្យា៖ ជំពូកទី ៤ (សមីការដឺក្រេទី២)',
    message: 'គ្រូបានដាក់លំហាត់អនុវត្តចំនួន ៥ លំហាត់ កាលបរិច្ឆេទផុតកំណត់នៅថ្ងៃសុក្រនេះ។',
    sender_name: 'លោកគ្រូ សុខា',
    class_name: 'Grade 10-A',
    type: 'homework',
    sound_type: 'chime',
    file_name: null,
    file_url: null,
    created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    is_read: false,
  },
  {
    id: 3,
    title: 'ការជូនដំណឹងអំពីថ្ងៃឈប់សម្រាកបុណ្យជាតិ (Holiday Notice)',
    message: 'សាលារៀននឹងត្រូវឈប់សម្រាករយៈពេល ២ ថ្ងៃ ចាប់ពីថ្ងៃចន្ទ ដល់ថ្ងៃអង្គារសប្ដាហ៍ក្រោយ។',
    sender_name: 'គណៈគ្រប់គ្រងសាលា',
    class_name: 'សិស្សទាំងអស់ (All)',
    type: 'holiday',
    sound_type: 'gentle',
    file_name: null,
    file_url: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    is_read: true,
  },
];

export default function TeacherNotificationsPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'km';
  const isKm = locale === 'km';
  const { user } = useAuthStore();
  const { soundEnabled, setSoundEnabled } = useUIStore();

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetClass, setTargetClass] = useState('all');
  const [classes, setClasses] = useState<any[]>([]);
  const [notifType, setNotifType] = useState('announcement');
  const [soundType, setSoundType] = useState('bell');
  const [fileName, setFileName] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successBanner, setSuccessBanner] = useState(false);

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      const data = await api.getClasses();
      if (Array.isArray(data)) {
        setClasses(data);
      }
    } catch {
      setClasses([]);
    }
  };

  const loadNotifications = async () => {
    try {
      const data = await api.getNotifications();
      if (Array.isArray(data)) {
        setNotifications(data);
      } else {
        setNotifications([]);
      }
    } catch {
      setNotifications([]);
    } finally {
      setNotificationsLoading(false);
    }
  };

  const handleTestSound = (type: string) => {
    playNotificationSound(type, 0.85);
  };

  const handleToggleGlobalSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    if (next) {
      playNotificationSound(soundType, 0.85);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    setSubmitting(true);
    playNotificationSound(soundType, 0.85);

    const newNotif: NotificationItem = {
      id: Date.now(),
      title: title.trim(),
      message: message.trim(),
      sender_name: user?.full_name || user?.name || (isKm ? 'លោកគ្រូ/អ្នកគ្រូ' : 'Teacher'),
      class_name: targetClass === 'all' ? (isKm ? 'សិស្សទាំងអស់' : 'All Students') : targetClass,
      type: notifType,
      sound_type: soundType,
      file_name: fileName.trim() || null,
      file_url: fileUrl.trim() || null,
      created_at: new Date().toISOString(),
      is_read: false,
    };

    setNotifications((prev) => [newNotif, ...prev]);

    try {
      await api.createNotification({
        title: title.trim(),
        message: message.trim(),
        type: notifType,
        sound_type: soundType,
        file_url: fileUrl.trim() || undefined,
        file_name: fileName.trim() || undefined,
      });
    } catch {
      // already added optimistically
    } finally {
      setTitle('');
      setMessage('');
      setFileName('');
      setFileUrl('');
      setSubmitting(false);
      setSuccessBanner(true);
      setTimeout(() => setSuccessBanner(false), 4000);
    }
  };

  const handleDelete = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Megaphone size={20} weight="fill" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              {isKm ? 'មជ្ឈមណ្ឌលផ្ញើការជូនដំណឹង (Broadcasts)' : 'Teacher Broadcast Center'}
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isKm 
              ? 'បង្កើត និងផ្សព្វផ្សាយសេចក្ដីប្រកាស កិច្ចការផ្ទះ និងដំណឹងសំខាន់ៗជាមួយសំឡេងកណ្ដឹងរោទិ៍ដល់សិស្ស' 
              : 'Create and broadcast announcements, homework alerts, and notices with real-time audio chimes to students.'}
          </p>
        </div>

        {/* Quick Sound Toggle & Test Pill */}
        <div className="flex items-center gap-2 bg-white dark:bg-[#1c1d22] border border-slate-200/80 dark:border-[#282a32] p-1.5 pl-3 rounded-2xl shadow-xs">
          <button
            onClick={handleToggleGlobalSound}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold transition cursor-pointer ${
              soundEnabled
                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/80'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900'
            }`}
            title={soundEnabled ? (isKm ? 'សំឡេងបើក (ចុចដើម្បីបិទ)' : 'Sound ON (Click to mute)') : (isKm ? 'សំឡេងបិទ (ចុចដើម្បីបើក)' : 'Sound Muted')}
          >
            {soundEnabled ? (
              <SpeakerHigh size={15} weight="bold" />
            ) : (
              <SpeakerSlash size={15} weight="bold" />
            )}
            <span>{soundEnabled ? (isKm ? 'សំឡេង: បើក' : 'Sound: ON') : (isKm ? 'សំឡេង: បិទ' : 'Sound: OFF')}</span>
          </button>

          <div className="h-4 w-px bg-slate-200 dark:bg-[#282a32]" />

          {/* Tone Preview Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleTestSound('bell')}
              className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 dark:bg-[#16171b] dark:hover:bg-[#282a32] text-slate-700 dark:text-slate-200 rounded-xl transition cursor-pointer"
            >
              Bell
            </button>
            <button
              onClick={() => handleTestSound('chime')}
              className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 dark:bg-[#16171b] dark:hover:bg-[#282a32] text-slate-700 dark:text-slate-200 rounded-xl transition cursor-pointer"
            >
              Chime
            </button>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successBanner && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2.5 text-xs font-semibold">
            <CheckCircle size={18} weight="fill" className="text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{isKm ? 'បានផ្ញើការជូនដំណឹងដល់សិស្សដោយជោគជ័យ រួមទាំងសំឡេងកណ្ដឹង!' : 'Announcement dispatched successfully to students with audio alert!'}</span>
          </div>
        </div>
      )}

      {/* Main Grid: Form Left, Sent History Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Compose Form */}
        <div className="lg:col-span-5">
          <div className="rounded-2xl border border-slate-200/80 dark:border-[#282a32] bg-white dark:bg-[#1c1d22] p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Broadcast size={18} className="text-blue-600 dark:text-blue-400" />
              <span>{isKm ? 'ផ្សព្វផ្សាយដំណឹងថ្មី (Compose Broadcast)' : 'Compose New Announcement'}</span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isKm ? 'ចំណងជើងដំណឹង' : 'Title'} *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={isKm ? 'ឧ. កាលវិភាគប្រឡង ឬលំហាត់អនុវត្ត...' : 'e.g. Exam Schedule or Homework 3...'}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-[#282a32] bg-slate-50 dark:bg-[#16171b] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    {isKm ? 'ផ្ញើទៅកាន់' : 'Audience'}
                  </label>
                  <select
                    value={targetClass}
                    onChange={(e) => setTargetClass(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#282a32] bg-white dark:bg-[#16171b] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                  >
                    <option value="all">{isKm ? 'សិស្សគ្រប់ថ្នាក់ (All Classes)' : 'All My Classes'}</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name} ({c.grade_level})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    {isKm ? 'ប្រភេទ' : 'Category'}
                  </label>
                  <select
                    value={notifType}
                    onChange={(e) => setNotifType(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#282a32] bg-white dark:bg-[#16171b] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                  >
                    <option value="announcement">{isKm ? '📢 សេចក្ដីប្រកាស' : 'Announcement'}</option>
                    <option value="homework">{isKm ? '📝 កិច្ចការផ្ទះ' : 'Homework Alert'}</option>
                    <option value="exam">{isKm ? '🏆 ការប្រឡង' : 'Exam Notice'}</option>
                    <option value="holiday">{isKm ? '🌴 ថ្ងៃឈប់សម្រាក' : 'Holiday Notice'}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isKm ? 'ខ្លឹមសារលម្អិត' : 'Message Body'} *
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={isKm ? 'សរសេរខ្លឹមសារដំណឹងដែលចង់ប្រាប់សិស្សនៅទីនេះ...' : 'Enter the complete announcement details...'}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-[#282a32] bg-slate-50 dark:bg-[#16171b] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition resize-none"
                />
              </div>

              {/* Sound alert tone selector */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {isKm ? 'សំឡេងកណ្ដឹងរោទិ៍ពេលផ្ញើដល់សិស្ស' : 'Audio Alert Chime'}
                  </label>
                  <button
                    type="button"
                    onClick={() => handleTestSound(soundType)}
                    className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <SpeakerHigh size={13} />
                    <span>{isKm ? 'សាកល្បងស្តាប់' : 'Play Sound'}</span>
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'bell', label: isKm ? 'កណ្ដឹង (Bell)' : 'Bell Chime' },
                    { id: 'chime', label: isKm ? 'សំឡេង Chime' : 'Digital Chime' },
                    { id: 'gentle', label: isKm ? 'សំឡេងស្រាល (Gentle)' : 'Gentle Tone' },
                    { id: 'urgent', label: isKm ? 'សំឡេងបន្ទាន់ (Urgent)' : 'Urgent Alert' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setSoundType(s.id);
                        handleTestSound(s.id);
                      }}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold text-left border transition cursor-pointer flex items-center justify-between ${
                        soundType === s.id
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 shadow-2xs'
                          : 'border-slate-200 dark:border-[#282a32] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#16171b]'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <SpeakerHigh size={13} className={soundType === s.id ? 'text-blue-600' : 'text-slate-400'} />
                        {s.label}
                      </span>
                      {soundType === s.id && <CheckCircle size={14} weight="fill" className="text-blue-600 dark:text-blue-400" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional Attachment File URL */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isKm ? 'ឯកសារភ្ជាប់ (ស្រេចចិត្ត)' : 'File Attachment (Optional)'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    placeholder={isKm ? 'ឈ្មោះឯកសារ (ឧ. Lesson1.pdf)' : 'File Name (e.g. sheet.pdf)'}
                    className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#282a32] bg-slate-50 dark:bg-[#16171b] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <input
                    type="url"
                    value={fileUrl}
                    onChange={(e) => setFileUrl(e.target.value)}
                    placeholder="https://... (Link)"
                    className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#282a32] bg-slate-50 dark:bg-[#16171b] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-10 text-xs font-bold gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/25"
                >
                  <Megaphone size={16} weight="bold" />
                  <span>
                    {submitting 
                      ? (isKm ? 'កំពុងផ្ញើដំណឹង...' : 'Broadcasting...') 
                      : (isKm ? 'ផ្ញើដំណឹងភ្លាម (Send Broadcast)' : 'Send Broadcast Now')}
                  </span>
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Right: Sent Announcements List */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-2xl border border-slate-200/80 dark:border-[#282a32] bg-white dark:bg-[#1c1d22] p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {isKm ? 'ប្រវត្តិនៃការជូនដំណឹងដែលបានផ្ញើ' : 'Broadcast History'}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {notificationsLoading ? '...' : `${notifications.length} ${isKm ? 'ដំណឹងដែលបានផ្សព្វផ្សាយ' : 'announcements dispatched'}`}
                </p>
              </div>
            </div>

            {notificationsLoading ? (
              <div className="pt-1">
                <SkeletonList count={4} withAvatar={false} />
              </div>
            ) : (
            <div className="divide-y divide-slate-100 dark:divide-[#282a32] space-y-3 pt-1">
              {notifications.map((item) => (
                <div
                  key={item.id}
                  className="pt-3 first:pt-0 pb-2 flex flex-col justify-between gap-2 hover:bg-slate-50/60 dark:hover:bg-[#16171b] p-2.5 rounded-xl transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          {item.class_name || 'All Students'}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-[#16171b] text-slate-600 dark:text-slate-300 capitalize inline-flex items-center gap-1 border border-slate-200/60 dark:border-[#282a32]">
                          <SpeakerHigh size={11} className="text-blue-500" />
                          {item.sound_type}
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock size={12} />
                          {new Date(item.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {item.message}
                      </p>

                      {item.file_name && (
                        <div className="pt-1">
                          <a
                            href={item.file_url || '#'}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-[#16171b] border border-slate-200/60 dark:border-[#282a32] text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition"
                          >
                            <DownloadSimple size={13} weight="bold" />
                            <span>{item.file_name}</span>
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleTestSound(item.sound_type)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-slate-100 dark:hover:bg-[#16171b] transition cursor-pointer"
                        title={isKm ? 'ស្តាប់សំឡេងកណ្ដឹង' : 'Play audio chime'}
                      >
                        <SpeakerHigh size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
                        title={isKm ? 'លុបដំណឹង' : 'Delete'}
                      >
                        <Trash size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

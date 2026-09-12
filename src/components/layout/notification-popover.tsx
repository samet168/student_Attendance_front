'use client';

import React, { useState, useEffect } from 'react';
import { 
  Bell, BellRinging, Check, DownloadSimple, SpeakerHigh, 
  SpeakerSlash, Paperclip, Plus, X, Broadcast, Gear,
  Sliders, Play, CheckCircle
} from '@phosphor-icons/react';
import { api } from '@/lib/api';
import { playNotificationSound } from '@/lib/audio';
import { useUIStore } from '@/stores/use-ui-store';
import { useAuthStore } from '@/stores/use-auth-store';

export const NotificationPopover: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSoundSettings, setShowSoundSettings] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [newSound, setNewSound] = useState('bell');
  const [creating, setCreating] = useState(false);

  const { soundEnabled, setSoundEnabled, soundType, setSoundType, language } = useUIStore();
  const { user } = useAuthStore();
  const isKm = language === 'km';

  const isTeacher = user?.role === 'teacher';

  const DEFAULT_NOTIFICATIONS = [
    {
      id: 991,
      title: isKm ? 'ដំណឹងសំខាន់៖ កាលវិភាគប្រឡងឆមាសទី១' : 'Important Notice: Semester 1 Exam Schedule',
      message: isKm ? 'សូមសិស្សានុសិស្សទាំងអស់ពិនិត្យមើលកាលវិភាគប្រឡងផ្លូវការដែលបានភ្ជាប់មកជាមួយនេះ។' : 'All students please check the official examination schedule attached.',
      sender_name: isKm ? 'ការិយាល័យសិក្សា' : 'Academic Affairs',
      type: 'announcement',
      sound_type: 'bell',
      file_url: 'https://res.cloudinary.com/demo/image/upload/sample.pdf',
      file_name: 'exam_schedule_2026.pdf',
      created_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
      is_read: false,
    },
    {
      id: 992,
      title: isKm ? 'កិច្ចការផ្ទះថ្មី៖ មុខវិជ្ជាគណិតវិទ្យា (ជំពូកទី ៤)' : 'New Assignment: Advanced Mathematics (Chapter 4)',
      message: isKm ? 'គ្រូបានដាក់លំហាត់អនុវត្តចំនួន ៥ លំហាត់ កាលបរិច្ឆេទផុតកំណត់នៅថ្ងៃសុក្រនេះ។' : 'Instructor uploaded 5 practice exercises due this Friday.',
      sender_name: isKm ? 'លោកគ្រូ សុខា' : 'Mr. Sokha',
      type: 'homework',
      sound_type: 'chime',
      file_url: null,
      file_name: null,
      created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      is_read: false,
    },
    {
      id: 993,
      title: isKm ? 'ការបង់ថ្លៃសិក្សាប្រចាំខែថ្មី' : 'Tuition Fee Invoice Available',
      message: isKm ? 'វិក្កយបត្រថ្លៃសិក្សាប្រចាំខែថ្មីត្រូវបានបង្កើតរួចរាល់ហើយ។ សូមពិនិត្យនៅក្នុងទំព័រវិក្កយបត្រ។' : 'New monthly tuition invoice has been issued. Check billing page.',
      sender_name: isKm ? 'គណនេយ្យករ' : 'School Bursar',
      type: 'billing',
      sound_type: 'gentle',
      file_url: null,
      file_name: null,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      is_read: true,
    },
  ];

  const isInitialLoadRef = React.useRef(true);
  const lastAlertedIdRef = React.useRef<number>(0);
  const alertedIdsSetRef = React.useRef<Set<number>>(new Set());

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [isKm]);

  const loadNotifications = async () => {
    try {
      const data = await api.getNotifications();
      if (Array.isArray(data) && data.length > 0) {
        const unread = data.filter((n) => !n.is_read).length;
        const latest = data[0];
        const latestId = Number(latest?.id) || 0;

        if (isInitialLoadRef.current) {
          // Initial page load: register existing notifications so we DO NOT play sound on refresh/load
          isInitialLoadRef.current = false;
          lastAlertedIdRef.current = latestId;
          data.forEach((n) => alertedIdsSetRef.current.add(Number(n.id)));
        } else {
          // Runtime: Check if there is a genuinely NEW unread notification from teacher
          const isNewNotification =
            latestId > 0 &&
            !alertedIdsSetRef.current.has(latestId) &&
            latestId > lastAlertedIdRef.current &&
            !latest.is_read;

          if (isNewNotification) {
            alertedIdsSetRef.current.add(latestId);
            lastAlertedIdRef.current = latestId;
            // Play sound alert EXACTLY ONCE
            if (soundEnabled) {
              playNotificationSound(latest?.sound_type || soundType, 0.85);
            }
          }
        }

        setNotifications(data);
        setUnreadCount(unread);
        return;
      }
    } catch {
      // fallback to preloaded if empty or 401
    }

    setNotifications((prev) => {
      if (prev.length === 0) {
        const unread = DEFAULT_NOTIFICATIONS.filter((n) => !n.is_read).length;
        setUnreadCount(unread);
        DEFAULT_NOTIFICATIONS.forEach((n) => alertedIdsSetRef.current.add(n.id));
        return DEFAULT_NOTIFICATIONS;
      }
      return prev;
    });
    isInitialLoadRef.current = false;
  };

  const handleToggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    if (nextState) {
      playNotificationSound(soundType, 0.85);
    }
  };

  const handleMarkRead = async (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    try {
      await api.markNotificationRead(id);
    } catch {
      // ignore
    }
  };

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
    try {
      await api.markAllNotificationsRead();
    } catch {
      // ignore
    }
  };

  const handleCreateNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newMessage.trim()) return;

    setCreating(true);
    const newNotifItem = {
      id: Date.now(),
      title: newTitle,
      message: newMessage,
      sender_name: user?.name || user?.full_name || (isKm ? 'អ្នកគ្រប់គ្រង' : 'Teacher Admin'),
      type: 'announcement',
      sound_type: newSound,
      file_url: null,
      file_name: null,
      created_at: new Date().toISOString(),
      is_read: false,
    };

    if (soundEnabled) {
      playNotificationSound(newSound, 0.85);
    }

    setNotifications((prev) => [newNotifItem, ...prev]);
    setUnreadCount((prev) => prev + 1);

    try {
      await api.createNotification({
        title: newTitle,
        message: newMessage,
        type: 'announcement',
        sound_type: newSound,
      });
    } catch {
      // Keep optimistic entry
    } finally {
      setNewTitle('');
      setNewMessage('');
      setShowCreateModal(false);
      setCreating(false);
    }
  };

  const soundOptions = [
    { id: 'bell', label: isKm ? 'កណ្ដឹងសាលា (Bell)' : 'School Bell' },
    { id: 'chime', label: isKm ? 'សំឡេង Chime' : 'Digital Chime' },
    { id: 'gentle', label: isKm ? 'សំឡេងស្រាល (Gentle)' : 'Gentle Tone' },
    { id: 'urgent', label: isKm ? 'សំឡេងបន្ទាន់ (Urgent)' : 'Urgent Alert' },
  ];

  return (
    <div className="relative inline-block text-left">
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
        title={isKm ? 'ការជូនដំណឹង' : 'Notifications'}
      >
        {unreadCount > 0 ? (
          <BellRinging size={20} weight="fill" className="text-blue-600 dark:text-blue-400 animate-bounce" />
        ) : (
          <Bell size={20} />
        )}
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-xs">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Card */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-84 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/90 dark:border-slate-800 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
            {/* Header with Sound Toggle */}
            <div className="flex items-center justify-between px-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 dark:text-white text-sm">
                  {isKm ? 'ការជូនដំណឹង' : 'Notifications'}
                </span>
                {unreadCount > 0 && (
                  <span className="text-xs bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-semibold">
                    {unreadCount}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                {/* Sound On / Off Button */}
                <button
                  onClick={handleToggleSound}
                  className={`p-1.5 rounded-lg transition cursor-pointer flex items-center gap-1 text-xs font-medium ${
                    soundEnabled
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/50'
                      : 'text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                  title={
                    soundEnabled
                      ? (isKm ? 'សំឡេងបើក (ចុចដើម្បីបិទ)' : 'Sound ON (Click to mute)')
                      : (isKm ? 'សំឡេងបិទ (ចុចដើម្បីបើក)' : 'Sound Muted (Click to enable)')
                  }
                >
                  {soundEnabled ? (
                    <SpeakerHigh size={16} weight="bold" />
                  ) : (
                    <SpeakerSlash size={16} weight="bold" className="text-rose-500" />
                  )}
                  <span className="text-[10px] font-semibold hidden sm:inline">
                    {soundEnabled ? (isKm ? 'សំឡេង: បើក' : 'Sound: ON') : (isKm ? 'សំឡេង: បិទ' : 'Muted')}
                  </span>
                </button>

                {/* Sound options gear toggle */}
                <button
                  onClick={() => setShowSoundSettings(!showSoundSettings)}
                  className={`p-1.5 rounded-lg transition cursor-pointer ${
                    showSoundSettings
                      ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white'
                      : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  title={isKm ? 'កំណត់ប្រភេទសំឡេង' : 'Sound Settings'}
                >
                  <Sliders size={16} />
                </button>

                {/* Create Notification Button (Teacher only) */}
                {isTeacher && (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/40 px-2 py-1 rounded-lg transition cursor-pointer"
                  >
                    <Plus size={12} weight="bold" />
                    <span>{isKm ? 'ផ្ញើដំណឹង' : 'Post'}</span>
                  </button>
                )}

                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium cursor-pointer"
                  >
                    {isKm ? 'អានទាំងអស់' : 'Mark all read'}
                  </button>
                )}
              </div>
            </div>

            {/* Quick Sound Control Panel (Expandable) */}
            {showSoundSettings && (
              <div className="px-4 py-3 bg-slate-50/90 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800 text-xs space-y-2.5 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {soundEnabled ? (
                      <SpeakerHigh size={16} className="text-blue-600 dark:text-blue-400" />
                    ) : (
                      <SpeakerSlash size={16} className="text-rose-500" />
                    )}
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {isKm ? 'សំឡេងជូនដំណឹង (Sound Alert)' : 'Notification Sound Alert'}
                    </span>
                  </div>

                  {/* Toggle Switch */}
                  <button
                    onClick={handleToggleSound}
                    className={`w-10 h-5.5 rounded-full transition-colors p-0.5 flex items-center cursor-pointer ${
                      soundEnabled ? 'bg-blue-600 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
                    }`}
                  >
                    <span className="w-4.5 h-4.5 rounded-full bg-white shadow-xs" />
                  </button>
                </div>

                {soundEnabled && (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      <span>{isKm ? 'ជ្រើសរើសប្រភេទសំឡេង៖' : 'Choose alert tone:'}</span>
                      <button
                        onClick={() => playNotificationSound(soundType, 0.85)}
                        className="inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                      >
                        <Play size={11} weight="fill" />
                        <span>{isKm ? 'សាកល្បង' : 'Test Tone'}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5">
                      {soundOptions.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => {
                            setSoundType(opt.id);
                            playNotificationSound(opt.id, 0.85);
                          }}
                          className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-left border transition cursor-pointer flex items-center justify-between ${
                            soundType === opt.id
                              ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold'
                              : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'
                          }`}
                        >
                          <span className="truncate">{opt.label}</span>
                          {soundType === opt.id && (
                            <CheckCircle size={13} weight="fill" className="text-blue-600 dark:text-blue-400 shrink-0 ml-1" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Notification List */}
            <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {notifications.length === 0 ? (
                <div className="py-10 text-center text-slate-400 dark:text-slate-500 text-xs flex flex-col items-center justify-center">
                  <Broadcast size={28} className="text-slate-300 dark:text-slate-600 mb-2" />
                  <span>{isKm ? 'មិនទាន់មានការជូនដំណឹងនៅឡើយទេ' : 'No notifications yet'}</span>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3.5 hover:bg-slate-50/90 dark:hover:bg-slate-800/50 transition flex items-start justify-between gap-3 ${
                      !n.is_read ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
                    }`}
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${!n.is_read ? 'bg-blue-600 ring-2 ring-blue-200 dark:ring-blue-900' : 'bg-slate-300 dark:bg-slate-600'}`} />
                        <h5 className="font-bold text-slate-900 dark:text-white text-xs line-clamp-1">{n.title}</h5>
                        {n.sound_type && (
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded capitalize inline-flex items-center gap-1">
                            <SpeakerHigh size={10} className="text-blue-500" />
                            {n.sound_type}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">{n.message}</p>
                      
                      {/* Attached Download File if exists */}
                      {n.file_url && (
                        <a
                          href={api.getDownloadUrl(n.id)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:border-blue-300 rounded-lg text-xs font-semibold transition shadow-2xs"
                        >
                          <DownloadSimple size={14} weight="bold" />
                          <span>{n.file_name || (isKm ? 'ទាញយកឯកសារភ្ជាប់' : 'Download Attachment')}</span>
                        </a>
                      )}

                      <div className="text-[10px] text-slate-400 dark:text-slate-500 pt-1">
                        {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {n.sender_name || 'Teacher'}
                      </div>
                    </div>

                    {!n.is_read && (
                      <button
                        onClick={() => handleMarkRead(n.id)}
                        className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer shrink-0"
                        title={isKm ? 'សម្គាល់ថាបានអាន' : 'Mark as read'}
                      >
                        <Check size={16} />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* Modal to create a notification (Teacher only) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="h-9 w-9 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                <Broadcast size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {isKm ? 'បង្កើតការជូនដំណឹងថ្មី' : 'Create New Notification'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isKm ? 'ផ្ញើដំណឹងជាមួយសំឡេងកណ្ដឹងដល់សិស្ស' : 'Send audio alert announcement to students'}
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateNotification} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  {isKm ? 'ចំណងជើង' : 'Title'} *
                </label>
                <input
                  type="text"
                  required
                  placeholder={isKm ? 'ឧ. កិច្ចការផ្ទះថ្មី ឬដំណឹងប្រឡង...' : 'e.g. New Homework or Exam schedule...'}
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  {isKm ? 'ខ្លឹមសារដំណឹង' : 'Message Content'} *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder={isKm ? 'សរសេរខ្លឹមសារដំណឹងនៅទីនេះ...' : 'Enter your announcement details here...'}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    {isKm ? 'សំឡេងរោទិ៍' : 'Audio Tone'}
                  </label>
                  <select
                    value={newSound}
                    onChange={(e) => {
                      setNewSound(e.target.value);
                      if (soundEnabled) {
                        playNotificationSound(e.target.value, 0.85);
                      }
                    }}
                    className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                  >
                    <option value="bell">{isKm ? 'កណ្ដឹងសាលា (Bell)' : 'School Bell'}</option>
                    <option value="chime">{isKm ? 'សំឡេង Chime' : 'Digital Chime'}</option>
                    <option value="gentle">{isKm ? 'សំឡេងស្រាល (Gentle)' : 'Gentle Ding'}</option>
                    <option value="urgent">{isKm ? 'សំឡេងបន្ទាន់ (Urgent)' : 'Urgent Alert'}</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => playNotificationSound(newSound, 0.85)}
                    className="w-full h-9 flex items-center justify-center gap-1.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition cursor-pointer"
                  >
                    <SpeakerHigh size={14} />
                    <span>{isKm ? 'ស្តាប់សំឡេង' : 'Preview'}</span>
                  </button>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  {isKm ? 'បោះបង់' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm shadow-blue-500/20 transition cursor-pointer disabled:opacity-50"
                >
                  {creating ? (isKm ? 'កំពុងផ្ញើ...' : 'Sending...') : (isKm ? 'ផ្ញើដំណឹងភ្លាម' : 'Send Notification')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationPopover;

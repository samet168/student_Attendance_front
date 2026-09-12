'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/use-auth-store';
import {
  UserCircle, EnvelopeSimple, Phone, IdentificationCard,
  PencilSimple, CheckCircle, SpinnerGap, X, Camera
} from '@phosphor-icons/react';
import { StudentIdCard } from '@/components/student/student-id-card';

export default function StudentProfilePage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'km';
  const isKm = locale === 'km';
  const { setUser } = useAuthStore();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  // Edit fields
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.getMe();
      setProfile(data);
    } catch {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openEdit = () => {
    setEditName(profile?.name || '');
    setEditPhone(profile?.phone || '');
    setEditAvatar(profile?.avatar_url || '');
    setEditing(true);
    setError(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const updated = await api.updateProfile({
        name: editName.trim(),
        phone: editPhone.trim() || undefined,
        avatar_url: editAvatar.trim() || undefined,
      });
      setProfile(updated);
      setUser(updated);
      setEditing(false);
      setSuccessMsg(isKm ? 'បានកែប្រែព័ត៌មានដោយជោគជ័យ!' : 'Profile updated successfully!');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const name = profile?.name || profile?.full_name || '';
  const initials = name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || '?';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <SpinnerGap size={32} className="animate-spin text-violet-600" />
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-xl mx-auto">
      {/* Profile Hero */}
      <div className="bg-gradient-to-br from-violet-700 to-indigo-700 rounded-3xl p-6 text-white shadow-xl shadow-violet-900/20 flex flex-col items-center text-center">
        {/* Avatar */}
        <div className="relative mb-4">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt={name} className="w-20 h-20 rounded-full object-cover ring-4 ring-white/30 shadow-lg" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center text-2xl font-black text-white shadow-lg">
              {initials}
            </div>
          )}
          <button
            onClick={openEdit}
            className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-white text-violet-600 flex items-center justify-center shadow-lg hover:bg-violet-50 transition cursor-pointer"
          >
            <Camera size={13} weight="bold" />
          </button>
        </div>
        <h1 className="text-xl font-extrabold">{name}</h1>
        <p className="text-sm text-violet-200 mt-0.5">
          {profile?.student_code ? `#${profile.student_code}` : (isKm ? 'សិស្ស' : 'Student')}
        </p>
        <span className="mt-2 px-3 py-0.5 bg-white/20 rounded-full text-xs font-semibold">
          {isKm ? 'គណនីសិស្ស' : 'Student Account'}
        </span>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle size={16} weight="fill" className="text-emerald-600 shrink-0" /> {successMsg}
        </div>
      )}

      {/* Digital Student ID Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <h2 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
          <IdentificationCard size={18} className="text-violet-600 dark:text-violet-400" />
          <span>{isKm ? 'កាតសិស្សឌីជីថល (Digital ID Card)' : 'Digital Student ID Card'}</span>
        </h2>
        {profile && (
          <StudentIdCard
            student={profile}
            locale={locale}
          />
        )}
      </div>

      {/* Info Cards */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 shadow-xs overflow-hidden">
        {[
          { icon: UserCircle, label: isKm ? 'ឈ្មោះ' : 'Full Name', value: name, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-950/40' },
          { icon: EnvelopeSimple, label: isKm ? 'អ៊ីមែល' : 'Email', value: profile?.email || '—', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/40' },
          { icon: Phone, label: isKm ? 'លេខទូរស័ព្ទ' : 'Phone', value: profile?.phone || (isKm ? 'មិនទាន់បញ្ចូល' : 'Not set'), color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/40' },
          { icon: IdentificationCard, label: isKm ? 'អត្តលេខសិស្ស' : 'Student ID', value: profile?.student_code || '—', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/40' },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="flex items-center gap-4 px-4 py-3.5">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${item.bg}`}>
                <Icon size={17} weight="bold" className={item.color} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{item.label}</p>
                <p className="text-xs font-semibold text-slate-800 dark:text-white mt-0.5 truncate">{item.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Button */}
      <button
        onClick={openEdit}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold shadow-lg shadow-violet-500/25 transition cursor-pointer"
      >
        <PencilSimple size={14} weight="bold" />
        {isKm ? 'កែប្រែព័ត៌មានផ្ទាល់ខ្លួន' : 'Edit Profile'}
      </button>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <button onClick={() => setEditing(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
              <X size={18} />
            </button>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                <PencilSimple size={18} weight="bold" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{isKm ? 'កែប្រែគណនី' : 'Edit Profile'}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{isKm ? 'ធ្វើបច្ចុប្បន្នភាពឈ្មោះ ទូរស័ព្ទ និង Avatar' : 'Update your name, phone and avatar'}</p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{isKm ? 'ឈ្មោះ' : 'Full Name'} *</label>
                <input type="text" required value={editName} onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{isKm ? 'លេខទូរស័ព្ទ' : 'Phone Number'}</label>
                <input type="text" value={editPhone} onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="012 345 678"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{isKm ? 'URL រូបភាព Avatar' : 'Avatar Image URL'}</label>
                <input type="url" value={editAvatar} onChange={(e) => setEditAvatar(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500" />
                {editAvatar && (
                  <img src={editAvatar} alt="preview" className="mt-2 w-12 h-12 rounded-full object-cover border-2 border-violet-200 shadow-sm" onError={(e) => (e.currentTarget.style.display = 'none')} />
                )}
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => setEditing(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer">
                  {isKm ? 'បោះបង់' : 'Cancel'}
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold shadow-sm disabled:opacity-50 transition cursor-pointer">
                  {saving ? (isKm ? 'កំពុងរក្សាទុក...' : 'Saving...') : (isKm ? 'រក្សាទុក' : 'Save Changes')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

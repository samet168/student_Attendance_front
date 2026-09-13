'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/use-auth-store';
import {
  UserCircle, EnvelopeSimple, Phone, IdentificationCard,
  PencilSimple, CheckCircle, SpinnerGap, X, Camera, GraduationCap
} from '@phosphor-icons/react';
import { StudentIdCard } from '@/components/student/student-id-card';
import { SkeletonProfile } from '@/components/ui/skeleton';

export default function StudentProfilePage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'km';
  const isKm = locale === 'km';
  const { setUser } = useAuthStore();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
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
    setAvatarFile(null);
    setAvatarPreview(profile?.avatar_url || '');
    setEditing(true);
    setError(null);
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Validate type and size (max 5MB)
    if (!file.type.startsWith('image/')) {
      setError(isKm ? 'សូមជ្រើសឯកសាររូបភាពប៉ុណ្ណោះ' : 'Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError(isKm ? 'រូបភាពធំពេក (max 5MB)' : 'Image too large (max 5MB)');
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setError(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      let finalAvatarUrl = editAvatar;

      // Upload new avatar to Cloudinary if a file was selected
      if (avatarFile) {
        setUploadingAvatar(true);
        try {
          const res = await api.uploadFile(avatarFile);
          finalAvatarUrl = res.file_url;
        } catch {
          setError(isKm ? 'បរាជ័យក្នុងការ Upload រូបភាព' : 'Failed to upload avatar');
          setSaving(false);
          setUploadingAvatar(false);
          return;
        } finally {
          setUploadingAvatar(false);
        }
      }

      const updated = await api.updateProfile({
        name: editName.trim(),
        phone: editPhone.trim() || undefined,
        avatar_url: finalAvatarUrl || undefined,
      });
      setProfile(updated);
      setUser(updated);
      setEditing(false);
      setAvatarFile(null);
      setSuccessMsg(isKm ? 'បានកែប្រែព័ត៌មានដោយជោគជ័យ!' : 'Profile updated successfully!');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const name = profile?.name || profile?.full_name || '';
  const initials = name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || '?';

  if (loading) {
    return (
      <div className="max-w-xl mx-auto">
        <SkeletonProfile />
      </div>
    );
  }

  const infoFields = [
    { icon: UserCircle, label: isKm ? 'ឈ្មោះ' : 'Full Name', value: name, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-500/10', border: 'border-violet-200 dark:border-violet-500/20' },
    { icon: EnvelopeSimple, label: isKm ? 'អ៊ីមែល' : 'Email', value: profile?.email || '—', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10', border: 'border-blue-200 dark:border-blue-500/20' },
    { icon: Phone, label: isKm ? 'លេខទូរស័ព្ទ' : 'Phone', value: profile?.phone || (isKm ? 'មិនទាន់បញ្ចូល' : 'Not set'), color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-200 dark:border-emerald-500/20' },
    { icon: IdentificationCard, label: isKm ? 'អត្តលេខសិស្ស' : 'Student ID', value: profile?.student_code || '—', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-200 dark:border-amber-500/20' },
  ];

  return (
    <div className="space-y-5 max-w-xl mx-auto">
      {/* Profile Hero */}
      <div
        className="relative overflow-hidden rounded-3xl p-6 text-white shadow-2xl flex flex-col items-center text-center"
        style={{
          background: 'linear-gradient(135deg, #6d28d9 0%, #4f46e5 60%, #7c3aed 100%)',
          boxShadow: '0 20px 40px -12px rgba(109,40,217,0.4)',
        }}
      >
        {/* decorative */}
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10 -translate-y-1/3 translate-x-1/4"
          style={{ background: 'radial-gradient(circle, #fff 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-10 translate-y-1/3 -translate-x-1/4"
          style={{ background: 'radial-gradient(circle, #c4b5fd 0%, transparent 70%)' }} />

        {/* Avatar */}
        <div className="relative mb-4 z-10">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt={name} className="w-24 h-24 rounded-3xl object-cover shadow-2xl" style={{ border: '2px solid rgba(255,255,255,0.25)' }} />
          ) : (
            <div
              className="w-24 h-24 rounded-3xl flex items-center justify-center text-3xl font-black text-white shadow-2xl"
              style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', border: '2px solid rgba(255,255,255,0.2)' }}
            >
              {initials}
            </div>
          )}
          <button
            onClick={openEdit}
            className="absolute -bottom-1.5 -right-1.5 w-8 h-8 rounded-xl bg-white text-violet-600 flex items-center justify-center shadow-lg hover:bg-violet-50 transition cursor-pointer"
          >
            <Camera size={14} weight="bold" />
          </button>
        </div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold mb-2"
            style={{ background: 'rgba(255,255,255,0.15)' }}>
            <GraduationCap size={12} weight="fill" />
            {isKm ? 'គណនីសិស្ស' : 'Student Account'}
          </div>
          <h1 className="text-2xl font-extrabold">{name}</h1>
          <p className="text-sm text-violet-200 mt-0.5">
            {profile?.student_code ? `#${profile.student_code}` : (isKm ? 'សិស្ស' : 'Student')}
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-2xl border border-emerald-500/20 text-emerald-700 bg-emerald-50 text-xs flex items-center gap-2 dark:text-emerald-400 dark:bg-emerald-500/[0.08]">
          <CheckCircle size={16} weight="fill" className="text-emerald-500 shrink-0" /> {successMsg}
        </div>
      )}

      {/* Digital Student ID Card */}
      <div className="rounded-3xl p-5 border border-neutral-200 bg-white dark:border-white/5 dark:bg-white/[0.02]">
        <h2 className="text-xs font-bold text-neutral-700 dark:text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
          <IdentificationCard size={16} className="text-violet-600 dark:text-violet-400" />
          <span>{isKm ? 'កាតសិស្សឌីជីថល' : 'Digital Student ID Card'}</span>
        </h2>
        {profile && (
          <StudentIdCard
            student={profile}
            locale={locale}
          />
        )}
      </div>

      {/* Info Fields */}
      <div className="rounded-2xl border border-neutral-200 bg-white overflow-hidden dark:border-white/5 dark:bg-white/[0.02]">
        {infoFields.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className={`flex items-center gap-4 px-4 py-3.5 transition hover:bg-neutral-50 dark:hover:bg-white/[0.02] ${idx > 0 ? 'border-t border-neutral-100 dark:border-white/[0.05]' : ''}`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${item.bg} border ${item.border}`}>
                <Icon size={16} weight="bold" className={item.color} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-neutral-500 dark:text-slate-600 font-medium">{item.label}</p>
                <p className="text-xs font-semibold text-neutral-800 dark:text-slate-200 mt-0.5 truncate">{item.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Button */}
      <button
        onClick={openEdit}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-white text-xs font-bold shadow-lg shadow-violet-900/40 transition hover:brightness-110 cursor-pointer"
        style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
      >
        <PencilSimple size={14} weight="bold" />
        {isKm ? 'កែប្រែព័ត៌មានផ្ទាល់ខ្លួន' : 'Edit Profile'}
      </button>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div
            className="relative rounded-3xl w-full max-w-md p-6 shadow-2xl border border-neutral-200 bg-white dark:border-white/10 dark:bg-[#12141f]"
          >
            <button onClick={() => setEditing(false)} className="absolute top-4 right-4 text-neutral-500 hover:text-neutral-900 cursor-pointer transition dark:text-slate-500 dark:hover:text-white">
              <X size={18} />
            </button>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-violet-50 border border-violet-200 text-violet-600 flex items-center justify-center dark:bg-violet-500/10 dark:border-violet-500/20 dark:text-violet-400">
                <PencilSimple size={18} weight="bold" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white">{isKm ? 'កែប្រែគណនី' : 'Edit Profile'}</h3>
                <p className="text-xs text-neutral-500 dark:text-slate-500">{isKm ? 'ធ្វើបច្ចុប្បន្នភាពឈ្មោះ ទូរស័ព្ទ និង Avatar' : 'Update your name, phone and avatar'}</p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400">
                {error}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              {[
                { label: isKm ? 'ឈ្មោះ' : 'Full Name', required: true, type: 'text', value: editName, onChange: (e: any) => setEditName(e.target.value), placeholder: '' },
                { label: isKm ? 'លេខទូរស័ព្ទ' : 'Phone Number', required: false, type: 'text', value: editPhone, onChange: (e: any) => setEditPhone(e.target.value), placeholder: '012 345 678' },
              ].map((f) => (
                <div key={f.label}>
                  <label className="block text-xs font-semibold text-neutral-600 dark:text-slate-400 mb-1.5">{f.label} {f.required && '*'}</label>
                  <input
                    type={f.type}
                    required={f.required}
                    value={f.value}
                    onChange={f.onChange}
                    placeholder={f.placeholder}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-neutral-300 text-neutral-900 bg-neutral-50 outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500/50 transition dark:border-white/8 dark:text-white dark:bg-white/[0.05]"
                  />
                </div>
              ))}

              {/* Avatar Upload — file picker instead of URL */}
              <div>
                <label className="block text-xs font-semibold text-neutral-600 dark:text-slate-400 mb-1.5">
                  {isKm ? 'រូបភាព Avatar' : 'Profile Picture'}
                </label>

                {/* Current / Preview */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden border border-violet-500/30 flex-shrink-0">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="preview"
                        className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-lg font-black text-white"
                        style={{ background: 'rgba(124,58,237,0.3)' }}>
                        {initials}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-[11px] text-neutral-500 dark:text-slate-400 mb-1.5">
                      {isKm ? 'JPG, PNG, WEBP — អតិបរមា 5MB' : 'JPG, PNG, WEBP — max 5MB'}
                    </p>
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-violet-700 border border-violet-200 bg-violet-50 cursor-pointer hover:bg-violet-100 transition dark:text-violet-300 dark:border-violet-500/30 dark:bg-violet-500/[0.08] dark:hover:bg-violet-500/10">
                      <Camera size={13} weight="bold" />
                      {uploadingAvatar
                        ? (isKm ? 'កំពុង Upload...' : 'Uploading...')
                        : avatarFile
                          ? (isKm ? 'ប្ដូររូបភាព' : 'Change photo')
                          : (isKm ? 'ជ្រើសរូបភាព' : 'Choose photo')}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="hidden"
                        onChange={handleAvatarFileChange}
                        disabled={uploadingAvatar || saving}
                      />
                    </label>
                  </div>
                  {avatarFile && (
                    <button
                      type="button"
                      onClick={() => { setAvatarFile(null); setAvatarPreview(editAvatar); }}
                      className="text-neutral-500 hover:text-rose-600 transition cursor-pointer p-1 dark:text-slate-600 dark:hover:text-rose-400"
                      title={isKm ? 'លប់ចោលការជ្រើស' : 'Remove selection'}
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>

                {/* Selected file name indicator */}
                {avatarFile && (
                  <div className="px-3 py-2 rounded-xl text-[11px] text-violet-700 bg-violet-50 flex items-center gap-1.5 border border-violet-200 dark:text-violet-300 dark:bg-violet-500/[0.1] dark:border-violet-500/20">
                    <CheckCircle size={12} weight="fill" className="text-violet-600 dark:text-violet-400 shrink-0" />
                    <span className="truncate">{avatarFile.name}</span>
                    <span className="text-neutral-400 flex-shrink-0 dark:text-slate-500">
                      ({(avatarFile.size / 1024).toFixed(0)} KB)
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2 border-t border-neutral-200 dark:border-white/6">
                <button type="button" onClick={() => setEditing(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold border border-neutral-300 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition cursor-pointer dark:border-white/8 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5">
                  {isKm ? 'បោះបង់' : 'Cancel'}
                </button>
                <button type="submit" disabled={saving || uploadingAvatar}
                  className="flex-1 py-2.5 rounded-xl text-white text-xs font-bold disabled:opacity-50 transition cursor-pointer flex items-center justify-center gap-1.5"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
                  {(saving || uploadingAvatar) && <SpinnerGap size={13} className="animate-spin" />}
                  {uploadingAvatar
                    ? (isKm ? 'កំពុង Upload...' : 'Uploading...')
                    : saving
                      ? (isKm ? 'កំពុងរក្សាទុក...' : 'Saving...')
                      : (isKm ? 'រក្សាទុក' : 'Save Changes')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

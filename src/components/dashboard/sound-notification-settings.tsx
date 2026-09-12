'use client';

import React, { useState } from 'react';
import { 
  SpeakerHigh, SpeakerSlash, Bell, Check, Play 
} from '@phosphor-icons/react';
import { useUIStore } from '@/stores/use-ui-store';
import { playNotificationSound } from '@/lib/audio';
import { api } from '@/lib/api';

export const SoundNotificationSettings: React.FC = () => {
  const { soundEnabled, setSoundEnabled, soundType, setSoundType, language } = useUIStore();
  const isKm = language === 'km';
  const [volume, setVolume] = useState(0.8);
  const [savedMessage, setSavedMessage] = useState(false);

  const soundOptions = [
    { id: 'bell', name: isKm ? 'កណ្ដឹងសាលា (School Bell)' : 'School Bell' },
    { id: 'chime', name: isKm ? 'សំឡេង Chime រីករាយ (Cheerful Chime)' : 'Cheerful Chime' },
    { id: 'gentle', name: isKm ? 'សំឡេងស្រាលទន់ (Gentle Tone)' : 'Gentle Tone' },
    { id: 'urgent', name: isKm ? 'សំឡេងប្រកាសបន្ទាន់ (Urgent Alert)' : 'Urgent Alert' },
  ];

  const handleTestSound = (typeToTest: string) => {
    playNotificationSound(typeToTest, volume);
  };

  const handleSaveSettings = async () => {
    try {
      await api.updateNotificationSettings({
        sound_enabled: soundEnabled,
        sound_type: soundType,
        sound_volume: volume,
        notification_enabled: true
      });
      setSavedMessage(true);
      setTimeout(() => setSavedMessage(false), 3000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs max-w-xl">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <SpeakerHigh size={22} weight="bold" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white text-base">
              {isKm ? 'សំឡេងជូនដំណឹង' : 'Sound Alerts'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isKm ? 'កំណត់សំឡេង និងការជូនដំណឹងពេលមានកិច្ចការ ឬពិន្ទុថ្មី' : 'Configure sound alert chime and real-time audio notifications'}
            </p>
          </div>
        </div>

        {/* Toggle Switch */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`w-12 h-6.5 rounded-full transition p-0.5 flex items-center cursor-pointer ${
            soundEnabled ? 'bg-blue-600 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
          }`}
        >
          <span className="w-5.5 h-5.5 rounded-full bg-white shadow-xs" />
        </button>
      </div>

      {soundEnabled ? (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              ប្រភេទសំឡេងជូនដំណឹង (Notification Sound Type)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {soundOptions.map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => {
                    setSoundType(opt.id);
                    handleTestSound(opt.id);
                  }}
                  className={`flex items-center justify-between p-3 rounded-xl border text-xs font-medium cursor-pointer transition ${
                    soundType === opt.id
                      ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 font-semibold'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span>{opt.name}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTestSound(opt.id);
                    }}
                    className="p-1 rounded-md text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-950 transition"
                    title="សាកល្បងសំឡេង / Preview Sound"
                  >
                    <Play size={13} weight="fill" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>កម្រិតសំឡេង (Volume)</span>
              <span className="text-slate-500">{Math.round(volume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>

          <div className="pt-3 flex items-center justify-between border-t border-slate-100">
            <button
              onClick={() => handleTestSound(soundType)}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Play size={14} weight="fill" className="text-blue-600" />
              <span>សាកល្បងសំឡេងបច្ចុប្បន្ន</span>
            </button>

            <button
              onClick={handleSaveSettings}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <Check size={14} weight="bold" />
              <span>{savedMessage ? 'បានរក្សាទុករួចរាល់!' : 'រក្សាទុកការកំណត់'}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="py-6 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
          <SpeakerSlash size={28} className="text-slate-300" />
          <span>សំឡេងត្រូវបានបិទ។ បើក switch ខាងលើដើម្បីទទួលសំឡេងជូនដំណឹង។</span>
        </div>
      )}
    </div>
  );
};

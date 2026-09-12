'use client';

import React from 'react';
import { ArrowsDownUp, ArrowCounterClockwise } from '@phosphor-icons/react';
import { useUIStore } from '@/stores/use-ui-store';

interface CustomOrderBannerProps {
  isCustomOrdered: boolean;
  onResetOrder: () => void;
}

export function CustomOrderBanner({ isCustomOrdered, onResetOrder }: CustomOrderBannerProps) {
  const { language } = useUIStore();
  const isKm = language === 'km';

  if (!isCustomOrdered) return null;

  return (
    <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-blue-50/90 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-xs text-blue-900 dark:text-blue-300 shadow-xs animate-in fade-in slide-in-from-top-1 duration-200">
      <div className="flex items-center gap-2">
        <div className="p-1 rounded-lg bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">
          <ArrowsDownUp size={16} weight="bold" />
        </div>
        <span className="font-medium">
          {isKm
            ? 'បានបើកលំដាប់ផ្ទាល់ខ្លួន — អូសទាញជួរដេកដើម្បីរៀបលំដាប់។ ត្រូវបានរក្សាទុកលើឧបករណ៍នេះ។'
            : 'Custom order active — drag rows to arrange. Order saved automatically on this device.'}
        </span>
      </div>
      <button
        onClick={onResetOrder}
        className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition cursor-pointer px-2.5 py-1 rounded-lg hover:bg-blue-100/60 dark:hover:bg-blue-500/20"
      >
        <ArrowCounterClockwise size={14} weight="bold" />
        <span>{isKm ? 'កំណត់លំនាំដើម' : 'Reset Order'}</span>
      </button>
    </div>
  );
}

export default CustomOrderBanner;

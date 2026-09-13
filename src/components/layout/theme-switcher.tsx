'use client';

import React, { useSyncExternalStore } from 'react';
import { Sun, Moon } from '@phosphor-icons/react';
import { useUIStore } from '@/stores/use-ui-store';

const emptySubscribe = () => () => {};

function useIsHydrated() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export function ThemeSwitcher() {
  const { theme, toggleTheme, language } = useUIStore();
  const hydrated = useIsHydrated();
  const isKm = language === 'km';

  if (!hydrated) {
    return (
      <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
    );
  }

  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className="relative p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
      title={isDark ? (isKm ? 'ប្តូរទៅ Light Mode' : 'Switch to Light Mode') : (isKm ? 'ប្តូរទៅ Dark Mode' : 'Switch to Dark Mode')}
      aria-label="Toggle Dark and Light theme"
    >
      {isDark ? (
        <Sun size={20} weight="fill" className="text-amber-400 animate-in spin-in-180 duration-200" />
      ) : (
        <Moon size={20} weight="bold" className="text-slate-600 animate-in spin-in-180 duration-200" />
      )}
    </button>
  );
}

export default ThemeSwitcher;

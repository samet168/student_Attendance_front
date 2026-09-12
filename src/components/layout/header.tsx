'use client';

import React from 'react';
import { MagnifyingGlass, List } from '@phosphor-icons/react';
import { useUIStore } from '@/stores/use-ui-store';
import { LanguageSwitcher } from './language-switcher';
import { NotificationPopover } from './notification-popover';
import { ThemeSwitcher } from './theme-switcher';
import { UserNav } from './user-nav';
import { Breadcrumbs } from '@/components/common/breadcrumbs';

export function Header() {
  const { toggleSidebar, searchQuery, setSearchQuery, language } = useUIStore();
  const isKm = language === 'km';

  return (
    <header className="h-16 border-b border-slate-200/80 dark:border-white/[0.07] bg-white/90 dark:bg-[#14161d]/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20 shadow-2xs transition-colors">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.06] transition cursor-pointer"
        >
          <List size={20} />
        </button>
        <Breadcrumbs />
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search input */}
        <div className="relative hidden md:block w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <MagnifyingGlass size={16} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isKm ? 'ស្វែងរក...' : 'Search records...'}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-100/80 dark:bg-[#1c1d25] border border-slate-200/80 dark:border-white/[0.08] rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:bg-white dark:focus:bg-[#1c1d25] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
          />
        </div>

        {/* Theme Switcher (Dark / Light) */}
        <ThemeSwitcher />

        {/* Notifications */}
        <NotificationPopover />

        {/* Language Switcher */}
        <LanguageSwitcher />

        <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-0.5 hidden sm:block" />

        {/* User profile dropdown in header */}
        <UserNav variant="header" />
      </div>
    </header>
  );
}

export default Header;

'use client';

import React from 'react';
import { Home, CalendarCheck, Award, BookOpen, User } from 'lucide-react';

export type NavTab = 'overview' | 'attendance' | 'grades' | 'homework' | 'profile';

interface MobileBottomNavProps {
  currentTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
  role: 'teacher' | 'student';
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onChangeTab,
  role,
}) => {
  const tabs = [
    { id: 'overview', label: 'ទំព័រដើម', icon: Home },
    { id: 'attendance', label: 'វត្តមាន', icon: CalendarCheck },
    { id: 'grades', label: 'ពិន្ទុ', icon: Award },
    { id: 'homework', label: 'កិច្ចការ', icon: BookOpen },
    { id: 'profile', label: 'គណនី', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/80 px-2 py-1.5 shadow-lg shadow-slate-900/5">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id as NavTab)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-blue-600 scale-105 font-semibold'
                  : 'text-slate-400 hover:text-slate-600 font-normal'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-blue-600" />
                )}
              </div>
              <span className="text-[11px] mt-1 tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

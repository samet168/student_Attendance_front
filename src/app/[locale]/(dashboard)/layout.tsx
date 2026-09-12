'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav';
import { AIStudyAssistant } from '@/components/common/ai-study-assistant';
import { useAuthStore } from '@/stores/use-auth-store';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || 'km';
  const { token } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedToken = localStorage.getItem('token');
    if (!savedToken) {
      router.push(`/${locale}/login`);
    }
  }, [router, locale]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-[#0f1117] text-slate-900 dark:text-zinc-100 transition-colors">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden bg-slate-50/60 dark:bg-[#0f1117]">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8">
          {children}
        </main>
        <MobileBottomNav role="teacher" />
        <AIStudyAssistant role="teacher" locale={locale} />
      </div>
    </div>
  );
}

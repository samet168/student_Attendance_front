'use client';

import React from 'react';
import { Translate, Check, CaretDown } from '@phosphor-icons/react';
import { useUIStore } from '@/stores/use-ui-store';
import { useRouter, useParams, usePathname } from 'next/navigation';

export const LanguageSwitcher: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { language, setLanguage } = useUIStore();
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();

  const handleSelect = (lang: 'km' | 'en') => {
    setLanguage(lang);
    setIsOpen(false);

    // Also update the URL locale segment so the URL stays in sync
    const currentLocale = (params?.locale as string) || language;
    if (lang !== currentLocale && pathname) {
      const newPath = pathname.replace(`/${currentLocale}/`, `/${lang}/`).replace(`/${currentLocale}`, `/${lang}`);
      router.push(newPath);
    }
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition cursor-pointer border border-slate-200/60 dark:border-slate-700/60"
        title="Change Language / ប្ដូរភាសា"
      >
        <Translate size={15} className="text-blue-600 dark:text-blue-400" />
        <span className="hidden sm:inline">{language === 'km' ? 'KM' : 'EN'}</span>
        <CaretDown size={11} className="text-slate-400" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-1.5 w-44 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
            <button
              onClick={() => handleSelect('km')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-medium cursor-pointer transition ${
                language === 'km'
                  ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="w-6 text-center font-bold text-[13px]">KH</span>
                <span>ភាសាខ្មែរ</span>
              </div>
              {language === 'km' && <Check size={14} className="text-blue-600 dark:text-blue-400" weight="bold" />}
            </button>
            <button
              onClick={() => handleSelect('en')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-medium cursor-pointer transition ${
                language === 'en'
                  ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="w-6 text-center font-bold text-[13px]">EN</span>
                <span>English</span>
              </div>
              {language === 'en' && <Check size={14} className="text-blue-600 dark:text-blue-400" weight="bold" />}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

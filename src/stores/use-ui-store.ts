import { create } from 'zustand';

export type Language = 'km' | 'en';
export type ViewMode = 'table' | 'grid';
export type ThemeMode = 'light' | 'dark';

interface UIState {
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  /** Mobile drawer open state (independent of desktop collapsed state) */
  mobileSidebarOpen: boolean;
  openMobileSidebar: () => void;
  closeMobileSidebar: () => void;
  toggleMobileSidebar: () => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  soundType: string;
  setSoundType: (type: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const applyThemeToDOM = (theme: ThemeMode) => {
  if (typeof document !== 'undefined') {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
};

const initialTheme: ThemeMode = typeof window !== 'undefined'
  ? ((localStorage.getItem('app_theme') as ThemeMode) || 'dark')
  : 'dark';

if (typeof window !== 'undefined') {
  applyThemeToDOM(initialTheme);
}

const initialSoundEnabled: boolean = typeof window !== 'undefined'
  ? localStorage.getItem('app_sound_enabled') !== 'false'
  : true;

const initialSoundType: string = typeof window !== 'undefined'
  ? (localStorage.getItem('app_sound_type') || 'bell')
  : 'bell';

export const useUIStore = create<UIState>((set) => ({
  language: (typeof window !== 'undefined' && localStorage.getItem('app_lang') as Language) || 'km',
  setLanguage: (lang) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('app_lang', lang);
    }
    set({ language: lang });
  },
  theme: initialTheme,
  setTheme: (theme) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('app_theme', theme);
      applyThemeToDOM(theme);
    }
    set({ theme });
  },
  toggleTheme: () => set((state) => {
    const nextTheme: ThemeMode = state.theme === 'light' ? 'dark' : 'light';
    if (typeof window !== 'undefined') {
      localStorage.setItem('app_theme', nextTheme);
      applyThemeToDOM(nextTheme);
    }
    return { theme: nextTheme };
  }),
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  mobileSidebarOpen: false,
  openMobileSidebar: () => set({ mobileSidebarOpen: true }),
  closeMobileSidebar: () => set({ mobileSidebarOpen: false }),
  toggleMobileSidebar: () => set((state) => ({ mobileSidebarOpen: !state.mobileSidebarOpen })),
  viewMode: 'table',
  setViewMode: (mode) => set({ viewMode: mode }),
  soundEnabled: initialSoundEnabled,
  setSoundEnabled: (enabled) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('app_sound_enabled', enabled ? 'true' : 'false');
    }
    set({ soundEnabled: enabled });
  },
  soundType: initialSoundType,
  setSoundType: (type) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('app_sound_type', type);
    }
    set({ soundType: type });
  },
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
}));

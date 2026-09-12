import { create } from 'zustand';

export type Language = 'km' | 'en';

export interface TranslationDictionary {
  dashboard: string;
  classes: string;
  students: string;
  attendance: string;
  grades: string;
  homework: string;
  billing: string;
  settings: string;
  systemName: string;
  searchPlaceholder: string;
  addStudent: string;
  createAssignment: string;
  exportData: string;
  exportExcel: string;
  exportPdf: string;
  exportWord: string;
  exportPptx: string;
  filterByStatus: string;
  allStatus: string;
  active: string;
  pending: string;
  inactive: string;
  sortBy: string;
  sortName: string;
  sortRoll: string;
  sortGrade: string;
  tableView: string;
  gridView: string;
  rollNo: string;
  studentCode: string;
  studentName: string;
  gender: string;
  status: string;
  totalScore: string;
  rank: string;
  actions: string;
  savedOnDevice: string;
  resetOrder: string;
  selectAll: string;
  selectedCount: string;
  teacherRole: string;
  studentRole: string;
  logout: string;
  soundAlerts: string;
  downloadAttachment: string;
  notifications: string;
  noNotifications: string;
  markAllRead: string;
}

export const translations: Record<Language, TranslationDictionary> = {
  km: {
    dashboard: "ផ្ទាំងគ្រប់គ្រង",
    classes: "ថ្នាក់រៀន",
    students: "បញ្ជីសិស្ស",
    attendance: "វត្តមាន",
    grades: "ពិន្ទុ & ចំណាត់ថ្នាក់",
    homework: "កិច្ចការផ្ទះ",
    billing: "ការបង់ថ្លៃសិក្សា",
    settings: "ការកំណត់",
    systemName: "សាលារៀនឌីជីថល",
    searchPlaceholder: "ស្វែងរកសិស្ស, ថ្នាក់រៀន... (Ctrl + K)",
    addStudent: "+ បន្ថែមសិស្សថ្មី",
    createAssignment: "+ ដាក់កិច្ចការផ្ទះ",
    exportData: "ទាញយកឯកសារ",
    exportExcel: "តារាង Excel (.xlsx)",
    exportPdf: "ឯកសារ PDF (.pdf)",
    exportWord: "ឯកសារ Word (.docx)",
    exportPptx: "ស្លាយ PowerPoint (.pptx)",
    filterByStatus: "ត្រងតាមស្ថានភាព",
    allStatus: "ទាំងអស់",
    active: "កំពុងរៀន",
    pending: "រង់ចាំ",
    inactive: "ផ្អាក",
    sortBy: "តម្រៀបតាម",
    sortName: "ឈ្មោះសិស្ស",
    sortRoll: "លេខរៀង (Roll No)",
    sortGrade: "ពិន្ទុមធ្យមភាគ",
    tableView: "តារាង (Table)",
    gridView: "ក្រឡា (Cards)",
    rollNo: "ល.រ",
    studentCode: "អត្តលេខ",
    studentName: "គោត្តនាម-នាម",
    gender: "ភេទ",
    status: "ស្ថានភាព",
    totalScore: "មធ្យមភាគ",
    rank: "ចំណាត់ថ្នាក់",
    actions: "សកម្មភាព",
    savedOnDevice: "លំដាប់តម្រៀបត្រូវបានរក្សាទុកនៅលើឧបករណ៍នេះ",
    resetOrder: "កំណត់លំដាប់ឡើងវិញ",
    selectAll: "ជ្រើសរើសទាំងអស់",
    selectedCount: "បានជ្រើសរើស",
    teacherRole: "លោកគ្រូ / អ្នកគ្រូ",
    studentRole: "សិស្សានុសិស្ស",
    logout: "ចាកចេញ",
    soundAlerts: "សំឡេងជូនដំណឹង",
    downloadAttachment: "ទាញយកឯកសារ",
    notifications: "ការជូនដំណឹង",
    noNotifications: "មិនមានការជូនដំណឹងថ្មីទេ",
    markAllRead: "សម្គាល់ថាបានអានទាំងអស់"
  },
  en: {
    dashboard: "Dashboard",
    classes: "Classes",
    students: "Students",
    attendance: "Attendance",
    grades: "Gradebook",
    homework: "Assignments",
    billing: "Billing & Invoices",
    settings: "Settings",
    systemName: "Digital School",
    searchPlaceholder: "Search students, classes... (Ctrl + K)",
    addStudent: "+ Add Student",
    createAssignment: "+ Create Assignment",
    exportData: "Export",
    exportExcel: "Excel Sheet (.xlsx)",
    exportPdf: "Adobe PDF (.pdf)",
    exportWord: "Word Document (.docx)",
    exportPptx: "PowerPoint (.pptx)",
    filterByStatus: "Filter Status",
    allStatus: "All Status",
    active: "Active",
    pending: "Pending",
    inactive: "Inactive",
    sortBy: "Sort By",
    sortName: "Name",
    sortRoll: "Roll Number",
    sortGrade: "Average Score",
    tableView: "Table",
    gridView: "Grid Cards",
    rollNo: "Roll No",
    studentCode: "Student ID",
    studentName: "Full Name",
    gender: "Gender",
    status: "Status",
    totalScore: "Avg Score",
    rank: "Rank",
    actions: "Actions",
    savedOnDevice: "Custom order saved locally on this device",
    resetOrder: "Reset Order",
    selectAll: "Select all on this page",
    selectedCount: "selected",
    teacherRole: "Teacher",
    studentRole: "Student",
    logout: "Log out",
    soundAlerts: "Sound Alerts",
    downloadAttachment: "Download Attachment",
    notifications: "Notifications",
    noNotifications: "No new notifications",
    markAllRead: "Mark all as read"
  }
};

interface AppState {
  language: Language;
  setLanguage: (lang: Language) => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  viewMode: 'table' | 'grid';
  setViewMode: (mode: 'table' | 'grid') => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  soundType: string;
  setSoundType: (type: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  language: (typeof window !== 'undefined' && localStorage.getItem('app_lang') as Language) || 'km',
  setLanguage: (lang) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('app_lang', lang);
    }
    set({ language: lang });
  },
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  viewMode: 'table',
  setViewMode: (mode) => set({ viewMode: mode }),
  soundEnabled: true,
  setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
  soundType: 'bell',
  setSoundType: (type) => set({ soundType: type }),
}));

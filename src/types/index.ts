export interface User {
  id: number;
  email: string;
  name: string;
  role: 'teacher' | 'student';
  student_code?: string;
  phone?: string;
  avatar_url?: string;
}

export interface ClassItem {
  id: number;
  name: string;
  grade_level: string;
  teacher_id: number;
  academic_year: string;
  student_count?: number;
}

export interface StudentItem {
  id: number;
  name: string;
  email: string;
  student_code: string;
  phone?: string;
  avatar_url?: string;
  roll_no: number;
}

export interface AttendanceRecord {
  student_id: number;
  name: string;
  student_code: string;
  roll_no: number;
  status: 'present' | 'absent' | 'permission';
  notes?: string;
}

export interface GradeItem {
  student_id: number;
  name: string;
  student_code: string;
  roll_no: number;
  grades: {
    subject: string;
    score: number;
    max_score: number;
    date: string;
  }[];
  average: number;
  letter_grade: string;
  rank: number | string;
}

export interface HomeworkItem {
  id: number;
  class_id: number;
  teacher_id?: number;
  title: string;
  subject: string;
  description?: string;
  file_url?: string;
  file_name?: string;
  deadline: string;
  created_at: string;
  is_qcm?: boolean;
  question_count?: number;
  submission_count?: number;
  total_students?: number;
  // student specific
  submission_id?: number;
  submitted_file?: string;
  submitted_at?: string;
  score?: number;
  feedback?: string;
  teacher_feedback?: string;
}

export interface SubmissionItem {
  id: number;
  homework_id: number;
  student_id: number;
  student_name: string;
  student_code: string;
  roll_no: number;
  avatar_url?: string;
  file_url: string;
  file_name?: string;
  student_note?: string;
  score?: number;
  feedback?: string;
  submitted_at: string;
  graded_at?: string;
}

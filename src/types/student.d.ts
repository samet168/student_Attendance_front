export interface Student {
  id: string;
  student_id: string;
  full_name: string;
  email: string;
  phone_number?: string;
  gender: 'male' | 'female' | 'other';
  date_of_birth?: string;
  address?: string;
  parent_name?: string;
  parent_phone?: string;
  status: 'active' | 'inactive' | 'graduated';
  enrolled_class?: string;
  avatar_url?: string;
  order?: number;
}

export interface SchoolClass {
  id: string;
  name: string;
  grade_level: string;
  academic_year: string;
  student_count?: number;
  description?: string;
}

export interface AttendanceRecord {
  id: string;
  student_id: string;
  student_name: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'permission';
  remarks?: string;
}

export interface GradeItem {
  id: string;
  student_id: string;
  student_name: string;
  subject: string;
  score: number;
  max_score: number;
  semester: string;
  rank?: number;
}

export interface HomeworkItem {
  id: string;
  title: string;
  description?: string;
  class_id: string;
  due_date: string;
  total_points: number;
  submissions_count?: number;
}

export interface InvoiceItem {
  id: string;
  invoice_number: string;
  student_id: string;
  student_name?: string;
  amount: number;
  due_date: string;
  status: 'paid' | 'pending' | 'rejected';
  created_at: string;
}

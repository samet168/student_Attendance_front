export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined' && window.location.hostname) {
    const host = window.location.hostname;
    // If accessing via IP or non-localhost, point backend to that same host on port 8000
    if (host !== 'localhost' && host !== '127.0.0.1') {
      return `http://${host}:8000/api/v1`;
    }
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
}

export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
}

export function setAuthToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
  }
}

export function removeAuthToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const apiBase = getApiBaseUrl();
  const res = await fetch(`${apiBase}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errorDetail = 'មានបញ្ហាក្នុងការតភ្ជាប់';
    try {
      const data = await res.json();
      errorDetail = data.detail || errorDetail;
    } catch {
      // ignore
    }
    throw new Error(errorDetail);
  }

  return res.json();
}

export const api = {
  // Auth
  sendOtp: (email: string) => request<{ success: boolean; message: string; dev_otp?: string }>('/auth/send-otp', {
    method: 'POST',
    body: JSON.stringify({ email }),
  }),

  verifyOtp: (email: string, code: string) => request<{ access_token: string; token_type: string; user: any }>('/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ email, code }),
  }),

  getMe: () => request<any>('/auth/me'),
  updateProfile: (data: { name?: string; phone?: string; avatar_url?: string }) =>
    request<any>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  changePassword: (data: { old_password?: string; new_password: string }) =>
    request<{ success: boolean; message: string }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Teacher Endpoints
  getTeacherStats: () => request<any>('/teacher/dashboard-stats'),
  getClasses: () => request<any[]>('/teacher/classes'),
  createClass: (name: string, grade_level: string, academic_year?: string, teacher_id?: number) => request<any>('/teacher/classes', {
    method: 'POST',
    body: JSON.stringify({ name, grade_level, academic_year, teacher_id }),
  }),
  updateClass: (classId: number, data: { name?: string; grade_level?: string; academic_year?: string; teacher_id?: number }) =>
    request<any>(`/teacher/classes/${classId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteClass: (classId: number) =>
    request<any>(`/teacher/classes/${classId}`, {
      method: 'DELETE',
    }),
  getClassStudents: (classId: number) => request<any[]>(`/teacher/classes/${classId}/students`),
  getAllStudents: () => request<any[]>('/teacher/all-students'),
  addStudent: (classId: number, student: { name: string; email: string; phone?: string; student_code?: string }) =>
    request<any>(`/teacher/classes/${classId}/students`, {
      method: 'POST',
      body: JSON.stringify(student),
    }),
  updateStudent: (studentId: number, data: { name?: string; phone?: string; student_code?: string; email?: string }) =>
    request<any>(`/teacher/students/${studentId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  transferStudent: (studentId: number, currentClassId: number, targetClassId: number) =>
    request<any>(`/teacher/students/${studentId}/transfer`, {
      method: 'POST',
      body: JSON.stringify({ current_class_id: currentClassId, target_class_id: targetClassId }),
    }),
  unenrollStudent: (classId: number, studentId: number) =>
    request<any>(`/teacher/classes/${classId}/students/${studentId}`, {
      method: 'DELETE',
    }),
  deleteStudent: (studentId: number) =>
    request<any>(`/teacher/students/${studentId}`, {
      method: 'DELETE',
    }),
  getAttendance: (classId: number, dateStr: string, subject?: string) => {
    const subjParam = subject ? `&subject=${encodeURIComponent(subject)}` : '';
    return request<any[]>(`/teacher/attendance?class_id=${classId}&date_str=${dateStr}${subjParam}`);
  },
  saveAttendance: (classId: number, dateStr: string, records: { student_id: number; status: string; notes?: string }[], subject?: string) =>
    request<any>('/teacher/attendance', {
      method: 'POST',
      body: JSON.stringify({ class_id: classId, date: dateStr, records, subject: subject || 'ទូទៅ' }),
    }),
  getClassSubjects: (classId: number) => request<any[]>(`/teacher/classes/${classId}/subjects`),
  assignClassSubject: (classId: number, teacherId: number, subjectName: string) =>
    request<any>(`/teacher/classes/${classId}/subjects`, {
      method: 'POST',
      body: JSON.stringify({ class_id: classId, teacher_id: teacherId, subject_name: subjectName }),
    }),
  deleteClassSubject: (classId: number, subjectId: number) =>
    request<any>(`/teacher/classes/${classId}/subjects/${subjectId}`, {
      method: 'DELETE',
    }),
  getGradesMatrix: (classId: number, subject?: string) => {
    const params = new URLSearchParams({ class_id: String(classId) });
    if (subject) params.append('subject', subject);
    return request<any[]>(`/teacher/grades?${params.toString()}`);
  },
  saveGrades: (classId: number, subject: string, dateStr: string, records: { student_id: number; score: number; max_score?: number }[], examType?: string) =>
    request<any>('/teacher/grades', {
      method: 'POST',
      body: JSON.stringify({
        class_id: classId,
        subject,
        exam_type: examType || 'ប្រឡងប្រចាំខែ (Monthly)',
        date: dateStr,
        records,
      }),
    }),

  // Student Endpoints
  getStudentDashboard: () => request<any>('/student/dashboard'),
  getStudentAttendance: () => request<any[]>('/student/attendance'),
  getStudentGrades: () => request<any[]>('/student/grades'),
  getStudentHomework: () => request<any[]>('/student/homework'),

  // Homework & Upload Endpoints
  getHomeworks: (classId: number) => request<any[]>(`/homework/class/${classId}`),
  createHomework: (data: {
    class_id: number;
    title: string;
    subject: string;
    description?: string;
    file_url?: string;
    file_name?: string;
    deadline: string;
    is_qcm?: boolean;
  }) =>
    request<any>('/homework', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateHomework: (homeworkId: number, data: { title?: string; subject?: string; description?: string; file_url?: string; file_name?: string; deadline?: string }) =>
    request<any>(`/homework/${homeworkId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteHomework: (homeworkId: number) =>
    request<any>(`/homework/${homeworkId}`, {
      method: 'DELETE',
    }),
  getHomeworkSubmissions: (homeworkId: number) => request<any[]>(`/homework/${homeworkId}/submissions`),
  submitHomework: (homeworkId: number, data: { file_url?: string; file_name?: string; student_note?: string }) =>
    request<any>(`/homework/${homeworkId}/submit`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  gradeSubmission: (submissionId: number, score: number, feedback?: string) =>
    request<any>(`/homework/submissions/${submissionId}/grade`, {
      method: 'POST',
      body: JSON.stringify({ score, feedback }),
    }),
  getMySubmission: (homeworkId: number) =>
    request<any>(`/homework/${homeworkId}/my-submission`),

  // QCM — teacher
  createQuestions: (homeworkId: number, questions: Array<{
    question_text: string;
    choices: string[];
    correct_answer: number;
    order_index?: number;
  }>) =>
    request<any>(`/homework/${homeworkId}/questions`, {
      method: 'POST',
      body: JSON.stringify({ questions }),
    }),
  getQuestions: (homeworkId: number) =>
    request<any[]>(`/homework/${homeworkId}/questions`),

  // QCM — student
  submitQCM: (homeworkId: number, data: {
    answers: Array<{ question_id: number; chosen_answer: number }>;
    student_note?: string;
  }) =>
    request<any>(`/homework/${homeworkId}/submit-qcm`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getMyQCMResult: (homeworkId: number) =>
    request<any>(`/homework/${homeworkId}/my-qcm-result`),

  // Cloudinary Direct Upload via backend proxy
  uploadFile: async (file: File, folder: string = 'school_assignments') => {
    const token = getAuthToken();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const apiBase = getApiBaseUrl();
    const res = await fetch(`${apiBase}/homework/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!res.ok) {
      throw new Error('ការផ្ទុកឡើងឯកសារបរាជ័យ');
    }
    return res.json() as Promise<{ success: boolean; file_url: string; file_name: string }>;
  },

  // Notifications & Sound Settings
  getNotificationSettings: () => request<any>('/notifications/settings'),
  updateNotificationSettings: (data: any) => request<any>('/notifications/settings', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  getNotifications: () => request<any[]>('/notifications'),
  markNotificationRead: (id: number) => request<any>(`/notifications/${id}/mark-read`, {
    method: 'POST',
  }),
  markAllNotificationsRead: () => request<any>('/notifications/mark-all-read', {
    method: 'POST',
  }),
  sendNotification: (data: any) => request<any>('/notifications', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  createNotification: (data: any) => request<any>('/notifications', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getDownloadUrl: (notificationId: number) => `${getApiBaseUrl()}/notifications/${notificationId}/download`,

  // Billing
  getInvoices: () => request<any[]>('/billing/invoices'),
  createInvoice: (data: { student_id: number; title: string; amount: number; due_date?: string; currency?: string }) =>
    request<any>('/billing/invoices', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateInvoiceStatus: (invoiceId: number, status: 'paid' | 'pending' | 'unpaid') =>
    request<any>(`/billing/invoices/${invoiceId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  deleteInvoice: (invoiceId: number) =>
    request<any>(`/billing/invoices/${invoiceId}`, {
      method: 'DELETE',
    }),

  getAdminStats: () => request<any>('/admin/stats'),
  getAdminUsers: (role?: string, search?: string) => {
    const params = new URLSearchParams();
    if (role && role !== 'all') params.append('role', role);
    if (search) params.append('search', search);
    const qs = params.toString();
    return request<any[]>(`/admin/users${qs ? `?${qs}` : ''}`);
  },
  updateUserRole: (userId: number, role: string) =>
    request<any>(`/admin/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    }),
  getAdminTeachers: () => request<any[]>('/admin/teachers'),
  createTeacher: (data: { name: string; email: string; password?: string; phone?: string; role?: string }) =>
    request<any>('/admin/teachers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getAdminClasses: () => request<any[]>('/admin/classes'),
  assignTeacherToClass: (classId: number, teacherId: number) =>
    request<any>(`/admin/classes/${classId}/assign-teacher`, {
      method: 'POST',
      body: JSON.stringify({ teacher_id: teacherId }),
    }),

  // Admin Subject Teacher Management
  getAdminClassSubjects: () => request<any[]>('/admin/class-subjects'),
  getAdminClassSubjectsByClass: (classId: number) => request<any[]>(`/admin/classes/${classId}/subjects`),
  adminAssignClassSubject: (classId: number, teacherId: number, subjectName: string) =>
    request<any>(`/admin/classes/${classId}/subjects`, {
      method: 'POST',
      body: JSON.stringify({ teacher_id: teacherId, subject_name: subjectName }),
    }),
  adminDeleteClassSubject: (classId: number, subjectId: number) =>
    request<any>(`/admin/classes/${classId}/subjects/${subjectId}`, {
      method: 'DELETE',
    }),

  // Rankings
  getRankings: (scope: 'class' | 'subject' | 'school', options?: { classId?: number; subject?: string; gradeLevel?: string }) => {
    const params = new URLSearchParams({ scope });
    if (options?.classId) params.append('class_id', String(options.classId));
    if (options?.subject) params.append('subject', options.subject);
    if (options?.gradeLevel) params.append('grade_level', options.gradeLevel);
    return request<any>(`/teacher/rankings?${params.toString()}`);
  },
};

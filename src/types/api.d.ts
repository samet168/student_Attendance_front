export interface ApiResponse<T = any> {
  success?: boolean;
  message?: string;
  data?: T;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  name?: string;           // backend returns 'name'
  role: 'teacher' | 'student' | 'admin';
  phone_number?: string;
  phone?: string;          // backend returns 'phone'
  avatar_url?: string;
  student_code?: string;   // for student accounts
  is_active: boolean;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: UserProfile;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  attachment_url?: string;
  attachment_name?: string;
  target_role: string;
  created_at: string;
  is_read?: boolean;
}

export interface UserSettingState {
  sound_enabled: boolean;
  sound_theme: string;
  volume: number;
}

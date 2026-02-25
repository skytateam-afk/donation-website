import api from './axios';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
  profile_picture_url?: string;
  created_at: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
}

export const authAPI = {
  login: (credentials: LoginCredentials) => 
    api.post<AuthResponse>('/auth/login', credentials),
  
  register: (data: RegisterData) => 
    api.post<AuthResponse>('/auth/register', data),
  
  getProfile: () => 
    api.get<{ success: boolean; data: User }>('/auth/profile'),
  
  updateProfile: (data: Partial<User>) => 
    api.put<{ success: boolean; data: User }>('/auth/profile', data),
  
  changePassword: (data: { current_password: string; new_password: string }) => 
    api.post<{ success: boolean; message: string }>('/auth/change-password', data),
  
  forgotPassword: (email: string) => 
    api.post<{ success: boolean; message: string }>('/auth/forgot-password', { email }),
  
  resetPassword: (token: string, new_password: string) => 
    api.post<{ success: boolean; message: string }>('/auth/reset-password', { 
      token, 
      new_password 
    }),
};

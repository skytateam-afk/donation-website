/**
 * User Management API
 * Handles all user-related API calls for the donation platform
 */
import apiClient from './axios'

export interface UserData {
  id: number
  email: string
  full_name: string
  role: 'admin' | 'editor' | 'viewer'
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateUserData {
  email: string
  password: string
  full_name: string
  role?: 'admin' | 'editor' | 'viewer'
}

export interface UpdateUserData {
  email?: string
  full_name?: string
  role?: 'admin' | 'editor' | 'viewer'
  password?: string
}

export interface UsersQueryParams {
  search?: string
  role?: 'admin' | 'editor' | 'viewer'
  sort?: 'created_at' | 'full_name' | 'email' | 'role'
  order?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface UsersResponse {
  success: boolean
  data: UserData[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export const usersApi = {
  /**
   * Get all users with optional filtering and sorting
   */
  getAll: async (params?: UsersQueryParams): Promise<UsersResponse> => {
    const response = await apiClient.get('/admin/users', { params })
    return response.data
  },

  /**
   * Get user by ID
   */
  getById: async (id: number): Promise<{ success: boolean; data: UserData }> => {
    const response = await apiClient.get(`/admin/users/${id}`)
    return response.data
  },

  /**
   * Create new user (admin only)
   */
  create: async (data: CreateUserData): Promise<{ success: boolean; message: string; data: UserData }> => {
    const response = await apiClient.post('/admin/users', data)
    return response.data
  },

  /**
   * Update user
   */
  update: async (id: number, data: UpdateUserData): Promise<{ success: boolean; message: string; data: UserData }> => {
    const response = await apiClient.put(`/admin/users/${id}`, data)
    return response.data
  },

  /**
   * Toggle user active status
   */
  toggleStatus: async (id: number): Promise<{ success: boolean; message: string; data: { is_active: boolean } }> => {
    const response = await apiClient.put(`/admin/users/${id}/toggle-status`)
    return response.data
  },

  /**
   * Delete user
   */
  delete: async (id: number): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete(`/admin/users/${id}`)
    return response.data
  }
}

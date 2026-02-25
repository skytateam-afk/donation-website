/**
 * Authentication API service
 */
import axios from '../axios'
import type { LoginCredentials, LoginResponse, Network, RegisterUser, User } from '@/types/blockchain'

export const authApi = {
  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await axios.post<LoginResponse>('/api/auth/login', credentials)
    return response.data
  },

  /**
   * Get list of available networks
   */
  async getNetworkList(): Promise<Network[]> {
    const response = await axios.get<{ networkList: Network[] }>('/api/auth/networklist')
    return response.data.networkList
  },

  /**
   * Register new user
   */
  async register(userData: RegisterUser): Promise<{ message: string }> {
    const response = await axios.post('/api/register', userData)
    return response.data
  },

  /**
   * Unregister user
   */
  async unregister(username: string): Promise<{ message: string }> {
    const response = await axios.post('/api/unregister', { user: username })
    return response.data
  },

  /**
   * Get list of users
   */
  async getUserList(): Promise<User[]> {
    const response = await axios.get<User[]>('/api/userlist')
    return response.data
  }
}

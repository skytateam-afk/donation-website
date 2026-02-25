import api from './axios'

export interface Bank {
  id: string
  bank_name: string
  bank_code: string
  bank_type: string
  is_active: boolean
}

export interface BanksResponse {
  success: boolean
  data: Bank[]
  count: number
}

export const banksApi = {
  /**
   * Get all banks
   */
  async getAll(params?: { search?: string; type?: string; active?: boolean }): Promise<BanksResponse> {
    const response = await api.get('/api/banks', { params })
    return response.data
  },

  /**
   * Get bank by ID
   */
  async getById(id: string): Promise<{ success: boolean; data: Bank }> {
    const response = await api.get(`/api/banks/${id}`)
    return response.data
  },
}

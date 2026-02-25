import api from './axios'

export interface OverdueObligation {
  id: string
  transaction_id: string
  transaction_type: 'bank_loan' | 'p2p_transfer'
  amount: number
  currency: string
  debtor_name: string
  debtor_email?: string
  debtor_phone?: string
  creditor_name: string
  creditor_email?: string
  creditor_phone?: string
  original_due_date: string
  expired_date: string
  days_overdue: number
  recovery_status: 'pending' | 'contacted' | 'in_progress' | 'payment_plan' | 'resolved' | 'written_off' | 'legal_action'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  assigned_to?: string
  assigned_at?: string
  contact_attempts: number
  last_contact_date?: string
  next_action_date?: string
  recovery_notes?: any[]
  resolved_at?: string
  created_at: string
  updated_at: string
  assigned_user?: {
    id: string
    username: string
    email: string
  }
}

export interface OverdueObligationFilters {
  status?: string
  priority?: string
  type?: string
  assignedTo?: string
  page?: number
  limit?: number
}

export interface OverdueObligationStatistics {
  total_count: number
  total_amount: number
  by_status: {
    status: string
    count: number
    total_amount: number
  }[]
  by_priority: {
    priority: string
    count: number
    total_amount: number
  }[]
  by_type: {
    type: string
    count: number
    total_amount: number
  }[]
  average_days_overdue: number
  oldest_obligation_days: number
}

export interface UpdateObligationData {
  recovery_status?: string
  priority?: string
  assigned_to?: string
  contact_attempts?: number
  last_contact_date?: string
  next_action_date?: string
}

export const overdueObligationsApi = {
  /**
   * Get all overdue obligations with optional filtering
   */
  async getAll(filters?: OverdueObligationFilters) {
    const params = new URLSearchParams()
    
    if (filters?.status) params.append('status', filters.status)
    if (filters?.priority) params.append('priority', filters.priority)
    if (filters?.type) params.append('type', filters.type)
    if (filters?.assignedTo) params.append('assignedTo', filters.assignedTo)
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())
    
    const queryString = params.toString()
    const url = `/overdue-obligations${queryString ? `?${queryString}` : ''}`
    
    const response = await api.get(`/api${url}`)
    return response.data
  },

  /**
   * Get statistics for overdue obligations
   */
  async getStatistics(): Promise<{ success: boolean; data: OverdueObligationStatistics }> {
    const response = await api.get('/api/overdue-obligations/statistics')
    return response.data
  },

  /**
   * Get a single overdue obligation by ID
   */
  async getById(id: string): Promise<{ success: boolean; data: OverdueObligation }> {
    const response = await api.get(`/api/overdue-obligations/${id}`)
    return response.data
  },

  /**
   * Get overdue obligation by transaction ID
   */
  async getByTransactionId(transactionId: string): Promise<{ success: boolean; data: OverdueObligation }> {
    const response = await api.get(`/api/overdue-obligations/transaction/${transactionId}`)
    return response.data
  },

  /**
   * Update an overdue obligation
   */
  async update(id: string, data: UpdateObligationData): Promise<{ success: boolean; data: OverdueObligation; message: string }> {
    const response = await api.put(`/api/overdue-obligations/${id}`, data)
    return response.data
  },

  /**
   * Add a note to an overdue obligation
   */
  async addNote(id: string, note: string): Promise<{ success: boolean; data: OverdueObligation; message: string }> {
    const response = await api.post(`/api/overdue-obligations/${id}/notes`, { note })
    return response.data
  },

  /**
   * Delete an overdue obligation (admin only)
   */
  async delete(id: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/api/overdue-obligations/${id}`)
    return response.data
  }
}

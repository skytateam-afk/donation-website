import axios from './axios'

export interface Node {
  id: string
  node_name: string
  organization: string
  msp_id: string
  node_type: string
  host: string
  port: number
  endpoint: string
  description?: string
  is_active: boolean
  metadata?: any
  created_at: string
  updated_at: string
}

export interface NodeDropdownItem {
  value: string
  label: string
  organization: string
  mspId: string
  endpoint: string
}

export interface NodesResponse {
  success: boolean
  count: number
  nodes: Node[]
}

export interface NodesDropdownResponse {
  success: boolean
  nodes: NodeDropdownItem[]
}

export const nodeManagementApi = {
  /**
   * Get all nodes
   */
  async getAll(params?: { active_only?: boolean }): Promise<NodesResponse> {
    const response = await axios.get('/api/nodes', { params })
    return response.data
  },

  /**
   * Get nodes for dropdown selection
   */
  async getDropdown(): Promise<NodesDropdownResponse> {
    const response = await axios.get('/api/nodes/dropdown')
    return response.data
  },

  /**
   * Get node by ID
   */
  async getById(id: string): Promise<{ success: boolean; node: Node }> {
    const response = await axios.get(`/api/nodes/${id}`)
    return response.data
  },

  /**
   * Discover nodes from blockchain network
   */
  async discover(): Promise<any> {
    const response = await axios.post('/api/nodes/discover')
    return response.data
  },

  /**
   * Create a new node
   */
  async create(data: Partial<Node>): Promise<any> {
    const response = await axios.post('/api/nodes', data)
    return response.data
  },

  /**
   * Update node
   */
  async update(id: string, data: Partial<Node>): Promise<any> {
    const response = await axios.put(`/api/nodes/${id}`, data)
    return response.data
  },

  /**
   * Delete node
   */
  async delete(id: string): Promise<any> {
    const response = await axios.delete(`/api/nodes/${id}`)
    return response.data
  },

  /**
   * Get network status
   */
  async getNetworkStatus(): Promise<any> {
    const response = await axios.get('/api/nodes/network-status')
    return response.data
  }
}

import apiClient from './axios'

export interface CreateChannelRequest {
  channelName: string
  configTxPath?: string
}

export interface JoinChannelRequest {
  channelName: string
  blockPath?: string
}

export interface UpdateChannelRequest {
  channelName: string
  configUpdatePath: string
}

export interface AddOrgToChannelRequest {
  channelName: string
  orgMSP: string
  configUpdatePath?: string
}

export const channelManagementApi = {
  /**
   * Create a new channel
   */
  createChannel: async (data: CreateChannelRequest) => {
    const response = await apiClient.post('/api/channel-management/create', data)
    return response.data
  },

  /**
   * Join peer to channel
   */
  joinChannel: async (data: JoinChannelRequest) => {
    const response = await apiClient.post('/api/channel-management/join', data)
    return response.data
  },

  /**
   * Update channel configuration
   */
  updateChannel: async (data: UpdateChannelRequest) => {
    const response = await apiClient.post('/api/channel-management/update', data)
    return response.data
  },

  /**
   * Add organization to channel
   */
  addOrgToChannel: async (data: AddOrgToChannelRequest) => {
    const response = await apiClient.post('/api/channel-management/add-org', data)
    return response.data
  },

  /**
   * Get channel configuration
   */
  getChannelConfig: async (channel: string) => {
    const response = await apiClient.get(`/api/channel-management/config/${channel}`)
    return response.data
  },

  /**
   * Fetch channel block
   */
  fetchChannelBlock: async (channel: string, blockNumber: number) => {
    const response = await apiClient.get(`/api/channel-management/block/${channel}/${blockNumber}`)
    return response.data
  }
}

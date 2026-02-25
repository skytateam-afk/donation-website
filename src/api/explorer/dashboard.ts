/**
 * Dashboard API service
 */
import axios from '../axios'
import type { DashboardStats, ChannelInfo, PeerStatus } from '@/types/blockchain'

export const dashboardApi = {
  /**
   * Get list of channels
   */
  async getChannels(): Promise<string[]> {
    const response = await axios.get<{ status: number; channels: string[] }>('/api/channels')
    return response.data.channels
  },

  /**
   * Get channels info with statistics
   */
  async getChannelsInfo(): Promise<ChannelInfo[]> {
    const response = await axios.get<{ status: number; channels: ChannelInfo[] }>('/api/channels/info')
    return response.data.channels
  },

  /**
   * Get current channel
   */
  async getCurrentChannel(): Promise<string> {
    const response = await axios.get<{ currentChannel: string }>('/api/curChannel')
    return response.data.currentChannel
  },

  /**
   * Change current channel
   */
  async changeChannel(channelHash: string): Promise<void> {
    await axios.get(`/api/changeChannel/${channelHash}`)
  },

  /**
   * Get peer status for a channel
   */
  async getPeerStatus(channel: string): Promise<PeerStatus[]> {
    const response = await axios.get<{ status: number; peers: PeerStatus[] }>(`/api/peersStatus/${channel}`)
    return response.data.peers
  },

  /**
   * Get dashboard statistics
   */
  async getDashboardStats(channelHash: string): Promise<DashboardStats> {
    const response = await axios.get<DashboardStats>(`/api/status/${channelHash}`)
    return response.data
  },

  /**
   * Get block activity
   */
  async getBlockActivity(channelHash: string): Promise<any> {
    const response = await axios.get(`/api/blockActivity/${channelHash}`)
    return response.data
  },

  /**
   * Get transactions by minute
   */
  async getTxByMinute(channelHash: string, hours: number = 1): Promise<any> {
    const response = await axios.get(`/api/txByMinute/${channelHash}/${hours}`)
    return response.data
  },

  /**
   * Get transactions by hour
   */
  async getTxByHour(channelHash: string, days: number = 1): Promise<any> {
    const response = await axios.get(`/api/txByHour/${channelHash}/${days}`)
    return response.data
  },

  /**
   * Get blocks by minute
   */
  async getBlocksByMinute(channelHash: string, hours: number = 1): Promise<any> {
    const response = await axios.get(`/api/blocksByMinute/${channelHash}/${hours}`)
    return response.data
  },

  /**
   * Get blocks by hour
   */
  async getBlocksByHour(channelHash: string, days: number = 1): Promise<any> {
    const response = await axios.get(`/api/blocksByHour/${channelHash}/${days}`)
    return response.data
  }
}

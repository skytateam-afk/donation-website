/**
 * Dashboard Store - Manages dashboard state and data
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { dashboardApi } from '@/api/explorer/dashboard'
import type { DashboardStats, ChannelInfo, PeerStatus } from '@/types/blockchain'

export const useDashboardStore = defineStore('dashboard', () => {
  // State
  const channels = ref<string[]>([])
  const channelsInfo = ref<ChannelInfo[]>([])
  const currentChannel = ref<string>('')
  const stats = ref<DashboardStats | null>(null)
  const peerStatus = ref<PeerStatus[]>([])
  const blockActivity = ref<any[]>([])
  const txByMinute = ref<any[]>([])
  const txByHour = ref<any[]>([])
  const blocksByMinute = ref<any[]>([])
  const blocksByHour = ref<any[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const currentChannelInfo = computed(() => {
    return channelsInfo.value.find(ch => ch.channelname === currentChannel.value)
  })

  const currentChannelHash = computed(() => {
    return currentChannelInfo.value?.channel_genesis_hash || ''
  })

  // Actions
  async function fetchChannels() {
    try {
      loading.value = true
      error.value = null
      channels.value = await dashboardApi.getChannels()
      
      // If no current channel set, use the first one
      if (!currentChannel.value && channels.value.length > 0) {
        currentChannel.value = channels.value[0]
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch channels'
      console.error('Error fetching channels:', err)
    } finally {
      loading.value = false
    }
  }

  async function fetchChannelsInfo() {
    try {
      loading.value = true
      error.value = null
      channelsInfo.value = await dashboardApi.getChannelsInfo()
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch channels info'
      console.error('Error fetching channels info:', err)
    } finally {
      loading.value = false
    }
  }

  async function fetchCurrentChannel() {
    try {
      currentChannel.value = await dashboardApi.getCurrentChannel()
    } catch (err: any) {
      console.error('Error fetching current channel:', err)
    }
  }

  async function changeChannel(channelHash: string) {
    try {
      loading.value = true
      error.value = null
      await dashboardApi.changeChannel(channelHash)
      
      // Find and set the new current channel
      const channelInfo = channelsInfo.value.find(ch => ch.channel_genesis_hash === channelHash)
      if (channelInfo) {
        currentChannel.value = channelInfo.channelname
      }
      
      // Refresh dashboard data
      await fetchDashboardData()
    } catch (err: any) {
      error.value = err.message || 'Failed to change channel'
      console.error('Error changing channel:', err)
    } finally {
      loading.value = false
    }
  }

  async function fetchDashboardStats() {
    if (!currentChannelHash.value) return
    
    try {
      loading.value = true
      error.value = null
      stats.value = await dashboardApi.getDashboardStats(currentChannelHash.value)
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch dashboard stats'
      console.error('Error fetching dashboard stats:', err)
    } finally {
      loading.value = false
    }
  }

  async function fetchPeerStatus() {
    if (!currentChannel.value) return
    
    try {
      peerStatus.value = await dashboardApi.getPeerStatus(currentChannel.value)
    } catch (err: any) {
      console.error('Error fetching peer status:', err)
    }
  }

  async function fetchBlockActivity() {
    if (!currentChannelHash.value) return
    
    try {
      const response = await dashboardApi.getBlockActivity(currentChannelHash.value)
      blockActivity.value = response.rows || []
    } catch (err: any) {
      console.error('Error fetching block activity:', err)
    }
  }

  async function fetchTransactionMetrics(hours: number = 1) {
    if (!currentChannelHash.value) return
    
    try {
      const response = await dashboardApi.getTxByMinute(currentChannelHash.value, hours)
      txByMinute.value = response.rows || []
    } catch (err: any) {
      console.error('Error fetching transaction metrics:', err)
    }
  }

  async function fetchBlockMetrics(hours: number = 1) {
    if (!currentChannelHash.value) return
    
    try {
      const response = await dashboardApi.getBlocksByMinute(currentChannelHash.value, hours)
      blocksByMinute.value = response.rows || []
    } catch (err: any) {
      console.error('Error fetching block metrics:', err)
    }
  }

  async function fetchDashboardData() {
    await Promise.all([
      fetchDashboardStats(),
      fetchPeerStatus(),
      fetchBlockActivity(),
      fetchTransactionMetrics(),
      fetchBlockMetrics()
    ])
  }

  async function initializeDashboard() {
    await fetchChannels()
    await fetchChannelsInfo()
    await fetchCurrentChannel()
    await fetchDashboardData()
  }

  function $reset() {
    channels.value = []
    channelsInfo.value = []
    currentChannel.value = ''
    stats.value = null
    peerStatus.value = []
    blockActivity.value = []
    txByMinute.value = []
    txByHour.value = []
    blocksByMinute.value = []
    blocksByHour.value = []
    loading.value = false
    error.value = null
  }

  return {
    // State
    channels,
    channelsInfo,
    currentChannel,
    stats,
    peerStatus,
    blockActivity,
    txByMinute,
    txByHour,
    blocksByMinute,
    blocksByHour,
    loading,
    error,
    
    // Computed
    currentChannelInfo,
    currentChannelHash,
    
    // Actions
    fetchChannels,
    fetchChannelsInfo,
    fetchCurrentChannel,
    changeChannel,
    fetchDashboardStats,
    fetchPeerStatus,
    fetchBlockActivity,
    fetchTransactionMetrics,
    fetchBlockMetrics,
    fetchDashboardData,
    initializeDashboard,
    $reset
  }
})

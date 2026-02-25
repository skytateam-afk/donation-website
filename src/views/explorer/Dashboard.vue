<template>
  <ExplorerLayout>
    <div class="space-y-6">
      <!-- Page Header with Channel Selector -->
<div class="flex flex-wrap items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold">Dashboard</h1>
          <p class="text-muted-foreground mt-2">
            Overview of your Hyperledger Fabric network
          </p>
        </div>
        
        <!-- Channel Selector -->
        <div v-if="dashboardStore.channelsInfo.length > 0" class="flex items-center gap-4">
          <Label for="channel-select" class="text-sm font-medium">Channel:</Label>
          <Select v-model="selectedChannelHash" @update:model-value="handleChannelChange">
            <SelectTrigger id="channel-select" class="w-[200px]">
              <SelectValue placeholder="Select channel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="channel in dashboardStore.channelsInfo"
                :key="channel.channel_genesis_hash"
                :value="channel.channel_genesis_hash"
              >
                {{ channel.channelname }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="dashboardStore.loading && !dashboardStore.stats" class="flex items-center justify-center py-12">
        <div class="text-center space-y-4">
          <Spinner size="lg" class="mx-auto text-primary" />
          <p class="text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="dashboardStore.error" class="rounded-lg border border-destructive bg-destructive/10 p-4">
        <p class="text-sm text-destructive">{{ dashboardStore.error }}</p>
      </div>

      <!-- Dashboard Content -->
      <template v-else-if="dashboardStore.stats">
        <!-- Overview Charts - Responsive grid -->
        <div v-if="dashboardStore.txByMinute.length > 0 || dashboardStore.blocksByMinute.length > 0" class="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <TransactionChart 
            v-if="dashboardStore.txByMinute.length > 0"
            :data="dashboardStore.txByMinute"
            @expand="openChartDialog('transaction')"
          />
          <BlockChart 
            v-if="dashboardStore.blocksByMinute.length > 0"
            :data="dashboardStore.blocksByMinute"
            @expand="openChartDialog('block')"
          />
          <NetworkThroughputChart 
            v-if="dashboardStore.txByMinute.length > 0 && dashboardStore.blocksByMinute.length > 0"
            :tx-data="dashboardStore.txByMinute"
            :block-data="dashboardStore.blocksByMinute"
            @expand="openChartDialog('throughput')"
          />
        </div>

        <!-- Search Bar -->
        <SearchBar />

        <!-- Network Health -->
        <NetworkHealth />

        <!-- Statistics Cards -->
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <!-- Latest Block -->
          <Card>
            <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle class="text-sm font-medium">Latest Block</CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                class="h-4 w-4 text-muted-foreground"
              >
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
            </CardHeader>
            <CardContent>
              <div class="text-2xl font-bold">{{ dashboardStore.stats.latestBlock }}</div>
              <p class="text-xs text-muted-foreground">
                Total blocks in channel
              </p>
            </CardContent>
          </Card>

          <!-- Transactions -->
          <Card>
            <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle class="text-sm font-medium">Transactions</CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                class="h-4 w-4 text-muted-foreground"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </CardHeader>
            <CardContent>
              <div class="text-2xl font-bold">{{ dashboardStore.stats.txCount }}</div>
              <p class="text-xs text-muted-foreground">
                Total transactions
              </p>
            </CardContent>
          </Card>

          <!-- Peers -->
          <Card>
            <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle class="text-sm font-medium">Peers</CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                class="h-4 w-4 text-muted-foreground"
              >
                <rect width="20" height="14" x="2" y="5" rx="2" />
                <path d="M2 10h20" />
              </svg>
            </CardHeader>
            <CardContent>
              <div class="text-2xl font-bold">{{ dashboardStore.stats.peerCount }}</div>
              <p class="text-xs text-muted-foreground">
                Active peer nodes
              </p>
            </CardContent>
          </Card>

          <!-- Chaincodes -->
          <Card>
            <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle class="text-sm font-medium">Chaincodes</CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                class="h-4 w-4 text-muted-foreground"
              >
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
            </CardHeader>
            <CardContent>
              <div class="text-2xl font-bold">{{ dashboardStore.stats.chaincodeCount }}</div>
              <p class="text-xs text-muted-foreground">
                Deployed chaincodes
              </p>
            </CardContent>
          </Card>
        </div>

        <!-- Channel Information -->
        <Card v-if="dashboardStore.currentChannelInfo">
          <CardHeader>
            <CardTitle>Channel Information</CardTitle>
            <CardDescription>Details about the current channel</CardDescription>
          </CardHeader>
          <CardContent>
            <div class="grid gap-4 md:grid-cols-2">
              <div class="space-y-1">
                <p class="text-sm font-medium text-muted-foreground">Channel Name</p>
                <p class="text-lg font-semibold">{{ dashboardStore.currentChannelInfo.channelname }}</p>
              </div>
              <div class="space-y-1">
                <p class="text-sm font-medium text-muted-foreground">Created At</p>
                <p class="text-lg font-semibold">{{ formatDate(dashboardStore.currentChannelInfo.createdat) }}</p>
              </div>
              <div class="space-y-1">
                <p class="text-sm font-medium text-muted-foreground">Total Blocks</p>
                <p class="text-lg font-semibold">{{ dashboardStore.currentChannelInfo.blocks }}</p>
              </div>
              <div class="space-y-1">
                <p class="text-sm font-medium text-muted-foreground">Total Transactions</p>
                <p class="text-lg font-semibold">{{ dashboardStore.currentChannelInfo.transactions }}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Peer Status -->
        <Card v-if="dashboardStore.peerStatus.length > 0">
          <CardHeader>
            <CardTitle>Peer Status</CardTitle>
            <CardDescription>Health status of peer nodes in the network</CardDescription>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <div
                v-for="(peer, index) in dashboardStore.peerStatus"
                :key="index"
                class="flex flex-wrap items-center justify-between p-4 rounded-lg border"
              >
                <div class="space-y-1">
                  <p class="text-sm font-medium">{{ peer.server_hostname || `Peer ${index + 1}` }}</p>
                  <p class="text-xs text-muted-foreground">MSP ID: {{ peer.mspid }}</p>
                </div>
                <Badge :variant="peer.status === 'up' ? 'default' : 'destructive'">
                  {{ peer.status || 'Unknown' }}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

      </template>

      <!-- Empty State -->
      <Card v-else>
        <CardHeader>
          <CardTitle>No Data Available</CardTitle>
          <CardDescription>
            Unable to load dashboard data. Please check your connection and try again.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>

    <!-- Full Screen Chart Dialog -->
    <Dialog v-model:open="showChartDialog">
      <DialogContent class="max-w-[95vw] max-h-[95vh] w-full h-full">
        <DialogHeader>
          <DialogTitle>{{ chartDialogTitle }}</DialogTitle>
          <DialogDescription>
            {{ chartDialogDescription }}
          </DialogDescription>
        </DialogHeader>
        
        <div class="flex-1 overflow-auto">
          <!-- Transaction Chart Full Screen -->
          <div v-if="selectedChart === 'transaction'" class="h-[70vh] w-full">
            <VisXYContainer :data="txChartData" :height="600">
              <VisLine 
                :x="(d: any) => d.time" 
                :y="(d: any) => d.count" 
                color="hsl(var(--primary))"
                :line-width="3"
              />
              <VisAxis type="x" :tick-format="formatTime" />
              <VisAxis type="y" :tick-format="(d: number) => d.toString()" />
              <VisTooltip />
              <VisCrosshair />
            </VisXYContainer>
          </div>

          <!-- Block Chart Full Screen -->
          <div v-if="selectedChart === 'block'" class="h-[70vh] w-full">
            <VisXYContainer :data="blockChartData" :height="600">
              <VisStackedBar 
                :x="(d: any) => d.time" 
                :y="(d: any) => d.count"
                color="hsl(var(--chart-2))"
              />
              <VisAxis type="x" :tick-format="formatTime" />
              <VisAxis type="y" :tick-format="(d: number) => d.toString()" />
              <VisTooltip />
              <VisCrosshair />
            </VisXYContainer>
          </div>

          <!-- Throughput Chart Full Screen -->
          <div v-if="selectedChart === 'throughput'" class="h-[70vh] w-full">
            <VisXYContainer :data="throughputChartData" :height="600">
              <VisArea 
                :x="(d: any) => d.time" 
                :y="(d: any) => d.throughput"
                color="hsl(var(--chart-3))"
                :opacity="0.6"
              />
              <VisLine 
                :x="(d: any) => d.time" 
                :y="(d: any) => d.throughput"
                color="hsl(var(--chart-3))"
                :line-width="3"
              />
              <VisAxis type="x" :tick-format="formatTime" />
              <VisAxis type="y" :tick-format="(d: number) => d.toString()" />
              <VisTooltip />
              <VisCrosshair />
            </VisXYContainer>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="showChartDialog = false">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Block Details Modal -->
    <BlockDetailsModal
      v-model:open="showBlockDetailsModal"
      :channel-hash="selectedChannelHash"
      :block-number="selectedBlockNumber"
    />
  </ExplorerLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { VisXYContainer, VisLine, VisStackedBar, VisArea, VisAxis, VisTooltip, VisCrosshair } from '@unovis/vue'
import ExplorerLayout from '@/layouts/ExplorerLayout.vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import SearchBar from '@/components/explorer/SearchBar.vue'
import NetworkHealth from '@/components/explorer/NetworkHealth.vue'
import TransactionChart from '@/components/explorer/charts/TransactionChart.vue'
import BlockChart from '@/components/explorer/charts/BlockChart.vue'
import NetworkThroughputChart from '@/components/explorer/charts/NetworkThroughputChart.vue'
import BlockDetailsModal from '@/components/explorer/BlockDetailsModal.vue'
import { useDashboardStore } from '@/stores/dashboard'
import { toast } from 'vue-sonner'

const router = useRouter()
const dashboardStore = useDashboardStore()
const selectedChannelHash = ref('')
let refreshInterval: ReturnType<typeof setInterval> | null = null

// Pagination for block activity
const blockPage = ref(1)
const blockPageSize = ref(10)

// Chart dialog state
const showChartDialog = ref(false)
const selectedChart = ref<'transaction' | 'block' | 'throughput'>('transaction')
const chartDialogTitle = ref('')
const chartDialogDescription = ref('')

// Block details modal state
const showBlockDetailsModal = ref(false)
const selectedBlockNumber = ref<number | null>(null)

// Responsive chart height based on screen size
const chartHeight = computed(() => {
  if (typeof window === 'undefined') return 300
  const width = window.innerWidth
  if (width < 640) return 200 // mobile
  if (width < 1024) return 250 // tablet
  return 300 // desktop
})

// Initialize dashboard
onMounted(async () => {
  await dashboardStore.initializeDashboard()
  
  // Set selected channel hash
  if (dashboardStore.currentChannelHash) {
    selectedChannelHash.value = dashboardStore.currentChannelHash
  }
  
  // Auto-refresh every 30 seconds
  refreshInterval = setInterval(() => {
    dashboardStore.fetchDashboardData()
  }, 30000)
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})

// Handle channel change
async function handleChannelChange(channelHash: string) {
  await dashboardStore.changeChannel(channelHash)
}

// Format date
function formatDate(dateString: string): string {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Transaction chart data for @unovis
const txChartData = computed(() => {
  return dashboardStore.txByMinute.map(item => ({
    time: new Date(item.datetime).getTime(),
    count: item.count
  }))
})

// Block chart data for @unovis
const blockChartData = computed(() => {
  return dashboardStore.blocksByMinute.map(item => ({
    time: new Date(item.datetime).getTime(),
    count: item.count
  }))
})

// Format time for chart axis
function formatTime(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

// Throughput chart data (combines tx and block data)
const throughputChartData = computed(() => {
  // Create a map of timestamps to combine data
  const dataMap = new Map<number, { time: number; throughput: number }>()
  
  // Add transaction counts
  dashboardStore.txByMinute.forEach(item => {
    const time = new Date(item.datetime).getTime()
    dataMap.set(time, { time, throughput: item.count })
  })
  
  // Add block counts (multiply by 10 to show on same scale)
  dashboardStore.blocksByMinute.forEach(item => {
    const time = new Date(item.datetime).getTime()
    const existing = dataMap.get(time)
    if (existing) {
      existing.throughput += item.count * 10
    } else {
      dataMap.set(time, { time, throughput: item.count * 10 })
    }
  })
  
  // Convert to array and sort by time
  return Array.from(dataMap.values()).sort((a, b) => a.time - b.time)
})

// Open chart dialog
function openChartDialog(chartType: 'transaction' | 'block' | 'throughput') {
  selectedChart.value = chartType
  
  // Set dialog title and description based on chart type
  switch (chartType) {
    case 'transaction':
      chartDialogTitle.value = 'Transaction Activity'
      chartDialogDescription.value = 'Detailed view of transaction activity over time. Use the crosshair to explore specific data points.'
      break
    case 'block':
      chartDialogTitle.value = 'Block Creation Rate'
      chartDialogDescription.value = 'Detailed view of block creation rate over time. Use the crosshair to explore specific data points.'
      break
    case 'throughput':
      chartDialogTitle.value = 'Network Throughput'
      chartDialogDescription.value = 'Combined view of network throughput including transactions and blocks. Use the crosshair to explore specific data points.'
      break
  }
  
  showChartDialog.value = true
}

// Pagination computed properties
const totalBlockPages = computed(() => {
  return Math.ceil(dashboardStore.blockActivity.length / blockPageSize.value)
})

const paginatedBlocks = computed(() => {
  const start = (blockPage.value - 1) * blockPageSize.value
  const end = start + blockPageSize.value
  return dashboardStore.blockActivity.slice(start, end)
})

const visibleBlockPages = computed(() => {
  const total = totalBlockPages.value
  const current = blockPage.value
  const pages: number[] = []
  
  // Show max 5 page numbers
  let start = Math.max(1, current - 2)
  let end = Math.min(total, start + 4)
  
  // Adjust start if we're near the end
  if (end - start < 4) {
    start = Math.max(1, end - 4)
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

// Open block details modal
function navigateToBlock(blockNumber: number) {
  selectedBlockNumber.value = blockNumber
  showBlockDetailsModal.value = true
}
</script>

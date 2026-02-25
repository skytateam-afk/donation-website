<template>
  <Card>
    <CardHeader>
      <CardTitle>Network Health</CardTitle>
      <CardDescription>Overall health status of the blockchain network</CardDescription>
    </CardHeader>
    <CardContent>
      <div class="space-y-4">
        <!-- Overall Health Status -->
        <div class="flex flex-wrap items-center justify-between p-4 rounded-lg border" :class="healthStatusClass">
          <div class="flex items-center gap-3">
            <div class="flex items-center justify-center w-12 h-12 rounded-full" :class="healthIconClass">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                class="h-6 w-6"
              >
                <path v-if="healthStatus === 'healthy'" d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline v-if="healthStatus === 'healthy'" points="22 4 12 14.01 9 11.01" />
                <circle v-if="healthStatus === 'warning'" cx="12" cy="12" r="10" />
                <line v-if="healthStatus === 'warning'" x1="12" y1="8" x2="12" y2="12" />
                <line v-if="healthStatus === 'warning'" x1="12" y1="16" x2="12.01" y2="16" />
                <circle v-if="healthStatus === 'critical'" cx="12" cy="12" r="10" />
                <line v-if="healthStatus === 'critical'" x1="15" y1="9" x2="9" y2="15" />
                <line v-if="healthStatus === 'critical'" x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-semibold">{{ healthStatusText }}</h3>
              <p class="text-sm text-muted-foreground">{{ healthStatusDescription }}</p>
            </div>
          </div>
          <Badge :variant="healthBadgeVariant" class="text-sm">
            {{ healthStatus.toUpperCase() }}
          </Badge>
        </div>

        <!-- Health Metrics -->
        <div class="grid gap-3 md:grid-cols-2">
          <!-- Peer Health -->
          <div class="p-3 rounded-lg border">
            <div class="flex flex-wrap items-center justify-between mb-2">
              <span class="text-sm font-medium">Peer Nodes</span>
              <Badge :variant="peerHealthVariant">
                {{ activePeers }}/{{ totalPeers }}
              </Badge>
            </div>
            <div class="w-full bg-secondary rounded-full h-2">
              <div
                class="h-2 rounded-full transition-all"
                :class="peerHealthBarClass"
                :style="{ width: `${peerHealthPercentage}%` }"
              ></div>
            </div>
            <p class="text-xs text-muted-foreground mt-1">
              {{ peerHealthPercentage }}% operational
            </p>
          </div>

          <!-- Block Production -->
          <div class="p-3 rounded-lg border">
            <div class="flex flex-wrap items-center justify-between mb-2">
              <span class="text-sm font-medium">Block Production</span>
              <Badge :variant="blockProductionVariant">
                {{ blockProductionStatus }}
              </Badge>
            </div>
            <div class="flex items-center gap-2">
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
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
              <span class="text-sm text-muted-foreground">
                {{ recentBlocksCount }} blocks in last hour
              </span>
            </div>
          </div>

          <!-- Transaction Throughput -->
          <div class="p-3 rounded-lg border">
            <div class="flex flex-wrap items-center justify-between mb-2">
              <span class="text-sm font-medium">Transaction Rate</span>
              <Badge :variant="txThroughputVariant">
                {{ txThroughputStatus }}
              </Badge>
            </div>
            <div class="flex items-center gap-2">
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
                <line x1="12" y1="20" x2="12" y2="10" />
                <line x1="18" y1="20" x2="18" y2="4" />
                <line x1="6" y1="20" x2="6" y2="16" />
              </svg>
              <span class="text-sm text-muted-foreground">
                {{ avgTxPerMinute }} tx/min average
              </span>
            </div>
          </div>

          <!-- Network Latency -->
          <div class="p-3 rounded-lg border">
            <div class="flex flex-wrap items-center justify-between mb-2">
              <span class="text-sm font-medium">Network Status</span>
              <Badge :variant="networkLatencyVariant">
                {{ networkLatencyStatus }}
              </Badge>
            </div>
            <div class="flex items-center gap-2">
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
                <path d="M5 12.55a11 11 0 0 1 14.08 0" />
                <path d="M1.42 9a16 16 0 0 1 21.16 0" />
                <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                <line x1="12" y1="20" x2="12.01" y2="20" />
              </svg>
              <span class="text-sm text-muted-foreground">
                All systems operational
              </span>
            </div>
          </div>
        </div>

        <!-- Last Updated -->
        <div class="flex flex-wrap items-center justify-between text-xs text-muted-foreground pt-2 border-t">
          <span>Last updated: {{ lastUpdated }}</span>
          <Button variant="ghost" size="sm" @click="refreshHealth">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              class="h-3 w-3 mr-1"
              :class="{ 'animate-spin': refreshing }"
            >
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
            </svg>
            Refresh
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useDashboardStore } from '@/stores/dashboard'

const dashboardStore = useDashboardStore()
const refreshing = ref(false)
const lastUpdated = ref('')

// Computed properties for health metrics
const totalPeers = computed(() => dashboardStore.peerStatus.length)
const activePeers = computed(() => 
  dashboardStore.peerStatus.filter(p => p.status === 'up').length
)
const peerHealthPercentage = computed(() => 
  totalPeers.value > 0 ? Math.round((activePeers.value / totalPeers.value) * 100) : 0
)

const recentBlocksCount = computed(() => {
  if (dashboardStore.blocksByMinute.length === 0) return 0
  // Sum up all block counts from the time buckets
  return dashboardStore.blocksByMinute.reduce((sum, item) => sum + item.count, 0)
})

const avgTxPerMinute = computed(() => {
  if (dashboardStore.txByMinute.length === 0) return 0
  const total = dashboardStore.txByMinute.reduce((sum, item) => sum + item.count, 0)
  return Math.round(total / dashboardStore.txByMinute.length)
})

// Health status determination
const healthStatus = computed(() => {
  if (peerHealthPercentage.value < 50) return 'critical'
  if (peerHealthPercentage.value < 80) return 'warning'
  return 'healthy'
})

const healthStatusText = computed(() => {
  switch (healthStatus.value) {
    case 'healthy': return 'Network Healthy'
    case 'warning': return 'Network Warning'
    case 'critical': return 'Network Critical'
    default: return 'Unknown Status'
  }
})

const healthStatusDescription = computed(() => {
  switch (healthStatus.value) {
    case 'healthy': return 'All systems operating normally'
    case 'warning': return 'Some issues detected, monitoring required'
    case 'critical': return 'Critical issues detected, immediate attention needed'
    default: return 'Status unknown'
  }
})

const healthStatusClass = computed(() => {
  switch (healthStatus.value) {
    case 'healthy': return 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
    case 'warning': return 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800'
    case 'critical': return 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
    default: return ''
  }
})

const healthIconClass = computed(() => {
  switch (healthStatus.value) {
    case 'healthy': return 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400'
    case 'warning': return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400'
    case 'critical': return 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400'
    default: return ''
  }
})

const healthBadgeVariant = computed(() => {
  switch (healthStatus.value) {
    case 'healthy': return 'default'
    case 'warning': return 'secondary'
    case 'critical': return 'destructive'
    default: return 'outline'
  }
})

// Peer health
const peerHealthVariant = computed(() => {
  if (peerHealthPercentage.value >= 80) return 'default'
  if (peerHealthPercentage.value >= 50) return 'secondary'
  return 'destructive'
})

const peerHealthBarClass = computed(() => {
  if (peerHealthPercentage.value >= 80) return 'bg-green-500'
  if (peerHealthPercentage.value >= 50) return 'bg-yellow-500'
  return 'bg-red-500'
})

// Block production
const blockProductionStatus = computed(() => {
  if (recentBlocksCount.value > 30) return 'Active'
  if (recentBlocksCount.value > 10) return 'Moderate'
  return 'Low'
})

const blockProductionVariant = computed(() => {
  if (recentBlocksCount.value > 30) return 'default'
  if (recentBlocksCount.value > 10) return 'secondary'
  return 'outline'
})

// Transaction throughput
const txThroughputStatus = computed(() => {
  if (avgTxPerMinute.value > 10) return 'High'
  if (avgTxPerMinute.value > 5) return 'Normal'
  return 'Low'
})

const txThroughputVariant = computed(() => {
  if (avgTxPerMinute.value > 10) return 'default'
  if (avgTxPerMinute.value > 5) return 'secondary'
  return 'outline'
})

// Network latency
const networkLatencyStatus = computed(() => 'Optimal')
const networkLatencyVariant = computed(() => 'default')

// Update last updated time
function updateLastUpdated() {
  const now = new Date()
  lastUpdated.value = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// Refresh health data
async function refreshHealth() {
  refreshing.value = true
  try {
    await dashboardStore.fetchDashboardData()
    updateLastUpdated()
  } finally {
    refreshing.value = false
  }
}

onMounted(() => {
  updateLastUpdated()
})
</script>

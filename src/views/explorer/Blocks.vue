<template>
  <ExplorerLayout>
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="flex flex-wrap items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold">Blocks</h1>
          <p class="text-muted-foreground mt-2">
            Browse all blocks in the blockchain
          </p>
        </div>
        
        <!-- Channel Selector -->
        <div class="flex items-center gap-4">
          <Label for="channel-select" class="text-sm font-medium">Channel:</Label>
          <Select v-model="selectedChannelHash" @update:model-value="handleChannelChange">
            <SelectTrigger id="channel-select" class="w-[200px]">
              <SelectValue placeholder="Select channel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Channels</SelectItem>
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
      <div v-if="loading && blocks.length === 0" class="flex items-center justify-center py-12">
        <div class="text-center space-y-4">
          <Spinner size="lg" class="mx-auto text-primary" />
          <p class="text-muted-foreground">Loading blocks...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="rounded-lg border border-destructive bg-destructive/10 p-4">
        <p class="text-sm text-destructive">{{ error }}</p>
      </div>

      <!-- Blocks Table -->
      <Card v-else-if="blocks.length > 0">
        <CardHeader>
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div>
              <CardTitle>Block List</CardTitle>
              <CardDescription>All blocks in the selected channel</CardDescription>
            </div>
            <div class="flex items-center gap-4">
              <!-- Search Input -->
              <div class="flex items-center gap-2">
                <Input
                  v-model="searchQuery"
                  type="number"
                  placeholder="Search by block number..."
                  class="w-[220px]"
                  @keyup.enter="handleSearch"
                />
                <Button
                  variant="outline"
                  size="sm"
                  @click="handleSearch"
                  :disabled="loading"
                >
                  Search
                </Button>
                <Button
                  v-if="searchQuery"
                  variant="ghost"
                  size="sm"
                  @click="clearSearch"
                >
                  Clear
                </Button>
              </div>
              <Badge variant="secondary">{{ totalBlocks }} blocks</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div class="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead class="w-[100px]">Block #</TableHead>
                  <TableHead>Transactions</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Data Hash</TableHead>
                  <TableHead>Block Hash</TableHead>
                  <TableHead class="text-right">Created At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow
                  v-for="block in blocks"
                  :key="block.blocknum"
                  class="cursor-pointer hover:bg-accent"
                  @click="viewBlockDetails(block.blocknum)"
                >
                  <TableCell class="font-mono font-semibold">{{ block.blocknum }}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{{ block.txcount }} tx</Badge>
                  </TableCell>
                  <TableCell>{{ block.channelname }}</TableCell>
                  <TableCell class="font-mono text-xs">{{ block.datahash?.substring(0, 24) }}...</TableCell>
                  <TableCell class="font-mono text-xs">{{ block.blockhash?.substring(0, 24) }}...</TableCell>
                  <TableCell class="text-right text-sm">{{ formatDate(block.createdt) }}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          
          <!-- Pagination Controls -->
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-4">
            <div class="flex items-center gap-4">
              <div class="text-sm text-muted-foreground">
                Showing {{ ((currentPage - 1) * pageSize) + 1 }} to {{ Math.min(currentPage * pageSize, totalBlocks) }} of {{ totalBlocks }} blocks
              </div>
              
              <!-- Page Size Selector -->
              <div class="flex items-center gap-2">
                <Label for="page-size" class="text-sm whitespace-nowrap">Per page:</Label>
                <Select v-model="pageSize" @update:model-value="handlePageSizeChange">
                  <SelectTrigger id="page-size" class="w-[80px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem :value="5">5</SelectItem>
                    <SelectItem :value="10">10</SelectItem>
                    <SelectItem :value="20">20</SelectItem>
                    <SelectItem :value="50">50</SelectItem>
                    <SelectItem :value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div class="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                @click="goToPage(currentPage - 1)"
                :disabled="currentPage === 1 || loading"
              >
                Previous
              </Button>
              <div class="flex items-center gap-1">
                <Button
                  v-for="page in visiblePages"
                  :key="page"
                  :variant="page === currentPage ? 'default' : 'outline'"
                  size="sm"
                  @click="goToPage(page)"
                  :disabled="loading"
                  class="w-8"
                >
                  {{ page }}
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                @click="goToPage(currentPage + 1)"
                :disabled="currentPage === totalPages || loading"
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Empty State -->
      <Card v-else>
        <CardHeader>
          <CardTitle>No Blocks Found</CardTitle>
          <CardDescription>
            No blocks available in the selected channel.
          </CardDescription>
        </CardHeader>
      </Card>

      <!-- Block Details Modal -->
      <BlockDetailsModal
        v-model:open="showBlockDetailsModal"
        :channel-hash="selectedChannelHash"
        :block-number="selectedBlockNumber"
      />
    </div>
  </ExplorerLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import ExplorerLayout from '@/layouts/ExplorerLayout.vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import BlockDetailsModal from '@/components/explorer/BlockDetailsModal.vue'
import { useDashboardStore } from '@/stores/dashboard'
import { blocksApi } from '@/api/explorer/blocks'

const router = useRouter()
const dashboardStore = useDashboardStore()

const selectedChannelHash = ref('')
const blocks = ref<any[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const currentPage = ref(1)
const pageSize = ref(10)
const totalBlocks = ref(0)
const showBlockDetailsModal = ref(false)
const selectedBlockNumber = ref<number | null>(null)
const searchQuery = ref('')

// Initialize
onMounted(async () => {
  await dashboardStore.initializeDashboard()
  
  // Default to "all" channels
  selectedChannelHash.value = 'all'
  await fetchBlocks()
})

// Watch for channel changes
watch(selectedChannelHash, async (newHash) => {
  if (newHash) {
    currentPage.value = 1
    await fetchBlocks()
  }
})

// Fetch blocks
async function fetchBlocks() {
  if (!selectedChannelHash.value) return
  
  loading.value = true
  error.value = null
  
  try {
    // API expects 0-indexed pages
    const response = await blocksApi.getBlockList(
      selectedChannelHash.value,
      currentPage.value - 1,
      pageSize.value
    )
    
    blocks.value = response.rows || []
    totalBlocks.value = response.total || blocks.value.length
  } catch (err: any) {
    error.value = err.message || 'Failed to fetch blocks'
    console.error('Error fetching blocks:', err)
  } finally {
    loading.value = false
  }
}

// Handle channel change
async function handleChannelChange(channelHash: string) {
  await dashboardStore.changeChannel(channelHash)
  selectedChannelHash.value = channelHash
}

// Pagination
const totalPages = computed(() => {
  return Math.ceil(totalBlocks.value / pageSize.value)
})

const visiblePages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  const pages: number[] = []
  
  let start = Math.max(1, current - 2)
  let end = Math.min(total, start + 4)
  
  if (end - start < 4) {
    start = Math.max(1, end - 4)
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

async function goToPage(page: number) {
  if (page < 1 || page > totalPages.value || page === currentPage.value) return
  currentPage.value = page
  await fetchBlocks()
}

// Handle page size change
async function handlePageSizeChange(newSize: number) {
  pageSize.value = newSize
  currentPage.value = 1 // Reset to first page when changing page size
  await fetchBlocks()
}

// View block details
function viewBlockDetails(blockNumber: number) {
  selectedBlockNumber.value = blockNumber
  showBlockDetailsModal.value = true
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
    minute: '2-digit',
    second: '2-digit'
  })
}

// Search functionality
async function handleSearch() {
  if (!searchQuery.value) {
    return
  }
  
  const blockNum = typeof searchQuery.value === 'string' 
    ? parseInt(searchQuery.value.trim()) 
    : parseInt(String(searchQuery.value))
    
  if (isNaN(blockNum) || blockNum < 1) {
    error.value = 'Please enter a valid block number'
    return
  }
  
  // Open the block details modal directly
  viewBlockDetails(blockNum)
}

function clearSearch() {
  searchQuery.value = ''
  error.value = null
}
</script>

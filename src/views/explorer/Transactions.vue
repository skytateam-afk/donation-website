<template>
  <ExplorerLayout>
    <div class="space-y-6">
      <!-- Page Header -->
      <div>
        <h1 class="text-3xl font-bold">Transactions</h1>
        <p class="text-muted-foreground mt-2">
          Browse all transactions in the blockchain
        </p>
      </div>

      <!-- Search and Filters -->
      <Card>
        <CardHeader>
          <div class="flex flex-wrap items-center justify-between">
            <div>
              <CardTitle>Advanced Search & Filters</CardTitle>
              <CardDescription>Filter transactions by various criteria</CardDescription>
            </div>
            <Button variant="ghost" size="sm" @click="filtersOpen = !filtersOpen">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4 transition-transform duration-200"
                :class="{ 'rotate-180': filtersOpen }"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
              <span class="ml-2">{{ filtersOpen ? 'Hide' : 'Show' }} Filters</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent v-if="filtersOpen">
              <div class="space-y-4">
                <!-- Row 1: Basic Filters -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <!-- Transaction ID Search -->
              <div class="space-y-2">
                <Label for="tx-search">Transaction ID</Label>
                <Input
                  id="tx-search"
                  v-model="searchFilters.txId"
                  placeholder="Enter transaction ID..."
                  @keyup.enter="applyFilters"
                />
              </div>

              <!-- Block Number Search -->
              <div class="space-y-2">
                <Label for="block-search">Block Number</Label>
                <Input
                  id="block-search"
                  v-model="searchFilters.blockNumber"
                  type="number"
                  placeholder="Enter block number..."
                  @keyup.enter="applyFilters"
                />
              </div>

              <!-- Chaincode Filter -->
              <div class="space-y-2">
                <Label for="chaincode-filter">Chaincode</Label>
                <Select v-model="searchFilters.chaincode">
                  <SelectTrigger id="chaincode-filter">
                    <SelectValue placeholder="All chaincodes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Chaincodes</SelectItem>
                    <SelectItem value="bankloan">Bank Loan</SelectItem>
                    <SelectItem value="p2ptransfer">P2P Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

                <!-- Row 2: Status, Type, and Channel -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <!-- Status Filter -->
              <div class="space-y-2">
                <Label for="status-filter">Status</Label>
                <Select v-model="searchFilters.status">
                  <SelectTrigger id="status-filter">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="VALID">Valid</SelectItem>
                    <SelectItem value="INVALID">Invalid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <!-- Transaction Type Filter -->
              <div class="space-y-2">
                <Label for="type-filter">Transaction Type</Label>
                <Select v-model="searchFilters.type">
                  <SelectTrigger id="type-filter">
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="ENDORSER_TRANSACTION">Endorser Transaction</SelectItem>
                    <SelectItem value="CONFIG">Config</SelectItem>
                    <SelectItem value="CONFIG_UPDATE">Config Update</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <!-- Channel Selector -->
              <div v-if="dashboardStore.channelsInfo.length > 0" class="space-y-2">
                <Label for="channel-select">Channel</Label>
                <Select v-model="selectedChannelHash" @update:model-value="handleChannelChange">
                  <SelectTrigger id="channel-select">
                    <SelectValue placeholder="All channels" />
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

                <!-- Row 3: Date Range and Amount Range -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Date Range Filter -->
              <div class="space-y-2">
                <Label>Date Range</Label>
                <DateRangePicker
                  v-model="searchFilters.dateRange"
                  id="date-range"
                />
              </div>

              <!-- Amount Range Filter (for future use with transaction amounts) -->
              <div class="grid grid-cols-2 gap-2">
                <div class="space-y-2">
                  <Label for="amount-min">Min Amount</Label>
                  <Input
                    id="amount-min"
                    v-model="searchFilters.amountMin"
                    type="number"
                    placeholder="Min"
                    step="0.01"
                  />
                </div>
                <div class="space-y-2">
                  <Label for="amount-max">Max Amount</Label>
                  <Input
                    id="amount-max"
                    v-model="searchFilters.amountMax"
                    type="number"
                    placeholder="Max"
                    step="0.01"
                  />
                </div>
              </div>
            </div>

                <!-- Action Buttons -->
                <div class="flex flex-wrap items-center justify-between gap-2">
              <div class="flex gap-2">
                <Button @click="applyFilters">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search
                </Button>
                <Button @click="clearFilters" variant="outline">
                  Clear Filters
                </Button>
              </div>
              
              <!-- Export Buttons -->
              <div class="flex gap-2">
                <Button @click="handleExport('pdf')" variant="outline" size="sm" :disabled="transactions.length === 0">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  PDF
                </Button>
                <Button @click="handleExport('excel')" variant="outline" size="sm" :disabled="transactions.length === 0">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Excel
                </Button>
                <Button @click="handleExport('csv')" variant="outline" size="sm" :disabled="transactions.length === 0">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  CSV
                </Button>
              </div>
                </div>
              </div>
            </CardContent>
        </Card>


      <!-- Loading State -->
      <div v-if="loading && transactions.length === 0" class="flex items-center justify-center py-12">
        <div class="text-center space-y-4">
          <Spinner size="lg" class="mx-auto text-primary" />
          <p class="text-muted-foreground">Loading transactions...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="rounded-lg border border-destructive bg-destructive/10 p-4">
        <p class="text-sm text-destructive">{{ error }}</p>
      </div>

      <!-- Transactions Table -->
      <Card v-else-if="transactions.length > 0">
        <CardHeader>
          <div class="flex flex-wrap items-center justify-between">
            <div>
              <CardTitle>Transaction List</CardTitle>
              <CardDescription>
                Showing page {{ currentPage }} of {{ totalPages }} ({{ totalTransactions }} total transactions)
              </CardDescription>
            </div>
            <div class="flex items-center gap-3">
              <div class="flex items-center gap-2">
                <Label for="chaincode-filter-quick" class="text-sm">Filter by:</Label>
                <Select v-model="chaincodeFilter" @update:model-value="handleChaincodeFilter">
                  <SelectTrigger id="chaincode-filter-quick" class="w-[180px]">
                    <SelectValue placeholder="All Transactions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Transactions</SelectItem>
                    <SelectItem value="bankloan">Bank Loans</SelectItem>
                    <SelectItem value="p2ptransfer">P2P Transfers</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Badge variant="secondary">{{ filteredTransactionsList.length }} shown</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div class="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead class="w-[80px]">Block #</TableHead>
                  <TableHead>Transaction Hash</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Chaincode</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead class="text-right">Created At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow
                  v-for="tx in filteredTransactionsList"
                  :key="tx.txhash"
                  class="cursor-pointer hover:bg-accent"
                  @click="viewTransactionDetails(tx.txhash)"
                >
                  <TableCell class="font-mono font-semibold">{{ tx.blockid }}</TableCell>
                  <TableCell class="font-mono text-xs" :title="tx.txhash">
                    {{ tx.txhash?.substring(0, 16) }}...{{ tx.txhash?.substring(tx.txhash.length - 16) }}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{{ tx.type || 'ENDORSER_TRANSACTION' }}</Badge>
                  </TableCell>
                  <TableCell>{{ tx.chaincodename || 'N/A' }}</TableCell>
                  <TableCell>
                    <Badge :variant="tx.validation_code === 'VALID' ? 'default' : 'destructive'">
                      {{ tx.validation_code || 'VALID' }}
                    </Badge>
                  </TableCell>
                  <TableCell class="text-right text-sm">{{ formatDate(tx.createdt) }}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          
          <!-- Pagination Controls -->
          <div class="flex flex-wrap items-center justify-between mt-4">
            <div class="flex items-center gap-4">
              <div class="text-sm text-muted-foreground">
                Showing {{ ((currentPage - 1) * pageSize) + 1 }} to {{ Math.min(currentPage * pageSize, totalTransactions) }} of {{ totalTransactions }} transactions
              </div>
              <div class="flex items-center gap-2">
                <Label for="page-size" class="text-sm text-muted-foreground">Items per page:</Label>
                <Select v-model="pageSize" @update:model-value="handlePageSizeChange">
                  <SelectTrigger id="page-size" class="w-[80px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem :value="10">10</SelectItem>
                    <SelectItem :value="25">25</SelectItem>
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
          <CardTitle>No Transactions Found</CardTitle>
          <CardDescription>
            No transactions available in the selected channel.
          </CardDescription>
        </CardHeader>
      </Card>

      <!-- Transaction Details Dialog -->
      <Dialog v-model:open="showTransactionDetails">
        <DialogContent class="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>
              Detailed information about this transaction
            </DialogDescription>
          </DialogHeader>
          
          <div v-if="selectedTransaction" class="space-y-4">
            <!-- Transaction Information Table -->
            <div class="rounded-md border">
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell class="font-medium w-[200px]">Transaction ID</TableCell>
                    <TableCell class="font-mono text-xs break-all">{{ selectedTransaction.txhash }}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell class="font-medium">Block Number</TableCell>
                    <TableCell class="font-mono">{{ selectedTransaction.blockid }}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell class="font-medium">Type</TableCell>
                    <TableCell>{{ selectedTransaction.type || 'ENDORSER_TRANSACTION' }}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell class="font-medium">Chaincode</TableCell>
                    <TableCell>{{ selectedTransaction.chaincodename || 'N/A' }}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell class="font-medium">Validation Code</TableCell>
                    <TableCell>
                      <Badge :variant="selectedTransaction.validation_code === 'VALID' ? 'default' : 'destructive'">
                        {{ selectedTransaction.validation_code || 'VALID' }}
                      </Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell class="font-medium">Creator MSP ID</TableCell>
                    <TableCell>{{ selectedTransaction.creator_msp_id || 'N/A' }}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell class="font-medium">Endorser MSP ID</TableCell>
                    <TableCell>{{ selectedTransaction.endorser_msp_id || 'N/A' }}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell class="font-medium">Created At</TableCell>
                    <TableCell>{{ formatDate(selectedTransaction.createdt) }}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <!-- Payload Information -->
            <div v-if="selectedTransaction.payload">
              <h3 class="text-lg font-semibold mb-2">Payload Information</h3>
              <div class="rounded-md border p-4 bg-muted">
                <pre class="text-xs overflow-x-auto">{{ JSON.stringify(selectedTransaction.payload, null, 2) }}</pre>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" @click="showTransactionDetails = false">Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  </ExplorerLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import ExplorerLayout from '@/layouts/ExplorerLayout.vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Collapsible from '@/components/ui/collapsible.vue'
import { CollapsibleContent, CollapsibleTrigger } from 'radix-vue'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'
import DateRangePicker from '@/components/ui/date-range-picker.vue'
import { useDashboardStore } from '@/stores/dashboard'
import { transactionsApi } from '@/api/explorer/transactions'
import { useExport } from '@/composables/useExport'
import { toast } from 'vue-sonner'

const dashboardStore = useDashboardStore()
const { exportToPDF, exportToExcel, exportToCSV } = useExport()

const selectedChannelHash = ref('')
const transactions = ref<any[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const currentPage = ref(1)
const pageSize = ref(10)
const totalTransactions = ref(0)
const showTransactionDetails = ref(false)
const selectedTransaction = ref<any>(null)
const filtersOpen = ref(false)
const chaincodeFilter = ref<string>('all')

interface DateRange {
  from: Date | undefined
  to?: Date | undefined
}

// Search filters
const searchFilters = ref({
  txId: '',
  blockNumber: '',
  chaincode: 'all',
  status: 'all',
  type: 'all',
  dateRange: undefined as DateRange | undefined,
  amountMin: '',
  amountMax: ''
})

// Simply return transactions - filtering is now done server-side
const filteredTransactionsList = computed(() => {
  return transactions.value
})

// Initialize
onMounted(async () => {
  await dashboardStore.initializeDashboard()
  
  // Don't pre-select a channel - show all channels by default
  selectedChannelHash.value = 'all'
  await fetchTransactions()
})

// Watch for channel changes
watch(selectedChannelHash, async () => {
  currentPage.value = 1
  await fetchTransactions()
})

// Watch for page changes to fetch new data
watch(currentPage, async () => {
  await fetchTransactions()
})

// Watch for page size changes
watch(pageSize, async () => {
  currentPage.value = 1 // Reset to first page when changing page size
  await fetchTransactions()
})

// Watch for chaincode filter changes
watch(chaincodeFilter, async () => {
  currentPage.value = 1 // Reset to first page when changing filter
  await fetchTransactions()
})

// Fetch transactions with server-side pagination and filtering
async function fetchTransactions() {
  loading.value = true
  error.value = null
  
  try {
    // Build query parameters for filtering
    const queryParams: any = {}
    
    // Add active filters to query params
    if (searchFilters.value.txId && searchFilters.value.txId.trim() !== '') {
      queryParams.txId = searchFilters.value.txId.trim()
    }
    
    if (searchFilters.value.blockNumber && searchFilters.value.blockNumber !== '') {
      queryParams.blockNumber = searchFilters.value.blockNumber
    }
    
    if (searchFilters.value.chaincode && searchFilters.value.chaincode !== 'all') {
      queryParams.chaincode = searchFilters.value.chaincode
    }
    
    if (chaincodeFilter.value && chaincodeFilter.value !== 'all') {
      queryParams.chaincode = chaincodeFilter.value
    }
    
    if (searchFilters.value.status && searchFilters.value.status !== 'all') {
      queryParams.status = searchFilters.value.status
    }
    
    if (searchFilters.value.type && searchFilters.value.type !== 'all') {
      queryParams.type = searchFilters.value.type
    }
    
    // Only add channelHash filter if a specific channel is selected
    if (selectedChannelHash.value && selectedChannelHash.value !== 'all') {
      queryParams.channelHash = selectedChannelHash.value
    }
    
    // Date range filters
    if (searchFilters.value.dateRange?.from) {
      queryParams.dateFrom = searchFilters.value.dateRange.from.toISOString()
    }
    
    if (searchFilters.value.dateRange?.to) {
      queryParams.dateTo = searchFilters.value.dateRange.to.toISOString()
    }
    
    // Amount range filters
    if (searchFilters.value.amountMin && searchFilters.value.amountMin !== '') {
      queryParams.amountMin = searchFilters.value.amountMin
    }
    
    if (searchFilters.value.amountMax && searchFilters.value.amountMax !== '') {
      queryParams.amountMax = searchFilters.value.amountMax
    }
    
    // Fetch with filters - pass 'all' for channelHash to get all channels
    const channelHashParam = selectedChannelHash.value || 'all'
    const response = await transactionsApi.getTransactionList(
      channelHashParam,
      currentPage.value - 1, // API uses 0-based page index
      pageSize.value,
      queryParams
    )
    
    transactions.value = response.rows || []
    totalTransactions.value = response.total || 0
  } catch (err: any) {
    error.value = err.message || 'Failed to fetch transactions'
    console.error('Error fetching transactions:', err)
  } finally {
    loading.value = false
  }
}

// Handle channel change
async function handleChannelChange(channelHash: string) {
  await dashboardStore.changeChannel(channelHash)
  selectedChannelHash.value = channelHash
}

// Pagination - use filtered count for display, but total from server for page calculation
const totalPages = computed(() => {
  return Math.ceil(totalTransactions.value / pageSize.value)
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

function goToPage(page: number) {
  if (page < 1 || page > totalPages.value || page === currentPage.value) return
  currentPage.value = page
  // fetchTransactions will be called automatically by the watch on currentPage
}

// Handle page size change
function handlePageSizeChange(newSize: number) {
  pageSize.value = newSize
  // fetchTransactions will be called automatically by the watch on pageSize
}

// Handle chaincode filter change - no longer needed as watch handles it
function handleChaincodeFilter(value: string) {
  // The watch on chaincodeFilter will automatically trigger fetchTransactions
  chaincodeFilter.value = value
}

// View transaction details
async function viewTransactionDetails(txHash: string) {
  try {
    // Use the transaction's channel hash if available, otherwise use selected or 'all'
    const channelHashParam = selectedChannelHash.value || 'all'
    const response = await transactionsApi.getTransactionById(channelHashParam, txHash)
    // API returns { status: 200, transaction: {...} }
    selectedTransaction.value = response?.transaction || response
    showTransactionDetails.value = true
  } catch (err: any) {
    error.value = err.message || 'Failed to fetch transaction details'
    console.error('Error fetching transaction details:', err)
    toast.error('Failed to load transaction details')
  }
}

// Search filter functions
async function applyFilters() {
  currentPage.value = 1 // Reset to first page when applying filters
  await fetchTransactions()
  toast.success('Filters applied successfully')
}

async function clearFilters() {
  searchFilters.value = {
    txId: '',
    blockNumber: '',
    chaincode: 'all',
    status: 'all',
    type: 'all',
    dateRange: undefined,
    amountMin: '',
    amountMax: ''
  }
  chaincodeFilter.value = 'all'
  currentPage.value = 1
  await fetchTransactions()
  toast.success('Filters cleared')
}

// Export handler
function handleExport(format: 'pdf' | 'excel' | 'csv') {
  try {
    const exportData = transactions.value.map(tx => ({
      block_number: tx.blockid,
      transaction_id: tx.txhash,
      type: tx.type || 'ENDORSER_TRANSACTION',
      chaincode: tx.chaincodename || 'N/A',
      status: tx.validation_code || 'VALID',
      creator_msp: tx.creator_msp_id || 'N/A',
      created_at: formatDate(tx.createdt)
    }))

    const columns = [
      { header: 'Block #', key: 'block_number', width: 10 },
      { header: 'Record ID', key: 'transaction_id', width: 40 },
      { header: 'Type', key: 'type', width: 20 },
      { header: 'Chaincode', key: 'chaincode', width: 15 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Creator MSP', key: 'creator_msp', width: 15 },
      { header: 'Created At', key: 'created_at', width: 20 }
    ]

    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `transactions_${timestamp}`

    if (format === 'pdf') {
      exportToPDF({
        filename,
        title: 'Blockchain Transactions Report',
        columns,
        data: exportData,
        orientation: 'landscape'
      })
      toast.success('Transactions exported to PDF successfully')
    } else if (format === 'excel') {
      exportToExcel({
        filename,
        title: 'Transactions',
        columns,
        data: exportData
      })
      toast.success('Transactions exported to Excel successfully')
    } else if (format === 'csv') {
      exportToCSV({
        filename,
        columns,
        data: exportData
      })
      toast.success('Transactions exported to CSV successfully')
    }
  } catch (err: any) {
    toast.error(`Export failed: ${err.message}`)
    console.error('Export error:', err)
  }
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
</script>

<template>
  <ExplorerLayout>
    <div class="space-y-6">
      <!-- Page Header -->
      <div>
        <h1 class="text-3xl font-bold">Regulatory Reports</h1>
        <p class="text-muted-foreground mt-2">
          Generate CBN-compliant regulatory reports for transactions
        </p>
      </div>

      <!-- Report Type Selection -->
      <Card>
        <CardHeader>
          <CardTitle>Generate Report</CardTitle>
          <CardDescription>Select report type and parameters</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <!-- Report Type -->
            <div class="space-y-2">
              <Label for="report-type">Report Type</Label>
              <Select v-model="selectedReportType">
                <SelectTrigger id="report-type">
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily Transaction Report</SelectItem>
                  <SelectItem value="monthly">Monthly Settlement Report</SelectItem>
                  <SelectItem value="sar">Suspicious Activity Report (SAR)</SelectItem>
                  <SelectItem value="cbn-compliance">CBN Compliance Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <!-- Date Range Selection -->
            <div v-if="selectedReportType" class="space-y-2">
              <Label>Report Period</Label>
              <!-- Show date picker for non-daily reports -->
              <DateRangePicker
                v-if="selectedReportType !== 'daily'"
                v-model="reportDateRange"
                id="report-date-range"
              />
              <!-- Show current date for daily reports -->
              <div v-else class="p-3 bg-muted rounded-md">
                <p class="text-sm font-medium">
                  {{ formatDate(reportDateRange?.from || new Date()) }}
                </p>
                <p class="text-xs text-muted-foreground mt-1">
                  Daily report for current day
                </p>
              </div>
            </div>

            <!-- Channel Selection -->
            <div v-if="selectedReportType && dashboardStore.channelsInfo.length > 0" class="space-y-2">
              <Label for="report-channel">Channel</Label>
              <Select v-model="selectedChannelHash">
                <SelectTrigger id="report-channel">
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

            <!-- Additional Filters for SAR -->
            <div v-if="selectedReportType === 'sar'" class="space-y-4">
              <div class="space-y-2">
                <Label for="threshold-amount">Threshold Amount (NGN)</Label>
                <Input
                  id="threshold-amount"
                  v-model="sarThreshold"
                  type="number"
                  placeholder="Enter threshold amount"
                  step="0.01"
                />
                <p class="text-xs text-muted-foreground">
                  Transactions above this amount will be flagged
                </p>
              </div>
            </div>

            <!-- Generate Button -->
            <div class="flex gap-2">
              <Button 
                @click="generateReport" 
                :disabled="!canGenerateReport || loading"
                class="flex-1"
              >
                <svg v-if="loading" class="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {{ loading ? 'Generating...' : 'Generate Report' }}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Report Preview -->
      <Card v-if="reportData">
        <CardHeader>
          <div class="flex flex-wrap items-center justify-between">
            <div>
              <CardTitle>{{ reportData.title }}</CardTitle>
              <CardDescription>{{ reportData.description }}</CardDescription>
            </div>
            <div class="flex gap-2">
              <Button @click="exportReport('pdf')" variant="outline" size="sm">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Export PDF
              </Button>
              <Button @click="exportReport('excel')" variant="outline" size="sm">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export Excel
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <!-- Report Summary -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader class="pb-2">
                <CardDescription>Total Transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div class="text-2xl font-bold">{{ reportData.summary.totalTransactions }}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader class="pb-2">
                <CardDescription>Total Volume</CardDescription>
              </CardHeader>
              <CardContent>
                <div class="text-2xl font-bold">{{ formatCurrency(reportData.summary.totalVolume) }}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader class="pb-2">
                <CardDescription>Valid Transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div class="text-2xl font-bold text-green-600">{{ reportData.summary.validTransactions }}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader class="pb-2">
                <CardDescription>Flagged Items</CardDescription>
              </CardHeader>
              <CardContent>
                <div class="text-2xl font-bold text-red-600">{{ reportData.summary.flaggedItems }}</div>
              </CardContent>
            </Card>
          </div>

          <!-- Report Data Table -->
          <div class="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead class="text-right">Amount</TableHead>
                  <TableHead v-if="selectedReportType === 'sar'">Flag Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="item in reportData.items" :key="item.txhash">
                  <TableCell>{{ formatDate(item.createdt) }}</TableCell>
                  <TableCell class="font-mono text-xs">{{ item.txhash?.substring(0, 20) }}...</TableCell>
                  <TableCell>
                    <Badge variant="outline">{{ item.type || 'ENDORSER_TRANSACTION' }}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge :variant="item.validation_code === 'VALID' ? 'default' : 'destructive'">
                      {{ item.validation_code || 'VALID' }}
                    </Badge>
                  </TableCell>
                  <TableCell class="text-right">{{ formatCurrency(item.amount || 0) }}</TableCell>
                  <TableCell v-if="selectedReportType === 'sar'">
                    <Badge variant="destructive">{{ item.flagReason }}</Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <!-- Report Templates Info -->
      <Card>
        <CardHeader>
          <CardTitle>Report Types</CardTitle>
          <CardDescription>Information about available regulatory reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div class="border-l-4 border-blue-500 pl-4">
              <h3 class="font-semibold">Daily Transaction Report</h3>
              <p class="text-sm text-muted-foreground">
                Comprehensive daily summary of all blockchain transactions including volume, count, and status breakdown.
              </p>
            </div>
            <div class="border-l-4 border-green-500 pl-4">
              <h3 class="font-semibold">Monthly Settlement Report</h3>
              <p class="text-sm text-muted-foreground">
                Monthly aggregated report showing settlement patterns, transaction volumes, and reconciliation data.
              </p>
            </div>
            <div class="border-l-4 border-red-500 pl-4">
              <h3 class="font-semibold">Suspicious Activity Report (SAR)</h3>
              <p class="text-sm text-muted-foreground">
                Identifies and flags transactions that exceed specified thresholds or exhibit unusual patterns for regulatory review.
              </p>
            </div>
            <div class="border-l-4 border-purple-500 pl-4">
              <h3 class="font-semibold">CBN Compliance Report</h3>
              <p class="text-sm text-muted-foreground">
                Central Bank of Nigeria (CBN) compliant report format including all required regulatory fields and metrics.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </ExplorerLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import ExplorerLayout from '@/layouts/ExplorerLayout.vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import DateRangePicker from '@/components/ui/date-range-picker.vue'
import { useDashboardStore } from '@/stores/dashboard'
import { transactionsApi } from '@/api/explorer/transactions'
import { useExport } from '@/composables/useExport'
import { toast } from 'vue-sonner'

const dashboardStore = useDashboardStore()
const { exportToPDF, exportToExcel } = useExport()

interface DateRange {
  from: Date | undefined
  to?: Date | undefined
}

const selectedReportType = ref('')
const reportDateRange = ref<DateRange | undefined>(undefined)
const selectedChannelHash = ref('')
const sarThreshold = ref('1000000')
const loading = ref(false)
const reportData = ref<any>(null)

// Watch for report type changes to auto-set date for daily reports
watch(selectedReportType, (newType) => {
  if (newType === 'daily') {
    // Set to current day
    const today = new Date()
    today.setHours(12, 0, 0, 0) // Set to noon to avoid timezone issues
    reportDateRange.value = {
      from: today,
      to: today
    }
  } else {
    // Reset for other report types
    reportDateRange.value = undefined
  }
})

const canGenerateReport = computed(() => {
  return selectedReportType.value && 
         reportDateRange.value?.from && 
         reportDateRange.value?.to &&
         selectedChannelHash.value
})

onMounted(async () => {
  await dashboardStore.initializeDashboard()
  if (dashboardStore.currentChannelHash) {
    selectedChannelHash.value = dashboardStore.currentChannelHash
  }
})

async function generateReport() {
  if (!canGenerateReport.value) return

  loading.value = true
  reportData.value = null

  try {
    // Fetch transactions for the date range
    const response = await transactionsApi.getTransactionList(
      selectedChannelHash.value,
      1,
      1000 // Fetch more for reports
    )

    const transactions = response.rows || []
    
    // Filter by date range
    const filteredTxs = transactions.filter((tx: any) => {
      if (!tx.createdt) return false
      const txDate = new Date(tx.createdt)
      const fromDate = new Date(reportDateRange.value!.from!)
      const toDate = new Date(reportDateRange.value!.to!)
      fromDate.setHours(0, 0, 0, 0)
      toDate.setHours(23, 59, 59, 999)
      return txDate >= fromDate && txDate <= toDate
    })

    // Generate report based on type
    switch (selectedReportType.value) {
      case 'daily':
        reportData.value = generateDailyReport(filteredTxs)
        break
      case 'monthly':
        reportData.value = generateMonthlyReport(filteredTxs)
        break
      case 'sar':
        reportData.value = generateSARReport(filteredTxs)
        break
      case 'cbn-compliance':
        reportData.value = generateCBNReport(filteredTxs)
        break
    }

    toast.success('Report generated successfully')
  } catch (err: any) {
    toast.error(`Failed to generate report: ${err.message}`)
    console.error('Report generation error:', err)
  } finally {
    loading.value = false
  }
}

function generateDailyReport(transactions: any[]) {
  const validTxs = transactions.filter(tx => tx.validation_code === 'VALID')
  
  return {
    title: 'Daily Transaction Report',
    description: `Report for ${formatDate(reportDateRange.value!.from!)} to ${formatDate(reportDateRange.value!.to!)}`,
    summary: {
      totalTransactions: transactions.length,
      totalVolume: transactions.reduce((sum, tx) => sum + (extractAmount(tx) || 0), 0),
      validTransactions: validTxs.length,
      flaggedItems: transactions.length - validTxs.length
    },
    items: transactions.map(tx => ({
      ...tx,
      amount: extractAmount(tx)
    }))
  }
}

function generateMonthlyReport(transactions: any[]) {
  const validTxs = transactions.filter(tx => tx.validation_code === 'VALID')
  
  return {
    title: 'Monthly Settlement Report',
    description: `Monthly report for ${formatDate(reportDateRange.value!.from!)} to ${formatDate(reportDateRange.value!.to!)}`,
    summary: {
      totalTransactions: transactions.length,
      totalVolume: transactions.reduce((sum, tx) => sum + (extractAmount(tx) || 0), 0),
      validTransactions: validTxs.length,
      flaggedItems: transactions.length - validTxs.length
    },
    items: transactions.map(tx => ({
      ...tx,
      amount: extractAmount(tx)
    }))
  }
}

function generateSARReport(transactions: any[]) {
  const threshold = parseFloat(sarThreshold.value)
  const flaggedTxs = transactions.filter(tx => {
    const amount = extractAmount(tx)
    return amount !== null && amount > threshold
  })

  return {
    title: 'Suspicious Activity Report (SAR)',
    description: `Transactions exceeding ₦${formatCurrency(threshold)} threshold`,
    summary: {
      totalTransactions: transactions.length,
      totalVolume: transactions.reduce((sum, tx) => sum + (extractAmount(tx) || 0), 0),
      validTransactions: transactions.filter(tx => tx.validation_code === 'VALID').length,
      flaggedItems: flaggedTxs.length
    },
    items: flaggedTxs.map(tx => ({
      ...tx,
      amount: extractAmount(tx),
      flagReason: `Exceeds threshold (₦${formatCurrency(threshold)})`
    }))
  }
}

function generateCBNReport(transactions: any[]) {
  const validTxs = transactions.filter(tx => tx.validation_code === 'VALID')
  
  return {
    title: 'CBN Compliance Report',
    description: `CBN regulatory report for ${formatDate(reportDateRange.value!.from!)} to ${formatDate(reportDateRange.value!.to!)}`,
    summary: {
      totalTransactions: transactions.length,
      totalVolume: transactions.reduce((sum, tx) => sum + (extractAmount(tx) || 0), 0),
      validTransactions: validTxs.length,
      flaggedItems: transactions.length - validTxs.length
    },
    items: transactions.map(tx => ({
      ...tx,
      amount: extractAmount(tx)
    }))
  }
}

function extractAmount(tx: any): number | null {
  try {
    if (tx.payload && typeof tx.payload === 'object') {
      if (tx.payload.amount) return parseFloat(tx.payload.amount)
      if (tx.payload.value) return parseFloat(tx.payload.value)
      if (tx.payload.data?.amount) return parseFloat(tx.payload.data.amount)
    }
  } catch (e) {
    // Ignore parsing errors
  }
  return null
}

function exportReport(format: 'pdf' | 'excel') {
  if (!reportData.value) return

  try {
    const columns = [
      { header: 'Date', key: 'createdt', width: 20 },
      { header: 'Transaction ID', key: 'txhash', width: 40 },
      { header: 'Type', key: 'type', width: 20 },
      { header: 'Status', key: 'validation_code', width: 12 },
      { header: 'Amount', key: 'amount', width: 15 }
    ]

    if (selectedReportType.value === 'sar') {
      columns.push({ header: 'Flag Reason', key: 'flagReason', width: 30 })
    }

    const exportData = reportData.value.items.map((item: any) => ({
      ...item,
      createdt: formatDate(item.createdt),
      type: item.type || 'ENDORSER_TRANSACTION',
      validation_code: item.validation_code || 'VALID',
      amount: formatCurrency(item.amount || 0)
    }))

    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `${selectedReportType.value}_report_${timestamp}`

    if (format === 'pdf') {
      exportToPDF({
        filename,
        title: reportData.value.title,
        columns,
        data: exportData,
        orientation: 'landscape'
      })
      toast.success('Report exported to PDF successfully')
    } else if (format === 'excel') {
      exportToExcel({
        filename,
        title: reportData.value.title,
        columns,
        data: exportData
      })
      toast.success('Report exported to Excel successfully')
    }
  } catch (err: any) {
    toast.error(`Export failed: ${err.message}`)
    console.error('Export error:', err)
  }
}

function formatDate(date: Date | string): string {
  if (!date) return 'N/A'
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2
  }).format(amount)
}
</script>

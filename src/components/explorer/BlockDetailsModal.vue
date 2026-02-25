<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="max-w-4xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Block #{{ block?.blocknum }}</DialogTitle>
        <DialogDescription>
          Detailed information about this block
        </DialogDescription>
      </DialogHeader>
      
      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="text-center space-y-4">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p class="text-muted-foreground">Loading block details...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="rounded-lg border border-destructive bg-destructive/10 p-4">
        <p class="text-sm text-destructive">{{ error }}</p>
      </div>
      
      <!-- Block Details -->
      <div v-else-if="block" class="space-y-4">
        <!-- Block Information Table -->
        <div class="rounded-md border">
          <Table>
            <TableBody>
              <TableRow>
                <TableCell class="font-medium w-[200px]">Block Number</TableCell>
                <TableCell class="font-mono">{{ block.blocknum }}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell class="font-medium">Transactions</TableCell>
                <TableCell>{{ block.txcount }}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell class="font-medium">Channel</TableCell>
                <TableCell>{{ block.channelname }}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell class="font-medium">Created At</TableCell>
                <TableCell>{{ formatDate(block.createdt) }}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell class="font-medium">Data Hash</TableCell>
                <TableCell class="font-mono text-xs break-all">{{ block.datahash }}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell class="font-medium">Previous Hash</TableCell>
                <TableCell class="font-mono text-xs break-all">{{ block.prehash }}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell class="font-medium">Block Hash</TableCell>
                <TableCell class="font-mono text-xs break-all">{{ block.blockhash }}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <!-- Transactions in Block -->
        <div v-if="block.txcount > 0">
          <h3 class="text-lg font-semibold mb-2">Transactions in this Block</h3>
          
          <!-- Transactions details -->
          <div v-if="transactions.length > 0" class="space-y-4">
            <div v-for="(tx, index) in transactions" :key="tx.txhash" class="rounded-md border">
              <div class="bg-muted/50 px-4 py-2 border-b">
                <h4 class="font-semibold text-sm">Transaction #{{ index + 1 }}</h4>
              </div>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell class="font-medium w-[200px]">Transaction ID</TableCell>
                    <TableCell class="font-mono text-xs break-all">{{ tx.txhash }}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell class="font-medium">Type</TableCell>
                    <TableCell>
                      <Badge variant="outline">{{ tx.type || 'N/A' }}</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell class="font-medium">Chaincode</TableCell>
                    <TableCell>{{ tx.chaincodename || 'N/A' }}</TableCell>
                  </TableRow>
                  <TableRow v-if="tx.creator_msp_id">
                    <TableCell class="font-medium">Creator MSP</TableCell>
                    <TableCell>{{ tx.creator_msp_id }}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell class="font-medium">Validation Status</TableCell>
                    <TableCell>
                      <Badge :variant="tx.validation_code === 'VALID' ? 'default' : 'destructive'">
                        {{ tx.validation_code || 'N/A' }}
                      </Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell class="font-medium">Created At</TableCell>
                    <TableCell>{{ formatDate(tx.createdt) }}</TableCell>
                  </TableRow>
                  
                  <!-- Payload/Transaction Data -->
                  <TableRow v-if="tx.payload && Object.keys(tx.payload).length > 0">
                    <TableCell class="font-medium align-top">Transaction Data</TableCell>
                    <TableCell>
                      <div class="space-y-2">
                        <div v-for="(value, key) in tx.payload" :key="key">
                          <!-- Only show fields that are not null -->
                          <div v-if="value !== null && value !== undefined" class="flex gap-2">
                            <span class="font-medium text-sm text-muted-foreground min-w-[150px]">{{ key }}:</span>
                            <span class="text-sm break-all">{{ formatPayloadValue(value) }}</span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
          
          <!-- No transactions found -->
          <div v-else class="rounded-md border p-4">
            <p class="text-sm text-muted-foreground">
              This block contains {{ block.txcount }} transaction{{ block.txcount !== 1 ? 's' : '' }}, but transaction details are not available.
            </p>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="closeModal">Close</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { blocksApi } from '@/api/explorer/blocks'

interface Props {
  open: boolean
  channelHash: string
  blockNumber: number | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const isOpen = ref(props.open)
const block = ref<any>(null)
const transactions = ref<any[]>([])
const loading = ref(false)
const loadingTransactions = ref(false)
const error = ref<string | null>(null)

// Watch for open prop changes
watch(() => props.open, (newValue) => {
  isOpen.value = newValue
  if (newValue && props.blockNumber !== null) {
    fetchBlockDetails()
  }
})

// Watch for isOpen changes to emit update
watch(isOpen, (newValue) => {
  emit('update:open', newValue)
  if (!newValue) {
    // Reset state when closing
    block.value = null
    error.value = null
  }
})

// Fetch block details
async function fetchBlockDetails() {
  if (!props.channelHash || props.blockNumber === null) return
  
  loading.value = true
  error.value = null
  block.value = null
  transactions.value = []
  
  try {
    const response = await blocksApi.getBlockByNumber(props.channelHash, props.blockNumber)
    console.log('Block API response:', response)
    
    // API returns { status: 200, block: {...} }
    block.value = response?.block || response
    console.log('Block value:', block.value)
    
    // The block response already includes transactions array!
    if (block.value.transactions && Array.isArray(block.value.transactions)) {
      transactions.value = block.value.transactions
      console.log('Transactions from block:', transactions.value)
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to fetch block details'
    console.error('Error fetching block details:', err)
  } finally {
    loading.value = false
  }
}

// Close modal
function closeModal() {
  isOpen.value = false
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

// Format payload value for display
function formatPayloadValue(value: any): string {
  if (value === null || value === undefined) {
    return 'N/A'
  }
  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2)
  }
  return String(value)
}
</script>

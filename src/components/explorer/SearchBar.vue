<template>
  <Card>
    <CardHeader>
      <CardTitle>Search Blockchain</CardTitle>
      <CardDescription>Search by block number, transaction ID, or block hash</CardDescription>
    </CardHeader>
    <CardContent>
      <div class="flex gap-2">
        <div class="flex-1">
          <Input
            v-model="searchQuery"
            placeholder="Enter block number, transaction ID, or block hash..."
            @keyup.enter="handleSearch"
            class="w-full"
          />
        </div>
        <Button @click="handleSearch" :disabled="!searchQuery.trim() || searching">
          <svg
            v-if="!searching"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            class="h-4 w-4 mr-2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <span v-if="searching" class="animate-spin mr-2">⏳</span>
          {{ searching ? 'Searching...' : 'Search' }}
        </Button>
      </div>

      <!-- Search Results -->
      <div v-if="searchResult" class="mt-4 space-y-4">
        <div class="flex flex-wrap items-center justify-between">
          <div class="flex items-center gap-2">
            <h3 class="text-sm font-semibold">Search Result</h3>
            <Badge>{{ searchResult.type === 'block' ? 'Block' : 'Transaction' }}</Badge>
          </div>
          <Button variant="ghost" size="sm" @click="clearSearch">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              class="h-4 w-4"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </Button>
        </div>

        <!-- Block Result Table -->
        <div v-if="searchResult.type === 'block'" class="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead class="w-[200px]">Property</TableHead>
                <TableHead>Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell class="font-medium">Block Number</TableCell>
                <TableCell class="font-mono">{{ searchResult.data.blocknum }}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell class="font-medium">Transactions</TableCell>
                <TableCell>{{ searchResult.data.txcount }}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell class="font-medium">Channel</TableCell>
                <TableCell>{{ searchResult.data.channelname }}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell class="font-medium">Created At</TableCell>
                <TableCell>{{ formatDate(searchResult.data.createdt) }}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell class="font-medium">Data Hash</TableCell>
                <TableCell class="font-mono text-xs break-all">{{ searchResult.data.datahash }}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell class="font-medium">Previous Hash</TableCell>
                <TableCell class="font-mono text-xs break-all">{{ searchResult.data.prehash }}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell class="font-medium">Block Hash</TableCell>
                <TableCell class="font-mono text-xs break-all">{{ searchResult.data.blockhash }}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <!-- Transaction Result Table -->
        <div v-if="searchResult.type === 'transaction'" class="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead class="w-[200px]">Property</TableHead>
                <TableHead>Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell class="font-medium">Transaction ID</TableCell>
                <TableCell class="font-mono text-xs break-all">{{ searchResult.data.txhash }}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell class="font-medium">Block Number</TableCell>
                <TableCell class="font-mono">{{ searchResult.data.blockid }}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell class="font-medium">Chaincode</TableCell>
                <TableCell>{{ searchResult.data.chaincodename || 'N/A' }}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell class="font-medium">Type</TableCell>
                <TableCell>{{ searchResult.data.type || 'N/A' }}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell class="font-medium">Creator MSP</TableCell>
                <TableCell>{{ searchResult.data.creator_msp_id || 'N/A' }}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell class="font-medium">Endorser MSP</TableCell>
                <TableCell>{{ searchResult.data.endorser_msp_id || 'N/A' }}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell class="font-medium">Validation Code</TableCell>
                <TableCell>
                  <Badge :variant="searchResult.data.validation_code === 'VALID' ? 'default' : 'destructive'">
                    {{ searchResult.data.validation_code || 'N/A' }}
                  </Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell class="font-medium">Created At</TableCell>
                <TableCell>{{ formatDate(searchResult.data.createdt) }}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="searchError" class="mt-4 p-3 rounded-lg border border-destructive bg-destructive/10">
        <p class="text-sm text-destructive">{{ searchError }}</p>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useDashboardStore } from '@/stores/dashboard'
import { searchApi } from '@/api/explorer/search'

const dashboardStore = useDashboardStore()
const searchQuery = ref('')
const searching = ref(false)
const searchResult = ref<any>(null)
const searchError = ref<string | null>(null)

async function handleSearch() {
  if (!searchQuery.value.trim()) return

  const query = searchQuery.value.trim()
  const channelHash = dashboardStore.currentChannelHash

  if (!channelHash) {
    searchError.value = 'No channel selected'
    return
  }

  searching.value = true
  searchError.value = null
  searchResult.value = null

  try {
    // Determine search type based on query format
    if (/^\d+$/.test(query)) {
      // Block number
      const block = await searchApi.searchByBlockNumber(channelHash, parseInt(query))
      searchResult.value = { type: 'block', data: block }
    } else if (query.length === 64) {
      // Could be block hash or transaction ID (both are 64 chars)
      try {
        const block = await searchApi.searchByBlockHash(channelHash, query)
        searchResult.value = { type: 'block', data: block }
      } catch {
        // If block search fails, try transaction
        const tx = await searchApi.searchByTransactionId(channelHash, query)
        searchResult.value = { type: 'transaction', data: tx }
      }
    } else {
      // Assume transaction ID
      const tx = await searchApi.searchByTransactionId(channelHash, query)
      searchResult.value = { type: 'transaction', data: tx }
    }
  } catch (err: any) {
    searchError.value = err.message || 'Search failed. Please check your query and try again.'
    console.error('Search error:', err)
  } finally {
    searching.value = false
  }
}

function clearSearch() {
  searchQuery.value = ''
  searchResult.value = null
  searchError.value = null
}

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
</script>

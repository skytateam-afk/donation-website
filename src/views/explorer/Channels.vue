<template>
  <ExplorerLayout>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold">Channels</h1>
          <p class="text-muted-foreground mt-1">View and manage blockchain channels</p>
        </div>
        
        <!-- Admin Management Button -->
        <Button 
          v-if="authStore.user?.role === 'admin'"
          @click="router.push('/channels/manage')"
          variant="default"
        >
          <Settings class="mr-2 h-4 w-4" />
          Manage Channels
        </Button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="text-center space-y-4">
          <Spinner size="lg" class="mx-auto text-primary" />
          <p class="text-muted-foreground">Loading channels...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12">
        <p class="text-destructive">{{ error }}</p>
        <Button @click="loadChannels" variant="outline" class="mt-4">
          Try Again
        </Button>
      </div>

      <!-- Channels Grid -->
      <div v-else class="grid gap-6 md:grid-cols-2">
        <Card
          v-for="channel in channels"
          :key="channel.channelname"
          class="cursor-pointer hover:shadow-lg transition-shadow"
          @click="openChannelDetails(channel)"
        >
          <CardHeader>
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <CardTitle class="text-xl">{{ channel.channelname }}</CardTitle>
                <CardDescription class="mt-1 font-mono text-xs">
                  {{ channel.channel_genesis_hash.substring(0, 16) }}...
                </CardDescription>
              </div>
              <Badge variant="default">Active</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div class="space-y-3">
              <div class="flex flex-wrap items-center justify-between text-sm">
                <span class="text-muted-foreground">Blocks:</span>
                <span class="font-medium">{{ channel.blocks }}</span>
              </div>
              <div class="flex flex-wrap items-center justify-between text-sm">
                <span class="text-muted-foreground">Transactions:</span>
                <span class="font-medium">{{ channel.transactions }}</span>
              </div>
              <div class="flex flex-wrap items-center justify-between text-sm">
                <span class="text-muted-foreground">Created:</span>
                <span class="font-medium text-xs">{{ formatDate(channel.createdat) }}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Empty State -->
      <div v-if="!loading && !error && channels.length === 0" class="text-center py-12">
        <p class="text-muted-foreground">No channels found in the network</p>
      </div>

      <!-- Channel Details Dialog -->
      <Dialog v-model:open="detailsDialogOpen">
        <DialogContent class="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Channel Details</DialogTitle>
            <DialogDescription>
              Complete information about {{ selectedChannel?.channelname }}
            </DialogDescription>
          </DialogHeader>
          
          <div v-if="selectedChannel" class="space-y-6">
            <!-- Basic Information -->
            <div class="space-y-4">
              <h3 class="text-lg font-semibold">Basic Information</h3>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <Label class="text-muted-foreground">Channel Name</Label>
                  <p class="font-medium mt-1">{{ selectedChannel.channelname }}</p>
                </div>
                <div>
                  <Label class="text-muted-foreground">Status</Label>
                  <Badge variant="default" class="mt-1">Active</Badge>
                </div>
                <div class="col-span-2">
                  <Label class="text-muted-foreground">Genesis Hash</Label>
                  <p class="font-mono text-sm mt-1 break-all">{{ selectedChannel.channel_genesis_hash }}</p>
                </div>
                <div>
                  <Label class="text-muted-foreground">Created At</Label>
                  <p class="font-medium mt-1">{{ formatDate(selectedChannel.createdat) }}</p>
                </div>
                <div>
                  <Label class="text-muted-foreground">Channel ID</Label>
                  <p class="font-medium mt-1">{{ selectedChannel.id }}</p>
                </div>
              </div>
            </div>

            <!-- Statistics -->
            <div class="space-y-4">
              <h3 class="text-lg font-semibold">Statistics</h3>
              <div class="grid grid-cols-4 gap-4">
                <Card>
                  <CardHeader class="pb-2">
                    <CardDescription>Total Blocks</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p class="text-2xl font-bold">{{ selectedChannel.blocks }}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader class="pb-2">
                    <CardDescription>Transactions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p class="text-2xl font-bold">{{ selectedChannel.transactions }}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader class="pb-2">
                    <CardDescription>Organizations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p class="text-2xl font-bold">{{ channelOrgs.length }}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader class="pb-2">
                    <CardDescription>Peers</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p class="text-2xl font-bold">{{ channelPeers.length }}</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            <!-- Member Organizations -->
            <div class="space-y-4">
              <h3 class="text-lg font-semibold">Member Organizations</h3>
              <div class="space-y-2">
                <Card v-for="org in channelOrgs" :key="org.mspid">
                  <CardContent class="py-4">
                    <div class="flex flex-wrap items-center justify-between">
                      <div class="space-y-1">
                        <p class="font-medium">{{ org.name }}</p>
                        <p class="text-sm text-muted-foreground">MSP ID: {{ org.mspid }}</p>
                      </div>
                      <div class="flex items-center gap-2">
                        <Badge variant="outline">{{ org.peers }} Peers</Badge>
                        <Badge variant="secondary">Member</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <!-- Peer Nodes -->
            <div class="space-y-4">
              <h3 class="text-lg font-semibold">Peer Nodes</h3>
              <div class="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Hostname</TableHead>
                      <TableHead>MSP ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Ledger Height</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow v-for="peer in channelPeers" :key="peer.server_hostname">
                      <TableCell class="font-mono text-sm">{{ peer.server_hostname }}</TableCell>
                      <TableCell>{{ peer.mspid }}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{{ peer.peer_type }}</Badge>
                      </TableCell>
                      <TableCell>{{ peer.ledger_height_low }}</TableCell>
                      <TableCell>
                        <Badge :variant="peer.status === 'up' ? 'default' : 'destructive'">
                          {{ peer.status }}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>

            <!-- Channel Configuration -->
            <div class="space-y-4">
              <h3 class="text-lg font-semibold">Channel Configuration</h3>
              <Card>
                <CardContent class="pt-6">
                  <div class="space-y-3">
                    <div class="flex flex-wrap items-center justify-between py-2 border-b">
                      <span class="text-sm font-medium">Consensus Type</span>
                      <span class="text-sm text-muted-foreground">Raft</span>
                    </div>
                    <div class="flex flex-wrap items-center justify-between py-2 border-b">
                      <span class="text-sm font-medium">Batch Timeout</span>
                      <span class="text-sm text-muted-foreground">2s</span>
                    </div>
                    <div class="flex flex-wrap items-center justify-between py-2 border-b">
                      <span class="text-sm font-medium">Max Message Count</span>
                      <span class="text-sm text-muted-foreground">10</span>
                    </div>
                    <div class="flex flex-wrap items-center justify-between py-2 border-b">
                      <span class="text-sm font-medium">Absolute Max Bytes</span>
                      <span class="text-sm text-muted-foreground">99 MB</span>
                    </div>
                    <div class="flex flex-wrap items-center justify-between py-2">
                      <span class="text-sm font-medium">Preferred Max Bytes</span>
                      <span class="text-sm text-muted-foreground">512 KB</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <DialogFooter>
            <Button @click="detailsDialogOpen = false" variant="outline">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  </ExplorerLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Settings } from 'lucide-vue-next'
import ExplorerLayout from '@/layouts/ExplorerLayout.vue'
import { useAuthStore } from '@/stores/auth'
import { channelsApi } from '@/api/explorer/channels'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const error = ref('')
const channels = ref<any[]>([])
const detailsDialogOpen = ref(false)
const selectedChannel = ref<any>(null)
const channelPeers = ref<any[]>([])

// Sample organizations data
const channelOrgs = computed(() => [
  { name: 'Organization 1', mspid: 'Org1MSP', peers: 2 },
  { name: 'Organization 2', mspid: 'Org2MSP', peers: 2 }
])

onMounted(async () => {
  await loadChannels()
})

async function loadChannels() {
  loading.value = true
  error.value = ''
  
  try {
    const response = await channelsApi.getChannelsInfo()
    channels.value = response.channels || []
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Failed to load channels'
    console.error('Error loading channels:', err)
  } finally {
    loading.value = false
  }
}

async function openChannelDetails(channel: any) {
  selectedChannel.value = channel
  
  // Load peer status for this channel
  try {
    const peerResponse = await channelsApi.getPeerStatus(channel.channelname)
    channelPeers.value = peerResponse.peers || []
  } catch (err) {
    console.error('Error loading peer status:', err)
    channelPeers.value = []
  }
  
  detailsDialogOpen.value = true
}

function formatDate(dateString: string) {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
}
</script>

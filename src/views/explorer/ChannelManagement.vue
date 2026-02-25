<template>
  <ExplorerLayout>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold">Channel Management</h1>
          <p class="text-muted-foreground mt-1">Create and manage blockchain channels</p>
        </div>
        
        <Button @click="openCreateDialog">
          <Plus class="mr-2 h-4 w-4" />
          Create Channel
        </Button>
      </div>

      <!-- Channels Table -->
      <Card>
        <CardHeader>
          <CardTitle>Active Channels</CardTitle>
          <CardDescription>Manage channels in the blockchain network</CardDescription>
        </CardHeader>
        <CardContent>
          <div v-if="loading" class="flex justify-center py-8">
            <Spinner size="lg" />
          </div>
          <div v-else-if="channels.length === 0" class="text-center py-8 text-muted-foreground">
            No channels found
          </div>
          <div v-else class="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Channel Name</TableHead>
                  <TableHead>Blocks</TableHead>
                  <TableHead>Transactions</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead class="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="channel in channels" :key="channel.channelname">
                  <TableCell class="font-medium">{{ channel.channelname }}</TableCell>
                  <TableCell>{{ channel.blocks }}</TableCell>
                  <TableCell>{{ channel.transactions }}</TableCell>
                  <TableCell>{{ formatDate(channel.createdat) }}</TableCell>
                  <TableCell class="text-right">
                    <div class="flex justify-end gap-2">
                      <Button @click="viewConfig(channel)" size="sm" variant="outline">
                        Config
                      </Button>
                      <Button @click="openJoinDialog(channel)" size="sm" variant="outline">
                        Join Peer
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <!-- Create Channel Dialog -->
      <Dialog v-model:open="createDialogOpen">
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Channel</DialogTitle>
            <DialogDescription>
              Create a new blockchain channel
            </DialogDescription>
          </DialogHeader>
          
          <div class="space-y-4">
            <div class="space-y-2">
              <Label for="channel-name">Channel Name</Label>
              <Input id="channel-name" v-model="createForm.channelName" placeholder="newchannel" />
            </div>
            
            <div class="space-y-2">
              <Label for="config-path">Config TX Path (Optional)</Label>
              <Input id="config-path" v-model="createForm.configTxPath" placeholder="/path/to/channel.tx" />
              <p class="text-xs text-muted-foreground">Leave empty to use default configuration</p>
            </div>
          </div>

          <DialogFooter>
            <Button @click="createDialogOpen = false" variant="outline">Cancel</Button>
            <Button @click="handleCreateChannel" :disabled="creating">
              <Spinner v-if="creating" class="mr-2 h-4 w-4" />
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <!-- Join Channel Dialog -->
      <Dialog v-model:open="joinDialogOpen">
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Join Channel</DialogTitle>
            <DialogDescription>
              Join a peer to {{ selectedChannelName }}
            </DialogDescription>
          </DialogHeader>
          
          <div class="space-y-4">
            <div class="space-y-2">
              <Label>Channel Name</Label>
              <Input v-model="selectedChannelName" readonly />
            </div>
            
            <div class="space-y-2">
              <Label for="block-path">Genesis Block Path (Optional)</Label>
              <Input id="block-path" v-model="joinForm.blockPath" placeholder="/path/to/channel.block" />
              <p class="text-xs text-muted-foreground">Leave empty to use default path</p>
            </div>
          </div>

          <DialogFooter>
            <Button @click="joinDialogOpen = false" variant="outline">Cancel</Button>
            <Button @click="handleJoinChannel" :disabled="joining">
              <Spinner v-if="joining" class="mr-2 h-4 w-4" />
              Join
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <!-- Channel Config Dialog -->
      <Dialog v-model:open="configDialogOpen">
        <DialogContent class="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Channel Configuration</DialogTitle>
            <DialogDescription>
              Configuration for {{ selectedChannelName }}
            </DialogDescription>
          </DialogHeader>
          
          <div v-if="loadingConfig" class="flex justify-center py-8">
            <Spinner size="lg" />
          </div>
          <div v-else-if="channelConfig">
            <pre class="text-sm bg-muted p-4 rounded-md overflow-x-auto">{{ JSON.stringify(channelConfig, null, 2) }}</pre>
          </div>
          <div v-else class="text-center py-8 text-muted-foreground">
            No configuration available
          </div>

          <DialogFooter>
            <Button @click="configDialogOpen = false" variant="outline">Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  </ExplorerLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Plus } from 'lucide-vue-next'
import ExplorerLayout from '@/layouts/ExplorerLayout.vue'
import { channelsApi } from '@/api/explorer/channels'
import { channelManagementApi } from '@/api/channelManagement'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { useToast } from '@/components/ui/toast'

const { toast } = useToast()

const loading = ref(false)
const channels = ref<any[]>([])

// Create dialog
const createDialogOpen = ref(false)
const creating = ref(false)
const createForm = ref({
  channelName: '',
  configTxPath: ''
})

// Join dialog
const joinDialogOpen = ref(false)
const joining = ref(false)
const selectedChannelName = ref('')
const joinForm = ref({
  blockPath: ''
})

// Config dialog
const configDialogOpen = ref(false)
const loadingConfig = ref(false)
const channelConfig = ref<any>(null)

onMounted(async () => {
  await loadChannels()
})

async function loadChannels() {
  loading.value = true
  try {
    const response = await channelsApi.getChannelsInfo()
    channels.value = response.channels || []
  } catch (error: any) {
    toast({
      title: 'Error',
      description: error.response?.data?.error || 'Failed to load channels',
      variant: 'destructive'
    })
  } finally {
    loading.value = false
  }
}

function openCreateDialog() {
  createForm.value = { channelName: '', configTxPath: '' }
  createDialogOpen.value = true
}

function openJoinDialog(channel: any) {
  selectedChannelName.value = channel.channelname
  joinForm.value = { blockPath: '' }
  joinDialogOpen.value = true
}

async function handleCreateChannel() {
  creating.value = true
  try {
    const payload: any = { channelName: createForm.value.channelName }
    if (createForm.value.configTxPath) {
      payload.configTxPath = createForm.value.configTxPath
    }
    
    const response = await channelManagementApi.createChannel(payload)
    toast({
      title: 'Success',
      description: response.message
    })
    createDialogOpen.value = false
    await loadChannels()
  } catch (error: any) {
    toast({
      title: 'Error',
      description: error.response?.data?.error || 'Failed to create channel',
      variant: 'destructive'
    })
  } finally {
    creating.value = false
  }
}

async function handleJoinChannel() {
  joining.value = true
  try {
    const payload: any = { channelName: selectedChannelName.value }
    if (joinForm.value.blockPath) {
      payload.blockPath = joinForm.value.blockPath
    }
    
    const response = await channelManagementApi.joinChannel(payload)
    toast({
      title: 'Success',
      description: response.message
    })
    joinDialogOpen.value = false
  } catch (error: any) {
    toast({
      title: 'Error',
      description: error.response?.data?.error || 'Failed to join channel',
      variant: 'destructive'
    })
  } finally {
    joining.value = false
  }
}

async function viewConfig(channel: any) {
  selectedChannelName.value = channel.channelname
  configDialogOpen.value = true
  loadingConfig.value = true
  
  try {
    const response = await channelManagementApi.getChannelConfig(channel.channelname)
    channelConfig.value = response.config
  } catch (error: any) {
    toast({
      title: 'Error',
      description: error.response?.data?.error || 'Failed to load channel config',
      variant: 'destructive'
    })
  } finally {
    loadingConfig.value = false
  }
}

function formatDate(dateString: string) {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString()
}
</script>

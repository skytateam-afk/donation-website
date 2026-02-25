<template>
  <ExplorerLayout>
    <div class="space-y-6">
      <!-- Header -->
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold">Chaincodes</h1>
        <p class="text-muted-foreground mt-1">View installed and instantiated chaincodes</p>
      </div>
      
      <div class="flex gap-2">
        
        <!-- Admin Management Button -->
        <Button 
          v-if="authStore.user?.role === 'admin'"
          @click="router.push('/chaincodes/manage')"
          variant="default"
        >
          <Settings class="mr-2 h-4 w-4" />
          Manage Chaincodes
        </Button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="text-center space-y-4">
        <Spinner size="lg" class="mx-auto text-primary" />
        <p class="text-muted-foreground">Loading chaincodes...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-12">
      <p class="text-destructive">{{ error }}</p>
      <Button @click="loadChaincodes" variant="outline" class="mt-4">
        Try Again
      </Button>
    </div>

    <!-- Chaincodes Grid -->
    <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card
        v-for="chaincode in chaincodes"
        :key="chaincode.chaincodename"
        class="cursor-pointer hover:shadow-lg transition-shadow"
        @click="openChaincodeDetails(chaincode)"
      >
        <CardHeader>
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <CardTitle class="text-xl">{{ chaincode.chaincodename }}</CardTitle>
              <CardDescription class="mt-1">
                Version {{ chaincode.version }}
              </CardDescription>
            </div>
            <Badge :variant="chaincode.status === 'active' ? 'default' : 'secondary'">
              {{ chaincode.status }}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div class="space-y-3">
            <div class="flex flex-wrap items-center justify-between text-sm">
              <span class="text-muted-foreground">Channel:</span>
              <span class="font-medium">{{ chaincode.channelName }}</span>
            </div>
            <div class="flex flex-wrap items-center justify-between text-sm">
              <span class="text-muted-foreground">Path:</span>
              <span class="font-mono text-xs truncate max-w-[150px]">{{ chaincode.path }}</span>
            </div>
            <div class="flex flex-wrap items-center justify-between text-sm">
              <span class="text-muted-foreground">Transactions:</span>
              <span class="font-medium">{{ chaincode.txCount }}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Empty State -->
    <div v-if="!loading && !error && chaincodes.length === 0" class="text-center py-12">
      <p class="text-muted-foreground">No chaincodes found on this channel</p>
    </div>

    <!-- Chaincode Details Dialog -->
    <Dialog v-model:open="detailsDialogOpen">
      <DialogContent class="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chaincode Details</DialogTitle>
          <DialogDescription>
            Complete information about {{ selectedChaincode?.chaincodename }}
          </DialogDescription>
        </DialogHeader>
        
        <div v-if="selectedChaincode" class="space-y-6">
          <!-- Basic Information -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold">Basic Information</h3>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <Label class="text-muted-foreground">Chaincode Name</Label>
                <p class="font-medium mt-1">{{ selectedChaincode.chaincodename }}</p>
              </div>
              <div>
                <Label class="text-muted-foreground">Version</Label>
                <p class="font-medium mt-1">{{ selectedChaincode.version }}</p>
              </div>
              <div>
                <Label class="text-muted-foreground">Channel</Label>
                <p class="font-medium mt-1">{{ selectedChaincode.channelName }}</p>
              </div>
              <div>
                <Label class="text-muted-foreground">Status</Label>
                <Badge :variant="selectedChaincode.status === 'active' ? 'default' : 'secondary'" class="mt-1">
                  {{ selectedChaincode.status }}
                </Badge>
              </div>
              <div class="col-span-2">
                <Label class="text-muted-foreground">Path</Label>
                <p class="font-mono text-sm mt-1 break-all">{{ selectedChaincode.path }}</p>
              </div>
            </div>
          </div>

          <!-- Statistics -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold">Statistics</h3>
            <div class="grid grid-cols-3 gap-4">
              <Card>
                <CardHeader class="pb-2">
                  <CardDescription>Total Transactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <p class="text-2xl font-bold">{{ selectedChaincode.txCount }}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader class="pb-2">
                  <CardDescription>Endorsers</CardDescription>
                </CardHeader>
                <CardContent>
                  <p class="text-2xl font-bold">{{ selectedChaincode.endorsers?.length || 0 }}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader class="pb-2">
                  <CardDescription>Last Updated</CardDescription>
                </CardHeader>
                <CardContent>
                  <p class="text-sm font-medium">{{ formatDate(selectedChaincode.createdt) }}</p>
                </CardContent>
              </Card>
            </div>
          </div>

          <!-- Endorsement Policy -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold">Endorsement Policy</h3>
            <Card>
              <CardContent class="pt-6">
                <pre class="text-sm bg-muted p-4 rounded-md overflow-x-auto">{{ formatPolicy(selectedChaincode.policy) }}</pre>
              </CardContent>
            </Card>
          </div>

          <!-- Endorsers List -->
          <div v-if="selectedChaincode.endorsers && selectedChaincode.endorsers.length > 0" class="space-y-4">
            <h3 class="text-lg font-semibold">Endorsing Organizations</h3>
            <div class="space-y-2">
              <Card v-for="endorser in selectedChaincode.endorsers" :key="endorser">
                <CardContent class="py-3">
                  <div class="flex flex-wrap items-center justify-between">
                    <span class="font-medium">{{ endorser }}</span>
                    <Badge variant="outline">Endorser</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Settings } from 'lucide-vue-next'
import ExplorerLayout from '@/layouts/ExplorerLayout.vue'
import { useDashboardStore } from '@/stores/dashboard'
import { useAuthStore } from '@/stores/auth'
import { chaincodesApi } from '@/api/explorer/chaincodes'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const router = useRouter()
const dashboardStore = useDashboardStore()
const authStore = useAuthStore()

const loading = ref(false)
const error = ref('')
const chaincodes = ref<any[]>([])
const selectedChannel = ref('mychannel')
const detailsDialogOpen = ref(false)
const selectedChaincode = ref<any>(null)

onMounted(async () => {
  // Load channels if not already loaded
  if (dashboardStore.channels.length === 0) {
    await dashboardStore.fetchChannels()
  }
  if (dashboardStore.channels.length > 0) {
    selectedChannel.value = dashboardStore.channels[0]
  }
  await loadChaincodes()
})

async function loadChaincodes() {
  loading.value = true
  error.value = ''
  
  try {
    const response = await chaincodesApi.getChaincodeList(selectedChannel.value)
    chaincodes.value = response.chaincode || []
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Failed to load chaincodes'
    console.error('Error loading chaincodes:', err)
  } finally {
    loading.value = false
  }
}

function openChaincodeDetails(chaincode: any) {
  selectedChaincode.value = chaincode
  detailsDialogOpen.value = true
}

function formatDate(dateString: string) {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
}

function formatPolicy(policy: any) {
  if (!policy) return 'No policy defined'
  if (typeof policy === 'string') return policy
  return JSON.stringify(policy, null, 2)
}
</script>

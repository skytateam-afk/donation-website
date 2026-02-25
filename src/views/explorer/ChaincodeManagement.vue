<template>
  <ExplorerLayout>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold">Chaincode Management</h1>
          <p class="text-muted-foreground mt-1">Upload, deploy, and manage chaincode lifecycle</p>
        </div>
        
        <div class="flex gap-2">
          <Button @click="openUploadDialog" variant="outline">
            <Upload class="mr-2 h-4 w-4" />
            Upload Chaincode
          </Button>
          <Button @click="openDeployDialog">
            <Rocket class="mr-2 h-4 w-4" />
            Deploy Chaincode
          </Button>
        </div>
      </div>

      <!-- View Selector -->
      <div class="flex gap-2 mb-6">
        <Button 
          @click="activeView = 'installed'" 
          :variant="activeView === 'installed' ? 'default' : 'outline'"
        >
          Installed Chaincodes
        </Button>
        <Button 
          @click="activeView = 'committed'" 
          :variant="activeView === 'committed' ? 'default' : 'outline'"
        >
          Committed Chaincodes
        </Button>
        <Button 
          @click="activeView = 'deploy'" 
          :variant="activeView === 'deploy' ? 'default' : 'outline'"
        >
          Quick Deploy
        </Button>
      </div>

      <!-- Installed Chaincodes View -->
      <div v-if="activeView === 'installed'" class="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Installed Chaincodes on Peers</CardTitle>
              <CardDescription>View chaincodes installed on peer nodes</CardDescription>
            </CardHeader>
            <CardContent>
              <div v-if="loadingInstalled" class="flex justify-center py-8">
                <Spinner size="lg" />
              </div>
              <div v-else-if="installedChaincodes.length === 0" class="text-center py-8 text-muted-foreground">
                No chaincodes installed yet
              </div>
              <div v-else class="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Label</TableHead>
                      <TableHead>Package ID</TableHead>
                      <TableHead class="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow v-for="cc in installedChaincodes" :key="cc.package_id">
                      <TableCell class="font-medium">{{ cc.label }}</TableCell>
                      <TableCell class="font-mono text-xs">{{ cc.package_id.substring(0, 40) }}...</TableCell>
                      <TableCell class="text-right">
                        <Button @click="approveChaincode(cc)" size="sm" variant="outline">
                          Approve
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
      </div>

      <!-- Committed Chaincodes View -->
      <div v-else-if="activeView === 'committed'" class="space-y-4">
          <Card>
            <CardHeader>
              <div class="flex items-center justify-between">
                <div>
                  <CardTitle>Committed Chaincodes</CardTitle>
                  <CardDescription>Chaincodes committed to channels</CardDescription>
                </div>
                <Select v-model="selectedChannel" @update:model-value="loadCommittedChaincodes">
                  <SelectTrigger class="w-[200px]">
                    <SelectValue placeholder="Select channel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      v-for="channel in dashboardStore.channels"
                      :key="channel"
                      :value="channel"
                    >
                      {{ channel }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div v-if="loadingCommitted" class="flex justify-center py-8">
                <Spinner size="lg" />
              </div>
              <div v-else-if="!committedOutput" class="text-center py-8 text-muted-foreground">
                Select a channel to view committed chaincodes
              </div>
              <div v-else>
                <pre class="text-sm bg-muted p-4 rounded-md overflow-x-auto">{{ committedOutput }}</pre>
              </div>
            </CardContent>
          </Card>
      </div>

      <!-- Quick Deploy View -->
      <div v-else-if="activeView === 'deploy'" class="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quick Deploy Chaincode</CardTitle>
              <CardDescription>Upload and deploy chaincode in one flow</CardDescription>
            </CardHeader>
            <CardContent>
              <div class="space-y-6">
                <!-- Upload Section -->
                <div class="border rounded-lg p-6 space-y-4">
                  <h3 class="font-semibold">Step 1: Upload Chaincode Source</h3>
                  <div class="space-y-2">
                    <Label for="chaincode-name">Chaincode Name</Label>
                    <Input id="chaincode-name" v-model="quickDeployForm.chaincodeName" placeholder="bankloan" />
                  </div>
                  <div class="space-y-2">
                    <Label for="chaincode-file">Chaincode Package (.zip or .tar.gz)</Label>
                    <Input 
                      id="chaincode-file" 
                      type="file" 
                      accept=".zip,.tar.gz,.tgz"
                      @change="handleFileSelect"
                    />
                    <p class="text-xs text-muted-foreground">Upload your chaincode source as a .zip or .tar.gz file</p>
                  </div>
                  <Button @click="handleUpload" :disabled="uploading || !quickDeployForm.file">
                    <Spinner v-if="uploading" class="mr-2 h-4 w-4" />
                    <Upload v-else class="mr-2 h-4 w-4" />
                    Upload
                  </Button>
                </div>

                <!-- Deploy Section -->
                <div class="border rounded-lg p-6 space-y-4">
                  <h3 class="font-semibold">Step 2: Deploy to Network</h3>
                  <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-2">
                      <Label for="deploy-version">Version</Label>
                      <Input id="deploy-version" v-model="quickDeployForm.version" placeholder="1.0" />
                    </div>
                    <div class="space-y-2">
                      <Label for="deploy-channel">Channel</Label>
                      <Select v-model="quickDeployForm.channelName">
                        <SelectTrigger>
                          <SelectValue placeholder="Select channel" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem
                            v-for="channel in dashboardStore.channels"
                            :key="channel"
                            :value="channel"
                          >
                            {{ channel }}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div class="space-y-2">
                      <Label for="deploy-type">Chaincode Type</Label>
                      <Select v-model="quickDeployForm.chaincodeType">
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="golang">Go</SelectItem>
                          <SelectItem value="node">Node.js</SelectItem>
                          <SelectItem value="java">Java</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div class="space-y-2">
                      <Label for="deploy-sequence">Sequence</Label>
                      <Input id="deploy-sequence" v-model.number="quickDeployForm.sequence" type="number" />
                    </div>
                  </div>
                  <div class="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="init-ledger" 
                      v-model="quickDeployForm.initLedger"
                      class="rounded border-gray-300"
                    />
                    <Label for="init-ledger" class="cursor-pointer">Initialize ledger after deployment</Label>
                  </div>
                  <Button @click="handleDeploy" :disabled="deploying || !quickDeployForm.chaincodeName">
                    <Spinner v-if="deploying" class="mr-2 h-4 w-4" />
                    <Rocket v-else class="mr-2 h-4 w-4" />
                    Deploy to Network
                  </Button>
                </div>

                <!-- Deployment Progress -->
                <div v-if="deploymentSteps.length > 0" class="border rounded-lg p-6 space-y-4">
                  <h3 class="font-semibold">Deployment Progress</h3>
                  <div class="space-y-2">
                    <div v-for="(step, index) in deploymentSteps" :key="index" class="flex items-center gap-2">
                      <div 
                        :class="[
                          'w-6 h-6 rounded-full flex items-center justify-center text-xs',
                          step.success ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                        ]"
                      >
                        {{ index + 1 }}
                      </div>
                      <span class="text-sm">{{ step.step }}: {{ step.message }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
      </div>

      <!-- Upload Chaincode Dialog -->
      <Dialog v-model:open="uploadDialogOpen">
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Chaincode Source</DialogTitle>
            <DialogDescription>
              Upload your chaincode source code as a .zip or .tar.gz file
            </DialogDescription>
          </DialogHeader>
          
          <div class="space-y-4">
            <div class="space-y-2">
              <Label for="upload-name">Chaincode Name</Label>
              <Input id="upload-name" v-model="uploadForm.chaincodeName" placeholder="bankloan" />
            </div>
            
            <div class="space-y-2">
              <Label for="upload-file">Chaincode Package</Label>
              <Input 
                id="upload-file" 
                type="file" 
                accept=".zip,.tar.gz,.tgz"
                @change="handleUploadFileSelect"
              />
              <p class="text-xs text-muted-foreground">Supported formats: .zip, .tar.gz</p>
            </div>
          </div>

          <DialogFooter>
            <Button @click="uploadDialogOpen = false" variant="outline">Cancel</Button>
            <Button @click="handleUploadChaincode" :disabled="uploading || !uploadForm.file">
              <Spinner v-if="uploading" class="mr-2 h-4 w-4" />
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <!-- Deploy Chaincode Dialog -->
      <Dialog v-model:open="deployDialogOpen">
        <DialogContent class="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Deploy Chaincode</DialogTitle>
            <DialogDescription>
              Deploy chaincode through the complete lifecycle (package, install, approve, commit)
            </DialogDescription>
          </DialogHeader>
          
          <div class="space-y-4">
            <div class="space-y-2">
              <Label for="deploy-name">Chaincode Name</Label>
              <Input id="deploy-name" v-model="deployForm.chaincodeName" placeholder="bankloan" />
              <p class="text-xs text-muted-foreground">Must match the uploaded chaincode name</p>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label for="deploy-ver">Version</Label>
                <Input id="deploy-ver" v-model="deployForm.version" placeholder="1.0" />
              </div>
              
              <div class="space-y-2">
                <Label for="deploy-chan">Channel Name</Label>
                <Select v-model="deployForm.channelName">
                  <SelectTrigger>
                    <SelectValue placeholder="Select channel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      v-for="channel in dashboardStore.channels"
                      :key="channel"
                      :value="channel"
                    >
                      {{ channel }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label for="deploy-lang">Chaincode Type</Label>
                <Select v-model="deployForm.chaincodeType">
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="golang">Go</SelectItem>
                    <SelectItem value="node">Node.js</SelectItem>
                    <SelectItem value="java">Java</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div class="space-y-2">
                <Label for="deploy-seq">Sequence</Label>
                <Input id="deploy-seq" v-model.number="deployForm.sequence" type="number" />
              </div>
            </div>
            
            <div class="flex items-center space-x-2">
              <input 
                type="checkbox" 
                id="init-ledger-deploy" 
                v-model="deployForm.initLedger"
                class="rounded border-gray-300"
              />
              <Label for="init-ledger-deploy" class="cursor-pointer">Initialize ledger after deployment</Label>
            </div>
          </div>

          <DialogFooter>
            <Button @click="deployDialogOpen = false" variant="outline">Cancel</Button>
            <Button @click="handleDeployChaincode" :disabled="deploying">
              <Spinner v-if="deploying" class="mr-2 h-4 w-4" />
              Deploy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <!-- Approve Chaincode Dialog -->
      <Dialog v-model:open="approveDialogOpen">
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Chaincode</DialogTitle>
            <DialogDescription>
              Approve chaincode definition for your organization
            </DialogDescription>
          </DialogHeader>
          
          <div class="space-y-4">
            <div class="space-y-2">
              <Label>Package ID</Label>
              <Input v-model="approveForm.packageId" readonly class="font-mono text-xs" />
            </div>
            
            <div class="space-y-2">
              <Label for="approve-channel">Channel Name</Label>
              <Select v-model="approveForm.channelName">
                <SelectTrigger>
                  <SelectValue placeholder="Select channel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="channel in dashboardStore.channels"
                    :key="channel"
                    :value="channel"
                  >
                    {{ channel }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div class="space-y-2">
              <Label for="approve-name">Chaincode Name</Label>
              <Input id="approve-name" v-model="approveForm.chaincodeName" />
            </div>
            
            <div class="space-y-2">
              <Label for="approve-version">Version</Label>
              <Input id="approve-version" v-model="approveForm.version" />
            </div>
            
            <div class="space-y-2">
              <Label for="approve-sequence">Sequence</Label>
              <Input id="approve-sequence" v-model.number="approveForm.sequence" type="number" />
            </div>
          </div>

          <DialogFooter>
            <Button @click="approveDialogOpen = false" variant="outline">Cancel</Button>
            <Button @click="handleApproveChaincode" :disabled="approving">
              <Spinner v-if="approving" class="mr-2 h-4 w-4" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  </ExplorerLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Upload, Rocket } from 'lucide-vue-next'
import ExplorerLayout from '@/layouts/ExplorerLayout.vue'
import { useDashboardStore } from '@/stores/dashboard'
import { chaincodeManagementApi } from '@/api/chaincodeManagement'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
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
import { useToast } from '@/components/ui/toast'

const { toast } = useToast()
const dashboardStore = useDashboardStore()

const activeView = ref('deploy')
const selectedChannel = ref('peerpay-channel')

// Installed chaincodes
const loadingInstalled = ref(false)
const installedChaincodes = ref<any[]>([])

// Committed chaincodes
const loadingCommitted = ref(false)
const committedOutput = ref('')

// Upload dialog
const uploadDialogOpen = ref(false)
const uploading = ref(false)
const uploadForm = ref({
  chaincodeName: '',
  file: null as File | null
})

// Deploy dialog
const deployDialogOpen = ref(false)
const deploying = ref(false)
const deployForm = ref({
  chaincodeName: '',
  version: '1.0',
  channelName: 'peerpay-channel',
  chaincodeType: 'golang' as 'golang' | 'node' | 'java',
  sequence: 1,
  initLedger: true
})

// Quick deploy form
const quickDeployForm = ref({
  chaincodeName: '',
  version: '1.0',
  channelName: 'peerpay-channel',
  chaincodeType: 'golang' as 'golang' | 'node' | 'java',
  sequence: 1,
  initLedger: true,
  file: null as File | null
})

// Deployment steps
const deploymentSteps = ref<any[]>([])

// Approve dialog
const approveDialogOpen = ref(false)
const approving = ref(false)
const approveForm = ref({
  packageId: '',
  channelName: 'peerpay-channel',
  chaincodeName: '',
  version: '',
  sequence: 1
})

onMounted(async () => {
  if (dashboardStore.channels.length === 0) {
    await dashboardStore.fetchChannels()
  }
  if (dashboardStore.channels.length > 0) {
    selectedChannel.value = dashboardStore.channels[0]
    deployForm.value.channelName = dashboardStore.channels[0]
    quickDeployForm.value.channelName = dashboardStore.channels[0]
  }
  await loadInstalledChaincodes()
})

async function loadInstalledChaincodes() {
  loadingInstalled.value = true
  try {
    const response = await chaincodeManagementApi.getInstalledChaincodes()
    installedChaincodes.value = response.installed_chaincodes || []
  } catch (error: any) {
    console.error('Error loading installed chaincodes:', error)
    if (error.response?.status !== 401 && error.response?.status !== 403) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to load installed chaincodes',
        variant: 'destructive'
      })
    }
    installedChaincodes.value = []
  } finally {
    loadingInstalled.value = false
  }
}

async function loadCommittedChaincodes() {
  if (!selectedChannel.value) return
  
  loadingCommitted.value = true
  try {
    const response = await chaincodeManagementApi.getCommittedChaincodes(selectedChannel.value)
    committedOutput.value = response.output || 'No committed chaincodes found'
  } catch (error: any) {
    toast({
      title: 'Error',
      description: error.response?.data?.error || 'Failed to load committed chaincodes',
      variant: 'destructive'
    })
  } finally {
    loadingCommitted.value = false
  }
}

function openUploadDialog() {
  uploadForm.value = { chaincodeName: '', file: null }
  uploadDialogOpen.value = true
}

function openDeployDialog() {
  deployForm.value = {
    chaincodeName: '',
    version: '1.0',
    channelName: dashboardStore.channels[0] || 'peerpay-channel',
    chaincodeType: 'golang',
    sequence: 1,
    initLedger: true
  }
  deployDialogOpen.value = true
}

function handleUploadFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    uploadForm.value.file = target.files[0]
  }
}

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    quickDeployForm.value.file = target.files[0]
  }
}

async function handleUploadChaincode() {
  if (!uploadForm.value.file || !uploadForm.value.chaincodeName) {
    toast({
      title: 'Error',
      description: 'Please provide chaincode name and file',
      variant: 'destructive'
    })
    return
  }

  uploading.value = true
  try {
    const response = await chaincodeManagementApi.uploadChaincode(
      uploadForm.value.file,
      uploadForm.value.chaincodeName
    )
    toast({
      title: 'Success',
      description: response.message
    })
    uploadDialogOpen.value = false
  } catch (error: any) {
    toast({
      title: 'Error',
      description: error.response?.data?.error || 'Failed to upload chaincode',
      variant: 'destructive'
    })
  } finally {
    uploading.value = false
  }
}

async function handleUpload() {
  if (!quickDeployForm.value.file || !quickDeployForm.value.chaincodeName) {
    toast({
      title: 'Error',
      description: 'Please provide chaincode name and file',
      variant: 'destructive'
    })
    return
  }

  uploading.value = true
  try {
    const response = await chaincodeManagementApi.uploadChaincode(
      quickDeployForm.value.file,
      quickDeployForm.value.chaincodeName
    )
    toast({
      title: 'Success',
      description: response.message
    })
  } catch (error: any) {
    toast({
      title: 'Error',
      description: error.response?.data?.error || 'Failed to upload chaincode',
      variant: 'destructive'
    })
  } finally {
    uploading.value = false
  }
}

async function handleDeploy() {
  if (!quickDeployForm.value.chaincodeName) {
    toast({
      title: 'Error',
      description: 'Please provide chaincode name',
      variant: 'destructive'
    })
    return
  }

  deploying.value = true
  deploymentSteps.value = []
  
  try {
    const response = await chaincodeManagementApi.deployChaincode({
      chaincodeName: quickDeployForm.value.chaincodeName,
      version: quickDeployForm.value.version,
      channelName: quickDeployForm.value.channelName,
      chaincodeType: quickDeployForm.value.chaincodeType,
      sequence: quickDeployForm.value.sequence,
      initLedger: quickDeployForm.value.initLedger
    })
    
    deploymentSteps.value = response.deploymentSteps || []
    
    toast({
      title: 'Success',
      description: response.message
    })
    
    await loadInstalledChaincodes()
  } catch (error: any) {
    toast({
      title: 'Error',
      description: error.response?.data?.error || 'Failed to deploy chaincode',
      variant: 'destructive'
    })
  } finally {
    deploying.value = false
  }
}

async function handleDeployChaincode() {
  deploying.value = true
  try {
    const response = await chaincodeManagementApi.deployChaincode(deployForm.value)
    toast({
      title: 'Success',
      description: response.message
    })
    deployDialogOpen.value = false
    await loadInstalledChaincodes()
  } catch (error: any) {
    toast({
      title: 'Error',
      description: error.response?.data?.error || 'Failed to deploy chaincode',
      variant: 'destructive'
    })
  } finally {
    deploying.value = false
  }
}

function approveChaincode(chaincode: any) {
  approveForm.value = {
    packageId: chaincode.package_id,
    channelName: selectedChannel.value,
    chaincodeName: chaincode.label.split('_')[0],
    version: chaincode.label.split('_')[1] || '1.0',
    sequence: 1
  }
  approveDialogOpen.value = true
}

async function handleApproveChaincode() {
  approving.value = true
  try {
    const response = await chaincodeManagementApi.approveChaincode(approveForm.value)
    toast({
      title: 'Success',
      description: response.message
    })
    approveDialogOpen.value = false
  } catch (error: any) {
    toast({
      title: 'Error',
      description: error.response?.data?.error || 'Failed to approve chaincode',
      variant: 'destructive'
    })
  } finally {
    approving.value = false
  }
}
</script>

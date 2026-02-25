<template>
  <ExplorerLayout>
    <div class="space-y-6">
      <!-- Page Header -->
      <div>
        <h1 class="text-3xl font-bold">Recovery Dashboard</h1>
        <p class="text-muted-foreground mt-2">
          Manage and track overdue obligations
        </p>
      </div>

      <!-- Statistics Cards -->
      <div v-if="statistics" class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader class="pb-2">
            <CardDescription>Total Overdue</CardDescription>
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">{{ statistics.total_count }}</div>
            <p class="text-xs text-muted-foreground mt-1">
              {{ formatCurrency(statistics.total_amount) }}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader class="pb-2">
            <CardDescription>Urgent Priority</CardDescription>
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold text-destructive">
              {{ getPriorityCount('urgent') }}
            </div>
            <p class="text-xs text-muted-foreground mt-1">
              {{ formatCurrency(getPriorityAmount('urgent')) }}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader class="pb-2">
            <CardDescription>Average Days Overdue</CardDescription>
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">
              {{ Math.round(statistics.average_days_overdue) }}
            </div>
            <p class="text-xs text-muted-foreground mt-1">days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader class="pb-2">
            <CardDescription>Oldest Obligation</CardDescription>
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">
              {{ statistics.oldest_obligation_days }}
            </div>
            <p class="text-xs text-muted-foreground mt-1">days overdue</p>
          </CardContent>
        </Card>
      </div>

      <!-- Filters -->
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="grid gap-4 md:grid-cols-4">
            <div class="space-y-2">
              <Label>Status</Label>
              <Select v-model="filters.status" @update:model-value="applyFilters">
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="payment_plan">Payment Plan</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="written_off">Written Off</SelectItem>
                  <SelectItem value="legal_action">Legal Action</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div class="space-y-2">
              <Label>Priority</Label>
              <Select v-model="filters.priority" @update:model-value="applyFilters">
                <SelectTrigger>
                  <SelectValue placeholder="All priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All priorities</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div class="space-y-2">
              <Label>Type</Label>
              <Select v-model="filters.type" @update:model-value="applyFilters">
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="bank_loan">Bank Loan</SelectItem>
                  <SelectItem value="p2p_transfer">P2P Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div class="space-y-2">
              <Label>Assigned To</Label>
              <Select v-model="filters.assignedTo" @update:model-value="applyFilters">
                <SelectTrigger>
                  <SelectValue placeholder="All users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All users</SelectItem>
                  <SelectItem v-for="user in users" :key="user.id" :value="user.id">
                    {{ user.username }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div class="flex justify-end mt-4">
            <Button variant="outline" @click="clearFilters">
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <!-- Loading State -->
      <div v-if="loading && obligations.length === 0" class="flex items-center justify-center py-12">
        <div class="text-center space-y-4">
          <Spinner size="lg" class="mx-auto text-primary" />
          <p class="text-muted-foreground">Loading obligations...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="rounded-lg border border-destructive bg-destructive/10 p-4">
        <p class="text-sm text-destructive">{{ error }}</p>
      </div>

      <!-- Obligations Table -->
      <Card v-else-if="obligations.length > 0">
        <CardHeader>
          <div class="flex flex-wrap items-center justify-between">
            <div>
              <CardTitle>Overdue Obligations</CardTitle>
              <CardDescription>Click on a row to view details and manage</CardDescription>
            </div>
            <Badge variant="secondary">{{ pagination.total }} total</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div class="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Debtor</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Days Overdue</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead class="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow
                  v-for="obligation in obligations"
                  :key="obligation.id"
                  class="cursor-pointer hover:bg-accent"
                  @click="viewDetails(obligation)"
                >
                  <TableCell>
                    <div>
                      <p class="font-medium">{{ obligation.debtor_name }}</p>
                      <p class="text-xs text-muted-foreground">{{ obligation.debtor_email }}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {{ obligation.transaction_type === 'bank_loan' ? 'Bank Loan' : 'P2P Transfer' }}
                    </Badge>
                  </TableCell>
                  <TableCell class="font-mono">
                    {{ formatCurrency(obligation.amount, obligation.currency) }}
                  </TableCell>
                  <TableCell>
                    <Badge :variant="obligation.days_overdue > 90 ? 'destructive' : 'secondary'">
                      {{ obligation.days_overdue }} days
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge :variant="getPriorityVariant(obligation.priority)">
                      {{ obligation.priority }}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge :variant="getStatusVariant(obligation.recovery_status)">
                      {{ formatStatus(obligation.recovery_status) }}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span v-if="obligation.assigned_user" class="text-sm">
                      {{ obligation.assigned_user.username }}
                    </span>
                    <span v-else class="text-sm text-muted-foreground">Unassigned</span>
                  </TableCell>
                  <TableCell class="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      @click.stop="viewDetails(obligation)"
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <!-- Pagination -->
          <div class="flex flex-wrap items-center justify-between mt-4">
            <div class="text-sm text-muted-foreground">
              Showing {{ ((pagination.page - 1) * pagination.limit) + 1 }} to 
              {{ Math.min(pagination.page * pagination.limit, pagination.total) }} of 
              {{ pagination.total }} obligations
            </div>
            
            <div class="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                @click="goToPage(pagination.page - 1)"
                :disabled="pagination.page === 1 || loading"
              >
                Previous
              </Button>
              <div class="text-sm">
                Page {{ pagination.page }} of {{ pagination.totalPages }}
              </div>
              <Button
                variant="outline"
                size="sm"
                @click="goToPage(pagination.page + 1)"
                :disabled="pagination.page === pagination.totalPages || loading"
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
          <CardTitle>No Overdue Obligations</CardTitle>
          <CardDescription>
            There are no overdue obligations matching your filters.
          </CardDescription>
        </CardHeader>
      </Card>

      <!-- Details Dialog -->
      <Dialog v-model:open="detailsDialogOpen">
        <DialogContent class="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Obligation Details</DialogTitle>
            <DialogDescription>
              Manage recovery for {{ selectedObligation?.debtor_name }}
            </DialogDescription>
          </DialogHeader>

          <div v-if="selectedObligation" class="space-y-6">
            <!-- Basic Information -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <Label class="text-muted-foreground">Transaction ID</Label>
                <p class="font-mono text-sm mt-1">{{ selectedObligation.transaction_id }}</p>
              </div>
              <div>
                <Label class="text-muted-foreground">Type</Label>
                <p class="mt-1">
                  {{ selectedObligation.transaction_type === 'bank_loan' ? 'Bank Loan' : 'P2P Transfer' }}
                </p>
              </div>
              <div>
                <Label class="text-muted-foreground">Amount</Label>
                <p class="font-semibold mt-1">
                  {{ formatCurrency(selectedObligation.amount, selectedObligation.currency) }}
                </p>
              </div>
              <div>
                <Label class="text-muted-foreground">Days Overdue</Label>
                <p class="font-semibold mt-1">{{ selectedObligation.days_overdue }} days</p>
              </div>
            </div>

            <!-- Debtor Information -->
            <div class="space-y-2">
              <h3 class="font-semibold">Debtor Information</h3>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <Label class="text-muted-foreground">Name</Label>
                  <p class="mt-1">{{ selectedObligation.debtor_name }}</p>
                </div>
                <div>
                  <Label class="text-muted-foreground">Email</Label>
                  <p class="mt-1">{{ selectedObligation.debtor_email || 'N/A' }}</p>
                </div>
                <div>
                  <Label class="text-muted-foreground">Phone</Label>
                  <p class="mt-1">{{ selectedObligation.debtor_phone || 'N/A' }}</p>
                </div>
              </div>
            </div>

            <!-- Creditor Information -->
            <div class="space-y-2">
              <h3 class="font-semibold">Creditor Information</h3>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <Label class="text-muted-foreground">Name</Label>
                  <p class="mt-1">{{ selectedObligation.creditor_name }}</p>
                </div>
                <div>
                  <Label class="text-muted-foreground">Email</Label>
                  <p class="mt-1">{{ selectedObligation.creditor_email || 'N/A' }}</p>
                </div>
              </div>
            </div>

            <!-- Recovery Management -->
            <div class="space-y-4">
              <h3 class="font-semibold">Recovery Management</h3>
              
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label>Status</Label>
                  <Select v-model="updateData.recovery_status">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="payment_plan">Payment Plan</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="written_off">Written Off</SelectItem>
                      <SelectItem value="legal_action">Legal Action</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div class="space-y-2">
                  <Label>Priority</Label>
                  <Select v-model="updateData.priority">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div class="space-y-2">
                  <Label>Assign To</Label>
                  <Select v-model="updateData.assigned_to">
                    <SelectTrigger>
                      <SelectValue placeholder="Select user" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      <SelectItem v-for="user in users" :key="user.id" :value="user.id">
                        {{ user.username }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div class="space-y-2">
                  <Label>Contact Attempts</Label>
                  <Input
                    v-model.number="updateData.contact_attempts"
                    type="number"
                    min="0"
                  />
                </div>
              </div>

              <Button @click="updateObligation" :disabled="updating" class="w-full">
                <Spinner v-if="updating" size="sm" class="mr-2" />
                Update Obligation
              </Button>
            </div>

            <!-- Notes Section -->
            <div class="space-y-4">
              <h3 class="font-semibold">Recovery Notes</h3>
              
              <div class="space-y-2">
                <textarea
                  v-model="newNote"
                  placeholder="Add a note about this recovery..."
                  rows="3"
                  class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <Button @click="addNote" :disabled="!newNote.trim() || addingNote" size="sm">
                  <Spinner v-if="addingNote" size="sm" class="mr-2" />
                  Add Note
                </Button>
              </div>

              <div v-if="selectedObligation.recovery_notes && selectedObligation.recovery_notes.length > 0" class="space-y-2">
                <div
                  v-for="(note, index) in selectedObligation.recovery_notes"
                  :key="index"
                  class="border rounded-lg p-3"
                >
                  <p class="text-sm">{{ note.note }}</p>
                  <p class="text-xs text-muted-foreground mt-1">
                    {{ formatDate(note.created_at) }} by {{ note.created_by_username }}
                  </p>
                </div>
              </div>
              <p v-else class="text-sm text-muted-foreground">No notes yet</p>
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
import ExplorerLayout from '@/layouts/ExplorerLayout.vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { overdueObligationsApi, type OverdueObligation, type OverdueObligationStatistics } from '@/api/overdueObligations'
import { usersApi } from '@/api/users'
import { useSonner } from '@/composables/useSonner'

const { toast } = useSonner()

const loading = ref(false)
const error = ref<string | null>(null)
const obligations = ref<OverdueObligation[]>([])
const statistics = ref<OverdueObligationStatistics | null>(null)
const users = ref<any[]>([])
const detailsDialogOpen = ref(false)
const selectedObligation = ref<OverdueObligation | null>(null)
const updating = ref(false)
const addingNote = ref(false)
const newNote = ref('')

const filters = ref({
  status: 'all',
  priority: 'all',
  type: 'all',
  assignedTo: 'all'
})

const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0
})

const updateData = ref({
  recovery_status: '',
  priority: '',
  assigned_to: '',
  contact_attempts: 0
})

onMounted(async () => {
  await Promise.all([
    fetchStatistics(),
    fetchObligations(),
    fetchUsers()
  ])
})

async function fetchStatistics() {
  try {
    const response = await overdueObligationsApi.getStatistics()
    statistics.value = response.data
  } catch (err: any) {
    console.error('Error fetching statistics:', err)
  }
}

async function fetchObligations() {
  loading.value = true
  error.value = null
  
  try {
    // Build query params, excluding 'all' values
    const queryParams: any = {
      page: pagination.value.page,
      limit: pagination.value.limit
    }
    
    if (filters.value.status && filters.value.status !== 'all') {
      queryParams.status = filters.value.status
    }
    if (filters.value.priority && filters.value.priority !== 'all') {
      queryParams.priority = filters.value.priority
    }
    if (filters.value.type && filters.value.type !== 'all') {
      queryParams.type = filters.value.type
    }
    if (filters.value.assignedTo && filters.value.assignedTo !== 'all') {
      queryParams.assignedTo = filters.value.assignedTo
    }
    
    const response = await overdueObligationsApi.getAll(queryParams)
    
    obligations.value = response.data
    pagination.value.total = response.pagination.total
    pagination.value.totalPages = response.pagination.totalPages
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to fetch obligations'
    console.error('Error fetching obligations:', err)
  } finally {
    loading.value = false
  }
}

async function fetchUsers() {
  try {
    const response = await usersApi.getAll({ page: 1, pageSize: 100 })
    users.value = response.users || []
  } catch (err) {
    console.error('Error fetching users:', err)
  }
}

function applyFilters() {
  pagination.value.page = 1
  fetchObligations()
}

function clearFilters() {
  filters.value = {
    status: 'all',
    priority: 'all',
    type: 'all',
    assignedTo: 'all'
  }
  applyFilters()
}

async function goToPage(page: number) {
  if (page < 1 || page > pagination.value.totalPages) return
  pagination.value.page = page
  await fetchObligations()
}

function viewDetails(obligation: OverdueObligation) {
  selectedObligation.value = obligation
  updateData.value = {
    recovery_status: obligation.recovery_status,
    priority: obligation.priority,
    assigned_to: obligation.assigned_to || 'unassigned',
    contact_attempts: obligation.contact_attempts
  }
  newNote.value = ''
  detailsDialogOpen.value = true
}

async function updateObligation() {
  if (!selectedObligation.value) return
  
  updating.value = true
  try {
    // Convert 'unassigned' back to empty string for API
    const dataToSend = {
      ...updateData.value,
      assigned_to: updateData.value.assigned_to === 'unassigned' ? '' : updateData.value.assigned_to
    }
    
    const response = await overdueObligationsApi.update(
      selectedObligation.value.id,
      dataToSend
    )
    
    selectedObligation.value = response.data
    await fetchObligations()
    await fetchStatistics()
    
    toast({
      title: 'Success',
      description: 'Obligation updated successfully'
    })
  } catch (err: any) {
    toast({
      title: 'Error',
      description: err.response?.data?.message || 'Failed to update obligation',
      variant: 'destructive'
    })
  } finally {
    updating.value = false
  }
}

async function addNote() {
  if (!selectedObligation.value || !newNote.value.trim()) return
  
  addingNote.value = true
  try {
    const response = await overdueObligationsApi.addNote(
      selectedObligation.value.id,
      newNote.value
    )
    
    selectedObligation.value = response.data
    newNote.value = ''
    
    toast({
      title: 'Success',
      description: 'Note added successfully'
    })
  } catch (err: any) {
    toast({
      title: 'Error',
      description: err.response?.data?.message || 'Failed to add note',
      variant: 'destructive'
    })
  } finally {
    addingNote.value = false
  }
}

function getPriorityCount(priority: string): number {
  if (!statistics.value) return 0
  const item = statistics.value.by_priority.find(p => p.priority === priority)
  return item?.count || 0
}

function getPriorityAmount(priority: string): number {
  if (!statistics.value) return 0
  const item = statistics.value.by_priority.find(p => p.priority === priority)
  return item?.total_amount || 0
}

function getPriorityVariant(priority: string) {
  const variants: Record<string, any> = {
    urgent: 'destructive',
    high: 'default',
    normal: 'secondary',
    low: 'outline'
  }
  return variants[priority] || 'secondary'
}

function getStatusVariant(status: string) {
  const variants: Record<string, any> = {
    pending: 'secondary',
    contacted: 'default',
    in_progress: 'default',
    payment_plan: 'default',
    resolved: 'default',
    written_off: 'destructive',
    legal_action: 'destructive'
  }
  return variants[status] || 'secondary'
}

function formatStatus(status: string): string {
  return status.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}

function formatCurrency(amount: number, currency: string = 'NGN'): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: currency
  }).format(amount)
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

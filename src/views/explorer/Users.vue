<template>
  <ExplorerLayout>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-wrap items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">User Management</h1>
        <p class="text-muted-foreground mt-2">
          Manage explorer users and their permissions
        </p>
      </div>
      <Button @click="showCreateDialog = true">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Add User
      </Button>
    </div>

    <!-- Search and Filter -->
    <Card>
      <CardContent class="pt-6">
        <div class="flex items-center space-x-4">
          <div class="flex-1">
            <Input
              v-model="searchQuery"
              placeholder="Search by username, email, or institution..."
              class="max-w-md"
            />
          </div>
          <Select v-model="roleFilter">
            <SelectTrigger class="w-[180px]">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="viewer">Viewer</SelectItem>
            </SelectContent>
          </Select>
          <Select v-model="statusFilter">
            <SelectTrigger class="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>

    <!-- Users Table -->
    <Card>
      <CardContent class="pt-6">
        <div v-if="loading" class="flex justify-center py-8">
          <Spinner size="lg" />
        </div>

        <div v-else-if="error" class="text-center py-8 text-destructive">
          {{ error }}
        </div>

        <div v-else-if="filteredUsers.length === 0" class="text-center py-8 text-muted-foreground">
          No users found
        </div>

        <div v-else>
          <div class="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Institution</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead class="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow
                  v-for="user in filteredUsers"
                  :key="user.id"
                  class="cursor-pointer hover:bg-accent"
                  @click="viewUserDetails(user)"
                >
                  <TableCell class="font-medium">{{ user.username }}</TableCell>
                  <TableCell class="text-muted-foreground">{{ user.email }}</TableCell>
                  <TableCell>
                    <Badge :variant="getRoleBadgeVariant(user.role)">
                      {{ user.role }}
                    </Badge>
                  </TableCell>
                  <TableCell class="text-muted-foreground">{{ user.institution }}</TableCell>
                  <TableCell>
                    <Badge :variant="user.is_active ? 'default' : 'secondary'">
                      {{ user.is_active ? 'Active' : 'Inactive' }}
                    </Badge>
                  </TableCell>
                  <TableCell class="text-sm">
                    {{ user.last_login ? formatDate(user.last_login) : 'Never' }}
                  </TableCell>
                  <TableCell class="text-right">
                    <div class="flex items-center justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        @click.stop="openEditDialog(user)"
                        title="Edit user"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        @click.stop="toggleUserStatus(user)"
                        :title="user.is_active ? 'Deactivate user' : 'Activate user'"
                        :disabled="user.id === Number(authStore.user?.id)"
                      >
                        <svg v-if="user.is_active" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                        <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        @click.stop="openDeleteDialog(user)"
                        title="Delete user"
                        :disabled="user.id === Number(authStore.user?.id)"
                        class="text-destructive hover:text-destructive"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>

        <!-- Pagination Controls -->
        <div v-if="!loading && !error && totalPages > 0" class="flex flex-wrap items-center justify-between px-4 py-4 border-t">
          <div class="flex items-center space-x-2">
            <span class="text-sm text-muted-foreground">
              Showing {{ ((currentPage - 1) * pageSize) + 1 }} to {{ Math.min(currentPage * pageSize, totalCount) }} of {{ totalCount }} users
            </span>
          </div>
          
          <div class="flex items-center space-x-2">
            <!-- Page Size Selector -->
            <Select :model-value="pageSize.toString()" @update:model-value="(val) => changePageSize(Number(val))">
              <SelectTrigger class="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 / page</SelectItem>
                <SelectItem value="10">10 / page</SelectItem>
                <SelectItem value="20">20 / page</SelectItem>
                <SelectItem value="50">50 / page</SelectItem>
              </SelectContent>
            </Select>

            <!-- Pagination Buttons -->
            <div class="flex items-center space-x-1">
              <Button
                variant="outline"
                size="sm"
                @click="goToPage(1)"
                :disabled="currentPage === 1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              </Button>
              <Button
                variant="outline"
                size="sm"
                @click="goToPage(currentPage - 1)"
                :disabled="currentPage === 1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
              </Button>
              
              <span class="px-3 py-1 text-sm">
                Page {{ currentPage }} of {{ totalPages }}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                @click="goToPage(currentPage + 1)"
                :disabled="currentPage === totalPages"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </Button>
              <Button
                variant="outline"
                size="sm"
                @click="goToPage(totalPages)"
                :disabled="currentPage === totalPages"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Create User Dialog -->
    <Dialog v-model:open="showCreateDialog">
      <DialogContent class="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Create a new user account. A secure password will be auto-generated and sent via email with login credentials.
          </DialogDescription>
        </DialogHeader>
        <form @submit.prevent="createUser" class="space-y-4">
          <div class="space-y-2">
            <Label for="email">Email</Label>
            <Input
              id="email"
              v-model="newUser.email"
              type="email"
              placeholder="john@example.com"
              required
            />
          </div>
          <div class="space-y-2">
            <Label for="bank">Bank / Institution</Label>
            <div class="relative">
              <Input
                id="bank"
                v-model="bankSearch"
                @input="filterBanks"
                @focus="filterBanks"
                placeholder="Start typing to search banks..."
                autocomplete="off"
                required
              />
              <div
                v-if="showBankDropdown && filteredBanks.length > 0"
                class="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-auto"
              >
                <div
                  v-for="bank in filteredBanks"
                  :key="bank.id"
                  @click="selectBank(bank)"
                  class="px-4 py-2 hover:bg-muted cursor-pointer text-sm"
                >
                  {{ bank.bank_name }}
                </div>
              </div>
              <p v-if="!showBankDropdown && bankSearch && filteredBanks.length === 0" class="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg p-4 text-sm text-muted-foreground">
                No banks found matching "{{ bankSearch }}"
              </p>
            </div>
            <p v-if="selectedBank" class="text-sm text-muted-foreground">
              Selected: {{ selectedBank.bank_name }}
            </p>
          </div>
          <div class="space-y-2">
            <Label for="node">Blockchain Node</Label>
            <Select v-model="newUser.node_id" required>
              <SelectTrigger>
                <SelectValue placeholder="Select node" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="node in nodes" :key="node.value" :value="node.value">
                  {{ node.label }}
                </SelectItem>
              </SelectContent>
            </Select>
            <p class="text-xs text-muted-foreground">
              Select the blockchain node this user will connect to
            </p>
          </div>
          <div class="space-y-2">
            <Label for="role">Role</Label>
            <Select v-model="newUser.role">
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" @click="showCreateDialog = false">
              Cancel
            </Button>
            <Button type="submit" :disabled="creatingUser">
              <Spinner v-if="creatingUser" size="sm" class="mr-2" />
              Create User
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- Edit User Dialog -->
    <Dialog v-model:open="showEditDialog">
      <DialogContent class="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update user information
          </DialogDescription>
        </DialogHeader>
        <form @submit.prevent="updateUser" class="space-y-4">
          <div class="space-y-2">
            <Label for="edit-username">Username</Label>
            <Input
              id="edit-username"
              v-model="editingUser.username"
              disabled
              class="bg-muted"
            />
            <p class="text-xs text-muted-foreground">
              Username is auto-generated and cannot be changed
            </p>
          </div>
          <div class="space-y-2">
            <Label for="edit-email">Email</Label>
            <Input
              id="edit-email"
              v-model="editingUser.email"
              type="email"
              required
            />
          </div>
          <div class="space-y-2">
            <Label for="edit-institution">Institution</Label>
            <Input
              id="edit-institution"
              v-model="editingUser.institution"
              disabled
              class="bg-muted"
            />
            <p class="text-xs text-muted-foreground">
              Institution cannot be changed after user creation
            </p>
          </div>
          <div class="space-y-2">
            <Label for="edit-node">Blockchain Node</Label>
            <Input
              id="edit-node"
              :value="editingUser.node_name || 'Not assigned'"
              disabled
              class="bg-muted"
            />
            <p class="text-xs text-muted-foreground">
              Node assignment cannot be changed after user creation
            </p>
          </div>
          <div class="space-y-2">
            <Label for="edit-role">Role</Label>
            <Select v-model="editingUser.role">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" @click="showEditDialog = false">
              Cancel
            </Button>
            <Button type="submit" :disabled="updatingUser">
              <Spinner v-if="updatingUser" size="sm" class="mr-2" />
              Update User
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- Delete Confirmation Dialog -->
    <Dialog v-model:open="showDeleteDialog">
      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            This will permanently delete the user <strong>{{ userToDelete?.username }}</strong>.
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" @click="showDeleteDialog = false">
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            @click="deleteUser"
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- User Details Dialog -->
    <Dialog v-model:open="showUserDetails">
      <DialogContent class="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
          <DialogDescription>
            Complete information about {{ selectedUser?.username }}
          </DialogDescription>
        </DialogHeader>
        <div v-if="selectedUser" class="space-y-4">
          <div class="rounded-md border">
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell class="font-medium w-1/3">User ID</TableCell>
                  <TableCell class="font-mono text-sm">{{ selectedUser.id }}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell class="font-medium">Username</TableCell>
                  <TableCell>{{ selectedUser.username }}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell class="font-medium">Email</TableCell>
                  <TableCell>{{ selectedUser.email }}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell class="font-medium">Role</TableCell>
                  <TableCell>
                    <Badge :variant="getRoleBadgeVariant(selectedUser.role)">
                      {{ selectedUser.role }}
                    </Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell class="font-medium">Institution</TableCell>
                  <TableCell>{{ selectedUser.institution }}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell class="font-medium">Status</TableCell>
                  <TableCell>
                    <Badge :variant="selectedUser.is_active ? 'default' : 'secondary'">
                      {{ selectedUser.is_active ? 'Active' : 'Inactive' }}
                    </Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell class="font-medium">Created At</TableCell>
                  <TableCell>{{ formatDate(selectedUser.created_at) }}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell class="font-medium">Last Login</TableCell>
                  <TableCell>{{ selectedUser.last_login ? formatDate(selectedUser.last_login) : 'Never' }}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" @click="showUserDetails = false">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </div>
  </ExplorerLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import ExplorerLayout from '@/layouts/ExplorerLayout.vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { usersApi, type UserData, type CreateUserData, type UpdateUserData } from '@/api/users'
import { banksApi, type Bank } from '@/api/banks'
import { nodeManagementApi, type NodeDropdownItem } from '@/api/nodeManagement'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const authStore = useAuthStore()
const toast = useToast()

// State
const users = ref<UserData[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const searchQuery = ref('')
const roleFilter = ref('all')
const statusFilter = ref('all')

// Pagination
const currentPage = ref(1)
const pageSize = ref(10)
const totalCount = ref(0)
const totalPages = ref(0)

// Banks
const banks = ref<Bank[]>([])
const filteredBanks = ref<Bank[]>([])
const bankSearch = ref('')
const showBankDropdown = ref(false)
const selectedBank = ref<Bank | null>(null)

// Nodes
const nodes = ref<NodeDropdownItem[]>([])

// Create user
const showCreateDialog = ref(false)
const creatingUser = ref(false)
const newUser = ref<CreateUserData & { bank_id?: string; node_id?: string }>({
  username: '',
  email: '',
  password: '',
  role: 'user',
  institution: '',
  bank_id: '',
  node_id: ''
})

// Edit user
const showEditDialog = ref(false)
const updatingUser = ref(false)
const editingUser = ref<UpdateUserData & { id?: number; node_id?: string; node_name?: string }>({
  username: '',
  email: '',
  role: '',
  institution: '',
  node_id: '',
  node_name: ''
})

// Delete user
const showDeleteDialog = ref(false)
const userToDelete = ref<UserData | null>(null)

// View user details
const showUserDetails = ref(false)
const selectedUser = ref<UserData | null>(null)

// Computed
const filteredUsers = computed(() => {
  let filtered = users.value

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(user =>
      user.username.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.institution.toLowerCase().includes(query)
    )
  }

  // Role filter
  if (roleFilter.value !== 'all') {
    filtered = filtered.filter(user => user.role === roleFilter.value)
  }

  // Status filter
  if (statusFilter.value !== 'all') {
    const isActive = statusFilter.value === 'active'
    filtered = filtered.filter(user => user.is_active === isActive)
  }

  return filtered
})

// Methods
async function fetchUsers() {
  loading.value = true
  error.value = null
  try {
    const response = await usersApi.getAll({
      page: currentPage.value,
      pageSize: pageSize.value,
      role: roleFilter.value !== 'all' ? roleFilter.value : undefined
    })
    users.value = response.users
    totalCount.value = response.pagination.totalCount
    totalPages.value = response.pagination.totalPages
    currentPage.value = response.pagination.page
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to fetch users'
    toast.error(error.value)
  } finally {
    loading.value = false
  }
}

function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    fetchUsers()
  }
}

function changePageSize(newSize: number) {
  pageSize.value = newSize
  currentPage.value = 1
  fetchUsers()
}

async function fetchBanks() {
  try {
    const response = await banksApi.getAll({ active: true })
    banks.value = response.data
    filteredBanks.value = response.data
  } catch (err: any) {
    toast.error('Failed to fetch banks')
  }
}

async function fetchNodes() {
  try {
    const response = await nodeManagementApi.getDropdown()
    nodes.value = response.nodes
  } catch (err: any) {
    toast.error('Failed to fetch nodes')
  }
}

function filterBanks() {
  // Always show dropdown when there's input or focus
  showBankDropdown.value = true
  
  if (!bankSearch.value || bankSearch.value.trim() === '') {
    // Show all banks if search is empty
    filteredBanks.value = banks.value
    return
  }
  
  const query = bankSearch.value.toLowerCase()
  filteredBanks.value = banks.value.filter(bank =>
    bank.bank_name.toLowerCase().includes(query) ||
    bank.bank_code.toLowerCase().includes(query)
  )
}

function selectBank(bank: Bank) {
  selectedBank.value = bank
  newUser.value.bank_id = bank.id
  newUser.value.institution = bank.bank_name
  bankSearch.value = bank.bank_name
  showBankDropdown.value = false
}

// Close dropdown when clicking outside
function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (!target.closest('#bank')) {
    showBankDropdown.value = false
  }
}

async function createUser() {
  if (!newUser.value.bank_id) {
    toast.error('Please select a bank')
    return
  }
  
  if (!newUser.value.node_id) {
    toast.error('Please select a node')
    return
  }
  
  creatingUser.value = true
  try {
    await usersApi.register(newUser.value)
    toast.success('User created successfully. Welcome email sent.')
    showCreateDialog.value = false
    newUser.value = {
      username: '',
      email: '',
      password: '',
      role: 'user',
      institution: '',
      bank_id: '',
      node_id: ''
    }
    bankSearch.value = ''
    selectedBank.value = null
    await fetchUsers()
  } catch (err: any) {
    toast.error(err.response?.data?.message || 'Failed to create user')
  } finally {
    creatingUser.value = false
  }
}

function openEditDialog(user: UserData) {
  editingUser.value = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    institution: user.institution,
    node_id: user.node_id,
    node_name: user.node_name
  }
  showEditDialog.value = true
}

async function updateUser() {
  if (!editingUser.value.id) return
  
  updatingUser.value = true
  try {
    await usersApi.update(editingUser.value.id, {
      username: editingUser.value.username,
      email: editingUser.value.email,
      role: editingUser.value.role,
      institution: editingUser.value.institution
    })
    toast.success('User updated successfully')
    showEditDialog.value = false
    await fetchUsers()
  } catch (err: any) {
    toast.error(err.response?.data?.message || 'Failed to update user')
  } finally {
    updatingUser.value = false
  }
}

function openDeleteDialog(user: UserData) {
  userToDelete.value = user
  showDeleteDialog.value = true
}

async function deleteUser() {
  if (!userToDelete.value) return
  
  try {
    await usersApi.delete(userToDelete.value.id)
    toast.success('User deleted successfully')
    showDeleteDialog.value = false
    userToDelete.value = null
    await fetchUsers()
  } catch (err: any) {
    toast.error(err.response?.data?.message || 'Failed to delete user')
  }
}

async function toggleUserStatus(user: UserData) {
  try {
    await usersApi.toggleStatus(user.id)
    toast.success(`User ${user.is_active ? 'deactivated' : 'activated'} successfully`)
    await fetchUsers()
  } catch (err: any) {
    toast.error(err.response?.data?.message || 'Failed to toggle user status')
  }
}

function getRoleBadgeVariant(role: string) {
  switch (role) {
    case 'admin':
      return 'default'
    case 'user':
      return 'secondary'
    case 'viewer':
      return 'outline'
    default:
      return 'secondary'
  }
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleString()
}

function viewUserDetails(user: UserData) {
  selectedUser.value = user
  showUserDetails.value = true
}

// Lifecycle
onMounted(() => {
  fetchUsers()
  fetchBanks()
  fetchNodes()
  document.addEventListener('click', handleClickOutside)
})

// Watch for dialog close to reset bank selection
watch(showCreateDialog, (newVal) => {
  if (!newVal) {
    bankSearch.value = ''
    selectedBank.value = null
    showBankDropdown.value = false
  }
})
</script>

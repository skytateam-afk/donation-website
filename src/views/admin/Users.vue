<template>
  <AdminLayout>
    <Breadcrumb :items="breadcrumbItems" class="mb-6" />
    
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">User Management</h2>
          <p class="mt-1 text-sm text-gray-600">Manage admin users and their permissions</p>
        </div>
        <Button class="bg-gray-900 hover:bg-gray-800" @click="showCreateDialog = true">
          <UserPlus class="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      <!-- Filters -->
      <Card>
        <CardContent class="pt-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label for="search">Search</Label>
              <Input
                id="search"
                v-model="filters.search"
                type="text"
                placeholder="Search by name or email..."
                @input="debouncedSearch"
              />
            </div>
            <div>
              <Label for="role">Role</Label>
              <select
                id="role"
                v-model="filters.role"
                class="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                @change="fetchUsers"
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
            <div>
              <Label for="sort">Sort By</Label>
              <select
                id="sort"
                v-model="filters.sort"
                class="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                @change="fetchUsers"
              >
                <option value="created_at">Date Created</option>
                <option value="full_name">Name</option>
                <option value="email">Email</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Users Table -->
      <Card>
        <CardContent class="p-0">
          <div v-if="loading" class="p-12 text-center">
            <Loader2 class="h-12 w-12 animate-spin text-gray-600 mx-auto" />
            <p class="mt-4 text-gray-600">Loading users...</p>
          </div>

          <div v-else-if="users.length === 0" class="p-12 text-center">
            <Users class="mx-auto h-12 w-12 text-gray-400" />
            <h3 class="mt-2 text-sm font-medium text-gray-900">No users found</h3>
            <p class="mt-1 text-sm text-gray-600">Get started by adding a new user.</p>
          </div>

          <div v-else class="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead class="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="user in users" :key="user.id">
                  <TableCell>
                    <div class="flex items-center space-x-3">
                      <div class="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <User class="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <div class="text-sm font-medium text-gray-900">{{ user.full_name }}</div>
                        <div class="text-sm text-gray-600">{{ user.email }}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge :variant="getRoleBadgeVariant(user.role)">
                      {{ user.role }}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge :variant="user.is_active ? 'default' : 'secondary'">
                      {{ user.is_active ? 'Active' : 'Inactive' }}
                    </Badge>
                  </TableCell>
                  <TableCell class="text-sm text-gray-600">
                    {{ formatDate(user.created_at) }}
                  </TableCell>
                  <TableCell class="text-right">
                    <div class="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        @click="toggleUserStatus(user)"
                        :disabled="user.id === authStore.user?.id"
                        :title="user.is_active ? 'Deactivate user' : 'Activate user'"
                      >
                        <Power :class="['h-4 w-4', user.is_active ? 'text-green-600' : 'text-gray-400']" />
                      </Button>
                      <Button variant="ghost" size="sm" @click="editUser(user)">
                        <Edit class="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        @click="confirmDelete(user)"
                        :disabled="user.id === authStore.user?.id"
                      >
                        <Trash2 class="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <!-- Pagination -->
          <div v-if="users.length > 0" class="border-t p-4">
            <Pagination
              :current-page="pagination.currentPage"
              :total-pages="pagination.totalPages"
              :total="pagination.total"
              :per-page="pagination.perPage"
              @page-change="handlePageChange"
            />
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Create/Edit User Dialog -->
    <Dialog v-model:open="showCreateDialog">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{{ editingUser ? 'Edit User' : 'Add New User' }}</DialogTitle>
          <DialogDescription>
            {{ editingUser ? 'Update user information and permissions' : 'Create a new admin user account' }}
          </DialogDescription>
        </DialogHeader>
        <form @submit.prevent="handleSaveUser" class="space-y-4">
          <div>
            <Label for="full_name">Full Name</Label>
            <Input
              id="full_name"
              v-model="userForm.full_name"
              required
              placeholder="John Doe"
            />
          </div>
          <div>
            <Label for="email">Email</Label>
            <Input
              id="email"
              v-model="userForm.email"
              type="email"
              required
              placeholder="john@example.com"
            />
          </div>
          <div v-if="!editingUser">
            <Label for="password">Password</Label>
            <Input
              id="password"
              v-model="userForm.password"
              type="password"
              required
              placeholder="••••••••"
            />
          </div>
          <div>
            <Label for="role">Role</Label>
            <select
              id="role"
              v-model="userForm.role"
              class="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
              required
            >
              <option value="admin">Admin</option>
              <option value="editor">Editor</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" @click="showCreateDialog = false">
              Cancel
            </Button>
            <Button type="submit" :disabled="saving" class="bg-gray-900 hover:bg-gray-800">
              <Loader2 v-if="saving" class="mr-2 h-4 w-4 animate-spin" />
              {{ saving ? 'Saving...' : (editingUser ? 'Update' : 'Create') }}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- Delete Confirmation Dialog -->
    <Dialog v-model:open="showDeleteDialog">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete User</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {{ userToDelete?.full_name }}? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" @click="showDeleteDialog = false">
            Cancel
          </Button>
          <Button variant="destructive" @click="deleteUser" :disabled="deleting">
            <Loader2 v-if="deleting" class="mr-2 h-4 w-4 animate-spin" />
            {{ deleting ? 'Deleting...' : 'Delete' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Users, UserPlus, User, Edit, Trash2, Loader2, Power, Home } from 'lucide-vue-next'
import AdminLayout from '@/layouts/AdminLayout.vue'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { useAuthStore } from '@/stores/auth'
import { useSonner } from '@/composables/useSonner'
import { usersApi, type UserData, type CreateUserData, type UpdateUserData } from '@/api/users'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import Pagination from '@/components/ui/pagination/Pagination.vue'

const authStore = useAuthStore()
const { success, error } = useSonner()

const breadcrumbItems = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: Home },
  { label: 'Users', href: '/admin/users', icon: Users, current: true }
]

const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const showCreateDialog = ref(false)
const showDeleteDialog = ref(false)
const editingUser = ref<any>(null)
const userToDelete = ref<any>(null)

const filters = ref({
  search: '',
  role: '',
  sort: 'created_at'
})

const users = ref<UserData[]>([])
const pagination = ref({
  currentPage: 1,
  totalPages: 1,
  total: 0,
  perPage: 10
})

const userForm = ref<CreateUserData & { password?: string }>({
  full_name: '',
  email: '',
  password: '',
  role: 'editor'
})

const getRoleBadgeVariant = (role: string) => {
  if (role === 'admin') return 'default'
  if (role === 'editor') return 'secondary'
  return 'outline'
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

let searchTimeout: any = null
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchUsers()
  }, 500)
}

const fetchUsers = async (page: number = 1) => {
  loading.value = true
  try {
    const params: any = {
      search: filters.value.search || undefined,
      sort: filters.value.sort as any,
      order: 'desc' as const,
      page,
      limit: pagination.value.perPage
    }
    
    // Only add role if it's a valid value
    if (filters.value.role && ['admin', 'editor', 'viewer'].includes(filters.value.role)) {
      params.role = filters.value.role as 'admin' | 'editor' | 'viewer'
    }
    
    const response = await usersApi.getAll(params)
    users.value = response.data
    
    // Update pagination info
    pagination.value = {
      currentPage: response.pagination.page,
      totalPages: response.pagination.pages,
      total: response.pagination.total,
      perPage: response.pagination.limit
    }
  } catch (err: any) {
    console.error('Error fetching users:', err)
    error(err.response?.data?.message || 'Failed to load users')
  } finally {
    loading.value = false
  }
}

const handlePageChange = (page: number) => {
  fetchUsers(page)
}

const editUser = (user: UserData) => {
  editingUser.value = user
  userForm.value = {
    full_name: user.full_name,
    email: user.email,
    password: '',
    role: user.role
  }
  showCreateDialog.value = true
}

const handleSaveUser = async () => {
  saving.value = true
  try {
    if (editingUser.value) {
      // Update existing user
      const updateData: UpdateUserData = {
        full_name: userForm.value.full_name,
        email: userForm.value.email,
        role: userForm.value.role
      }
      
      // Only include password if it's provided
      if (userForm.value.password) {
        updateData.password = userForm.value.password
      }
      
      await usersApi.update(editingUser.value.id, updateData)
      success('User updated successfully')
    } else {
      // Create new user
      if (!userForm.value.password) {
        error('Password is required for new users')
        return
      }
      
      const createData: CreateUserData = {
        email: userForm.value.email,
        password: userForm.value.password,
        full_name: userForm.value.full_name,
        role: userForm.value.role
      }
      
      await usersApi.create(createData)
      success('User created successfully')
    }
    
    showCreateDialog.value = false
    editingUser.value = null
    userForm.value = { full_name: '', email: '', password: '', role: 'editor' }
    await fetchUsers()
  } catch (err: any) {
    console.error('Error saving user:', err)
    error(err.response?.data?.message || 'Failed to save user')
  } finally {
    saving.value = false
  }
}

const confirmDelete = (user: UserData) => {
  userToDelete.value = user
  showDeleteDialog.value = true
}

const toggleUserStatus = async (user: UserData) => {
  try {
    const response = await usersApi.toggleStatus(user.id)
    success(response.message)
    // Update the user in the list
    const index = users.value.findIndex(u => u.id === user.id)
    if (index !== -1) {
      users.value[index].is_active = response.data.is_active
    }
  } catch (err: any) {
    console.error('Error toggling user status:', err)
    error(err.response?.data?.message || 'Failed to toggle user status')
  }
}

const deleteUser = async () => {
  if (!userToDelete.value) return
  
  deleting.value = true
  try {
    await usersApi.delete(userToDelete.value.id)
    success('User deleted successfully')
    showDeleteDialog.value = false
    userToDelete.value = null
    await fetchUsers()
  } catch (err: any) {
    console.error('Error deleting user:', err)
    error(err.response?.data?.message || 'Failed to delete user')
  } finally {
    deleting.value = false
  }
}

onMounted(() => {
  fetchUsers()
})
</script>

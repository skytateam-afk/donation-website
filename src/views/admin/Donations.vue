<template>
  <AdminLayout>
    <Breadcrumb :items="breadcrumbItems" class="mb-6" />
    
    <div class="space-y-6">
      <!-- Header -->
      <div>
        <h2 class="text-2xl font-bold text-gray-900">Donations</h2>
        <p class="mt-1 text-sm text-gray-600">View and manage all donations</p>
      </div>

      <!-- Filters -->
      <Card>
        <CardContent class="pt-6">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label for="search">Search</Label>
              <Input
                id="search"
                v-model="filters.search"
                type="text"
                placeholder="Search by donor or campaign..."
              />
            </div>
            <div>
              <Label for="status">Status</Label>
              <select
                id="status"
                v-model="filters.status"
                class="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                @change="fetchDonations"
              >
                <option value="">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <div>
              <Label for="type">Type</Label>
              <select
                id="type"
                v-model="filters.type"
                class="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                @change="fetchDonations"
              >
                <option value="">All Types</option>
                <option value="one-time">One-time</option>
                <option value="recurring">Recurring</option>
              </select>
            </div>
            <div>
              <Label for="sort">Sort By</Label>
              <select
                id="sort"
                v-model="filters.sort"
                class="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                @change="fetchDonations"
              >
                <option value="created_at">Date</option>
                <option value="amount">Amount</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Donations List -->
      <Card>
        <CardContent class="p-0">
          <div v-if="loading" class="p-12 text-center">
            <Loader2 class="h-12 w-12 animate-spin text-gray-600 mx-auto" />
            <p class="mt-4 text-gray-600">Loading donations...</p>
          </div>

          <div v-else-if="donations.length === 0" class="p-12 text-center">
            <DollarSign class="mx-auto h-12 w-12 text-gray-400" />
            <h3 class="mt-2 text-sm font-medium text-gray-900">No donations yet</h3>
            <p class="mt-1 text-sm text-gray-600">Donations will appear here once received.</p>
          </div>

          <div v-else class="space-y-4">
            <div class="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Donor</TableHead>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-for="donation in donations" :key="donation.id">
                    <TableCell>
                      <div class="font-medium">
                        {{ donation.donor_name || (donation.anonymous ? 'Anonymous Donor' : 'N/A') }}
                      </div>
                      <div class="text-sm text-muted-foreground">{{ donation.donor_email || 'No email provided' }}</div>
                    </TableCell>
                    <TableCell>{{ donation.campaign_slug || 'General Donation' }}</TableCell>
                    <TableCell class="font-medium">${{ formatAmount(donation.amount) }}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {{ donation.donation_type }}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        :variant="donation.status === 'completed' ? 'default' : donation.status === 'pending' ? 'secondary' : 'destructive'"
                      >
                        {{ donation.status }}
                      </Badge>
                    </TableCell>
                    <TableCell class="text-muted-foreground">
                      {{ formatDate(donation.created_at) }}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <Pagination
              v-if="pagination.total > pagination.limit"
              :current-page="pagination.page"
              :total-pages="pagination.pages"
              :total="pagination.total"
              :per-page="pagination.limit"
              @page-change="changePage"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { DollarSign, Loader2, ChevronLeft, ChevronRight, Home, Heart } from 'lucide-vue-next'
import AdminLayout from '@/layouts/AdminLayout.vue'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { useDonationsStore } from '@/stores/donations'
import { useSonner } from '@/composables/useSonner'
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
import { Pagination } from '@/components/ui/pagination'

const donationsStore = useDonationsStore()
const { error } = useSonner()

const breadcrumbItems = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: Home },
  { label: 'Donations', href: '/admin/donations', icon: Heart, current: true }
]

const loading = ref(false)

const filters = ref({
  search: '',
  status: '',
  type: '',
  sort: 'created_at'
})

let searchTimeout: any = null

// Watch for search query changes
watch(() => filters.value.search, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    donationsStore.pagination.page = 1
    fetchDonations()
  }, 500)
})

const donations = computed(() => donationsStore.donations)
const pagination = computed(() => donationsStore.pagination)

const formatAmount = (amount: string | number) => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  return (numAmount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const fetchDonations = async () => {
  loading.value = true
  try {
    await donationsStore.fetchDonations({
      search: filters.value.search || undefined,
      status: filters.value.status || undefined,
      donation_type: filters.value.type || undefined,
      sort: filters.value.sort,
      page: pagination.value.page,
      limit: pagination.value.limit
    })
  } catch (err) {
    console.error('Error fetching donations:', err)
    error('Failed to load donations')
  } finally {
    loading.value = false
  }
}

const changePage = (page: number) => {
  if (page < 1 || page > pagination.value.pages) return
  donationsStore.pagination.page = page
  fetchDonations()
}

onMounted(() => {
  fetchDonations()
})
</script>

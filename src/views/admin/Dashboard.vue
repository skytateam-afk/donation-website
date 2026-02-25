<template>
  <AdminLayout>
    <Breadcrumb :items="breadcrumbItems" class="mb-6" />
    
    <!-- Welcome Section -->
    <Card class="mb-8 bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200">
      <CardContent class="pt-6">
        <div class="flex items-center space-x-4">
          <div class="h-16 w-16 rounded-full bg-white shadow-sm flex items-center justify-center overflow-hidden flex-shrink-0">
            <img
              v-if="authStore.user?.profile_picture_url"
              :src="authStore.user.profile_picture_url"
              alt="Profile"
              class="h-full w-full object-cover"
              @error="handleImageError"
            />
            <img
              v-else
              :src="getDiceBearAvatar(authStore.user?.email || 'user')"
              alt="Avatar"
              class="h-full w-full object-cover"
            />
          </div>
          <div class="flex-1">
            <h2 class="text-2xl font-bold text-gray-900">
              Welcome back, {{ authStore.user?.full_name?.split(' ')[0] || 'Admin' }}! 👋
            </h2>
            <p class="text-gray-600 mt-1">
              Here's what's happening with your campaigns today.
            </p>
          </div>
          <div class="hidden md:flex items-center space-x-2">
            <Badge variant="secondary" class="text-sm">
              {{ getCurrentGreeting() }}
            </Badge>
            <Badge variant="outline" class="text-sm">
              {{ getCurrentDate() }}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
    
    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <!-- Total Campaigns -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium text-gray-700">Total Campaigns</CardTitle>
          <Briefcase class="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-gray-900">{{ stats.totalCampaigns }}</div>
          <p class="text-xs text-gray-600 mt-1">
            <Badge variant="secondary" class="text-xs">
              {{ stats.activeCampaigns }} active
            </Badge>
          </p>
        </CardContent>
      </Card>

      <!-- Total Donations -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium text-gray-700">Total Donations</CardTitle>
          <DollarSign class="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-gray-900">{{ stats.totalDonations }}</div>
          <p class="text-xs text-gray-600 mt-1">
            This month: {{ stats.monthlyDonations }}
          </p>
        </CardContent>
      </Card>

      <!-- Total Amount Raised -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium text-gray-700">Amount Raised</CardTitle>
          <TrendingUp class="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-gray-900">${{ formatAmount(stats.totalAmount) }}</div>
          <p class="text-xs text-gray-600 mt-1">
            <Badge variant="secondary" class="text-xs">
              +{{ stats.growthPercentage }}% from last month
            </Badge>
          </p>
        </CardContent>
      </Card>

      <!-- Active Subscriptions -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium text-gray-700">Subscriptions</CardTitle>
          <RefreshCw class="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-gray-900">{{ stats.activeSubscriptions }}</div>
          <p class="text-xs text-gray-600 mt-1">
            Monthly recurring
          </p>
        </CardContent>
      </Card>
    </div>

    <!-- Quick Actions -->
    <Card class="mb-8">
      <CardHeader>
        <CardTitle class="text-gray-900">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button
            variant="outline"
            class="h-auto py-6 flex-col hover:bg-gray-50"
            as-child
          >
            <router-link to="/admin/campaigns/new">
              <Plus class="h-6 w-6 mb-2 text-gray-700" />
              <span class="text-sm font-medium text-gray-900">Create New Campaign</span>
            </router-link>
          </Button>
          
          <Button
            variant="outline"
            class="h-auto py-6 flex-col hover:bg-gray-50"
            as-child
          >
            <router-link to="/admin/campaigns">
              <Briefcase class="h-6 w-6 mb-2 text-gray-700" />
              <span class="text-sm font-medium text-gray-900">Manage Campaigns</span>
            </router-link>
          </Button>
          
          <Button
            variant="outline"
            class="h-auto py-6 flex-col hover:bg-gray-50"
            as-child
          >
            <router-link to="/admin/donations">
              <FileText class="h-6 w-6 mb-2 text-gray-700" />
              <span class="text-sm font-medium text-gray-900">View Donations</span>
            </router-link>
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- Recent Campaigns -->
    <Card>
      <CardHeader>
        <CardTitle class="text-gray-900">Recent Campaigns</CardTitle>
      </CardHeader>
      <CardContent>
        <div v-if="loading" class="flex flex-col items-center justify-center py-8">
          <Loader2 class="h-8 w-8 animate-spin text-gray-500" />
          <p class="mt-4 text-sm text-gray-600">Loading campaigns...</p>
        </div>
        <div v-else-if="recentCampaigns.length === 0" class="text-center py-8 text-gray-600">
          No campaigns yet. Create your first campaign to get started!
        </div>
        <div v-else class="space-y-4">
          <div class="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Goal</TableHead>
                  <TableHead>Raised</TableHead>
                  <TableHead class="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="campaign in recentCampaigns" :key="campaign.id">
                  <TableCell>
                    <div class="font-medium">{{ campaign.title }}</div>
                    <div class="text-sm text-muted-foreground">{{ campaign.slug }}</div>
                  </TableCell>
                  <TableCell>
                    <Badge :variant="campaign.status === 'active' ? 'default' : 'secondary'">
                      {{ campaign.status }}
                    </Badge>
                  </TableCell>
                  <TableCell>${{ formatAmount(campaign.goal_amount || 0) }}</TableCell>
                  <TableCell>${{ formatAmount(campaign.current_amount || 0) }}</TableCell>
                  <TableCell class="text-right">
                    <div class="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" as-child>
                        <router-link :to="`/admin/campaigns/${campaign.id}/edit`">
                          <Edit class="h-4 w-4 mr-1" />
                          Edit
                        </router-link>
                      </Button>
                      <Button variant="ghost" size="sm" as-child>
                        <router-link :to="`/campaigns/${campaign.slug}`" target="_blank">
                          <ExternalLink class="h-4 w-4 mr-1" />
                          View
                        </router-link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          
          <Pagination
            v-if="campaignsStore.pagination.total > perPage"
            :current-page="currentPage"
            :total-pages="campaignsStore.pagination.pages"
            :total="campaignsStore.pagination.total"
            :per-page="perPage"
            @page-change="handlePageChange"
          />
        </div>
      </CardContent>
    </Card>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { 
  Briefcase, 
  DollarSign, 
  TrendingUp, 
  RefreshCw, 
  Plus, 
  FileText, 
  Loader2,
  Edit,
  ExternalLink,
  Home
} from 'lucide-vue-next'
import AdminLayout from '@/layouts/AdminLayout.vue'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { useCampaignsStore } from '@/stores/campaigns'
import { useAuthStore } from '@/stores/auth'
import { useSonner } from '@/composables/useSonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

const campaignsStore = useCampaignsStore()
const authStore = useAuthStore()
const { error } = useSonner()

const breadcrumbItems = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: Home, current: true }
]

const loading = ref(false)
const recentCampaigns = ref<any[]>([])
const currentPage = ref(1)
const perPage = ref(5)

const stats = ref({
  totalCampaigns: 0,
  activeCampaigns: 0,
  totalDonations: 0,
  monthlyDonations: 0,
  totalAmount: 0,
  growthPercentage: 0,
  activeSubscriptions: 0
})

const formatAmount = (amount: string | number) => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  return (numAmount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

const getDiceBearAvatar = (seed: string) => {
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(seed)}&backgroundColor=e5e7eb`
}

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.style.display = 'none'
}

const getCurrentGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good Morning'
  if (hour < 18) return 'Good Afternoon'
  return 'Good Evening'
}

const getCurrentDate = () => {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  })
}

const fetchDashboardData = async (page: number = 1) => {
  loading.value = true
  currentPage.value = page
  try {
    // Fetch campaigns with pagination
    await campaignsStore.fetchCampaigns({ 
      page, 
      limit: perPage.value, 
      sort: 'created_at', 
      order: 'desc' 
    })
    
    // Get recent campaigns for display
    recentCampaigns.value = campaignsStore.campaigns
    
    // Fetch all campaigns for stats (in background)
    const allCampaigns = campaignsStore.campaigns

    // Calculate stats from all campaigns
    stats.value.totalCampaigns = campaignsStore.pagination.total || allCampaigns.length
    stats.value.activeCampaigns = allCampaigns.filter(c => c.status === 'active').length
    
    // Calculate total amounts raised across all campaigns
    const totalRaised = allCampaigns.reduce((sum, c) => {
      const amount = typeof c.current_amount === 'string' ? parseFloat(c.current_amount) : (c.current_amount || 0)
      return sum + amount
    }, 0)
    stats.value.totalAmount = totalRaised

    // Note: These stats would ideally come from a dedicated dashboard API endpoint
    // For now, we're calculating from available campaign data
    // Total donations count would need to be fetched from donations API
    stats.value.totalDonations = 0 // Would need donations API
    stats.value.monthlyDonations = 0 // Would need donations API with date filter
    stats.value.growthPercentage = 0 // Would need historical data comparison
    stats.value.activeSubscriptions = 0 // Would need subscriptions API
  } catch (err: any) {
    console.error('Error fetching dashboard data:', err)
    error('Failed to load dashboard data')
  } finally {
    loading.value = false
  }
}

const handlePageChange = (page: number) => {
  fetchDashboardData(page)
}

onMounted(() => {
  fetchDashboardData(1)
})
</script>

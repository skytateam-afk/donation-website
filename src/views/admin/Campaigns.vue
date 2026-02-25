<template>
  <AdminLayout>
    <Breadcrumb :items="breadcrumbItems" class="mb-6" />
    
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">Campaigns</h2>
          <p class="mt-1 text-sm text-gray-600">Manage your fundraising campaigns</p>
        </div>
        <Button as-child class="bg-gray-900 hover:bg-gray-800">
          <router-link to="/admin/campaigns/new">
            <Plus class="mr-2 h-4 w-4" />
            New Campaign
          </router-link>
        </Button>
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
                placeholder="Search campaigns..."
              />
            </div>
            <div>
              <Label for="status">Status</Label>
              <select
                id="status"
                v-model="filters.status"
                class="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                @change="fetchCampaigns"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <Label for="sort">Sort By</Label>
              <select
                id="sort"
                v-model="filters.sort"
                class="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                @change="fetchCampaigns"
              >
                <option value="created_at">Date Created</option>
                <option value="title">Title</option>
                <option value="goal_amount">Goal Amount</option>
                <option value="current_amount">Amount Raised</option>
              </select>
            </div>
            <div>
              <Label for="order">Order</Label>
              <select
                id="order"
                v-model="filters.order"
                class="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                @change="fetchCampaigns"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Campaigns List -->
      <Card>
        <CardContent class="p-0">
          <div v-if="loading" class="p-12 text-center">
            <Loader2 class="h-12 w-12 animate-spin text-gray-600 mx-auto" />
            <p class="mt-4 text-gray-600">Loading campaigns...</p>
          </div>

          <div v-else-if="campaigns.length === 0" class="p-12 text-center">
            <Heart class="mx-auto h-12 w-12 text-gray-400" />
            <h3 class="mt-2 text-sm font-medium text-gray-900">No campaigns</h3>
            <p class="mt-1 text-sm text-gray-600">Get started by creating a new campaign.</p>
            <div class="mt-6">
              <Button as-child class="bg-gray-900 hover:bg-gray-800">
                <router-link to="/admin/campaigns/new">
                  <Plus class="mr-2 h-4 w-4" />
                  New Campaign
                </router-link>
              </Button>
            </div>
          </div>

          <div v-else class="space-y-4">
            <div class="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Goal</TableHead>
                    <TableHead>Raised</TableHead>
                    <TableHead class="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-for="campaign in campaigns" :key="campaign.id">
                    <TableCell>
                      <div class="flex items-center">
                        <div class="flex-shrink-0 h-12 w-12">
                          <img
                            v-if="campaign.thumbnail_url"
                            :src="campaign.thumbnail_url"
                            :alt="campaign.title"
                            class="h-12 w-12 rounded object-cover"
                            @error="handleImageError"
                          />
                          <div
                            v-else
                            class="h-12 w-12 rounded bg-gray-200 flex items-center justify-center"
                          >
                            <ImageIcon class="h-6 w-6 text-gray-400" />
                          </div>
                        </div>
                        <div class="ml-4">
                          <div class="font-medium">{{ campaign.title }}</div>
                          <div class="text-sm text-muted-foreground">{{ campaign.slug }}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        :variant="campaign.status === 'active' ? 'default' : 'secondary'"
                        class="cursor-pointer"
                        @click="toggleStatus(campaign)"
                      >
                        {{ campaign.status }}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div class="w-full bg-gray-200 rounded-full h-2">
                        <div
                          class="bg-gray-900 h-2 rounded-full"
                          :style="{ width: `${getProgress(campaign)}%` }"
                        ></div>
                      </div>
                      <div class="text-xs text-muted-foreground mt-1">{{ getProgress(campaign) }}%</div>
                    </TableCell>
                    <TableCell>${{ formatAmount(campaign.goal_amount) }}</TableCell>
                    <TableCell>${{ formatAmount(campaign.current_amount) }}</TableCell>
                    <TableCell class="text-right">
                      <div class="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" as-child>
                          <router-link :to="`/admin/campaigns/${campaign.id}/edit`">
                            <Edit class="h-4 w-4" />
                          </router-link>
                        </Button>
                        <Button variant="ghost" size="sm" as-child>
                          <a :href="`/campaigns/${campaign.slug}`" target="_blank">
                            <ExternalLink class="h-4 w-4" />
                          </a>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          @click="confirmDelete(campaign)"
                        >
                          <Trash2 class="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
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

    <!-- Delete Confirmation Dialog -->
    <Dialog v-model:open="showDeleteModal">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Campaign</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{{ campaignToDelete?.title }}"? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" @click="showDeleteModal = false" :disabled="deleting">
            Cancel
          </Button>
          <Button
            variant="destructive"
            @click="deleteCampaign"
            :disabled="deleting"
          >
            <Loader2 v-if="deleting" class="mr-2 h-4 w-4 animate-spin" />
            {{ deleting ? 'Deleting...' : 'Delete' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import {
  Plus,
  Heart,
  Edit,
  ExternalLink,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Home,
  Briefcase
} from 'lucide-vue-next'
import AdminLayout from '@/layouts/AdminLayout.vue'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { useCampaignsStore } from '@/stores/campaigns'
import { useSonner } from '@/composables/useSonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
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
const { success, error } = useSonner()

const breadcrumbItems = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: Home },
  { label: 'Campaigns', href: '/admin/campaigns', icon: Briefcase, current: true }
]

const loading = ref(false)
const deleting = ref(false)
const showDeleteModal = ref(false)
const campaignToDelete = ref<any>(null)

const filters = ref({
  search: '',
  status: '',
  sort: 'created_at',
  order: 'desc'
})

let searchTimeout: any = null

// Watch for search query changes
watch(() => filters.value.search, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    campaignsStore.pagination.page = 1
    fetchCampaigns()
  }, 500)
})

const campaigns = computed(() => campaignsStore.campaigns)
const pagination = computed(() => campaignsStore.pagination)

const formatAmount = (amount: string | number) => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  return (numAmount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

const getProgress = (campaign: any) => {
  if (!campaign.goal_amount) return 0
  const goal = typeof campaign.goal_amount === 'string' ? parseFloat(campaign.goal_amount) : campaign.goal_amount
  const current = typeof campaign.current_amount === 'string' ? parseFloat(campaign.current_amount) : campaign.current_amount || 0
  return Math.min(100, Math.round((current / goal) * 100))
}

const fetchCampaigns = async () => {
  loading.value = true
  try {
    await campaignsStore.fetchCampaigns({
      search: filters.value.search || undefined,
      status: filters.value.status || undefined,
      sort: filters.value.sort,
      order: filters.value.order,
      page: pagination.value.page,
      limit: pagination.value.limit
    })
  } catch (err) {
    console.error('Error fetching campaigns:', err)
    error('Failed to load campaigns')
  } finally {
    loading.value = false
  }
}

const changePage = (page: number) => {
  if (page < 1 || page > pagination.value.pages) return
  campaignsStore.pagination.page = page
  fetchCampaigns()
}

const toggleStatus = async (campaign: any) => {
  try {
    const newStatus = campaign.status === 'active' ? 'inactive' : 'active'
    const formData = new FormData()
    formData.append('status', newStatus)
    
    await campaignsStore.updateCampaign(campaign.id, formData)
    success(`Campaign ${newStatus === 'active' ? 'activated' : 'deactivated'}`)
    fetchCampaigns()
  } catch (err) {
    console.error('Error toggling status:', err)
    error('Failed to update campaign status')
  }
}

const confirmDelete = (campaign: any) => {
  campaignToDelete.value = campaign
  showDeleteModal.value = true
}

const deleteCampaign = async () => {
  if (!campaignToDelete.value) return
  
  deleting.value = true
  try {
    await campaignsStore.deleteCampaign(campaignToDelete.value.id)
    success('Campaign deleted successfully')
    showDeleteModal.value = false
    campaignToDelete.value = null
    fetchCampaigns()
  } catch (err) {
    console.error('Error deleting campaign:', err)
    error('Failed to delete campaign')
  } finally {
    deleting.value = false
  }
}

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.style.display = 'none'
  if (target.nextElementSibling) {
    (target.nextElementSibling as HTMLElement).style.display = 'flex'
  }
}

onMounted(() => {
  fetchCampaigns()
})
</script>

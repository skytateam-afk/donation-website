<template>
  <AdminLayout>
    <Breadcrumb :items="breadcrumbItems" class="mb-6" />
    
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">Notifications</h2>
          <p class="mt-1 text-sm text-gray-600">Stay updated with your latest activities</p>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          @click="markAllAsRead"
          :disabled="unreadCount === 0"
        >
          Mark all as read
        </Button>
      </div>

      <!-- Notifications List -->
      <Card>
        <CardContent class="p-0">
          <div v-if="notifications.length === 0" class="p-8 text-center">
            <Bell class="mx-auto h-12 w-12 text-gray-400" />
            <h3 class="mt-4 text-sm font-medium text-gray-900">No notifications</h3>
            <p class="mt-2 text-sm text-gray-600">You're all caught up!</p>
          </div>

          <div v-else class="divide-y divide-gray-200">
            <div
              v-for="notification in notifications"
              :key="notification.id"
              :class="[
                'p-4 transition-colors',
                !notification.read && 'bg-blue-50'
              ]"
            >
              <div 
                class="flex items-start space-x-3 cursor-pointer hover:opacity-80"
                @click="toggleNotification(notification.id)"
              >
                <!-- Icon -->
                <div 
                  :class="[
                    'flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center',
                    getNotificationColor(notification.type)
                  ]"
                >
                  <component :is="getNotificationIcon(notification.type)" class="h-5 w-5 text-white" />
                </div>

                <!-- Content -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <p class="text-sm font-medium text-gray-900">
                        {{ notification.title }}
                      </p>
                      <p 
                        v-if="!expandedNotifications.has(notification.id)"
                        class="mt-1 text-sm text-gray-600 line-clamp-2"
                      >
                        {{ notification.message }}
                      </p>
                    </div>
                    <div class="ml-2 flex-shrink-0 flex items-center gap-2">
                      <div v-if="!notification.read" class="h-2 w-2 bg-blue-500 rounded-full"></div>
                      <ChevronDown 
                        :class="[
                          'h-4 w-4 text-gray-400 transition-transform',
                          expandedNotifications.has(notification.id) && 'rotate-180'
                        ]"
                      />
                    </div>
                  </div>
                  
                  <!-- Expanded Content -->
                  <div 
                    v-if="expandedNotifications.has(notification.id)"
                    class="mt-3 space-y-3"
                  >
                    <p class="text-sm text-gray-600">
                      {{ notification.message }}
                    </p>
                    
                    <!-- Metadata if available (formatted nicely) -->
                    <div v-if="notification.metadata && hasRelevantMetadata(notification.metadata)" class="text-sm bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <div class="space-y-2">
                        <div v-if="notification.metadata.campaign_title" class="flex items-start">
                          <span class="font-medium text-gray-700 min-w-[100px]">Campaign:</span>
                          <span class="text-gray-600">{{ notification.metadata.campaign_title }}</span>
                        </div>
                        <div v-if="notification.metadata.amount" class="flex items-start">
                          <span class="font-medium text-gray-700 min-w-[100px]">Amount:</span>
                          <span class="text-gray-600">{{ formatCurrency(notification.metadata.amount) }}</span>
                        </div>
                        <div v-if="notification.metadata.donor_name" class="flex items-start">
                          <span class="font-medium text-gray-700 min-w-[100px]">Donor:</span>
                          <span class="text-gray-600">{{ notification.metadata.donor_name }}</span>
                        </div>
                        <div v-if="notification.metadata.donor_email" class="flex items-start">
                          <span class="font-medium text-gray-700 min-w-[100px]">Email:</span>
                          <span class="text-gray-600">{{ notification.metadata.donor_email }}</span>
                        </div>
                        <div v-if="notification.metadata.status" class="flex items-start">
                          <span class="font-medium text-gray-700 min-w-[100px]">Status:</span>
                          <span class="text-gray-600 capitalize">{{ notification.metadata.status }}</span>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Action Button -->
                    <Button
                      v-if="notification.read"
                      variant="ghost"
                      size="sm"
                      @click.stop="markAsUnread(notification.id)"
                      class="h-8 px-2 text-xs"
                    >
                      Mark as unread
                    </Button>
                  </div>
                  
                  <p class="mt-2 text-xs text-gray-500">
                    {{ formatDate(notification.created_at) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Bell, Heart, DollarSign, User, AlertCircle, CheckCircle, Home, ChevronDown } from 'lucide-vue-next'
import AdminLayout from '@/layouts/AdminLayout.vue'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useSonner } from '@/composables/useSonner'
import { notificationsAPI, type Notification } from '@/api/notifications'

const { success, error } = useSonner()

const breadcrumbItems = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: Home },
  { label: 'Notifications', href: '/admin/notifications', icon: Bell, current: true }
]

const notifications = ref<Notification[]>([])
const loading = ref(false)
const pagination = ref({
  total: 0,
  unread: 0,
  limit: 50,
  offset: 0
})
const expandedNotifications = ref<Set<number>>(new Set())

const unreadCount = computed(() => pagination.value.unread)

// Fetch notifications
const fetchNotifications = async () => {
  loading.value = true
  try {
    const { data } = await notificationsAPI.getNotifications({
      limit: pagination.value.limit,
      offset: pagination.value.offset
    })
    notifications.value = data.data
    pagination.value = data.pagination
  } catch (err) {
    console.error('Error fetching notifications:', err)
    error('Failed to load notifications')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchNotifications()
})

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'campaign':
      return Heart
    case 'donation':
      return DollarSign
    case 'user':
      return User
    case 'success':
      return CheckCircle
    case 'warning':
      return AlertCircle
    default:
      return Bell
  }
}

const getNotificationColor = (type: string) => {
  switch (type) {
    case 'campaign':
      return 'bg-purple-500'
    case 'donation':
      return 'bg-green-500'
    case 'user':
      return 'bg-blue-500'
    case 'success':
      return 'bg-emerald-500'
    case 'warning':
      return 'bg-yellow-500'
    default:
      return 'bg-gray-500'
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return 'Just now'
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours} hour${hours > 1 ? 's' : ''} ago`
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days} day${days > 1 ? 's' : ''} ago`
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }
}

const toggleNotification = async (id: number) => {
  const isExpanded = expandedNotifications.value.has(id)
  
  if (isExpanded) {
    // Collapse notification
    expandedNotifications.value.delete(id)
  } else {
    // Expand notification and mark as read if unread
    expandedNotifications.value.add(id)
    
    const notification = notifications.value.find(n => n.id === id)
    if (notification && !notification.read) {
      await markAsRead(id)
    }
  }
}

const markAsRead = async (id: number) => {
  const notification = notifications.value.find(n => n.id === id)
  if (notification && !notification.read) {
    try {
      await notificationsAPI.markAsRead(id)
      notification.read = true
      pagination.value.unread = Math.max(0, pagination.value.unread - 1)
    } catch (err) {
      console.error('Error marking notification as read:', err)
    }
  }
}

const markAsUnread = async (id: number) => {
  const notification = notifications.value.find(n => n.id === id)
  if (notification && notification.read) {
    try {
      await notificationsAPI.markAsUnread(id)
      notification.read = false
      pagination.value.unread += 1
      success('Notification marked as unread')
    } catch (err) {
      console.error('Error marking notification as unread:', err)
      error('Failed to mark as unread')
    }
  }
}

const markAllAsRead = async () => {
  try {
    await notificationsAPI.markAllAsRead()
    notifications.value.forEach(n => {
      n.read = true
    })
    pagination.value.unread = 0
    success('All notifications marked as read')
  } catch (err) {
    console.error('Error marking all as read:', err)
    error('Failed to mark all as read')
  }
}

// Check if metadata has relevant information to display
const hasRelevantMetadata = (metadata: any) => {
  if (!metadata || typeof metadata !== 'object') return false
  
  // Filter out internal/system fields that shouldn't be displayed
  const relevantFields = ['campaign_title', 'amount', 'donor_name', 'donor_email', 'status']
  return relevantFields.some(field => metadata[field] !== undefined && metadata[field] !== null)
}

// Format currency
const formatCurrency = (amount: number | string) => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(numAmount)
}
</script>

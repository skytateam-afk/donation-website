<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Mobile Menu Button -->
    <div class="lg:hidden fixed top-4 left-4 z-50">
      <Button
        variant="outline"
        size="icon"
        @click="mobileMenuOpen = !mobileMenuOpen"
        class="bg-white shadow-sm"
      >
        <Menu v-if="!mobileMenuOpen" class="h-5 w-5" />
        <X v-else class="h-5 w-5" />
      </Button>
    </div>

    <!-- Sidebar Navigation -->
    <aside
      :class="[
        'fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out flex flex-col',
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      ]"
    >
      <!-- Logo -->
      <div class="flex items-center h-16 px-6 border-b border-gray-200 flex-shrink-0">
        <router-link to="/admin/dashboard" class="flex items-center space-x-3" @click="mobileMenuOpen = false">
          <img src="/logo.svg" alt="CRRNetwork" class="h-8 w-auto" />
          <span class="font-semibold text-gray-900">Admin Panel</span>
        </router-link>
      </div>

      <!-- Navigation Menu -->
      <nav class="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        <router-link
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          @click="mobileMenuOpen = false"
          class="flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors"
          :class="isActive(item.path) 
            ? 'bg-gray-100 text-gray-900' 
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'"
        >
          <component :is="item.icon" class="mr-3 h-5 w-5" />
          {{ item.label }}
        </router-link>
      </nav>

      <!-- Logout Button at Bottom -->
      <div class="border-t border-gray-200 p-4 flex-shrink-0">
        <Button
          variant="outline"
          size="sm"
          @click="handleLogout"
          class="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <LogOut class="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>

    <!-- Mobile Overlay -->
    <div
      v-if="mobileMenuOpen"
      @click="mobileMenuOpen = false"
      class="fixed inset-0 z-30 bg-gray-900/50 lg:hidden"
    />

    <!-- Main Content -->
    <div class="lg:pl-64">
      <!-- Top Bar -->
      <header class="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
        <div class="px-4 sm:px-6 lg:px-8">
          <div class="flex h-16 items-center justify-between">
            <div class="flex-1 flex items-center lg:ml-0 ml-14">
              <h1 class="text-base sm:text-lg font-semibold text-gray-900 truncate">
                {{ pageTitle }}
              </h1>
            </div>
            <div class="flex items-center space-x-2 sm:space-x-3">
              <Button variant="ghost" size="icon" as-child class="hidden sm:flex">
                <router-link to="/" target="_blank" title="View Site">
                  <ExternalLink class="h-4 w-4" />
                </router-link>
              </Button>
              
              <!-- User Info -->
              <div class="flex items-center space-x-2">
                <div class="hidden lg:block text-right">
                  <p class="text-sm font-medium text-gray-900 truncate max-w-[150px]">
                    {{ authStore.user?.full_name || 'Admin' }}
                  </p>
                  <p class="text-xs text-gray-600 truncate max-w-[150px]">
                    {{ authStore.user?.email }}
                  </p>
                </div>
                
                <!-- Notifications -->
                <Button variant="ghost" size="icon" as-child>
                  <router-link to="/admin/notifications" title="Notifications">
                    <div class="relative">
                      <Bell class="h-5 w-5" />
                      <span 
                        v-if="unreadNotificationCount > 0"
                        class="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center"
                      >
                        {{ unreadNotificationCount > 9 ? '9+' : unreadNotificationCount }}
                      </span>
                    </div>
                  </router-link>
                </Button>

                <!-- Profile Avatar -->
                <Button variant="ghost" size="icon" as-child>
                  <router-link to="/admin/profile" title="Profile">
                    <div class="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
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
                  </router-link>
                </Button>

                <!-- Logout Button -->
                <Button 
                  variant="ghost" 
                  size="icon"
                  @click="handleLogout"
                  title="Logout"
                >
                  <LogOut class="h-5 w-5 text-gray-600" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div class="max-w-7xl mx-auto">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { 
  Home, 
  Heart, 
  DollarSign, 
  User, 
  LogOut,
  Menu,
  X,
  ExternalLink,
  Settings,
  FileText,
  Bell
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useSonner } from '@/composables/useSonner'
import { Button } from '@/components/ui/button'
import { notificationsAPI } from '@/api/notifications'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { success, error } = useSonner()

const mobileMenuOpen = ref(false)
const unreadNotificationCount = ref(0)
let notificationInterval: number | null = null

// Fetch unread notification count
const fetchUnreadCount = async () => {
  try {
    const { data } = await notificationsAPI.getUnreadCount()
    unreadNotificationCount.value = data.data.count
  } catch (err) {
    console.error('Error fetching unread count:', err)
  }
}

// Fetch on mount and set up polling
onMounted(() => {
  fetchUnreadCount()
  // Poll every 30 seconds
  notificationInterval = setInterval(fetchUnreadCount, 30000)
})

// Clean up interval on unmount
onBeforeUnmount(() => {
  if (notificationInterval) {
    clearInterval(notificationInterval)
    notificationInterval = null
  }
})

const menuItems = [
  {
    path: '/admin/dashboard',
    label: 'Dashboard',
    icon: Home
  },
  {
    path: '/admin/campaigns',
    label: 'Campaigns',
    icon: Heart
  },
  {
    path: '/admin/donations',
    label: 'Donations',
    icon: DollarSign
  },
  {
    path: '/admin/users',
    label: 'Users',
    icon: Settings
  },
  {
    path: '/admin/profile',
    label: 'Profile',
    icon: User
  }
]

const pageTitle = computed(() => {
  const path = route.path
  if (path.includes('dashboard')) return 'Dashboard'
  if (path.includes('campaigns')) return 'Campaigns'
  if (path.includes('donations')) return 'Donations'
  if (path.includes('users')) return 'Users'
  if (path.includes('profile')) return 'Profile'
  return 'Admin Panel'
})

const isActive = (path: string) => {
  return route.path.startsWith(path)
}

const getDiceBearAvatar = (seed: string) => {
  // Using DiceBear Avatars API with initials style
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(seed)}&backgroundColor=e5e7eb`
}

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.style.display = 'none'
}

const handleLogout = async () => {
  try {
    await authStore.logout()
    success('Logged out successfully')
    router.push('/admin/login')
  } catch (err) {
    console.error('Logout error:', err)
    error('Failed to logout')
  }
}
</script>

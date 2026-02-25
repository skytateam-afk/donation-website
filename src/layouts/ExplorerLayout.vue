<template>
  <div class="min-h-screen bg-background">
    <!-- Header -->
    <header class="border-b bg-card">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <!-- Logo and Mobile Menu -->
          <div class="flex items-center space-x-4">
            <!-- Mobile Menu Button (Hamburger) -->
            <Sheet v-model:open="mobileMenuOpen">
              <SheetTrigger as-child>
                <Button variant="ghost" size="icon" class="md:hidden min-w-[44px] min-h-[44px]">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  <span class="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" class="w-[280px] sm:w-[320px]">
                <nav class="flex flex-col space-y-2 mt-6">
                  <Button
                    variant="ghost"
                    size="lg"
                    class="justify-start min-h-[44px] gap-3"
                    @click="navigateTo('/dashboard')"
                    :class="{ 'bg-accent': $route.path === '/dashboard' }"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Dashboard
                  </Button>
                  <Button
                    variant="ghost"
                    size="lg"
                    class="justify-start min-h-[44px] gap-3"
                    @click="navigateTo('/blocks')"
                    :class="{ 'bg-accent': $route.path === '/blocks' }"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    Blocks
                  </Button>
                  <Button
                    variant="ghost"
                    size="lg"
                    class="justify-start min-h-[44px] gap-3"
                    @click="navigateTo('/transactions')"
                    :class="{ 'bg-accent': $route.path === '/transactions' }"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    Transactions
                  </Button>
                  <Button
                    variant="ghost"
                    size="lg"
                    class="justify-start min-h-[44px] gap-3"
                    @click="navigateTo('/chaincodes')"
                    :class="{ 'bg-accent': $route.path === '/chaincodes' }"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                    Chaincodes
                  </Button>
                  <Button
                    variant="ghost"
                    size="lg"
                    class="justify-start min-h-[44px] gap-3"
                    @click="navigateTo('/channels')"
                    :class="{ 'bg-accent': $route.path === '/channels' }"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                    Channels
                  </Button>
                  <Button
                    variant="ghost"
                    size="lg"
                    class="justify-start min-h-[44px] gap-3"
                    @click="navigateTo('/reports')"
                    :class="{ 'bg-accent': $route.path === '/reports' }"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Reports
                  </Button>
                  <Button
                    v-if="authStore.user?.role === 'admin'"
                    variant="ghost"
                    size="lg"
                    class="justify-start min-h-[44px] gap-3"
                    @click="navigateTo('/recovery')"
                    :class="{ 'bg-accent': $route.path === '/recovery' }"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Recovery
                  </Button>
                  <Button
                    v-if="authStore.user?.role === 'admin'"
                    variant="ghost"
                    size="lg"
                    class="justify-start min-h-[44px] gap-3"
                    @click="navigateTo('/users')"
                    :class="{ 'bg-accent': $route.path === '/users' }"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    User Management
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>

            <!-- Logo based on theme -->
            <img 
              v-if="isDarkMode" 
              src="/peerpaynetworkdark.png" 
              alt="PeerPay Network" 
              class="h-6 md:h-8 w-auto cursor-pointer"
              @click="router.push('/dashboard')"
            />
            <img 
              v-else 
              src="/peerpaynetworklight.png" 
              alt="PeerPay Network" 
              class="h-6 md:h-8 w-auto cursor-pointer"
              @click="router.push('/dashboard')"
            />
          </div>

          <!-- User Info and Actions -->
          <div class="flex items-center space-x-2 md:space-x-3">
            <!-- Theme Toggle -->
            <ThemeToggle />
            
            <!-- User Info (Hidden on mobile) - Clickable to navigate to profile -->
            <button 
              v-if="authStore.user"
              @click="router.push('/profile')"
              class="hidden sm:flex items-center space-x-2 hover:bg-accent rounded-md px-3 py-2 transition-colors cursor-pointer"
            >
              <div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
                {{ authStore.user.username.charAt(0).toUpperCase() }}
              </div>
              <div class="flex flex-col items-start">
                <span class="text-sm text-foreground font-medium">{{ authStore.user.username }}</span>
                <span class="text-xs text-muted-foreground">{{ authStore.user.networkName }}</span>
              </div>
            </button>

            <!-- Logout Button with touch-optimized size -->
            <Button variant="outline" class="min-h-[44px] min-w-[44px] px-4" @click="handleLogout">
              <span class="hidden sm:inline">Logout</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 sm:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </Button>
          </div>
        </div>
      </div>
      
      <!-- Desktop Navigation Bar (Below Header) -->
      <div class="hidden md:block border-t bg-muted/30">
        <div class="container mx-auto px-4">
          <nav class="flex items-center space-x-1 py-2">
            <Button
              variant="ghost"
              size="sm"
              class="gap-2"
              @click="router.push('/dashboard')"
              :class="{ 'bg-accent': $route.path === '/dashboard' }"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Dashboard
            </Button>
            <Button
              variant="ghost"
              size="sm"
              class="gap-2"
              @click="router.push('/blocks')"
              :class="{ 'bg-accent': $route.path === '/blocks' }"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Blocks
            </Button>
            <Button
              variant="ghost"
              size="sm"
              class="gap-2"
              @click="router.push('/transactions')"
              :class="{ 'bg-accent': $route.path === '/transactions' }"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              Transactions
            </Button>
            <Button
              variant="ghost"
              size="sm"
              class="gap-2"
              @click="router.push('/chaincodes')"
              :class="{ 'bg-accent': $route.path === '/chaincodes' }"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              Chaincodes
            </Button>
            <Button
              variant="ghost"
              size="sm"
              class="gap-2"
              @click="router.push('/channels')"
              :class="{ 'bg-accent': $route.path === '/channels' }"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
              Channels
            </Button>
            <Button
              variant="ghost"
              size="sm"
              class="gap-2"
              @click="router.push('/reports')"
              :class="{ 'bg-accent': $route.path === '/reports' }"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Reports
            </Button>
            <Button
              v-if="authStore.user?.role === 'admin'"
              variant="ghost"
              size="sm"
              class="gap-2"
              @click="router.push('/recovery')"
              :class="{ 'bg-accent': $route.path === '/recovery' }"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Recovery
            </Button>
            <Button
              v-if="authStore.user?.role === 'admin'"
              variant="ghost"
              size="sm"
              class="gap-2"
              @click="router.push('/users')"
              :class="{ 'bg-accent': $route.path === '/users' }"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              User Management
            </Button>
          </nav>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-6 max-w-7xl">
      <!-- Breadcrumbs -->
      <div class="mb-6">
        <Breadcrumb>
          <BreadcrumbItem v-for="(crumb, index) in breadcrumbs" :key="index">
            <BreadcrumbLink :to="crumb.to">
              {{ crumb.label }}
            </BreadcrumbLink>
            <BreadcrumbSeparator v-if="index < breadcrumbs.length - 1" />
          </BreadcrumbItem>
        </Breadcrumb>
      </div>
      
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useTheme } from '@/composables/useTheme'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import ThemeToggle from '@/components/ThemeToggle.vue'
import { useBreadcrumbs } from '@/composables/useBreadcrumbs'

const router = useRouter()
const authStore = useAuthStore()
const { isDark: isDarkMode } = useTheme()
const mobileMenuOpen = ref(false)
const { breadcrumbs } = useBreadcrumbs()

function handleLogout() {
  authStore.logout()
  router.push('/login')
}

function navigateTo(path: string) {
  router.push(path)
  mobileMenuOpen.value = false
}

function getPageTitle(path: string): string {
  const titles: Record<string, string> = {
    '/dashboard': 'Dashboard - Network Overview',
    '/blocks': 'Blocks - Blockchain Blocks',
    '/transactions': 'Transactions - Transaction History',
    '/chaincodes': 'Chaincodes - Smart Contracts',
    '/channels': 'Channels - Network Channels',
    '/reports': 'Reports - Analytics & Reports',
    '/recovery': 'Recovery - Account Recovery',
    '/users': 'User Management - Manage Users',
    '/profile': 'Profile - User Profile',
    '/chaincode-management': 'Chaincode Management - Deploy & Manage',
    '/channel-management': 'Channel Management - Create & Configure'
  }
  return titles[path] || 'Explorer'
}
</script>

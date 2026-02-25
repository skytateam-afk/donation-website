<template>
  <ExplorerLayout>
    <div class="space-y-6">
      <!-- Page Header -->
      <div>
        <h1 class="text-3xl font-bold">Profile</h1>
        <p class="text-muted-foreground mt-2">
          View and manage your account settings
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="p-4 bg-destructive/10 border border-destructive rounded-lg">
        <p class="text-sm text-destructive">{{ error }}</p>
      </div>

      <!-- Success Message -->
      <div v-if="successMessage" class="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
        <p class="text-sm text-green-600 dark:text-green-400">{{ successMessage }}</p>
      </div>

      <!-- Profile Content -->
      <div v-if="!loading && profile" class="grid gap-6 md:grid-cols-2">
        <!-- Personal Information Card -->
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="space-y-2">
              <label class="text-sm font-medium text-muted-foreground">Username</label>
              <div class="flex items-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <p class="text-base">{{ profile.username }}</p>
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium text-muted-foreground">Email</label>
              <div class="flex items-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <p class="text-base">{{ profile.email }}</p>
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium text-muted-foreground">Role</label>
              <div class="flex items-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <p class="text-base capitalize">{{ profile.role }}</p>
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium text-muted-foreground">Institution</label>
              <div class="flex items-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <p class="text-base">{{ profile.institution || 'N/A' }}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Security Settings Card -->
        <Card>
          <CardHeader>
            <CardTitle>Security Settings</CardTitle>
            <CardDescription>Manage your account security</CardDescription>
          </CardHeader>
          <CardContent class="space-y-6">
            <!-- MFA Toggle -->
            <div class="space-y-3">
              <div class="flex flex-wrap items-center justify-between">
                <div class="space-y-1">
                  <label class="text-sm font-medium">Multi-Factor Authentication</label>
                  <p class="text-xs text-muted-foreground">
                    Require OTP code via email when logging in
                  </p>
                </div>
                <Switch
                  :checked="mfaEnabled"
                  @update:checked="handleMFAToggle"
                  :disabled="mfaLoading"
                />
              </div>
              
              <div v-if="mfaEnabled" class="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                <div class="flex items-start space-x-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p class="text-sm font-medium text-green-600 dark:text-green-400">MFA Enabled</p>
                    <p class="text-xs text-green-600 dark:text-green-400 mt-1">
                      You'll receive a one-time code via email each time you log in
                    </p>
                  </div>
                </div>
              </div>

              <div v-else class="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                <div class="flex items-start space-x-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <p class="text-sm font-medium text-yellow-600 dark:text-yellow-400">MFA Disabled</p>
                    <p class="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                      Enable MFA for enhanced account security
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Account Status -->
            <div class="space-y-2 pt-4 border-t">
              <label class="text-sm font-medium text-muted-foreground">Account Status</label>
              <div class="flex items-center space-x-2">
                <div :class="profile.is_active ? 'bg-green-500' : 'bg-red-500'" class="w-2 h-2 rounded-full"></div>
                <p class="text-sm">{{ profile.is_active ? 'Active' : 'Inactive' }}</p>
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium text-muted-foreground">Last Login</label>
              <p class="text-sm">{{ formatDate(profile.last_login) }}</p>
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium text-muted-foreground">Member Since</label>
              <p class="text-sm">{{ formatDate(profile.created_at) }}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </ExplorerLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ExplorerLayout from '@/layouts/ExplorerLayout.vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import apiClient from '@/api/axios'

interface UserProfile {
  id: number
  username: string
  email: string
  role: string
  institution?: string
  is_active: boolean
  is_verified: boolean
  mfa_enabled: boolean
  last_login: string
  created_at: string
}

const profile = ref<UserProfile | null>(null)
const loading = ref(true)
const error = ref('')
const successMessage = ref('')
const mfaEnabled = ref(false)
const mfaLoading = ref(false)

onMounted(async () => {
  await fetchProfile()
})

async function fetchProfile() {
  try {
    loading.value = true
    error.value = ''

    const response = await apiClient.get('/api/auth/profile')

    if (response.data.success) {
      profile.value = response.data.user
      mfaEnabled.value = response.data.user.mfa_enabled
    } else {
      error.value = response.data.message || 'Failed to load profile'
    }
  } catch (err: any) {
    console.error('Error fetching profile:', err)
    error.value = err.response?.data?.message || 'Failed to load profile'
  } finally {
    loading.value = false
  }
}

async function handleMFAToggle(enabled: boolean) {
  try {
    mfaLoading.value = true
    error.value = ''
    successMessage.value = ''

    const response = await apiClient.put('/api/auth/mfa', { enabled })

    if (response.data.success) {
      mfaEnabled.value = enabled
      successMessage.value = response.data.message
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        successMessage.value = ''
      }, 3000)
    } else {
      error.value = response.data.message || 'Failed to update MFA settings'
      // Revert the switch if there was an error
      mfaEnabled.value = !enabled
    }
  } catch (err: any) {
    console.error('Error updating MFA:', err)
    error.value = err.response?.data?.message || 'Failed to update MFA settings'
    // Revert the switch if there was an error
    mfaEnabled.value = !enabled
  } finally {
    mfaLoading.value = false
  }
}

function formatDate(dateString: string): string {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

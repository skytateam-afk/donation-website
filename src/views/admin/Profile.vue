<template>
  <AdminLayout>
    <Breadcrumb :items="breadcrumbItems" class="mb-6" />
    
    <div class="space-y-6">
      <!-- Header -->
      <div>
        <h2 class="text-2xl font-bold text-gray-900">Profile Settings</h2>
        <p class="mt-1 text-sm text-gray-600">Manage your account information and preferences</p>
      </div>

      <!-- Profile Information -->
      <Card>
        <CardHeader>
          <CardTitle class="text-gray-900">Profile Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form @submit.prevent="handleUpdateProfile" class="space-y-6">
            <!-- Profile Picture Section -->
            <div>
              <Label class="text-sm font-medium text-gray-900">Profile Picture</Label>
              <div class="mt-2 flex items-start space-x-4">
                <div>
                  <input
                    ref="fileInput"
                    type="file"
                    accept="image/*"
                    @change="handleFileSelect"
                    class="hidden"
                  />
                  <div 
                    @click="fileInput?.click()"
                    class="relative h-24 w-24 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200 cursor-pointer hover:border-gray-400 transition-colors group"
                    title="Click to upload profile picture"
                  >
                    <img
                      v-if="profileForm.profile_picture_url"
                      :src="profileForm.profile_picture_url"
                      alt="Profile picture"
                      class="h-full w-full object-cover"
                      @error="handleImageError"
                    />
                    <div v-else class="h-full w-full flex items-center justify-center bg-gray-200">
                      <User class="h-12 w-12 text-gray-400" />
                    </div>
                    <!-- Hover overlay -->
                    <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                      <Upload class="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </div>
                <div class="flex-1">
                  <p class="text-xs text-gray-600 mb-2">Click to upload (Max 5MB)</p>
                  <Button
                    v-if="profileForm.profile_picture_url"
                    type="button"
                    variant="outline"
                    size="sm"
                    @click="handleRemoveProfilePicture"
                    :disabled="removingPicture"
                    class="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Loader2 v-if="removingPicture" class="mr-2 h-3 w-3 animate-spin" />
                    <Trash2 v-else class="mr-2 h-3 w-3" />
                    Remove Picture
                  </Button>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label for="name">Full Name</Label>
                <Input
                  id="name"
                  v-model="profileForm.name"
                  type="text"
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <Label for="email">Email Address</Label>
                <Input
                  id="email"
                  v-model="profileForm.email"
                  type="email"
                  placeholder="your.email@example.com"
                  disabled
                  class="bg-gray-50"
                />
                <p class="mt-1 text-xs text-gray-600">Email cannot be changed</p>
              </div>
            </div>

            <div class="flex justify-end">
              <Button
                type="submit"
                :disabled="updatingProfile"
                class="bg-gray-900 hover:bg-gray-800"
              >
                <Loader2 v-if="updatingProfile" class="mr-2 h-4 w-4 animate-spin" />
                {{ updatingProfile ? 'Saving...' : 'Save Changes' }}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <!-- Change Password -->
      <Card>
        <CardHeader>
          <CardTitle class="text-gray-900">Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form @submit.prevent="handleChangePassword" class="space-y-4">
            <div>
              <Label for="current_password">Current Password</Label>
              <Input
                id="current_password"
                v-model="passwordForm.currentPassword"
                type="password"
                placeholder="Enter current password"
              />
            </div>
            <div>
              <Label for="new_password">New Password</Label>
              <Input
                id="new_password"
                v-model="passwordForm.newPassword"
                type="password"
                placeholder="Enter new password"
              />
              <p class="mt-1 text-xs text-gray-600">Minimum 8 characters</p>
            </div>
            <div>
              <Label for="confirm_password">Confirm New Password</Label>
              <Input
                id="confirm_password"
                v-model="passwordForm.confirmPassword"
                type="password"
                placeholder="Confirm new password"
              />
            </div>

            <div class="flex justify-end">
              <Button
                type="submit"
                :disabled="updatingPassword"
                class="bg-gray-900 hover:bg-gray-800"
              >
                <Loader2 v-if="updatingPassword" class="mr-2 h-4 w-4 animate-spin" />
                {{ updatingPassword ? 'Updating...' : 'Update Password' }}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <!-- Security Settings -->
      <Card>
        <CardHeader>
          <CardTitle class="text-gray-900">Security Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div class="flex justify-between items-center py-3 border-b border-gray-200">
              <div>
                <p class="text-sm font-medium text-gray-900">Two-Factor Authentication (Email)</p>
                <p class="text-sm text-gray-600">Add an extra layer of security to your account</p>
              </div>
              <div class="flex items-center space-x-2">
                <Badge :variant="mfaEnabled ? 'default' : 'secondary'">
                  {{ mfaEnabled ? 'Enabled' : 'Disabled' }}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  @click="toggleMFA"
                  :disabled="togglingMFA"
                >
                  <Loader2 v-if="togglingMFA" class="mr-2 h-4 w-4 animate-spin" />
                  {{ mfaEnabled ? 'Disable' : 'Enable' }}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Account Information -->
      <Card>
        <CardHeader>
          <CardTitle class="text-gray-900">Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div class="flex justify-between items-center py-3 border-b border-gray-200">
              <div>
                <p class="text-sm font-medium text-gray-900">Account Status</p>
                <p class="text-sm text-gray-600">Your account is active</p>
              </div>
              <Badge variant="default">Active</Badge>
            </div>
            <div class="flex justify-between items-center py-3 border-b border-gray-200">
              <div>
                <p class="text-sm font-medium text-gray-900">Role</p>
                <p class="text-sm text-gray-600">Administrator</p>
              </div>
              <Badge variant="secondary">Admin</Badge>
            </div>
            <div class="flex justify-between items-center py-3">
              <div>
                <p class="text-sm font-medium text-gray-900">Member Since</p>
                <p class="text-sm text-gray-600">{{ formatDate(authStore.user?.created_at) }}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Danger Zone -->
      <Card class="border-red-200">
        <CardHeader>
          <CardTitle class="text-red-600">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="flex justify-between items-center">
            <div>
              <p class="text-sm font-medium text-gray-900">Delete Account</p>
              <p class="text-sm text-gray-600">Permanently delete your account and all data</p>
            </div>
            <Button variant="destructive" @click="showDeleteDialog = true">
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Delete Confirmation Dialog -->
    <Dialog v-model:open="showDeleteDialog">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Account</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your account and remove all associated data.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" @click="showDeleteDialog = false">
            Cancel
          </Button>
          <Button variant="destructive" @click="handleDeleteAccount">
            Delete Account
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Loader2, User, Upload, Home, UserCircle, Trash2 } from 'lucide-vue-next'
import AdminLayout from '@/layouts/AdminLayout.vue'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { useAuthStore } from '@/stores/auth'
import { useSonner } from '@/composables/useSonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import cloudflareR2Service from '@/services/cloudflare-r2'

const authStore = useAuthStore()
const { success, error } = useSonner()

const breadcrumbItems = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: Home },
  { label: 'Profile', href: '/admin/profile', icon: UserCircle, current: true }
]

const updatingProfile = ref(false)
const updatingPassword = ref(false)
const removingPicture = ref(false)
const showDeleteDialog = ref(false)
const mfaEnabled = ref(false)
const togglingMFA = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)

const profileForm = ref({
  name: '',
  email: '',
  profile_picture_url: ''
})

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const formatDate = (date: string | undefined) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.style.display = 'none'
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return

  // Validate file
  const validation = cloudflareR2Service.validateFile(file, 5)
  if (!validation.valid) {
    error(validation.error || 'Invalid file')
    return
  }

  // Store the file
  selectedFile.value = file

  // Create preview URL
  const reader = new FileReader()
  reader.onload = (e) => {
    profileForm.value.profile_picture_url = e.target?.result as string
  }
  reader.readAsDataURL(file)

  success('Image selected. Click "Save Changes" to upload.')
}

const handleRemoveProfilePicture = async () => {
  if (!profileForm.value.profile_picture_url) return

  removingPicture.value = true
  try {
    const currentUrl = profileForm.value.profile_picture_url

    // Delete from R2 if it's an R2 URL
    if (currentUrl.includes('r2.dev') || currentUrl.includes('cloudflarestorage.com')) {
      try {
        await cloudflareR2Service.deleteFile(currentUrl)
      } catch (deleteErr) {
        console.error('Error deleting from R2:', deleteErr)
        // Continue even if R2 deletion fails
      }
    }

    // Update profile to remove picture URL
    await authStore.updateProfile({
      full_name: profileForm.value.name,
      profile_picture_url: null
    })

    // Clear local state
    profileForm.value.profile_picture_url = ''
    selectedFile.value = null

    success('Profile picture removed successfully')
  } catch (err) {
    console.error('Error removing profile picture:', err)
    error('Failed to remove profile picture')
  } finally {
    removingPicture.value = false
  }
}

const handleUpdateProfile = async () => {
  updatingProfile.value = true
  try {
    let profilePictureUrl = profileForm.value.profile_picture_url

    // Upload profile picture if new one is selected
    if (selectedFile.value) {
      // Delete old picture from R2 if it exists
      if (profilePictureUrl && (profilePictureUrl.includes('r2.dev') || profilePictureUrl.includes('cloudflarestorage.com'))) {
        try {
          await cloudflareR2Service.deleteFile(profilePictureUrl)
        } catch (deleteErr) {
          console.error('Error deleting old picture from R2:', deleteErr)
          // Continue even if deletion fails
        }
      }

      // Upload new picture
      profilePictureUrl = await cloudflareR2Service.uploadFile(
        selectedFile.value,
        'profile-pictures'
      )
      selectedFile.value = null
    }

    // Update profile with new data
    await authStore.updateProfile({
      full_name: profileForm.value.name,
      profile_picture_url: profilePictureUrl
    })

    // Update local form state
    profileForm.value.profile_picture_url = profilePictureUrl

    success('Profile updated successfully')
  } catch (err) {
    console.error('Error updating profile:', err)
    error('Failed to update profile')
  } finally {
    updatingProfile.value = false
  }
}

const handleChangePassword = async () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    error('Passwords do not match')
    return
  }

  if (passwordForm.value.newPassword.length < 8) {
    error('Password must be at least 8 characters')
    return
  }

  updatingPassword.value = true
  try {
    await authStore.changePassword(
      passwordForm.value.currentPassword,
      passwordForm.value.newPassword
    )
    success('Password updated successfully')
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  } catch (err) {
    console.error('Error changing password:', err)
    error('Failed to change password')
  } finally {
    updatingPassword.value = false
  }
}

const toggleMFA = async () => {
  togglingMFA.value = true
  try {
    // TODO: Implement MFA toggle API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    mfaEnabled.value = !mfaEnabled.value
    success(`Two-factor authentication ${mfaEnabled.value ? 'enabled' : 'disabled'} successfully`)
  } catch (err) {
    console.error('Error toggling MFA:', err)
    error('Failed to update two-factor authentication')
  } finally {
    togglingMFA.value = false
  }
}

const handleDeleteAccount = async () => {
  try {
    // TODO: Implement account deletion API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    success('Account deleted successfully')
    showDeleteDialog.value = false
    // Logout and redirect
    await authStore.logout()
  } catch (err) {
    console.error('Error deleting account:', err)
    error('Failed to delete account')
  }
}

onMounted(() => {
  if (authStore.user) {
    profileForm.value.name = authStore.user.full_name || ''
    profileForm.value.email = authStore.user.email || ''
    profileForm.value.profile_picture_url = authStore.user.profile_picture_url || ''
    // TODO: Load MFA status from user profile
    mfaEnabled.value = false
  }
})
</script>

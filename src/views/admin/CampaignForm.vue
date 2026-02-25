<template>
  <AdminLayout>
    <Breadcrumb :items="breadcrumbItems" class="mb-6" />
    
    <div class="max-w-4xl mx-auto">
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Basic Information -->
        <Card>
          <CardHeader>
            <CardTitle class="text-gray-900">Basic Information</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
          
            <!-- Title -->
            <div>
              <Label for="title">
                Campaign Title <span class="text-red-600">*</span>
              </Label>
              <Input
                id="title"
                v-model="form.title"
                type="text"
                :class="{ 'border-red-500': v$.title.$error }"
                placeholder="Enter campaign title"
                @blur="handleTitleBlur"
              />
              <p v-if="v$.title.$error" class="mt-1 text-sm text-red-600">
                {{ v$.title.$errors[0].$message }}
              </p>
            </div>

            <!-- Slug -->
            <div>
              <Label for="slug">
                URL Slug <span class="text-red-600">*</span>
              </Label>
              <div class="flex">
                <span class="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-600 text-sm">
                  /campaigns/
                </span>
                <Input
                  id="slug"
                  v-model="form.slug"
                  type="text"
                  class="rounded-l-none"
                  :class="{ 'border-red-500': v$.slug.$error }"
                  placeholder="campaign-url-slug"
                  @blur="v$.slug.$touch()"
                />
              </div>
              <p v-if="v$.slug.$error" class="mt-1 text-sm text-red-600">
                {{ v$.slug.$errors[0].$message }}
              </p>
              <p v-else class="mt-1 text-sm text-gray-600">
                Auto-generated from title. Use lowercase letters, numbers, and hyphens only.
              </p>
            </div>

            <!-- Description with Rich Text Editor -->
            <div>
              <Label>
                Description <span class="text-red-600">*</span>
              </Label>
              <Editor
                v-model="form.description"
                placeholder="Write your campaign description here..."
                :error="v$.description.$error"
              />
              <p v-if="v$.description.$error" class="mt-1 text-sm text-red-600">
                {{ v$.description.$errors[0].$message }}
              </p>
            </div>

            <!-- Goal Amount -->
            <div>
              <Label for="goal_amount">
                Goal Amount (USD) <span class="text-red-600">*</span>
              </Label>
              <div class="relative">
                <span class="absolute left-3 top-3 text-gray-600">$</span>
                <Input
                  id="goal_amount"
                  v-model.number="form.goal_amount"
                  type="number"
                  step="0.01"
                  min="1"
                  class="pl-8"
                  :class="{ 'border-red-500': v$.goal_amount.$error }"
                  placeholder="10000.00"
                  @blur="v$.goal_amount.$touch()"
                />
              </div>
              <p v-if="v$.goal_amount.$error" class="mt-1 text-sm text-red-600">
                {{ v$.goal_amount.$errors[0].$message }}
              </p>
            </div>

            <!-- Status -->
            <div>
              <Label for="status">
                Status <span class="text-red-600">*</span>
              </Label>
              <select
                id="status"
                v-model="form.status"
                class="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <!-- Media Upload -->
        <Card>
          <CardHeader>
            <CardTitle class="text-gray-900">Media</CardTitle>
          </CardHeader>
          <CardContent class="space-y-6">
          
            <!-- Video Source Toggle -->
            <div>
              <Label class="mb-2 block">Video Source</Label>
              <div class="flex gap-4">
                <label class="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    v-model="form.videoSource"
                    value="youtube"
                    class="mr-2"
                  />
                  <span>YouTube/Vimeo URL</span>
                </label>
                <label class="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    v-model="form.videoSource"
                    value="upload"
                    class="mr-2"
                  />
                  <span>Upload Video File</span>
                </label>
              </div>
            </div>

            <!-- YouTube/Vimeo URL Input -->
            <div v-show="form.videoSource === 'youtube'">
              <Label for="main_video_url">YouTube or Vimeo URL</Label>
              <Input
                id="main_video_url"
                v-model="form.main_video_url"
                type="url"
                placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
              />
              <p class="mt-1 text-sm text-gray-600">
                Paste the full YouTube or Vimeo video URL
              </p>
            </div>

            <!-- Video Upload with R2 -->
            <div v-show="form.videoSource === 'upload'">
              <Label class="mb-2 block">Upload Campaign Video</Label>
              <VideoUpload
                ref="videoUploadRef"
                accept="video/mp4"
                acceptText="MP4 video files only"
                :multiple="false"
                :maxSizeMB="100"
                folder="campaigns/videos"
                :existingUrls="videoExistingUrls"
              />
            </div>

            <!-- Thumbnail Upload (Compulsory) -->
            <div>
              <Label class="mb-2 block">
                Campaign Thumbnail <span class="text-red-600">*</span>
              </Label>
              <p class="text-sm text-gray-600 mb-2">
                Upload a thumbnail image that will be displayed until the video plays. This is required.
              </p>
              <VideoUpload
                ref="thumbnailUploadRef"
                accept="image/*"
                acceptText="Image files (JPG, PNG, WebP, etc.)"
                :multiple="false"
                :maxSizeMB="5"
                folder="campaigns/thumbnails"
                :existingUrls="form.thumbnail_url ? [form.thumbnail_url] : []"
              />
            </div>

            <!-- Image Upload with R2 -->
            <div>
              <Label class="mb-2 block">Upload Campaign Images</Label>
              <VideoUpload
                ref="imageUploadRef"
                accept="image/*"
                acceptText="Image files (JPG, PNG, WebP, etc.)"
                :multiple="true"
                :maxSizeMB="10"
                folder="campaigns/images"
                :existingUrls="form.media_urls"
              />
            </div>
          </CardContent>
        </Card>

        <!-- Form Actions -->
        <div class="flex justify-end space-x-4">
          <Button variant="outline" as-child>
            <router-link to="/admin/campaigns">
              Cancel
            </router-link>
          </Button>
          <Button
            type="submit"
            :disabled="submitting || v$.$invalid"
            class="bg-gray-900 hover:bg-gray-800"
          >
            <Loader2 v-if="submitting" class="mr-2 h-4 w-4 animate-spin" />
            {{ submitting ? 'Saving...' : (isEdit ? 'Update Campaign' : 'Create Campaign') }}
          </Button>
        </div>
      </form>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Loader2, Home, Heart } from 'lucide-vue-next'
import AdminLayout from '@/layouts/AdminLayout.vue'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import VideoUpload from '@/components/VideoUpload.vue'
import { useCampaignsStore } from '@/stores/campaigns'
import { useSonner } from '@/composables/useSonner'
import { useVuelidate } from '@vuelidate/core'
import { required, minLength, minValue, helpers } from '@vuelidate/validators'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Editor } from '@/components/ui/editor'

const router = useRouter()
const route = useRoute()
const campaignsStore = useCampaignsStore()
const { success, error } = useSonner()

const isEdit = computed(() => !!route.params.id)

const breadcrumbItems = computed(() => [
  { label: 'Dashboard', href: '/admin/dashboard', icon: Home },
  { label: 'Campaigns', href: '/admin/campaigns', icon: Heart },
  { 
    label: isEdit.value ? 'Edit Campaign' : 'New Campaign', 
    href: isEdit.value ? `/admin/campaigns/${route.params.id}/edit` : '/admin/campaigns/new',
    current: true 
  }
])
const submitting = ref(false)
const videoUploadRef = ref<any>(null)
const thumbnailUploadRef = ref<any>(null)
const imageUploadRef = ref<any>(null)

// Use ref instead of computed to avoid timing issues
const videoExistingUrls = ref<string[]>([])

// Helper function to update video existing URLs
const updateVideoExistingUrls = () => {
  if (form.value.main_video_url && form.value.videoSource === 'upload') {
    videoExistingUrls.value = [form.value.main_video_url]
    console.log('Updated videoExistingUrls:', videoExistingUrls.value)
  } else {
    videoExistingUrls.value = []
  }
}

// Form data
const form = ref({
  title: '',
  slug: '',
  description: '',
  goal_amount: null as number | null,
  main_video_url: '',
  thumbnail_url: '',
  status: 'active' as 'active' | 'inactive' | 'completed',
  media_urls: [] as string[],
  videoSource: 'youtube' as 'youtube' | 'upload'
})

// Validation rules
const rules = {
  title: {
    required: helpers.withMessage('Title is required', required),
    minLength: helpers.withMessage('Title must be at least 5 characters', minLength(5))
  },
  slug: {
    required: helpers.withMessage('Slug is required', required),
    minLength: helpers.withMessage('Slug must be at least 3 characters', minLength(3)),
    validSlug: helpers.withMessage(
      'Slug must contain only lowercase letters, numbers, and hyphens',
      (value: string) => /^[a-z0-9-]+$/.test(value)
    )
  },
  description: {
    required: helpers.withMessage('Description is required', required),
    minLength: helpers.withMessage('Description must be at least 20 characters', minLength(20))
  },
  goal_amount: {
    required: helpers.withMessage('Goal amount is required', required),
    minValue: helpers.withMessage('Goal amount must be at least $1', minValue(1))
  }
}

const v$ = useVuelidate(rules, form)

// Generate slug from title
const generateSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

// Handle title blur to auto-generate slug
const handleTitleBlur = () => {
  v$.value.title.$touch()
  
  // Auto-generate slug if it's empty or if we're creating a new campaign
  if (!form.value.slug || !isEdit.value) {
    form.value.slug = generateSlug(form.value.title)
  }
}

// Watch for video source changes and clear the URL when switching
// But only if it's a user-initiated change, not during initial load
const isInitialLoad = ref(true)
watch(() => form.value.videoSource, (newSource, oldSource) => {
  // Skip the first change (initial load)
  if (isInitialLoad.value) {
    isInitialLoad.value = false
    return
  }
  
  if (oldSource && newSource !== oldSource) {
    // Clear the video URL when switching sources
    form.value.main_video_url = ''
    updateVideoExistingUrls()
  }
})

// Watch for changes to main_video_url to update existing URLs
watch(() => form.value.main_video_url, () => {
  updateVideoExistingUrls()
})

// Form submission
const handleSubmit = async () => {
  v$.value.$touch()
  
  if (v$.value.$invalid) {
    error('Please fix the errors in the form')
    return
  }

  // Validate that at least one video source is provided
  const hasYoutubeUrl = form.value.videoSource === 'youtube' && form.value.main_video_url && form.value.main_video_url.trim()
  const hasUploadedVideo = form.value.videoSource === 'upload' && videoUploadRef.value?.hasFiles()
  
  console.log('Video validation:', {
    videoSource: form.value.videoSource,
    main_video_url: form.value.main_video_url,
    hasYoutubeUrl,
    hasUploadedVideo,
    videoUploadHasFiles: videoUploadRef.value?.hasFiles()
  })
  
  if (!hasYoutubeUrl && !hasUploadedVideo) {
    error('Please provide a video URL or upload a video file')
    return
  }

  // Validate that thumbnail is provided (compulsory)
  const hasThumbnail = thumbnailUploadRef.value?.hasFiles()
  if (!hasThumbnail) {
    error('Please upload a campaign thumbnail. This is required.')
    return
  }

  submitting.value = true

  try {
    // Upload files to R2 first
    let videoUrls: string[] = []
    let thumbnailUrls: string[] = []
    let imageUrls: string[] = []

    if (videoUploadRef.value && form.value.videoSource === 'upload') {
      try {
        videoUrls = await videoUploadRef.value.uploadFiles()
      } catch (err) {
        console.error('Video upload error:', err)
      }
    }

    if (thumbnailUploadRef.value) {
      try {
        thumbnailUrls = await thumbnailUploadRef.value.uploadFiles()
      } catch (err) {
        console.error('Thumbnail upload error:', err)
      }
    }

    if (imageUploadRef.value) {
      try {
        // This returns ALL URLs (existing + new)
        imageUrls = await imageUploadRef.value.uploadFiles()
      } catch (err) {
        console.error('Image upload error:', err)
      }
    }

    // Prepare form data
    const formData = new FormData()
    formData.append('title', form.value.title)
    formData.append('slug', form.value.slug)
    formData.append('description', form.value.description)
    formData.append('goal_amount', form.value.goal_amount!.toString())
    formData.append('status', form.value.status)
    
    // Handle video URL based on selected source
    if (form.value.videoSource === 'youtube') {
      // Use YouTube/Vimeo URL
      formData.append('main_video_url', form.value.main_video_url)
    } else if (form.value.videoSource === 'upload') {
      // Use uploaded video URL
      if (videoUrls.length > 0) {
        formData.append('main_video_url', videoUrls[0])
      } else if (form.value.main_video_url) {
        // Keep existing uploaded video
        formData.append('main_video_url', form.value.main_video_url)
      }
    }

    // Handle thumbnail URL
    if (thumbnailUrls.length > 0) {
      formData.append('thumbnail_url', thumbnailUrls[0])
    } else if (form.value.thumbnail_url) {
      // Keep existing thumbnail
      formData.append('thumbnail_url', form.value.thumbnail_url)
    }
    
    // Always send media_urls (even if empty) to ensure backend updates correctly
    formData.append('media_urls', JSON.stringify(imageUrls))

    if (isEdit.value) {
      await campaignsStore.updateCampaign(Number(route.params.id), formData)
      
      // Refresh campaign data to get the latest state from backend
      await campaignsStore.fetchCampaign(Number(route.params.id))
      const updatedCampaign = campaignsStore.currentCampaign
      
      if (updatedCampaign) {
        // Update form with fresh data from backend
        form.value.title = updatedCampaign.title
        form.value.slug = updatedCampaign.slug
        form.value.description = updatedCampaign.description
        form.value.goal_amount = Number(updatedCampaign.goal_amount)
        form.value.main_video_url = updatedCampaign.main_video_url || ''
        form.value.thumbnail_url = updatedCampaign.thumbnail_url || ''
        form.value.status = updatedCampaign.status
        
        // Re-detect video source
        if (updatedCampaign.main_video_url) {
          form.value.videoSource = detectVideoSource(updatedCampaign.main_video_url)
        }
        
        // Update video existing URLs to reflect the uploaded video
        await nextTick()
        updateVideoExistingUrls()
        console.log('After save - videoExistingUrls updated:', videoExistingUrls.value)
        
        // Reload media URLs - create new array to trigger reactivity
        if (updatedCampaign.media && Array.isArray(updatedCampaign.media)) {
          form.value.media_urls = updatedCampaign.media.map((m: any) => m.media_url)
        } else {
          form.value.media_urls = []
        }
      }
      
      success('Campaign updated successfully!')
    } else {
      await campaignsStore.createCampaign(formData)
      success('Campaign created successfully')
      router.push('/admin/campaigns')
    }
  } catch (err: any) {
    console.error('Error saving campaign:', err)
    error(err.response?.data?.message || 'Failed to save campaign')
  } finally {
    submitting.value = false
  }
}

// Detect if URL is YouTube/Vimeo or uploaded video
const detectVideoSource = (url: string): 'youtube' | 'upload' => {
  if (!url) return 'youtube'
  
  try {
    const urlObj = new URL(url)
    const hostname = urlObj.hostname.toLowerCase()
    
    // Check if it's a YouTube or Vimeo domain
    if (hostname.includes('youtube.com') || 
        hostname.includes('youtu.be') || 
        hostname.includes('vimeo.com')) {
      return 'youtube'
    }
    
    // Everything else is considered an uploaded video (including R2/Cloudflare URLs)
    return 'upload'
  } catch (e) {
    // If URL parsing fails, default to youtube
    console.error('Error parsing video URL:', e)
    return 'youtube'
  }
}

// Load campaign data for editing
onMounted(async () => {
  if (isEdit.value) {
    try {
      await campaignsStore.fetchCampaign(Number(route.params.id))
      const campaign = campaignsStore.currentCampaign
      
      console.log('Loaded campaign data:', campaign)
      
      if (campaign) {
        form.value.title = campaign.title
        form.value.slug = campaign.slug
        form.value.description = campaign.description
        form.value.goal_amount = Number(campaign.goal_amount)
        form.value.status = campaign.status
        
        // Detect video source type FIRST before setting the URL
        if (campaign.main_video_url) {
          form.value.videoSource = detectVideoSource(campaign.main_video_url)
          console.log('Detected video source:', form.value.videoSource, 'for URL:', campaign.main_video_url)
        }
        
        // Set URLs after video source is detected
        form.value.main_video_url = campaign.main_video_url || ''
        form.value.thumbnail_url = campaign.thumbnail_url || ''
        
        console.log('Form state after loading:', {
          videoSource: form.value.videoSource,
          main_video_url: form.value.main_video_url,
          thumbnail_url: form.value.thumbnail_url
        })
        
        // Explicitly update video existing URLs after data is loaded
        await nextTick()
        updateVideoExistingUrls()
        console.log('=== VIDEO DEBUG ===')
        console.log('After nextTick - videoExistingUrls updated:', videoExistingUrls.value)
        console.log('form.videoSource:', form.value.videoSource)
        console.log('form.main_video_url:', form.value.main_video_url)
        console.log('videoUploadRef exists:', !!videoUploadRef.value)
        console.log('===================')
        
        // Load existing media URLs
        console.log('Campaign media:', campaign.media)
        if (campaign.media && Array.isArray(campaign.media)) {
          form.value.media_urls = campaign.media.map((m: any) => m.media_url)
          console.log('Extracted media URLs:', form.value.media_urls)
        } else {
          console.log('No media found or media is not an array')
        }
      }
    } catch (err) {
      console.error('Error loading campaign:', err)
      error('Failed to load campaign')
      router.push('/admin/campaigns')
    }
  }
})
</script>

<style>
/* TipTap Editor Styles */
.ProseMirror {
  outline: none;
}

.ProseMirror p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  color: #9ca3af;
  pointer-events: none;
  height: 0;
}

.ProseMirror ul,
.ProseMirror ol {
  padding-left: 1.5rem;
  margin: 0.5rem 0;
}

.ProseMirror ul {
  list-style-type: disc;
}

.ProseMirror ol {
  list-style-type: decimal;
}

.ProseMirror strong {
  font-weight: bold;
}

.ProseMirror em {
  font-style: italic;
}
</style>

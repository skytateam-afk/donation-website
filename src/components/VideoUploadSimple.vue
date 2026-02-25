<template>
  <div class="space-y-4">
    <!-- Existing Video Display -->
    <div v-if="existingVideoUrl" class="mb-4">
      <Label class="text-sm font-medium text-gray-900 mb-2 block">Current Video</Label>
      <div class="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <div class="flex items-center space-x-3 flex-1 min-w-0">
          <Video class="h-5 w-5 text-gray-600 flex-shrink-0" />
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 truncate">
              {{ getFileNameFromUrl(existingVideoUrl) }}
            </p>
            <a
              :href="existingVideoUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="text-xs text-blue-600 hover:text-blue-800 hover:underline"
            >
              View video
            </a>
          </div>
        </div>
        <Button
          variant="destructive"
          size="sm"
          @click="removeExistingVideo"
          title="Remove"
        >
          <X class="h-4 w-4" />
        </Button>
      </div>
    </div>

    <!-- Upload Area -->
    <div
      @drop.prevent="handleDrop"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      :class="[
        'border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer',
        isDragging ? 'border-gray-400 bg-gray-50' : 'border-gray-300 hover:border-gray-400',
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      ]"
      @click="!disabled && fileInput?.click()"
    >
      <input
        ref="fileInput"
        type="file"
        accept="video/mp4"
        @change="handleFileSelect"
        class="hidden"
        :disabled="disabled"
      />
      
      <div>
        <Upload class="mx-auto h-12 w-12 text-gray-400" />
        <p class="mt-2 text-sm text-gray-700">
          <span class="font-medium text-gray-900">Click to select video</span>
          or drag and drop
        </p>
        <p class="text-xs text-gray-500 mt-1">
          MP4 video files only, up to {{ maxSizeMB }}MB
        </p>
        <p class="text-xs text-gray-500 mt-1">
          Video will be uploaded when you save the campaign
        </p>
      </div>
    </div>

    <!-- New Video Preview -->
    <div v-if="selectedFile" class="space-y-3">
      <Label class="text-sm font-medium text-gray-900">New Video to Upload</Label>
      <div class="relative group">
        <!-- Video Preview -->
        <div class="aspect-video rounded-lg overflow-hidden bg-gray-900 border border-gray-200">
          <video
            v-if="videoPreviewUrl"
            :src="videoPreviewUrl"
            class="w-full h-full object-cover"
            controls
            preload="metadata"
          >
            Your browser does not support the video tag.
          </video>
        </div>
        
        <!-- File Info -->
        <div class="mt-2 flex items-center justify-between p-2 bg-gray-50 rounded">
          <div>
            <p class="text-sm font-medium text-gray-900">{{ selectedFile.name }}</p>
            <p class="text-xs text-gray-600">{{ formatFileSize(selectedFile.size) }}</p>
          </div>
          <Button
            variant="destructive"
            size="sm"
            @click="removeSelectedFile"
            title="Remove"
          >
            <X class="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="errorMessage" class="p-3 bg-red-50 border border-red-200 rounded-lg">
      <p class="text-sm text-red-800">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { Upload, Video, X } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useSonner } from '@/composables/useSonner'
import cloudflareR2Service from '@/services/cloudflare-r2'

interface Props {
  maxSizeMB?: number
  folder?: string
  disabled?: boolean
  existingUrl?: string
}

const props = withDefaults(defineProps<Props>(), {
  maxSizeMB: 100,
  folder: 'videos',
  disabled: false,
  existingUrl: ''
})

const emit = defineEmits<{
  'video-removed': []
}>()

const { success, error } = useSonner()

const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const errorMessage = ref('')
const selectedFile = ref<File | null>(null)
const videoPreviewUrl = ref('')
const existingVideoUrl = ref(props.existingUrl)

// Watch for changes to existingUrl prop
watch(() => props.existingUrl, (newUrl) => {
  existingVideoUrl.value = newUrl
})

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    addFile(target.files[0])
  }
}

const handleDrop = (event: DragEvent) => {
  isDragging.value = false
  if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
    addFile(event.dataTransfer.files[0])
  }
}

const addFile = (file: File) => {
  errorMessage.value = ''
  
  // Validate file
  const validation = cloudflareR2Service.validateFile(file, props.maxSizeMB)
  if (!validation.valid) {
    errorMessage.value = validation.error || 'Invalid file'
    error(errorMessage.value)
    return
  }

  // Check if it's an MP4 file
  if (!file.type.includes('mp4')) {
    errorMessage.value = 'Only MP4 video files are allowed'
    error(errorMessage.value)
    return
  }

  // Clear existing video if selecting a new one
  if (existingVideoUrl.value) {
    existingVideoUrl.value = ''
  }

  // Clean up old preview URL
  if (videoPreviewUrl.value) {
    URL.revokeObjectURL(videoPreviewUrl.value)
  }

  // Set new file and create preview
  selectedFile.value = file
  videoPreviewUrl.value = URL.createObjectURL(file)
  
  success('Video selected. Click save to upload.')
}

const removeSelectedFile = () => {
  if (videoPreviewUrl.value) {
    URL.revokeObjectURL(videoPreviewUrl.value)
  }
  selectedFile.value = null
  videoPreviewUrl.value = ''
}

const removeExistingVideo = async () => {
  if (existingVideoUrl.value) {
    try {
      // Extract the key from the URL
      const url = new URL(existingVideoUrl.value)
      const key = url.pathname.substring(1) // Remove leading slash
      
      // Delete from R2
      await cloudflareR2Service.deleteFile(key)
      existingVideoUrl.value = ''
      emit('video-removed')
      success('Video deleted from storage')
    } catch (err) {
      console.error('Error deleting video from R2:', err)
      error('Failed to delete video')
    }
  }
}

// Expose upload method for parent component to call
const uploadFile = async (): Promise<string> => {
  // If there's an existing video and no new file selected, return the existing URL
  if (existingVideoUrl.value && !selectedFile.value) {
    return existingVideoUrl.value
  }

  // If there's a new file selected, upload it
  if (selectedFile.value) {
    try {
      const url = await cloudflareR2Service.uploadFile(
        selectedFile.value,
        props.folder,
        (progress) => {
          // Progress callback if needed
        }
      )
      return url
    } catch (err: any) {
      errorMessage.value = err.message || 'Upload failed'
      error(errorMessage.value)
      throw err
    }
  }

  return ''
}

// Expose methods to parent
defineExpose({
  uploadFile,
  hasFile: () => !!selectedFile.value || !!existingVideoUrl.value
})

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

const getFileNameFromUrl = (url?: string): string => {
  if (!url) return 'Video file'
  try {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname
    const filename = pathname.split('/').pop() || 'Video file'
    return decodeURIComponent(filename)
  } catch {
    return 'Video file'
  }
}

// Cleanup on unmount
onBeforeUnmount(() => {
  if (videoPreviewUrl.value) {
    URL.revokeObjectURL(videoPreviewUrl.value)
  }
})
</script>

<template>
  <div class="space-y-4">
    <!-- Existing Files Indicator -->
    <div v-if="selectedFiles.some(f => f.isExisting)" class="mb-3">
      <div class="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
        <div class="flex-shrink-0">
          <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
          </svg>
        </div>
        <div class="flex-1">
          <p class="text-sm font-medium text-green-800">
            {{ selectedFiles.filter(f => f.isExisting).length }} file(s) already uploaded
          </p>
          <p class="text-xs text-green-700">
            Scroll down to see uploaded files in the gallery
          </p>
        </div>
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
        :accept="accept"
        :multiple="multiple"
        @change="handleFileSelect"
        class="hidden"
        :disabled="disabled"
      />
      
      <div>
        <Upload class="mx-auto h-12 w-12 text-gray-400" />
        <p class="mt-2 text-sm text-gray-700">
          <span class="font-medium text-gray-900">Click to select files</span>
          or drag and drop
        </p>
        <p class="text-xs text-gray-500 mt-1">
          {{ acceptText }} up to {{ maxSizeMB }}MB
        </p>
        <p class="text-xs text-gray-500 mt-1">
          Files will be uploaded when you save the campaign
        </p>
      </div>
    </div>

    <!-- Selected Files Preview -->
    <div v-if="selectedFiles.length > 0" class="space-y-3">
      <Label class="text-sm font-medium text-gray-900">Selected Files ({{ selectedFiles.length }})</Label>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div
          v-for="(fileData, index) in selectedFiles"
          :key="index"
          class="relative group"
        >
          <!-- Image Preview -->
          <div v-if="fileData.type.startsWith('image/')" class="aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
            <img
              :src="fileData.preview"
              :alt="fileData.file?.name || 'Campaign image'"
              class="w-full h-full object-cover"
            />
          </div>
          
          <!-- Video Preview -->
          <div v-else-if="fileData.type.startsWith('video/')" class="aspect-square rounded-lg overflow-hidden bg-gray-900 border border-gray-200">
            <video
              v-if="fileData.preview || fileData.url"
              :src="fileData.preview || fileData.url"
              class="w-full h-full object-cover"
              controls
              preload="metadata"
            >
              Your browser does not support the video tag.
            </video>
            <div v-else class="w-full h-full flex items-center justify-center">
              <Video class="h-12 w-12 text-gray-400" />
            </div>
          </div>
          
          <!-- File Info Overlay -->
          <div class="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2">
            <p class="text-xs truncate">
              {{ fileData.file?.name || (fileData.isExisting ? getFileNameFromUrl(fileData.url) : 'Media file') }}
            </p>
            <p class="text-xs text-gray-300">{{ fileData.file ? formatFileSize(fileData.file.size) : '' }}</p>
          </div>
          
          <!-- Remove Button -->
          <Button
            variant="destructive"
            size="sm"
            class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            @click="removeFile(index)"
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
import { ref, computed, defineExpose, watch, onMounted } from 'vue'
import { Upload, Loader2, Video, Image, X, Copy } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useSonner } from '@/composables/useSonner'
import cloudflareR2Service from '@/services/cloudflare-r2'

interface FileData {
  file?: File
  preview: string
  type: string
  url?: string
  isExisting?: boolean
}

interface UploadedFile {
  name: string
  size: number
  type: string
  url?: string
  file?: File
}

interface Props {
  accept?: string
  acceptText?: string
  multiple?: boolean
  maxSizeMB?: number
  folder?: string
  disabled?: boolean
  modelValue?: UploadedFile[]
  existingUrls?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  accept: 'video/*,image/*',
  acceptText: 'Video or Image files',
  multiple: true,
  maxSizeMB: 100,
  folder: 'videos',
  disabled: false,
  modelValue: () => [],
  existingUrls: () => []
})

const emit = defineEmits<{
  'update:modelValue': [files: UploadedFile[]]
  'files-selected': [files: File[]]
  'upload-complete': [urls: string[]]
  'upload-error': [error: string]
}>()

const { success, error } = useSonner()

const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const errorMessage = ref('')
const selectedFiles = ref<FileData[]>([])
const isInitialized = ref(false)

// Define loadExistingFiles function
const loadExistingFiles = () => {
  console.log('loadExistingFiles called with:', props.existingUrls)
  
  if (props.existingUrls && props.existingUrls.length > 0) {
    props.existingUrls.forEach(url => {
      // Check if this URL is already in the array
      const exists = selectedFiles.value.some(f => f.url === url)
      if (!exists) {
        // Detect file type from URL extension
        const urlLower = url.toLowerCase()
        let type = 'image/'
        if (urlLower.includes('.mp4') || urlLower.includes('.webm') || 
            urlLower.includes('.mov') || urlLower.includes('.avi') || 
            urlLower.includes('.mkv') || urlLower.includes('video')) {
          type = 'video/'
        }
        
        console.log('Adding existing file:', { url, type })
        selectedFiles.value.push({
          preview: url,
          type: type,
          url: url,
          isExisting: true
        })
      }
    })
    console.log('selectedFiles after loading:', selectedFiles.value)
  }
}

// Initialize on mount
onMounted(() => {
  console.log('VideoUpload mounted with existingUrls:', props.existingUrls)
  isInitialized.value = true
})

// Watch for changes to existingUrls prop - this handles both initial load and updates
watch(() => props.existingUrls, (newUrls, oldUrls) => {
  console.log('=== VideoUpload Watcher Fired ===')
  console.log('VideoUpload existingUrls changed:', { 
    oldUrls, 
    newUrls, 
    isInitialized: isInitialized.value,
    currentSelectedFiles: selectedFiles.value.length
  })
  
  // Process immediately without waiting for initialization
  // This ensures files are loaded even if component is hidden by v-show
  
  // Clear all existing files first
  const beforeClear = selectedFiles.value.length
  selectedFiles.value = selectedFiles.value.filter(f => !f.isExisting)
  console.log(`Cleared existing files: ${beforeClear} -> ${selectedFiles.value.length}`)
  
  // Load new URLs if they exist
  if (newUrls && newUrls.length > 0) {
    console.log('Loading existing files from watcher:', newUrls)
    loadExistingFiles()
    console.log('After loadExistingFiles, selectedFiles count:', selectedFiles.value.length)
    console.log('selectedFiles content:', selectedFiles.value)
  }
  console.log('=== End VideoUpload Watcher ===')
}, { deep: true, immediate: true })

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    addFiles(Array.from(target.files))
  }
}

const handleDrop = (event: DragEvent) => {
  isDragging.value = false
  if (event.dataTransfer?.files) {
    addFiles(Array.from(event.dataTransfer.files))
  }
}

const addFiles = (files: File[]) => {
  errorMessage.value = ''
  
  // Validate files
  for (const file of files) {
    const validation = cloudflareR2Service.validateFile(file, props.maxSizeMB)
    if (!validation.valid) {
      errorMessage.value = validation.error || 'Invalid file'
      error(errorMessage.value)
      return
    }
  }

  // For single file uploads (like videos), clear existing files first
  if (!props.multiple && selectedFiles.value.length > 0) {
    // Clean up old object URLs
    selectedFiles.value.forEach(fileData => {
      if (fileData.preview && !fileData.isExisting && !fileData.url) {
        URL.revokeObjectURL(fileData.preview)
      }
    })
    selectedFiles.value = []
  }

  // Create previews for images and videos
  files.forEach(file => {
    // Check if this file is already in the list (by name and size)
    const exists = selectedFiles.value.some(
      f => f.file && f.file.name === file.name && f.file.size === file.size
    )
    
    if (exists) {
      return // Skip duplicate files
    }

    if (file.type.startsWith('image/')) {
      // Generate preview for images using FileReader
      const reader = new FileReader()
      reader.onload = (e) => {
        selectedFiles.value.push({
          file,
          preview: e.target?.result as string,
          type: file.type
        })
      }
      reader.readAsDataURL(file)
    } else if (file.type.startsWith('video/')) {
      // For videos, create an object URL for preview
      const videoUrl = URL.createObjectURL(file)
      selectedFiles.value.push({
        file,
        preview: videoUrl,
        type: file.type
      })
    } else {
      // For other file types, add without preview
      selectedFiles.value.push({
        file,
        preview: '',
        type: file.type
      })
    }
  })

  // Emit files selected event
  emit('files-selected', files)
  success(`${files.length} file(s) selected. Click save to upload.`)
}

const removeFile = async (index: number) => {
  const fileData = selectedFiles.value[index]
  
  // Delete from R2 if it's an existing file
  if (fileData.isExisting && fileData.url) {
    try {
      // Extract the key from the URL
      const url = new URL(fileData.url)
      const key = url.pathname.substring(1) // Remove leading slash
      
      // Delete from R2
      await cloudflareR2Service.deleteFile(key)
      success('File deleted from storage')
    } catch (err) {
      console.error('Error deleting file from R2:', err)
      // Continue with removal even if R2 deletion fails
    }
  }
  
  // Only revoke object URLs for newly selected files, not existing URLs
  if (fileData.preview && !fileData.isExisting && !fileData.url) {
    URL.revokeObjectURL(fileData.preview)
  }
  
  // Remove from array
  selectedFiles.value.splice(index, 1)
  
  // Emit event to update parent's media_urls
  const remainingUrls = selectedFiles.value
    .filter(f => f.isExisting && f.url)
    .map(f => f.url!)
  
  emit('update:modelValue', remainingUrls as any)
}

// Expose upload method for parent component to call
const uploadFiles = async (): Promise<string[]> => {
  if (selectedFiles.value.length === 0) {
    return []
  }

  const uploadedUrls: string[] = []

  try {
    for (const fileData of selectedFiles.value) {
      // If it's an existing file (already uploaded), just add the URL
      if (fileData.isExisting && fileData.url) {
        uploadedUrls.push(fileData.url)
      } else if (fileData.file) {
        // Upload new files
        const url = await cloudflareR2Service.uploadFile(
          fileData.file,
          props.folder,
          (progress) => {
            // Progress callback if needed
          }
        )
        uploadedUrls.push(url)
      }
    }

    emit('upload-complete', uploadedUrls)
    return uploadedUrls
  } catch (err: any) {
    errorMessage.value = err.message || 'Upload failed'
    error(errorMessage.value)
    emit('upload-error', errorMessage.value)
    throw err
  }
}

// Expose methods to parent
defineExpose({
  uploadFiles,
  getSelectedFiles: () => selectedFiles.value.map(f => f.file),
  hasFiles: () => selectedFiles.value.length > 0
})

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

const getFileNameFromUrl = (url?: string): string => {
  if (!url) return 'Media file'
  try {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname
    const filename = pathname.split('/').pop() || 'Media file'
    return decodeURIComponent(filename)
  } catch {
    return 'Media file'
  }
}
</script>

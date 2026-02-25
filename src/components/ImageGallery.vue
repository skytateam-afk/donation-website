<template>
  <div class="space-y-4">
    <!-- Gallery Grid -->
    <div v-if="images.length > 0" class="grid grid-cols-2 md:grid-cols-3 gap-4">
      <div
        v-for="(image, index) in images"
        :key="index"
        class="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
        @click="openLightbox(index)"
      >
        <img
          :src="image"
          :alt="`Campaign image ${index + 1}`"
          class="w-full h-full object-cover transition-transform group-hover:scale-110"
        />
        <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <Maximize2 class="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </div>

    <!-- Lightbox Modal -->
    <Dialog v-model:open="lightboxOpen">
      <DialogContent class="max-w-4xl p-0">
        <div class="relative">
          <!-- Close Button -->
          <Button
            variant="ghost"
            size="sm"
            class="absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/70 text-white"
            @click="lightboxOpen = false"
          >
            <X class="w-4 h-4" />
          </Button>

          <!-- Navigation Buttons -->
          <Button
            v-if="images.length > 1"
            variant="ghost"
            size="sm"
            class="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white"
            @click="previousImage"
          >
            <ChevronLeft class="w-6 h-6" />
          </Button>

          <Button
            v-if="images.length > 1"
            variant="ghost"
            size="sm"
            class="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white"
            @click="nextImage"
          >
            <ChevronRight class="w-6 h-6" />
          </Button>

          <!-- Image -->
          <div class="bg-black">
            <img
              :src="images[currentImageIndex]"
              :alt="`Campaign image ${currentImageIndex + 1}`"
              class="w-full h-auto max-h-[80vh] object-contain"
            />
          </div>

          <!-- Image Counter -->
          <div class="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
            {{ currentImageIndex + 1 }} / {{ images.length }}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Maximize2, X, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'

interface Props {
  images: string[]
}

const props = defineProps<Props>()

const lightboxOpen = ref(false)
const currentImageIndex = ref(0)

const openLightbox = (index: number) => {
  currentImageIndex.value = index
  lightboxOpen.value = true
}

const nextImage = () => {
  currentImageIndex.value = (currentImageIndex.value + 1) % props.images.length
}

const previousImage = () => {
  currentImageIndex.value = (currentImageIndex.value - 1 + props.images.length) % props.images.length
}

// Keyboard navigation
const handleKeydown = (e: KeyboardEvent) => {
  if (!lightboxOpen.value) return
  
  if (e.key === 'ArrowRight') {
    nextImage()
  } else if (e.key === 'ArrowLeft') {
    previousImage()
  } else if (e.key === 'Escape') {
    lightboxOpen.value = false
  }
}

// Add keyboard listener
if (typeof window !== 'undefined') {
  window.addEventListener('keydown', handleKeydown)
}
</script>

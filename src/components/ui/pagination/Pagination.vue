<template>
  <div class="flex items-center justify-between px-2">
    <div class="flex-1 text-sm text-muted-foreground">
      Showing {{ startItem }} to {{ endItem }} of {{ total }} results
    </div>
    <div class="flex items-center space-x-2">
      <Button
        variant="outline"
        size="sm"
        :disabled="currentPage === 1"
        @click="$emit('page-change', currentPage - 1)"
      >
        <ChevronLeft class="h-4 w-4" />
        Previous
      </Button>
      
      <div class="flex items-center space-x-1">
        <Button
          v-for="page in visiblePages"
          :key="page"
          :variant="page === currentPage ? 'default' : 'outline'"
          size="sm"
          class="w-9"
          @click="typeof page === 'number' && $emit('page-change', page)"
          :disabled="page === '...'"
        >
          {{ page }}
        </Button>
      </div>

      <Button
        variant="outline"
        size="sm"
        :disabled="currentPage === totalPages"
        @click="$emit('page-change', currentPage + 1)"
      >
        Next
        <ChevronRight class="h-4 w-4" />
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'

interface Props {
  currentPage: number
  totalPages: number
  total: number
  perPage: number
}

const props = defineProps<Props>()

defineEmits<{
  'page-change': [page: number]
}>()

const startItem = computed(() => {
  return (props.currentPage - 1) * props.perPage + 1
})

const endItem = computed(() => {
  return Math.min(props.currentPage * props.perPage, props.total)
})

const visiblePages = computed(() => {
  const pages: (number | string)[] = []
  const maxVisible = 7
  
  if (props.totalPages <= maxVisible) {
    // Show all pages if total is less than max visible
    for (let i = 1; i <= props.totalPages; i++) {
      pages.push(i)
    }
  } else {
    // Always show first page
    pages.push(1)
    
    if (props.currentPage > 3) {
      pages.push('...')
    }
    
    // Show pages around current page
    const start = Math.max(2, props.currentPage - 1)
    const end = Math.min(props.totalPages - 1, props.currentPage + 1)
    
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    
    if (props.currentPage < props.totalPages - 2) {
      pages.push('...')
    }
    
    // Always show last page
    pages.push(props.totalPages)
  }
  
  return pages
})
</script>

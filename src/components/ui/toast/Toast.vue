<template>
  <div
    :class="[
      'pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all',
      variantClasses,
      'animate-in slide-in-from-top-full'
    ]"
    role="alert"
  >
    <div class="grid gap-1">
      <div v-if="title" class="text-sm font-semibold">{{ title }}</div>
      <div v-if="description" class="text-sm opacity-90">{{ description }}</div>
    </div>
    <button
      @click="$emit('dismiss')"
      class="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ToastVariant } from './use-toast'

interface Props {
  title?: string
  description?: string
  variant?: ToastVariant
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default'
})

defineEmits<{
  dismiss: []
}>()

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'destructive':
      return 'border-destructive bg-destructive text-destructive-foreground'
    default:
      return 'border bg-background text-foreground'
  }
})
</script>

<style scoped>
@keyframes slide-in-from-top {
  from {
    transform: translateY(-100%);
  }
  to {
    transform: translateY(0);
  }
}

.animate-in {
  animation: slide-in-from-top 0.3s ease-out;
}

.slide-in-from-top-full {
  animation-name: slide-in-from-top;
}
</style>

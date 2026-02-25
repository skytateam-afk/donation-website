<template>
  <button
    @click="toggleTheme"
    class="theme-toggle-button"
    :aria-label="`Switch to ${nextTheme} mode`"
    title="Toggle theme"
  >
    <transition name="theme-icon" mode="out-in">
      <component :is="currentIcon" :key="currentTheme" class="theme-icon" />
    </transition>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTheme } from '@/composables/useTheme'
import { Sun, Moon, Monitor } from 'lucide-vue-next'

const { currentTheme, toggleTheme } = useTheme()

const currentIcon = computed(() => {
  switch (currentTheme.value) {
    case 'light':
      return Sun
    case 'dark':
      return Moon
    case 'system':
      return Monitor
    default:
      return Sun
  }
})

const nextTheme = computed(() => {
  switch (currentTheme.value) {
    case 'light':
      return 'dark'
    case 'dark':
      return 'light'
    case 'system':
      return 'light'
    default:
      return 'dark'
  }
})
</script>

<style scoped>
.theme-toggle-button {
  @apply relative flex items-center justify-center w-10 h-10 rounded-lg
    bg-secondary hover:bg-accent transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
    active:scale-95;
}

.theme-icon {
  @apply w-5 h-5 text-foreground;
}

/* Icon transition animations */
.theme-icon-enter-active,
.theme-icon-leave-active {
  transition: all 0.2s ease;
}

.theme-icon-enter-from {
  opacity: 0;
  transform: rotate(-90deg) scale(0.8);
}

.theme-icon-leave-to {
  opacity: 0;
  transform: rotate(90deg) scale(0.8);
}

.theme-icon-enter-to,
.theme-icon-leave-from {
  opacity: 1;
  transform: rotate(0deg) scale(1);
}
</style>

<template>
  <div class="theme-selector">
    <button
      v-for="theme in themes"
      :key="theme.value"
      @click="setTheme(theme.value)"
      :class="[
        'theme-option',
        { 'theme-option-active': currentTheme === theme.value }
      ]"
      :aria-label="`Switch to ${theme.label} mode`"
      :title="theme.label"
    >
      <component :is="theme.icon" class="theme-option-icon" />
      <span class="theme-option-label">{{ theme.label }}</span>
      <div v-if="currentTheme === theme.value" class="theme-option-indicator" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { useTheme } from '@/composables/useTheme'
import { Sun, Moon, Monitor } from 'lucide-vue-next'

const { currentTheme, setTheme } = useTheme()

const themes = [
  { value: 'light' as const, label: 'Light', icon: Sun },
  { value: 'dark' as const, label: 'Dark', icon: Moon },
  { value: 'system' as const, label: 'System', icon: Monitor }
]
</script>

<style scoped>
.theme-selector {
  @apply flex flex-col gap-1 p-2 bg-card rounded-lg border border-border shadow-lg;
  min-width: 160px;
}

.theme-option {
  @apply relative flex items-center gap-3 px-3 py-2 rounded-md
    text-sm font-medium text-foreground
    hover:bg-accent transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
    active:scale-95;
}

.theme-option-active {
  @apply bg-accent;
}

.theme-option-icon {
  @apply w-4 h-4 flex-shrink-0;
}

.theme-option-label {
  @apply flex-1 text-left;
}

.theme-option-indicator {
  @apply w-2 h-2 rounded-full bg-primary flex-shrink-0;
  animation: scaleIn 0.2s ease-out;
}

@keyframes scaleIn {
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
  }
}
</style>

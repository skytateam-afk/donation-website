<template>
  <header class="bg-card/60 backdrop-blur border-b border-border/60 sticky top-0 z-40">
    <div class="max-w-7xl mx-auto px-6 py-4">
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-3">
          <img src="/logo.svg" alt="ReferralAI Logo" class="h-2 w-8" />
          <div>
            <h1 class="text-lg font-semibold tracking-tight text-foreground">{{ title }}</h1>
            <p class="text-xs text-muted-foreground">{{ subtitle }}</p>
          </div>
        </div>
        
        <div class="flex items-center gap-3">
          <!-- Theme Toggle -->
          <ThemeToggle />
          
          <!-- Desktop actions slot -->
          <div class="hidden md:flex items-center gap-3">
            <slot name="desktop-actions" />
          </div>
          
          <!-- Mobile menu button -->
          <button
            @click="$emit('toggle-mobile-menu')"
            class="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
          >
            <svg v-if="!showMobileMenu" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
            <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import ThemeToggle from './ThemeToggle.vue'

defineProps<{
  title: string;
  subtitle: string;
  showMobileMenu: boolean;
}>();

defineEmits<{
  'toggle-mobile-menu': [];
}>();
</script>

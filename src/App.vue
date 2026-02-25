<template>
  <RouterView />
  <Sonner 
    position="top-right" 
    :duration="3000" 
    :visible-toasts="1"
    :close-button="true"
    rich-colors
  />
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useTheme } from '@/composables/useTheme'
import { Sonner } from '@/components/ui/sonner'

// Initialize theme system
useTheme()
</script>

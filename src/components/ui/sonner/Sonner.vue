<script setup lang="ts">
import { Toaster as Sonner } from 'vue-sonner'

const props = defineProps<{
  invert?: boolean
  theme?: 'light' | 'dark' | 'system'
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center'
  hotkey?: string[]
  richColors?: boolean
  expand?: boolean
  duration?: number
  gap?: number
  visibleToasts?: number
  closeButton?: boolean
  toastOptions?: any
  offset?: string | number
  dir?: 'rtl' | 'ltr' | 'auto'
}>()
</script>

<template>
  <Sonner 
    :invert="props.invert"
    :theme="props.theme"
    :position="props.position"
    :hotkey="props.hotkey"
    :rich-colors="props.richColors"
    :expand="props.expand"
    :duration="props.duration"
    :gap="props.gap"
    :visible-toasts="props.visibleToasts"
    :close-button="props.closeButton"
    :toast-options="props.toastOptions"
    :offset="props.offset"
    :dir="props.dir"
  />
</template>

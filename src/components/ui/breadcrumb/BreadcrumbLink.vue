<template>
  <component
    :is="to ? 'router-link' : 'span'"
    :to="to"
    :class="[
      'hover:text-foreground transition-colors',
      to ? 'text-muted-foreground cursor-pointer' : 'text-foreground font-medium'
    ]"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'

interface Props {
  to?: string
}

defineProps<Props>()
</script>

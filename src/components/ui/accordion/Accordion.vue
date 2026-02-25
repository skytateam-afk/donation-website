<script setup lang="ts">
import { AccordionRoot, type AccordionRootProps } from 'radix-vue'
import { cn } from '@/lib/utils'

interface Props extends AccordionRootProps {
  class?: string
}

const props = defineProps<Props>()
</script>

<template>
  <AccordionRoot v-bind="props" :class="cn('w-full', props.class)">
    <slot />
  </AccordionRoot>
</template>

<script setup lang="ts">
import { AccordionItem, type AccordionItemProps } from 'radix-vue'
import { cn } from '@/lib/utils'

interface Props extends AccordionItemProps {
  class?: string
}

const props = defineProps<Props>()
</script>

<template>
  <AccordionItem v-bind="props" :class="cn('border-b', props.class)">
    <slot />
  </AccordionItem>
</template>

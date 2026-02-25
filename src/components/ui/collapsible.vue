<script setup lang="ts">
import { CollapsibleContent, CollapsibleRoot, CollapsibleTrigger, type CollapsibleRootEmits, type CollapsibleRootProps } from 'radix-vue'
import { computed, type HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<CollapsibleRootProps & { class?: HTMLAttributes['class'] }>()
const emits = defineEmits<CollapsibleRootEmits>()

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props

  return delegated
})
</script>

<template>
  <CollapsibleRoot
    v-bind="delegatedProps"
    :class="cn('', props.class)"
    @update:open="emits('update:open', $event)"
  >
    <slot />
  </CollapsibleRoot>
</template>

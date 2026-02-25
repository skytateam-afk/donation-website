<template>
  <div class="grid grid-cols-2 gap-2">
    <div class="space-y-1">
      <Label :for="`${id}-from`" class="text-xs">From</Label>
      <Input
        :id="`${id}-from`"
        type="date"
        :value="fromDate"
        @input="handleFromChange"
        class="w-full"
      />
    </div>
    <div class="space-y-1">
      <Label :for="`${id}-to`" class="text-xs">To</Label>
      <Input
        :id="`${id}-to`"
        type="date"
        :value="toDate"
        @input="handleToChange"
        :min="fromDate"
        class="w-full"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface DateRange {
  from: Date | undefined
  to?: Date | undefined
}

interface Props {
  modelValue?: DateRange
  id?: string
}

interface Emits {
  (e: 'update:modelValue', value: DateRange | undefined): void
}

const props = withDefaults(defineProps<Props>(), {
  id: 'date-range'
})

const emit = defineEmits<Emits>()

// Convert Date to YYYY-MM-DD format for input
const formatDateForInput = (date: Date | undefined): string => {
  if (!date) return ''
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const fromDate = ref(formatDateForInput(props.modelValue?.from))
const toDate = ref(formatDateForInput(props.modelValue?.to))

const handleFromChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  fromDate.value = target.value
  
  // Create date at noon to avoid timezone issues
  const from = target.value ? new Date(target.value + 'T12:00:00') : undefined
  const to = toDate.value ? new Date(toDate.value + 'T12:00:00') : undefined
  
  emit('update:modelValue', { from, to })
}

const handleToChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  toDate.value = target.value
  
  // Create date at noon to avoid timezone issues
  const from = fromDate.value ? new Date(fromDate.value + 'T12:00:00') : undefined
  const to = target.value ? new Date(target.value + 'T12:00:00') : undefined
  
  emit('update:modelValue', { from, to })
}

// Watch for external changes with deep option
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    const newFromDate = formatDateForInput(newValue.from)
    const newToDate = formatDateForInput(newValue.to)
    
    // Only update if values actually changed to avoid infinite loops
    if (newFromDate !== fromDate.value) {
      fromDate.value = newFromDate
    }
    if (newToDate !== toDate.value) {
      toDate.value = newToDate
    }
  }
}, { deep: true, immediate: true })
</script>

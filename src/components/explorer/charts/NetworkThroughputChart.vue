<template>
  <Card class="cursor-pointer hover:shadow-lg transition-shadow" @click="$emit('expand')">
    <CardHeader class="pb-2">
      <div class="flex flex-wrap items-center justify-between">
        <CardTitle class="text-base">Network Throughput</CardTitle>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
        </svg>
      </div>
    </CardHeader>
    <CardContent class="pb-2">
      <div class="h-[180px] w-full overflow-hidden pointer-events-none">
        <VisXYContainer :data="chartData" :height="180" class="max-w-full">
          <VisArea 
            :x="(d: any) => d.time" 
            :y="(d: any) => d.throughput"
            color="hsl(var(--chart-3))"
            :opacity="0.6"
          />
          <VisLine 
            :x="(d: any) => d.time" 
            :y="(d: any) => d.throughput"
            color="hsl(var(--chart-3))"
            :line-width="2"
          />
          <VisAxis type="x" :tick-format="formatTime" :num-ticks="3" />
          <VisAxis type="y" :tick-format="(d: number) => d.toString()" />
          <VisTooltip />
        </VisXYContainer>
      </div>
      <p class="text-xs text-muted-foreground mt-2">
        Combined transactions and blocks per minute indicating overall network performance
      </p>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { VisXYContainer, VisArea, VisLine, VisAxis, VisTooltip } from '@unovis/vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const props = defineProps<{
  txData: Array<{ datetime: string; count: number }>
  blockData: Array<{ datetime: string; count: number }>
}>()

const chartData = computed(() => {
  // Combine tx and block data for throughput
  const dataMap = new Map()
  
  props.txData.forEach(item => {
    const time = new Date(item.datetime).getTime()
    dataMap.set(time, { time, throughput: item.count })
  })
  
  props.blockData.forEach(item => {
    const time = new Date(item.datetime).getTime()
    const existing = dataMap.get(time)
    if (existing) {
      existing.throughput += item.count
    } else {
      dataMap.set(time, { time, throughput: item.count })
    }
  })
  
  return Array.from(dataMap.values()).sort((a, b) => a.time - b.time)
})

function formatTime(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <nav class="flex mb-4" aria-label="Breadcrumb">
    <ol class="inline-flex items-center space-x-1 md:space-x-3">
      <li v-for="(item, index) in items" :key="index" class="inline-flex items-center">
        <ChevronRight v-if="index > 0" class="w-4 h-4 text-gray-400 mx-1" />
        <router-link
          v-if="!item.current"
          :to="item.href"
          class="inline-flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          <component v-if="item.icon" :is="item.icon" class="w-4 h-4 mr-2" />
          {{ item.label }}
        </router-link>
        <span
          v-else
          class="inline-flex items-center text-sm font-medium text-gray-500"
        >
          <component v-if="item.icon" :is="item.icon" class="w-4 h-4 mr-2" />
          {{ item.label }}
        </span>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
import { ChevronRight } from 'lucide-vue-next'
import type { Component } from 'vue'

interface BreadcrumbItem {
  label: string
  href: string
  icon?: Component
  current?: boolean
}

interface Props {
  items: BreadcrumbItem[]
}

defineProps<Props>()
</script>

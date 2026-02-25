<template>
  <div class="max-w-7xl mx-auto px-6 py-3 border-border/60">
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem v-for="(item, index) in items" :key="index">
          <BreadcrumbLink v-if="item.href && index < items.length - 1" :href="item.href" as-child>
            <router-link :to="item.href" class="text-muted-foreground hover:text-foreground transition-colors">
              {{ item.label }}
            </router-link>
          </BreadcrumbLink>
          <BreadcrumbPage v-else class="text-foreground font-medium">
            {{ item.label }}
          </BreadcrumbPage>
          <BreadcrumbSeparator v-if="index < items.length - 1" class="text-muted-foreground" />
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  </div>
</template>

<script setup lang="ts">
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

defineProps<{
  items: BreadcrumbItem[];
}>();
</script>

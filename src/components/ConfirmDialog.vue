<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click.self="$emit('cancel')">
    <div class="bg-card border border-border rounded-xl max-w-md w-full shadow-2xl">
      <div class="p-6 border-b border-border">
        <h2 class="text-xl font-bold text-foreground">{{ title }}</h2>
      </div>

      <div class="p-6">
        <p class="text-muted-foreground">{{ message }}</p>
      </div>

      <div class="flex justify-end gap-3 p-6 border-t border-border">
        <button
          @click="$emit('cancel')"
          class="px-4 py-2 rounded-lg border border-border bg-background text-foreground hover:bg-accent transition-colors font-medium"
        >
          {{ cancelText || 'Cancel' }}
        </button>
        <button
          @click="$emit('confirm')"
          :class="[
            'px-4 py-2 rounded-lg font-medium transition-colors',
            variant === 'danger' 
              ? 'bg-red-600 text-white hover:bg-red-700' 
              : 'bg-primary text-primary-foreground hover:bg-primary/90'
          ]"
        >
          {{ confirmText || 'Confirm' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  show: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger';
}>();

defineEmits<{
  confirm: [];
  cancel: [];
}>();
</script>

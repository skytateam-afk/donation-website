<template>
  <button
    @click="handleClick"
    class="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-secondary text-secondary-foreground hover:bg-accent hover:text-foreground transition-all"
    :title="title"
  >
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
    </svg>
  </button>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

interface Props {
  to?: string;
  title?: string;
}

const props = withDefaults(defineProps<Props>(), {
  to: '/',
  title: 'Go back'
});

const router = useRouter();

const handleClick = () => {
  if (props.to) {
    router.push(props.to);
  } else {
    router.back();
  }
};
</script>

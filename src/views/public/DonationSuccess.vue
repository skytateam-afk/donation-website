<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div class="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
      <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
        <svg class="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      
      <h1 class="text-3xl font-bold text-gray-900 mb-4">Thank You!</h1>
      <p class="text-lg text-gray-600 mb-8">
        Your donation has been successfully processed. You will receive a confirmation email shortly.
      </p>
      
      <div class="space-y-4">
        <router-link
          to="/"
          class="block w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
          Back to Campaigns
        </router-link>
        <button
          @click="shareOnSocial"
          class="block w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-200 transition-colors"
        >
          Share Your Support
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const shareOnSocial = () => {
  // Social sharing functionality will be implemented
  console.log('Share on social media')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div class="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
      <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-6">
        <svg class="h-10 w-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      
      <h1 class="text-3xl font-bold text-gray-900 mb-4">Donation Cancelled</h1>
      <p class="text-lg text-gray-600 mb-8">
        Your donation was cancelled. No charges have been made to your account.
      </p>
      
      <div class="space-y-4">
        <router-link
          to="/"
          class="block w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
          Back to Campaigns
        </router-link>
        <p class="text-sm text-gray-500">
          Need help? Contact us at <a href="mailto:support@crrnetwork.org" class="text-blue-600 hover:underline">support@crrnetwork.org</a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Donation cancelled page
</script>

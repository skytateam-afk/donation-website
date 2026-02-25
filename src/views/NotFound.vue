<template>
  <div class="min-h-screen bg-background flex items-center justify-center px-4">
    <div class="max-w-md w-full text-center">
      <!-- Logo -->
      <div class="flex justify-center mb-8">
        <img src="/logo.svg" alt="CRRNetwork" class="h-16 w-auto" />
      </div>

      <!-- 404 Error -->
      <div class="mb-8">
        <h1 class="text-9xl font-bold text-muted-foreground/20">404</h1>
        <h2 class="mt-4 text-3xl font-bold">Page Not Found</h2>
        <p class="mt-4 text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <Button as-child size="lg">
          <router-link to="/">
            <Home class="mr-2 h-4 w-4" />
            Go Home
          </router-link>
        </Button>
        <Button as-child variant="outline" size="lg">
          <router-link to="/admin/dashboard">
            <LayoutDashboard class="mr-2 h-4 w-4" />
            Admin Dashboard
          </router-link>
        </Button>
      </div>

      <!-- Help Text -->
      <p class="mt-8 text-sm text-muted-foreground">
        Need help? <router-link to="/about" class="text-primary hover:underline">Contact us</router-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Home, LayoutDashboard } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
</script>

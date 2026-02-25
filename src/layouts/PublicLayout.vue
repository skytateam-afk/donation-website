<template>
  <div class="min-h-screen flex flex-col bg-background">
    <!-- Navigation -->
    <header class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div class="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="flex h-16 items-center justify-between">
          <div class="flex items-center">
            <router-link to="/" class="flex items-center space-x-2">
              <img src="/logo.svg" alt="CRRNetwork" class="h-8 w-auto" />
              <span class="hidden font-bold sm:inline-block">CRRNetwork</span>
            </router-link>
          </div>
          
          <!-- Desktop Navigation -->
          <nav class="hidden md:flex items-center space-x-2">
            <Button variant="ghost" as-child>
              <router-link to="/">Home</router-link>
            </Button>
            <Button variant="ghost" as-child>
              <router-link to="/about">About</router-link>
            </Button>
            <Button variant="ghost" as-child>
              <router-link to="/privacy">Privacy</router-link>
            </Button>
            <Button variant="ghost" as-child>
              <router-link to="/terms">Terms</router-link>
            </Button>
            <!-- <Button variant="default" as-child class="ml-4">
              <router-link to="/admin/login">Admin Login</router-link>
            </Button> -->
          </nav>

          <!-- Mobile Menu Button -->
          <button
            @click="toggleMobileMenu"
            class="md:hidden inline-flex items-center justify-center p-2 rounded-md text-foreground hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
            aria-expanded="false"
          >
            <span class="sr-only">Open main menu</span>
            <!-- Hamburger Icon -->
            <svg
              v-if="!mobileMenuOpen"
              class="block h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <!-- Close Icon -->
            <svg
              v-else
              class="block h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Mobile Menu -->
        <div
          v-if="mobileMenuOpen"
          class="md:hidden border-t"
        >
          <div class="px-2 pt-2 pb-3 space-y-1">
            <router-link
              to="/"
              @click="closeMobileMenu"
              class="block px-3 py-2 rounded-md text-base font-medium hover:bg-accent hover:text-accent-foreground"
            >
              Home
            </router-link>
            <router-link
              to="/about"
              @click="closeMobileMenu"
              class="block px-3 py-2 rounded-md text-base font-medium hover:bg-accent hover:text-accent-foreground"
            >
              About
            </router-link>
            <router-link
              to="/privacy"
              @click="closeMobileMenu"
              class="block px-3 py-2 rounded-md text-base font-medium hover:bg-accent hover:text-accent-foreground"
            >
              Privacy
            </router-link>
            <router-link
              to="/terms"
              @click="closeMobileMenu"
              class="block px-3 py-2 rounded-md text-base font-medium hover:bg-accent hover:text-accent-foreground"
            >
              Terms
            </router-link>
            <!-- <router-link
              to="/admin/login"
              @click="closeMobileMenu"
              class="block px-3 py-2 rounded-md text-base font-medium bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Admin Login
            </router-link> -->
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="border-t bg-muted/50 mt-auto">
      <div class="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div class="space-y-3">
            <img src="/logo.svg" alt="CRRNetwork" class="h-8 w-auto" />
            <p class="text-sm text-muted-foreground">
              Making a difference in communities worldwide through compassionate support and sustainable development.
            </p>
          </div>
          
          <div>
            <h3 class="font-semibold mb-4">Quick Links</h3>
            <ul class="space-y-2">
              <li>
                <Button variant="link" as-child class="h-auto p-0 text-sm">
                  <router-link to="/">Home</router-link>
                </Button>
              </li>
              <li>
                <Button variant="link" as-child class="h-auto p-0 text-sm">
                  <router-link to="/about">About Us</router-link>
                </Button>
              </li>
              <li>
                <Button variant="link" as-child class="h-auto p-0 text-sm">
                  <router-link to="/">Browse Campaigns</router-link>
                </Button>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 class="font-semibold mb-4">Legal</h3>
            <ul class="space-y-2">
              <li>
                <Button variant="link" as-child class="h-auto p-0 text-sm">
                  <router-link to="/privacy">Privacy Policy</router-link>
                </Button>
              </li>
              <li>
                <Button variant="link" as-child class="h-auto p-0 text-sm">
                  <router-link to="/terms">Terms of Service</router-link>
                </Button>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 class="font-semibold mb-4">Contact</h3>
            <p class="text-sm text-muted-foreground">
              Email: info@crrnetwork.org
            </p>
          </div>
        </div>
        
        <div class="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {{ new Date().getFullYear() }} CRRNetwork. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'

const mobileMenuOpen = ref(false)

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

const closeMobileMenu = () => {
  mobileMenuOpen.value = false
}
</script>

<template>
  <PublicLayout>
    <!-- Hero Section -->
    <section class="relative bg-primary text-primary-foreground py-40 overflow-hidden">
      <!-- Background Image -->
      <div class="absolute inset-0 z-0">
        <img src="/hero-section.webp" alt="About hero background" class="w-full h-full object-cover" />
        <!-- Overlay -->
        <div class="absolute inset-0 bg-primary/70"></div>
      </div>

      <!-- Content -->
      <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 class="text-4xl md:text-6xl font-bold mb-6">
          About CRRNetwork
        </h1>
        <p class="text-xl md:text-2xl mb-8 opacity-90">
          Empowering communities through transparent and impactful fundraising
        </p>
      </div>
    </section>

    <div class="py-12">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div class="prose prose-lg max-w-none">
          <p class="text-lg text-muted-foreground mb-6">
            CRRNetwork is dedicated to making a positive impact through community-driven fundraising campaigns.
          </p>

          <h2 class="text-2xl font-semibold mt-8 mb-4">Our Mission</h2>
          <p class="text-muted-foreground mb-6">
            We believe in the power of collective action to create meaningful change. Our platform connects 
            passionate individuals with causes that matter, making it easy to support initiatives that align 
            with your values.
          </p>

          <h2 class="text-2xl font-semibold mt-8 mb-4">What We Do</h2>
          <p class="text-muted-foreground mb-6">
            CRRNetwork provides a secure and transparent platform for fundraising campaigns. We enable 
            organizations and individuals to:
          </p>
          <ul class="list-disc pl-6 mb-6 text-muted-foreground space-y-2">
            <li>Launch and manage fundraising campaigns</li>
            <li>Accept one-time and recurring donations</li>
            <li>Track campaign progress in real-time</li>
            <li>Connect with supporters and share updates</li>
            <li>Process secure payments through trusted providers</li>
          </ul>

          <h2 class="text-2xl font-semibold mt-8 mb-4">Our Values</h2>
          <div class="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 class="text-xl font-semibold mb-2">Transparency</h3>
              <p class="text-muted-foreground">
                We believe in complete transparency in how funds are raised and distributed.
              </p>
            </div>
            <div>
              <h3 class="text-xl font-semibold mb-2">Security</h3>
              <p class="text-muted-foreground">
                Your donations are processed securely through industry-leading payment providers.
              </p>
            </div>
            <div>
              <h3 class="text-xl font-semibold mb-2">Community</h3>
              <p class="text-muted-foreground">
                We foster a community of givers and changemakers working together for good.
              </p>
            </div>
            <div>
              <h3 class="text-xl font-semibold mb-2">Impact</h3>
              <p class="text-muted-foreground">
                Every donation makes a real difference in the lives of those we serve.
              </p>
            </div>
          </div>

          <h2 class="text-2xl font-semibold mt-8 mb-4">Get Involved</h2>
          <p class="text-muted-foreground mb-6">
            Whether you're looking to support a cause or start your own campaign, we're here to help. 
            Browse our active campaigns or contact us to learn more about how you can make a difference.
          </p>
        </div>
      </div>
    </div>
  </PublicLayout>
</template>

<script setup lang="ts">
import PublicLayout from '@/layouts/PublicLayout.vue'
</script>

<template>
  <PublicLayout>
    <div class="py-12">
      <div class="max-w-4xl mx-auto">
        <h1 class="text-4xl font-bold mb-8">Privacy Policy</h1>
        
        <div class="prose prose-lg max-w-none">
          <p class="text-sm text-muted-foreground mb-8">Last updated: {{ new Date().toLocaleDateString() }}</p>

          <h2 class="text-2xl font-semibold mt-8 mb-4">Introduction</h2>
          <p class="text-muted-foreground mb-6">
            CRRNetwork ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy 
            explains how we collect, use, disclose, and safeguard your information when you use our donation 
            platform.
          </p>

          <h2 class="text-2xl font-semibold mt-8 mb-4">Information We Collect</h2>
          <h3 class="text-xl font-semibold mt-6 mb-3">Personal Information</h3>
          <p class="text-muted-foreground mb-4">
            When you make a donation or create an account, we may collect:
          </p>
          <ul class="list-disc pl-6 mb-6 text-muted-foreground space-y-2">
            <li>Name and email address</li>
            <li>Payment information (processed securely through our payment providers)</li>
            <li>Donation history and preferences</li>
            <li>Communication preferences</li>
          </ul>

          <h3 class="text-xl font-semibold mt-6 mb-3">Automatically Collected Information</h3>
          <p class="text-muted-foreground mb-4">
            We may automatically collect certain information about your device, including:
          </p>
          <ul class="list-disc pl-6 mb-6 text-muted-foreground space-y-2">
            <li>IP address and browser type</li>
            <li>Operating system and device information</li>
            <li>Usage data and analytics</li>
            <li>Cookies and similar tracking technologies</li>
          </ul>

          <h2 class="text-2xl font-semibold mt-8 mb-4">How We Use Your Information</h2>
          <p class="text-muted-foreground mb-4">We use the information we collect to:</p>
          <ul class="list-disc pl-6 mb-6 text-muted-foreground space-y-2">
            <li>Process your donations and maintain transaction records</li>
            <li>Send you receipts and donation confirmations</li>
            <li>Communicate with you about campaigns and updates</li>
            <li>Improve our platform and user experience</li>
            <li>Comply with legal obligations and prevent fraud</li>
            <li>Provide customer support</li>
          </ul>

          <h2 class="text-2xl font-semibold mt-8 mb-4">Information Sharing</h2>
          <p class="text-muted-foreground mb-6">
            We do not sell your personal information. We may share your information with:
          </p>
          <ul class="list-disc pl-6 mb-6 text-muted-foreground space-y-2">
            <li>Campaign organizers (when you make a donation)</li>
            <li>Payment processors (to process transactions securely)</li>
            <li>Service providers who assist in operating our platform</li>
            <li>Law enforcement when required by law</li>
          </ul>

          <h2 class="text-2xl font-semibold mt-8 mb-4">Data Security</h2>
          <p class="text-muted-foreground mb-6">
            We implement appropriate technical and organizational measures to protect your personal information. 
            However, no method of transmission over the internet is 100% secure, and we cannot guarantee 
            absolute security.
          </p>

          <h2 class="text-2xl font-semibold mt-8 mb-4">Your Rights</h2>
          <p class="text-muted-foreground mb-4">You have the right to:</p>
          <ul class="list-disc pl-6 mb-6 text-muted-foreground space-y-2">
            <li>Access your personal information</li>
            <li>Correct inaccurate information</li>
            <li>Request deletion of your information</li>
            <li>Opt-out of marketing communications</li>
            <li>Withdraw consent where applicable</li>
          </ul>

          <h2 class="text-2xl font-semibold mt-8 mb-4">Cookies</h2>
          <p class="text-muted-foreground mb-6">
            We use cookies and similar tracking technologies to enhance your experience. You can control 
            cookie preferences through your browser settings.
          </p>

          <h2 class="text-2xl font-semibold mt-8 mb-4">Children's Privacy</h2>
          <p class="text-muted-foreground mb-6">
            Our platform is not intended for children under 13. We do not knowingly collect information 
            from children under 13.
          </p>

          <h2 class="text-2xl font-semibold mt-8 mb-4">Changes to This Policy</h2>
          <p class="text-muted-foreground mb-6">
            We may update this Privacy Policy from time to time. We will notify you of any changes by 
            posting the new policy on this page and updating the "Last updated" date.
          </p>

          <h2 class="text-2xl font-semibold mt-8 mb-4">Contact Us</h2>
          <p class="text-muted-foreground mb-6">
            If you have questions about this Privacy Policy, please contact us at privacy@crrnetwork.org
          </p>
        </div>
      </div>
    </div>
  </PublicLayout>
</template>

<script setup lang="ts">
import PublicLayout from '@/layouts/PublicLayout.vue'
</script>

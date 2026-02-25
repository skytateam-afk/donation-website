<template>
  <PublicLayout>
    <div class="py-12">
      <div class="max-w-4xl mx-auto">
        <h1 class="text-4xl font-bold mb-8">Terms of Service</h1>
        
        <div class="prose prose-lg max-w-none">
          <p class="text-sm text-muted-foreground mb-8">Last updated: {{ new Date().toLocaleDateString() }}</p>

          <h2 class="text-2xl font-semibold mt-8 mb-4">Agreement to Terms</h2>
          <p class="text-muted-foreground mb-6">
            By accessing or using CRRNetwork's donation platform, you agree to be bound by these Terms of 
            Service. If you disagree with any part of these terms, you may not access our platform.
          </p>

          <h2 class="text-2xl font-semibold mt-8 mb-4">Use of Platform</h2>
          <h3 class="text-xl font-semibold mt-6 mb-3">Eligibility</h3>
          <p class="text-muted-foreground mb-6">
            You must be at least 18 years old to use our platform. By using our services, you represent 
            and warrant that you meet this age requirement.
          </p>

          <h3 class="text-xl font-semibold mt-6 mb-3">Account Responsibilities</h3>
          <p class="text-muted-foreground mb-4">If you create an account, you are responsible for:</p>
          <ul class="list-disc pl-6 mb-6 text-muted-foreground space-y-2">
            <li>Maintaining the security of your account credentials</li>
            <li>All activities that occur under your account</li>
            <li>Providing accurate and complete information</li>
            <li>Notifying us immediately of any unauthorized access</li>
          </ul>

          <h2 class="text-2xl font-semibold mt-8 mb-4">Donations</h2>
          <h3 class="text-xl font-semibold mt-6 mb-3">Making Donations</h3>
          <p class="text-muted-foreground mb-6">
            All donations made through our platform are voluntary and non-refundable unless required by law. 
            You acknowledge that donations are made at your own discretion and risk.
          </p>

          <h3 class="text-xl font-semibold mt-6 mb-3">Payment Processing</h3>
          <p class="text-muted-foreground mb-6">
            Payments are processed through third-party payment providers. By making a donation, you agree 
            to the terms and conditions of our payment processors.
          </p>

          <h3 class="text-xl font-semibold mt-6 mb-3">Tax Deductibility</h3>
          <p class="text-muted-foreground mb-6">
            We do not provide tax advice. Consult with a tax professional to determine if your donation 
            is tax-deductible in your jurisdiction.
          </p>

          <h2 class="text-2xl font-semibold mt-8 mb-4">Campaign Organizers</h2>
          <p class="text-muted-foreground mb-4">
            Campaign organizers agree to:
          </p>
          <ul class="list-disc pl-6 mb-6 text-muted-foreground space-y-2">
            <li>Provide accurate and truthful information about their campaigns</li>
            <li>Use donated funds for the stated purpose</li>
            <li>Comply with all applicable laws and regulations</li>
            <li>Not engage in fraudulent or misleading activities</li>
            <li>Maintain proper records of fund usage</li>
          </ul>

          <h2 class="text-2xl font-semibold mt-8 mb-4">Prohibited Activities</h2>
          <p class="text-muted-foreground mb-4">You may not:</p>
          <ul class="list-disc pl-6 mb-6 text-muted-foreground space-y-2">
            <li>Use the platform for any illegal purpose</li>
            <li>Engage in fraudulent activities or misrepresentation</li>
            <li>Violate any applicable laws or regulations</li>
            <li>Infringe on intellectual property rights</li>
            <li>Transmit malicious code or viruses</li>
            <li>Attempt to gain unauthorized access to our systems</li>
            <li>Harass, abuse, or harm other users</li>
          </ul>

          <h2 class="text-2xl font-semibold mt-8 mb-4">Intellectual Property</h2>
          <p class="text-muted-foreground mb-6">
            All content on our platform, including text, graphics, logos, and software, is the property 
            of CRRNetwork or its licensors and is protected by copyright and other intellectual property laws.
          </p>

          <h2 class="text-2xl font-semibold mt-8 mb-4">Disclaimer of Warranties</h2>
          <p class="text-muted-foreground mb-6">
            Our platform is provided "as is" without warranties of any kind, either express or implied. 
            We do not guarantee that the platform will be uninterrupted, secure, or error-free.
          </p>

          <h2 class="text-2xl font-semibold mt-8 mb-4">Limitation of Liability</h2>
          <p class="text-muted-foreground mb-6">
            To the maximum extent permitted by law, CRRNetwork shall not be liable for any indirect, 
            incidental, special, consequential, or punitive damages arising from your use of the platform.
          </p>

          <h2 class="text-2xl font-semibold mt-8 mb-4">Indemnification</h2>
          <p class="text-muted-foreground mb-6">
            You agree to indemnify and hold harmless CRRNetwork from any claims, damages, or expenses 
            arising from your use of the platform or violation of these terms.
          </p>

          <h2 class="text-2xl font-semibold mt-8 mb-4">Termination</h2>
          <p class="text-muted-foreground mb-6">
            We reserve the right to terminate or suspend your access to the platform at any time, without 
            prior notice, for conduct that we believe violates these terms or is harmful to other users.
          </p>

          <h2 class="text-2xl font-semibold mt-8 mb-4">Changes to Terms</h2>
          <p class="text-muted-foreground mb-6">
            We may modify these terms at any time. Continued use of the platform after changes constitutes 
            acceptance of the modified terms.
          </p>

          <h2 class="text-2xl font-semibold mt-8 mb-4">Governing Law</h2>
          <p class="text-muted-foreground mb-6">
            These terms shall be governed by and construed in accordance with applicable laws, without 
            regard to conflict of law provisions.
          </p>

          <h2 class="text-2xl font-semibold mt-8 mb-4">Contact Information</h2>
          <p class="text-muted-foreground mb-6">
            For questions about these Terms of Service, please contact us at legal@crrnetwork.org
          </p>
        </div>
      </div>
    </div>
  </PublicLayout>
</template>

<script setup lang="ts">
import PublicLayout from '@/layouts/PublicLayout.vue'
</script>

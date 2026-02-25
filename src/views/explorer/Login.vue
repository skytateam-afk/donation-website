<template>
  <div class="min-h-screen flex items-center justify-center bg-background p-4 relative">
    <!-- Theme Toggle in top-right corner -->
    <div class="absolute top-4 right-4">
      <ThemeToggle />
    </div>
    
    <Card class="w-full max-w-md">
      <div class="p-8">
        <!-- Header -->
        <div class="text-center mb-8">
          <div class="flex justify-center mb-4">
            <img 
              src="/peerpaynetworklight.png" 
              alt="PeerPay Network Logo" 
              class="h-6 w-auto dark:hidden"
            />
            <img 
              src="/peerpaynetworkdark.png" 
              alt="PeerPay Network Logo" 
              class="h-6 w-auto hidden dark:block"
            />
          </div>
          <p class="text-muted-foreground">Sign in to explore your blockchain network</p>
        </div>

        <!-- Login Method Toggle -->
        <div class="flex gap-2 mb-6">
          <Button
            type="button"
            :variant="loginMethod === 'password' ? 'default' : 'outline'"
            class="flex-1"
            @click="loginMethod = 'password'"
          >
            Password
          </Button>
          <Button
            type="button"
            :variant="loginMethod === 'otp' ? 'default' : 'outline'"
            class="flex-1"
            @click="loginMethod = 'otp'"
          >
            Email OTP
          </Button>
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage" class="mb-6 p-4 bg-destructive/10 border border-destructive rounded-lg">
          <p class="text-sm text-destructive">{{ errorMessage }}</p>
        </div>

        <!-- Success Message -->
        <div v-if="successMessage" class="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p class="text-sm text-green-600 dark:text-green-400">{{ successMessage }}</p>
        </div>

        <!-- Password Login Form -->
        <form v-if="loginMethod === 'password'" @submit.prevent="handleLogin" class="space-y-6">
          <!-- Network Selection -->
          <div class="space-y-2">
            <label for="network" class="text-sm font-medium">Network</label>
            <select
              id="network"
              v-model="credentials.network"
              class="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              required
            >
              <option value="" disabled>Select a network</option>
              <option v-for="network in authStore.networks" :key="network.id" :value="network.id">
                {{ network.name }}
              </option>
            </select>
          </div>

          <!-- Username or Email -->
          <div class="space-y-2">
            <label for="username" class="text-sm font-medium">Email or Username</label>
            <input
              id="username"
              v-model="credentials.user"
              type="text"
              placeholder="Enter your email or username"
              class="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              required
            />
          </div>

          <!-- Password -->
          <div class="space-y-2">
            <label for="password" class="text-sm font-medium">Password</label>
            <div class="relative">
              <input
                id="password"
                v-model="credentials.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Enter your password"
                class="w-full px-3 py-2 pr-10 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabindex="-1"
              >
                <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Submit Button -->
          <Button
            type="submit"
            class="w-full"
            :disabled="authStore.loading || !credentials.network || !credentials.user || !credentials.password"
          >
            <span v-if="authStore.loading">Signing in...</span>
            <span v-else>Sign In</span>
          </Button>
        </form>

        <!-- OTP Login Form -->
        <form v-else @submit.prevent="handleOTPSubmit" class="space-y-6">
          <!-- Network Selection -->
          <div class="space-y-2">
            <label for="otp-network" class="text-sm font-medium">Network</label>
            <select
              id="otp-network"
              v-model="otpCredentials.network"
              class="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              required
            >
              <option value="" disabled>Select a network</option>
              <option v-for="network in authStore.networks" :key="network.id" :value="network.id">
                {{ network.name }}
              </option>
            </select>
          </div>

          <!-- Email -->
          <div class="space-y-2">
            <label for="email" class="text-sm font-medium">Email</label>
            <input
              id="email"
              v-model="otpCredentials.email"
              type="email"
              placeholder="Enter your email"
              class="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              :disabled="otpSent"
              required
            />
          </div>

          <!-- OTP Input (shown after OTP is sent) -->
          <div v-if="otpSent" class="space-y-2">
            <label for="otp" class="text-sm font-medium">Enter OTP</label>
            <input
              id="otp"
              v-model="otpCredentials.otp"
              type="text"
              placeholder="Enter 6-digit code"
              maxlength="6"
              pattern="\d{6}"
              class="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-center text-2xl tracking-widest font-mono"
              required
            />
            <p class="text-xs text-muted-foreground text-center">
              Code expires in {{ Math.floor(otpTimer / 60) }}:{{ String(otpTimer % 60).padStart(2, '0') }}
            </p>
          </div>

          <!-- Submit Button -->
          <Button
            v-if="!otpSent"
            type="submit"
            class="w-full"
            :disabled="loading || !otpCredentials.network || !otpCredentials.email"
          >
            <span v-if="loading">Sending OTP...</span>
            <span v-else>Send OTP</span>
          </Button>

          <Button
            v-else
            type="submit"
            class="w-full"
            :disabled="loading || !otpCredentials.otp || otpCredentials.otp.length !== 6"
          >
            <span v-if="loading">Verifying...</span>
            <span v-else>Verify & Sign In</span>
          </Button>

          <!-- Resend OTP -->
          <div v-if="otpSent" class="text-center">
            <button
              type="button"
              @click="handleResendOTP"
              :disabled="otpTimer > 0 || loading"
              class="text-sm text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ otpTimer > 0 ? 'Resend OTP' : 'Resend OTP' }}
            </button>
          </div>
        </form>

        <!-- Footer -->
        <div class="mt-6 text-center text-sm text-muted-foreground">
          <p>Peerpay Blockchain Explorer v{{ version }}</p>
          <p><i>Peerpay SaaS</i></p>
        </div>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import ThemeToggle from '@/components/ThemeToggle.vue'
import type { LoginCredentials } from '@/types/blockchain'
import axios from 'axios'

const router = useRouter()
const authStore = useAuthStore()
const version = import.meta.env.VITE_APP_VERSION || '1.0.0'

// Login method toggle
const loginMethod = ref<'password' | 'otp'>('password')

// Password login credentials
const credentials = ref<LoginCredentials>({
  user: '',
  password: '',
  network: ''
})

// OTP login credentials
const otpCredentials = ref({
  email: '',
  otp: '',
  network: ''
})

// OTP state
const otpSent = ref(false)
const otpTimer = ref(0)
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const showPassword = ref(false)
let timerInterval: number | null = null

// Fetch available networks on mount
onMounted(async () => {
  await authStore.fetchNetworks()
  
  // Set default network if only one available
  if (authStore.networks.length === 1) {
    credentials.value.network = authStore.networks[0].id
    otpCredentials.value.network = authStore.networks[0].id
  }
})

// Cleanup timer on unmount
onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval)
  }
})

// Handle password login
async function handleLogin() {
  try {
    errorMessage.value = ''
    const success = await authStore.login(credentials.value)
    
    if (success) {
      await new Promise(resolve => setTimeout(resolve, 100))
      await router.replace('/dashboard')
    } else {
      // Display the error from auth store
      errorMessage.value = authStore.error || 'Login failed'
    }
  } catch (error: any) {
    console.error('Login navigation error:', error)
    // Display specific error message from backend
    errorMessage.value = error.response?.data?.message || authStore.error || 'Login failed'
  }
}

// Handle OTP form submission
async function handleOTPSubmit() {
  if (!otpSent.value) {
    await requestOTP()
  } else {
    await verifyOTP()
  }
}

// Request OTP
async function requestOTP() {
  try {
    loading.value = true
    errorMessage.value = ''
    successMessage.value = ''

    const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/request-otp`, {
      email: otpCredentials.value.email,
      network: otpCredentials.value.network
    })

    if (response.data.success) {
      otpSent.value = true
      successMessage.value = response.data.message
      otpTimer.value = response.data.expiresIn || 600
      startTimer()
    } else {
      // Handle unsuccessful response
      errorMessage.value = response.data.message || 'Failed to send OTP'
    }
  } catch (error: any) {
    // Display specific error message from backend (e.g., "Account is deactivated")
    errorMessage.value = error.response?.data?.message || 'Failed to send OTP'
  } finally {
    loading.value = false
  }
}

// Verify OTP and login
async function verifyOTP() {
  try {
    loading.value = true
    errorMessage.value = ''

    const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/verify-otp`, {
      email: otpCredentials.value.email,
      otp: otpCredentials.value.otp,
      network: otpCredentials.value.network
    })

    if (response.data.success) {
      // Store token and user data using the auth store
      authStore.token = response.data.token
      authStore.user = {
        id: response.data.user?.id,
        username: response.data.user?.username || '',
        email: response.data.user?.email,
        role: response.data.user?.role,
        networkName: otpCredentials.value.network || 'peerpay-network'
      }
      
      // Save to localStorage (using the same keys as the auth store)
      localStorage.setItem('fabric_explorer_token', response.data.token)
      localStorage.setItem('fabric_explorer_user', JSON.stringify(authStore.user))

      // Navigate to dashboard
      await new Promise(resolve => setTimeout(resolve, 100))
      await router.replace('/dashboard')
    } else {
      // Handle unsuccessful response
      errorMessage.value = response.data.message || 'Verification failed'
    }
  } catch (error: any) {
    // Display specific error message from backend (e.g., "Account is deactivated")
    errorMessage.value = error.response?.data?.message || 'Invalid OTP'
  } finally {
    loading.value = false
  }
}

// Resend OTP
async function handleResendOTP() {
  otpCredentials.value.otp = ''
  otpSent.value = false
  await requestOTP()
}

// Start countdown timer
function startTimer() {
  if (timerInterval) {
    clearInterval(timerInterval)
  }
  
  timerInterval = setInterval(() => {
    if (otpTimer.value > 0) {
      otpTimer.value--
    } else {
      if (timerInterval) {
        clearInterval(timerInterval)
      }
    }
  }, 1000) as unknown as number
}
</script>

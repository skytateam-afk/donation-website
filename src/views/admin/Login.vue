<template>
  <div class="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
    <Card class="w-full max-w-md">
      <CardHeader class="space-y-1 text-center">
        <div class="flex justify-center mb-4">
          <img src="/logo.svg" alt="CRRNetwork" class="h-16 w-auto" />
        </div>
        <CardTitle class="text-3xl font-bold">Admin Login</CardTitle>
        <CardDescription>
          Sign in to manage campaigns and donations
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <!-- Login Method Tabs -->
        <div class="flex space-x-2 mb-6">
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

        <!-- Password Login Form -->
        <form v-if="loginMethod === 'password'" @submit.prevent="handleLogin" class="space-y-4">
          <div class="space-y-2">
            <Label for="email">Email address</Label>
            <Input
              id="email"
              v-model="form.email"
              name="email"
              type="email"
              autocomplete="email"
              required
              placeholder="admin@crrnetwork.org"
              :disabled="loading"
            />
          </div>

          <div class="space-y-2">
            <Label for="password">Password</Label>
            <div class="relative">
              <Input
                id="password"
                v-model="form.password"
                name="password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                required
                placeholder="••••••••"
                :disabled="loading"
                class="pr-10"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                :disabled="loading"
              >
                <Eye v-if="!showPassword" class="h-4 w-4" />
                <EyeOff v-else class="h-4 w-4" />
              </button>
            </div>
          </div>

          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <input
                id="remember-me"
                v-model="form.rememberMe"
                name="remember-me"
                type="checkbox"
                class="h-4 w-4 rounded border-input"
                :disabled="loading"
              />
              <Label for="remember-me" class="text-sm font-normal cursor-pointer">
                Remember me
              </Label>
            </div>

            <Button 
              variant="link" 
              type="button" 
              class="px-0 h-auto text-sm"
              @click="showForgotPassword = true"
            >
              Forgot password?
            </Button>
          </div>

          <Button
            type="submit"
            :disabled="loading"
            class="w-full"
          >
            <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
            <Lock v-else class="mr-2 h-4 w-4" />
            {{ loading ? 'Signing in...' : 'Sign in' }}
          </Button>
        </form>

        <!-- OTP Login Form -->
        <form v-else @submit.prevent="handleOTPLogin" class="space-y-4">
          <div v-if="!otpSent" class="space-y-4">
            <div class="space-y-2">
              <Label for="otp-email">Email address</Label>
              <Input
                id="otp-email"
                v-model="otpForm.email"
                name="email"
                type="email"
                autocomplete="email"
                required
                placeholder="admin@crrnetwork.org"
                :disabled="loading"
              />
            </div>

            <Button
              type="submit"
              :disabled="loading"
              class="w-full"
            >
              <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
              Send OTP Code
            </Button>
          </div>

          <div v-else class="space-y-4">
            <div class="space-y-2">
              <Label for="otp-code">Enter OTP Code</Label>
              <Input
                id="otp-code"
                v-model="otpForm.code"
                name="otp"
                type="text"
                inputmode="numeric"
                pattern="[0-9]*"
                maxlength="6"
                required
                placeholder="000000"
                :disabled="loading"
                class="text-center text-2xl tracking-widest"
              />
              <p class="text-xs text-gray-600 text-center">
                We sent a 6-digit code to {{ otpForm.email }}
              </p>
            </div>

            <Button
              type="submit"
              :disabled="loading"
              class="w-full "
            >
              <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
              Verify & Sign in
            </Button>

            <Button
              type="button"
              variant="outline"
              class="w-full"
              @click="resendOTP"
              :disabled="loading || resendCooldown > 0"
            >
              {{ resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code' }}
            </Button>

            <Button
              type="button"
              variant="link"
              class="w-full"
              @click="otpSent = false; otpForm.code = ''"
            >
              Change Email
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>

    <!-- Forgot Password Dialog -->
    <Dialog v-model:open="showForgotPassword">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
          <DialogDescription>
            Enter your email address and we'll send you a link to reset your password.
          </DialogDescription>
        </DialogHeader>
        <form @submit.prevent="handleForgotPassword" class="space-y-4">
          <div class="space-y-2">
            <Label for="reset-email">Email address</Label>
            <Input
              id="reset-email"
              v-model="resetEmail"
              type="email"
              placeholder="admin@crrnetwork.org"
              required
              :disabled="resetLoading"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              @click="showForgotPassword = false"
              :disabled="resetLoading"
            >
              Cancel
            </Button>
            <Button type="submit" :disabled="resetLoading">
              <Loader2 v-if="resetLoading" class="mr-2 h-4 w-4 animate-spin" />
              Send Reset Link
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Lock, Loader2, Eye, EyeOff } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useSonner } from '@/composables/useSonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { success, error } = useSonner()

const loading = ref(false)
const showPassword = ref(false)
const showForgotPassword = ref(false)
const resetEmail = ref('')
const resetLoading = ref(false)
const loginMethod = ref<'password' | 'otp'>('password')
const otpSent = ref(false)
const resendCooldown = ref(0)

const form = ref({
  email: '',
  password: '',
  rememberMe: false
})

const otpForm = ref({
  email: '',
  code: ''
})

const handleLogin = async () => {
  if (!form.value.email || !form.value.password) {
    error('Please fill in all fields')
    return
  }

  loading.value = true

  try {
    await authStore.login({
      email: form.value.email,
      password: form.value.password
    })

    success('Login successful!')
    // Redirect to intended page or dashboard
    const redirect = route.query.redirect as string
    router.push(redirect || '/admin/dashboard')
  } catch (err: any) {
    console.error('Login error:', err)
    // Only show error if auth store didn't already show one
    if (!err.response?.data?.message) {
      error('Login failed. Please check your credentials.')
    }
  } finally {
    loading.value = false
  }
}

const handleOTPLogin = async () => {
  if (!otpSent.value) {
    // Send OTP
    if (!otpForm.value.email) {
      error('Please enter your email address')
      return
    }

    loading.value = true
    try {
      // TODO: Implement actual OTP send API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      otpSent.value = true
      success('OTP sent!', 'Check your email for the verification code.')
      startResendCooldown()
    } catch (err: any) {
      console.error('OTP send error:', err)
      error(err.response?.data?.message || 'Failed to send OTP. Please try again.')
    } finally {
      loading.value = false
    }
  } else {
    // Verify OTP
    if (!otpForm.value.code || otpForm.value.code.length !== 6) {
      error('Please enter a valid 6-digit code')
      return
    }

    loading.value = true
    try {
      // TODO: Implement actual OTP verification API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      success('Login successful!')
      const redirect = route.query.redirect as string
      router.push(redirect || '/admin/dashboard')
    } catch (err: any) {
      console.error('OTP verification error:', err)
      error(err.response?.data?.message || 'Invalid OTP code. Please try again.')
    } finally {
      loading.value = false
    }
  }
}

const resendOTP = async () => {
  loading.value = true
  try {
    // TODO: Implement actual OTP resend API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    success('OTP resent!', 'Check your email for the new verification code.')
    startResendCooldown()
  } catch (err: any) {
    console.error('OTP resend error:', err)
    error(err.response?.data?.message || 'Failed to resend OTP. Please try again.')
  } finally {
    loading.value = false
  }
}

const startResendCooldown = () => {
  resendCooldown.value = 60
  const interval = setInterval(() => {
    resendCooldown.value--
    if (resendCooldown.value <= 0) {
      clearInterval(interval)
    }
  }, 1000)
}

const handleForgotPassword = async () => {
  if (!resetEmail.value) {
    error('Please enter your email address')
    return
  }

  resetLoading.value = true

  try {
    // TODO: Implement actual password reset API call
    // await authStore.requestPasswordReset(resetEmail.value)
    
    // Simulating API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    success('Password reset link sent!', 'Check your email for instructions to reset your password.')
    showForgotPassword.value = false
    resetEmail.value = ''
  } catch (err: any) {
    console.error('Password reset error:', err)
    error(err.response?.data?.message || 'Failed to send reset link. Please try again.')
  } finally {
    resetLoading.value = false
  }
}
</script>

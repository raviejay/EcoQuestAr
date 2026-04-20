<template>
  <div class="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center px-4">
    <div class="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">

      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-2xl mb-4">
          <span class="text-3xl">♻️</span>
        </div>
        <h1 class="text-2xl font-bold text-gray-900">Join EcoQuest AR</h1>
        <p class="text-gray-500 text-sm mt-1">Create your account and start questing</p>
      </div>

      <!-- Success -->
      <div v-if="registered" class="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
        ✅ Account created! Check your email to confirm, then <RouterLink to="/login" class="underline font-medium">sign in</RouterLink>.
      </div>

      <!-- Error -->
      <div v-if="authStore.error" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
        {{ authStore.error }}
      </div>

      <!-- Form -->
      <div v-if="!registered" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Username</label>
          <input
            v-model="form.username"
            type="text"
            placeholder="EcoHero123"
            class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            v-model="form.email"
            type="email"
            placeholder="you@example.com"
            class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            v-model="form.password"
            type="password"
            placeholder="Min. 8 characters"
            class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
          <input
            v-model="form.confirmPassword"
            type="password"
            placeholder="••••••••"
            class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
            @keyup.enter="handleRegister"
          />
          <p v-if="passwordMismatch" class="text-red-500 text-xs mt-1">Passwords do not match.</p>
        </div>

        <button
          @click="handleRegister"
          :disabled="authStore.loading || passwordMismatch"
          class="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-semibold py-2.5 rounded-lg transition duration-200"
        >
          <span v-if="authStore.loading">Creating account...</span>
          <span v-else>Create Account</span>
        </button>
      </div>

      <p class="text-center text-sm text-gray-500 mt-6">
        Already have an account?
        <RouterLink to="/login" class="text-green-600 font-medium hover:underline">Sign in</RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/modules/auth/store/authStore.js'

const authStore = useAuthStore()
const registered = ref(false)

const form = reactive({ username: '', email: '', password: '', confirmPassword: '' })

const passwordMismatch = computed(() =>
  form.confirmPassword.length > 0 && form.password !== form.confirmPassword
)

async function handleRegister() {
  if (!form.username || !form.email || !form.password) return
  if (passwordMismatch.value) return
  authStore.clearError()
  try {
    await authStore.register({
      username: form.username,
      email: form.email,
      password: form.password
    })
    registered.value = true
  } catch {
    // error shown via authStore.error
  }
}
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center px-4 py-8"
    style="background: linear-gradient(135deg, #6EAE21 0%, #086A9C 100%)">
    <div class="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">

      <div class="flex flex-col items-center mb-6">
        <img src="/logo.png" alt="EcoQuest Logo" class="h-14 mb-2 object-contain"
          onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'" />
        <div class="hidden w-14 h-14 rounded-2xl items-center justify-center mb-2" style="background:#6EAE21">
          <span class="text-2xl">♻️</span>
        </div>
        <h1 class="text-xl font-black" style="color:#086A9C">Create Account</h1>
        <p class="text-gray-400 text-xs mt-0.5">Join EcoQuest AR at CSU</p>
      </div>

      <div v-if="registered" class="mb-4 p-3 rounded-xl text-sm bg-green-50 border border-green-200 text-green-700">
        ✅ Account created! Check your email, then <RouterLink to="/login" class="underline font-semibold">sign in</RouterLink>.
      </div>
      <div v-if="authStore.error" class="mb-4 p-3 rounded-xl text-sm bg-red-50 border border-red-200 text-red-700">
        {{ authStore.error }}
      </div>

      <div v-if="!registered" class="space-y-3">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">Username</label>
          <input v-model="form.username" type="text" placeholder="EcoHero123"
            class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 transition" />
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">School ID <span class="text-gray-400 font-normal">(optional)</span></label>
          <input v-model="form.schoolId" type="text" placeholder="211-00282"
            class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 transition font-mono" />
          <p class="text-gray-400 text-xs mt-0.5">Allows login using your ID number</p>
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">Email</label>
          <input v-model="form.email" type="email" placeholder="you@csu.edu.ph"
            class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 transition" />
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">Password</label>
          <input v-model="form.password" type="password" placeholder="Min. 8 characters"
            class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 transition" />
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">Confirm Password</label>
          <input v-model="form.confirmPassword" type="password" placeholder="••••••••"
            class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 transition"
            @keyup.enter="handleRegister" />
          <p v-if="passwordMismatch" class="text-red-500 text-xs mt-1">Passwords do not match</p>
        </div>

        <button @click="handleRegister" :disabled="authStore.loading || passwordMismatch"
          class="w-full text-white font-bold py-3.5 rounded-2xl transition disabled:opacity-50 shadow-lg mt-2"
          style="background: linear-gradient(90deg, #6EAE21, #086A9C)">
          {{ authStore.loading ? 'Creating...' : 'Create Account' }}
        </button>
      </div>

      <p class="text-center text-sm text-gray-500 mt-5">
        Already have an account?
        <RouterLink to="/login" class="font-bold" style="color:#086A9C">Sign in</RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/modules/auth/store/authStore.js'

const authStore  = useAuthStore()
const registered = ref(false)
const form = reactive({ username: '', schoolId: '', email: '', password: '', confirmPassword: '' })
const passwordMismatch = computed(() => form.confirmPassword.length > 0 && form.password !== form.confirmPassword)

async function handleRegister() {
  if (!form.username || !form.email || !form.password || passwordMismatch.value) return
  authStore.clearError()
  try {
    await authStore.register({ username: form.username, email: form.email, password: form.password, schoolId: form.schoolId })
    registered.value = true
  } catch { /* shown via authStore.error */ }
}
</script>
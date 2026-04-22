<template>
  <div class="min-h-screen flex flex-col items-center justify-center px-4"
    style="background: linear-gradient(135deg, #6EAE21 0%, #086A9C 100%)">

    <div class="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">

      <!-- Logo -->
      <div class="flex flex-col items-center mb-8">
        <img src="/logo.svg" alt="EcoQuest Logo" class="h-16 mb-3 object-contain"
          onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'" />
        <!-- Fallback logo -->
        <div class="hidden w-16 h-16 rounded-2xl items-center justify-center mb-3"
          style="background:#6EAE21">
          <span class="text-3xl">♻️</span>
        </div>
        <!-- <h1 class="text-2xl font-black" style="color:#086A9C">EcoQuest AR</h1> -->
        <p class="text-gray-400 text-sm mt-0.5">Caraga State University</p>
      </div>

      <!-- Login method toggle -->
      <div class="flex bg-gray-100 rounded-2xl p-1 mb-6">
        <button
          @click="loginMode = 'email'"
          :class="loginMode === 'email' ? 'bg-white shadow text-gray-800' : 'text-gray-400'"
          class="flex-1 py-2 rounded-xl text-sm font-bold transition"
        >📧 Email</button>
        <button
          @click="loginMode = 'id'"
          :class="loginMode === 'id' ? 'bg-white shadow text-gray-800' : 'text-gray-400'"
          class="flex-1 py-2 rounded-xl text-sm font-bold transition"
        >🪪 School ID</button>
      </div>

      <!-- Error -->
      <div v-if="authStore.error" class="mb-4 p-3 rounded-xl text-sm text-red-700 bg-red-50 border border-red-200">
        {{ authStore.error }}
      </div>

      <!-- Email login -->
      <div v-if="loginMode === 'email'" class="space-y-4">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">Email</label>
          <input v-model="form.email" type="email" placeholder="you@csu.edu.ph"
            class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition"
            style="--tw-ring-color:#6EAE21" @keyup.enter="handleLogin" />
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">Password</label>
          <input v-model="form.password" type="password" placeholder="••••••••"
            class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 transition"
            @keyup.enter="handleLogin" />
        </div>
      </div>

      <!-- School ID login -->
      <div v-else class="space-y-4">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">School ID</label>
          <input v-model="form.schoolId" type="text" placeholder="211-00282"
            class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 transition font-mono"
            @keyup.enter="handleLogin" />
          <p class="text-gray-400 text-xs mt-1">Format: 211-00282</p>
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">Password</label>
          <input v-model="form.password" type="password" placeholder="••••••••"
            class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 transition"
            @keyup.enter="handleLogin" />
        </div>
      </div>

      <button
        @click="handleLogin"
        :disabled="authStore.loading"
        class="w-full mt-6 text-white font-bold py-3.5 rounded-2xl transition disabled:opacity-50 shadow-lg"
        style="background: linear-gradient(90deg, #6EAE21, #086A9C)"
      >
        {{ authStore.loading ? 'Signing in...' : 'Sign In' }}
      </button>

      <p class="text-center text-sm text-gray-500 mt-5">
        Don't have an account?
        <RouterLink to="/register" class="font-bold" style="color:#086A9C">Register</RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '@/modules/auth/store/authStore.js'

const authStore = useAuthStore()
const router    = useRouter()
const loginMode = ref('email')
const form      = reactive({ email: '', password: '', schoolId: '' })

async function handleLogin() {
  authStore.clearError()
  try {
    if (loginMode.value === 'id') {
      await authStore.loginBySchoolId({ schoolId: form.schoolId, password: form.password })
    } else {
      await authStore.login({ email: form.email, password: form.password })
    }
    router.push('/dashboard')
  } catch { /* shown via authStore.error */ }
}
</script>
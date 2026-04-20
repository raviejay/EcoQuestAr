<template>
  <div class="p-6">
    <h2 class="text-2xl font-bold text-gray-800 mb-1">Welcome back,</h2>
    <p class="text-green-600 font-semibold text-lg mb-6">{{ authStore.displayName }} 🌿</p>

    <div class="grid grid-cols-2 gap-4 mb-6">
      <div class="bg-white rounded-xl shadow p-4 text-center">
        <p class="text-3xl font-bold text-green-600">{{ authStore.profile?.points ?? 0 }}</p>
        <p class="text-gray-500 text-sm mt-1">Total Points</p>
      </div>
      <div class="bg-white rounded-xl shadow p-4 text-center">
        <p class="text-3xl font-bold text-blue-500">{{ authStore.profile?.level ?? 1 }}</p>
        <p class="text-gray-500 text-sm mt-1">Level</p>
      </div>
    </div>

    <div class="bg-green-50 border border-green-200 rounded-xl p-4">
      <p class="text-green-800 font-medium text-sm">🎯 Daily Mission</p>
      <p class="text-green-700 text-sm mt-1">Detect 5 pieces of trash using your camera to earn bonus points!</p>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/modules/auth/store/authStore.js'
const authStore = useAuthStore()
</script>

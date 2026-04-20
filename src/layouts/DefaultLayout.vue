<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">

    <!-- Top Nav -->
    <header class="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
      <div class="flex items-center gap-2">
        <span class="text-xl">♻️</span>
        <span class="font-bold text-green-700 text-lg">EcoQuest</span>
      </div>
      <div class="flex items-center gap-3">
        <span class="text-sm text-gray-600">{{ authStore.displayName }}</span>
        <button @click="handleLogout" class="text-sm text-red-500 hover:text-red-700 font-medium transition">
          Logout
        </button>
      </div>
    </header>

    <!-- Page Content -->
    <main class="flex-1 pb-20">
      <RouterView />
    </main>

  <!-- Bottom Nav -->
    <nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center py-2 z-10">
      <RouterLink to="/dashboard" class="flex flex-col items-center gap-0.5 text-xs px-3" active-class="text-green-600" inactive-class="text-gray-400">
        <span class="text-xl">🏠</span>Home
      </RouterLink>
      <RouterLink to="/camera" class="flex flex-col items-center gap-0.5 text-xs px-3" active-class="text-green-600" inactive-class="text-gray-400">
        <span class="text-xl">📷</span>Scan
      </RouterLink>
      <RouterLink to="/leaderboard" class="flex flex-col items-center gap-0.5 text-xs px-3" active-class="text-green-600" inactive-class="text-gray-400">
        <span class="text-xl">🏆</span>Ranks
      </RouterLink>
      <RouterLink to="/rewards" class="flex flex-col items-center gap-0.5 text-xs px-3" active-class="text-green-600" inactive-class="text-gray-400">
        <span class="text-xl">🎁</span>Rewards
      </RouterLink>
      <RouterLink to="/map" class="flex flex-col items-center gap-0.5 text-xs px-3" active-class="text-green-600" inactive-class="text-gray-400">
        <span class="text-xl">🗺️</span>Map
      </RouterLink>
    </nav>
  </div>
</template>

<script setup>
import { RouterView, RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/modules/auth/store/authStore.js'

const authStore = useAuthStore()
const router = useRouter()

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}
</script>

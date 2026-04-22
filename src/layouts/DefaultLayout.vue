<template>
  <div class="min-h-screen flex flex-col" style="background:#f0f7e6">

    <!-- Top Nav -->
    <header class="bg-white border-b border-gray-100 px-4 py-2.5 flex items-center justify-between sticky top-0 z-10 shadow-sm">
      <div class="flex items-center gap-2">
        <!-- Logo image, falls back to text if missing -->
        <img src="/logo.svg" alt="EcoQuest" class="h-9 object-contain"
          onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'" />
        <div class="hidden items-center gap-1.5">
          <span class="text-xl">♻️</span>
          <span class="font-black text-lg" style="color:#6EAE21">EcoQuest</span>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <div class="text-right">
          <p class="text-xs font-bold text-gray-700">{{ authStore.displayName }}</p>
          <p class="text-xs" style="color:#6EAE21">Lv.{{ authStore.profile?.level ?? 1 }} · {{ authStore.profile?.points ?? 0 }} pts</p>
        </div>
        <button @click="handleLogout"
          class="text-xs font-bold px-3 py-1.5 rounded-xl transition"
          style="background:#fff0f0;color:#ef4444">
          Logout
        </button>
      </div>
    </header>

    <!-- Page Content -->
  <main class="flex-1 pb-20 min-h-0 flex flex-col">
  <RouterView class="flex-1 min-h-0" />
</main>

    <!-- Bottom Nav -->
    <nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around items-center py-2 z-10 shadow-lg">
      <RouterLink to="/dashboard"
        class="flex flex-col items-center gap-0.5 text-xs px-2 py-1 rounded-xl transition"
        :class="isActive('/dashboard') ? 'font-bold' : 'text-gray-400'"
        :style="isActive('/dashboard') ? 'color:#6EAE21' : ''">
        <span class="text-xl">🏠</span>Home
      </RouterLink>
      <RouterLink to="/camera"
        class="flex flex-col items-center gap-0.5 text-xs px-2 py-1 rounded-xl transition"
        :class="isActive('/camera') ? 'font-bold' : 'text-gray-400'"
        :style="isActive('/camera') ? 'color:#6EAE21' : ''">
        <span class="text-xl">📷</span>Scan
      </RouterLink>
      <RouterLink to="/leaderboard"
        class="flex flex-col items-center gap-0.5 text-xs px-2 py-1 rounded-xl transition"
        :class="isActive('/leaderboard') ? 'font-bold' : 'text-gray-400'"
        :style="isActive('/leaderboard') ? 'color:#6EAE21' : ''">
        <span class="text-xl">🏆</span>Ranks
      </RouterLink>
      <RouterLink to="/rewards"
        class="flex flex-col items-center gap-0.5 text-xs px-2 py-1 rounded-xl transition"
        :class="isActive('/rewards') ? 'font-bold' : 'text-gray-400'"
        :style="isActive('/rewards') ? 'color:#6EAE21' : ''">
        <span class="text-xl">🎁</span>Rewards
      </RouterLink>
      <RouterLink to="/map"
        class="flex flex-col items-center gap-0.5 text-xs px-2 py-1 rounded-xl transition"
        :class="isActive('/map') ? 'font-bold' : 'text-gray-400'"
        :style="isActive('/map') ? 'color:#6EAE21' : ''">
        <span class="text-xl">🗺️</span>Map
      </RouterLink>
      <RouterLink v-if="authStore.profile?.is_admin" to="/admin"
        class="flex flex-col items-center gap-0.5 text-xs px-2 py-1 rounded-xl transition"
        :class="isActive('/admin') ? 'font-bold' : 'text-gray-400'"
        :style="isActive('/admin') ? 'color:#086A9C' : ''">
        <span class="text-xl">🛡️</span>Admin
      </RouterLink>
    </nav>

  </div>
</template>

<script setup>
import { RouterView, RouterLink, useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/modules/auth/store/authStore.js'

const authStore = useAuthStore()
const router    = useRouter()
const route     = useRoute()

function isActive(path) { return route.path === path }

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}
</script>
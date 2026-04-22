<template>
  <div class="min-h-screen flex flex-col" style="background:#f0f7e6">

    <!-- Top Nav -->
    <header class="bg-white border-b border-gray-100 px-4 py-2.5 flex items-center justify-between sticky top-0 z-10 shadow-sm">
      <div class="flex items-center gap-2">
        <img src="/logo.svg" alt="EcoQuest" class="h-9 object-contain"
          onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'" />
        <div class="hidden items-center gap-1.5">
          <span class="text-xl">♻️</span>
          <span class="font-black text-lg" style="color:#6EAE21">EcoQuest</span>
        </div>
      </div>

      <!-- Avatar + Dropdown -->
      <div class="relative" ref="dropdownRef">
        <button @click="toggleDropdown"
    class="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center text-white font-bold text-sm shadow-sm transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2"
    style="background:#6EAE21; ring-color:#6EAE21">
    <img
      v-if="authStore.profile?.avatar_url"
      :src="authStore.profile.avatar_url"
      class="w-full h-full object-cover"
      alt="avatar"
    />
    <span v-else>{{ avatarInitial }}</span>
  </button>

        <!-- Dropdown Menu -->
        <transition name="dropdown">
          <div v-if="isOpen"
            class="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden z-50">
            <!-- Profile Info -->
            <div class="px-4 py-3 border-b border-gray-100">
              <p class="text-sm font-bold text-gray-800 truncate">{{ authStore.displayName }}</p>
              <p class="text-xs mt-0.5" style="color:#6EAE21">
                Lv.{{ authStore.profile?.level ?? 1 }} · {{ authStore.profile?.points ?? 0 }} pts
              </p>
            </div>
            <!-- Actions -->
            <RouterLink to="/profile"
              @click="isOpen = false"
              class="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition">
              <span>👤</span> Profile
            </RouterLink>
            <button @click="handleLogout"
              class="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition hover:bg-red-50"
              style="color:#ef4444">
              <span>🚪</span> Logout
            </button>
          </div>
        </transition>
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { RouterView, RouterLink, useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/modules/auth/store/authStore.js'

const authStore = useAuthStore()
const router    = useRouter()
const route     = useRoute()

const isOpen     = ref(false)
const dropdownRef = ref(null)

const avatarInitial = computed(() => {
  const name = authStore.displayName || ''
  return name.charAt(0).toUpperCase() || '?'
})

function isActive(path) { return route.path === path }

function toggleDropdown() { isOpen.value = !isOpen.value }

function handleClickOutside(e) {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target)) {
    isOpen.value = false
  }
}

onMounted(() => document.addEventListener('mousedown', handleClickOutside))
onUnmounted(() => document.removeEventListener('mousedown', handleClickOutside))

async function handleLogout() {
  isOpen.value = false
  await authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.97);
}
</style>
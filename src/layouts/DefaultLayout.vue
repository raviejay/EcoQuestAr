<template>
  <div class="min-h-screen flex flex-col" style="background:#f0f7e6">

    <!-- Top Nav -->
    <header class="bg-white border-b border-gray-100 px-4 py-2.5 flex items-center justify-between sticky top-0 z-10 shadow-sm">
      <div class="flex items-center gap-2">
        <img src="/logo.svg" alt="EcoQuest" class="h-9 object-contain"
          onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'" />
        <div class="hidden items-center gap-1.5">
          <span class="material-symbols-rounded logo-icon">eco</span>
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
              <span class="material-symbols-rounded dropdown-icon">account_circle</span>
              Profile
            </RouterLink>
            <button @click="handleLogout"
              class="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition hover:bg-red-50"
              style="color:#ef4444">
              <span class="material-symbols-rounded dropdown-icon">logout</span>
              Logout
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
        class="nav-item flex flex-col items-center gap-0.5 text-xs px-3 py-1 rounded-xl transition-all"
        :class="isActive('/dashboard') ? 'nav-active' : 'nav-inactive'">
        <span class="material-symbols-rounded nav-icon">home</span>
        Home
      </RouterLink>

      <RouterLink to="/camera"
        class="nav-item flex flex-col items-center gap-0.5 text-xs px-3 py-1 rounded-xl transition-all"
        :class="isActive('/camera') ? 'nav-active' : 'nav-inactive'">
        <span class="material-symbols-rounded nav-icon">photo_camera</span>
        Scan
      </RouterLink>

      <RouterLink to="/leaderboard"
        class="nav-item flex flex-col items-center gap-0.5 text-xs px-3 py-1 rounded-xl transition-all"
        :class="isActive('/leaderboard') ? 'nav-active' : 'nav-inactive'">
        <span class="material-symbols-rounded nav-icon">emoji_events</span>
        Ranks
      </RouterLink>

      <RouterLink to="/rewards"
        class="nav-item flex flex-col items-center gap-0.5 text-xs px-3 py-1 rounded-xl transition-all"
        :class="isActive('/rewards') ? 'nav-active' : 'nav-inactive'">
        <span class="material-symbols-rounded nav-icon">card_giftcard</span>
        Rewards
      </RouterLink>

      <RouterLink to="/map"
        class="nav-item flex flex-col items-center gap-0.5 text-xs px-3 py-1 rounded-xl transition-all"
        :class="isActive('/map') ? 'nav-active' : 'nav-inactive'">
        <span class="material-symbols-rounded nav-icon">map</span>
        Map
      </RouterLink>

      <RouterLink v-if="authStore.profile?.is_admin" to="/admin"
        class="nav-item flex flex-col items-center gap-0.5 text-xs px-3 py-1 rounded-xl transition-all"
        :class="isActive('/admin') ? 'nav-admin-active' : 'nav-inactive'">
        <span class="material-symbols-rounded nav-icon">admin_panel_settings</span>
        Admin
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

const isOpen      = ref(false)
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
/* ── Material Symbols font ─────────────────────────────────── */
/* Add this import to your main CSS / index.html <head> instead if preferred */
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200');

/* ── Icon base styles ─────────────────────────────────────── */
.material-symbols-rounded {
  font-family: 'Material Symbols Rounded', sans-serif;
  font-style: normal;
  font-weight: normal;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  display: inline-block;
  white-space: nowrap;
  direction: ltr;
  -webkit-font-smoothing: antialiased;
  /* Variable font axes: filled, weight 300, optical 24 */
  font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24;
}

/* ── Logo icon ────────────────────────────────────────────── */
.logo-icon {
  font-size: 22px;
  color: #6EAE21;
  font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}

/* ── Dropdown icons ───────────────────────────────────────── */
.dropdown-icon {
  font-size: 18px;
  font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20;
}

/* ── Nav icons ────────────────────────────────────────────── */
.nav-icon {
  font-size: 24px;
  transition: font-variation-settings 0.2s ease, transform 0.2s ease;
}

/* Inactive state — light weight, unfilled */
.nav-inactive {
  color: #b0bec5;
}
.nav-inactive .nav-icon {
  font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24;
}

/* Active state — filled, heavier weight, brand green */
.nav-active {
  color: #6EAE21;
  font-weight: 700;
}
.nav-active .nav-icon {
  font-variation-settings: 'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24;
  transform: translateY(-1px);
  filter: drop-shadow(0 2px 4px rgba(110,174,33,0.25));
}

/* Admin active state — brand blue */
.nav-admin-active {
  color: #086A9C;
  font-weight: 700;
}
.nav-admin-active .nav-icon {
  font-variation-settings: 'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24;
  transform: translateY(-1px);
  filter: drop-shadow(0 2px 4px rgba(8,106,156,0.25));
}

/* ── Dropdown transition ──────────────────────────────────── */
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
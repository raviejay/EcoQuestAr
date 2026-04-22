<template>
  <div class="min-h-screen pb-6" style="background:#f0f7e6">

    <!-- Header -->
    <div class="px-4 pt-10 pb-6 text-white" style="background: linear-gradient(135deg, #6EAE21, #086A9C)">
      <div class="flex items-center justify-between mb-4">
        <div>
          <p class="text-sm opacity-80">Welcome back,</p>
         <p class="text-xl font-black flex items-center gap-2 flex-wrap">
            {{ authStore.displayName }}

            <span
              v-if="authStore.profile?.school_id"
              class="text-xs font-bold px-2 py-0.5 rounded-full bg-white/20 border border-white/30 backdrop-blur"
            >
              {{ authStore.profile.school_id }}
            </span>

            🌿
          </p>
        </div>
        <!-- <img src="/logo.png" alt="Logo" class="h-10 object-contain"
          onerror="this.style.display='none'" /> -->
      </div>

      <!-- Stats row -->
      <div class="grid grid-cols-3 gap-2">
        <div class="bg-white/20 rounded-2xl p-3 text-center">
          <p class="text-2xl font-black">{{ authStore.profile?.points ?? 0 }}</p>
          <p class="text-xs opacity-80">Points</p>
        </div>
        <div class="bg-white/20 rounded-2xl p-3 text-center">
          <p class="text-2xl font-black">{{ authStore.profile?.level ?? 1 }}</p>
          <p class="text-xs opacity-80">Level</p>
        </div>
        <div class="bg-white/20 rounded-2xl p-3 text-center">
          <p class="text-2xl font-black">{{ pendingCount }}</p>
          <p class="text-xs opacity-80">Pending</p>
        </div>
      </div>
    </div>

    <!-- Level progress bar -->
    <div class="mx-4 mt-4 bg-white rounded-2xl p-4 shadow-sm">
      <div class="flex justify-between text-xs text-gray-500 mb-1">
        <span>Level {{ authStore.profile?.level ?? 1 }}</span>
        <span>{{ pointsToNextLevel }} pts to next level</span>
      </div>
      <div class="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <div class="h-full rounded-full transition-all duration-500" :style="{ width: levelProgress + '%', background: '#6EAE21' }" />
      </div>
    </div>

    <!-- Daily mission -->
    <div class="mx-4 mt-3 rounded-2xl p-4 text-white" style="background:linear-gradient(90deg,#086A9C,#6DCEDA)">
      <p class="font-bold text-sm">🎯 Daily Mission</p>
      <p class="text-sm mt-1 opacity-90">Detect and dispose 5 trash items to earn +100 bonus points!</p>
    </div>

    <!-- Quick actions -->
    <div class="mx-4 mt-4 grid grid-cols-2 gap-3">
      <RouterLink to="/camera" class="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3 active:scale-95 transition">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style="background:#e8f5d0">📷</div>
        <div><p class="font-bold text-sm text-gray-800">Scan Trash</p><p class="text-xs text-gray-400">Earn points</p></div>
      </RouterLink>
      <RouterLink to="/leaderboard" class="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3 active:scale-95 transition">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style="background:#e0f0f8">🏆</div>
        <div><p class="font-bold text-sm text-gray-800">Leaderboard</p><p class="text-xs text-gray-400">See rankings</p></div>
      </RouterLink>
      <RouterLink to="/rewards" class="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3 active:scale-95 transition">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style="background:#e0f8fa">🎁</div>
        <div><p class="font-bold text-sm text-gray-800">Rewards</p><p class="text-xs text-gray-400">Redeem points</p></div>
      </RouterLink>
      <RouterLink to="/map" class="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3 active:scale-95 transition">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style="background:#f0e8ff">🗺️</div>
        <div><p class="font-bold text-sm text-gray-800">Hotspot Map</p><p class="text-xs text-gray-400">CSU Campus</p></div>
      </RouterLink>
    </div>

    <!-- IEC Materials -->
    <div class="mt-6 px-4">
      <div class="flex items-center justify-between mb-3">
        <h2 class="font-black text-gray-800 text-base">📢 IEC Materials</h2>
        <span class="text-xs text-gray-400">Info & Education</span>
      </div>

      <div v-if="loadingIEC" class="flex justify-center py-6">
        <div class="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style="border-color:#6EAE21; border-top-color:transparent" />
      </div>

      <div v-else-if="iecMaterials.length" class="space-y-3">
        <div v-for="mat in iecMaterials" :key="mat.id"
          class="bg-white rounded-2xl overflow-hidden shadow-sm active:scale-98 transition cursor-pointer"
          @click="selectedIEC = mat">
          <img :src="mat.image_url" :alt="mat.title" class="w-full h-40 object-cover" />
          <div class="p-3">
            <div class="flex items-center gap-2 mb-1">
              <span
                :style="mat.type === 'announcement' ? 'background:#086A9C' : mat.type === 'poster' ? 'background:#6EAE21' : 'background:#6DCEDA; color:#333'"
                class="text-white text-xs font-bold px-2 py-0.5 rounded-full capitalize">{{ mat.type }}</span>
            </div>
            <p class="font-bold text-gray-800 text-sm">{{ mat.title }}</p>
            <p class="text-gray-500 text-xs mt-0.5 line-clamp-2">{{ mat.description }}</p>
          </div>
        </div>
      </div>

      <div v-else class="bg-white rounded-2xl p-6 text-center text-gray-400">
        <span class="text-4xl block mb-2">📋</span>
        <p class="text-sm">No IEC materials yet</p>
      </div>
    </div>

    <!-- IEC Fullscreen viewer -->
    <div v-if="selectedIEC" class="fixed inset-0 z-50 bg-black flex flex-col">
      <div class="px-4 pt-10 pb-3 flex items-center gap-3" style="background:#111">
        <button @click="selectedIEC = null" class="text-gray-400 text-2xl">←</button>
        <p class="text-white font-bold flex-1 truncate">{{ selectedIEC.title }}</p>
      </div>
      <img :src="selectedIEC.image_url" :alt="selectedIEC.title" class="flex-1 object-contain" />
      <div class="px-4 py-4 bg-gray-900">
        <p class="text-white font-bold">{{ selectedIEC.title }}</p>
        <p class="text-gray-400 text-sm mt-1">{{ selectedIEC.description }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/modules/auth/store/authStore.js'
import { supabase } from '@/services/supabase/client.js'

const authStore   = useAuthStore()
const iecMaterials = ref([])
const loadingIEC  = ref(true)
const selectedIEC = ref(null)
const pendingCount = ref(0)

const levelProgress = computed(() => {
  const pts = authStore.profile?.points ?? 0
  return Math.min(((pts % 500) / 500) * 100, 100)
})
const pointsToNextLevel = computed(() => {
  const pts = authStore.profile?.points ?? 0
  return 500 - (pts % 500)
})

async function loadIEC() {
  loadingIEC.value = true
  const { data } = await supabase.from('iec_materials').select('*').eq('is_active', true).order('created_at', { ascending: false })
  iecMaterials.value = data ?? []
  loadingIEC.value = false
}

async function loadPendingCount() {
  if (!authStore.user?.id) return
  const { count } = await supabase.from('submissions').select('*', { count: 'exact', head: true })
    .eq('user_id', authStore.user.id).eq('status', 'pending')
  pendingCount.value = count ?? 0
}

onMounted(() => { loadIEC(); loadPendingCount() })
</script>
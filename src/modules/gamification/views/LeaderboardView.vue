<template>
  <div class="min-h-screen pb-6" style="background:#0d1f06">

    <!-- Header -->
    <div class="px-4 pt-10 pb-4 flex items-center justify-between" style="background:#0d1f06">
      <div>
        <p class="text-xs font-bold uppercase tracking-widest" style="color:#6DCEDA">Rankings</p>
        <h1 class="text-2xl font-black text-white mt-0.5">Leaderboard 🏆</h1>
      </div>
      <img src="/logo2.png" alt="logo" class="h-9 object-contain" onerror="this.style.display='none'" />
    </div>

    <!-- My rank card -->
    <div v-if="myRankData" class="mx-4 mb-4 rounded-2xl p-4 flex items-center gap-4"
      style="background:linear-gradient(135deg,#6EAE21,#086A9C)">
      <div class="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl font-black"
        style="background:rgba(255,255,255,0.2)">#{{ myRankData.rank }}</div>
      <div class="flex-1">
        <p class="text-white font-black text-lg">{{ authStore.displayName }}</p>
        <p class="text-xs mt-0.5" style="color:#a8f0c0">Lv.{{ myRankData.level }} · {{ myRankData.points.toLocaleString() }} pts</p>
      </div>
      <span class="text-3xl">{{ rankEmoji(myRankData.rank) }}</span>
    </div>

    <!-- Loading -->
    <div v-if="store.loading" class="flex justify-center py-16">
      <div class="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin" style="border-color:#6EAE21;border-top-color:transparent"/>
    </div>

    <!-- Podium -->
    <div v-if="!store.loading && top3.length" class="px-6 mb-5">
      <div class="flex items-end justify-center gap-3">
        <!-- 2nd -->
        <div v-if="top3[1]" class="flex-1 flex flex-col items-center gap-1">
          <div class="w-12 h-12 rounded-full flex items-center justify-center font-black text-lg border-2 border-gray-500" style="background:#374151;color:#9ca3af">
            {{ top3[1].username?.charAt(0).toUpperCase() }}</div>
          <p class="text-xs text-gray-400 font-semibold truncate max-w-[72px] text-center">{{ top3[1].username }}</p>
          <p class="text-xs text-gray-500">{{ top3[1].points.toLocaleString() }}</p>
          <div class="w-full rounded-t-xl flex items-center justify-center text-2xl h-14" style="background:#1f2937">🥈</div>
        </div>
        <!-- 1st -->
        <div v-if="top3[0]" class="flex-1 flex flex-col items-center gap-1">
          <div class="relative">
            <div class="absolute -inset-1 rounded-full animate-pulse" style="background:#6EAE2140"/>
            <div class="relative w-16 h-16 rounded-full flex items-center justify-center font-black text-2xl border-4" style="background:#6EAE21;border-color:#a8f060;color:white">
              {{ top3[0].username?.charAt(0).toUpperCase() }}</div>
          </div>
          <p class="text-xs font-black truncate max-w-[80px] text-center" style="color:#6EAE21">{{ top3[0].username }}</p>
          <p class="text-xs font-bold" style="color:#6EAE21">{{ top3[0].points.toLocaleString() }}</p>
          <div class="w-full rounded-t-xl flex items-center justify-center text-3xl h-20" style="background:linear-gradient(180deg,#6EAE2130,#1a2f0a)">🥇</div>
        </div>
        <!-- 3rd -->
        <div v-if="top3[2]" class="flex-1 flex flex-col items-center gap-1">
          <div class="w-12 h-12 rounded-full flex items-center justify-center font-black text-lg border-2" style="background:#374151;border-color:#92400e;color:#d97706">
            {{ top3[2].username?.charAt(0).toUpperCase() }}</div>
          <p class="text-xs text-gray-400 font-semibold truncate max-w-[72px] text-center">{{ top3[2].username }}</p>
          <p class="text-xs text-gray-500">{{ top3[2].points.toLocaleString() }}</p>
          <div class="w-full rounded-t-xl flex items-center justify-center text-xl h-10" style="background:#1f2937">🥉</div>
        </div>
      </div>
    </div>

    <!-- Rest of list -->
    <div class="px-4 space-y-2">
      <div v-for="entry in rest" :key="entry.id"
        :class="entry.id === authStore.user?.id ? 'border' : ''"
        :style="entry.id === authStore.user?.id ? 'background:#6EAE2115;border-color:#6EAE2150' : 'background:#111a09'"
        class="flex items-center gap-3 rounded-2xl px-4 py-3">
        <span class="text-gray-500 font-black w-6 text-center text-sm">#{{ entry.rank }}</span>
        <div class="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
          style="background:#1a2f0a;color:#6EAE21">
          {{ entry.username?.charAt(0).toUpperCase() }}</div>
        <div class="flex-1 min-w-0">
          <p class="font-semibold text-sm text-white truncate">
            {{ entry.username }}
            <span v-if="entry.id === authStore.user?.id" class="text-xs ml-1" style="color:#6EAE21">(you)</span>
          </p>
          <p class="text-xs text-gray-500">Level {{ entry.level }}</p>
        </div>
        <div class="text-right">
          <p class="font-black text-sm" style="color:#6EAE21">{{ entry.points.toLocaleString() }}</p>
          <p class="text-gray-600 text-xs">pts</p>
        </div>
      </div>

      <div v-if="!store.loading && !store.leaderboard.length" class="text-center py-12 text-gray-600">
        <p class="text-4xl mb-3">🌱</p><p>No entries yet. Be the first!</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useAuthStore } from '@/modules/auth/store/authStore.js'
import { useGamificationStore } from '@/modules/gamification/store/gamificationStore.js'
const authStore = useAuthStore()
const store = useGamificationStore()
const top3 = computed(() => store.leaderboard.slice(0,3))
const rest = computed(() => store.leaderboard.slice(3))
const myRankData = computed(() => store.userRank)
function rankEmoji(r) { return r===1?'👑':r<=3?'🔥':r<=10?'⭐':'🌱' }
onMounted(async () => {
  await store.fetchLeaderboard()
  if (authStore.user?.id) await store.fetchUserRank(authStore.user.id)
})
</script>
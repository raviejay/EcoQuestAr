<template>
  <div class="min-h-screen bg-gray-950 text-white pb-24">

    <!-- Header -->
    <div class="bg-gradient-to-b from-yellow-500/20 to-gray-950 px-4 pt-10 pb-6 text-center">
      <h1 class="text-2xl font-black tracking-tight">🏆 Leaderboard</h1>
      <p class="text-gray-400 text-sm mt-1">Top Eco Warriors on Campus</p>
    </div>

    <!-- My Rank Card -->
    <div v-if="myRankData" class="mx-4 mb-6 bg-gradient-to-r from-green-600 to-emerald-500 rounded-2xl p-4 flex items-center gap-4 shadow-lg">
      <div class="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl font-black">
        #{{ myRankData.rank }}
      </div>
      <div class="flex-1">
        <p class="font-bold text-lg">{{ authStore.displayName }}</p>
        <p class="text-green-100 text-sm">Level {{ myRankData.level }} · {{ myRankData.points }} pts</p>
      </div>
      <div class="text-3xl">{{ rankEmoji(myRankData.rank) }}</div>
    </div>

    <!-- Loading -->
    <div v-if="store.loading" class="flex justify-center py-12">
      <div class="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
    </div>

    <!-- Top 3 Podium -->
    <div v-if="!store.loading && top3.length" class="flex items-end justify-center gap-3 px-6 mb-6">
      <!-- 2nd -->
      <div v-if="top3[1]" class="flex-1 flex flex-col items-center gap-1">
        <div class="w-14 h-14 rounded-full bg-gray-600 flex items-center justify-center text-xl font-black border-4 border-gray-400">
          {{ top3[1].username?.charAt(0).toUpperCase() }}
        </div>
        <p class="text-xs text-gray-300 font-semibold truncate max-w-[80px] text-center">{{ top3[1].username }}</p>
        <p class="text-xs text-gray-400">{{ top3[1].points }}pts</p>
        <div class="w-full bg-gray-600 rounded-t-lg h-16 flex items-center justify-center text-2xl">🥈</div>
      </div>
      <!-- 1st -->
      <div v-if="top3[0]" class="flex-1 flex flex-col items-center gap-1">
        <div class="w-16 h-16 rounded-full bg-yellow-500 flex items-center justify-center text-2xl font-black border-4 border-yellow-300 shadow-lg shadow-yellow-500/30">
          {{ top3[0].username?.charAt(0).toUpperCase() }}
        </div>
        <p class="text-xs text-yellow-300 font-bold truncate max-w-[80px] text-center">{{ top3[0].username }}</p>
        <p class="text-xs text-yellow-400 font-bold">{{ top3[0].points }}pts</p>
        <div class="w-full bg-yellow-500/30 border border-yellow-500/50 rounded-t-lg h-24 flex items-center justify-center text-3xl">🥇</div>
      </div>
      <!-- 3rd -->
      <div v-if="top3[2]" class="flex-1 flex flex-col items-center gap-1">
        <div class="w-12 h-12 rounded-full bg-orange-800 flex items-center justify-center text-lg font-black border-4 border-orange-600">
          {{ top3[2].username?.charAt(0).toUpperCase() }}
        </div>
        <p class="text-xs text-gray-300 font-semibold truncate max-w-[80px] text-center">{{ top3[2].username }}</p>
        <p class="text-xs text-gray-400">{{ top3[2].points }}pts</p>
        <div class="w-full bg-orange-800/40 rounded-t-lg h-10 flex items-center justify-center text-xl">🥉</div>
      </div>
    </div>

    <!-- Rest of leaderboard -->
    <div class="px-4 space-y-2">
      <div
        v-for="entry in rest"
        :key="entry.id"
        :class="entry.id === authStore.user?.id ? 'border border-green-500/50 bg-green-900/20' : 'bg-gray-800/60'"
        class="flex items-center gap-3 rounded-xl px-4 py-3"
      >
        <span class="text-gray-400 font-bold w-6 text-center text-sm">#{{ entry.rank }}</span>
        <div class="w-9 h-9 rounded-full bg-gray-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
          {{ entry.username?.charAt(0).toUpperCase() }}
        </div>
        <div class="flex-1 min-w-0">
          <p class="font-semibold text-sm truncate">
            {{ entry.username }}
            <span v-if="entry.id === authStore.user?.id" class="text-green-400 text-xs ml-1">(you)</span>
          </p>
          <p class="text-gray-400 text-xs">Level {{ entry.level }}</p>
        </div>
        <div class="text-right">
          <p class="text-green-400 font-bold text-sm">{{ entry.points.toLocaleString() }}</p>
          <p class="text-gray-500 text-xs">pts</p>
        </div>
      </div>

      <div v-if="!store.loading && !store.leaderboard.length" class="text-center py-12 text-gray-500">
        <p class="text-4xl mb-3">🌱</p>
        <p>No entries yet. Be the first!</p>
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

const top3 = computed(() => store.leaderboard.slice(0, 3))
const rest = computed(() => store.leaderboard.slice(3))
const myRankData = computed(() => store.userRank)

function rankEmoji(rank) {
  if (rank === 1) return '👑'
  if (rank <= 3) return '🔥'
  if (rank <= 10) return '⭐'
  return '🌱'
}

onMounted(async () => {
  await store.fetchLeaderboard()
  if (authStore.user?.id) await store.fetchUserRank(authStore.user.id)
})
</script>
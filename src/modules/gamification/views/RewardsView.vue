<template>
  <div class="min-h-screen bg-gray-950 text-white pb-24">

    <!-- Header -->
    <div class="bg-gradient-to-b from-purple-500/20 to-gray-950 px-4 pt-10 pb-6">
      <h1 class="text-2xl font-black tracking-tight text-center">🎁 Rewards Shop</h1>
      <div class="mt-3 bg-gray-800 rounded-2xl px-4 py-3 flex items-center justify-between">
        <div>
          <p class="text-gray-400 text-xs">Your Balance</p>
          <p class="text-green-400 text-2xl font-black">{{ authStore.profile?.points ?? 0 }} <span class="text-sm font-normal text-gray-400">pts</span></p>
        </div>
        <div class="text-right">
          <p class="text-gray-400 text-xs">Level</p>
          <p class="text-white text-2xl font-black">{{ authStore.profile?.level ?? 1 }}</p>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex px-4 gap-2 mb-4">
      <button
        @click="tab = 'shop'"
        :class="tab === 'shop' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'"
        class="flex-1 py-2 rounded-xl text-sm font-bold transition"
      >🛒 Shop</button>
      <button
        @click="tab = 'history'; loadHistory()"
        :class="tab === 'history' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'"
        class="flex-1 py-2 rounded-xl text-sm font-bold transition"
      >📜 History</button>
    </div>

    <!-- Shop Tab -->
    <div v-if="tab === 'shop'" class="px-4 space-y-3">
      <div v-if="store.loading" class="flex justify-center py-12">
        <div class="w-10 h-10 border-4 border-purple-400 border-t-transparent rounded-full animate-spin" />
      </div>

      <div
        v-for="reward in store.rewards"
        :key="reward.id"
        class="bg-gray-800 rounded-2xl p-4 flex items-center gap-4"
      >
        <div class="w-14 h-14 rounded-2xl bg-gray-700 flex items-center justify-center text-3xl flex-shrink-0">
          {{ reward.icon }}
        </div>
        <div class="flex-1 min-w-0">
          <p class="font-bold text-sm">{{ reward.title }}</p>
          <p class="text-gray-400 text-xs mt-0.5 line-clamp-2">{{ reward.description }}</p>
          <div class="flex items-center gap-2 mt-1">
            <span class="text-green-400 font-bold text-sm">{{ reward.cost }} pts</span>
            <span v-if="reward.stock > 0" class="text-gray-500 text-xs">· {{ reward.stock }} left</span>
            <span v-if="reward.stock === 0" class="text-red-400 text-xs font-semibold">· Out of stock</span>
          </div>
        </div>
        <button
          @click="handleRedeem(reward)"
          :disabled="!canAfford(reward) || reward.stock === 0 || redeeming === reward.id"
          :class="canAfford(reward) && reward.stock !== 0
            ? 'bg-purple-600 hover:bg-purple-500 text-white'
            : 'bg-gray-700 text-gray-500 cursor-not-allowed'"
          class="px-3 py-2 rounded-xl text-xs font-bold transition flex-shrink-0"
        >
          <span v-if="redeeming === reward.id">...</span>
          <span v-else-if="!canAfford(reward)">Need<br>{{ reward.cost - (authStore.profile?.points ?? 0) }} more</span>
          <span v-else>Redeem</span>
        </button>
      </div>
    </div>

    <!-- History Tab -->
    <div v-if="tab === 'history'" class="px-4 space-y-3">
      <div v-if="store.loading" class="flex justify-center py-12">
        <div class="w-10 h-10 border-4 border-purple-400 border-t-transparent rounded-full animate-spin" />
      </div>
      <div v-for="r in store.myRedemptions" :key="r.id" class="bg-gray-800 rounded-2xl p-4 flex items-center gap-3">
        <span class="text-2xl">{{ r.rewards?.icon }}</span>
        <div class="flex-1">
          <p class="font-semibold text-sm">{{ r.rewards?.title }}</p>
          <p class="text-gray-400 text-xs">{{ formatDate(r.redeemed_at) }}</p>
        </div>
        <span class="text-red-400 font-bold text-sm">-{{ r.rewards?.cost }} pts</span>
      </div>
      <div v-if="!store.loading && !store.myRedemptions.length" class="text-center py-12 text-gray-500">
        <p class="text-4xl mb-3">🎁</p>
        <p>No redemptions yet</p>
      </div>
    </div>

    <!-- Success Toast -->
    <transition name="slide-up">
      <div v-if="successMsg" class="fixed bottom-28 left-1/2 -translate-x-1/2 bg-green-600 text-white px-5 py-3 rounded-2xl shadow-xl z-50 whitespace-nowrap font-semibold">
        ✅ {{ successMsg }}
      </div>
    </transition>

    <!-- Error Toast -->
    <transition name="slide-up">
      <div v-if="errorMsg" class="fixed bottom-28 left-1/2 -translate-x-1/2 bg-red-600 text-white px-5 py-3 rounded-2xl shadow-xl z-50 whitespace-nowrap font-semibold">
        ❌ {{ errorMsg }}
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/modules/auth/store/authStore.js'
import { useGamificationStore } from '@/modules/gamification/store/gamificationStore.js'

const authStore = useAuthStore()
const store = useGamificationStore()

const tab = ref('shop')
const redeeming = ref(null)
const successMsg = ref(null)
const errorMsg = ref(null)
let toastTimer = null

function canAfford(reward) {
  return (authStore.profile?.points ?? 0) >= reward.cost
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
}

async function loadHistory() {
  if (authStore.user?.id) await store.fetchMyRedemptions(authStore.user.id)
}

async function handleRedeem(reward) {
  redeeming.value = reward.id
  try {
    const result = await store.redeemReward(authStore.user.id, reward.id)
    if (result?.success) {
      authStore.profile.points -= reward.cost
      showToast('success', `${reward.icon} ${reward.title} redeemed!`)
    } else {
      showToast('error', result?.error ?? 'Redemption failed')
    }
  } catch (err) {
    showToast('error', err.message)
  } finally {
    redeeming.value = null
  }
}

function showToast(type, msg) {
  clearTimeout(toastTimer)
  if (type === 'success') { successMsg.value = msg; errorMsg.value = null }
  else { errorMsg.value = msg; successMsg.value = null }
  toastTimer = setTimeout(() => { successMsg.value = null; errorMsg.value = null }, 3000)
}

onMounted(() => store.fetchRewards())
</script>

<style scoped>
.slide-up-enter-active, .slide-up-leave-active { transition: all 0.3s ease; }
.slide-up-enter-from, .slide-up-leave-to { opacity: 0; transform: translateX(-50%) translateY(12px); }
</style>
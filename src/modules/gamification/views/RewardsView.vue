<template>
  <div class="min-h-screen pb-6" style="background:#06101a">

    <!-- Header -->
    <div class="px-4 pt-10 pb-4 flex items-center justify-between" style="background:#06101a">
      <div>
        <p class="text-xs font-bold uppercase tracking-widest" style="color:#6DCEDA">Redeem</p>
        <h1 class="text-2xl font-black text-white mt-0.5">Rewards Shop 🎁</h1>
      </div>
      <img src="/logo2.png" alt="logo" class="h-9 object-contain" onerror="this.style.display='none'" />
    </div>

    <!-- Balance card -->
    <div class="mx-4 mb-4 rounded-2xl p-4 flex items-center justify-between"
      style="background:linear-gradient(135deg,#086A9C,#6DCEDA30);border:1px solid #086A9C60">
      <div>
        <p class="text-xs text-gray-400">Your Balance</p>
        <p class="text-3xl font-black mt-0.5" style="color:#6DCEDA">
          {{ authStore.profile?.points ?? 0 }}<span class="text-sm font-normal text-gray-400 ml-1">pts</span>
        </p>
      </div>
      <div class="text-right">
        <p class="text-xs text-gray-400">Level</p>
        <p class="text-3xl font-black text-white">{{ authStore.profile?.level ?? 1 }}</p>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex px-4 gap-2 mb-4">
      <button @click="tab='shop'"
        :style="tab==='shop' ? 'background:#086A9C' : 'background:#0d1f2d'"
        class="flex-1 py-2.5 rounded-2xl text-sm font-bold transition"
        :class="tab==='shop' ? 'text-white' : 'text-gray-400'">🛒 Shop</button>
      <button @click="tab='history'; loadHistory()"
        :style="tab==='history' ? 'background:#086A9C' : 'background:#0d1f2d'"
        class="flex-1 py-2.5 rounded-2xl text-sm font-bold transition"
        :class="tab==='history' ? 'text-white' : 'text-gray-400'">📜 History</button>
    </div>

    <!-- Shop -->
    <div v-if="tab==='shop'" class="px-4 space-y-3">
      <div v-if="store.loading" class="flex justify-center py-12">
        <div class="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin" style="border-color:#6DCEDA;border-top-color:transparent"/>
      </div>

      <div v-for="reward in store.rewards" :key="reward.id"
        class="rounded-2xl p-4 flex items-center gap-4 border"
        :style="canAfford(reward) && reward.stock !== 0 ? 'background:#0d1f2d;border-color:#086A9C40' : 'background:#0a0a0a;border-color:#1f2937'">
        <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
          style="background:#06101a">{{ reward.icon }}</div>
        <div class="flex-1 min-w-0">
          <p class="font-bold text-sm text-white">{{ reward.title }}</p>
          <p class="text-gray-500 text-xs mt-0.5 line-clamp-2">{{ reward.description }}</p>
          <div class="flex items-center gap-2 mt-1.5">
            <span class="font-black text-sm" style="color:#6DCEDA">{{ reward.cost }} pts</span>
            <span v-if="reward.stock > 0" class="text-gray-600 text-xs">· {{ reward.stock }} left</span>
            <span v-if="reward.stock === 0" class="text-red-400 text-xs font-semibold">· Out of stock</span>
          </div>
        </div>
        <button @click="handleRedeem(reward)"
          :disabled="!canAfford(reward) || reward.stock === 0 || redeeming === reward.id"
          :style="canAfford(reward) && reward.stock !== 0 ? 'background:#086A9C' : 'background:#1f2937'"
          class="px-3 py-2 rounded-xl text-xs font-bold transition flex-shrink-0 text-white disabled:opacity-40 min-w-[64px] text-center">
          <span v-if="redeeming === reward.id">...</span>
          <span v-else-if="!canAfford(reward)">{{ reward.cost - (authStore.profile?.points??0) }} more</span>
          <span v-else>Redeem</span>
        </button>
      </div>
    </div>

    <!-- History -->
    <div v-if="tab==='history'" class="px-4 space-y-3">
      <div v-for="r in store.myRedemptions" :key="r.id"
        class="rounded-2xl p-4 flex items-center gap-3 border" style="background:#0d1f2d;border-color:#086A9C30">
        <span class="text-2xl">{{ r.rewards?.icon }}</span>
        <div class="flex-1">
          <p class="font-semibold text-sm text-white">{{ r.rewards?.title }}</p>
          <p class="text-gray-500 text-xs">{{ formatDate(r.redeemed_at) }}</p>
        </div>
        <span class="font-black text-sm" style="color:#ef4444">-{{ r.rewards?.cost }} pts</span>
      </div>
      <div v-if="!store.loading && !store.myRedemptions.length" class="text-center py-12 text-gray-600">
        <p class="text-4xl mb-3">🎁</p><p>No redemptions yet</p>
      </div>
    </div>

    <!-- Toasts -->
    <transition name="slide-up">
      <div v-if="successMsg" class="fixed bottom-28 left-1/2 -translate-x-1/2 text-white px-5 py-3 rounded-2xl shadow-xl z-50 whitespace-nowrap font-semibold" style="background:#6EAE21">
        ✅ {{ successMsg }}
      </div>
    </transition>
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
function canAfford(r) { return (authStore.profile?.points??0) >= r.cost }
function formatDate(iso) { return new Date(iso).toLocaleDateString('en-PH',{month:'short',day:'numeric',year:'numeric'}) }
async function loadHistory() { if (authStore.user?.id) await store.fetchMyRedemptions(authStore.user.id) }
async function handleRedeem(reward) {
  redeeming.value = reward.id
  try {
    const result = await store.redeemReward(authStore.user.id, reward.id)
    if (result?.success) { authStore.profile.points -= reward.cost; showToast('success',`${reward.icon} Redeemed!`) }
    else showToast('error', result?.error ?? 'Failed')
  } catch(err) { showToast('error', err.message) }
  finally { redeeming.value = null }
}
function showToast(type, msg) {
  clearTimeout(toastTimer)
  if (type==='success'){successMsg.value=msg;errorMsg.value=null}
  else{errorMsg.value=msg;successMsg.value=null}
  toastTimer = setTimeout(()=>{successMsg.value=null;errorMsg.value=null},3000)
}
onMounted(() => store.fetchRewards())
</script>
<style scoped>
.slide-up-enter-active,.slide-up-leave-active{transition:all 0.3s ease}
.slide-up-enter-from,.slide-up-leave-to{opacity:0;transform:translateX(-50%) translateY(12px)}
</style>
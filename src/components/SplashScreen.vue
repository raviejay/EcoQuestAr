<template>
  <Transition name="splash">
    <div v-if="visible" class="fixed inset-0 z-50 overflow-hidden flex flex-col items-center justify-center"
      style="background: linear-gradient(160deg, #0a1a05 0%, #0d2b10 40%, #061520 100%)">

      <!-- Animated grid background -->
      <div class="absolute inset-0 opacity-10"
        style="background-image: linear-gradient(#6EAE21 1px, transparent 1px), linear-gradient(90deg, #6EAE21 1px, transparent 1px); background-size: 32px 32px;" />

      <!-- Floating orbs -->
      <div class="absolute w-80 h-80 rounded-full opacity-10 animate-pulse"
        style="background:radial-gradient(circle,#6EAE21,transparent);top:-80px;right:-80px;animation-duration:3s"/>
      <div class="absolute w-64 h-64 rounded-full opacity-10 animate-pulse"
        style="background:radial-gradient(circle,#086A9C,transparent);bottom:-60px;left:-60px;animation-duration:4s;animation-delay:1s"/>
      <div class="absolute w-40 h-40 rounded-full opacity-15 animate-pulse"
        style="background:radial-gradient(circle,#6DCEDA,transparent);top:30%;right:10%;animation-duration:2.5s;animation-delay:0.5s"/>

      <!-- Particle dots -->
      <div v-for="i in 12" :key="i"
        class="absolute w-1 h-1 rounded-full animate-ping"
        :style="{
          background: i%3===0 ? '#6EAE21' : i%3===1 ? '#086A9C' : '#6DCEDA',
          left: (8 + i*7.5)+'%',
          top: (10 + (i%4)*22)+'%',
          animationDuration: (1.5+i*0.2)+'s',
          animationDelay: (i*0.15)+'s',
          opacity: 0.6
        }" />

      <!-- Main content -->
      <div class="relative z-10 flex flex-col items-center gap-6">

        <!-- Logo -->
        <div class="relative">
          <!-- Glow rings -->
          <div class="absolute inset-0 rounded-3xl animate-ping opacity-20" style="background:#6EAE21;animation-duration:2s"/>
          <div class="absolute -inset-2 rounded-3xl opacity-10 animate-pulse" style="background:#6EAE21"/>
          <!-- Logo image -->
          <div class="relative w-28 h-28 rounded-3xl overflow-hidden flex items-center justify-center shadow-2xl border-2"
            style="background:linear-gradient(135deg,#0d2b10,#061520);border-color:#6EAE21">
            <img src="/logo2.png" alt="EcoQuest" class="w-24 h-24 object-contain"
              onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'" />
            <div class="hidden w-full h-full items-center justify-center text-5xl">♻️</div>
          </div>
        </div>

        <!-- Tagline (no app name — logo only) -->
        <div class="text-center space-y-1">
          <p class="text-sm font-bold uppercase tracking-[0.3em]" style="color:#6DCEDA">Caraga State University</p>
          <p class="text-xs" style="color:#6EAE2180">AI-Powered Environmental Quest</p>
        </div>

        <!-- Game-style level bar -->
        <div class="w-56 space-y-2">
          <div class="flex justify-between text-xs">
            <span style="color:#6EAE21" class="font-bold uppercase tracking-widest">Loading</span>
            <span style="color:#6DCEDA" class="font-mono">{{ progress }}%</span>
          </div>
          <div class="w-full h-2 rounded-full overflow-hidden" style="background:#ffffff15;border:1px solid #6EAE2140">
            <div class="h-full rounded-full transition-all duration-300 relative overflow-hidden"
              :style="{width:progress+'%',background:'linear-gradient(90deg,#6EAE21,#6DCEDA)'}">
              <!-- Shimmer -->
              <div class="absolute inset-0 animate-pulse opacity-50" style="background:linear-gradient(90deg,transparent,#ffffff40,transparent)"/>
            </div>
          </div>
          <p class="text-center text-xs" style="color:#6EAE2199">{{ statusText }}</p>
        </div>

        <!-- Game HUD style badges -->
        <div class="flex gap-3 mt-2">
          <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold" style="border-color:#6EAE2140;background:#6EAE2110;color:#6EAE21">
            🤖 AI Detection
          </div>
          <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold" style="border-color:#086A9C40;background:#086A9C10;color:#6DCEDA">
            🗺️ Live Map
          </div>
          <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold" style="border-color:#6DCEDA40;background:#6DCEDA10;color:#6DCEDA">
            🏆 Rewards
          </div>
        </div>
      </div>

      <!-- Bottom version -->
      <p class="absolute bottom-8 text-xs font-mono" style="color:#6EAE2140">v1.0.0 · Made by CodenameShan</p>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted } from 'vue'
const emit = defineEmits(['done'])
const visible    = ref(true)
const progress   = ref(0)
const statusText = ref('Initializing systems...')

const steps = [
  { pct:15, label:'Booting AI engine...',       delay:300  },
  { pct:35, label:'Connecting to Roboflow...',   delay:700  },
  { pct:60, label:'Loading campus map...',       delay:1100 },
  { pct:80, label:'Syncing leaderboards...',     delay:1400 },
  { pct:100, label:'Ready. Let\'s clean CSU! 🌿', delay:1700 },
]

onMounted(() => {
  steps.forEach(({ pct, label, delay }) => {
    setTimeout(() => { progress.value = pct; statusText.value = label }, delay)
  })
  setTimeout(() => {
    visible.value = false
    setTimeout(() => emit('done'), 700)
  }, 2400)
})
</script>

<style scoped>
.splash-leave-active { transition: opacity 0.7s ease, transform 0.7s ease; }
.splash-leave-to { opacity: 0; transform: scale(1.06); }
</style>
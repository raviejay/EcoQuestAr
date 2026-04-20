<template>
  <div class="fixed left-0 right-0 top-[56px] bottom-[72px] bg-black overflow-hidden">

    <!-- Camera Feed -->
    <video ref="videoRef" class="absolute inset-0 w-full h-full object-cover" autoplay playsinline muted />

    <!-- Detection Canvas -->
    <canvas ref="canvasRef" class="absolute inset-0 w-full h-full pointer-events-none" />

    <!-- Top HUD -->
    <div class="absolute top-0 left-0 right-0 flex justify-between items-center px-4 pt-10 pb-4 bg-gradient-to-b from-black/70 to-transparent z-10">
      <div>
        <p class="text-xs text-green-400 font-bold uppercase tracking-widest">EcoQuest AR</p>
        <p class="text-white text-sm font-semibold mt-0.5">Total: <span class="text-green-400">{{ authStore.profile?.points ?? 0 }} pts</span></p>
      </div>
      <div class="text-right">
        <p class="text-gray-400 text-xs">Confirmed</p>
        <p class="text-green-400 text-2xl font-bold">{{ confirmedCount }}</p>
      </div>
    </div>

    <!-- Scanning reticle -->
    <div v-if="isDetecting" class="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
      <div class="w-64 h-64 relative opacity-40">
        <div class="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-400 rounded-tl-lg" />
        <div class="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-400 rounded-tr-lg" />
        <div class="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-400 rounded-bl-lg" />
        <div class="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-400 rounded-br-lg" />
      </div>
    </div>

    <!-- Model Loading -->
    <div v-if="modelLoading || (!modelReady && !cameraError)" class="absolute inset-0 bg-black/85 flex flex-col items-center justify-center z-20 gap-4">
      <div class="w-14 h-14 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
      <div class="text-center">
        <p class="text-white font-semibold">{{ loadingMessage || 'Loading AI...' }}</p>
        <p class="text-gray-400 text-xs mt-1">First load may take ~10 seconds</p>
      </div>
    </div>

    <!-- Camera Error -->
    <div v-if="cameraError" class="absolute inset-0 bg-black/95 flex flex-col items-center justify-center z-20 px-8 text-center gap-4">
      <span class="text-6xl">📷</span>
      <p class="text-white font-bold text-lg">Camera Unavailable</p>
      <p class="text-gray-400 text-sm">{{ cameraError }}</p>
      <button @click="init" class="mt-2 bg-green-600 text-white px-8 py-3 rounded-full font-semibold">Retry</button>
    </div>

    <!-- ✅ Points earned flash -->
    <transition name="pop">
      <div v-if="pointsFlash" class="absolute top-28 left-1/2 -translate-x-1/2 z-30 bg-yellow-400 text-black font-black text-xl px-6 py-2 rounded-full shadow-xl">
        +{{ pointsFlash }} pts! 🎉
      </div>
    </transition>

    <!-- ===== VIRTUAL TRASH BIN PANEL ===== -->
    <div class="absolute bottom-28 left-0 right-0 z-20 px-3">

      <!-- Bin toggle button + label -->
      <div class="flex items-end justify-between mb-2 px-1">
        <div class="flex items-center gap-2">
          <span class="text-2xl">🗑️</span>
          <span class="text-white text-sm font-bold">Virtual Bin</span>
          <span v-if="bin.length" class="bg-green-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
            {{ bin.length }}
          </span>
        </div>
        <!-- Confirm ALL button -->
        <button
          v-if="bin.length"
          @click="confirmAll"
          :disabled="confirming"
          class="bg-green-500 hover:bg-green-400 disabled:opacity-50 text-white text-sm font-bold px-4 py-1.5 rounded-full shadow-lg transition flex items-center gap-1"
        >
          <span>✅</span>
          <span>{{ confirming ? 'Saving...' : 'Throw All (+' + totalBinPoints + 'pts)' }}</span>
        </button>
      </div>

      <!-- Bin items horizontal scroll -->
      <div v-if="bin.length" class="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        <div
          v-for="item in bin"
          :key="item.id"
          class="flex-shrink-0 bg-white/10 backdrop-blur border border-white/20 rounded-2xl px-3 py-2 flex flex-col items-center gap-1 min-w-[80px] relative"
        >
          <!-- Remove individual item -->
          <button
            @click="removeFromBin(item.id)"
            class="absolute -top-1.5 -right-1.5 bg-red-500 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center leading-none font-bold"
          >×</button>
          <span class="text-2xl">{{ trashEmoji(item.class) }}</span>
          <span class="text-white text-xs font-semibold capitalize text-center leading-tight">{{ item.class }}</span>
          <span class="text-green-400 text-xs font-bold">+{{ item.points }}pts</span>
        </div>

        <!-- Empty state hint inside scroll -->
      </div>

      <!-- Empty bin hint -->
      <div v-else class="text-center py-2">
        <p class="text-gray-400 text-xs">Detected trash will appear here → confirm when thrown away</p>
      </div>
    </div>

    <!-- Bottom Controls -->
    <div class="absolute bottom-0 left-0 right-0 px-6 pb-6 pt-3 bg-gradient-to-t from-black/80 to-transparent z-10 flex items-center justify-center gap-8">
      <button
        @click="toggleDetection"
        :disabled="!cameraReady || modelLoading"
        :class="isDetecting ? 'bg-red-500 hover:bg-red-600 scale-110' : 'bg-green-500 hover:bg-green-600'"
        class="w-20 h-20 rounded-full text-white shadow-2xl transition-all duration-200 flex flex-col items-center justify-center gap-1 disabled:opacity-40"
      >
        <span class="text-2xl">{{ isDetecting ? '⏹️' : '▶️' }}</span>
        <span class="text-xs font-bold">{{ isDetecting ? 'Stop' : 'Scan' }}</span>
      </button>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCamera } from '@/modules/camera/composables/useCamera.js'
import { useDetection } from '@/modules/ai/composables/useDetection.js'
import { useGeolocation } from '@/composables/useGeolocation.js'
import { useAuthStore } from '@/modules/auth/store/authStore.js'
import { detectionApi } from '@/services/api/detectionApi.js'

const authStore = useAuthStore()
const { videoRef, error: cameraError, isReady: cameraReady, startCamera } = useCamera()
const { canvasRef, isDetecting, modelLoading, modelReady, loadingMessage, loadModel, startDetection, stopDetection } = useDetection()
const { latitude, longitude, getPosition } = useGeolocation()

// ── Virtual Bin State ──────────────────────────────────────────
const bin = ref([])               // items waiting to be confirmed
const confirmedCount = ref(0)     // total items confirmed this session
const confirming = ref(false)
const pointsFlash = ref(null)
let flashTimer = null
let idCounter = 0

// Dedupe cooldown: don't re-add same class within 3 seconds
const recentlyAdded = new Map()
const DEDUPE_MS = 3000

const totalBinPoints = computed(() => bin.value.reduce((s, i) => s + i.points, 0))

// ── Trash emoji map ────────────────────────────────────────────
function trashEmoji(cls) {
  const map = {
    bottle: '🍾', cup: '🥤', 'wine glass': '🍷', bowl: '🥣',
    banana: '🍌', apple: '🍎', sandwich: '🥪', orange: '🍊',
    'hot dog': '🌭', pizza: '🍕', donut: '🍩', cake: '🎂',
    fork: '🍴', knife: '🔪', spoon: '🥄',
    backpack: '🎒', handbag: '👜', suitcase: '🧳',
    'cell phone': '📱', book: '📚', scissors: '✂️',
    umbrella: '☂️', tie: '👔', kite: '🪁',
    'sports ball': '⚽', frisbee: '🥏', skateboard: '🛹',
    'teddy bear': '🧸', 'toothbrush': '🪥',
  }
  return map[cls] ?? '🗑️'
}

// ── Add detected items to bin ──────────────────────────────────
function handleDetected(results) {
  const now = Date.now()
  results.forEach(item => {
    const lastAdded = recentlyAdded.get(item.class)
    if (lastAdded && now - lastAdded < DEDUPE_MS) return   // skip duplicate
    recentlyAdded.set(item.class, now)
    bin.value.push({ ...item, id: ++idCounter })
  })
}

function removeFromBin(id) {
  bin.value = bin.value.filter(i => i.id !== id)
}

// ── Confirm: user physically threw trash → award points ────────
async function confirmAll() {
  if (!bin.value.length || confirming.value) return
  confirming.value = true
  const items = [...bin.value]
  const pts = items.reduce((s, i) => s + i.points, 0)

  try {
    await detectionApi.saveDetection({
      userId: authStore.user.id,
      detections: items,
      latitude: latitude.value,
      longitude: longitude.value
    })
    await detectionApi.addPointsToUser({ userId: authStore.user.id, points: pts })

    // Refresh profile points
    if (authStore.profile) authStore.profile.points = (authStore.profile.points ?? 0) + pts

    confirmedCount.value += items.length
    bin.value = []

    // Flash points
    pointsFlash.value = pts
    clearTimeout(flashTimer)
    flashTimer = setTimeout(() => { pointsFlash.value = null }, 2000)
  } catch (err) {
    console.warn('Confirm failed:', err.message)
  } finally {
    confirming.value = false
  }
}

// ── Camera + model init ────────────────────────────────────────
async function init() {
  getPosition()
  await startCamera()
  await loadModel()
}

async function toggleDetection() {
  if (isDetecting.value) {
    stopDetection()
  } else {
    await startDetection(videoRef.value, handleDetected)
  }
}

onMounted(() => init())
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
.pop-enter-active { animation: pop-in 0.3s cubic-bezier(0.34,1.56,0.64,1); }
.pop-leave-active { animation: pop-in 0.2s reverse ease-in; }
@keyframes pop-in {
  from { opacity: 0; transform: translateX(-50%) scale(0.7); }
  to   { opacity: 1; transform: translateX(-50%) scale(1); }
}
</style>
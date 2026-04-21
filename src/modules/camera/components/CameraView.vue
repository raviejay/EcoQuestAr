<template>
  <div class="relative w-full bg-black overflow-hidden" style="height:100dvh;">
    <video ref="videoRef" class="absolute inset-0 w-full h-full object-cover" autoplay playsinline muted />
    <canvas ref="canvasRef" class="absolute inset-0 w-full h-full pointer-events-none" />

    <!-- Top HUD -->
    <div class="absolute top-0 left-0 right-0 flex justify-between items-center px-4 pt-10 pb-4 bg-gradient-to-b from-black/70 to-transparent z-10">
      <div>
        <p class="text-xs font-bold uppercase tracking-widest" style="color:#6DCEDA">EcoQuest AR</p>
        <p class="text-white text-sm font-semibold mt-0.5">Points: <span style="color:#6EAE21">{{ authStore.profile?.points ?? 0 }}</span></p>
      </div>
      <div @click="showHistory = true" class="text-right cursor-pointer">
        <p class="text-gray-400 text-xs">Submissions</p>
        <p class="text-lg font-bold" style="color:#6DCEDA">{{ mySubmissions.length }}</p>
      </div>
    </div>

    <!-- Mode selector -->
    <div class="absolute top-24 left-1/2 -translate-x-1/2 z-10 flex bg-black/60 backdrop-blur rounded-2xl p-1 gap-1">
      <button @click="scanMode = 'ai'"
        :class="scanMode === 'ai' ? 'text-white' : 'text-gray-400'"
        :style="scanMode === 'ai' ? 'background:#6EAE21' : ''"
        class="px-4 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1">
        🤖 AI Scan
      </button>
      <button @click="scanMode = 'manual'"
        :class="scanMode === 'manual' ? 'text-white' : 'text-gray-400'"
        :style="scanMode === 'manual' ? 'background:#086A9C' : ''"
        class="px-4 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1">
        📸 Manual
      </button>
    </div>

    <!-- AI status badge -->
    <div v-if="scanMode === 'ai' && isDetecting" class="absolute top-36 left-1/2 -translate-x-1/2 z-10">
      <div class="text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-2" style="background:rgba(110,174,33,0.9)">
        <div class="w-2 h-2 rounded-full bg-white animate-pulse" />
        AI Active · {{ liveCount }} found
      </div>
    </div>

    <!-- Manual mode hint -->
    <div v-if="scanMode === 'manual' && !manualPhoto" class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-5">
      <div class="w-56 h-56 relative opacity-30">
        <div class="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 rounded-tl-xl" style="border-color:#6DCEDA" />
        <div class="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 rounded-tr-xl" style="border-color:#6DCEDA" />
        <div class="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 rounded-bl-xl" style="border-color:#6DCEDA" />
        <div class="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 rounded-br-xl" style="border-color:#6DCEDA" />
      </div>
      <p class="text-white/60 text-sm mt-4 text-center px-8">Point camera at trash then capture photo</p>
    </div>

    <!-- Loading -->
    <div v-if="scanMode === 'ai' && (modelLoading || !modelReady)" class="absolute inset-0 bg-black/85 flex flex-col items-center justify-center z-20 gap-4">
      <div class="w-14 h-14 border-4 border-t-transparent rounded-full animate-spin" style="border-color:#6EAE21; border-top-color:transparent" />
      <p class="text-white font-semibold">{{ loadingMessage || 'Connecting to AI...' }}</p>
    </div>

    <!-- Virtual Bin (AI mode) -->
    <div v-if="scanMode === 'ai'" class="absolute bottom-28 left-0 right-0 z-20 px-3">
      <div class="flex items-center justify-between mb-2 px-1">
        <div class="flex items-center gap-2">
          <span class="text-2xl">🗑️</span>
          <span class="text-white text-sm font-bold">Virtual Bin</span>
          <span v-if="bin.length" class="text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center" style="background:#6EAE21">{{ bin.length }}</span>
        </div>
        <button v-if="bin.length" @click="openProofCapture('ai')"
          class="text-white text-sm font-bold px-4 py-1.5 rounded-full shadow-lg transition flex items-center gap-1"
          style="background:#6EAE21">
          📸 Submit (+{{ totalBinPoints }}pts)
        </button>
      </div>
      <div v-if="bin.length" class="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        <div v-for="item in bin" :key="item.id" class="flex-shrink-0 bg-white/10 backdrop-blur border border-white/20 rounded-2xl px-3 py-2 flex flex-col items-center gap-1 min-w-[80px] relative">
          <button @click="removeFromBin(item.id)" class="absolute -top-1.5 -right-1.5 bg-red-500 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold">×</button>
          <span class="text-2xl">{{ trashEmoji(item.class) }}</span>
          <span class="text-white text-xs font-semibold capitalize text-center">{{ item.class }}</span>
          <span class="text-xs font-bold" style="color:#6EAE21">+{{ item.points }}pts</span>
        </div>
      </div>
      <div v-else class="text-center py-1">
        <p class="text-gray-400 text-xs">AI detects trash → confirm by taking photo proof</p>
      </div>
    </div>

    <!-- Manual preview -->
    <div v-if="scanMode === 'manual' && manualPhoto" class="absolute bottom-28 left-3 right-3 z-20 bg-black/60 backdrop-blur rounded-2xl p-3 flex items-center gap-3">
      <img :src="manualPhoto" class="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
      <div class="flex-1">
        <p class="text-white text-sm font-bold">Photo captured!</p>
        <p class="text-gray-400 text-xs">Submit for admin review — no instant points</p>
      </div>
      <div class="flex flex-col gap-1">
        <button @click="openProofCapture('manual')" class="text-white text-xs font-bold px-3 py-1.5 rounded-xl" style="background:#086A9C">Submit</button>
        <button @click="manualPhoto = null; manualBlob = null" class="bg-gray-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl">Retake</button>
      </div>
    </div>

    <!-- Bottom Controls -->
    <div class="absolute bottom-0 left-0 right-0 px-6 pb-6 pt-3 bg-gradient-to-t from-black/80 to-transparent z-10 flex items-center justify-center gap-6">
      <!-- AI mode: scan toggle -->
      <button v-if="scanMode === 'ai'"
        @click="toggleDetection"
        :disabled="!cameraReady || modelLoading"
        :class="isDetecting ? 'scale-110' : ''"
        :style="isDetecting ? 'background:#ef4444' : 'background:#6EAE21'"
        class="w-20 h-20 rounded-full text-white shadow-2xl transition-all duration-200 flex flex-col items-center justify-center gap-1 disabled:opacity-40"
      >
        <span class="text-2xl">{{ isDetecting ? '⏹️' : '▶️' }}</span>
        <span class="text-xs font-bold">{{ isDetecting ? 'Stop' : 'Scan' }}</span>
      </button>

      <!-- Manual mode: capture button -->
      <button v-else
        @click="captureManualPhoto"
        :disabled="!cameraReady"
        class="w-20 h-20 rounded-full text-white shadow-2xl transition-all duration-200 flex flex-col items-center justify-center gap-1 disabled:opacity-40"
        style="background:#086A9C"
      >
        <span class="text-2xl">📷</span>
        <span class="text-xs font-bold">Capture</span>
      </button>
    </div>

    <!-- ===== PROOF / SELFIE MODAL ===== -->
    <div v-if="showProofModal" class="absolute inset-0 z-40 bg-black flex flex-col">
      <div class="px-4 pt-10 pb-4 flex items-center gap-3" style="background:#111">
        <button @click="cancelProof" class="text-gray-400 text-2xl">←</button>
        <div>
          <p class="text-white font-bold">🤳 Selfie Proof Required</p>
          <p class="text-gray-400 text-xs">Take a selfie near a trash bin as proof</p>
        </div>
      </div>

      <div class="flex-1 relative mx-4 my-2 rounded-2xl overflow-hidden bg-gray-900 flex items-center justify-center">
        <img v-if="selfieDataUrl" :src="selfieDataUrl" class="w-full h-full object-contain" />
        <div v-else class="text-center px-8">
          <span class="text-7xl">🤳</span>
          <p class="text-white font-semibold mt-4">Take a selfie</p>
          <p class="text-gray-400 text-sm mt-1">near a trash bin with your collected trash</p>
        </div>
      </div>

      <!-- Items (AI mode) or photo preview (manual mode) -->
      <div class="px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar">
        <template v-if="proofMode === 'ai'">
          <div v-for="item in bin" :key="item.id" class="flex-shrink-0 bg-gray-800 rounded-xl px-3 py-1.5 flex items-center gap-1.5">
            <span class="text-sm">{{ trashEmoji(item.class) }}</span>
            <span class="text-white text-xs capitalize">{{ item.class }}</span>
            <span class="text-xs font-bold" style="color:#6EAE21">+{{ item.points }}</span>
          </div>
        </template>
        <template v-else>
          <img v-if="manualPhoto" :src="manualPhoto" class="h-14 rounded-xl object-cover" />
          <div class="bg-gray-800 rounded-xl px-3 py-1.5 flex items-center gap-2">
            <span class="text-yellow-400 text-xs">⏳ Admin review required — no instant points</span>
          </div>
        </template>
      </div>

      <div class="px-4 pb-8 flex gap-3">
        <button @click="captureSelfie" class="flex-1 bg-white text-black font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2">
          <span class="text-xl">📷</span> {{ selfieDataUrl ? 'Retake' : 'Take Selfie' }}
        </button>
        <button v-if="selfieDataUrl" @click="submitWithProof" :disabled="submitting"
          class="flex-1 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50"
          :style="proofMode === 'ai' ? 'background:#6EAE21' : 'background:#086A9C'">
          <span class="text-xl">{{ submitting ? '⏳' : '✅' }}</span>
          {{ submitting ? 'Submitting...' : 'Submit for Review' }}
        </button>
      </div>

      <canvas ref="selfieCanvasRef" class="hidden" />
    </div>

    <!-- Success -->
    <div v-if="showSuccess" class="absolute inset-0 z-50 bg-black/95 flex flex-col items-center justify-center px-8 text-center gap-4">
      <span class="text-7xl">✅</span>
      <h2 class="text-white text-2xl font-black">Submitted!</h2>
      <p class="text-gray-300 text-sm">
        <template v-if="proofMode === 'ai'">Pending admin review. <span style="color:#6EAE21" class="font-bold">+{{ lastSubmittedPoints }} pts</span> will be credited when approved.</template>
        <template v-else>Your photo has been submitted for admin review. Points will be credited if approved.</template>
      </p>
      <button @click="showSuccess = false" class="text-white font-bold px-8 py-3 rounded-full mt-2" style="background:#6EAE21">Keep Scanning</button>
    </div>

    <!-- History modal -->
    <div v-if="showHistory" class="absolute inset-0 z-40 bg-gray-950 flex flex-col">
      <div class="px-4 pt-10 pb-4 flex items-center gap-3 border-b border-gray-800">
        <button @click="showHistory = false" class="text-gray-400 text-2xl">←</button>
        <p class="text-white font-bold text-lg">My Submissions</p>
      </div>
      <div class="flex-1 overflow-y-auto">
        <div v-if="!mySubmissions.length" class="flex flex-col items-center justify-center h-full text-gray-500 gap-3">
          <span class="text-5xl">📭</span><p>No submissions yet</p>
        </div>
        <div v-for="s in mySubmissions" :key="s.id" class="px-4 py-3 border-b border-gray-800 flex gap-3 items-start">
          <img :src="s.proof_photo_url" class="w-16 h-16 rounded-xl object-cover flex-shrink-0 bg-gray-800" />
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <span :class="{ 'bg-yellow-500/20 text-yellow-400': s.status==='pending', 'bg-green-500/20 text-green-400': s.status==='approved', 'bg-red-500/20 text-red-400': s.status==='rejected' }"
                class="text-xs font-bold px-2 py-0.5 rounded-full uppercase">{{ s.status }}</span>
              <span class="text-gray-500 text-xs">{{ formatDate(s.submitted_at) }}</span>
            </div>
            <p class="text-white text-sm font-semibold">{{ s.status === 'approved' ? '✅' : s.status === 'rejected' ? '❌' : '⏳' }} {{ s.total_points }} points</p>
            <p v-if="s.admin_note" class="text-gray-400 text-xs mt-0.5 italic">"{{ s.admin_note }}"</p>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCamera } from '@/modules/camera/composables/useCamera.js'
import { useDetection } from '@/modules/ai/composables/useDetection.js'
import { useGeolocation } from '@/composables/useGeolocation.js'
import { useAuthStore } from '@/modules/auth/store/authStore.js'
import { submissionApi } from '@/services/api/submissionApi.js'

const authStore = useAuthStore()
const { videoRef, error: cameraError, isReady: cameraReady, startCamera } = useCamera()
const { canvasRef, isDetecting, modelLoading, modelReady, loadingMessage, liveCount, loadModel, startDetection, stopDetection } = useDetection()
const { latitude, longitude, getPosition } = useGeolocation()

const scanMode = ref('ai') // 'ai' | 'manual'

// AI bin
const bin = ref([])
const recentlyAdded = new Map()
const DEDUPE_MS = 4000
let idCounter = 0
const totalBinPoints = computed(() => bin.value.reduce((s, i) => s + i.points, 0))

// Manual capture
const manualPhoto = ref(null)
const manualBlob  = ref(null)

// Proof modal
const showProofModal   = ref(false)
const selfieCanvasRef  = ref(null)
const selfieDataUrl    = ref(null)
const selfieBlob       = ref(null)
const proofMode        = ref('ai')
const submitting       = ref(false)
const showSuccess      = ref(false)
const showHistory      = ref(false)
const lastSubmittedPoints = ref(0)
const mySubmissions    = ref([])

const EMOJI_MAP = { trash:'🗑️',bottle:'🍾',cup:'🥤',bag:'🛍️',can:'🥫',paper:'📄',plastic:'♻️',wrapper:'🍬',cigarette:'🚬',food:'🍱',cardboard:'📦',glass:'🍶',default:'🗑️' }
function trashEmoji(cls) { const k = Object.keys(EMOJI_MAP).find(k => cls?.toLowerCase().includes(k)); return EMOJI_MAP[k] || EMOJI_MAP.default }
function formatDate(iso) { return new Date(iso).toLocaleDateString('en-PH', { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' }) }

function handleDetected(results) {
  const now = Date.now()
  results.forEach(item => {
    const last = recentlyAdded.get(item.class)
    if (last && now - last < DEDUPE_MS) return
    recentlyAdded.set(item.class, now)
    bin.value.push({ ...item, id: ++idCounter })
  })
}

function removeFromBin(id) { bin.value = bin.value.filter(i => i.id !== id) }

// Manual: capture trash photo from live feed
function captureManualPhoto() {
  const video = videoRef.value
  if (!video) return
  const canvas = document.createElement('canvas')
  canvas.width = video.videoWidth; canvas.height = video.videoHeight
  canvas.getContext('2d').drawImage(video, 0, 0)
  manualPhoto.value = canvas.toDataURL('image/jpeg', 0.85)
  canvas.toBlob(b => { manualBlob.value = b }, 'image/jpeg', 0.85)
}

function openProofCapture(mode) {
  proofMode.value    = mode
  selfieDataUrl.value = null
  selfieBlob.value   = null
  showProofModal.value = true
}

function cancelProof() { showProofModal.value = false; selfieDataUrl.value = null }

// Capture selfie from live feed
function captureSelfie() {
  const video = videoRef.value; const canvas = selfieCanvasRef.value
  if (!video || !canvas) return
  canvas.width = video.videoWidth; canvas.height = video.videoHeight
  canvas.getContext('2d').drawImage(video, 0, 0)
  selfieDataUrl.value = canvas.toDataURL('image/jpeg', 0.85)
  canvas.toBlob(b => { selfieBlob.value = b }, 'image/jpeg', 0.85)
}

async function submitWithProof() {
  if (!selfieBlob.value || submitting.value) return
  submitting.value = true
  try {
    const selfieUrl = await submissionApi.uploadProofPhoto(authStore.user.id, selfieBlob.value)

    if (proofMode.value === 'ai') {
      await submissionApi.submitForReview({
        userId: authStore.user.id,
        items: bin.value,
        proofPhotoUrl: selfieUrl,
        latitude: latitude.value, longitude: longitude.value,
        submissionType: 'ai'
      })
      lastSubmittedPoints.value = totalBinPoints.value
      bin.value = []
    } else {
      // Manual: also upload the trash photo
      const trashPhotoUrl = await submissionApi.uploadProofPhoto(authStore.user.id, manualBlob.value)
      await submissionApi.submitForReview({
        userId: authStore.user.id,
        items: [{ class: 'manual', score: 1, points: 0 }],
        proofPhotoUrl: trashPhotoUrl,
        selfiePhotoUrl: selfieUrl,
        latitude: latitude.value, longitude: longitude.value,
        submissionType: 'manual'
      })
      lastSubmittedPoints.value = 0
      manualPhoto.value = null; manualBlob.value = null
    }
    showProofModal.value = false
    showSuccess.value    = true
    await loadHistory()
  } catch (err) { alert(`Submission failed: ${err.message}`) }
  finally { submitting.value = false }
}

async function loadHistory() {
  if (authStore.user?.id) mySubmissions.value = await submissionApi.getMySubmissions(authStore.user.id)
}

async function toggleDetection() {
  if (isDetecting.value) stopDetection()
  else await startDetection(videoRef.value, handleDetected)
}

onMounted(async () => {
  getPosition()
  await startCamera()
  await loadModel()
  await loadHistory()
})
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
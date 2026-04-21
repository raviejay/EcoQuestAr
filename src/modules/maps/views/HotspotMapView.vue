<template>
  <div class="flex flex-col text-white" style="height:100dvh; background:#0a0a0a">

    <!-- Header -->
    <div class="px-4 pt-10 pb-3 flex items-center justify-between flex-shrink-0" style="background:#111">
      <div>
        <h1 class="text-xl font-black">🗺️ CSU Hotspot Map</h1>
        <p class="text-xs mt-0.5" style="color:#6DCEDA">Caraga State University – Main Campus</p>
      </div>
      <div class="flex gap-2">
        <button v-for="m in modes" :key="m.key" @click="mode = m.key"
          :class="mode === m.key ? 'text-white' : 'text-gray-400'"
          :style="mode === m.key ? 'background:#6EAE21' : 'background:#1f1f1f'"
          class="px-3 py-1.5 rounded-xl text-xs font-bold transition">{{ m.label }}</button>
      </div>
    </div>

    <!-- Stats -->
    <div class="flex gap-2 px-4 pb-3 flex-shrink-0">
      <div class="flex-1 rounded-xl px-3 py-2 text-center" style="background:#1a1a1a">
        <p class="font-black text-lg" style="color:#6EAE21">{{ hotspots.length }}</p>
        <p class="text-gray-400 text-xs">Hotspots</p>
      </div>
      <div class="flex-1 rounded-xl px-3 py-2 text-center" style="background:#1a1a1a">
        <p class="font-black text-lg text-yellow-400">{{ totalReports }}</p>
        <p class="text-gray-400 text-xs">Reports</p>
      </div>
      <div class="flex-1 rounded-xl px-3 py-2 text-center" style="background:#1a1a1a">
        <p class="font-black text-lg" style="color:#6DCEDA">{{ adminHotspots.length }}</p>
        <p class="text-gray-400 text-xs">Admin Zones</p>
      </div>
    </div>

    <!-- Map container -->
    <div class="flex-1 relative min-h-0">
      <div ref="mapRef" class="w-full h-full z-0" />

      <!-- Loading -->
      <div v-if="loading" class="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
        <div class="flex flex-col items-center gap-3">
          <div class="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin"
            style="border-color:#6EAE21;border-top-color:transparent" />
          <p class="text-white text-sm">Loading campus data...</p>
        </div>
      </div>

      <!-- Controls -->
      <div class="absolute bottom-4 right-4 z-10 flex flex-col gap-2">
        <button @click="locateMe"
          class="bg-white text-gray-800 w-11 h-11 rounded-full shadow-lg flex items-center justify-center text-xl">
          📍
        </button>
        <button @click="resetToCSU"
          class="text-white w-11 h-11 rounded-full shadow-lg flex items-center justify-center text-lg font-bold"
          style="background:#086A9C" title="Reset to CSU">
          🏫
        </button>
      </div>

      <!-- Legend -->
      <div class="absolute top-3 left-3 z-10 rounded-xl px-3 py-2 text-xs text-white space-y-1.5"
        style="background:rgba(0,0,0,0.78); backdrop-filter:blur(4px)">
        <p class="font-bold text-xs mb-1" style="color:#6DCEDA">Legend</p>
        <div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full inline-block" style="background:#6EAE21" /> Low activity</div>
        <div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full inline-block bg-yellow-400" /> Medium</div>
        <div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full inline-block bg-red-500" /> High activity</div>
        <div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full inline-block" style="background:#086A9C" /> Admin zone</div>
        <div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full inline-block bg-blue-400" /> Your location</div>
      </div>
    </div>

    <!-- Hotspot list -->
    <div class="flex-shrink-0 border-t border-gray-800 max-h-48 overflow-y-auto" style="background:#111">
      <div class="px-4 py-2 border-b border-gray-800 flex items-center justify-between">
        <p class="text-xs font-bold text-gray-400 uppercase tracking-widest">Top Reported Areas</p>
        <p class="text-xs" style="color:#6DCEDA">CSU Campus Only</p>
      </div>

      <div v-if="!hotspots.length && !adminHotspots.length" class="px-4 py-6 text-gray-500 text-sm text-center">
        <span class="text-3xl block mb-2">🌱</span>
        No hotspots reported yet. Start scanning!
      </div>

      <!-- User-reported hotspots -->
      <div v-for="(h, i) in hotspots.slice(0, 6)" :key="`h-${i}`"
        @click="flyToSpot(h.lat, h.lng)"
        class="flex items-center gap-3 px-4 py-2.5 border-b border-gray-800/50 active:bg-gray-800 cursor-pointer">
        <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0"
          :style="h.report_count >= 7 ? 'background:#ef4444' : h.report_count >= 4 ? 'background:#eab308' : 'background:#6EAE21'">
          {{ h.report_count }}
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-white">{{ h.lat.toFixed(5) }}, {{ h.lng.toFixed(5) }}</p>
          <p class="text-xs text-gray-400">Last reported: {{ formatDate(h.last_reported) }}</p>
        </div>
        <span class="text-xs" style="color:#6DCEDA">👆 View</span>
      </div>

      <!-- Admin-defined hotspots -->
      <div v-for="h in adminHotspots" :key="`ah-${h.id}`"
        @click="flyToSpot(h.latitude, h.longitude)"
        class="flex items-center gap-3 px-4 py-2.5 border-b border-gray-800/50 active:bg-gray-800 cursor-pointer">
        <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0"
          :style="h.severity==='high' ? 'background:#ef4444' : h.severity==='medium' ? 'background:#eab308' : 'background:#086A9C'">
          📍
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-white">{{ h.name }}</p>
          <p class="text-xs text-gray-400 truncate">{{ h.description || 'Admin-defined zone' }}</p>
        </div>
        <span class="text-xs capitalize px-2 py-0.5 rounded-full font-bold"
          :style="h.severity==='high' ? 'background:#7f1d1d;color:#fca5a5' : h.severity==='medium' ? 'background:#78350f;color:#fcd34d' : 'background:#1e3a5f;color:#6DCEDA'">
          {{ h.severity }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useMap } from '@/modules/maps/composables/useMap.js'
import { useGeolocation } from '@/composables/useGeolocation.js'
import { supabase } from '@/services/supabase/client.js'

const {
  mapRef, initMap, setView, resetView,
  renderHeatmap, renderHotspotMarkers,
  addAdminMarker, addUserMarker
} = useMap()

const { latitude, longitude, getPosition } = useGeolocation()

const hotspots      = ref([])
const heatPoints    = ref([])
const adminHotspots = ref([])
const loading       = ref(true)
const mode          = ref('heat')
const modes = [
  { key: 'heat', label: '🔥 Heat' },
  { key: 'pins', label: '📍 Pins' }
]

const totalReports = computed(() => hotspots.value.reduce((s, h) => s + h.report_count, 0))

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })
}

function flyToSpot(lat, lng) { setView(lat, lng, 19) }
function locateMe() { getPosition() }
function resetToCSU() { resetView() }

async function renderLayers() {
  if (mode.value === 'heat') {
    await renderHeatmap(heatPoints.value)
    renderHotspotMarkers([])
  } else {
    renderHotspotMarkers(hotspots.value)
  }
  // Always render admin markers on top
  adminHotspots.value.forEach(h => addAdminMarker(h))
}

async function loadData() {
  loading.value = true
  try {
    const [locRes, adminRes] = await Promise.all([
      supabase.from('top_locations').select('*'),
      supabase.from('admin_hotspots').select('*').eq('is_active', true)
    ])

    hotspots.value      = locRes.data  ?? []
    adminHotspots.value = adminRes.data ?? []
    heatPoints.value    = hotspots.value.map(h => ({
      lat: h.lat, lng: h.lng, intensity: h.report_count
    }))

    await renderLayers()
  } catch (err) {
    console.warn('Map data error:', err.message)
  } finally {
    loading.value = false
  }
}

watch(mode, () => renderLayers())

watch([latitude, longitude], ([lat, lng]) => {
  if (lat && lng) {
    setView(lat, lng, 18)
    addUserMarker(lat, lng)
  }
})

onMounted(async () => {
  getPosition()
  await nextTick()
  initMap()
  await loadData()
})
</script>
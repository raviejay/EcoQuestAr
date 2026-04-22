<template>
  <div class="flex flex-col text-white h-full flex-1 min-h-0" style="background:#0a0f06">

    <!-- Header -->
    <div class="px-4 pt-2 pb-3 flex items-center justify-between flex-shrink-0" style="background:#0d1a09">
      <div>
        <p class="text-xs font-bold uppercase tracking-widest" style="color:#6DCEDA">Live</p>
        <h1 class="text-xl font-black text-white">CSU Hotspot Map</h1>
      </div>
      <div class="flex items-center gap-2">
        <img src="/logo2.png" alt="logo" class="h-8 object-contain" onerror="this.style.display='none'" />
        <div class="flex gap-1">
          <button v-for="m in modes" :key="m.key" @click="setMode(m.key)"
            :style="mode===m.key?'background:#6EAE21':'background:#1a2f0a'"
            class="px-3 py-1.5 rounded-xl text-xs font-bold transition text-white">{{ m.label }}</button>
        </div>
      </div>
    </div>

    <!-- Stats -->
    <div class="flex gap-2 px-4 pb-3 mt-2 flex-shrink-0">
      <div class="flex-1 rounded-xl px-3 py-2 text-center" style="background:#1a2f0a">
        <p class="font-black text-lg" style="color:#6EAE21">{{ hotspots.length }}</p>
        <p class="text-gray-500 text-xs">Zones</p>
      </div>
      <div class="flex-1 rounded-xl px-3 py-2 text-center" style="background:#1a2f0a">
        <p class="font-black text-lg text-yellow-400">{{ totalReports }}</p>
        <p class="text-gray-500 text-xs">Reports</p>
      </div>
      <div class="flex-1 rounded-xl px-3 py-2 text-center" style="background:#1a2f0a">
        <p class="font-black text-lg" style="color:#6DCEDA">{{ adminHotspots.length }}</p>
        <p class="text-gray-500 text-xs">Admin Zones</p>
      </div>
    </div>

    <!-- Map -->
    <div class="flex-1 relative min-h-0">
  <div ref="mapRef" class="absolute inset-0 z-0" />

      <div v-if="loading" class="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
        <div class="flex flex-col items-center gap-3">
          <div class="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin" style="border-color:#6EAE21;border-top-color:transparent"/>
          <p class="text-white text-sm font-medium">Loading hotspots...</p>
        </div>
      </div>

      <!-- Controls -->
      <div class="absolute bottom-4 right-4 z-10 flex flex-col gap-2">
        <button @click="locateMe" class="bg-white text-gray-800 w-11 h-11 rounded-full shadow-lg flex items-center justify-center text-xl">📍</button>
        <button @click="resetToCSU" class="text-white w-11 h-11 rounded-full shadow-lg flex items-center justify-center font-bold" style="background:#086A9C">🏫</button>
      </div>

      <!-- Legend -->
      <div class="absolute top-3 left-3 z-10 rounded-xl px-3 py-2.5 space-y-2" style="background:rgba(10,15,6,0.88);backdrop-filter:blur(6px);border:1px solid #6EAE2130">
        <p class="text-xs font-black" style="color:#6DCEDA">Density</p>
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 rounded-full bg-red-500 ring-2 ring-red-500/30" />
          <span class="text-xs text-gray-300">High (7+)</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 rounded-full bg-yellow-400 ring-2 ring-yellow-400/30" />
          <span class="text-xs text-gray-300">Medium (4-6)</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 rounded-full ring-2 ring-green-500/30" style="background:#6EAE21"/>
          <span class="text-xs text-gray-300">Low (1-3)</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 rounded-full bg-blue-400 ring-2 ring-blue-400/30"/>
          <span class="text-xs text-gray-300">Admin Zone</span>
        </div>
      </div>
    </div>

    <!-- Hotspot list -->
    <div class="flex-shrink-0 border-t border-gray-800 max-h-44 overflow-y-auto" style="background:#0d1a09">
      <div class="px-4 py-2 border-b border-gray-800 flex items-center justify-between">
        <p class="text-xs font-bold text-gray-500 uppercase tracking-widest">Hotspot Areas</p>
        <p class="text-xs" style="color:#6DCEDA">CSU Campus Only</p>
      </div>

      <div v-if="!hotspots.length && !adminHotspots.length" class="px-4 py-6 text-gray-600 text-sm text-center">
        <span class="text-3xl block mb-2">🌱</span>No hotspots yet
      </div>

      <div v-for="(h,i) in hotspots.slice(0,6)" :key="`u${i}`"
        @click="flyTo(h.lat, h.lng)"
        class="flex items-center gap-3 px-4 py-2.5 border-b border-gray-800/40 active:bg-gray-800/30 cursor-pointer">
        <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0"
          :style="h.report_count>=7?'background:#ef4444':h.report_count>=4?'background:#eab308':'background:#6EAE21'">
          {{ h.report_count }}
        </div>
        <div class="flex-1">
          <p class="text-sm font-semibold text-white">{{ h.lat.toFixed(5) }}, {{ h.lng.toFixed(5) }}</p>
          <p class="text-xs text-gray-500">Last: {{ formatDate(h.last_reported) }}</p>
        </div>
        <span class="text-xs text-gray-600">tap →</span>
      </div>

      <div v-for="h in adminHotspots" :key="`a${h.id}`"
        @click="flyTo(h.latitude, h.longitude)"
        class="flex items-center gap-3 px-4 py-2.5 border-b border-gray-800/40 active:bg-gray-800/30 cursor-pointer">
        <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
          :style="h.severity==='high'?'background:#ef4444;color:white':h.severity==='medium'?'background:#eab308;color:black':'background:#086A9C;color:white'">
          📍
        </div>
        <div class="flex-1">
          <p class="text-sm font-semibold text-white">{{ h.name }}</p>
          <p class="text-xs text-gray-500 truncate">{{ h.description || 'Admin zone' }}</p>
        </div>
        <span class="text-xs capitalize px-2 py-0.5 rounded-full font-bold"
          :style="h.severity==='high'?'background:#7f1d1d;color:#fca5a5':h.severity==='medium'?'background:#78350f;color:#fcd34d':'background:#1e3a5f;color:#6DCEDA'">
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

const { mapRef, initMap, setView, resetView, invalidateSize, renderHeatmap, renderHotspotMarkers, addAdminMarker, addUserMarker } = useMap()
const { latitude, longitude, getPosition } = useGeolocation()

const hotspots      = ref([])
const heatPoints    = ref([])
const adminHotspots = ref([])
const loading       = ref(true)
const mode          = ref('heat')
const modes = [{ key:'heat',label:'🔥 Heat'},{key:'pins',label:'📍 Pins'}]

const totalReports = computed(() => hotspots.value.reduce((s,h)=>s+h.report_count,0))

function formatDate(iso) { if(!iso)return'—'; return new Date(iso).toLocaleDateString('en-PH',{month:'short',day:'numeric'}) }
function flyTo(lat,lng) { setView(lat,lng,19) }
function locateMe() { getPosition() }
function resetToCSU() { resetView() }

async function renderLayers() {
  if (mode.value === 'heat') {
    await renderHeatmap(heatPoints.value)
    renderHotspotMarkers([])
  } else {
    renderHotspotMarkers(hotspots.value)
    await renderHeatmap([])
  }
  adminHotspots.value.forEach(h => addAdminMarker(h))
}

async function setMode(m) {
  mode.value = m
  await renderLayers()
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
    heatPoints.value    = hotspots.value.map(h => ({ lat:h.lat, lng:h.lng, intensity:h.report_count }))
    await renderLayers()
  } catch(err) { console.warn('Map error:', err.message) }
  finally { loading.value = false }
}

watch([latitude, longitude], ([lat,lng]) => {
  if (lat && lng) { setView(lat,lng,18); addUserMarker(lat,lng) }
})

onMounted(async () => {
  getPosition()

  await nextTick()

  // 🔥 wait for layout to stabilize
  setTimeout(async () => {
    initMap()
    invalidateSize()

    await loadData()
  }, 100)
})
</script>
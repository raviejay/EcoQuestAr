<template>
  <div class="min-h-screen text-white pb-10" style="background:#0a0a0a">

    <div class="px-4 pt-10 pb-3 border-b border-gray-800" style="background:#111">
      <h1 class="text-xl font-black">🛡️ Admin Panel</h1>
      <div class="flex gap-2 mt-3 overflow-x-auto no-scrollbar pb-1">
        <button v-for="t in tabs" :key="t.key" @click="activeTab = t.key"
          :class="activeTab===t.key?'text-white':'text-gray-400 bg-gray-800'"
          :style="activeTab===t.key?'background:#6EAE21':''"
          class="px-4 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1 flex-shrink-0">
          {{ t.label }}
          <span v-if="t.key==='submissions'&&pendingCount" class="bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">{{ pendingCount }}</span>
        </button>
      </div>
    </div>

    <div v-if="!isAdmin" class="flex flex-col items-center justify-center py-24 text-center px-8">
      <span class="text-6xl mb-4">🚫</span><p class="text-white font-bold">Access Denied</p>
    </div>

    <template v-else>

      <!-- ===== ANALYTICS ===== -->
      <div v-if="activeTab==='analytics'" class="px-4 mt-4 space-y-4">
        <div class="grid grid-cols-2 gap-3">
          <div class="bg-gray-900 rounded-2xl p-4 border border-gray-800"><p class="text-gray-400 text-xs">Total Submissions</p><p class="text-2xl font-black mt-1" style="color:#6EAE21">{{ analytics.total }}</p></div>
          <div class="bg-gray-900 rounded-2xl p-4 border border-gray-800"><p class="text-gray-400 text-xs">Approved</p><p class="text-2xl font-black mt-1" style="color:#6DCEDA">{{ analytics.approved }}</p></div>
          <div class="bg-gray-900 rounded-2xl p-4 border border-gray-800"><p class="text-gray-400 text-xs">Points Awarded</p><p class="text-2xl font-black mt-1 text-yellow-400">{{ analytics.points }}</p></div>
          <div class="bg-gray-900 rounded-2xl p-4 border border-gray-800"><p class="text-gray-400 text-xs">Active Users</p><p class="text-2xl font-black mt-1" style="color:#086A9C">{{ analytics.users }}</p></div>
        </div>
        <div class="bg-gray-900 rounded-2xl p-4 border border-gray-800">
          <p class="text-white font-bold mb-3">📈 Weekly Trend</p>
          <div v-if="trends.length" class="space-y-2">
            <div v-for="(t,i) in trends.slice(0,6)" :key="i" class="flex items-center gap-3">
              <span class="text-gray-400 text-xs w-20 flex-shrink-0">{{ formatWeek(t.week) }}</span>
              <div class="flex-1 h-5 bg-gray-800 rounded-full overflow-hidden">
                <div class="h-full rounded-full transition-all duration-700" :style="{width:barPct(t.total_submissions)+'%',background:'linear-gradient(90deg,#6EAE21,#6DCEDA)'}"/>
              </div>
              <span class="text-white text-xs w-5 text-right">{{ t.total_submissions }}</span>
            </div>
          </div>
          <p v-else class="text-gray-500 text-sm text-center py-4">No data yet</p>
        </div>
        <div class="bg-gray-900 rounded-2xl p-4 border border-gray-800">
          <p class="text-white font-bold mb-3">📍 Top Locations</p>
          <div v-if="topLocations.length" class="space-y-2">
            <div v-for="(l,i) in topLocations.slice(0,5)" :key="i" class="flex items-center gap-3">
              <div class="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0" :style="i===0?'background:#ef4444':i<3?'background:#eab308':'background:#6EAE21'">{{ i+1 }}</div>
              <div class="flex-1">
                <p class="text-gray-300 text-xs">{{ l.lat.toFixed(4) }}, {{ l.lng.toFixed(4) }}</p>
                <div class="w-full h-1.5 bg-gray-800 rounded-full mt-1"><div class="h-full rounded-full" :style="{width:(l.report_count/topLocations[0].report_count*100)+'%',background:'#6EAE21'}"/></div>
              </div>
              <span class="text-white text-xs font-bold">{{ l.report_count }}</span>
            </div>
          </div>
          <p v-else class="text-gray-500 text-sm text-center py-4">No data yet</p>
        </div>
      </div>

      <!-- ===== SUBMISSIONS ===== -->
      <div v-if="activeTab==='submissions'" class="px-4 mt-4">
        <div class="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
          <button v-for="f in ['all','pending','approved','rejected']" :key="f" @click="filter=f"
            :class="filter===f?'text-white':'text-gray-400 bg-gray-800'"
            :style="filter===f?'background:#086A9C':''"
            class="px-3 py-1.5 rounded-xl text-xs font-bold transition capitalize flex-shrink-0">{{ f }}</button>
        </div>
        <div v-if="loading" class="flex justify-center py-12"><div class="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin" style="border-color:#6EAE21;border-top-color:transparent"/></div>
        <div v-else-if="!filteredSubs.length" class="text-center py-12 text-gray-500"><span class="text-5xl block mb-3">📭</span>No {{ filter }} submissions</div>
        <div v-else class="space-y-4">
          <div v-for="s in filteredSubs" :key="s.id" class="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            <div class="flex gap-1">
              <img :src="s.proof_photo_url" class="flex-1 h-44 object-cover bg-gray-800"/>
              <img v-if="s.selfie_photo_url" :src="s.selfie_photo_url" class="w-28 h-44 object-cover bg-gray-800"/>
            </div>
            <div class="p-4">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-2">
                  <div class="w-9 h-9 rounded-full flex items-center justify-center font-bold flex-shrink-0 overflow-hidden" style="background:#6EAE21">
                    <img v-if="s.profiles?.avatar_url" :src="s.profiles.avatar_url" class="w-full h-full object-cover"/>
                    <span v-else class="text-white text-sm">{{ s.profiles?.username?.charAt(0).toUpperCase()?? '?' }}</span>
                  </div>
                  <div>
                    <p class="text-white text-sm font-bold">{{ s.profiles?.full_name || s.profiles?.username }}</p>
                    <p v-if="s.profiles?.school_id" class="text-xs" style="color:#6DCEDA">{{ s.profiles.school_id }}</p>
                    <p class="text-gray-500 text-xs">{{ formatDate(s.submitted_at) }}</p>
                  </div>
                </div>
              <div class="flex gap-1.5 flex-wrap justify-end">

            <!-- SUBMISSION TYPE BADGE (ADD THIS) -->
            <span
              class="text-xs font-bold px-2 py-0.5 rounded-full"
              :style="s.submission_type === 'manual'
                ? 'background:#1e3a5f;color:#6DCEDA'
                : 'background:#2d2d2d;color:#aaa'"
            >
              {{ s.submission_type === 'manual' ? 'Manual' : 'AI Detection' }}
            </span>

            <!-- STATUS BADGE (KEEP YOUR EXISTING ONE) -->
            <span
              :class="{
                'bg-yellow-500/20 text-yellow-400': s.status==='pending',
                'bg-green-500/20 text-green-400': s.status==='approved',
                'bg-red-500/20 text-red-400': s.status==='rejected'
              }"
              class="text-xs font-bold px-2 py-0.5 rounded-full uppercase"
            >
              {{ s.status }}
            </span>

          </div>
              </div>
              <div class="flex flex-wrap gap-1.5 mb-3">
                <span v-for="(item,i) in (s.detected_items||[])" :key="i" class="bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded-full">
                  {{ item.class }} <span class="font-bold" style="color:#6EAE21">+{{ item.points }}</span>
                </span>
              </div>
              <div class="flex items-center justify-between mb-3">
                <p class="text-xs text-gray-400">{{ s.latitude?`📍 ${s.latitude.toFixed(4)}, ${s.longitude.toFixed(4)}`:'No GPS' }}</p>
            <div class="flex items-center gap-2">

                <span class="font-black text-lg" style="color:#6EAE21">
                  +{{ s.total_points }}pts
                </span>

                <input
                  v-model.number="s.total_points"
                  type="number"
                  min="0"
                  class="w-20 bg-gray-800 border border-gray-700 text-white text-xs px-2 py-1 rounded-lg"
                />

              </div>
              </div>
              <div v-if="s.status==='pending'" class="space-y-2">
                <input v-model="notes[s.id]" type="text" placeholder="Optional note to user..." class="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none"/>
                <div class="flex gap-2">
                  <button @click="handleApprove(s)" :disabled="reviewing===s.id" class="flex-1 text-white font-bold py-2.5 rounded-xl text-sm disabled:opacity-50 flex items-center justify-center gap-1" style="background:#6EAE21">✅ Approve</button>
                  <button @click="handleReject(s)"  :disabled="reviewing===s.id" class="flex-1 bg-red-600 text-white font-bold py-2.5 rounded-xl text-sm disabled:opacity-50 flex items-center justify-center gap-1">❌ Reject</button>
                </div>
              </div>
              <div v-else class="rounded-xl px-3 py-2 bg-gray-800">
                <p class="text-gray-400 text-xs">{{ s.status==='approved'?'✅ Approved':'❌ Rejected' }} {{ formatDate(s.reviewed_at) }}<span v-if="s.admin_note"> · "{{ s.admin_note }}"</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== HOTSPOTS ===== -->
      <div v-if="activeTab==='hotspots'" class="flex flex-col" style="height:calc(100vh - 120px)">
        <div class="px-4 py-3 flex items-center justify-between flex-shrink-0" style="background:#1a1a1a">
          <div>
            <p v-if="pinningMode" class="text-xs font-bold" style="color:#6EAE21">📍 Click anywhere on the map to drop a pin</p>
            <p v-else class="text-xs text-gray-400">Admin-defined hotspot zones · CSU Campus</p>
            <p v-if="pinningMode" class="text-xs text-gray-500 mt-0.5">Click within the green campus boundary</p>
          </div>
          <button @click="togglePinMode" :style="pinningMode?'background:#ef4444':'background:#6EAE21'" class="text-white text-xs font-bold px-4 py-2 rounded-xl transition flex-shrink-0 ml-2">
            {{ pinningMode ? '✕ Cancel' : '+ Add Zone' }}
          </button>
        </div>

        <!-- Map -->
        <div class="flex-1 relative min-h-0" style="min-height:300px">
          <div ref="adminMapRef" class="w-full h-full" style="z-index:0" />
          <div class="absolute top-3 right-3 z-10 rounded-xl px-3 py-2 text-xs space-y-1" style="background:rgba(0,0,0,0.8)">
            <div class="flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full inline-block bg-red-500"/>High</div>
            <div class="flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full inline-block bg-yellow-400"/>Medium</div>
            <div class="flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full inline-block" style="background:#086A9C"/>Low</div>
          </div>
        </div>

        <!-- New pin form -->
        <transition name="slide-up">
          <div v-if="newPin" class="flex-shrink-0 bg-gray-900 border-t border-gray-700 px-4 py-4 space-y-3">
            <div class="flex items-center justify-between">
              <p class="text-white font-bold text-sm">📍 Pin at {{ newPin.lat.toFixed(5) }}, {{ newPin.lng.toFixed(5) }}</p>
              <button @click="cancelPin" class="text-gray-400 text-xs">Clear</button>
            </div>
            <input v-model="newHotspot.name" placeholder="Zone name (e.g. Engineering Bldg)" class="w-full bg-gray-800 text-white px-4 py-2.5 rounded-xl text-sm focus:outline-none border border-gray-700 focus:border-green-500"/>
            <input v-model="newHotspot.description" placeholder="Description (optional)" class="w-full bg-gray-800 text-white px-4 py-2.5 rounded-xl text-sm focus:outline-none border border-gray-700"/>
            <select v-model="newHotspot.severity" class="w-full bg-gray-800 text-white px-4 py-2.5 rounded-xl text-sm focus:outline-none border border-gray-700">
              <option value="low">🔵 Low Risk</option>
              <option value="medium">🟡 Medium Risk</option>
              <option value="high">🔴 High Risk</option>
            </select>
            <div class="flex gap-2">
              <button @click="cancelPin" class="flex-1 bg-gray-700 text-white font-bold py-2.5 rounded-xl text-sm">Cancel</button>
              <button @click="saveHotspot" :disabled="!newHotspot.name" class="flex-1 text-white font-bold py-2.5 rounded-xl text-sm disabled:opacity-40" style="background:#6EAE21">Save Zone</button>
            </div>
          </div>
        </transition>

        <!-- Hotspot list -->
        <div class="flex-shrink-0 max-h-40 overflow-y-auto border-t border-gray-800" style="background:#111">
          <div v-if="!adminHotspots.length" class="px-4 py-4 text-gray-500 text-sm text-center">No zones yet. Click "+ Add Zone" then tap the map.</div>
          <div v-for="h in adminHotspots" :key="h.id" class="flex items-center gap-3 px-4 py-2.5 border-b border-gray-800/50">
            <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0"
              :style="h.severity==='high'?'background:#ef4444':h.severity==='medium'?'background:#eab308':'background:#086A9C'">
              {{ h.severity==='high'?'🔴':h.severity==='medium'?'🟡':'🔵' }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-white text-sm font-semibold truncate">{{ h.name }}</p>
              <p class="text-gray-400 text-xs">{{ h.latitude.toFixed(5) }}, {{ h.longitude.toFixed(5) }}</p>
            </div>
            <button @click="deleteHotspot(h.id)" class="text-red-400 text-xs font-bold px-2 flex-shrink-0">Delete</button>
          </div>
        </div>
      </div>

      <!-- ===== IEC ===== -->
      <div v-if="activeTab==='iec'" class="px-4 mt-4 space-y-4">
        <div class="flex items-center justify-between">
          <p class="text-white font-bold">IEC Materials</p>
          <button @click="showAddIEC=true" class="text-white text-sm font-bold px-4 py-2 rounded-xl" style="background:#086A9C">+ Add</button>
        </div>
        <div v-for="m in iecList" :key="m.id" class="bg-gray-900 rounded-2xl overflow-hidden border border-gray-800">
          <img :src="m.image_url" class="w-full h-32 object-cover bg-gray-800"/>
          <div class="p-3 flex items-start justify-between gap-2">
            <div class="flex-1"><p class="text-white font-bold text-sm">{{ m.title }}</p><p class="text-gray-400 text-xs">{{ m.type }}</p></div>
            <button @click="deleteIEC(m.id)" class="text-red-400 text-xs font-bold">Delete</button>
          </div>
        </div>
        <div v-if="!iecList.length" class="text-center py-8 text-gray-500"><span class="text-4xl block mb-2">📋</span>No materials</div>
        <div v-if="showAddIEC" class="fixed inset-0 z-50 bg-black/90 flex items-end">
          <div class="w-full bg-gray-900 rounded-t-3xl p-6 space-y-3">
            <p class="text-white font-black text-lg">Add IEC Material</p>
            <input v-model="newIEC.title" placeholder="Title" class="w-full bg-gray-800 text-white px-4 py-3 rounded-xl text-sm focus:outline-none"/>
            <input v-model="newIEC.description" placeholder="Description" class="w-full bg-gray-800 text-white px-4 py-3 rounded-xl text-sm focus:outline-none"/>
            <input v-model="newIEC.image_url" placeholder="Image URL" class="w-full bg-gray-800 text-white px-4 py-3 rounded-xl text-sm focus:outline-none"/>
            <select v-model="newIEC.type" class="w-full bg-gray-800 text-white px-4 py-3 rounded-xl text-sm focus:outline-none">
              <option value="image">🖼️ Image</option><option value="poster">📋 Poster</option><option value="announcement">📢 Announcement</option>
            </select>
            <div class="flex gap-2 pt-2">
              <button @click="showAddIEC=false" class="flex-1 bg-gray-700 text-white font-bold py-3 rounded-2xl">Cancel</button>
              <button @click="saveIEC" class="flex-1 text-white font-bold py-3 rounded-2xl" style="background:#086A9C">Save</button>
            </div>
          </div>
        </div>
      </div>

    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useAuthStore } from '@/modules/auth/store/authStore.js'
import { submissionApi } from '@/services/api/submissionApi.js'
import { supabase } from '@/services/supabase/client.js'

// Fix Leaflet default icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const CSU_CENTER = [8.9535, 125.5975]
const CSU_BOUNDS = L.latLngBounds([8.9470,125.5900],[8.9610,125.6060])

const authStore   = useAuthStore()
const submissions = ref([])
const loading     = ref(true)
const reviewing   = ref(null)
const notes       = ref({})
const filter      = ref('pending')
const activeTab   = ref('submissions')
const trends      = ref([])
const topLocations = ref([])
const adminHotspots = ref([])
const iecList     = ref([])
const showAddIEC  = ref(false)
const newIEC      = ref({ title:'', description:'', image_url:'', type:'image' })

// Map refs
const adminMapRef = ref(null)
let adminMap      = null
let tempMarker    = null
const hotspotLayerGroup = ref(null)

// Pinning state
const pinningMode = ref(false)
const newPin      = ref(null)
const newHotspot  = ref({ name:'', description:'', severity:'medium' })

const tabs = [
  { key:'submissions', label:'📋 Submissions' },
  { key:'analytics',   label:'📊 Analytics'   },
  { key:'hotspots',    label:'📍 Hotspots'     },
  { key:'iec',         label:'📢 IEC'          },
]

const isAdmin      = computed(() => authStore.profile?.is_admin === true)
const pendingCount = computed(() => submissions.value.filter(s=>s.status==='pending').length)
const filteredSubs = computed(() => filter.value==='all' ? submissions.value : submissions.value.filter(s=>s.status===filter.value))
const analytics    = computed(() => ({
  total:    submissions.value.length,
  approved: submissions.value.filter(s=>s.status==='approved').length,
  points:   submissions.value.filter(s=>s.status==='approved').reduce((s,x)=>s+x.total_points,0),
  users:    new Set(submissions.value.map(s=>s.user_id)).size
}))
const maxTrend = computed(() => Math.max(...trends.value.map(t=>t.total_submissions),1))
function barPct(v) { return Math.max((v/maxTrend.value)*100,4) }
function formatWeek(iso) { return new Date(iso).toLocaleDateString('en-PH',{month:'short',day:'numeric'}) }
function formatDate(iso)  { if(!iso)return''; return new Date(iso).toLocaleDateString('en-PH',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}) }

// ── Admin Map ──────────────────────────────────────────────────
function getMarkerColor(severity) {
  if (severity === 'high')   return '#ef4444'
  if (severity === 'medium') return '#eab308'
  return '#086A9C'
}

function buildPulseIcon(color) {
  const s = 16
  return L.divIcon({
    className: '',
    html: `<div style="position:relative;width:${s*3}px;height:${s*3}px;display:flex;align-items:center;justify-content:center">
      <div style="position:absolute;width:${s*3}px;height:${s*3}px;border-radius:50%;background:${color};opacity:0.12;animation:rp 2s ease-out infinite"></div>
      <div style="position:absolute;width:${s*2}px;height:${s*2}px;border-radius:50%;background:${color};opacity:0.2;animation:rp 2s ease-out infinite 0.5s"></div>
      <div style="position:relative;width:${s}px;height:${s}px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 0 10px ${color},0 2px 6px rgba(0,0,0,0.5)"></div>
      <style>@keyframes rp{0%{transform:scale(.4);opacity:.5}100%{transform:scale(2.2);opacity:0}}</style>
    </div>`,
    iconSize:   [s*3, s*3],
    iconAnchor: [s*1.5, s*1.5],
    popupAnchor:[0, -s*1.5]
  })
}

function renderHotspotMarkers() {
  if (!adminMap || !hotspotLayerGroup.value) return
  hotspotLayerGroup.value.clearLayers()
  adminHotspots.value.forEach(h => {
    const color = getMarkerColor(h.severity)
    const icon  = buildPulseIcon(color)
    L.marker([h.latitude, h.longitude], { icon })
      .addTo(hotspotLayerGroup.value)
      .bindPopup(`<b style="color:${color}">📍 ${h.name}</b><br><small>${h.description||''}</small><br><small style="color:#888">${h.severity} risk</small>`)
  })
}

function initAdminMap() {
  if (adminMap) {
    adminMap.invalidateSize()
    return
  }
  if (!adminMapRef.value) return

  adminMap = L.map(adminMapRef.value, {
    center: CSU_CENTER, zoom: 17,
    minZoom: 14, maxZoom: 19,
    maxBounds: CSU_BOUNDS,
    maxBoundsViscosity: 0.8
  })

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap', maxZoom: 19
  }).addTo(adminMap)

  // Campus boundary
L.rectangle(CSU_BOUNDS, {
  color: '#6EAE21',
  weight: 2,
  fillColor: '#6EAE21',
  fillOpacity: 0.04,
  dashArray: '6,6',
  interactive: false   // 🔥 THIS FIXES IT
}).addTo(adminMap)

  // Layer group for hotspot markers
  hotspotLayerGroup.value = L.layerGroup().addTo(adminMap)

  // Map click handler
  adminMap.on('click', (e) => {
    if (!pinningMode.value) return
    const { lat, lng } = e.latlng
    newPin.value = { lat, lng }

    // Remove old temp marker
    if (tempMarker) { adminMap.removeLayer(tempMarker); tempMarker = null }

    // Drop a teardrop pin
    const icon = L.divIcon({
      className: '',
      html: `<div style="display:flex;flex-direction:column;align-items:center">
        <div style="width:20px;height:20px;background:#6EAE21;border-radius:50%;border:3px solid white;box-shadow:0 0 0 3px #6EAE2160,0 4px 12px rgba(0,0,0,0.5)"></div>
        <div style="width:2px;height:12px;background:#6EAE21;margin-top:-1px"></div>
      </div>`,
      iconSize:   [20, 32],
      iconAnchor: [10, 32]
    })
    tempMarker = L.marker([lat, lng], { icon }).addTo(adminMap)
      .bindPopup(`📍 ${lat.toFixed(5)}, ${lng.toFixed(5)}`).openPopup()
  })

  // Render existing hotspots
  renderHotspotMarkers()
  adminMap.invalidateSize()
}

function togglePinMode() {
  pinningMode.value = !pinningMode.value
  if (!pinningMode.value) cancelPin()
  if (adminMap) {
    adminMap.getContainer().style.cursor = pinningMode.value ? 'crosshair' : ''
  }
}

function cancelPin() {
  newPin.value = null
  newHotspot.value = { name:'', description:'', severity:'medium' }
  if (tempMarker && adminMap) { adminMap.removeLayer(tempMarker); tempMarker = null }
  if (adminMap) adminMap.getContainer().style.cursor = ''
}

async function saveHotspot() {
  if (!newPin.value || !newHotspot.value.name.trim()) return
  const payload = {
    name:        newHotspot.value.name.trim(),
    description: newHotspot.value.description.trim(),
    severity:    newHotspot.value.severity,
    latitude:    newPin.value.lat,
    longitude:   newPin.value.lng,
    is_active:   true,
    created_by:  authStore.user.id
  }
  const { data, error } = await supabase.from('admin_hotspots').insert(payload).select().single()
  if (error) { alert('Save failed: ' + error.message); return }
  adminHotspots.value.push(data)
  renderHotspotMarkers()
  cancelPin()
  pinningMode.value = false
  adminMap.getContainer().style.cursor = ''
}

async function deleteHotspot(id) {
  const { error } = await supabase.from('admin_hotspots').update({ is_active: false }).eq('id', id)
  if (error) { alert('Delete failed: ' + error.message); return }
  adminHotspots.value = adminHotspots.value.filter(h => h.id !== id)
  renderHotspotMarkers()
}

// Reinit map whenever hotspots tab becomes active
watch(activeTab, async (tab) => {
  if (tab !== 'hotspots') return
  await nextTick()
  await nextTick()
  setTimeout(() => initAdminMap(), 300)
})

// ── Data Loading ───────────────────────────────────────────────
async function loadHotspots() {
  const { data } = await supabase.from('admin_hotspots').select('*').eq('is_active', true).order('created_at', { ascending: false })
  adminHotspots.value = data ?? []
}

async function loadAll() {
  loading.value = true
  const [subs, trendData, locData] = await Promise.all([
    submissionApi.getAllSubmissions().catch(()=>[]),
    supabase.from('submission_trends').select('*').then(r=>r.data??[]),
    supabase.from('top_locations').select('*').then(r=>r.data??[]),
  ])
  submissions.value  = subs
  trends.value       = trendData
  topLocations.value = locData
  await loadHotspots()
  const { data: iec } = await supabase.from('iec_materials').select('*').order('created_at', { ascending: false })
  iecList.value = iec ?? []
  loading.value = false
}

async function handleApprove(s) {
  reviewing.value = s.id

  try {
    const r = await submissionApi.approveSubmission(
      s.id,
      authStore.user.id,
      notes.value[s.id] || '',
      Number(s.total_points) // 🔥 FORCE UPDATED VALUE
    )

    if (r?.success) {
      s.status = 'approved'
      s.admin_note = notes.value[s.id]
      s.reviewed_at = new Date().toISOString()
    } else {
      alert(r?.error ?? 'Approval failed')
    }

  } catch (e) {
    alert(e.message)
  } finally {
    reviewing.value = null
  }
}
async function handleReject(s) {
  reviewing.value = s.id
  try {
    const r = await submissionApi.rejectSubmission(s.id, authStore.user.id, notes.value[s.id]||'')
    if (r?.success) { s.status='rejected'; s.admin_note=notes.value[s.id]; s.reviewed_at=new Date().toISOString() }
    else alert(r?.error??'Rejection failed')
  } catch(e){alert(e.message)} finally { reviewing.value=null }
}

async function saveIEC() {
  const m = newIEC.value
  if (!m.title||!m.image_url) return
  const { error } = await supabase.from('iec_materials').insert({...m, created_by: authStore.user.id})
  if (!error) { await loadAll(); showAddIEC.value=false; newIEC.value={title:'',description:'',image_url:'',type:'image'} }
}
async function deleteIEC(id) {
  await supabase.from('iec_materials').update({is_active:false}).eq('id',id)
  iecList.value = iecList.value.filter(m=>m.id!==id)
}

onMounted(() => loadAll())
onUnmounted(() => { if(adminMap){ adminMap.remove(); adminMap=null } })
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar{display:none}
.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}
.slide-up-enter-active,.slide-up-leave-active{transition:all 0.3s ease}
.slide-up-enter-from,.slide-up-leave-to{opacity:0;transform:translateY(16px)}
</style>
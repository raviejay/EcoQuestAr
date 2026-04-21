<template>
  <div class="min-h-screen text-white pb-10" style="background:#0a0a0a">

    <div class="px-4 pt-10 pb-3 border-b border-gray-800" style="background:#111">
      <h1 class="text-xl font-black">🛡️ Admin Panel</h1>
      <div class="flex gap-2 mt-3 overflow-x-auto no-scrollbar pb-1">
        <button v-for="t in tabs" :key="t.key" @click="activeTab = t.key"
          :class="activeTab === t.key ? 'text-white' : 'text-gray-400 bg-gray-800'"
          :style="activeTab === t.key ? 'background:#6EAE21' : ''"
          class="px-4 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1 flex-shrink-0">
          {{ t.label }}
          <span v-if="t.key==='submissions' && pendingCount" class="bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">{{ pendingCount }}</span>
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
          <div class="bg-gray-900 rounded-2xl p-4 border border-gray-800">
            <p class="text-gray-400 text-xs">Total Submissions</p>
            <p class="text-2xl font-black mt-1" style="color:#6EAE21">{{ analytics.total }}</p>
          </div>
          <div class="bg-gray-900 rounded-2xl p-4 border border-gray-800">
            <p class="text-gray-400 text-xs">Approved</p>
            <p class="text-2xl font-black mt-1" style="color:#6DCEDA">{{ analytics.approved }}</p>
          </div>
          <div class="bg-gray-900 rounded-2xl p-4 border border-gray-800">
            <p class="text-gray-400 text-xs">Points Awarded</p>
            <p class="text-2xl font-black mt-1 text-yellow-400">{{ analytics.points }}</p>
          </div>
          <div class="bg-gray-900 rounded-2xl p-4 border border-gray-800">
            <p class="text-gray-400 text-xs">Active Users</p>
            <p class="text-2xl font-black mt-1" style="color:#086A9C">{{ analytics.users }}</p>
          </div>
        </div>

        <div class="bg-gray-900 rounded-2xl p-4 border border-gray-800">
          <p class="text-white font-bold mb-3">📈 Weekly Trend</p>
          <div v-if="trends.length" class="space-y-2">
            <div v-for="(t,i) in trends.slice(0,6)" :key="i" class="flex items-center gap-3">
              <span class="text-gray-400 text-xs w-20 flex-shrink-0">{{ formatWeek(t.week) }}</span>
              <div class="flex-1 h-5 bg-gray-800 rounded-full overflow-hidden">
                <div class="h-full rounded-full transition-all duration-700"
                  :style="{width: barPct(t.total_submissions)+'%', background:'linear-gradient(90deg,#6EAE21,#6DCEDA)'}"/>
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
              <div class="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0"
                :style="i===0?'background:#ef4444':i<3?'background:#eab308':'background:#6EAE21'">{{ i+1 }}</div>
              <div class="flex-1">
                <p class="text-gray-300 text-xs">{{ l.lat.toFixed(4) }}, {{ l.lng.toFixed(4) }}</p>
                <div class="w-full h-1.5 bg-gray-800 rounded-full mt-1">
                  <div class="h-full rounded-full" :style="{width:(l.report_count/topLocations[0].report_count*100)+'%',background:'#6EAE21'}"/>
                </div>
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
          <button v-for="f in ['all','pending','approved','rejected']" :key="f"
            @click="filter=f"
            :class="filter===f?'text-white':'text-gray-400 bg-gray-800'"
            :style="filter===f?'background:#086A9C':''"
            class="px-3 py-1.5 rounded-xl text-xs font-bold transition capitalize flex-shrink-0">{{ f }}</button>
        </div>

        <div v-if="loading" class="flex justify-center py-12">
          <div class="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin" style="border-color:#6EAE21;border-top-color:transparent"/>
        </div>
        <div v-else-if="!filteredSubs.length" class="text-center py-12 text-gray-500">
          <span class="text-5xl block mb-3">📭</span>No {{ filter }} submissions
        </div>

        <div v-else class="space-y-4">
          <div v-for="s in filteredSubs" :key="s.id" class="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            <div class="flex gap-1">
              <img :src="s.proof_photo_url" class="flex-1 h-44 object-cover bg-gray-800" />
              <img v-if="s.selfie_photo_url" :src="s.selfie_photo_url" class="w-28 h-44 object-cover bg-gray-800" />
            </div>
            <div class="p-4">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm" style="background:#6EAE21">
                    {{ s.profiles?.username?.charAt(0).toUpperCase() ?? '?' }}</div>
                  <div>
                    <p class="text-white text-sm font-semibold">{{ s.profiles?.username ?? 'Unknown' }}</p>
                    <p class="text-gray-400 text-xs">{{ formatDate(s.submitted_at) }}</p>
                  </div>
                </div>
                <div class="flex gap-1.5">
                  <span v-if="s.submission_type==='manual'" class="text-xs font-bold px-2 py-0.5 rounded-full" style="background:#1e3a5f;color:#6DCEDA">Manual</span>
                  <span :class="{
                    'bg-yellow-500/20 text-yellow-400':s.status==='pending',
                    'bg-green-500/20 text-green-400': s.status==='approved',
                    'bg-red-500/20 text-red-400':     s.status==='rejected'
                  }" class="text-xs font-bold px-2 py-0.5 rounded-full uppercase">{{ s.status }}</span>
                </div>
              </div>

              <div class="flex flex-wrap gap-1.5 mb-3">
                <span v-for="(item,i) in (s.detected_items||[])" :key="i"
                  class="bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded-full">
                  {{ item.class }} <span class="font-bold" style="color:#6EAE21">+{{ item.points }}</span>
                </span>
              </div>

              <div class="flex items-center justify-between mb-3">
                <p class="text-xs text-gray-400">{{ s.latitude ? `📍 ${s.latitude.toFixed(4)}, ${s.longitude.toFixed(4)}` : 'No GPS' }}</p>
                <p class="font-black text-lg" style="color:#6EAE21">+{{ s.total_points }}pts</p>
              </div>

              <div v-if="s.status==='pending'" class="space-y-2">
                <input v-model="notes[s.id]" type="text" placeholder="Optional note to user..."
                  class="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none"/>
                <div class="flex gap-2">
                  <button @click="handleApprove(s)" :disabled="reviewing===s.id"
                    class="flex-1 text-white font-bold py-2.5 rounded-xl text-sm disabled:opacity-50 flex items-center justify-center gap-1"
                    style="background:#6EAE21">✅ Approve</button>
                  <button @click="handleReject(s)" :disabled="reviewing===s.id"
                    class="flex-1 bg-red-600 text-white font-bold py-2.5 rounded-xl text-sm disabled:opacity-50 flex items-center justify-center gap-1">❌ Reject</button>
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
        <!-- Instruction bar -->
        <div class="px-4 py-3 flex items-center justify-between flex-shrink-0" style="background:#1a1a1a">
          <p class="text-xs text-gray-300">
            <span v-if="pinningMode" style="color:#6EAE21" class="font-bold">📍 Tap the map to place a hotspot pin</span>
            <span v-else class="text-gray-400">Admin-defined hotspot zones on CSU campus</span>
          </p>
          <button @click="togglePinMode"
            :style="pinningMode ? 'background:#ef4444' : 'background:#6EAE21'"
            class="text-white text-xs font-bold px-4 py-1.5 rounded-xl transition">
            {{ pinningMode ? '✕ Cancel' : '+ Add Zone' }}
          </button>
        </div>

        <!-- Map -->
        <div class="flex-1 relative min-h-0">
          <div ref="adminMapRef" class="w-full h-full z-0" />

          <!-- Heatmap pulse overlay (decorative) -->
          <div class="absolute inset-0 pointer-events-none z-5 flex items-center justify-center">
            <div v-if="adminHotspots.length" class="relative">
              <div v-for="(_,i) in adminHotspots.slice(0,3)" :key="i"
                class="absolute rounded-full opacity-10 animate-ping"
                :style="{
                  width: (80+i*40)+'px', height: (80+i*40)+'px',
                  background:'#6EAE21',
                  top: '50%', left: '50%',
                  transform:'translate(-50%,-50%)',
                  animationDelay: i*0.4+'s',
                  animationDuration: '2.5s'
                }" />
            </div>
          </div>

          <div class="absolute top-3 right-3 z-10 rounded-xl px-3 py-2 text-xs space-y-1" style="background:rgba(0,0,0,0.8)">
            <div class="flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full inline-block bg-red-500"/>High</div>
            <div class="flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full inline-block bg-yellow-400"/>Medium</div>
            <div class="flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full inline-block" style="background:#086A9C"/>Low</div>
          </div>
        </div>

        <!-- Add hotspot form (slides up after pin placed) -->
        <transition name="slide-up">
          <div v-if="newPin" class="flex-shrink-0 bg-gray-900 border-t border-gray-700 px-4 py-4 space-y-3">
            <p class="text-white font-bold text-sm">📍 New Hotspot at {{ newPin.lat.toFixed(5) }}, {{ newPin.lng.toFixed(5) }}</p>
            <input v-model="newHotspot.name" placeholder="Zone name (e.g. Engineering Building)" class="w-full bg-gray-800 text-white px-4 py-2.5 rounded-xl text-sm focus:outline-none border border-gray-700"/>
            <input v-model="newHotspot.description" placeholder="Description (optional)" class="w-full bg-gray-800 text-white px-4 py-2.5 rounded-xl text-sm focus:outline-none border border-gray-700"/>
            <select v-model="newHotspot.severity" class="w-full bg-gray-800 text-white px-4 py-2.5 rounded-xl text-sm focus:outline-none border border-gray-700">
              <option value="low">🔵 Low Risk</option>
              <option value="medium">🟡 Medium Risk</option>
              <option value="high">🔴 High Risk</option>
            </select>
            <div class="flex gap-2">
              <button @click="cancelPin" class="flex-1 bg-gray-700 text-white font-bold py-2.5 rounded-xl text-sm">Cancel</button>
              <button @click="saveHotspot" class="flex-1 text-white font-bold py-2.5 rounded-xl text-sm" style="background:#6EAE21">Save Zone</button>
            </div>
          </div>
        </transition>

        <!-- Hotspot list -->
        <div class="flex-shrink-0 max-h-40 overflow-y-auto border-t border-gray-800" style="background:#111">
          <div v-for="h in adminHotspots" :key="h.id" class="flex items-center gap-3 px-4 py-2.5 border-b border-gray-800/50">
            <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0"
              :style="h.severity==='high'?'background:#ef4444':h.severity==='medium'?'background:#eab308':'background:#086A9C'">
              {{ h.severity==='high'?'🔴':h.severity==='medium'?'🟡':'🔵' }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-white text-sm font-semibold truncate">{{ h.name }}</p>
              <p class="text-gray-400 text-xs">{{ h.latitude.toFixed(4) }}, {{ h.longitude.toFixed(4) }}</p>
            </div>
            <button @click="deleteHotspot(h.id)" class="text-red-400 text-xs font-bold px-2">Delete</button>
          </div>
          <div v-if="!adminHotspots.length" class="px-4 py-4 text-gray-500 text-sm text-center">No zones defined yet</div>
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
            <div class="flex-1">
              <p class="text-white font-bold text-sm">{{ m.title }}</p>
              <p class="text-gray-400 text-xs">{{ m.type }}</p>
            </div>
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
              <option value="image">🖼️ Image</option>
              <option value="poster">📋 Poster</option>
              <option value="announcement">📢 Announcement</option>
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

const authStore = useAuthStore()

// State
const submissions   = ref([])
const loading       = ref(true)
const reviewing     = ref(null)
const notes         = ref({})
const filter        = ref('pending')
const activeTab     = ref('submissions')
const trends        = ref([])
const topLocations  = ref([])
const adminHotspots = ref([])
const iecList       = ref([])
const showAddIEC    = ref(false)
const newIEC        = ref({ title:'', description:'', image_url:'', type:'image' })

// Hotspot map pinning
const adminMapRef = ref(null)
const pinningMode = ref(false)
const newPin      = ref(null)
const newHotspot  = ref({ name:'', description:'', severity:'medium' })
let adminMap = null
let tempMarker = null
let hotspotMarkers = []

const tabs = [
  { key:'submissions', label:'📋 Submissions' },
  { key:'analytics',   label:'📊 Analytics'   },
  { key:'hotspots',    label:'📍 Hotspots'     },
  { key:'iec',         label:'📢 IEC'          },
]

const CSU_CENTER = [8.9535, 125.5975]
const CSU_BOUNDS = L.latLngBounds([8.9470,125.5900],[8.9610,125.6060])

const isAdmin    = computed(() => authStore.profile?.is_admin === true)
const pendingCount = computed(() => submissions.value.filter(s=>s.status==='pending').length)
const filteredSubs = computed(() => filter.value==='all' ? submissions.value : submissions.value.filter(s=>s.status===filter.value))
const analytics  = computed(() => ({
  total:    submissions.value.length,
  approved: submissions.value.filter(s=>s.status==='approved').length,
  points:   submissions.value.filter(s=>s.status==='approved').reduce((s,x)=>s+x.total_points,0),
  users:    new Set(submissions.value.map(s=>s.user_id)).size
}))
const maxTrend   = computed(() => Math.max(...trends.value.map(t=>t.total_submissions),1))
function barPct(v) { return Math.max((v/maxTrend.value)*100,4) }
function formatWeek(iso) { return new Date(iso).toLocaleDateString('en-PH',{month:'short',day:'numeric'}) }
function formatDate(iso)  { if(!iso)return''; return new Date(iso).toLocaleDateString('en-PH',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}) }

// Hotspot map
function initAdminMap() {
  if (!adminMapRef.value || adminMap) return
  adminMap = L.map(adminMapRef.value, {
    center: CSU_CENTER, zoom: 17, minZoom: 15, maxZoom: 19,
    maxBounds: CSU_BOUNDS, maxBoundsViscosity: 1.0
  })
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19}).addTo(adminMap)

  // Campus boundary
  L.rectangle(CSU_BOUNDS,{color:'#6EAE21',weight:2,fillOpacity:0.04,dashArray:'6,6'})
    .addTo(adminMap).bindPopup('<b>🏫 CSU Main Campus</b>')

  // Click to pin
  adminMap.on('click', (e) => {
    if (!pinningMode.value) return
    const { lat, lng } = e.latlng
    newPin.value = { lat, lng }

    if (tempMarker) adminMap.removeLayer(tempMarker)
    const icon = L.divIcon({
      className:'',
      html:`<div style="width:24px;height:24px;background:#6EAE21;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.5)"></div>`,
      iconSize:[24,24], iconAnchor:[12,24]
    })
    tempMarker = L.marker([lat,lng],{icon}).addTo(adminMap).bindPopup('📍 New hotspot here').openPopup()
  })

  renderAdminHotspots()
}

function renderAdminHotspots() {
  hotspotMarkers.forEach(m => adminMap?.removeLayer(m))
  hotspotMarkers = []
  adminHotspots.value.forEach(h => {
    const color = h.severity==='high'?'#ef4444':h.severity==='medium'?'#eab308':'#086A9C'
    const icon  = L.divIcon({
      className:'',
      html:`<div style="position:relative">
        <div style="width:20px;height:20px;background:${color};border-radius:50%;border:3px solid white;box-shadow:0 0 0 4px ${color}44"></div>
        <div style="position:absolute;top:-2px;left:-2px;width:24px;height:24px;border-radius:50%;background:${color};opacity:0.3;animation:ping 2s infinite"></div>
      </div>`,
      iconSize:[20,20], iconAnchor:[10,10]
    })
    const m = L.marker([h.latitude,h.longitude],{icon})
      .addTo(adminMap)
      .bindPopup(`<b>${h.name}</b><br><small>${h.severity} risk</small>`)
    hotspotMarkers.push(m)
  })
}

function togglePinMode() {
  pinningMode.value = !pinningMode.value
  if (!pinningMode.value) cancelPin()
  if (adminMap) adminMap.getContainer().style.cursor = pinningMode.value ? 'crosshair' : ''
}

function cancelPin() {
  newPin.value = null
  newHotspot.value = { name:'', description:'', severity:'medium' }
  if (tempMarker) { adminMap?.removeLayer(tempMarker); tempMarker = null }
}

async function saveHotspot() {
  if (!newPin.value || !newHotspot.value.name) return
  const { error } = await supabase.from('admin_hotspots').insert({
    name: newHotspot.value.name,
    description: newHotspot.value.description,
    severity: newHotspot.value.severity,
    latitude: newPin.value.lat,
    longitude: newPin.value.lng,
    created_by: authStore.user.id
  })
  if (error) { alert(error.message); return }
  await loadHotspots()
  renderAdminHotspots()
  cancelPin()
  pinningMode.value = false
  if (adminMap) adminMap.getContainer().style.cursor = ''
}

async function deleteHotspot(id) {
  await supabase.from('admin_hotspots').update({is_active:false}).eq('id',id)
  adminHotspots.value = adminHotspots.value.filter(h=>h.id!==id)
  renderAdminHotspots()
}

// Watch tab switch to init map
watch(activeTab, async (tab) => {
  if (tab === 'hotspots') {
    await nextTick()
    setTimeout(() => { initAdminMap(); adminMap?.invalidateSize() }, 100)
  }
})

async function loadHotspots() {
  const { data } = await supabase.from('admin_hotspots').select('*').eq('is_active',true)
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
  const { data: iec } = await supabase.from('iec_materials').select('*').order('created_at',{ascending:false})
  iecList.value = iec ?? []
  loading.value = false
}

async function handleApprove(s) {
  reviewing.value = s.id
  try {
    const r = await submissionApi.approveSubmission(s.id, authStore.user.id, notes.value[s.id]||'')
    if (r?.success) { s.status='approved'; s.admin_note=notes.value[s.id]; s.reviewed_at=new Date().toISOString() }
    else alert(r?.error??'Failed')
  } catch(e){alert(e.message)} finally { reviewing.value=null }
}
async function handleReject(s) {
  reviewing.value = s.id
  try {
    const r = await submissionApi.rejectSubmission(s.id, authStore.user.id, notes.value[s.id]||'')
    if (r?.success) { s.status='rejected'; s.admin_note=notes.value[s.id]; s.reviewed_at=new Date().toISOString() }
    else alert(r?.error??'Failed')
  } catch(e){alert(e.message)} finally { reviewing.value=null }
}

async function saveIEC() {
  const m = newIEC.value
  if (!m.title||!m.image_url) return
  const { error } = await supabase.from('iec_materials').insert({...m, created_by:authStore.user.id})
  if (!error) { await loadAll(); showAddIEC.value=false; newIEC.value={title:'',description:'',image_url:'',type:'image'} }
}
async function deleteIEC(id) {
  await supabase.from('iec_materials').update({is_active:false}).eq('id',id)
  iecList.value = iecList.value.filter(m=>m.id!==id)
}

onMounted(() => loadAll())
onUnmounted(() => { if(adminMap){adminMap.remove();adminMap=null} })
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar{display:none}
.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}
.slide-up-enter-active,.slide-up-leave-active{transition:all 0.3s ease}
.slide-up-enter-from,.slide-up-leave-to{opacity:0;transform:translateY(20px)}
@keyframes ping{0%{transform:scale(1);opacity:0.4}70%{transform:scale(2);opacity:0}100%{transform:scale(2.5);opacity:0}}
</style>
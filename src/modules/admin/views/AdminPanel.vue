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
      <div v-if="activeTab==='analytics'" class="px-4 mt-4 space-y-4 pb-6">

        <!-- KPI Cards -->
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

        <!-- Approval Rate Donut -->
        <div class="bg-gray-900 rounded-2xl p-4 border border-gray-800">
          <p class="text-white font-bold mb-3">✅ Approval Rate</p>
          <div class="flex items-center gap-6">
            <div class="relative w-24 h-24 flex-shrink-0">
              <canvas ref="donutRef" width="96" height="96"/>
              <div class="absolute inset-0 flex flex-col items-center justify-center">
                <span class="text-lg font-black text-white">{{ approvalRate }}%</span>
              </div>
            </div>
            <div class="space-y-2 flex-1">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full flex-shrink-0" style="background:#6EAE21"/>
                <span class="text-gray-400 text-xs flex-1">Approved</span>
                <span class="text-white text-xs font-bold">{{ analytics.approved }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full flex-shrink-0 bg-red-500"/>
                <span class="text-gray-400 text-xs flex-1">Rejected</span>
                <span class="text-white text-xs font-bold">{{ analytics.rejected }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full flex-shrink-0 bg-yellow-500"/>
                <span class="text-gray-400 text-xs flex-1">Pending</span>
                <span class="text-white text-xs font-bold">{{ analytics.pending }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- AI vs Manual Donut -->
        <div class="bg-gray-900 rounded-2xl p-4 border border-gray-800">
          <p class="text-white font-bold mb-3">🤖 AI vs Manual Submissions</p>
          <div class="flex items-center gap-4">
            <div class="relative w-24 h-24 flex-shrink-0">
              <canvas ref="typeDonutRef" width="96" height="96"/>
              <div class="absolute inset-0 flex flex-col items-center justify-center">
                <span class="text-xs font-black text-gray-400">Type</span>
              </div>
            </div>
            <div class="space-y-2 flex-1">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full flex-shrink-0" style="background:#6DCEDA"/>
                <span class="text-gray-400 text-xs flex-1">AI Detection</span>
                <span class="text-white text-xs font-bold">{{ submissionTypes.ai }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full flex-shrink-0" style="background:#086A9C"/>
                <span class="text-gray-400 text-xs flex-1">Manual</span>
                <span class="text-white text-xs font-bold">{{ submissionTypes.manual }}</span>
              </div>
              <div class="mt-2">
                <div class="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div class="h-full rounded-full transition-all duration-700"
                    :style="{width: submissionTypes.aiPct+'%', background:'linear-gradient(90deg,#6DCEDA,#086A9C)'}"/>
                </div>
                <p class="text-gray-500 text-xs mt-1">{{ submissionTypes.aiPct }}% AI-detected</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Weekly Submissions Bar Chart -->
        <div class="bg-gray-900 rounded-2xl p-4 border border-gray-800">
          <p class="text-white font-bold mb-3">📈 Weekly Submissions (Last 6 Weeks)</p>
          <div v-if="trends.length">
            <canvas ref="weeklyBarRef" height="160"/>
          </div>
          <p v-else class="text-gray-500 text-sm text-center py-4">No data yet</p>
        </div>

        <!-- Points Awarded Per Week Line Chart -->
        <div class="bg-gray-900 rounded-2xl p-4 border border-gray-800">
          <p class="text-white font-bold mb-3">🏆 Points Awarded Per Week</p>
          <div v-if="trends.length">
            <canvas ref="pointsLineRef" height="140"/>
          </div>
          <p v-else class="text-gray-500 text-sm text-center py-4">No data yet</p>
        </div>

        <!-- Top Trash Classes -->
        <div class="bg-gray-900 rounded-2xl p-4 border border-gray-800">
          <p class="text-white font-bold mb-3">🗑️ Top Detected Trash Types</p>
          <div v-if="topTrashClasses.length" class="space-y-2.5">
            <div v-for="(item, i) in topTrashClasses" :key="i">
              <div class="flex items-center justify-between mb-1">
                <span class="text-gray-300 text-xs capitalize">{{ item.class }}</span>
                <span class="text-xs font-bold" style="color:#6EAE21">{{ item.count }} items</span>
              </div>
              <div class="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
                <div class="h-full rounded-full transition-all duration-700"
                  :style="{
                    width: (item.count / topTrashClasses[0].count * 100) + '%',
                    background: i === 0
                      ? 'linear-gradient(90deg,#6EAE21,#6DCEDA)'
                      : i === 1
                      ? 'linear-gradient(90deg,#086A9C,#6DCEDA)'
                      : 'linear-gradient(90deg,#374151,#6EAE21)'
                  }"/>
              </div>
            </div>
          </div>
          <p v-else class="text-gray-500 text-sm text-center py-4">No detection data yet</p>
        </div>

        <!-- Confidence Tier Breakdown Bar Chart -->
        <div class="bg-gray-900 rounded-2xl p-4 border border-gray-800">
          <p class="text-white font-bold mb-1">🎯 Detection Confidence Tiers</p>
          <p class="text-gray-500 text-xs mb-3">Based on approved AI submissions</p>
          <div v-if="confidenceTiers.some(t => t.count > 0)">
            <canvas ref="confidenceBarRef" height="140"/>
          </div>
          <p v-else class="text-gray-500 text-sm text-center py-4">No detection data yet</p>
        </div>

        <!-- Top Locations -->
        <div class="bg-gray-900 rounded-2xl p-4 border border-gray-800">
          <p class="text-white font-bold mb-3">📍 Top Reported Locations</p>
          <div v-if="topLocations.length" class="space-y-2">
            <div v-for="(l, i) in topLocations.slice(0, 5)" :key="i" class="flex items-center gap-3">
              <div class="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0"
                :style="i===0?'background:#ef4444':i<3?'background:#eab308':'background:#6EAE21'">{{ i+1 }}</div>
              <div class="flex-1">
                <p class="text-gray-300 text-xs">{{ l.lat.toFixed(4) }}, {{ l.lng.toFixed(4) }}</p>
                <div class="w-full h-1.5 bg-gray-800 rounded-full mt-1">
                  <div class="h-full rounded-full"
                    :style="{width:(l.report_count/topLocations[0].report_count*100)+'%',background:'#6EAE21'}"/>
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
          <button v-for="f in ['all','pending','approved','rejected']" :key="f" @click="filter=f"
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
              <img :src="s.proof_photo_url" class="flex-1 h-44 object-cover bg-gray-800"/>
              <img v-if="s.selfie_photo_url" :src="s.selfie_photo_url" class="w-28 h-44 object-cover bg-gray-800"/>
            </div>
            <div class="p-4">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-2">
                  <div class="w-9 h-9 rounded-full flex items-center justify-center font-bold flex-shrink-0 overflow-hidden" style="background:#6EAE21">
                    <img v-if="s.profiles?.avatar_url" :src="s.profiles.avatar_url" class="w-full h-full object-cover"/>
                    <span v-else class="text-white text-sm">{{ s.profiles?.username?.charAt(0).toUpperCase() ?? '?' }}</span>
                  </div>
                  <div>
                    <p class="text-white text-sm font-bold">{{ s.profiles?.full_name || s.profiles?.username }}</p>
                    <p v-if="s.profiles?.school_id" class="text-xs" style="color:#6DCEDA">{{ s.profiles.school_id }}</p>
                    <p class="text-gray-500 text-xs">{{ formatDate(s.submitted_at) }}</p>
                  </div>
                </div>
                <div class="flex gap-1.5 flex-wrap justify-end">
                  <span class="text-xs font-bold px-2 py-0.5 rounded-full"
                    :style="s.submission_type === 'manual' ? 'background:#1e3a5f;color:#6DCEDA' : 'background:#2d2d2d;color:#aaa'">
                    {{ s.submission_type === 'manual' ? 'Manual' : 'AI Detection' }}
                  </span>
                  <span :class="{
                      'bg-yellow-500/20 text-yellow-400': s.status==='pending',
                      'bg-green-500/20 text-green-400':  s.status==='approved',
                      'bg-red-500/20 text-red-400':      s.status==='rejected'
                    }" class="text-xs font-bold px-2 py-0.5 rounded-full uppercase">
                    {{ s.status }}
                  </span>
                </div>
              </div>
              <div class="flex flex-wrap gap-1.5 mb-3">
                <span v-for="(item, i) in (s.detected_items || [])" :key="i"
                  class="bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded-full">
                  {{ item.class }} <span class="font-bold" style="color:#6EAE21">+{{ item.points }}</span>
                </span>
              </div>
              <div class="flex items-center justify-between mb-3">
                <p class="text-xs text-gray-400">{{ s.latitude ? `📍 ${s.latitude.toFixed(4)}, ${s.longitude.toFixed(4)}` : 'No GPS' }}</p>
                <div class="flex items-center gap-2">
                  <span class="font-black text-lg" style="color:#6EAE21">+{{ s.total_points }}pts</span>
                  <input v-model.number="s.total_points" type="number" min="0"
                    class="w-20 bg-gray-800 border border-gray-700 text-white text-xs px-2 py-1 rounded-lg"/>
                </div>
              </div>
              <div v-if="s.status==='pending'" class="space-y-2">
                <input v-model="notes[s.id]" type="text" placeholder="Optional note to user..."
                  class="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none"/>
                <div class="flex gap-2">
                  <button @click="handleApprove(s)" :disabled="reviewing===s.id"
                    class="flex-1 text-white font-bold py-2.5 rounded-xl text-sm disabled:opacity-50 flex items-center justify-center gap-1" style="background:#6EAE21">
                    ✅ Approve
                  </button>
                  <button @click="handleReject(s)" :disabled="reviewing===s.id"
                    class="flex-1 bg-red-600 text-white font-bold py-2.5 rounded-xl text-sm disabled:opacity-50 flex items-center justify-center gap-1">
                    ❌ Reject
                  </button>
                </div>
              </div>
              <div v-else class="rounded-xl px-3 py-2 bg-gray-800">
                <p class="text-gray-400 text-xs">
                  {{ s.status==='approved' ? '✅ Approved' : '❌ Rejected' }} {{ formatDate(s.reviewed_at) }}
                  <span v-if="s.admin_note"> · "{{ s.admin_note }}"</span>
                </p>
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
          <button @click="togglePinMode"
            :style="pinningMode?'background:#ef4444':'background:#6EAE21'"
            class="text-white text-xs font-bold px-4 py-2 rounded-xl transition flex-shrink-0 ml-2">
            {{ pinningMode ? '✕ Cancel' : '+ Add Zone' }}
          </button>
        </div>

        <div class="flex-1 relative min-h-0" style="min-height:300px">
          <div ref="adminMapRef" class="w-full h-full" style="z-index:0"/>
          <div class="absolute top-3 right-3 z-10 rounded-xl px-3 py-2 text-xs space-y-1" style="background:rgba(0,0,0,0.8)">
            <div class="flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full inline-block bg-red-500"/>High</div>
            <div class="flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full inline-block bg-yellow-400"/>Medium</div>
            <div class="flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full inline-block" style="background:#086A9C"/>Low</div>
          </div>
        </div>

        <transition name="slide-up">
          <div v-if="newPin" class="flex-shrink-0 bg-gray-900 border-t border-gray-700 px-4 py-4 space-y-3">
            <div class="flex items-center justify-between">
              <p class="text-white font-bold text-sm">📍 Pin at {{ newPin.lat.toFixed(5) }}, {{ newPin.lng.toFixed(5) }}</p>
              <button @click="cancelPin" class="text-gray-400 text-xs">Clear</button>
            </div>
            <input v-model="newHotspot.name" placeholder="Zone name (e.g. Engineering Bldg)"
              class="w-full bg-gray-800 text-white px-4 py-2.5 rounded-xl text-sm focus:outline-none border border-gray-700 focus:border-green-500"/>
            <input v-model="newHotspot.description" placeholder="Description (optional)"
              class="w-full bg-gray-800 text-white px-4 py-2.5 rounded-xl text-sm focus:outline-none border border-gray-700"/>
            <select v-model="newHotspot.severity" class="w-full bg-gray-800 text-white px-4 py-2.5 rounded-xl text-sm focus:outline-none border border-gray-700">
              <option value="low">🔵 Low Risk</option>
              <option value="medium">🟡 Medium Risk</option>
              <option value="high">🔴 High Risk</option>
            </select>
            <div class="flex gap-2">
              <button @click="cancelPin" class="flex-1 bg-gray-700 text-white font-bold py-2.5 rounded-xl text-sm">Cancel</button>
              <button @click="saveHotspot" :disabled="!newHotspot.name"
                class="flex-1 text-white font-bold py-2.5 rounded-xl text-sm disabled:opacity-40" style="background:#6EAE21">
                Save Zone
              </button>
            </div>
          </div>
        </transition>

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
            <div class="flex-1">
              <p class="text-white font-bold text-sm">{{ m.title }}</p>
              <p class="text-gray-400 text-xs">{{ m.type }}</p>
            </div>
            <button @click="deleteIEC(m.id)" class="text-red-400 text-xs font-bold">Delete</button>
          </div>
        </div>
        <div v-if="!iecList.length" class="text-center py-8 text-gray-500">
          <span class="text-4xl block mb-2">📋</span>No materials
        </div>
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
import {
  Chart,
  BarElement, LineElement, PointElement, ArcElement,
  CategoryScale, LinearScale,
  Tooltip, Legend, Filler,
  BarController, LineController, DoughnutController
} from 'chart.js'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useAuthStore }    from '@/modules/auth/store/authStore.js'
import { submissionApi }  from '@/services/api/submissionApi.js'
import { supabase }       from '@/services/supabase/client.js'

// Register Chart.js components
Chart.register(
  BarElement, LineElement, PointElement, ArcElement,
  CategoryScale, LinearScale,
  Tooltip, Legend, Filler,
  BarController, LineController, DoughnutController
)

// Fix Leaflet default icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const CSU_CENTER = [8.9535, 125.5975]
const CSU_BOUNDS = L.latLngBounds([8.9470, 125.5900], [8.9610, 125.6060])

const authStore      = useAuthStore()
const submissions    = ref([])
const loading        = ref(true)
const reviewing      = ref(null)
const notes          = ref({})
const filter         = ref('pending')
const activeTab      = ref('submissions')
const trends         = ref([])
const topLocations   = ref([])
const adminHotspots  = ref([])
const iecList        = ref([])
const showAddIEC     = ref(false)
const newIEC         = ref({ title: '', description: '', image_url: '', type: 'image' })

// Map refs
const adminMapRef       = ref(null)
let adminMap            = null
let tempMarker          = null
const hotspotLayerGroup = ref(null)

// Pinning state
const pinningMode = ref(false)
const newPin      = ref(null)
const newHotspot  = ref({ name: '', description: '', severity: 'medium' })

// Chart canvas refs
const donutRef         = ref(null)
const typeDonutRef     = ref(null)
const weeklyBarRef     = ref(null)
const pointsLineRef    = ref(null)
const confidenceBarRef = ref(null)

// Chart instances
let donutChart         = null
let typeDonutChart     = null
let weeklyBarChart     = null
let pointsLineChart    = null
let confidenceBarChart = null

const tabs = [
  { key: 'submissions', label: '📋 Submissions' },
  { key: 'analytics',   label: '📊 Analytics'   },
  { key: 'hotspots',    label: '📍 Hotspots'     },
  { key: 'iec',         label: '📢 IEC'          },
]

// ── Computed ───────────────────────────────────────────────────

const isAdmin      = computed(() => authStore.profile?.is_admin === true)
const pendingCount = computed(() => submissions.value.filter(s => s.status === 'pending').length)
const filteredSubs = computed(() => filter.value === 'all' ? submissions.value : submissions.value.filter(s => s.status === filter.value))

const analytics = computed(() => ({
  total:    submissions.value.length,
  approved: submissions.value.filter(s => s.status === 'approved').length,
  rejected: submissions.value.filter(s => s.status === 'rejected').length,
  pending:  submissions.value.filter(s => s.status === 'pending').length,
  points:   submissions.value.filter(s => s.status === 'approved').reduce((sum, x) => sum + x.total_points, 0),
  users:    new Set(submissions.value.map(s => s.user_id)).size
}))

const approvalRate = computed(() => {
  const reviewed = analytics.value.approved + analytics.value.rejected
  return reviewed ? Math.round((analytics.value.approved / reviewed) * 100) : 0
})

const submissionTypes = computed(() => {
  const ai     = submissions.value.filter(s => s.submission_type !== 'manual').length
  const manual = submissions.value.filter(s => s.submission_type === 'manual').length
  const total  = ai + manual
  return { ai, manual, aiPct: total ? Math.round((ai / total) * 100) : 0 }
})

// Aggregate detected_items across all approved submissions
const topTrashClasses = computed(() => {
  const counts = {}
  submissions.value
    .filter(s => s.status === 'approved')
    .forEach(s => {
      (s.detected_items || []).forEach(item => {
        const key = item.class || 'unknown'
        counts[key] = (counts[key] || 0) + 1
      })
    })
  return Object.entries(counts)
    .map(([cls, count]) => ({ class: cls, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)
})

// Confidence tier breakdown from approved AI submissions
const confidenceTiers = computed(() => {
  const tiers = { '85%+ (40pts)': 0, '70–84% (30pts)': 0, '55–69% (20pts)': 0, '<55% (10pts)': 0 }
  submissions.value
    .filter(s => s.status === 'approved' && s.submission_type !== 'manual')
    .forEach(s => {
      (s.detected_items || []).forEach(item => {
        const score = item.score ?? item.confidence ?? 0
        if      (score >= 0.85) tiers['85%+ (40pts)']++
        else if (score >= 0.70) tiers['70–84% (30pts)']++
        else if (score >= 0.55) tiers['55–69% (20pts)']++
        else                    tiers['<55% (10pts)']++
      })
    })
  return Object.entries(tiers).map(([label, count]) => ({ label, count }))
})

function formatWeek(iso) {
  return new Date(iso).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })
}
function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

// ── Chart drawing ──────────────────────────────────────────────

function destroyCharts() {
  donutChart?.destroy();         donutChart         = null
  typeDonutChart?.destroy();     typeDonutChart     = null
  weeklyBarChart?.destroy();     weeklyBarChart     = null
  pointsLineChart?.destroy();    pointsLineChart    = null
  confidenceBarChart?.destroy(); confidenceBarChart = null
}

async function drawCharts() {
  await nextTick()
  destroyCharts()

  const GRID  = 'rgba(255,255,255,0.06)'
  const LABEL = '#9ca3af'

  const weekLabels  = trends.value.slice(0, 6).reverse().map(t => formatWeek(t.week))
  const weekCounts  = trends.value.slice(0, 6).reverse().map(t => t.total_submissions)
  const weekPoints  = trends.value.slice(0, 6).reverse().map(t => t.total_points_awarded ?? 0)

  // Approval donut
  if (donutRef.value) {
    donutChart = new Chart(donutRef.value, {
      type: 'doughnut',
      data: {
        datasets: [{
          data: [analytics.value.approved, analytics.value.rejected, analytics.value.pending],
          backgroundColor: ['#6EAE21', '#ef4444', '#eab308'],
          borderWidth: 0,
          hoverOffset: 4
        }]
      },
      options: {
        cutout: '72%',
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        animation: { animateRotate: true, duration: 800 }
      }
    })
  }

  // Type donut
  if (typeDonutRef.value) {
    typeDonutChart = new Chart(typeDonutRef.value, {
      type: 'doughnut',
      data: {
        datasets: [{
          data: [submissionTypes.value.ai, submissionTypes.value.manual],
          backgroundColor: ['#6DCEDA', '#086A9C'],
          borderWidth: 0,
          hoverOffset: 4
        }]
      },
      options: {
        cutout: '72%',
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        animation: { animateRotate: true, duration: 800 }
      }
    })
  }

  // Weekly submissions bar
  if (weeklyBarRef.value && weekLabels.length) {
    weeklyBarChart = new Chart(weeklyBarRef.value, {
      type: 'bar',
      data: {
        labels: weekLabels,
        datasets: [{
          label: 'Submissions',
          data: weekCounts,
          backgroundColor: 'rgba(110,174,33,0.75)',
          borderColor: '#6EAE21',
          borderWidth: 1.5,
          borderRadius: 6,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: ctx => ` ${ctx.parsed.y} submissions` } }
        },
        scales: {
          x: { ticks: { color: LABEL, font: { size: 10 } }, grid: { color: GRID } },
          y: { ticks: { color: LABEL, font: { size: 10 }, precision: 0 }, grid: { color: GRID }, beginAtZero: true }
        }
      }
    })
  }

  // Points awarded line
  if (pointsLineRef.value && weekLabels.length) {
    pointsLineChart = new Chart(pointsLineRef.value, {
      type: 'line',
      data: {
        labels: weekLabels,
        datasets: [{
          label: 'Points',
          data: weekPoints,
          borderColor: '#6DCEDA',
          backgroundColor: 'rgba(109,206,218,0.12)',
          pointBackgroundColor: '#6DCEDA',
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 2,
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: ctx => ` ${ctx.parsed.y} pts` } }
        },
        scales: {
          x: { ticks: { color: LABEL, font: { size: 10 } }, grid: { color: GRID } },
          y: { ticks: { color: LABEL, font: { size: 10 }, precision: 0 }, grid: { color: GRID }, beginAtZero: true }
        }
      }
    })
  }

  // Confidence tier horizontal bar
  if (confidenceBarRef.value && confidenceTiers.value.some(t => t.count > 0)) {
    confidenceBarChart = new Chart(confidenceBarRef.value, {
      type: 'bar',
      data: {
        labels: confidenceTiers.value.map(t => t.label),
        datasets: [{
          label: 'Detections',
          data: confidenceTiers.value.map(t => t.count),
          backgroundColor: ['#6EAE21', '#6DCEDA', '#086A9C', '#374151'],
          borderRadius: 6,
          borderSkipped: false,
          borderWidth: 0
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: ctx => ` ${ctx.parsed.x} detections` } }
        },
        scales: {
          x: { ticks: { color: LABEL, font: { size: 10 }, precision: 0 }, grid: { color: GRID }, beginAtZero: true },
          y: { ticks: { color: LABEL, font: { size: 10 } }, grid: { display: false } }
        }
      }
    })
  }
}

// Redraw when switching to analytics or when data changes
watch(activeTab, tab => { if (tab === 'analytics') drawCharts() })
watch([submissions, trends], () => { if (activeTab.value === 'analytics') drawCharts() })

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
      .bindPopup(`<b style="color:${color}">📍 ${h.name}</b><br><small>${h.description || ''}</small><br><small style="color:#888">${h.severity} risk</small>`)
  })
}

function initAdminMap() {
  if (adminMap) { adminMap.invalidateSize(); return }
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

  L.rectangle(CSU_BOUNDS, {
    color: '#6EAE21', weight: 2,
    fillColor: '#6EAE21', fillOpacity: 0.04,
    dashArray: '6,6', interactive: false
  }).addTo(adminMap)

  hotspotLayerGroup.value = L.layerGroup().addTo(adminMap)

  adminMap.on('click', (e) => {
    if (!pinningMode.value) return
    const { lat, lng } = e.latlng
    newPin.value = { lat, lng }
    if (tempMarker) { adminMap.removeLayer(tempMarker); tempMarker = null }
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

  renderHotspotMarkers()
  adminMap.invalidateSize()
}

function togglePinMode() {
  pinningMode.value = !pinningMode.value
  if (!pinningMode.value) cancelPin()
  if (adminMap) adminMap.getContainer().style.cursor = pinningMode.value ? 'crosshair' : ''
}

function cancelPin() {
  newPin.value = null
  newHotspot.value = { name: '', description: '', severity: 'medium' }
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

watch(activeTab, async (tab) => {
  if (tab !== 'hotspots') return
  await nextTick()
  await nextTick()
  setTimeout(() => initAdminMap(), 300)
})

// ── Data Loading ───────────────────────────────────────────────

async function loadHotspots() {
  const { data } = await supabase
    .from('admin_hotspots').select('*')
    .eq('is_active', true).order('created_at', { ascending: false })
  adminHotspots.value = data ?? []
}

async function loadAll() {
  loading.value = true
  const [subs, trendData, locData] = await Promise.all([
    submissionApi.getAllSubmissions().catch(() => []),
    supabase.from('submission_trends').select('*').then(r => r.data ?? []),
    supabase.from('top_locations').select('*').then(r => r.data ?? []),
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
    const r = await submissionApi.approveSubmission(s.id, authStore.user.id, notes.value[s.id] || '', Number(s.total_points))
    if (r?.success) {
      s.status      = 'approved'
      s.admin_note  = notes.value[s.id]
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
    const r = await submissionApi.rejectSubmission(s.id, authStore.user.id, notes.value[s.id] || '')
    if (r?.success) { s.status = 'rejected'; s.admin_note = notes.value[s.id]; s.reviewed_at = new Date().toISOString() }
    else alert(r?.error ?? 'Rejection failed')
  } catch (e) {
    alert(e.message)
  } finally {
    reviewing.value = null
  }
}

async function saveIEC() {
  const m = newIEC.value
  if (!m.title || !m.image_url) return
  const { error } = await supabase.from('iec_materials').insert({ ...m, created_by: authStore.user.id })
  if (!error) {
    await loadAll()
    showAddIEC.value = false
    newIEC.value = { title: '', description: '', image_url: '', type: 'image' }
  }
}

async function deleteIEC(id) {
  await supabase.from('iec_materials').update({ is_active: false }).eq('id', id)
  iecList.value = iecList.value.filter(m => m.id !== id)
}

onMounted(() => loadAll())
onUnmounted(() => {
  if (adminMap) { adminMap.remove(); adminMap = null }
  destroyCharts()
})
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none }
.slide-up-enter-active, .slide-up-leave-active { transition: all 0.3s ease }
.slide-up-enter-from, .slide-up-leave-to { opacity: 0; transform: translateY(16px) }
</style>
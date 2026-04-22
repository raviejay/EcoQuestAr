<template>
  <div class="min-h-screen pb-8" style="background:#f0f7e6">

    <!-- Header -->
    <div class="px-4 pt-6 pb-6 text-white" style="background:linear-gradient(135deg,#6EAE21,#086A9C)">
      <h1 class="text-xl font-black mb-4">👤 My Profile</h1>
      <div class="flex flex-col items-center gap-3">
        <div class="relative">
          <div class="w-20 h-20 rounded-full overflow-hidden border-4 border-white/50 flex items-center justify-center font-black text-3xl"
            style="background:rgba(255,255,255,0.2)">
            <img v-if="previewUrl || authStore.profile?.avatar_url" :src="previewUrl || authStore.profile?.avatar_url" class="w-full h-full object-cover"/>
            <span v-else>{{ initials }}</span>
          </div>
          <label class="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-white flex items-center justify-center cursor-pointer shadow-lg">
            <span class="text-sm">✏️</span>
            <input type="file" accept="image/*" class="hidden" @change="handleAvatarChange"/>
          </label>
        </div>
        <div class="text-center">
          <p class="font-black text-xl">{{ authStore.profile?.username }}</p>
          <p v-if="authStore.profile?.school_id" class="text-sm opacity-80">{{ authStore.profile.school_id }}</p>
        </div>
      </div>
    </div>

    <!-- Stats -->
    <div class="mx-4 -mt-4 grid grid-cols-3 gap-2 mb-6">
      <div class="bg-white rounded-2xl p-3 text-center shadow-sm">
        <p class="font-black text-xl" style="color:#6EAE21">{{ authStore.profile?.points??0 }}</p>
        <p class="text-xs text-gray-400">Points</p>
      </div>
      <div class="bg-white rounded-2xl p-3 text-center shadow-sm">
        <p class="font-black text-xl" style="color:#086A9C">{{ authStore.profile?.level??1 }}</p>
        <p class="text-xs text-gray-400">Level</p>
      </div>
      <div class="bg-white rounded-2xl p-3 text-center shadow-sm">
        <p class="font-black text-xl">{{ authStore.profile?.is_admin ? '🛡️' : '🌱' }}</p>
        <p class="text-xs text-gray-400">{{ authStore.profile?.is_admin ? 'Admin' : 'Member' }}</p>
      </div>
    </div>

    <!-- Form -->
    <div class="mx-4 bg-white rounded-2xl p-5 shadow-sm space-y-4">
      <h2 class="font-black text-gray-800">Edit Profile</h2>

      <div v-if="saved" class="p-3 rounded-xl text-sm font-semibold text-center" style="background:#e8f5d0;color:#6EAE21">✅ Profile saved!</div>
      <div v-if="saveError" class="p-3 rounded-xl text-sm font-semibold text-center bg-red-50 text-red-600">{{ saveError }}</div>

      <div>
        <label class="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">Username</label>
        <input v-model="form.username" type="text" placeholder="EcoHero123"
          class="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400 transition"/>
      </div>
      <div>
        <label class="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">School ID</label>
        <input v-model="form.school_id" type="text" placeholder="211-00282"
          class="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:border-green-400 transition"/>
        <p class="text-xs text-gray-400 mt-1">Used for ID-based login</p>
      </div>
      <div>
        <label class="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">Email</label>
        <input :value="authStore.user?.email" disabled
          class="w-full px-4 py-3 border border-gray-100 rounded-xl text-sm bg-gray-50 text-gray-400 cursor-not-allowed"/>
      </div>

      <button @click="saveProfile" :disabled="saving"
        class="w-full text-white font-black py-3.5 rounded-2xl transition disabled:opacity-50 shadow-lg"
        style="background:linear-gradient(90deg,#6EAE21,#086A9C)">
        {{ saving ? 'Saving...' : 'Save Changes' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/modules/auth/store/authStore.js'
import { supabase } from '@/services/supabase/client.js'

const authStore  = useAuthStore()
const saving     = ref(false)
const saved      = ref(false)
const saveError  = ref('')
const previewUrl = ref(null)
let avatarBlob   = null

const form = ref({ username: '', school_id: '' })

const initials = computed(() => {
  const name = authStore.profile?.username || ''
  return name.slice(0,2).toUpperCase() || '?'
})

function handleAvatarChange(e) {
  const file = e.target.files[0]
  if (!file) return
  avatarBlob = file
  previewUrl.value = URL.createObjectURL(file)
}

async function saveProfile() {
  saving.value = true; saved.value = false; saveError.value = ''
  try {
    let avatar_url = authStore.profile?.avatar_url ?? null

    if (avatarBlob) {
      const filename = `${authStore.user.id}/avatar.jpg`
      const { error: upErr } = await supabase.storage
        .from('proof-photos').upload(filename, avatarBlob, { upsert: true, contentType: 'image/jpeg' })
      if (upErr) throw upErr
      const { data: { publicUrl } } = supabase.storage.from('proof-photos').getPublicUrl(filename)
      avatar_url = publicUrl
    }

    const { error } = await supabase.from('profiles').update({
      username:  form.value.username,
      school_id: form.value.school_id || null,
      avatar_url
    }).eq('id', authStore.user.id)

    if (error) throw error
    await authStore.initAuth()
    saved.value = true
    setTimeout(() => { saved.value = false }, 3000)
  } catch (err) {
    saveError.value = err.message
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  form.value.username  = authStore.profile?.username  ?? ''
  form.value.school_id = authStore.profile?.school_id ?? ''
})
</script>
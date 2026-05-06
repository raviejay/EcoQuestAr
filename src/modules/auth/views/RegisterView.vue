<template>
  <div
    class="min-h-screen flex flex-col items-center justify-center px-4 py-8"
    style="background: linear-gradient(135deg, #6EAE21 0%, #086A9C 100%)"
  >
    <div class="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">

      <!-- Logo -->
      <div class="flex flex-col items-center mb-6">
        <img
          src="/logo2.png"
          alt="PlasticCaraga Logo"
          class="h-14 mb-2 object-contain"
          onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'"
        />
        <div
          class="hidden w-14 h-14 rounded-2xl items-center justify-center mb-2"
          style="background:#6EAE21"
        >
          <span class="text-2xl">♻️</span>
        </div>
        <h1 class="text-xl font-black" style="color:#086A9C">Create Account</h1>
        <p class="text-gray-400 text-xs mt-0.5">Join PlasticCaraga at CSU</p>
      </div>

      <!-- Success -->
      <div
        v-if="registered"
        class="mb-4 p-3 rounded-xl text-sm bg-green-50 border border-green-200 text-green-700"
      >
        ✅ Account created! Check your email, then
        <RouterLink to="/login" class="underline font-semibold">sign in</RouterLink>.
      </div>

      <!-- Error -->
      <div
        v-if="authStore.error"
        class="mb-4 p-3 rounded-xl text-sm bg-red-50 border border-red-200 text-red-700"
      >
        {{ authStore.error }}
      </div>

      <!-- Form -->
      <div v-if="!registered" class="space-y-3">

        <!-- Username -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">Username</label>
          <input
            v-model="form.username"
            type="text"
            placeholder="EcoHero123"
            class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 transition"
          />
        </div>

        <!-- School ID -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">
            School ID
            <span class="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            v-model="form.schoolId"
            type="text"
            placeholder="211-00282"
            class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 transition font-mono"
          />
          <p class="text-gray-400 text-xs mt-0.5">Allows login using your ID number</p>
        </div>

        <!-- Email -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">Email</label>
          <input
            v-model="form.email"
            type="email"
            placeholder="you@csu.edu.ph"
            class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 transition"
          />
        </div>

        <!-- Password -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">Password</label>
          <input
            v-model="form.password"
            type="password"
            placeholder="Min. 8 characters"
            class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 transition"
          />
        </div>

        <!-- Confirm Password -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">Confirm Password</label>
          <input
            v-model="form.confirmPassword"
            type="password"
            placeholder="••••••••"
            class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 transition"
            @keyup.enter="handleRegister"
          />
          <p v-if="passwordMismatch" class="text-red-500 text-xs mt-1">Passwords do not match</p>
        </div>

        <!-- Terms & Privacy consent -->
        <div class="flex items-start gap-2.5 pt-1">
          <input
            v-model="form.agreedToTerms"
            type="checkbox"
            id="terms-check"
            class="mt-0.5 w-4 h-4 cursor-pointer rounded accent-green-600 flex-shrink-0"
          />
          <label
            for="terms-check"
            class="text-xs text-gray-500 leading-relaxed cursor-pointer select-none"
          >
            I have read and agree to the
            <button
              type="button"
              @click.prevent="openTerms('terms')"
              class="font-bold underline underline-offset-2 transition hover:opacity-70"
              style="color:#086A9C"
            >Terms of Service</button>
            and
            <button
              type="button"
              @click.prevent="openTerms('privacy')"
              class="font-bold underline underline-offset-2 transition hover:opacity-70"
              style="color:#086A9C"
            >Privacy Policy</button>.
            I consent to the processing of my personal data per
            <span class="font-semibold text-gray-600">RA 10173</span>.
          </label>
        </div>

        <!-- Submit -->
        <button
          @click="handleRegister"
          :disabled="authStore.loading || !canSubmit"
          class="w-full text-white font-bold py-3.5 rounded-2xl transition disabled:opacity-50 shadow-lg mt-2"
          style="background: linear-gradient(90deg, #6EAE21, #086A9C)"
        >
          {{ authStore.loading ? 'Creating...' : 'Create Account' }}
        </button>
      </div>

      <!-- Sign in link -->
      <p class="text-center text-sm text-gray-500 mt-5">
        Already have an account?
        <RouterLink to="/login" class="font-bold" style="color:#086A9C">Sign in</RouterLink>
      </p>
    </div>

    <!-- ── Terms & Privacy Modal ── -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showTerms"
          class="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4"
          style="background: rgba(0,0,0,0.5); backdrop-filter: blur(4px)"
          @click.self="showTerms = false"
        >
          <Transition name="slide-up">
            <div
              v-if="showTerms"
              class="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col"
              style="max-height: 85vh"
            >
              <!-- Modal header -->
              <div class="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100 flex-shrink-0">
                <div class="flex bg-gray-100 rounded-xl p-1 gap-1">
                  <button
                    @click="activeTab = 'terms'"
                    :class="activeTab === 'terms'
                      ? 'bg-white shadow text-gray-800 font-bold'
                      : 'text-gray-400 font-semibold'"
                    class="px-4 py-1.5 rounded-lg text-sm transition-all duration-200"
                  >
                    📋 Terms
                  </button>
                  <button
                    @click="activeTab = 'privacy'"
                    :class="activeTab === 'privacy'
                      ? 'bg-white shadow text-gray-800 font-bold'
                      : 'text-gray-400 font-semibold'"
                    class="px-4 py-1.5 rounded-lg text-sm transition-all duration-200"
                  >
                    🔒 Privacy
                  </button>
                </div>
                <button
                  @click="showTerms = false"
                  class="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
                >
                  ✕
                </button>
              </div>

              <!-- Modal scrollable content -->
              <div
                ref="scrollArea"
                class="overflow-y-auto flex-1 px-6 py-5 text-sm text-gray-600 leading-relaxed space-y-4"
              >

                <!-- Terms of Service -->
                <template v-if="activeTab === 'terms'">
                  <h2 class="text-lg font-black" style="color:#086A9C">Terms of Service</h2>
                  <p class="text-xs text-gray-400">Effective: January 2026 · PlasticCaraga, Caraga State University</p>

                  <section>
                    <h3 class="font-bold text-gray-800 mb-1">1. Acceptance of Terms</h3>
                    <p>By creating an account and using PlasticCaraga, you agree to be bound by these Terms of Service. If you do not agree, please do not use the application.</p>
                  </section>

                  <section>
                    <h3 class="font-bold text-gray-800 mb-1">2. Eligibility</h3>
                    <p>PlasticCaraga is intended for students, faculty, and staff of Caraga State University. You must be at least 13 years old to create an account. Use of a valid CSU School ID is encouraged for account verification.</p>
                  </section>

                  <section>
                    <h3 class="font-bold text-gray-800 mb-1">3. User Accounts</h3>
                    <p>You are responsible for maintaining the confidentiality of your login credentials. You agree to notify us immediately of any unauthorized use of your account. PlasticCaraga is not liable for any loss resulting from unauthorized access due to your failure to keep credentials secure.</p>
                  </section>

                  <section>
                    <h3 class="font-bold text-gray-800 mb-1">4. Acceptable Use</h3>
                    <p>You agree not to:</p>
                    <ul class="list-disc ml-4 mt-1 space-y-0.5">
                      <li>Use the app for any unlawful or unauthorized purpose</li>
                      <li>Impersonate another person or misrepresent your affiliation</li>
                      <li>Attempt to access systems or data you are not authorized to access</li>
                      <li>Disrupt the integrity or performance of the application</li>
                      <li>Share false or misleading information within the platform</li>
                    </ul>
                  </section>

                  <section>
                    <h3 class="font-bold text-gray-800 mb-1">5. Intellectual Property</h3>
                    <p>All content, branding, AR assets, and materials within PlasticCaraga are owned by or licensed to Caraga State University. You may not reproduce, distribute, or create derivative works without written permission.</p>
                  </section>

                  <section>
                    <h3 class="font-bold text-gray-800 mb-1">6. Gamification & Rewards</h3>
                    <p>Points, badges, and rewards earned within PlasticCaraga have no monetary value and cannot be transferred or redeemed outside the platform. We reserve the right to modify or revoke rewards at any time.</p>
                  </section>

                  <section>
                    <h3 class="font-bold text-gray-800 mb-1">7. Termination</h3>
                    <p>We reserve the right to suspend or terminate your account at our discretion if you violate these Terms. You may also delete your account at any time by contacting the PlasticCaraga team.</p>
                  </section>

                  <section>
                    <h3 class="font-bold text-gray-800 mb-1">8. Changes to Terms</h3>
                    <p>We may update these Terms from time to time. Continued use of the app after changes constitutes acceptance of the updated Terms.</p>
                  </section>

                  <section>
                    <h3 class="font-bold text-gray-800 mb-1">9. Contact</h3>
                    <p>For questions about these Terms, contact us at <span class="font-semibold" style="color:#086A9C">plasticcaraga@csu.edu.ph</span>.</p>
                  </section>
                </template>

                <!-- Privacy Policy -->
                <template v-else>
                  <h2 class="text-lg font-black" style="color:#086A9C">Privacy Policy</h2>
                  <p class="text-xs text-gray-400">Effective: January 2026 · In compliance with RA 10173 (Data Privacy Act of 2012)</p>

                  <section>
                    <h3 class="font-bold text-gray-800 mb-1">1. Data Controller</h3>
                    <p>PlasticCaraga is developed by and operated under Caraga State University (CSU), the data controller responsible for your personal information.</p>
                  </section>

                  <section>
                    <h3 class="font-bold text-gray-800 mb-1">2. What Data We Collect</h3>
                    <ul class="list-disc ml-4 mt-1 space-y-0.5">
                      <li><span class="font-semibold">Account data:</span> Username, email address, password (encrypted)</li>
                      <li><span class="font-semibold">School ID:</span> Optional, used to enable ID-based login</li>
                      <li><span class="font-semibold">Usage data:</span> Quest progress, points, badges, AR interactions</li>
                      <li><span class="font-semibold">Device data:</span> Device type, OS version, app version (for diagnostics)</li>
                    </ul>
                  </section>

                  <section>
                    <h3 class="font-bold text-gray-800 mb-1">3. Purpose of Collection</h3>
                    <p>We collect your data to:</p>
                    <ul class="list-disc ml-4 mt-1 space-y-0.5">
                      <li>Create and manage your PlasticCaraga account</li>
                      <li>Track your participation in environmental quests</li>
                      <li>Deliver personalized AR experiences</li>
                      <li>Display leaderboards and gamification features</li>
                      <li>Improve app performance and fix bugs</li>
                    </ul>
                  </section>

                  <section>
                    <h3 class="font-bold text-gray-800 mb-1">4. Legal Basis (RA 10173)</h3>
                    <p>We process your data based on your <span class="font-semibold">freely given, specific, informed consent</span> as provided when you register. You may withdraw consent at any time by requesting account deletion.</p>
                  </section>

                  <section>
                    <h3 class="font-bold text-gray-800 mb-1">5. Data Sharing</h3>
                    <p>We do not sell your personal data. We share data only with:</p>
                    <ul class="list-disc ml-4 mt-1 space-y-0.5">
                      <li><span class="font-semibold">Supabase</span> — our database and authentication provider (data processor)</li>
                      <li><span class="font-semibold">CSU administrators</span> — for academic or disciplinary purposes when required</li>
                      <li><span class="font-semibold">Legal authorities</span> — if required by law</li>
                    </ul>
                  </section>

                  <section>
                    <h3 class="font-bold text-gray-800 mb-1">6. Data Retention</h3>
                    <p>Your data is retained for the duration of your account's existence. Inactive accounts may be deleted after 2 years of inactivity. You may request deletion at any time.</p>
                  </section>

                  <section>
                    <h3 class="font-bold text-gray-800 mb-1">7. Your Rights Under RA 10173</h3>
                    <p>As a data subject, you have the right to:</p>
                    <ul class="list-disc ml-4 mt-1 space-y-0.5">
                      <li><span class="font-semibold">Access</span> — request a copy of your personal data</li>
                      <li><span class="font-semibold">Correction</span> — update inaccurate or incomplete data</li>
                      <li><span class="font-semibold">Erasure</span> — request deletion of your account and data</li>
                      <li><span class="font-semibold">Object</span> — opt out of specific types of processing</li>
                      <li><span class="font-semibold">Data portability</span> — receive your data in a usable format</li>
                      <li><span class="font-semibold">Complaint</span> — file a complaint with the National Privacy Commission (NPC)</li>
                    </ul>
                  </section>

                  <section>
                    <h3 class="font-bold text-gray-800 mb-1">8. Security</h3>
                    <p>We implement appropriate technical and organizational measures to protect your data, including encrypted passwords, secure HTTPS connections, and row-level security in our database.</p>
                  </section>

                  <section>
                    <h3 class="font-bold text-gray-800 mb-1">9. Data Protection Officer</h3>
                    <p>For privacy concerns, contact CSU's Data Protection Officer at <span class="font-semibold" style="color:#086A9C">dpo@csu.edu.ph</span> or visit the CSU main campus.</p>
                  </section>
                </template>

              </div>

              <!-- Modal footer -->
              <div class="px-6 py-4 border-t border-gray-100 flex-shrink-0">
                <button
                  @click="acceptAndClose"
                  class="w-full text-white font-bold py-3 rounded-2xl shadow-lg transition active:scale-95"
                  style="background: linear-gradient(90deg, #6EAE21, #086A9C)"
                >
                  I Understand & Accept ✓
                </button>
              </div>

            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<script setup>
import { reactive, ref, computed, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/modules/auth/store/authStore.js'

const authStore  = useAuthStore()
const registered = ref(false)

// ── Form state ──
const form = reactive({
  username:       '',
  schoolId:       '',
  email:          '',
  password:       '',
  confirmPassword:'',
  agreedToTerms:  false
})

const passwordMismatch = computed(
  () => form.confirmPassword.length > 0 && form.password !== form.confirmPassword
)

const canSubmit = computed(
  () => form.username && form.email && form.password
     && form.agreedToTerms && !passwordMismatch.value
)

// ── Modal state ──
const showTerms  = ref(false)
const activeTab  = ref('terms')
const scrollArea = ref(null)

function openTerms(tab = 'terms') {
  activeTab.value = tab
  showTerms.value = true
}

// Reset scroll to top when switching tabs or reopening
watch(activeTab, () => {
  setTimeout(() => scrollArea.value?.scrollTo({ top: 0, behavior: 'smooth' }), 50)
})

watch(showTerms, (val) => {
  if (val) setTimeout(() => scrollArea.value?.scrollTo({ top: 0 }), 50)
})

function acceptAndClose() {
  form.agreedToTerms = true
  showTerms.value    = false
}

// ── Register handler ──
async function handleRegister() {
  if (!canSubmit.value) return
  authStore.clearError()
  try {
    await authStore.register({
      username: form.username,
      email:    form.email,
      password: form.password,
      schoolId: form.schoolId
    })
    registered.value = true
  } catch { /* error shown via authStore.error */ }
}
</script>

<style scoped>
/* Backdrop fade */
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease }
.fade-enter-from,  .fade-leave-to      { opacity: 0 }

/* Sheet slide up */
.slide-up-enter-active {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.25s ease;
}
.slide-up-leave-active {
  transition: transform 0.2s ease, opacity 0.2s ease;
}
.slide-up-enter-from, .slide-up-leave-to {
  transform: translateY(60px);
  opacity: 0;
}

@media (min-width: 640px) {
  .slide-up-enter-from, .slide-up-leave-to {
    transform: translateY(20px) scale(0.97);
  }
}

section { padding-bottom: 0.25rem }
</style>
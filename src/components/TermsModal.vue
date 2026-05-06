<template>
  <!-- Backdrop -->
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-0 sm:pb-4"
        style="background: rgba(0,0,0,0.5); backdrop-filter: blur(4px)"
        @click.self="$emit('update:modelValue', false)"
      >
        <!-- Modal sheet -->
        <Transition name="slide-up">
          <div
            v-if="modelValue"
            class="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col"
            style="max-height: 85vh"
          >
            <!-- Header -->
            <div class="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100 flex-shrink-0">
              <!-- Tab switcher -->
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

              <!-- Close button -->
              <button
                @click="$emit('update:modelValue', false)"
                class="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
              >
                ✕
              </button>
            </div>

            <!-- Scrollable content -->
            <div ref="scrollArea" class="overflow-y-auto flex-1 px-6 py-5 text-sm text-gray-600 leading-relaxed space-y-4">

              <!-- ── TERMS OF SERVICE ── -->
              <template v-if="activeTab === 'terms'">
                <h2 class="text-lg font-black" style="color:#086A9C">Terms of Service</h2>
                <p class="text-xs text-gray-400">Effective: January 2026 · EcoQuest AR, Caraga State University</p>

                <section>
                  <h3 class="font-bold text-gray-800 mb-1">1. Acceptance of Terms</h3>
                  <p>By creating an account and using EcoQuest AR, you agree to be bound by these Terms of Service. If you do not agree, please do not use the application.</p>
                </section>

                <section>
                  <h3 class="font-bold text-gray-800 mb-1">2. Eligibility</h3>
                  <p>EcoQuest AR is intended for students, faculty, and staff of Caraga State University. You must be at least 13 years old to create an account. Use of a valid CSU School ID is encouraged for account verification.</p>
                </section>

                <section>
                  <h3 class="font-bold text-gray-800 mb-1">3. User Accounts</h3>
                  <p>You are responsible for maintaining the confidentiality of your login credentials. You agree to notify us immediately of any unauthorized use of your account. EcoQuest AR is not liable for any loss resulting from unauthorized access due to your failure to keep credentials secure.</p>
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
                  <p>All content, branding, AR assets, and materials within EcoQuest AR are owned by or licensed to Caraga State University. You may not reproduce, distribute, or create derivative works without written permission.</p>
                </section>

                <section>
                  <h3 class="font-bold text-gray-800 mb-1">6. Gamification & Rewards</h3>
                  <p>Points, badges, and rewards earned within EcoQuest AR have no monetary value and cannot be transferred or redeemed outside the platform. We reserve the right to modify or revoke rewards at any time.</p>
                </section>

                <section>
                  <h3 class="font-bold text-gray-800 mb-1">7. Termination</h3>
                  <p>We reserve the right to suspend or terminate your account at our discretion if you violate these Terms. You may also delete your account at any time by contacting the EcoQuest AR team.</p>
                </section>

                <section>
                  <h3 class="font-bold text-gray-800 mb-1">8. Changes to Terms</h3>
                  <p>We may update these Terms from time to time. Continued use of the app after changes constitutes acceptance of the updated Terms.</p>
                </section>

                <section>
                  <h3 class="font-bold text-gray-800 mb-1">9. Contact</h3>
                  <p>For questions about these Terms, contact us at <span class="font-semibold" style="color:#086A9C">ecoquest@csu.edu.ph</span>.</p>
                </section>
              </template>

              <!-- ── PRIVACY POLICY ── -->
              <template v-else>
                <h2 class="text-lg font-black" style="color:#086A9C">Privacy Policy</h2>
                <p class="text-xs text-gray-400">Effective: January 2026 · In compliance with RA 10173 (Data Privacy Act of 2012)</p>

                <section>
                  <h3 class="font-bold text-gray-800 mb-1">1. Data Controller</h3>
                  <p>EcoQuest AR is developed by and operated under Caraga State University (CSU), the data controller responsible for your personal information.</p>
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
                    <li>Create and manage your EcoQuest AR account</li>
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

            <!-- Footer action -->
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
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  initialTab: { type: String, default: 'terms' }
})

const emit = defineEmits(['update:modelValue', 'accepted'])

const activeTab  = ref(props.initialTab)
const scrollArea = ref(null)

// Reset to correct tab and scroll top when opened
watch(() => props.modelValue, (val) => {
  if (val) {
    activeTab.value = props.initialTab
    setTimeout(() => scrollArea.value?.scrollTo({ top: 0 }), 50)
  }
})

// Reset scroll when switching tabs
watch(activeTab, () => {
  setTimeout(() => scrollArea.value?.scrollTo({ top: 0, behavior: 'smooth' }), 50)
})

function acceptAndClose() {
  emit('accepted')
  emit('update:modelValue', false)
}
</script>

<style scoped>
/* Backdrop fade */
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease }
.fade-enter-from, .fade-leave-to { opacity: 0 }

/* Sheet slide up */
.slide-up-enter-active { transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.25s ease }
.slide-up-leave-active { transition: transform 0.2s ease, opacity 0.2s ease }
.slide-up-enter-from  { transform: translateY(60px); opacity: 0 }
.slide-up-leave-to    { transform: translateY(60px); opacity: 0 }

@media (min-width: 640px) {
  .slide-up-enter-from, .slide-up-leave-to { transform: translateY(20px) scale(0.97) }
}

section { padding-bottom: 0.25rem }
</style>
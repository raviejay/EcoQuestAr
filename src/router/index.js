import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/modules/auth/store/authStore.js'

import LoginView from '@/modules/auth/views/LoginView.vue'
import RegisterView from '@/modules/auth/views/RegisterView.vue'
import DashboardView from '@/modules/auth/views/DashboardView.vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'

const routes = [
  { path: '/login', name: 'Login', component: LoginView, meta: { requiresGuest: true } },
  { path: '/register', name: 'Register', component: RegisterView, meta: { requiresGuest: true } },
  {
    path: '/',
    component: DefaultLayout,
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/dashboard' },
      { path: 'dashboard', name: 'Dashboard', component: DashboardView },
      { path: 'camera', name: 'Camera', component: () => import('@/modules/camera/components/CameraView.vue') },
      { path: 'leaderboard', name: 'Leaderboard', component: () => import('@/modules/gamification/views/LeaderboardView.vue') },
      { path: 'rewards', name: 'Rewards', component: () => import('@/modules/gamification/views/RewardsView.vue') },
      { path: 'map', name: 'Map', component: () => import('@/modules/maps/views/HotspotMapView.vue') }
    ]
  },
  { path: '/:pathMatch(.*)*', redirect: '/login' }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore()
  if (!authStore.user) await authStore.initAuth()
  if (to.meta.requiresAuth && !authStore.isAuthenticated) return { name: 'Login' }
  if (to.meta.requiresGuest && authStore.isAuthenticated) return { name: 'Dashboard' }
})

export default router

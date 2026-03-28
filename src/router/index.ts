import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import DashboardView from '@/views/DashboardView.vue'
import ProfileView from '@/views/ProfileView.vue'
import SurveyView from '@/views/SurveyView.vue'
import ScanView from '@/views/ScanView.vue'
import AuthView from '@/views/AuthView.vue'
import { supabase } from '@/lib/supabaseClient'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior() {
    return { top: 0 }
  },
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/auth',
      name: 'auth',
      component: AuthView
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
      meta: { requiresAuth: true }
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true }
    },
    {
      path: '/scan',
      name: 'scan',
      component: ScanView,
      meta: { requiresAuth: true }
    },
    {
      path: '/survey',
      name: 'survey',
      component: SurveyView,
      meta: { requiresAuth: true }
    },
  ],
})

router.beforeEach(async (to) => {
  const { data: { session } } = await supabase.auth.getSession()

  // Protect authenticated routes
  if (to.meta.requiresAuth && !session) {
    return { name: 'auth' }
  }

  // Prevent logged-in users from seeing the auth page
  if (to.name === 'auth' && session) {
    return { name: 'dashboard' }
  }

  // First-login redirect: if user has no profile data yet, send to survey
  if (to.name === 'dashboard' && session) {
    const { data } = await supabase
      .from('data')
      .select('profile')
      .eq('id', session.user.id)
      .single()
    const profile = data?.profile
    const hasProfile = profile && (profile.gender || profile.weightLbs || profile.age)
    if (!hasProfile) {
      return { name: 'survey' }
    }
  }

  return true
})

export default router

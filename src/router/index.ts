import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import DashboardView from '@/views/DashboardView.vue'
import SurveyView from '@/views/SurveyView.vue'
import useUserProfile from '@/composables/useUserProfile'

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
      path: '/survey',
      name: 'survey',
      component: SurveyView,
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresProfile: true }
    },
  ],
})

// Navigation Guard
router.beforeEach((to, from, next) => {
  if (to.meta.requiresProfile) {
    const { isComplete } = useUserProfile()
    if (!isComplete.value) {
      // Force user to take surveyor if they try to bypass it
      return next('/survey')
    }
  }
  next()
})

export default router

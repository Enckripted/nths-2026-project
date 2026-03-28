import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import DashboardView from '@/views/DashboardView.vue'
import SurveyView from '@/views/SurveyView.vue'
import useUserProfile from '@/composables/useUserProfile'
import ProfileView from '@/views/ProfileView.vue'
import useDataStore from '@/composables/useDataStore'

const { firstUse } = useDataStore()

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

router.beforeEach((to) => {
  if (to.name != 'profile' && firstUse.value) return { name: 'profile' }
})

export default router

import { createRouter, createWebHistory, type RouteMeta } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import DashboardView from '@/views/DashboardView.vue'
import useDataStore from '@/composables/useDataStore'
import ProfileView from '@/views/ProfileView.vue'

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
      path: '/profile',
      name: 'profile',
      component: ProfileView,
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresProfile: true },
    },
  ],
})

router.beforeEach((to) => {
  const meta: RouteMeta = to.meta
  if (firstUse.value && meta.requiresAuth) return { name: 'profile' }
  return true
})

export default router

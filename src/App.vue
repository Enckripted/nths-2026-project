<script setup lang="ts">
import { RouterLink, RouterView, useRoute } from 'vue-router'
import useAuth from './composables/useAuth'
// Importing useDataStore here ensures its module-level Supabase auth listener
// is registered immediately on app boot so ingredients load on sign-in.
import useDataStore from './composables/useDataStore'
import { computed, onMounted } from 'vue'

const { user, initializeAuth } = useAuth()
// Initialize the data store so its auth listener is active from the start
useDataStore()

onMounted(async () => {
  await initializeAuth()
})
const route = useRoute()

const isDashboard = computed(() => {
  return route.name == 'dashboard'
})

const isProfile = computed(() => {
  return route.name === 'profile' || route.name === 'survey'
})
</script>

<template>
  <div
    class="min-h-screen bg-stone-50 text-slate-900 font-tomorrow flex flex-col font-sans selection:bg-emerald-300 selection:text-slate-900"
  >
    <!-- Opaque Minimal Header -->
    <header
      class="fixed top-0 left-0 w-full z-50 bg-stone-50/95 backdrop-blur-md border-b-2 border-slate-900 px-6 py-4 flex justify-between items-center h-[80px]"
    >
      <div
        class="logo font-spaceGrotesk font-black text-2xl md:text-3xl tracking-tighter hover:scale-105 transition-transform origin-left text-slate-900 drop-shadow-sm"
      >
        <RouterLink to="/">EASEY PREP<span class="text-emerald-700">CO.</span></RouterLink>
      </div>

      <!-- On landing page: show Sign In (guests) or Dashboard (logged in) -->
      <div class="auth-buttons flex gap-4" v-if="route.path === '/'">
        <template v-if="!user">
          <RouterLink
            to="/auth"
            class="brutalist-btn bg-white text-slate-900 hover:bg-stone-100 px-5 py-2.5 rounded-xl font-spaceGrotesk font-black uppercase tracking-wider text-sm transition-all focus:ring-4 focus:ring-slate-200"
            >Sign In</RouterLink
          >
          <RouterLink
            to="/survey"
            class="brutalist-btn bg-emerald-400 hover:bg-emerald-300 px-6 py-2.5 rounded-xl font-spaceGrotesk font-black uppercase tracking-wider text-sm transition-all focus:ring-4 focus:ring-emerald-200"
            >GET STARTED</RouterLink
          >
        </template>
        <RouterLink
          v-else
          to="/dashboard"
          class="brutalist-btn bg-emerald-400 hover:bg-emerald-300 px-6 py-2.5 rounded-xl font-spaceGrotesk font-black uppercase tracking-wider text-sm transition-all focus:ring-4 focus:ring-emerald-200"
          >DASHBOARD</RouterLink
        >
      </div>

      <!-- On auth page: just a "Back to Home" nudge for guests -->
      <div v-else-if="route.name === 'auth'" class="flex gap-4">
        <RouterLink
          to="/"
          class="font-spaceGrotesk font-bold text-sm text-slate-500 hover:text-slate-900 transition-colors"
          >← Home</RouterLink
        >
      </div>

      <!-- Dashboard / Scan / Profile nav: icon links -->
      <div v-else class="flex gap-4 items-center">
        <nav v-if="isDashboard || isProfile" class="flex gap-1 items-center">
          <RouterLink
            v-if="!isDashboard"
            to="/dashboard"
            :class="['nav-icon-btn', isDashboard ? 'nav-icon-btn--active' : '']"
          >
            🍽 <span class="hidden sm:inline ml-1.5">Dashboard</span>
          </RouterLink>
          <!--<RouterLink to="/scan" :class="['nav-icon-btn', isScan ? 'nav-icon-btn--active' : '']">
            🧾 <span class="hidden sm:inline ml-1.5">Scan Receipt</span>
          </RouterLink>-->
          <RouterLink
            v-else
            to="/profile"
            :class="['nav-icon-btn', isProfile ? 'nav-icon-btn--active' : '']"
          >
            👤 <span class="hidden sm:inline ml-1.5">Profile</span>
          </RouterLink>
        </nav>
      </div>
    </header>

    <!-- ── Main content ───────────────────────────────────────────────── -->
    <main class="pt-[72px] flex-grow flex flex-col relative w-full overflow-hidden">
      <RouterView />
    </main>
  </div>
</template>

<style>
@import 'tailwindcss';

@theme {
  --font-tomorrow: 'Tomorrow', sans-serif;
  --font-spaceGrotesk: 'Space Grotesk', sans-serif;
}

body {
  background-color: #eff9e5;
  color: #0f172a;
}

/* ── Brutalist button ──────────────────────────────────────────────────── */
.brutalist-btn {
  border: 2px solid #0f172a;
  box-shadow: 4px 4px 0px rgba(15, 23, 42, 1);
}
.brutalist-btn:hover {
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0px rgba(15, 23, 42, 1);
}
.brutalist-btn:active {
  transform: translate(2px, 2px);
  box-shadow: 2px 2px 0px rgba(15, 23, 42, 1);
}

/* ── Organic card ──────────────────────────────────────────────────────── */
.organic-card {
  border: 2px solid #0f172a;
  border-radius: 20px;
  background-color: #eff9e5;
  box-shadow: 0 10px 30px -5px rgba(16, 185, 129, 0.15);
}

/* ── Nav icon buttons (dashboard/scan header) ──────────────────────────── */
.nav-icon-btn {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: 12px;
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #64748b;
  border: 2px solid transparent;
  transition: all 0.15s ease;
}
.nav-icon-btn:hover {
  color: #0f172a;
  border-color: #0f172a;
  background: #f1f5f9;
}
.nav-icon-btn--active {
  color: #0f172a;
  border-color: #0f172a;
  background: #d1fae5;
  box-shadow: 2px 2px 0px #0f172a;
}
</style>

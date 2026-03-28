<script setup lang="ts">
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()

const isHome = computed(() => route.path === '/')
const isSurvey = computed(() => route.path === '/profile')
const isDashboard = computed(() => route.path === '/dashboard')
const isScan = computed(() => route.path === '/scan')
</script>

<template>
  <div class="min-h-screen bg-stone-50 text-slate-900 font-tomorrow flex flex-col font-sans selection:bg-emerald-300 selection:text-slate-900">

    <!-- ── Header ─────────────────────────────────────────────────────── -->
    <header class="fixed top-0 left-0 w-full z-50 bg-stone-50/95 backdrop-blur-md border-b-2 border-slate-900 px-6 py-4 flex justify-between items-center h-[72px]">
      <!-- Logo -->
      <RouterLink to="/" class="logo font-spaceGrotesk font-black text-2xl tracking-tighter hover:scale-105 transition-transform origin-left text-slate-900 drop-shadow-sm">
        EASEY PREP <span class="text-emerald-700">CO.</span>
      </RouterLink>

      <!-- Landing nav: CTA only -->
      <div v-if="isHome" class="flex gap-3 items-center">
        <RouterLink
          to="/profile"
          class="brutalist-btn bg-emerald-400 hover:bg-emerald-300 px-6 py-2 rounded-xl font-spaceGrotesk font-black uppercase tracking-wider text-sm transition-all"
        >
          START NOW
        </RouterLink>
      </div>

      <!-- Survey nav: step hint -->
      <div v-else-if="isSurvey" class="flex gap-3 items-center">
        <RouterLink to="/" class="font-tomorrow text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-widest flex items-center gap-1">
          ← Home
        </RouterLink>
      </div>

      <!-- Dashboard / Scan nav: icon links -->
      <nav v-else-if="isDashboard || isScan" class="flex gap-1 items-center">
        <RouterLink
          to="/dashboard"
          :class="['nav-icon-btn', isDashboard ? 'nav-icon-btn--active' : '']"
        >
          🍽 <span class="hidden sm:inline ml-1.5">Dashboard</span>
        </RouterLink>
        <RouterLink
          to="/scan"
          :class="['nav-icon-btn', isScan ? 'nav-icon-btn--active' : '']"
        >
          🧾 <span class="hidden sm:inline ml-1.5">Scan Receipt</span>
        </RouterLink>
        <RouterLink to="/profile" class="nav-icon-btn">
          👤 <span class="hidden sm:inline ml-1.5">Profile</span>
        </RouterLink>
      </nav>
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
  --font-tomorrow: "Tomorrow", sans-serif;
  --font-spaceGrotesk: "Space Grotesk", sans-serif;
}

body {
  background-color: #fafaf9;
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
  background-color: #ffffff;
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

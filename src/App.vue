<script setup lang="ts">
import { RouterLink, RouterView, useRoute } from 'vue-router'
import useDataStore from './composables/useDataStore'

const { firstUse } = useDataStore()
const route = useRoute()
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
        <RouterLink to="/dashboard">EASEY PREP<span class="text-emerald-700">CO.</span></RouterLink>
      </div>

      <!-- Only show button when strictly on landing page -->
      <div class="auth-buttons flex gap-4" v-if="route.path === '/'">
        <RouterLink
          :to="firstUse ? '/profile' : '/dashboard'"
          class="brutalist-btn bg-emerald-400 hover:bg-emerald-300 px-6 py-2.5 rounded-xl font-spaceGrotesk font-black uppercase tracking-wider text-sm transition-all focus:ring-4 focus:ring-emerald-200"
          >START NOW</RouterLink
        >
      </div>
      <div v-else>
        <RouterLink
          to="/profile"
          class="brutalist-btn bg-emerald-400 hover:bg-emerald-300 px-6 py-2.5 rounded-xl font-spaceGrotesk font-black uppercase tracking-wider text-sm transition-all focus:ring-4 focus:ring-emerald-200"
          >Profile</RouterLink
        >
      </div>
    </header>

    <main class="pt-[80px] flex-grow flex flex-col relative w-full overflow-hidden">
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
  background-color: #fafaf9; /* Tailwind stone-50 */
  color: #0f172a; /* Tailwind slate-900 */
}

/* Mixed Organic/Brutalist Utilities using Native Variables */
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

.organic-card {
  border: 2px solid #0f172a;
  border-radius: 20px;
  background-color: #ffffff;
  box-shadow: 0 10px 30px -5px rgba(16, 185, 129, 0.15); /* Soft emerald shadow glow */
}
</style>

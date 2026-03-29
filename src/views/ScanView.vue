<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="scan-page min-h-screen bg-[#eff9e5] flex flex-col items-center justify-center relative overflow-hidden px-6">
    <!-- Background glows (Removed as per request) -->

    <div class="relative z-10 text-center max-w-2xl mx-auto">
      <!-- Badge -->
      <div class="inline-flex items-center gap-2 bg-amber-300 border-2 border-slate-900 rounded-full px-5 py-2 shadow-[3px_3px_0px_#0f172a] mb-10">
        <span class="text-lg">🧾</span>
        <span class="font-spaceGrotesk font-black text-sm uppercase tracking-widest text-slate-900">Coming Soon</span>
      </div>

      <!-- Heading -->
      <h1 class="font-spaceGrotesk font-black text-[clamp(4rem,10vw,8rem)] tracking-tighter uppercase leading-none text-slate-900 mb-6">
        SCAN <span class="text-emerald-600">YOUR<br>RECEIPT</span>
      </h1>

      <!-- Description -->
      <p class="font-tomorrow text-slate-600 text-xl leading-relaxed max-w-lg mx-auto mb-12">
        Soon you'll be able to photograph a grocery receipt and automatically import your ingredients — no typing needed.
      </p>

      <!-- Features preview -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
        <div class="bg-[#eff9e5] border-2 border-slate-900 rounded-2xl p-5 shadow-[4px_4px_0px_#0f172a]">
          <div class="text-3xl mb-2">📸</div>
          <div class="font-spaceGrotesk font-bold text-sm uppercase text-slate-900">Photo Upload</div>
          <div class="font-tomorrow text-xs text-slate-500 mt-1">Snap and upload your receipt</div>
        </div>
        <div class="bg-[#eff9e5] border-2 border-slate-900 rounded-2xl p-5 shadow-[4px_4px_0px_#0f172a]">
          <div class="text-3xl mb-2">🔍</div>
          <div class="font-spaceGrotesk font-bold text-sm uppercase text-slate-900">AI Parsing</div>
          <div class="font-tomorrow text-xs text-slate-500 mt-1">We extract every ingredient</div>
        </div>
        <div class="bg-[#eff9e5] border-2 border-slate-900 rounded-2xl p-5 shadow-[4px_4px_0px_#0f172a]">
          <div class="text-3xl mb-2">✅</div>
          <div class="font-spaceGrotesk font-bold text-sm uppercase text-slate-900">Auto-Fill</div>
          <div class="font-tomorrow text-xs text-slate-500 mt-1">Your pantry updates instantly</div>
        </div>
      </div>

      <!-- Back link -->
      <RouterLink
        to="/dashboard"
        class="brutalist-btn bg-slate-900 text-[#eff9e5] font-spaceGrotesk font-black uppercase tracking-widest py-4 px-10 text-base rounded-2xl hover:bg-slate-800 inline-block"
      >
        ← Back to Dashboard
      </RouterLink>
    </div>
  </div>
</template>

<style scoped></style>

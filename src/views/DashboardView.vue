<script setup lang="ts">
import IngredientList from '@/components/ingredients/IngredientList.vue';
import Prompting from '@/components/prompting.vue';

const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
const meals = ['Breakfast', 'Lunch', 'Dinner'];

function onPlanReady(plan: any): void {
  console.log('Meal plan received:', plan)
}

function onPlanError(message: string): void {
  console.error('Meal plan error:', message)
}
</script>

<template>
  <div class="dashboard-page bg-stone-50 overflow-x-hidden min-h-screen pb-40 pt-[80px]">
    
    <!-- Mega Colorful Header Area -->
    <div class="header-section bg-gradient-to-br from-emerald-600 via-teal-500 to-cyan-500 py-24 px-6 lg:px-12 flex flex-col items-center text-center relative overflow-hidden shadow-xl border-b-4 border-slate-900">
      <!-- Glows -->
      <div class="absolute top-0 right-0 w-[400px] h-[400px] bg-rose-400 rounded-full mix-blend-screen blur-[80px] opacity-40 translate-x-1/2 -translate-y-1/2"></div>
      <div class="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-300 rounded-full mix-blend-screen blur-[90px] opacity-40 -translate-x-1/2 translate-y-1/2"></div>

      <div class="relative z-10 max-w-5xl mx-auto">
        <h1 class="text-[clamp(4rem,8vw,7rem)] font-spaceGrotesk font-black text-stone-50 tracking-tighter leading-none mb-8 drop-shadow-2xl">
          FRIDGE & <span class="text-amber-300 drop-shadow-[4px_4px_0px_rgba(15,23,42,1)]">MEALS</span>
        </h1>
        <p class="font-tomorrow text-emerald-50 text-2xl max-w-2xl mx-auto opacity-90 drop-shadow-sm font-bold bg-slate-900/30 px-6 py-2 rounded-2xl border-2 border-emerald-300/30">
          Manage your ingredients & let AI craft your perfect week.
        </p>
      </div>
    </div>
    
    <div class="max-w-[1440px] mx-auto px-6 lg:px-12 mt-16 grid grid-cols-1 xl:grid-cols-4 gap-16">
      
      <!-- Ingredients Sidebar (Rose Theme) -->
      <div class="xl:col-span-1 space-y-6">
        <div class="p-8 border-4 border-rose-900 shadow-[8px_8px_0px_#881337] bg-rose-50 rounded-[30px] relative overflow-hidden group">
          <div class="absolute top-0 right-0 w-32 h-32 bg-white rounded-full mix-blend-soft-light blur-[20px] opacity-50"></div>
          
          <IngredientList class="relative z-10" />
        </div>
      </div>

      <!-- Vertical Weekly Plan List -->
      <div class="xl:col-span-3">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6 bg-amber-50 p-8 rounded-[30px] border-4 border-amber-900 shadow-[8px_8px_0px_#78350f]">
          <div>
             <h2 class="text-4xl md:text-5xl font-black font-spaceGrotesk text-slate-900 uppercase tracking-tighter drop-shadow-sm">This Week's Menu</h2>
             <p class="font-tomorrow text-amber-700 font-bold mt-2 text-lg">Your itinerary for the next 7 days.</p>
          </div>
          
          <!-- AI Generation Component -->
          <Prompting 
            class="brutalist-btn bg-emerald-400 hover:bg-emerald-300 text-slate-900 rounded-2xl font-spaceGrotesk font-black text-xl uppercase tracking-widest cursor-pointer py-4 px-8 focus:ring-4 focus:ring-emerald-200"
            @success="onPlanReady" 
            @error="onPlanError" 
          />
        </div>
        
        <!-- VERTICAL ITINERARY (Replaces the month-like grid) -->
        <div class="space-y-8">
          <div v-for="(day, index) in days" :key="day" 
               class="bg-white border-4 border-slate-900 rounded-[30px] shadow-[8px_8px_0px_rgba(15,23,42,1)] overflow-hidden flex flex-col md:flex-row hover:-translate-y-1 transition-transform duration-300">
            
            <!-- Colorful Day Header Band (Left side on desktop, Top on mobile) -->
            <div :class="[
              'p-6 md:w-64 flex md:flex-col items-center justify-between md:justify-center border-b-4 md:border-b-0 md:border-r-4 border-slate-900',
              index % 3 === 0 ? 'bg-sky-300' : index % 3 === 1 ? 'bg-rose-300' : 'bg-emerald-300'
            ]">
               <h3 class="font-spaceGrotesk font-black text-4xl text-slate-900 uppercase tracking-tighter rotate-0 md:-rotate-90 md:origin-center drop-shadow-sm whitespace-nowrap">{{ day }}</h3>
               <div class="font-tomorrow font-bold text-slate-800 bg-white/50 px-3 py-1 border-2 border-slate-900 rounded-lg text-sm md:mt-[100px]">3 Meals</div>
            </div>
            
            <!-- Meals Content -->
            <div class="flex-1 p-6 lg:p-10 bg-slate-50 flex flex-col gap-6 w-full">
              <div v-for="meal in meals" :key="day + meal" class="bg-white border-2 border-slate-200 hover:border-emerald-400 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer group">
                
                <div class="flex items-center gap-4">
                  <!-- Meal Icon Badge -->
                  <div class="w-12 h-12 rounded-xl flex items-center justify-center font-black text-2xl border-2 border-slate-900 bg-amber-200 group-hover:bg-amber-300 transition-colors shadow-sm">
                    {{ meal.charAt(0) }}
                  </div>
                  <div>
                    <h4 class="font-spaceGrotesk font-bold text-xl text-slate-900 uppercase">{{ meal }}</h4>
                    <span class="text-slate-400 font-tomorrow text-sm font-bold uppercase tracking-widest mt-1 block group-hover:text-emerald-500 transition-colors">Unassigned</span>
                  </div>
                </div>

                <button class="font-tomorrow text-sm font-bold uppercase text-slate-500 bg-slate-100 hover:bg-emerald-100 hover:text-emerald-700 px-4 py-2 rounded-xl transition-colors shrink-0">
                  Assign Recipe
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
/* Scoped overrides if needed, generic utilities are in App.vue */
</style>

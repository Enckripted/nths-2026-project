<script setup lang="ts">
import { useRouter } from 'vue-router';
import useUserProfile from '@/composables/useUserProfile';
import StringList from '@/components/StringList.vue';

const router = useRouter();
const profile = useUserProfile();

const submitProfile = () => {
  profile.isComplete.value = true;
  router.push('/dashboard');
};
</script>

<template>
  <div class="survey-page pt-32 pb-40 px-6 max-w-5xl mx-auto overflow-hidden">
    <!-- Super Vibrant Header -->
    <div class="header relative mb-16 text-center">
      <div class="absolute -top-32 left-[20%] w-[300px] h-[300px] bg-rose-400 rounded-full mix-blend-multiply blur-[80px] opacity-40"></div>
      <div class="absolute top-[10%] right-[10%] w-[250px] h-[250px] bg-amber-300 rounded-full mix-blend-multiply blur-[70px] opacity-50"></div>
      
      <h1 class="text-[clamp(4rem,8vw,7rem)] leading-[0.9] font-black font-spaceGrotesk text-slate-900 tracking-tighter uppercase relative z-10 drop-shadow-md">
        Let's <span class="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400">Build</span><br/>Your Plan
      </h1>
      <p class="text-2xl text-slate-700 mt-6 font-tomorrow font-bold relative z-10 inline-block bg-yellow-200 px-6 py-2 rounded-xl border-2 border-slate-900 rotate-1 shadow-sm">
        Tell us a bit about yourself so our AI can craft the perfect menu.
      </p>
    </div>

    <form @submit.prevent="submitProfile" class="space-y-16 relative z-10 max-w-4xl mx-auto">
      
      <!-- Basics (Emerald Theme) -->
      <section class="organic-card relative overflow-hidden group border-2 border-emerald-900 bg-emerald-50 shadow-[6px_6px_0px_#064e3b]">
        <!-- Decorative bg bubble -->
        <div class="absolute -top-16 -right-16 w-48 h-48 bg-emerald-200 rounded-full blur-[30px] opacity-70"></div>
        
        <div class="p-8 md:p-12 relative z-10">
          <h2 class="text-3xl font-spaceGrotesk font-black text-emerald-900 uppercase mb-8 flex items-center gap-4 drop-shadow-sm">
            <span class="bg-emerald-400 text-slate-900 w-12 h-12 flex items-center justify-center rounded-xl border-2 border-emerald-900 shadow-sm text-2xl rotate-[-3deg]">1</span>
            The Basics
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="space-y-3">
              <label class="font-tomorrow font-bold text-sm text-emerald-800 uppercase tracking-widest">Gender</label>
              <select v-model="profile.gender.value" class="w-full border-2 border-emerald-900 rounded-2xl bg-white p-4 font-tomorrow text-xl focus:outline-none focus:ring-4 focus:ring-emerald-300 hover:border-emerald-500 transition-colors cursor-pointer text-slate-800 shadow-[2px_2px_0px_#064e3b]">
                <option disabled value="">Select...</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div class="space-y-3">
              <label class="font-tomorrow font-bold text-sm text-emerald-800 uppercase tracking-widest">Height (cm)</label>
              <input v-model.number="profile.height.value" type="number" placeholder="cm" class="w-full border-2 border-emerald-900 rounded-2xl bg-white p-4 font-tomorrow text-xl focus:outline-none focus:ring-4 focus:ring-emerald-300 shadow-[2px_2px_0px_#064e3b]" />
            </div>
            <div class="space-y-3">
              <label class="font-tomorrow font-bold text-sm text-emerald-800 uppercase tracking-widest">Weight (kg)</label>
              <input v-model.number="profile.weight.value" type="number" placeholder="kg" class="w-full border-2 border-emerald-900 rounded-2xl bg-white p-4 font-tomorrow text-xl focus:outline-none focus:ring-4 focus:ring-emerald-300 shadow-[2px_2px_0px_#064e3b]" />
            </div>
          </div>
        </div>
      </section>

      <!-- Fitness Goals & Activity (Amber/Yellow Theme) -->
      <section class="organic-card relative overflow-hidden group border-2 border-amber-900 bg-amber-50 shadow-[6px_6px_0px_#78350f]">
        <div class="absolute -bottom-16 -left-16 w-56 h-56 bg-amber-300 rounded-full blur-[40px] opacity-40"></div>
        
        <div class="p-8 md:p-12 relative z-10">
          <h2 class="text-3xl font-spaceGrotesk font-black text-amber-900 uppercase mb-8 flex items-center gap-4">
            <span class="bg-amber-400 text-slate-900 w-12 h-12 flex items-center justify-center rounded-xl border-2 border-amber-900 shadow-sm text-2xl rotate-[3deg]">2</span>
            Goals & Activity
          </h2>
          
          <div class="space-y-10">
            <div>
              <label class="font-tomorrow font-bold text-sm text-amber-800 uppercase tracking-widest block mb-4">Primary Goal</label>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <label v-for="goal in ['cut', 'maintain', 'bulk']" :key="goal" 
                      class="cursor-pointer border-2 border-amber-900 rounded-2xl p-5 text-center font-spaceGrotesk font-black text-2xl uppercase transition-all duration-300 shadow-[2px_2px_0px_#78350f]"
                      :class="profile.desiredWeightDirection.value === goal ? 'bg-amber-400 text-amber-900 scale-[1.02]' : 'bg-white text-gray-500 hover:bg-amber-100/50'">
                  <input type="radio" v-model="profile.desiredWeightDirection.value" :value="goal" class="hidden" />
                  {{ goal }}
                </label>
              </div>
            </div>

            <div class="space-y-3">
              <label class="font-tomorrow font-bold text-sm text-amber-800 uppercase tracking-widest block">Activity Level (1-10)</label>
              <input v-model.number="profile.activityLevel.value" type="number" min="1" max="10" placeholder="e.g. 5" class="w-full border-2 border-amber-900 rounded-2xl bg-white p-4 font-tomorrow text-xl focus:outline-none focus:ring-4 focus:ring-amber-300 shadow-[2px_2px_0px_#78350f]" />
            </div>
          </div>
        </div>
      </section>

      <!-- Preferences (Rose/Pink Theme) -->
      <section class="organic-card relative overflow-hidden group border-2 border-rose-900 bg-rose-50 shadow-[6px_6px_0px_#881337]">
        <div class="absolute top-1/2 right-[-10%] w-64 h-64 bg-rose-300 rounded-full blur-[60px] opacity-30"></div>
        
        <div class="p-8 md:p-12 relative z-10">
          <h2 class="text-3xl font-spaceGrotesk font-black text-rose-900 uppercase mb-8 flex items-center gap-4">
            <span class="bg-rose-400 text-slate-900 w-12 h-12 flex items-center justify-center rounded-xl border-2 border-rose-900 shadow-sm text-2xl rotate-[-2deg]">3</span>
            Kitchen Preferences
          </h2>
          
          <div class="grid grid-cols-1 gap-10">
            <div class="space-y-3">
              <label class="font-tomorrow font-bold text-sm text-rose-800 uppercase tracking-widest block">Cooking Time Limit (Mins)</label>
              <input v-model.number="profile.minutesForCooking.value" type="number" min="0" placeholder="e.g. 30" class="w-full border-2 border-rose-900 rounded-2xl bg-white p-4 font-tomorrow text-xl focus:outline-none focus:ring-4 focus:ring-rose-300 shadow-[2px_2px_0px_#881337]" />
            </div>
              
            <!-- Adding explicit custom tint to StringList wrapping if possible, or leave default -->
            <div class="bg-white p-6 rounded-2xl border-2 border-rose-900 shadow-[2px_2px_0px_#881337] space-y-6">
              <StringList
                v-model="profile.cuisineFavorites.value"
                label="FAVORITE CUISINES"
                placeholder="e.g., Italian, Mexican"
              />
              <hr class="border-rose-200" />
              <StringList
                v-model="profile.strongDislikes.value"
                label="STRONG DISLIKES"
                placeholder="e.g., Mushrooms, Spicy Food"
              />
              <hr class="border-rose-200" />
              <StringList
                v-model="profile.allergies.value"
                label="ALLERGIES"
                placeholder="e.g., Peanuts, Gluten"
              />
            </div>
          </div>
        </div>
      </section>

      <div class="text-center pt-8">
        <button type="submit" class="brutalist-btn bg-emerald-400 hover:bg-emerald-300 text-slate-900 text-2xl lg:text-3xl font-spaceGrotesk font-black uppercase py-6 px-12 rounded-2xl inline-flex items-center gap-4 focus:ring-8 focus:ring-emerald-200">
          Generate Weekly Plan
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" class="text-slate-900 stroke-current stroke-3 stroke-linecap-round stroke-linejoin-round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
        </button>
      </div>

    </form>
  </div>
</template>

<style scoped>
</style>

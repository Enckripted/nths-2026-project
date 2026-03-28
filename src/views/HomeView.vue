<script setup lang="ts">
import { ref, onMounted } from 'vue';

const features = [
  { img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80', title: 'Start Fresh. Fuel Right.', desc: 'Power your wellness goals with our healthiest menu of fresh, nutrient-dense, ready-to-eat meals.', bgClass: 'bg-gradient-to-br from-emerald-300 to-teal-400' },
  { img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80', title: 'Cook up 100+ recipes', desc: 'Ready in under 30 minutes. Flexible plans, no commitments.', bgClass: 'bg-gradient-to-tr from-amber-300 to-yellow-400' },
  { img: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80', title: 'Dietitian Approved', desc: 'Chef-crafted meals, tailored precisely for your macro-nutrient needs.', bgClass: 'bg-gradient-to-br from-rose-300 to-pink-400' }
];

const scrollY = ref(0);
onMounted(() => {
  window.addEventListener('scroll', () => {
    scrollY.value = window.scrollY;
  });
});
</script>

<template>
  <div class="home-page overflow-hidden bg-stone-50">
    <!-- Hero Section -->
    <section class="hero relative min-h-[90vh] flex flex-col justify-center px-[5vw] lg:px-[10vw]">
      <!-- Vibrant Organic Background Gradients -->
      <div class="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-emerald-300 rounded-full mix-blend-multiply blur-[100px] opacity-60 animate-[spin_30s_linear_infinite]"></div>
      <div class="absolute bottom-[20%] left-[-10%] w-[500px] h-[500px] bg-amber-200 rounded-full mix-blend-multiply blur-[120px] opacity-50 animate-pulse"></div>
      <div class="absolute top-[40%] right-[30%] w-[400px] h-[400px] bg-sky-200 rounded-full mix-blend-multiply blur-[90px] opacity-40"></div>

      <!-- Main Typography block -->
      <div class="relative z-10 w-full flex flex-col justify-center max-w-7xl mx-auto h-full">
        <!-- Layered Text Effect aligned extremely left -->
        <h1 class="font-spaceGrotesk tracking-tighter uppercase leading-[0.80] text-[clamp(6rem,14vw,16rem)] flex flex-col text-slate-900 pointer-events-none">
          <span class="block relative layered-soft mix-organic text-emerald-800 drop-shadow-xl z-[4]">EASEY</span>
          <span class="block relative layered-soft mix-organic text-emerald-800 drop-shadow-xl z-[3] -mt-[0.05em]">PREP</span>
          
          <div class="flex flex-col md:flex-row md:items-baseline gap-4 md:gap-12 -mt-[0.05em] z-[5] w-full">
            <span class="block font-black mix-organic text-emerald-500 drop-shadow-lg leading-none">CO.</span>
            
            <span class="font-tomorrow font-bold text-2xl md:text-3xl lg:text-5xl text-slate-800 whitespace-nowrap self-start md:self-auto mt-6 md:mt-0 tracking-tight leading-none bg-yellow-300/80 px-4 py-2 rounded-lg rotate-[-2deg] border-2 border-slate-900">
              { Simple. Quick. Efficient. }
            </span>
          </div>
        </h1>
      </div>
    </section>

    <!-- Dynamic Feature Scroll Section -->
    <section class="features-section bg-slate-900 py-32 px-[5vw] lg:px-[10vw] relative overflow-hidden">
      <!-- Decor blobs -->
      <div class="absolute top-1/4 right-1/4 w-[800px] h-[800px] bg-emerald-600 rounded-full mix-blend-screen blur-[150px] opacity-30"></div>
      <div class="absolute bottom-1/4 left-1/4 w-[600px] h-[600px] bg-rose-500 rounded-full mix-blend-screen blur-[130px] opacity-20"></div>

      <h2 class="text-stone-50 font-spaceGrotesk font-black text-[clamp(4rem,8vw,8rem)] mb-32 max-w-5xl tracking-tighter leading-none relative z-10 drop-shadow-2xl">
        NOTHING HITS LIKE <span class="bg-gradient-to-r from-emerald-400 to-lime-300 text-transparent bg-clip-text">HOME COOKING.</span>
      </h2>

      <div class="flex flex-col gap-40 relative z-10 max-w-7xl mx-auto">
        <div v-for="(feat, idx) in features" :key="idx" 
             class="feature-row flex flex-col md:flex-row gap-16 lg:gap-32 items-center group">
          <div class="text-content flex-1 max-w-xl" :class="idx % 2 !== 0 ? 'md:order-2' : ''">
            <h3 class="text-stone-50 font-spaceGrotesk font-bold text-5xl lg:text-6xl mb-8 tracking-tight drop-shadow-lg">{{ feat.title }}</h3>
            <p class="text-stone-300 font-tomorrow text-xl lg:text-2xl leading-relaxed mb-12">{{ feat.desc }}</p>
            <RouterLink to="/survey" class="brutalist-btn bg-emerald-400 text-slate-900 font-spaceGrotesk font-black uppercase tracking-widest py-5 px-10 text-xl md:text-2xl rounded-2xl hover:bg-emerald-300 inline-block focus:ring-4 focus:ring-emerald-200">
              See Pricing & Plans
            </RouterLink>
          </div>
          
          <div class="image-content flex-1 w-full max-w-lg relative">
            <!-- Organic Brutalist Image Frame -->
            <div class="aspect-square relative group-hover:-translate-y-4 group-hover:rotate-3 transition-transform duration-700 ease-out">
              <!-- Soft colorful drop shadow behind -->
              <div :class="`absolute inset-0 rounded-[40px] border-4 border-slate-900 ${feat.bgClass} translate-x-6 translate-y-6 shadow-2xl`"></div>
              <!-- Image itself -->
              <img :src="feat.img" class="absolute inset-0 w-full h-full object-cover rounded-[40px] border-4 border-slate-900 shadow-xl group-hover:scale-[1.03] transition-all duration-700 will-change-transform" />
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* Mix of brutalist structural layering with organic colors */
.layered-soft {
  text-shadow: 
    4px 4px 0px rgba(16, 185, 129, 0.2), /* Light emerald offset */
    8px 8px 0px rgba(15, 23, 42, 1);     /* Deep Slate offset */
}

.mix-organic {
  font-weight: 900;
  letter-spacing: -0.06em;
}
</style>

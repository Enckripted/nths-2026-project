<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { RouterLink } from 'vue-router';
import useAuth from '@/composables/useAuth';

const { user } = useAuth();

const features = [
  {
    img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80',
    title: 'Start Fresh. Fuel Right.',
    desc: 'Power your wellness goals with our healthiest menu of fresh, nutrient-dense, ready-to-eat meals.',
    bgClass: 'bg-gradient-to-br from-emerald-300 to-teal-400'
  },
  {
    img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80',
    title: 'Cook up 100+ recipes',
    desc: 'Ready in under 30 minutes. Flexible plans, no commitments.',
    bgClass: 'bg-gradient-to-tr from-amber-300 to-yellow-400'
  },
  {
    img: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80',
    title: 'Nutrition-First',
    desc: 'AI-crafted meals, tailored precisely for your macro-nutrient needs and fitness goals.',
    bgClass: 'bg-gradient-to-br from-rose-300 to-pink-400'
  }
];

const howItWorks = [
  {
    num: '01',
    title: 'Tell us about yourself',
    desc: 'Complete a quick 3-step survey — your goals, cooking preferences, and dietary needs.',
    accent: 'bg-emerald-300',
    border: 'border-emerald-900',
    shadow: 'shadow-[6px_6px_0px_#064e3b]',
  },
  {
    num: '02',
    title: 'Add your ingredients',
    desc: "Enter what's already in your fridge and pantry. Soon you'll be able to scan a receipt too.",
    accent: 'bg-amber-300',
    border: 'border-amber-900',
    shadow: 'shadow-[6px_6px_0px_#78350f]',
  },
  {
    num: '03',
    title: 'Get your week planned',
    desc: 'Our AI generates a complete 7-day meal plan with recipes, macros, and a shopping list.',
    accent: 'bg-sky-300',
    border: 'border-sky-900',
    shadow: 'shadow-[6px_6px_0px_#0c4a6e]',
  },
];

const scrollY = ref(0);
let scrollHandler: () => void;

onMounted(() => {
  scrollHandler = () => { scrollY.value = window.scrollY; };
  window.addEventListener('scroll', scrollHandler, { passive: true });
});
onUnmounted(() => window.removeEventListener('scroll', scrollHandler));
</script>

<template>
  <div class="home-page overflow-hidden bg-stone-50">

    <!-- ══════════════════ HERO ══════════════════ -->
    <section class="hero relative min-h-[90vh] flex flex-col justify-center px-[5vw] lg:px-[10vw]">
      <!-- Background glows -->
      <div class="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-emerald-300 rounded-full mix-blend-multiply blur-[100px] opacity-60 animate-[spin_30s_linear_infinite] pointer-events-none"></div>
      <div class="absolute bottom-[20%] left-[-10%] w-[500px] h-[500px] bg-amber-200 rounded-full mix-blend-multiply blur-[120px] opacity-50 animate-pulse pointer-events-none"></div>
      <div class="absolute top-[40%] right-[30%] w-[400px] h-[400px] bg-sky-200 rounded-full mix-blend-multiply blur-[90px] opacity-40 pointer-events-none"></div>

      <!-- Hero text -->
      <div class="relative z-10 w-full flex flex-col justify-center max-w-7xl mx-auto">
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

        <!-- Hero CTA — changes based on auth state -->
        <div class="mt-16 flex flex-col sm:flex-row gap-4 relative z-10 items-center">
          <!-- Guest: Get Started + Sign In -->
          <template v-if="!user">
            <RouterLink
              to="/survey"
              class="brutalist-btn bg-slate-900 text-stone-50 font-spaceGrotesk font-black uppercase tracking-widest py-4 px-10 text-lg rounded-2xl hover:bg-slate-800 inline-block focus:ring-4 focus:ring-slate-300"
            >
              Get Started — Free →
            </RouterLink>
            <RouterLink
              to="/auth"
              class="brutalist-btn bg-white text-slate-900 font-spaceGrotesk font-black uppercase tracking-widest py-4 px-8 text-lg rounded-2xl hover:bg-stone-100 inline-block focus:ring-4 focus:ring-slate-200 border-2 border-slate-900"
            >
              Sign In
            </RouterLink>
          </template>

          <!-- Logged in: Go to Dashboard -->
          <template v-else>
            <RouterLink
              to="/dashboard"
              class="brutalist-btn bg-slate-900 text-stone-50 font-spaceGrotesk font-black uppercase tracking-widest py-4 px-10 text-lg rounded-2xl hover:bg-slate-800 inline-block focus:ring-4 focus:ring-slate-300"
            >
              Go to Dashboard →
            </RouterLink>
          </template>

          <a
            href="#how-it-works"
            class="font-tomorrow font-bold text-slate-600 hover:text-slate-900 transition-colors text-base flex items-center gap-2 px-4"
          >
            How it works ↓
          </a>
        </div>
      </div>
    </section>

    <!-- ══════════════════ HOW IT WORKS ══════════════════ -->
    <section id="how-it-works" class="how-section bg-stone-100 border-y-4 border-slate-900 py-28 px-[5vw] lg:px-[10vw]">
      <div class="max-w-6xl mx-auto">
        <h2 class="font-spaceGrotesk font-black text-[clamp(3rem,6vw,6rem)] tracking-tighter uppercase text-slate-900 mb-20 leading-none">
          Simple as <span class="text-emerald-600">1, 2, 3.</span>
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div
            v-for="(step, i) in howItWorks"
            :key="i"
            :class="['rounded-[28px] border-4 p-8 flex flex-col gap-4 relative overflow-hidden group hover:-translate-y-2 transition-transform duration-300', step.accent, step.border, step.shadow]"
          >
            <!-- Big number watermark -->
            <span class="absolute bottom-[-20px] right-2 font-spaceGrotesk font-black text-[9rem] leading-none text-black/10 pointer-events-none select-none">{{ step.num }}</span>
            <!-- Content -->
            <span class="font-spaceGrotesk font-black text-5xl text-slate-900 leading-none relative z-10">{{ step.num }}</span>
            <h3 class="font-spaceGrotesk font-bold text-2xl text-slate-900 uppercase tracking-tight leading-tight relative z-10">{{ step.title }}</h3>
            <p class="font-tomorrow text-slate-700 text-base leading-relaxed relative z-10">{{ step.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ══════════════════ FEATURES ══════════════════ -->
    <section class="features-section bg-slate-900 py-32 px-[5vw] lg:px-[10vw] relative overflow-hidden">
      <div class="absolute top-1/4 right-1/4 w-[800px] h-[800px] bg-emerald-600 rounded-full mix-blend-screen blur-[150px] opacity-30 pointer-events-none"></div>
      <div class="absolute bottom-1/4 left-1/4 w-[600px] h-[600px] bg-rose-500 rounded-full mix-blend-screen blur-[130px] opacity-20 pointer-events-none"></div>

      <h2 class="text-stone-50 font-spaceGrotesk font-black text-[clamp(4rem,8vw,8rem)] mb-32 max-w-5xl tracking-tighter leading-none relative z-10 drop-shadow-2xl">
        NOTHING HITS LIKE <span class="bg-gradient-to-r from-emerald-400 to-lime-300 text-transparent bg-clip-text">HOME COOKING.</span>
      </h2>

      <div class="flex flex-col gap-40 relative z-10 max-w-7xl mx-auto">
        <div
          v-for="(feat, idx) in features"
          :key="idx"
          class="feature-row flex flex-col md:flex-row gap-16 lg:gap-32 items-center group"
        >
          <div class="text-content flex-1 max-w-xl" :class="idx % 2 !== 0 ? 'md:order-2' : ''">
            <h3 class="text-stone-50 font-spaceGrotesk font-bold text-5xl lg:text-6xl mb-8 tracking-tight drop-shadow-lg">{{ feat.title }}</h3>
            <p class="text-stone-300 font-tomorrow text-xl lg:text-2xl leading-relaxed mb-12">{{ feat.desc }}</p>
            <div class="flex gap-4 flex-wrap">
              <RouterLink
                :to="user ? '/dashboard' : '/survey'"
                class="brutalist-btn bg-emerald-400 text-slate-900 font-spaceGrotesk font-black uppercase tracking-widest py-5 px-10 text-xl md:text-2xl rounded-2xl hover:bg-emerald-300 inline-block focus:ring-4 focus:ring-emerald-200"
              >
                {{ user ? 'Go to Dashboard →' : 'Get Started →' }}
              </RouterLink>
              <RouterLink
                v-if="!user"
                to="/auth"
                class="brutalist-btn bg-white/10 text-stone-50 font-spaceGrotesk font-black uppercase tracking-widest py-5 px-8 text-xl md:text-2xl rounded-2xl hover:bg-white/20 inline-block focus:ring-4 focus:ring-white/20 border-2 border-white/30"
              >
                Sign In
              </RouterLink>
            </div>
          </div>

          <div class="image-content flex-1 w-full max-w-lg relative">
            <div class="aspect-square relative group-hover:-translate-y-4 group-hover:rotate-3 transition-transform duration-700 ease-out">
              <div :class="`absolute inset-0 rounded-[40px] border-4 border-slate-900 ${feat.bgClass} translate-x-6 translate-y-6 shadow-2xl`"></div>
              <img :src="feat.img" class="absolute inset-0 w-full h-full object-cover rounded-[40px] border-4 border-slate-900 shadow-xl group-hover:scale-[1.03] transition-all duration-700 will-change-transform" alt="Meal" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ══════════════════ CTA FOOTER BANNER ══════════════════ -->
    <section class="cta-banner border-t-4 border-slate-900 bg-emerald-400 py-28 px-[5vw] lg:px-[10vw] flex flex-col md:flex-row items-center justify-between gap-12">
      <div>
        <h2 class="font-spaceGrotesk font-black text-[clamp(3rem,6vw,6rem)] tracking-tighter uppercase text-slate-900 leading-none">
          Ready to eat<br>smarter?
        </h2>
        <p class="font-tomorrow text-slate-800 text-xl mt-4 max-w-lg">
          Answer 5 quick questions and get a full week of meals built around <em>your</em> ingredients, goals, and schedule.
        </p>
      </div>
      <div class="flex flex-col sm:flex-row gap-4">
        <RouterLink
          :to="user ? '/dashboard' : '/survey'"
          class="brutalist-btn bg-slate-900 text-stone-50 font-spaceGrotesk font-black uppercase tracking-widest py-6 px-12 text-2xl md:text-3xl rounded-2xl hover:bg-slate-800 inline-block shrink-0 focus:ring-4 focus:ring-slate-300"
        >
          {{ user ? 'Go to Dashboard →' : 'Start for Free →' }}
        </RouterLink>
        <RouterLink
          v-if="!user"
          to="/auth"
          class="brutalist-btn bg-white text-slate-900 font-spaceGrotesk font-black uppercase tracking-widest py-6 px-10 text-2xl md:text-3xl rounded-2xl hover:bg-stone-100 inline-block shrink-0 focus:ring-4 focus:ring-slate-200"
        >
          Sign In
        </RouterLink>
      </div>
    </section>

    <!-- ══════════════════ FOOTER ══════════════════ -->
    <footer class="bg-slate-900 border-t-2 border-slate-700 py-10 px-[5vw] lg:px-[10vw] flex flex-col md:flex-row items-center justify-between gap-4">
      <span class="font-spaceGrotesk font-black text-xl text-stone-50 tracking-tighter">
        EASEY PREP <span class="text-emerald-400">CO.</span>
      </span>
      <span class="font-tomorrow text-sm text-slate-500">
        © 2026 EASEY PREP CO. — AI-powered meal planning.
      </span>
    </footer>
  </div>
</template>

<style scoped>
.layered-soft {
  text-shadow:
    4px 4px 0px rgba(16, 185, 129, 0.2),
    8px 8px 0px rgba(15, 23, 42, 1);
}
.mix-organic {
  font-weight: 900;
  letter-spacing: -0.06em;
}
</style>

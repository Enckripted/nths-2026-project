<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { RouterLink } from 'vue-router';
import cookingLeaf from '../assets/cooking-leaf.png';
import happyDivider from '../assets/happy-divider.png';

const howItWorks = [
  {
    num: '01',
    title: 'Tell us about yourself',
    desc: 'Complete a quick 3-step survey â€” your goals, cooking preferences, and dietary needs.',
    accent: 'bg-emerald-300',
    border: 'border-emerald-900',
    shadow: 'shadow-[6px_6px_0px_#064e3b]',
  },
  {
    num: '02',
    title: 'Add your ingredients',
    desc: 'Enter what\'s already in your fridge and pantry. Soon you\'ll be able to scan a receipt too.',
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
  <div class="home-page overflow-hidden bg-[#eff9e5]">

    <!-- HERO -->
    <section class="hero relative min-h-[90vh] flex flex-col justify-center px-[5vw] lg:px-[10vw]">
      <div class="relative z-10 w-full flex flex-col justify-center max-w-7xl mx-auto">
        <h1 class="relative font-spaceGrotesk tracking-tighter uppercase leading-[0.80] text-[clamp(6rem,14vw,16rem)] flex flex-col text-slate-900 pointer-events-none">
          <span class="block relative layered-soft mix-organic text-emerald-800 drop-shadow-xl z-[4] leading-none">
            <span class="inline-flex items-baseline leading-none">
              <span class="relative inline-block">
                <span
                  aria-hidden="true"
                  class="absolute left-[0.04em] right-[0.02em] top-[0.9em] h-[0.045em] bg-[#5ee9b5] pointer-events-none select-none"
                ></span>
                <span class="relative z-[1]">Ease</span>
              </span>
              <span>Y</span>
            </span>
          </span>
          <span class="block relative layered-soft mix-organic text-emerald-800 drop-shadow-xl z-[3] -mt-[0.05em]">PREP</span>
          <img
            :src="cookingLeaf"
            alt="Cooking leaf graphic"
            class="pointer-events-none absolute right-[-6%] top-[-5%] z-[6] hidden w-[clamp(17.25rem,27.6vw,32.2rem)] drop-shadow-[8px_8px_0px_rgba(13,13,13,0.18)] lg:block"
          />
          <div class="flex flex-col md:flex-row md:items-end gap-4 md:gap-12 -mt-[0.05em] z-[5] w-full">
            <span class="block self-start md:self-e6nd font-black mix-organic text-emerald-500 drop-shadow-lg leading-none">CO.</span>
            <span class="font-tomorrow font-bold text-[54px] text-slate-800 whitespace-nowrap self-start md:self-end mt-6 md:mt-0 tracking-tight leading-none bg-yellow-300/80 px-6 h-[72px] inline-flex items-center rounded-lg border-2 border-slate-900 md:-translate-y-[.7em]">
              { Simple. Quick. Efficient. }
            </span>
          </div>
        </h1>

        <div class="mt-16 flex flex-col sm:flex-row gap-4 relative z-10">
          <RouterLink
            to="/profile"
            class="brutalist-btn bg-slate-900 text-[#eff9e5] font-spaceGrotesk font-black uppercase tracking-widest py-4 px-10 text-lg rounded-2xl hover:bg-slate-800 inline-block focus:ring-4 focus:ring-slate-300"
          >
            Get Started For Free
          </RouterLink>
          <a
            href="#how-it-works"
            class="font-tomorrow font-bold text-slate-600 hover:text-slate-900 transition-colors text-base flex items-center gap-2 px-4"
          >
            How it works ↓
          </a>
        </div>
      </div>
    </section>

    <div class="divider-strip bg-[#fcf9f4]">
      <img
        :src="happyDivider"
        alt="Easey Prep divider"
        class="block h-34 w-full object-cover md:h-34"
      />
    </div>

    <!-- HOW IT WORKS -->
    <section id="how-it-works" class="how-section bg-stone-100 border-b-4 border-[#667b68] py-28 px-[5vw] lg:px-[10vw]">
      <div class="max-w-6xl mx-auto">
        <div class="mb-16">
          <h2 class="font-spaceGrotesk font-black text-[clamp(3rem,6vw,6rem)] tracking-tighter uppercase text-[#262626] leading-none">
            Simple as <span class="text-[#667b68]">1, 2, 3.</span>
          </h2>
          <p class="mt-5 max-w-2xl font-tomorrow text-base leading-relaxed text-[#737373]">
            The first section collects your preferences, the second grounds the plan in what you already have, and the third turns everything into a week of meals you can actually cook.
          </p>
        </div>

        <div class="relative mx-auto flex max-w-5xl flex-col gap-10 pl-0 md:pl-16">
          <div class="absolute left-5 top-0 hidden h-full w-[6px] bg-[#a3b899] md:block"></div>
          <div
            v-for="(step, i) in howItWorks"
            :key="i"
            class="group relative overflow-hidden border-4 border-[#667b68] bg-[#fcf9f4] p-8 md:ml-10 md:p-10 shadow-[12px_12px_0px_#a3b899]"
          >
            <div class="absolute left-[-4.75rem] top-10 hidden h-10 w-10 border-4 border-[#667b68] bg-[#dde6d5] md:block"></div>
            <div class="absolute right-4 top-4 h-20 w-20 border-4 border-[#667b68] bg-[#a3b899] opacity-20"></div>

            <div class="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div class="inline-flex items-center gap-3 border-2 border-[#667b68] bg-[#667b68] px-4 py-2 font-tomorrow text-xs font-bold uppercase tracking-[0.25em] text-[#fcf9f4]">
                <span>{{ step.num }}</span>
                <span>{{ i === 0 ? 'Profile Setup' : i === 1 ? 'Kitchen Inventory' : 'Weekly Plan' }}</span>
              </div>
              <span class="font-tomorrow text-xs uppercase tracking-[0.3em] text-[#737373]">
                Section 0{{ i + 1 }}
              </span>
            </div>

            <div class="relative z-10">
              <span class="block font-spaceGrotesk text-[clamp(5rem,10vw,8rem)] font-black leading-none tracking-[-0.08em] text-[#667b68]/20">
                {{ step.num }}
              </span>
              <h3 class="mt-3 max-w-sm font-spaceGrotesk text-3xl font-black uppercase leading-[0.95] tracking-[-0.05em] text-[#262626]">
                {{ step.title }}
              </h3>
              <p class="mt-6 max-w-xl font-tomorrow text-lg leading-relaxed text-[#262626]">
                {{ step.desc }}
              </p>
              <p class="mt-6 max-w-xl border-l-4 border-[#667b68] pl-4 font-tomorrow text-sm uppercase leading-relaxed tracking-[0.16em] text-[#737373]">
                {{ i === 0
                  ? 'This matches the intake section, where the reader defines goals, preferences, and constraints.'
                  : i === 1
                    ? 'This matches the inventory section, where the reader shows what is already available to cook with.'
                    : 'This matches the output section, where the reader receives the finished plan, recipes, and shopping list.' }}
              </p>
            </div>

            <div class="mt-10 flex items-center justify-between border-t-2 border-[#667b68] pt-5 font-tomorrow text-xs uppercase tracking-[0.25em] text-[#737373]">
              <span>Action {{ step.num }}</span>
              <span>{{ i === 0 ? 'Preferences' : i === 1 ? 'Ingredients' : 'Results' }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA FOOTER BANNER -->
    <section class="cta-banner border-t-4 border-slate-900 bg-emerald-400 py-28 px-[5vw] lg:px-[10vw] flex flex-col md:flex-row items-center justify-between gap-12">
      <div>
        <h2 class="font-spaceGrotesk font-black text-[clamp(3rem,6vw,6rem)] tracking-tighter uppercase text-slate-900 leading-none">
          Ready to eat<br>smarter?
        </h2>
        <p class="font-tomorrow text-slate-800 text-xl mt-4 max-w-lg">
          Answer 5 quick questions and get a full week of meals built around <em>your</em> ingredients, goals, and schedule.
        </p>
      </div>
      <RouterLink
        to="/profile"
        class="brutalist-btn bg-slate-900 text-[#eff9e5] font-spaceGrotesk font-black uppercase tracking-widest py-6 px-12 text-2xl md:text-3xl rounded-2xl hover:bg-slate-800 inline-block shrink-0 focus:ring-4 focus:ring-slate-300"
      >
        Start for Free â†’
      </RouterLink>
    </section>

    <!-- FOOTER -->
    <footer class="bg-slate-900 border-t-2 border-slate-700 py-10 px-[5vw] lg:px-[10vw] flex flex-col md:flex-row items-center justify-between gap-4">
      <span class="font-spaceGrotesk font-black text-xl text-[#eff9e5] tracking-tighter">
        EASEY PREP <span class="text-emerald-400">CO.</span>
      </span>
      <span class="font-tomorrow text-sm text-slate-500">
        Â© 2026 EASEY PREP CO. â€” AI-powered meal planning.
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

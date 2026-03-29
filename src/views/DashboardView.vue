<script setup lang="ts">
import IngredientList from '@/components/ingredients/IngredientList.vue'
import PromptingButton from '@/components/PromptingButton.vue'
import MealDetailModal from '@/components/MealDetailModal.vue'
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useMealPlan } from '@/composables/useMealPlan'
import { useSelectedMeal } from '@/composables/useSelectedMeal'
import useDataStore from '@/composables/useDataStore'

// ── Composables ───────────────────────────────────────────────────────────
const { mealPlan, loading, error } = useMealPlan()
const { selectMeal } = useSelectedMeal()
useDataStore()

// ── Date utilities — rolling 7 days from today ────────────────────────────
const today = new Date()
today.setHours(0, 0, 0, 0)

// 7 dates: today, today+1 … today+6
const weekDates = Array.from({ length: 7 }, (_, i) => {
  const d = new Date(today)
  d.setDate(today.getDate() + i)
  return d
})

const MONTH_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]
const DAY_SHORT = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

function formatDate(d: Date): string {
  return `${MONTH_SHORT[d.getMonth()]} ${d.getDate()}`
}
function dayLabel(d: Date): string {
  return DAY_SHORT[d.getDay()] as string
}
function isToday(d: Date): boolean {
  return d.getTime() === today.getTime()
}

// ── Day colours — keyed by day-of-week index (0=Sun … 6=Sat) ────────────
const dayColorsByDow: Record<number, string> = {
  0: 'bg-teal-300',
  1: 'bg-sky-300',
  2: 'bg-rose-300',
  3: 'bg-emerald-300',
  4: 'bg-amber-300',
  5: 'bg-violet-300',
  6: 'bg-pink-300',
}

function dayColor(d: Date): string {
  return dayColorsByDow[d.getDay()] ?? 'bg-slate-300'
}

// ── Static data ────────────────────────────────────────────────────────────
const MEALS = ['Breakfast', 'Lunch', 'Dinner'] as const

// ── State ──────────────────────────────────────────────────────────────────
const showIngredients = ref(false)
const planGenerated = computed(() => !!mealPlan.value?.weeklyPlan?.length)

// ── Lookup: plan days are ordered Day 1–7 matching weekDates[0–6] ─────────
function getMeal(dayIdx: number, meal: string) {
  const dayPlan = mealPlan.value?.weeklyPlan?.[dayIdx]
  if (!dayPlan) return undefined
  const key = meal.toLowerCase() as 'breakfast' | 'lunch' | 'dinner'
  return dayPlan[key]
}

function handleCellClick(dayIdx: number, meal: string): void {
  const m = getMeal(dayIdx, meal)
  if (m?.name) selectMeal(m)
}

function onPlanError(message: string): void {
  console.error('Meal plan error:', message)
}
</script>

<template>
  <div class="dashboard-page min-h-screen bg-stone-50 flex flex-col">
    <!-- Modal lives here, teleports to <body> -->
    <MealDetailModal />

    <!-- ══════════════════════════════════════════════════════
         WELCOME HEADER
    ══════════════════════════════════════════════════════ -->
    <div
      class="header-band bg-gradient-to-br from-emerald-600 via-teal-500 to-cyan-500 border-b-4 border-slate-900 relative overflow-hidden"
    >
      <div
        class="absolute top-0 right-0 w-[350px] h-[350px] bg-rose-400 rounded-full mix-blend-screen blur-[80px] opacity-35 translate-x-1/2 -translate-y-1/2 pointer-events-none"
      ></div>
      <div
        class="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-300 rounded-full mix-blend-screen blur-[90px] opacity-30 -translate-x-1/2 translate-y-1/2 pointer-events-none"
      ></div>

      <div
        class="relative z-10 max-w-[1600px] mx-auto px-8 lg:px-14 py-10 flex flex-col md:flex-row items-start md:items-center gap-8"
      >
        <div class="flex items-center gap-7 flex-1 min-w-0">
          <div
            class="w-24 h-24 lg:w-28 lg:h-28 shrink-0 bg-white/25 border-4 border-slate-900 rounded-[20px] shadow-[6px_6px_0px_rgba(15,23,42,1)] flex items-center justify-center text-5xl"
          >
            🧊
          </div>
          <div>
            <h1
              class="font-spaceGrotesk font-black text-stone-50 tracking-tighter leading-none uppercase drop-shadow-2xl text-[clamp(2.4rem,5vw,4.5rem)]"
            >
              Welcome to<br />your fridge
            </h1>
            <p class="font-tomorrow text-emerald-100 text-sm font-bold mt-2 opacity-90">
              Manage your ingredients &amp; let AI craft your perfect week.
            </p>
          </div>
        </div>

        <div class="flex flex-wrap gap-3 items-center shrink-0">
          <button
            @click="showIngredients = !showIngredients"
            class="brutalist-btn bg-[#eff9e5]/90 hover:bg-[#eff9e5] text-slate-900 font-spaceGrotesk font-black uppercase tracking-wider text-sm px-5 py-2.5 rounded-xl transition-all"
          >
            {{ showIngredients ? '▲ Hide' : '▼ Ingredients' }}
          </button>

          <!--<RouterLink
            to="/profile"
            class="brutalist-btn bg-white/20 hover:bg-white/40 text-[#eff9e5] font-spaceGrotesk font-black uppercase tracking-wider text-sm px-5 py-2.5 rounded-xl transition-all"
          >
            ✏️ Profile
          </RouterLink>-->

          <PromptingButton
            class="brutalist-btn bg-amber-300 hover:bg-amber-200 text-slate-900 rounded-xl font-spaceGrotesk font-black text-sm uppercase tracking-widest cursor-pointer py-2.5 px-6 focus:ring-4 focus:ring-amber-100"
            @error="onPlanError"
          />
        </div>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════
         INGREDIENTS DRAWER
    ══════════════════════════════════════════════════════ -->
    <Transition name="drawer">
      <div
        v-if="showIngredients"
        class="ingredients-drawer border-b-4 border-slate-900 bg-rose-50 px-8 lg:px-14 py-8"
      >
        <div class="max-w-[1600px] mx-auto">
          <h2
            class="font-spaceGrotesk font-black text-xl uppercase tracking-widest text-rose-900 mb-4 flex items-center gap-3"
          >
            <span class="w-2 h-6 bg-rose-500 border border-rose-900 rounded-sm inline-block"></span>
            Ingredients
          </h2>
          <IngredientList />
        </div>
      </div>
    </Transition>

    <!-- ══════════════════════════════════════════════════════
         CALENDAR SECTION
    ══════════════════════════════════════════════════════ -->
    <div class="calendar-section flex-1 flex flex-col">
      <div
        class="section-label-bar bg-stone-100 border-b-2 border-slate-900 px-8 lg:px-14 py-3 flex items-center gap-4"
      >
        <span
          class="font-spaceGrotesk font-black text-xs uppercase tracking-[0.18em] text-slate-500"
        >
          Next 7 Days
        </span>
        <div class="flex-1 h-px bg-slate-300"></div>
        <span
          v-if="loading"
          class="font-tomorrow text-xs font-bold text-amber-600 uppercase tracking-widest animate-pulse"
        >
          Generating plan…
        </span>
        <span
          v-else-if="error"
          class="font-tomorrow text-xs font-bold text-red-500 uppercase tracking-widest"
        >
          {{ error }}
        </span>
        <span
          v-else
          class="font-tomorrow text-xs font-bold text-slate-400 uppercase tracking-widest"
        >
          {{ planGenerated ? '7 days planned' : 'No plan yet — generate one above' }}
        </span>
      </div>

      <!-- ── Calendar Grid ── -->
      <div class="calendar-grid flex-1 overflow-x-auto px-6 lg:px-10 py-6">
        <div class="table-wrapper">
          <table class="w-full h-full border-collapse min-w-[700px]" style="table-layout: fixed">
            <thead>
              <tr>
                <th
                  class="row-label-header w-[80px] border-r-4 border-b-4 border-slate-900 bg-stone-50 rounded-tl-2xl"
                ></th>

                <!-- Dynamic day headers from rolling weekDates -->
                <th
                  v-for="(date, i) in weekDates"
                  :key="i"
                  :class="[
                    'day-header border-r-2 border-b-4 border-slate-900 last:border-r-0',
                    dayColor(date),
                    isToday(date) ? 'today-header' : '',
                    i === weekDates.length - 1 ? 'rounded-tr-2xl' : '',
                  ]"
                >
                  <div class="py-2.5 px-2 flex flex-col items-center">
                    <template v-if="isToday(date)">
                      <span
                        class="font-spaceGrotesk font-black text-slate-900 uppercase text-base tracking-tight leading-none"
                        >{{ dayLabel(date) }}</span
                      >
                      <span
                        class="font-tomorrow text-[10px] font-black tracking-wide mt-0.5 bg-slate-900 text-stone-50 px-2 py-0.5 rounded-full"
                        >TODAY</span
                      >
                    </template>
                    <template v-else>
                      <span
                        class="font-spaceGrotesk font-black text-slate-900 uppercase text-base tracking-tight leading-none"
                        >{{ dayLabel(date) }}</span
                      >
                      <span
                        class="font-tomorrow text-[10px] text-slate-700 font-bold tracking-wide mt-0.5"
                        >{{ formatDate(date) }}</span
                      >
                    </template>
                  </div>
                </th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="(meal, mealIdx) in MEALS" :key="meal" class="meal-row">
                <!-- Row label -->
                <td
                  :class="[
                    'row-label border-r-4 border-slate-900 text-center',
                    mealIdx === MEALS.length - 1
                      ? 'rounded-bl-2xl border-b-0'
                      : 'border-b-2 border-slate-200',
                  ]"
                >
                  <div class="py-4 flex flex-col items-center justify-center gap-1">
                    <span class="text-xl">{{
                      mealIdx === 0 ? '🌅' : mealIdx === 1 ? '☀️' : '🌙'
                    }}</span>
                    <span
                      class="font-spaceGrotesk font-black text-[9px] uppercase tracking-widest text-slate-600"
                      >{{ meal }}</span
                    >
                  </div>
                </td>

                <!-- Meal cells -->
                <td
                  v-for="(date, dayIdx) in weekDates"
                  :key="dayIdx + meal"
                  :class="[
                    'meal-cell border-r-2 border-slate-200 last:border-r-0 align-top relative',
                    mealIdx === MEALS.length - 1 ? 'border-b-0' : 'border-b-2 border-slate-200',
                    mealIdx === MEALS.length - 1 && dayIdx === weekDates.length - 1
                      ? 'rounded-br-2xl'
                      : '',
                  ]"
                >
                  <!-- Loading skeleton -->
                  <div
                    v-if="loading"
                    class="h-full min-h-[120px] p-3 flex flex-col gap-2 animate-pulse"
                  >
                    <div class="h-3 bg-slate-200 rounded w-3/4"></div>
                    <div class="h-3 bg-slate-200 rounded w-1/2"></div>
                    <div class="mt-auto flex gap-1">
                      <div class="h-4 w-12 bg-slate-200 rounded-full"></div>
                      <div class="h-4 w-10 bg-slate-200 rounded-full"></div>
                    </div>
                  </div>

                  <!-- Empty state -->
                  <div
                    v-else-if="!planGenerated || !getMeal(dayIdx, meal)?.name"
                    class="empty-cell h-full min-h-[120px] flex flex-col items-center justify-center gap-2 opacity-35"
                  >
                    <div class="w-5 h-5 rounded-full border-2 border-dashed border-slate-400"></div>
                  </div>

                  <!-- Filled state — click opens modal -->
                  <div
                    v-else
                    class="filled-cell h-full min-h-[120px] p-3 flex flex-col gap-2 hover:bg-emerald-50 transition-colors cursor-pointer"
                    @click="handleCellClick(dayIdx, meal)"
                  >
                    <p
                      class="font-spaceGrotesk font-bold text-slate-900 text-xs leading-snug line-clamp-3"
                    >
                      {{ getMeal(dayIdx, meal)?.name }}
                    </p>

                    <!-- Macros -->
                    <div class="flex flex-wrap gap-1 text-[9px] font-tomorrow font-bold">
                      <span
                        v-if="getMeal(dayIdx, meal)?.protein"
                        class="text-violet-700 bg-violet-100 border border-violet-300 px-1.5 py-0.5 rounded-full"
                        >{{ getMeal(dayIdx, meal)?.protein }}g P</span
                      >
                      <span
                        v-if="getMeal(dayIdx, meal)?.carbs"
                        class="text-sky-700 bg-sky-100 border border-sky-300 px-1.5 py-0.5 rounded-full"
                        >{{ getMeal(dayIdx, meal)?.carbs }}g C</span
                      >
                      <span
                        v-if="getMeal(dayIdx, meal)?.fat"
                        class="text-rose-700 bg-rose-100 border border-rose-300 px-1.5 py-0.5 rounded-full"
                        >{{ getMeal(dayIdx, meal)?.fat }}g F</span
                      >
                    </div>

                    <!-- Calories + prep -->
                    <div class="mt-auto flex flex-wrap gap-1">
                      <span
                        v-if="getMeal(dayIdx, meal)?.calories"
                        class="font-tomorrow text-[9px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-300 px-1.5 py-0.5 rounded-full"
                        >{{ getMeal(dayIdx, meal)?.calories }} kcal</span
                      >
                      <span
                        v-if="getMeal(dayIdx, meal)?.prepTimeMinutes"
                        class="font-tomorrow text-[9px] font-bold text-amber-700 bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded-full"
                        >{{ getMeal(dayIdx, meal)?.prepTimeMinutes }}min</span
                      >
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.drawer-enter-active,
.drawer-leave-active {
  transition:
    max-height 0.35s ease,
    opacity 0.25s ease;
  overflow: hidden;
  max-height: 600px;
}
.drawer-enter-from,
.drawer-leave-to {
  max-height: 0;
  opacity: 0;
}

.table-wrapper {
  border: 4px solid #0f172a;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 6px 6px 0px rgba(15, 23, 42, 0.12);
}

table {
  height: 100%;
  background: #eff9e5;
}

.row-label-header {
  background: #eff9e5;
}

.day-header {
  border-bottom: 4px solid #0f172a;
  border-right: 2px solid #0f172a;
}
.day-header:last-child {
  border-right: 0;
}

.today-header {
  outline: 3px solid #0f172a;
  outline-offset: -3px;
  position: relative;
}

.row-label {
  background: #eff9e5;
  width: 80px;
  min-width: 64px;
  border-right: 4px solid #0f172a;
}

.meal-cell {
  background: #eff9e5;
  vertical-align: top;
  transition: background 0.15s ease;
}

.meal-row:not(:last-child) td {
  border-bottom: 2px solid #e2e8f0;
}
.meal-row:last-child td {
  border-bottom: 0;
}
</style>

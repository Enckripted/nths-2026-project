<script setup lang="ts">
import IngredientList from '@/components/ingredients/IngredientList.vue'
import Prompting from '@/components/prompting.vue'
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import type { MealPlan } from '@/types/shared.types'

// ── Date utilities ────────────────────────────────────────────────────────
const today = new Date()
today.setHours(0, 0, 0, 0)

// Monday of the current ISO week
const dayOfWeek = today.getDay() // 0=Sun … 6=Sat
const monday = new Date(today)
monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))

// All 7 dates for this week (Mon–Sun)
const weekDates = Array.from({ length: 7 }, (_, i) => {
  const d = new Date(monday)
  d.setDate(monday.getDate() + i)
  return d
})

const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function formatDate(d: Date): string {
  return `${MONTH_SHORT[d.getMonth()]} ${d.getDate()}`
}

function isPast(d: Date): boolean {
  return d < today
}

function isToday(d: Date): boolean {
  return d.getTime() === today.getTime()
}

// Helper to satisfy TS since weekDates is a Date[] but indexing can theoretically be undefined
function getWeekDate(i: number): Date {
  return weekDates[i] as Date
}

// ── Static data ────────────────────────────────────────────────────────────
const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
const DAY_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const MEALS = ['Breakfast', 'Lunch', 'Dinner'] as const

const dayColors: Record<string, string> = {
  MON: 'bg-sky-300',
  TUE: 'bg-rose-300',
  WED: 'bg-emerald-300',
  THU: 'bg-amber-300',
  FRI: 'bg-violet-300',
  SAT: 'bg-pink-300',
  SUN: 'bg-teal-300',
}

// ── State ──────────────────────────────────────────────────────────────────
const mealData = ref<Record<string, Record<string, { name: string; calories?: number; prepTime?: number }>>>({})
const planGenerated = ref(false)
const showIngredients = ref(false)

function onPlanReady(plan: MealPlan | null): void {
  if (!plan?.weeklyPlan) return
  for (const dayObj of plan.weeklyPlan) {
    const key = dayObj.day?.toUpperCase()
    if (!key) continue
    mealData.value[key] = {
      Breakfast: { name: dayObj.breakfast?.name ?? '', calories: dayObj.breakfast?.calories, prepTime: dayObj.breakfast?.prepTimeMinutes },
      Lunch:     { name: dayObj.lunch?.name     ?? '', calories: dayObj.lunch?.calories,     prepTime: dayObj.lunch?.prepTimeMinutes },
      Dinner:    { name: dayObj.dinner?.name    ?? '', calories: dayObj.dinner?.calories,    prepTime: dayObj.dinner?.prepTimeMinutes },
    }
  }
  planGenerated.value = true
}

function onPlanError(message: string): void {
  console.error('Meal plan error:', message)
}

// Helper: get meal entry for a given day index + meal label
function getMeal(dayIdx: number, meal: string) {
  const key = DAY_FULL[dayIdx]?.toUpperCase()
  return key ? mealData.value[key]?.[meal] : undefined
}
</script>

<template>
  <div class="dashboard-page min-h-screen bg-[#eff9e5] flex flex-col">
    <!-- ══════════════════════════════════════════════════════
         WELCOME HEADER
    ══════════════════════════════════════════════════════ -->
    <div class="header-band bg-gradient-to-br from-emerald-600 via-teal-500 to-cyan-500 border-b-4 border-slate-900 relative overflow-hidden">
      <div class="absolute top-0 right-0 w-[350px] h-[350px] bg-rose-400 rounded-full mix-blend-screen blur-[80px] opacity-35 translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div class="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-300 rounded-full mix-blend-screen blur-[90px] opacity-30 -translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

      <div class="relative z-10 max-w-[1600px] mx-auto px-8 lg:px-14 py-10 flex flex-col md:flex-row items-start md:items-center gap-8">
        <!-- Left: icon + heading -->
        <div class="flex items-center gap-7 flex-1 min-w-0">
          <div
            class="w-24 h-24 lg:w-28 lg:h-28 shrink-0 bg-[#eff9e5]/25 border-4 border-slate-900 rounded-[20px] shadow-[6px_6px_0px_rgba(15,23,42,1)] flex items-center justify-center text-5xl"
          >
            🧊
          </div>
          <div>
            <h1
              class="font-spaceGrotesk font-black text-[#eff9e5] tracking-tighter leading-none uppercase drop-shadow-2xl text-[clamp(2.4rem,5vw,4.5rem)]"
            >
              Welcome to<br />your fridge
            </h1>
            <p class="font-tomorrow text-emerald-100 text-sm font-bold mt-2 opacity-90">
              Manage your ingredients &amp; let AI craft your perfect week.
            </p>
          </div>
        </div>

        <!-- Right: actions -->
        <div class="flex flex-wrap gap-3 items-center shrink-0">
          <button
            @click="showIngredients = !showIngredients"
            class="brutalist-btn bg-[#eff9e5]/90 hover:bg-[#eff9e5] text-slate-900 font-spaceGrotesk font-black uppercase tracking-wider text-sm px-5 py-2.5 rounded-xl transition-all"
          >
            {{ showIngredients ? '▲ Hide' : '▼ Ingredients' }}
          </button>

          <RouterLink
            to="/profile"
            class="brutalist-btn bg-white/20 hover:bg-white/40 text-[#eff9e5] font-spaceGrotesk font-black uppercase tracking-wider text-sm px-5 py-2.5 rounded-xl transition-all"
          >
            ✏️ Profile
          </RouterLink>

          <Prompting
            class="brutalist-btn bg-amber-300 hover:bg-amber-200 text-slate-900 rounded-xl font-spaceGrotesk font-black text-sm uppercase tracking-widest cursor-pointer py-2.5 px-6 focus:ring-4 focus:ring-amber-100"
            @success="onPlanReady"
            @error="onPlanError"
          />
        </div>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════
         INGREDIENTS DRAWER
    ══════════════════════════════════════════════════════ -->
    <Transition name="drawer">
      <div v-if="showIngredients" class="ingredients-drawer border-b-4 border-slate-900 bg-rose-50 px-8 lg:px-14 py-8">
        <div class="max-w-[1600px] mx-auto">
          <h2 class="font-spaceGrotesk font-black text-xl uppercase tracking-widest text-rose-900 mb-4 flex items-center gap-3">
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

      <!-- Section label bar -->
      <div
        class="section-label-bar bg-[#eff9e5] border-b-2 border-slate-900 px-8 lg:px-14 py-3 flex items-center gap-4"
      >
        <span
          class="font-spaceGrotesk font-black text-xs uppercase tracking-[0.18em] text-slate-500"
          >This Week</span
        >
        <div class="flex-1 h-px bg-slate-300"></div>
        <span class="font-tomorrow text-xs font-bold text-slate-400 uppercase tracking-widest">
          {{ planGenerated ? '7 days planned' : 'No plan yet — generate one above' }}
        </span>
      </div>

      <!-- ── Calendar Grid — padded + rounded wrapper ── -->
      <div class="calendar-grid flex-1 overflow-x-auto px-6 lg:px-10 py-6">
        <div class="table-wrapper">
          <table class="w-full h-full border-collapse min-w-[700px]" style="table-layout: fixed;">
            <thead>
              <tr>
                <!-- Row label column -->
                <th
                  class="row-label-header w-[80px] border-r-4 border-b-4 border-slate-900 bg-[#eff9e5] rounded-tl-2xl"
                ></th>

                <!-- Day headers -->
                <th
                  v-for="(day, i) in DAYS"
                  :key="day"
                  :class="[
                    'day-header border-r-2 border-b-4 border-slate-900 last:border-r-0',
                    dayColors[day],
                    isToday(getWeekDate(i)) ? 'today-header' : '',
                    i === DAYS.length - 1 ? 'rounded-tr-2xl' : ''
                  ]"
                >
                  <div class="py-2.5 px-2 flex flex-col items-center relative">
                    <!-- Past day: show checkmark overlay -->
                    <template v-if="isPast(getWeekDate(i))">
                      <span class="text-xl leading-none">✅</span>
                      <span class="font-spaceGrotesk font-black text-slate-900/60 uppercase text-sm tracking-tight leading-none mt-1 line-through decoration-2">{{ day }}</span>
                      <span class="font-tomorrow text-[10px] text-slate-600/70 font-bold tracking-wide mt-0.5">{{ formatDate(getWeekDate(i)) }}</span>
                    </template>

                    <!-- Today: highlighted -->
                    <template v-else-if="isToday(getWeekDate(i))">
                      <span
                        class="font-spaceGrotesk font-black text-slate-900 uppercase text-base tracking-tight leading-none"
                        >{{ day }}</span
                      >
                      <span
                        class="font-tomorrow text-[10px] text-[#eff9e5] font-bold tracking-wide mt-0.5 bg-slate-900 px-2 py-0.5 rounded-full"
                        >TODAY</span
                      >
                    </template>

                    <!-- Future day -->
                    <template v-else>
                      <span class="font-spaceGrotesk font-black text-slate-900 uppercase text-base tracking-tight leading-none">{{ day }}</span>
                      <span class="font-tomorrow text-[10px] text-slate-700 font-bold tracking-wide mt-0.5">{{ formatDate(getWeekDate(i)) }}</span>
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
                    mealIdx === MEALS.length - 1 ? 'rounded-bl-2xl border-b-0' : 'border-b-2 border-slate-200'
                  ]"
                >
                  <div class="py-4 flex flex-col items-center justify-center gap-1">
                    <span class="text-xl">{{ mealIdx === 0 ? '🌅' : mealIdx === 1 ? '☀️' : '🌙' }}</span>
                    <span class="font-spaceGrotesk font-black text-[9px] uppercase tracking-widest text-slate-600">{{ meal }}</span>
                  </div>
                </td>

                <!-- Meal cells -->
                <td
                  v-for="(day, dayIdx) in DAYS"
                  :key="day + meal"
                  :class="[
                    'meal-cell border-r-2 border-slate-200 last:border-r-0 align-top relative',
                    mealIdx === MEALS.length - 1 ? 'border-b-0' : 'border-b-2 border-slate-200',
                    mealIdx === MEALS.length - 1 && dayIdx === DAYS.length - 1 ? 'rounded-br-2xl' : '',
                    isPast(getWeekDate(dayIdx)) ? 'past-day-cell' : ''
                  ]"
                >
                  <!-- Past day overlay -->
                  <div
                    v-if="isPast(getWeekDate(dayIdx))"
                    class="past-overlay absolute inset-0 bg-slate-100/70 backdrop-blur-[1px] z-10 flex items-center justify-center"
                  ></div>

                  <!-- Empty state -->
                  <div
                    v-if="!planGenerated || !getMeal(dayIdx, meal)?.name"
                    class="empty-cell h-full min-h-[120px] flex flex-col items-center justify-center gap-2"
                    :class="isPast(getWeekDate(dayIdx)) ? 'opacity-20' : 'opacity-35'"
                  >
                    <div class="w-5 h-5 rounded-full border-2 border-dashed border-slate-400"></div>
                  </div>

                  <!-- Filled state -->
                  <div
                    v-else
                    class="filled-cell h-full min-h-[120px] p-3 flex flex-col gap-2 group hover:bg-emerald-50 transition-colors cursor-pointer relative z-0"
                    :class="isPast(getWeekDate(dayIdx)) ? 'opacity-50' : ''"
                  >
                    <p class="font-spaceGrotesk font-bold text-slate-900 text-xs leading-snug line-clamp-3">
                      {{ getMeal(dayIdx, meal)?.name }}
                    </p>
                    <div class="mt-auto flex flex-wrap gap-1">
                      <span
                        v-if="getMeal(dayIdx, meal)?.calories"
                        class="font-tomorrow text-[9px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-300 px-1.5 py-0.5 rounded-full"
                      >
                        {{ getMeal(dayIdx, meal)?.calories }} kcal
                      </span>
                      <span
                        v-if="getMeal(dayIdx, meal)?.prepTime"
                        class="font-tomorrow text-[9px] font-bold text-amber-700 bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded-full"
                      >
                        {{ getMeal(dayIdx, meal)?.prepTime }}min
                      </span>
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
/* ── Ingredients drawer ───────────────────────────────────────────────────── */
.drawer-enter-active,
.drawer-leave-active {
  transition: max-height 0.35s ease, opacity 0.25s ease;
  overflow: hidden;
  max-height: 600px;
}
.drawer-enter-from,
.drawer-leave-to {
  max-height: 0;
  opacity: 0;
}

/* ── Table wrapper with rounded corners + outer border ───────────────────── */
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

/* ── Column headers ──────────────────────────────────────────────────────── */
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

/* ── Row label ────────────────────────────────────────────────────────────── */
.row-label {
  background: #eff9e5;
  width: 80px;
  min-width: 64px;
  border-right: 4px solid #0f172a;
}

/* ── Meal cells ───────────────────────────────────────────────────────────── */
.meal-cell {
  background: #eff9e5;
  vertical-align: top;
  transition: background 0.15s ease;
}

.past-day-cell {
  background: #f8fafc;
}

.past-overlay {
  pointer-events: none;
}

/* Row separators */
.meal-row:not(:last-child) td {
  border-bottom: 2px solid #e2e8f0;
}
.meal-row:last-child td {
  border-bottom: 0;
}
</style>

<script setup lang="ts">
import { computed, ref, toRaw } from 'vue'
import useUserProfile from '@/composables/useUserProfile'
import StringList from '@/components/StringList.vue'
import useDataStore from '@/composables/useDataStore'
import router from '@/router'

const { profile } = useUserProfile()
const { saveProfileData } = useDataStore()

// Temp clone so changes don't apply until saved
const tempProfile = ref(structuredClone(toRaw(profile.value)))

// ── Computed bindings ──────────────────────────────────────────────────────
const gender = computed({
  get: () => tempProfile.value.gender,
  set: (value) => (tempProfile.value.gender = value),
})
const weightLbs = computed({
  get: () => tempProfile.value.weightLbs,
  set: (value) => (tempProfile.value.weightLbs = value),
})
const heightFt = computed({
  get: () => tempProfile.value.heightFt,
  set: (value) => (tempProfile.value.heightFt = value),
})
const heightIn = computed({
  get: () => tempProfile.value.heightIn,
  set: (value) => (tempProfile.value.heightIn = value),
})
const age = computed({
  get: () => tempProfile.value.age,
  set: (value) => (tempProfile.value.age = value),
})
const desiredWeightDirection = computed({
  get: () => tempProfile.value.desiredWeightDirection,
  set: (value) => (tempProfile.value.desiredWeightDirection = value),
})
const activityLevel = computed({
  get: () => tempProfile.value.activityLevel,
  set: (value) => (tempProfile.value.activityLevel = value),
})
const minutesForCooking = computed({
  get: () => tempProfile.value.minutesForCooking,
  set: (value) => (tempProfile.value.minutesForCooking = value),
})
const cuisineFavorites = computed({
  get: () => tempProfile.value.cuisineFavorites,
  set: (value) => (tempProfile.value.cuisineFavorites = value),
})
const strongDislikes = computed({
  get: () => tempProfile.value.strongDislikes,
  set: (value) => (tempProfile.value.strongDislikes = value),
})
const allergies = computed({
  get: () => tempProfile.value.allergies,
  set: (value) => (tempProfile.value.allergies = value),
})

// ── Step management ────────────────────────────────────────────────────────
const currentStep = ref(1)
const TOTAL_STEPS = 3
const stepErrors = ref<string[]>([])

const progressWidth = computed(() => `${((currentStep.value - 1) / (TOTAL_STEPS - 1)) * 100}%`)

// ── Validation ────────────────────────────────────────────────────────────
function clampWeight(e: Event) {
  const v = Number((e.target as HTMLInputElement).value)
  if (!isNaN(v)) weightLbs.value = Math.min(700, Math.max(50, Math.round(v)))
}
function clampHeightFt(e: Event) {
  const v = Number((e.target as HTMLInputElement).value)
  if (!isNaN(v)) heightFt.value = Math.min(8, Math.max(3, Math.round(v)))
}
function clampHeightIn(e: Event) {
  const v = Number((e.target as HTMLInputElement).value)
  if (!isNaN(v)) heightIn.value = Math.min(11, Math.max(0, Math.round(v)))
}
function clampAge(e: Event) {
  const v = Number((e.target as HTMLInputElement).value)
  if (!isNaN(v)) age.value = Math.min(100, Math.max(13, Math.round(v)))
}

function validateStep1(): string[] {
  const errs: string[] = []
  if (!gender.value) errs.push('Please select a gender.')
  if (!weightLbs.value || weightLbs.value < 50 || weightLbs.value > 700)
    errs.push('Weight must be between 50 and 700 lbs.')
  if (!heightFt.value || heightFt.value < 3 || heightFt.value > 8)
    errs.push('Height (feet) must be between 3 and 8.')
  if (heightIn.value < 0 || heightIn.value > 11)
    errs.push('Height (inches) must be between 0 and 11.')
  if (!age.value || age.value < 13 || age.value > 100)
    errs.push('Age must be between 13 and 100.')
  if (!desiredWeightDirection.value) errs.push('Please select a fitness goal.')
  if (!activityLevel.value) errs.push('Please select an activity level.')
  return errs
}

function validateStep2(): string[] {
  const errs: string[] = []
  if (!minutesForCooking.value) errs.push('Please select a max cooking time.')
  return errs
}

function nextStep() {
  stepErrors.value = []
  if (currentStep.value === 1) {
    const errs = validateStep1()
    if (errs.length) { stepErrors.value = errs; return }
  }
  if (currentStep.value === 2) {
    const errs = validateStep2()
    if (errs.length) { stepErrors.value = errs; return }
  }
  if (currentStep.value < TOTAL_STEPS) currentStep.value++
}
function prevStep() {
  stepErrors.value = []
  if (currentStep.value > 1) currentStep.value--
}

// ── Option data ────────────────────────────────────────────────────────────
const genderOptions = [
  { value: 'male', label: 'Male', emoji: '♂️' },
  { value: 'female', label: 'Female', emoji: '♀️' },
  { value: 'other', label: 'Other', emoji: '⚧️' },
]

const goalOptions = [
  { value: 'cut', label: 'Cut', sub: 'Lose fat', emoji: '🔥', color: 'rose' },
  { value: 'maintain', label: 'Maintain', sub: 'Stay balanced', emoji: '⚖️', color: 'sky' },
  { value: 'bulk', label: 'Bulk', sub: 'Gain muscle', emoji: '💪', color: 'emerald' },
]

const activityOptions = [
  { value: 'sedentary', label: 'Sedentary', sub: 'Desk job, minimal movement' },
  { value: 'light', label: 'Light', sub: 'Light exercise 1–3 days/week' },
  { value: 'moderate', label: 'Moderate', sub: 'Exercise 3–5 days/week' },
  { value: 'active', label: 'Active', sub: 'Hard exercise 6–7 days/week' },
  { value: 'very_active', label: 'Very Active', sub: 'Physical job + daily training' },
]

const cookingTimeOptions = [
  { value: 15, label: '15 min', sub: 'Lightning fast' },
  { value: 30, label: '30 min', sub: 'Quick & easy' },
  { value: 45, label: '45 min', sub: 'Balanced' },
  { value: 60, label: '60 min', sub: 'I enjoy cooking' },
]

// ── Save ──────────────────────────────────────────────────────────────────
const saveProfile = () => {
  profile.value = tempProfile.value
  saveProfileData()
  router.push('/profile')
}
</script>


<template>
  <div class="survey-page min-h-screen bg-stone-50 relative overflow-hidden flex flex-col items-center justify-center">
    <!-- Background glows -->
    <div class="absolute top-[-15%] right-[-10%] w-[500px] h-[500px] bg-emerald-300 rounded-full mix-blend-multiply blur-[120px] opacity-50 pointer-events-none"></div>
    <div class="absolute bottom-[-10%] left-[-10%] w-[450px] h-[450px] bg-amber-200 rounded-full mix-blend-multiply blur-[100px] opacity-40 pointer-events-none"></div>

    <div class="w-full max-w-2xl mx-auto px-6 py-12">

      <!-- ── Top Label ───────────────────────────────────────────────── -->
      <div class="mb-8 flex items-center justify-between">
        <span class="font-spaceGrotesk font-black text-sm uppercase tracking-widest text-slate-400">
          EASEY PREP CO.
        </span>
        <span class="font-tomorrow text-sm font-bold text-slate-400 uppercase tracking-widest">
          Step {{ currentStep }} of {{ TOTAL_STEPS }}
        </span>
      </div>

      <!-- ── Progress Bar ───────────────────────────────────────────────── -->
      <div class="w-full h-2 bg-slate-200 rounded-full mb-10 border border-slate-300 overflow-hidden">
        <div
          class="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full transition-all duration-500 ease-out"
          :style="{ width: progressWidth }"
        ></div>
      </div>

      <!-- ── Step Panels with fade transition ─────────────────────────── -->
      <Transition name="fade" mode="out-in">

        <!-- ══════════════════════════════════════════════
             STEP 1 — About You
        ══════════════════════════════════════════════ -->
        <div v-if="currentStep === 1" key="step1" class="survey-card">
          <div class="step-header">
            <span class="step-number">01</span>
            <h2 class="step-title">About You</h2>
            <p class="step-sub">Let's start with some basics so we can calibrate your nutrition targets.</p>
          </div>

          <!-- Gender -->
          <div class="field-group">
            <label class="field-label">How do you identify?</label>
            <div class="grid grid-cols-3 gap-3">
              <button
                v-for="opt in genderOptions"
                :key="opt.value"
                type="button"
                @click="gender = opt.value"
                :class="[
                  'option-card',
                  gender === opt.value ? 'option-card--active' : ''
                ]"
              >
                <span class="text-2xl">{{ opt.emoji }}</span>
                <span class="font-spaceGrotesk font-bold text-sm uppercase tracking-wide mt-1">{{ opt.label }}</span>
              </button>
            </div>
          </div>

          <!-- Weight -->
          <div class="field-group">
            <label class="field-label">Weight (lbs)</label>
            <div class="relative">
              <input
                v-model.number="weightLbs"
                type="number"
                min="50"
                max="700"
                step="1"
                id="weight-lbs"
                class="survey-input pr-16"
                placeholder="e.g. 175"
                @change="clampWeight"
              />
              <span class="input-unit">lbs</span>
            </div>
          </div>

          <!-- Height -->
          <div class="field-group">
            <label class="field-label">Height</label>
            <div class="flex gap-3">
              <div class="relative flex-1">
                <input
                  v-model.number="heightFt"
                  type="number"
                  min="3"
                  max="8"
                  step="1"
                  id="height-ft"
                  class="survey-input pr-12"
                  placeholder="5"
                  @change="clampHeightFt"
                />
                <span class="input-unit">ft</span>
              </div>
              <div class="relative flex-1">
                <input
                  v-model.number="heightIn"
                  type="number"
                  min="0"
                  max="11"
                  step="1"
                  id="height-in"
                  class="survey-input pr-12"
                  placeholder="10"
                  @change="clampHeightIn"
                />
                <span class="input-unit">in</span>
              </div>
            </div>
          </div>

          <!-- Age -->
          <div class="field-group">
            <label class="field-label">Age</label>
            <div class="relative">
              <input
                v-model.number="age"
                type="number"
                min="13"
                max="100"
                step="1"
                id="age"
                class="survey-input pr-16"
                placeholder="e.g. 25"
                @change="clampAge"
              />
              <span class="input-unit">years</span>
            </div>
          </div>

          <!-- Goal -->
          <div class="field-group">
            <label class="field-label">What's your goal?</label>
            <div class="grid grid-cols-3 gap-3">
              <button
                v-for="opt in goalOptions"
                :key="opt.value"
                type="button"
                @click="desiredWeightDirection = opt.value"
                :class="[
                  'option-card',
                  desiredWeightDirection === opt.value ? 'option-card--active' : ''
                ]"
              >
                <span class="text-2xl">{{ opt.emoji }}</span>
                <span class="font-spaceGrotesk font-bold text-sm uppercase tracking-wide mt-1">{{ opt.label }}</span>
                <span class="font-tomorrow text-xs text-slate-500 mt-0.5">{{ opt.sub }}</span>
              </button>
            </div>
          </div>

          <!-- Activity Level -->
          <div class="field-group">
            <label class="field-label">Activity level</label>
            <div class="flex flex-col gap-2">
              <button
                v-for="opt in activityOptions"
                :key="opt.value"
                type="button"
                @click="activityLevel = opt.value"
                :class="[
                  'activity-option',
                  activityLevel === opt.value ? 'activity-option--active' : ''
                ]"
              >
                <span class="font-spaceGrotesk font-bold text-sm uppercase tracking-wide">{{ opt.label }}</span>
                <span class="font-tomorrow text-xs text-slate-500 ml-auto">{{ opt.sub }}</span>
              </button>
            </div>
          </div>

          <!-- Validation errors -->
          <div v-if="stepErrors.length" class="error-banner">
            <span class="error-icon">⚠️</span>
            <ul class="error-list">
              <li v-for="err in stepErrors" :key="err">{{ err }}</li>
            </ul>
          </div>

          <div class="step-nav">
            <div></div>
            <button type="button" class="nav-btn nav-btn--next" @click="nextStep">
              Next <span class="ml-1">→</span>
            </button>
          </div>
        </div>

        <!-- ══════════════════════════════════════════════
             STEP 2 — Your Kitchen
        ══════════════════════════════════════════════ -->
        <div v-else-if="currentStep === 2" key="step2" class="survey-card">
          <div class="step-header">
            <span class="step-number">02</span>
            <h2 class="step-title">Your Kitchen</h2>
            <p class="step-sub">Tell us how you like to cook so we can build a realistic schedule.</p>
          </div>

          <!-- Cooking time -->
          <div class="field-group">
            <label class="field-label">Max cooking time per meal</label>
            <div class="grid grid-cols-4 gap-3">
              <button
                v-for="opt in cookingTimeOptions"
                :key="opt.value"
                type="button"
                @click="minutesForCooking = opt.value"
                :class="[
                  'option-card',
                  minutesForCooking === opt.value ? 'option-card--active' : ''
                ]"
              >
                <span class="font-spaceGrotesk font-black text-lg">{{ opt.label }}</span>
                <span class="font-tomorrow text-xs text-slate-500 mt-0.5">{{ opt.sub }}</span>
              </button>
            </div>
          </div>

          <!-- Cuisine Favorites -->
          <div class="field-group">
            <label class="field-label">Favorite cuisines</label>
            <p class="field-hint">Type a cuisine and press Enter to add it.</p>
            <div class="string-list-wrapper">
              <StringList
                v-model="cuisineFavorites"
                label=""
                placeholder="e.g. Italian, Japanese…"
              />
            </div>
          </div>

          <!-- Validation errors -->
          <div v-if="stepErrors.length" class="error-banner">
            <span class="error-icon">⚠️</span>
            <ul class="error-list">
              <li v-for="err in stepErrors" :key="err">{{ err }}</li>
            </ul>
          </div>

          <div class="step-nav">
            <button type="button" class="nav-btn nav-btn--back" @click="prevStep">
              <span class="mr-1">←</span> Back
            </button>
            <button type="button" class="nav-btn nav-btn--next" @click="nextStep">
              Next <span class="ml-1">→</span>
            </button>
          </div>
        </div>

        <!-- ══════════════════════════════════════════════
             STEP 3 — Dietary Needs
        ══════════════════════════════════════════════ -->
        <div v-else-if="currentStep === 3" key="step3" class="survey-card">
          <div class="step-header">
            <span class="step-number">03</span>
            <h2 class="step-title">Dietary Needs</h2>
            <p class="step-sub">Help us keep your meals safe and enjoyable by flagging any restrictions.</p>
          </div>

          <!-- Allergies -->
          <div class="field-group">
            <label class="field-label">Allergies</label>
            <p class="field-hint">These ingredients will <strong>never</strong> appear in your plan.</p>
            <div class="string-list-wrapper string-list-wrapper--danger">
              <StringList
                v-model="allergies"
                label=""
                placeholder="e.g. Peanuts, Tree nuts…"
              />
            </div>
          </div>

          <!-- Strong Dislikes -->
          <div class="field-group">
            <label class="field-label">Strong dislikes</label>
            <p class="field-hint">We'll minimize these but may include them when necessary.</p>
            <div class="string-list-wrapper string-list-wrapper--amber">
              <StringList
                v-model="strongDislikes"
                label=""
                placeholder="e.g. Cilantro, Mushrooms…"
              />
            </div>
          </div>

          <div class="step-nav">
            <button type="button" class="nav-btn nav-btn--back" @click="prevStep">
              <span class="mr-1">←</span> Back
            </button>
            <button type="button" class="nav-btn nav-btn--finish" @click="saveProfile">
              Let's Go 🚀
            </button>
          </div>
        </div>

      </Transition>
    </div>
  </div>
</template>

<style scoped>
/* ── Fade transition ─────────────────────────────────────────────────────── */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* ── Card ─────────────────────────────────────────────────────────────────── */
.survey-card {
  background: #ffffff;
  border: 2px solid #0f172a;
  border-radius: 28px;
  box-shadow: 8px 8px 0px rgba(15, 23, 42, 1);
  padding: 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* ── Step header ──────────────────────────────────────────────────────────── */
.step-header {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.step-number {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 900;
  font-size: 4rem;
  line-height: 1;
  color: #d1fae5; /* emerald-100 */
  -webkit-text-stroke: 2px #064e3b;
  letter-spacing: -0.04em;
}
.step-title {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 900;
  font-size: 2.25rem;
  color: #0f172a;
  letter-spacing: -0.04em;
  line-height: 1;
  text-transform: uppercase;
  margin-top: -0.5rem;
}
.step-sub {
  font-family: 'Tomorrow', sans-serif;
  color: #64748b;
  font-size: 0.95rem;
  margin-top: 0.5rem;
}

/* ── Field groups ─────────────────────────────────────────────────────────── */
.field-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.field-label {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #0f172a;
}
.field-hint {
  font-family: 'Tomorrow', sans-serif;
  font-size: 0.8rem;
  color: #94a3b8;
  margin-top: -0.25rem;
}

/* ── Text inputs ─────────────────────────────────────────────────────────── */
.survey-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #0f172a;
  border-radius: 14px;
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  font-size: 1.125rem;
  color: #0f172a;
  background: #fafaf9;
  outline: none;
  box-shadow: 3px 3px 0px rgba(15, 23, 42, 1);
  transition: box-shadow 0.15s ease, border-color 0.15s ease;
}
.survey-input:focus {
  border-color: #10b981;
  box-shadow: 3px 3px 0px #10b981;
}
.input-unit {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  font-family: 'Tomorrow', sans-serif;
  font-weight: 700;
  font-size: 0.875rem;
  color: #94a3b8;
  pointer-events: none;
}

/* ── Option cards ─────────────────────────────────────────────────────────── */
.option-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem 0.5rem;
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  background: #fafaf9;
  cursor: pointer;
  transition: border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease, transform 0.1s ease;
  box-shadow: 2px 2px 0px #e2e8f0;
  min-height: 80px;
}
.option-card:hover {
  border-color: #10b981;
  transform: translateY(-2px);
  box-shadow: 3px 4px 0px rgba(16, 185, 129, 0.4);
}
.option-card--active {
  border-color: #0f172a;
  background: #d1fae5;
  box-shadow: 3px 3px 0px #0f172a;
}

/* ── Activity row options ─────────────────────────────────────────────────── */
.activity-option {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: #fafaf9;
  cursor: pointer;
  text-align: left;
  transition: border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
  box-shadow: 2px 2px 0px #e2e8f0;
}
.activity-option:hover {
  border-color: #10b981;
  box-shadow: 2px 2px 0px rgba(16, 185, 129, 0.4);
}
.activity-option--active {
  border-color: #0f172a;
  background: #d1fae5;
  box-shadow: 3px 3px 0px #0f172a;
}

/* ── StringList wrapper overrides ─────────────────────────────────────────── */
.string-list-wrapper :deep(.space-y-2) {
  gap: 0;
}
.string-list-wrapper :deep(label) {
  display: none;
}
.string-list-wrapper :deep(div:has(input)) {
  border: 2px solid #0f172a;
  border-radius: 14px;
  background: #fafaf9;
  box-shadow: 3px 3px 0px rgba(15, 23, 42, 1);
  padding: 0.75rem 1rem;
  min-height: 52px;
}
.string-list-wrapper :deep(span.inline-flex) {
  background: #d1fae5;
  color: #064e3b;
  border: 1px solid #0f172a;
  border-radius: 9999px;
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  font-size: 0.8rem;
}
.string-list-wrapper--danger :deep(div:has(input)) {
  border-color: #9f1239;
  box-shadow: 3px 3px 0px #9f1239;
}
.string-list-wrapper--danger :deep(span.inline-flex) {
  background: #ffe4e6;
  color: #9f1239;
  border-color: #9f1239;
}
.string-list-wrapper--amber :deep(div:has(input)) {
  border-color: #92400e;
  box-shadow: 3px 3px 0px #92400e;
}
.string-list-wrapper--amber :deep(span.inline-flex) {
  background: #fef3c7;
  color: #92400e;
  border-color: #92400e;
}

/* ── Step nav buttons ─────────────────────────────────────────────────────── */
.step-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.5rem;
  border-top: 2px dashed #e2e8f0;
}
.nav-btn {
  display: inline-flex;
  align-items: center;
  padding: 0.75rem 2rem;
  border-radius: 14px;
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 900;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  cursor: pointer;
  border: 2px solid #0f172a;
  transition: transform 0.1s ease, box-shadow 0.1s ease;
  box-shadow: 4px 4px 0px rgba(15, 23, 42, 1);
}
.nav-btn:hover {
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0px rgba(15, 23, 42, 1);
}
.nav-btn:active {
  transform: translate(2px, 2px);
  box-shadow: 2px 2px 0px rgba(15, 23, 42, 1);
}
.nav-btn--back {
  background: #fafaf9;
  color: #64748b;
}
.nav-btn--next {
  background: #10b981;
  color: #0f172a;
}
.nav-btn--finish {
  background: #0f172a;
  color: #d1fae5;
}

/* ── Validation error banner ──────────────────────────────────────────────── */
.error-banner {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  background: #fff1f2;
  border: 2px solid #be123c;
  border-radius: 14px;
  padding: 0.85rem 1.1rem;
  box-shadow: 3px 3px 0px #be123c;
}
.error-icon {
  font-size: 1.1rem;
  flex-shrink: 0;
  margin-top: 0.05rem;
}
.error-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.error-list li {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  font-size: 0.82rem;
  color: #9f1239;
}
</style>

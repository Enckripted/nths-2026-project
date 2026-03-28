<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import useAuth from '@/composables/useAuth'
import useUserProfile from '@/composables/useUserProfile'
import useDataStore from '@/composables/useDataStore'
import { supabase } from '@/lib/supabaseClient'
import router from '@/router'

const { user, logout } = useAuth()
const { profile } = useUserProfile()
// Trigger Supabase hydration on mount
useDataStore()

const isLoading = ref(true)
const supabaseStatus = ref<'loading' | 'success' | 'error' | 'no-data'>('loading')
const supabaseRaw = ref<unknown>(null)

onMounted(async () => {
  try {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) {
      supabaseStatus.value = 'error'
      isLoading.value = false
      return
    }

    const { data, error } = await supabase
      .from('data')
      .select('profile, ingredients, updated_at')
      .eq('id', authUser.id)
      .single()

    if (error) {
      supabaseStatus.value = 'no-data'
    } else {
      supabaseRaw.value = data
      supabaseStatus.value = 'success'
      // Hydrate profile from Supabase result
      if (data?.profile) {
        profile.value = data.profile
      }
    }
  } catch (e) {
    supabaseStatus.value = 'error'
    console.error(e)
  } finally {
    isLoading.value = false
  }
})

// ── Computed display helpers ──────────────────────────────────────
const heightDisplay = computed(() => {
  const ft = profile.value.heightFt
  const inch = profile.value.heightIn
  if (!ft && !inch) return '—'
  return `${ft}′ ${inch}″`
})

const weightDisplay = computed(() => {
  if (!profile.value.weightLbs) return '—'
  return `${profile.value.weightLbs} lbs`
})

const goalDisplay = computed(() => {
  const map: Record<string, { label: string; emoji: string; color: string }> = {
    cut:      { label: 'Cut – Lose fat',      emoji: '🔥', color: 'rose' },
    maintain: { label: 'Maintain – Stay balanced', emoji: '⚖️', color: 'sky' },
    bulk:     { label: 'Bulk – Gain muscle',  emoji: '💪', color: 'emerald' },
  }
  return map[profile.value.desiredWeightDirection] ?? { label: '—', emoji: '❓', color: 'slate' }
})

const activityDisplay = computed(() => {
  const map: Record<string, string> = {
    sedentary:  'Sedentary',
    light:      'Light',
    moderate:   'Moderate',
    active:     'Active',
    very_active:'Very Active',
  }
  return map[profile.value.activityLevel] ?? profile.value.activityLevel ?? '—'
})

const genderDisplay = computed(() => {
  const map: Record<string, string> = {
    male:   '♂️ Male',
    female: '♀️ Female',
    other:  '⚧️ Other',
  }
  return map[profile.value.gender] ?? '—'
})

const profileIsEmpty = computed(() => {
  return !profile.value.gender && !profile.value.weightLbs && !profile.value.age
})
</script>

<template>
  <div class="profile-page">
    <!-- Background glows -->
    <div class="glow glow-top"></div>
    <div class="glow glow-bottom"></div>

    <div class="profile-container">

      <!-- ── Header ───────────────────────────────────────────── -->
      <div class="profile-header">
        <div class="avatar-ring">
          <span class="avatar-emoji">👤</span>
        </div>
        <div class="header-text">
          <h1 class="page-title">My Profile</h1>
          <p class="user-email">{{ user?.email ?? 'Not signed in' }}</p>
        </div>
        <div class="header-actions">
        <button class="edit-btn" @click="router.push('/survey')">
          ✏️ Edit Profile
        </button>
        <button class="logout-btn" @click="logout">
          🚪 Logout
        </button>
        </div>
      </div>

      <!-- ── Supabase status badge ─────────────────────────────── -->
      <div v-if="!isLoading" :class="['status-badge', `status-badge--${supabaseStatus}`]">
        <span v-if="supabaseStatus === 'success'">✅ Data loaded from Supabase</span>
        <span v-else-if="supabaseStatus === 'no-data'">⚠️ No Supabase record yet – complete the survey to save data</span>
        <span v-else-if="supabaseStatus === 'error'">❌ Could not reach Supabase</span>
        <span v-else>⏳ Connecting to Supabase…</span>
      </div>

      <!-- ── Loading skeleton ──────────────────────────────────── -->
      <div v-if="isLoading" class="skeleton-grid">
        <div v-for="i in 6" :key="i" class="skeleton-card"></div>
      </div>

      <!-- ── Empty state ──────────────────────────────────────── -->
      <div v-else-if="profileIsEmpty && supabaseStatus !== 'loading'" class="empty-state">
        <span class="empty-emoji">🥗</span>
        <h2 class="empty-title">No profile data yet</h2>
        <p class="empty-sub">Complete the quick setup survey and we'll craft a personalised meal plan just for you.</p>
        <button class="edit-btn edit-btn--large" @click="router.push('/survey')">
          🚀 Complete Survey
        </button>
      </div>

      <!-- ── Profile grid ──────────────────────────────────────── -->
      <template v-else-if="!isLoading">
        <div class="section-label">Personal Stats</div>
        <div class="stat-grid">

          <div class="stat-card">
            <span class="stat-icon">🪶</span>
            <div class="stat-body">
              <span class="stat-key">Gender</span>
              <span class="stat-val">{{ genderDisplay }}</span>
            </div>
          </div>

          <div class="stat-card">
            <span class="stat-icon">⚖️</span>
            <div class="stat-body">
              <span class="stat-key">Weight</span>
              <span class="stat-val">{{ weightDisplay }}</span>
            </div>
          </div>

          <div class="stat-card">
            <span class="stat-icon">📏</span>
            <div class="stat-body">
              <span class="stat-key">Height</span>
              <span class="stat-val">{{ heightDisplay }}</span>
            </div>
          </div>

          <div class="stat-card">
            <span class="stat-icon">🎂</span>
            <div class="stat-body">
              <span class="stat-key">Age</span>
              <span class="stat-val">{{ profile.age ? `${profile.age} yrs` : '—' }}</span>
            </div>
          </div>

          <div class="stat-card stat-card--wide">
            <span class="stat-icon">{{ goalDisplay.emoji }}</span>
            <div class="stat-body">
              <span class="stat-key">Fitness Goal</span>
              <span class="stat-val">{{ goalDisplay.label }}</span>
            </div>
          </div>

          <div class="stat-card stat-card--wide">
            <span class="stat-icon">🏃</span>
            <div class="stat-body">
              <span class="stat-key">Activity Level</span>
              <span class="stat-val">{{ activityDisplay }}</span>
            </div>
          </div>

          <div class="stat-card stat-card--wide">
            <span class="stat-icon">⏱️</span>
            <div class="stat-body">
              <span class="stat-key">Max Cook Time</span>
              <span class="stat-val">{{ profile.minutesForCooking ? `${profile.minutesForCooking} min` : '—' }}</span>
            </div>
          </div>

        </div>

        <!-- ── Tags sections ─────────────────────────────────── -->
        <div v-if="profile.cuisineFavorites?.length" class="tag-section">
          <div class="section-label">Favourite Cuisines</div>
          <div class="tag-row">
            <span v-for="c in profile.cuisineFavorites" :key="c" class="tag tag--green">{{ c }}</span>
          </div>
        </div>

        <div v-if="profile.allergies?.length" class="tag-section">
          <div class="section-label">Allergies</div>
          <div class="tag-row">
            <span v-for="a in profile.allergies" :key="a" class="tag tag--red">{{ a }}</span>
          </div>
        </div>

        <div v-if="profile.strongDislikes?.length" class="tag-section">
          <div class="section-label">Strong Dislikes</div>
          <div class="tag-row">
            <span v-for="d in profile.strongDislikes" :key="d" class="tag tag--amber">{{ d }}</span>
          </div>
        </div>

        <!-- ── Raw Supabase debug panel ───────────────────────── -->
        <details class="debug-panel">
          <summary class="debug-summary">🔍 Raw Supabase response (debug)</summary>
          <pre class="debug-pre">{{ JSON.stringify(supabaseRaw, null, 2) }}</pre>
        </details>
      </template>

    </div>
  </div>
</template>

<style scoped>
/* ── Layout ───────────────────────────────────────────────────────── */
.profile-page {
  min-height: 100vh;
  background: #f8faf5;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2.5rem 1.5rem 4rem;
}

.glow {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  filter: blur(100px);
}
.glow-top {
  top: -10%;
  right: -5%;
  width: 420px;
  height: 420px;
  background: #6ee7b7;
  opacity: 0.35;
  mix-blend-mode: multiply;
}
.glow-bottom {
  bottom: -8%;
  left: -8%;
  width: 380px;
  height: 380px;
  background: #fde68a;
  opacity: 0.3;
  mix-blend-mode: multiply;
}

.profile-container {
  width: 100%;
  max-width: 680px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: relative;
  z-index: 1;
}

/* ── Header ──────────────────────────────────────────────────────── */
.profile-header {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  background: #ffffff;
  border: 2px solid #0f172a;
  border-radius: 24px;
  padding: 1.5rem 2rem;
  box-shadow: 6px 6px 0px #0f172a;
  flex-wrap: wrap;
}

.avatar-ring {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #d1fae5;
  border: 2px solid #0f172a;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 1.75rem;
}

.header-text {
  flex: 1;
  min-width: 0;
}

.page-title {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 900;
  font-size: 1.75rem;
  letter-spacing: -0.04em;
  color: #0f172a;
  text-transform: uppercase;
  line-height: 1;
  margin: 0;
}

.user-email {
  font-family: 'Tomorrow', sans-serif;
  font-size: 0.85rem;
  color: #64748b;
  margin-top: 0.25rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ── Buttons ──────────────────────────────────────────────────────── */
.edit-btn {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 900;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  padding: 0.6rem 1.25rem;
  border: 2px solid #0f172a;
  border-radius: 12px;
  background: #10b981;
  color: #0f172a;
  cursor: pointer;
  box-shadow: 3px 3px 0px #0f172a;
  transition: transform 0.1s ease, box-shadow 0.1s ease;
  white-space: nowrap;
}
.edit-btn:hover {
  transform: translate(-2px, -2px);
  box-shadow: 5px 5px 0px #0f172a;
}
.edit-btn:active {
  transform: translate(1px, 1px);
  box-shadow: 2px 2px 0px #0f172a;
}
.edit-btn--large {
  padding: 0.85rem 2rem;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.header-actions {
  display: flex;
  gap: 0.65rem;
  flex-wrap: wrap;
  align-items: center;
}

.logout-btn {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 900;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  padding: 0.6rem 1.25rem;
  border: 2px solid #9f1239;
  border-radius: 12px;
  background: #ffe4e6;
  color: #9f1239;
  cursor: pointer;
  box-shadow: 3px 3px 0px #9f1239;
  transition: transform 0.1s ease, box-shadow 0.1s ease;
  white-space: nowrap;
}
.logout-btn:hover {
  transform: translate(-2px, -2px);
  box-shadow: 5px 5px 0px #9f1239;
}
.logout-btn:active {
  transform: translate(1px, 1px);
  box-shadow: 2px 2px 0px #9f1239;
}

/* ── Status Badge ───────────────────────────────────────────────── */
.status-badge {
  padding: 0.65rem 1.25rem;
  border-radius: 14px;
  border: 2px solid;
  font-family: 'Tomorrow', sans-serif;
  font-size: 0.82rem;
  font-weight: 700;
}
.status-badge--success {
  background: #d1fae5;
  border-color: #065f46;
  color: #065f46;
}
.status-badge--no-data {
  background: #fef3c7;
  border-color: #92400e;
  color: #92400e;
}
.status-badge--error {
  background: #ffe4e6;
  border-color: #9f1239;
  color: #9f1239;
}
.status-badge--loading {
  background: #e2e8f0;
  border-color: #64748b;
  color: #64748b;
}

/* ── Skeleton ───────────────────────────────────────────────────── */
.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}
.skeleton-card {
  height: 80px;
  background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 16px;
  border: 2px solid #cbd5e1;
}
@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ── Empty state ────────────────────────────────────────────────── */
.empty-state {
  background: #ffffff;
  border: 2px solid #0f172a;
  border-radius: 24px;
  box-shadow: 6px 6px 0px #0f172a;
  padding: 3rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  text-align: center;
}
.empty-emoji { font-size: 3.5rem; }
.empty-title {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 900;
  font-size: 1.5rem;
  letter-spacing: -0.03em;
  color: #0f172a;
  margin: 0;
}
.empty-sub {
  font-family: 'Tomorrow', sans-serif;
  font-size: 0.9rem;
  color: #64748b;
  max-width: 380px;
}

/* ── Section label ──────────────────────────────────────────────── */
.section-label {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 800;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #94a3b8;
  padding-left: 0.25rem;
}

/* ── Stat grid ──────────────────────────────────────────────────── */
.stat-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.85rem;
}

.stat-card {
  background: #ffffff;
  border: 2px solid #0f172a;
  border-radius: 18px;
  box-shadow: 4px 4px 0px #0f172a;
  padding: 1rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.stat-card:hover {
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0px #0f172a;
}
.stat-card--wide {
  grid-column: span 2;
}

.stat-icon {
  font-size: 1.75rem;
  flex-shrink: 0;
}
.stat-body {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}
.stat-key {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #64748b;
}
.stat-val {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 800;
  font-size: 1.1rem;
  color: #0f172a;
}

/* ── Tags ────────────────────────────────────────────────────────── */
.tag-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.tag {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  font-size: 0.8rem;
  padding: 0.35rem 0.85rem;
  border-radius: 9999px;
  border: 1.5px solid;
}
.tag--green { background: #d1fae5; color: #064e3b; border-color: #065f46; }
.tag--red   { background: #ffe4e6; color: #9f1239; border-color: #be123c; }
.tag--amber { background: #fef3c7; color: #92400e; border-color: #b45309; }

/* ── Debug panel ─────────────────────────────────────────────────── */
.debug-panel {
  background: #0f172a;
  border: 2px solid #334155;
  border-radius: 16px;
  overflow: hidden;
}
.debug-summary {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  font-size: 0.8rem;
  color: #94a3b8;
  padding: 0.85rem 1.25rem;
  cursor: pointer;
  user-select: none;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
.debug-summary:hover { color: #e2e8f0; }
.debug-pre {
  font-family: 'Fira Code', 'Courier New', monospace;
  font-size: 0.78rem;
  color: #6ee7b7;
  padding: 1rem 1.25rem;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-all;
  border-top: 1px solid #334155;
  margin: 0;
}
</style>

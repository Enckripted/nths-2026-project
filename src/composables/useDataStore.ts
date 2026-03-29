import type { LocalStorageData } from '@/types/shared.types'
import { computed, ref } from 'vue'
import { useIngredients } from './useIngredientList'
import useUserProfile from './useUserProfile'
import { supabase } from '@/lib/supabaseClient'

const { ingredients } = useIngredients()
const { profile } = useUserProfile()

const LOCAL_STORAGE_KEY = 'data'
const dataInitialized = ref(false)
const isSyncing = ref(false)

const firstUse = computed(() => {
  return localStorage.getItem(LOCAL_STORAGE_KEY) == null
})

export async function getUserId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id || null
}

async function syncToSupabase() {
  isSyncing.value = true
  const userId = await getUserId()
  if (!userId) {
    isSyncing.value = false
    return
  }
  const payload = {
    id: userId,
    profile: profile.value,
    ingredients: ingredients.value,
    updated_at: new Date().toISOString()
  }
  
  const { error } = await supabase.from('data').upsert(payload, { onConflict: 'id' })
  if (error) {
    console.error('Error syncing to Supabase:', error)
  }
  isSyncing.value = false
}

function saveDataToLocalStorage() {
  const data: LocalStorageData = {
    ingredients: ingredients.value,
    profile: profile.value,
  }
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data))
  
  // Push to Supabase invisibly in the background
  syncToSupabase()
}

/**
 * Pull the latest ingredients + profile from Supabase and overwrite
 * local state. Also refreshes the local storage cache.
 */
export async function refreshFromSupabase(): Promise<void> {
  const userId = await getUserId()
  if (!userId) return

  const { data: remoteData, error } = await supabase
    .from('data')
    .select('profile, ingredients')
    .eq('id', userId)
    .single()

  if (remoteData && !error) {
    if (remoteData.ingredients) ingredients.value = remoteData.ingredients
    if (remoteData.profile) profile.value = remoteData.profile

    // Keep local cache in sync
    const cache: LocalStorageData = {
      ingredients: ingredients.value,
      profile: profile.value,
    }
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cache))
  }
}

async function initializeData() {
  dataInitialized.value = true

  // 1. Immediately inject any local state so the UI loads fast
  if (!firstUse.value) {
    try {
      const saveData: LocalStorageData = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) as string)
      if (saveData.ingredients) ingredients.value = saveData.ingredients
      if (saveData.profile) profile.value = saveData.profile
    } catch (e) {
      console.error('Local storage load failed', e)
    }
  }

  // 2. Hydrate from Supabase and overwrite if successful
  await refreshFromSupabase()
}

function saveIngredientList() {
  saveDataToLocalStorage()
}

function saveProfileData() {
  saveDataToLocalStorage()
}

// Listen for sign-in events and immediately pull the user's data from Supabase.
// This ensures ingredients are loaded as soon as the user authenticates,
// regardless of which component happens to call useDataStore() next.
supabase.auth.onAuthStateChange((event) => {
  if (event === 'SIGNED_IN') {
    // Re-run the full initialization so Supabase data overwrites any stale state
    dataInitialized.value = false
    initializeData()
  }
})

export default function useDataStore() {
  if (!dataInitialized.value) initializeData()

  return {
    firstUse,
    isSyncing,
    saveIngredientList,
    saveProfileData,
    refreshFromSupabase,
  }
}

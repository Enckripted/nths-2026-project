import type { LocalStorageData } from '@/types/shared.types'
import { computed } from 'vue'
import { useIngredients } from './useIngredientList'
import useUserProfile from './useUserProfile'
import { ref } from 'vue'

const { ingredients } = useIngredients()
const { profile } = useUserProfile()

const LOCAL_STORAGE_KEY = 'data'
const dataInitialized = ref(false)

const firstUse = computed(() => {
  return localStorage.getItem('data') != null
})

function saveDataToLocalStorage() {
  const data: LocalStorageData = {
    ingredients: ingredients.value,
    profile: profile.value,
  }
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data))
}

function retrieveFromLocalStorage() {
  dataInitialized.value = true
  if (firstUse.value) return

  const saveData: LocalStorageData = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) as string)
  ingredients.value = saveData.ingredients
  profile.value = saveData.profile
}

function saveIngredientList() {
  saveDataToLocalStorage()
}

function saveProfileData() {
  saveProfileData()
}

export default function useDataStore() {
  if (!dataInitialized.value) retrieveFromLocalStorage()

  return {
    firstUse,
    saveIngredientList,
    saveProfileData,
  }
}

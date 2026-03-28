import { ref } from 'vue'

export interface MealDetail {
  name: string
  cuisine?: string
  prepTimeMinutes?: number
  calories?: number
  protein?: number
  carbs?: number
  fat?: number
  ingredients?: { name: string; quantity: number; unit: string }[]
  usesCurrentIngredients?: { name: string; quantity: number; unit: string }[]
  instructions?: string[]
}

const selectedMeal = ref<MealDetail | null>(null)

export function useSelectedMeal() {
  function selectMeal(meal: MealDetail): void {
    selectedMeal.value = meal
  }

  function clearMeal(): void {
    selectedMeal.value = null
  }

  return { selectedMeal, selectMeal, clearMeal }
}
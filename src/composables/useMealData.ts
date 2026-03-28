import type { MealPlan } from '@/types/shared.types'
import { ref } from 'vue'

const mealPlan: MealPlan = ref([])

function parseMealJson(mealJsonStr: string) {
  const mealRes = []

  const mealJson = JSON.parse(mealJsonStr)
  for (const mealDay of mealJson.weeklyPlan) {
    const dayRes = {
      breakfast: mealDay.breakfast,
      lunch: mealDay.lunch,
      dinner: mealDay.dinner,
    }

    mealRes.push(dayRes)
  }

  console.log('Parsed data: ')
  console.log(mealPlan)
  //mealPlan.value = mealRes
}

export default function useMealData() {
  return {
    mealPlan,
    parseMealJson,
  }
}

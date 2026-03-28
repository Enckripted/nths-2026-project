import type { MealDay } from '@/types/shared.types'
import { ref } from 'vue'

const mealData = ref<MealDay[]>([])

function parseMealJson(mealJsonStr: string) {
  const mealRes = []

  const mealJson = JSON.parse(mealJsonStr)
  for (const mealDay of mealJson.weeklyPlan) {
    const dayRes: MealDay = {
      breakfast: mealDay.breakfast,
      lunch: mealDay.lunch,
      dinner: mealDay.dinner,
    }

    mealRes.push(dayRes)
  }

  console.log('Parsed data: ')
  console.log(mealData)
  mealData.value = mealRes
}

export default function useMealData() {
  return {
    mealData,
    parseMealJson,
  }
}

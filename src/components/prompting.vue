<template>
  <div>
    <button @click="handleGenerate" :disabled="loading">
      {{ loading ? 'Generating your plan...' : 'Generate Meal Plan' }}
    </button>
    <p v-if="error" style="color: red">{{ error }}</p>
    <pre v-if="mealPlan">{{ JSON.stringify(mealPlan, null, 2) }}</pre>
  </div>
</template>

<script setup lang="ts">
import { useMealPlan } from '@/composables/useMealPlan'

const { mealPlan, loading, error, generateMealPlan } = useMealPlan()

const emit = defineEmits<{
  (e: 'success', plan: any): void
  (e: 'error', message: string): void
}>()

async function handleGenerate(): Promise<void> {
  await generateMealPlan({
    gender: 'male',
    age: 28,
    weightKg: 85,
    heightCm: 180,
    goal: 'cut',
    activityLevel: 'moderate',
    cuisinePreferences: ['Italian', 'Mexican', 'Japanese'],
    allergies: ['peanuts'],
    cookingTimeMinutes: 30,
    currentIngredients: [
      { name: 'eggs', quantity: 6, unit: 'pieces' },
      { name: 'chicken breast', quantity: 500, unit: 'g' },
      { name: 'rice', quantity: 1, unit: 'kg' },
      { name: 'olive oil', quantity: 500, unit: 'ml' },
      { name: 'garlic', quantity: 1, unit: 'bulb' },
      { name: 'onion', quantity: 2, unit: 'pieces' },
      { name: 'canned tomatoes', quantity: 2, unit: 'cans' },
      { name: 'soy sauce', quantity: 200, unit: 'ml' },
      { name: 'oats', quantity: 500, unit: 'g' }
    ]
  })

  if (mealPlan.value) emit('success', mealPlan.value)
  if (error.value) emit('error', error.value)
}
</script>
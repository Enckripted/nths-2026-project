<template>
  <div>
    <button @click="handleGenerate" :disabled="loading">
      {{ loading ? 'Generating your plan...' : 'Generate Meal Plan' }}
    </button>
    <p v-if="error" style="color: red">{{ error }}</p>
    <!---<pre v-if="mealPlan">{{ JSON.stringify(mealPlan, null, 2) }}</pre>-->
  </div>
</template>

<script setup lang="ts">
import { useMealPlan } from '@/composables/useMealPlan'
import useUserProfile from '@/composables/useUserProfile'
import { useIngredients } from '@/composables/useIngredientList'

const { mealPlan, loading, error, generateMealPlan } = useMealPlan()
const { profile } = useUserProfile()
const { ingredients } = useIngredients()

const emit = defineEmits<{
  (e: 'success', plan: any): void
  (e: 'error', message: string): void
}>()

async function handleGenerate(): Promise<void> {
  await generateMealPlan(profile.value, ingredients.value)

  if (mealPlan.value) emit('success', mealPlan.value)
  if (error.value) emit('error', error.value)
}
</script>

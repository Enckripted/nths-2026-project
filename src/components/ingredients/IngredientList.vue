<script setup lang="ts">
import { useIngredients } from '@/composables/useIngredientList'
import AddIngredient from './AddIngredient.vue'
import IngredientItem from './IngredientItem.vue'

const { ingredients } = useIngredients()
</script>

<template>
  <div class="space-y-2">
    <h2 class="text-xl font-bold text-gray-800">Ingredients</h2>

    <div v-if="ingredients.length === 0" class="text-gray-500">No ingredients added yet.</div>
    <IngredientItem
      v-for="ingredient in ingredients"
      :key="ingredient.name"
      :ingredient="ingredient"
    />
    <AddIngredient />
  </div>
</template>

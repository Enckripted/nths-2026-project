<script setup lang="ts">
import type { Ingredient } from '@/types/shared.types'
import DeleteIngredient from './DeleteIngredient.vue'

defineProps<{ ingredient: Ingredient }>()
</script>

<template>
  <div
    class="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm"
  >
    <div class="flex-1">
      <span class="font-semibold text-gray-800">{{ ingredient.name }}</span>
      <span class="ml-2 text-gray-600">{{ ingredient.quantity }}{{ ingredient.unit ? ' ' + ingredient.unit : '' }}</span>
    </div>
    <DeleteIngredient :ingredient="ingredient" />
  </div>
</template>

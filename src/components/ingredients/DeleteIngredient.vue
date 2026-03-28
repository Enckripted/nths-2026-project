<script setup lang="ts">
import { useIngredients } from '@/composables/useIngredientList'
import type { Ingredient } from '@/types/shared.types'

const props = defineProps<{ ingredient: Ingredient }>()
const { removeIngredient } = useIngredients()

const handleDelete = () => {
  removeIngredient(props.ingredient.name)
}
</script>

<template>
  <button
    @click="handleDelete"
    class="px-3 py-1 text-sm font-medium text-white bg-red-500 rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
  >
    Delete
  </button>
</template>

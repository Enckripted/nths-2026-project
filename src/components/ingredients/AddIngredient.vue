<script setup lang="ts">
import { ref } from 'vue'
import { useIngredients } from '@/composables/useIngredientList'
import useDataStore from '@/composables/useDataStore'

const { addIngredient } = useIngredients()
const { saveIngredientList } = useDataStore()

const name = ref('')
const quantity = ref(0)
const unit = ref('pieces')
const errorMessage = ref('')

const handleAdd = () => {
  if (name.value.trim() && quantity.value > 0) {
    const success = addIngredient(name.value.trim(), quantity.value, unit.value)
    if (success) {
      name.value = ''
      quantity.value = 0
      unit.value = 'pieces'
      errorMessage.value = ''
      saveIngredientList()
    } else {
      errorMessage.value = 'Conflicting unit for existing ingredient.'
    }
  }
}
</script>

<template>
  <div class="mb-4 p-4 bg-gray-50 rounded-lg">
    <h3 class="text-lg font-semibold mb-2">Add Ingredient</h3>
    <form @submit.prevent="handleAdd" class="flex space-x-2">
      <input
        v-model="name"
        type="text"
        placeholder="Ingredient name"
        class="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
        required
      />
      <input
        v-model.number="quantity"
        type="number"
        placeholder="Quantity"
        class="w-24 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
        min="0"
        step="0.1"
        required
      />
      <select
        v-model="unit"
        class="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
      >
        <option value="cups">cups</option>
        <option value="grams">grams</option>
        <option value="ounces">ounces</option>
        <option value="liters">liters</option>
        <option value="pieces">pieces</option>
      </select>
      <button
        type="submit"
        class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
      >
        Add
      </button>
    </form>
    <p v-if="errorMessage" class="text-red-500 text-sm mt-2">{{ errorMessage }}</p>
  </div>
</template>

import type { Ingredient } from '@/types/shared.types'
import { ref } from 'vue'

const ingredients = ref<Ingredient[]>([])

/**
 * Adds an ingredient to the list with the given quantity and unit.
 * If the ingredient already exists and the unit does not match, returns false.
 * If the ingredient does not exist, adds it to the list.
 * @param {string} ingredient - The name of the ingredient.
 * @param {number} quantity - The quantity of the ingredient.
 * @param {string} [unit=""] - The unit of the ingredient.
 * @returns {boolean} - Whether the ingredient was added successfully.
 */
function addIngredient(ingredient: string, quantity: number, unit = '') {
  const existing = ingredients.value.find((i) => i.name === ingredient)

  if (existing) {
    if (existing.unit !== unit) return false
    existing.quantity += quantity
    return true
  }

  ingredients.value.push({ name: ingredient, quantity, unit })
  return true
}

function subtractIngredient(ingredient: string, quantity: number) {
  const item = ingredients.value.find((i) => i.name === ingredient)
  if (!item) return false

  item.quantity -= quantity
  if (item.quantity <= 0) {
    const index = ingredients.value.indexOf(item)
    ingredients.value.splice(index, 1)
  }

  return true
}

function removeIngredient(ingredient: string) {
  const index = ingredients.value.findIndex((i) => i.name === ingredient)
  if (index !== -1) {
    ingredients.value.splice(index, 1)
  }
}

export function useIngredients() {
  return {
    ingredients,
    addIngredient,
    removeIngredient,
    subtractIngredient,
  }
}

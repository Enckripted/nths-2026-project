interface Ingredient {
  name: string
  unit: string
  quantity: number
}

interface Profile {
  gender: string
  weightLbs: number | null
  heightFt: number | null
  heightIn: number | null
  desiredWeightDirection: string
  activityLevel: string
  minutesForCooking: number | null
  age: number | null
  cuisineFavorites: string[]
  strongDislikes: string[]
  allergies: string[]
}

interface Meal {
  name: string
  cuisine: string
  prepTimeMinutes: number
  calories: number
  protein: number
  carbs: number
  fat: number
  ingredients: Ingredient[]
  usesCurrentIngredients: Ingredient[]
  instructions: string[]
}

interface DayPlan {
  day: string
  breakfast: Meal
  lunch: Meal
  dinner: Meal
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
}

interface ShoppingList {
  produce: Ingredient[]
  proteins: Ingredient[]
  dairy: Ingredient[]
  grains: Ingredient[]
  pantry: Ingredient[]
  other: Ingredient[]
}

interface MealPlan {
  dailyCalorieTarget: number
  dailyProteinTarget: number
  dailyCarbTarget: number
  dailyFatTarget: number
  weeklyPlan: DayPlan[]
  shoppingList: ShoppingList
  notes: string
}

interface LocalStorageData {
  ingredients: Ingredient[]
  profile: Profile
}

export type { Ingredient, Profile, LocalStorageData, Meal, DayPlan, MealPlan, ShoppingList }

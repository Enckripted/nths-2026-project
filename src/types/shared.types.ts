interface Ingredient {
  name: string
  unit: string
  quantity: number
}

interface Profile {
  gender: string
  weight: number
  height: number
  desiredWeightDirection: string
  activityLevel: number
  minutesForCooking: number
  cuisineFavorites: string[]
  strongDislikes: string[]
  allergies: string[]
}

interface LocalStorageData {
  ingredients: Ingredient[]
  profile: Profile
}

export type { Ingredient, Profile, LocalStorageData }

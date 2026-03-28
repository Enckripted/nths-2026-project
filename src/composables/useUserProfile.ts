import { ref } from 'vue'

const gender = ref<string>()
const weight = ref<number>()
const height = ref<number>()

//should be dropdown between cut, maintain, or bulk
const desiredWeightDirection = ref<string>()
//how active the user is on a scale of 1 - 10
const activityLevel = ref<number>()
//time in minutes they are willing to allocate to cooking
const minutesForCooking = ref<number>()

const cuisineFavorites = ref<string[]>([])
const strongDislikes = ref<string[]>([])
const allergies = ref<string[]>([])

const isComplete = ref<boolean>(false)

export default function useUserProfile() {
  return {
    gender,
    weight,
    height,
    desiredWeightDirection,
    activityLevel,
    minutesForCooking,
    cuisineFavorites,
    strongDislikes,
    allergies,
    isComplete,
  }
}

import { ref } from 'vue'
import type { Profile } from '@/types/shared.types'

const profile = ref<Profile>({
  gender: '',
  weightLbs: 0,
  heightFt: 5,
  heightIn: 6,
  desiredWeightDirection: '',
  activityLevel: 'moderate',
  minutesForCooking: 30,
  age: 25,
  cuisineFavorites: [],
  strongDislikes: [],
  allergies: [],
})

export default function useUserProfile() {
  return {
    profile,
  }
}

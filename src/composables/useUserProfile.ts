import { ref } from 'vue'
import type { Profile } from '@/types/shared.types'

const profile = ref<Profile>({
  gender: '',
  weightLbs: 0,
  heightFt: 0,
  heightIn: 0,
  desiredWeightDirection: '',
  activityLevel: '',
  minutesForCooking: 0,
  age: 0,
  cuisineFavorites: [],
  strongDislikes: [],
  allergies: [],
})

export default function useUserProfile() {
  return {
    profile,
  }
}

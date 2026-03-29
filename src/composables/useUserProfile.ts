import { ref } from 'vue'
import type { Profile } from '@/types/shared.types'

const profile = ref<Profile>({
  gender: '',
  weightLbs: null,
  heightFt: null,
  heightIn: null,
  desiredWeightDirection: '',
  activityLevel: '',
  minutesForCooking: null,
  age: null,
  cuisineFavorites: [],
  strongDislikes: [],
  allergies: [],
})

export default function useUserProfile() {
  return {
    profile,
  }
}

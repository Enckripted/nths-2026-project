import { ref } from 'vue'
import type { Profile } from '@/types/shared.types'

const profile = ref<Profile>({
  gender: '',
  weight: 0,
  height: 0,
  desiredWeightDirection: '',
  activityLevel: 5,
  minutesForCooking: 30,
  cuisineFavorites: [],
  strongDislikes: [],
  allergies: []
})

const isComplete = ref<boolean>(false)

export default function useUserProfile() {
  return {
    profile
  }
}

<script setup lang="ts">
import { computed } from 'vue'
import useUserProfile from '@/composables/useUserProfile'
import StringList from '@/components/StringList.vue'

const { profile } = useUserProfile()

const gender = computed({
  get: () => profile.value.gender,
  set: (value) => profile.value.gender = value
})

const weight = computed({
  get: () => profile.value.weight,
  set: (value) => profile.value.weight = value
})

const height = computed({
  get: () => profile.value.height,
  set: (value) => profile.value.height = value
})

const desiredWeightDirection = computed({
  get: () => profile.value.desiredWeightDirection,
  set: (value) => profile.value.desiredWeightDirection = value
})

const activityLevel = computed({
  get: () => profile.value.activityLevel,
  set: (value) => profile.value.activityLevel = value
})

const minutesForCooking = computed({
  get: () => profile.value.minutesForCooking,
  set: (value) => profile.value.minutesForCooking = value
})

const cuisineFavorites = computed({
  get: () => profile.value.cuisineFavorites,
  set: (value) => profile.value.cuisineFavorites = value
})

const strongDislikes = computed({
  get: () => profile.value.strongDislikes,
  set: (value) => profile.value.strongDislikes = value
})

const allergies = computed({
  get: () => profile.value.allergies,
  set: (value) => profile.value.allergies = value
})

const saveProfile = () => {
  // The data is already reactive and updated in real-time
  // You could add validation or save to localStorage/API here if needed
  console.log('Profile saved:', profile.value)
}
</script>
<template>
  <div class="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
    <h1 class="text-2xl font-bold text-gray-800 mb-6">User Profile</h1>
    <form @submit.prevent="saveProfile" class="space-y-4">
      <!-- Gender -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Gender</label>
        <select
          v-model="gender"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>

      <!-- Weight -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
        <input
          v-model.number="weight"
          type="number"
          min="0"
          step="0.1"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <!-- Height -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
        <input
          v-model.number="height"
          type="number"
          min="0"
          step="0.1"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <!-- Desired Weight Direction -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Desired Weight Direction</label>
        <select
          v-model="desiredWeightDirection"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select Direction</option>
          <option value="cut">Cut</option>
          <option value="maintain">Maintain</option>
          <option value="bulk">Bulk</option>
        </select>
      </div>

      <!-- Activity Level -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Activity Level (1-10)</label>
        <input
          v-model.number="activityLevel"
          type="number"
          min="1"
          max="10"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <!-- Minutes for Cooking -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Minutes for Cooking</label>
        <input
          v-model.number="minutesForCooking"
          type="number"
          min="0"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <!-- Cuisine Favorites -->
      <StringList
        v-model="cuisineFavorites"
        label="Cuisine Favorites"
        placeholder="e.g., Italian"
      />

      <!-- Strong Dislikes -->
      <StringList
        v-model="strongDislikes"
        label="Strong Dislikes"
        placeholder="e.g., Spicy food"
      />

      <!-- Allergies -->
      <StringList v-model="allergies" label="Allergies" placeholder="e.g., Nuts" />

      <!-- Save Button -->
      <button
        type="submit"
        class="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
      >
        Save Profile
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import IngredientList from '@/components/ingredients/IngredientList.vue'
import Prompting from '@/components/prompting.vue';

function onPlanReady(plan: any): void {
  console.log('Meal plan received:', plan)
  // later this will route to the dashboard with the plan
}

function onPlanError(message: string): void {
  console.error('Meal plan error:', message)
}
</script>

<template>
  <main class="home-page">
    <div class="content">
      <IngredientList />
      <Prompting
  gender="male"
  :age="28"
  :weightKg="85"
  :heightCm="180"
  goal="cut"
  activityLevel="moderate"
  :cuisinePreferences="['Italian', 'Mexican']"
  :allergies="['peanuts']"
  :cookingTimeMinutes="30"
  :currentIngredients="['eggs', 'rice', 'chicken breast']"
  @success="onPlanReady"
  @error="onPlanError"
/>
    </div>
  </main>
</template>

<style scoped>
.home-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 80px); /* Account for header */
  padding: 2rem;
  text-align: center;
}

.content {
  max-width: 600px;
}

.gradient-text {
  font-size: 3.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 1rem;
}

p {
  font-size: 1.25rem;
  color: #6b7280;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .gradient-text {
    font-size: 2.5rem;
  }
}
</style>

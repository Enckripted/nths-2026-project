<template>
  <div>
    <button @click="handleGenerate" :disabled="loading">
      {{ loading ? 'Generating your plan...' : 'Generate Meal Plan' }}
    </button>
    <p v-if="error" style="color: red">{{ error }}</p>
    <pre v-if="mealPlan">{{ JSON.stringify(mealPlan, null, 2) }}</pre>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Groq from 'groq-sdk'

// --- Types ---
export interface UserProfile {
  gender: 'male' | 'female' | 'other'
  age: number
  weightKg: number
  heightCm: number
  goal: 'cut' | 'bulk' | 'maintain'
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
  cuisinePreferences: string[]
  allergies: string[]
  cookingTimeMinutes: number
  currentIngredients: string[]
}

export interface Meal {
  name: string
  cuisine: string
  prepTimeMinutes: number
  calories: number
  protein: number
  carbs: number
  fat: number
  ingredients: string[]
  usesCurrentIngredients: string[]
  instructions: string[]
}

export interface DayPlan {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'
  breakfast: Meal
  lunch: Meal
  dinner: Meal
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
}

export interface MealPlanResponse {
  dailyCalorieTarget: number
  dailyProteinTarget: number
  dailyCarbTarget: number
  dailyFatTarget: number
  weeklyPlan: DayPlan[]
  shoppingList: {
    produce: string[]
    proteins: string[]
    dairy: string[]
    grains: string[]
    pantry: string[]
    other: string[]
  }
  notes: string
}

// --- Props ---
const props = withDefaults(defineProps<UserProfile>(), {
  gender: 'male',
  age: 25,
  weightKg: 75,
  heightCm: 175,
  goal: 'maintain',
  activityLevel: 'moderate',
  cuisinePreferences: () => [],
  allergies: () => [],
  cookingTimeMinutes: 30,
  currentIngredients: () => []
})

// --- Emits ---
const emit = defineEmits<{
  (e: 'success', plan: MealPlanResponse): void
  (e: 'error', message: string): void
}>()

// --- State ---
const mealPlan = ref<MealPlanResponse | null>(null)
const loading = ref<boolean>(false)
const error = ref<string | null>(null)

// --- Groq ---
const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY as string,
  dangerouslyAllowBrowser: true
})

// --- Prompts ---
function buildSystemPrompt(): string {
  return `You are a professional nutritionist and meal planning expert.

STRICT RULES:
1. Return ONLY valid JSON. No markdown, no backticks, no text outside the JSON object. Ever.
2. NEVER include an ingredient the user is allergic to or restricted from — not even in trace amounts.
3. NEVER suggest a meal that exceeds the user's max cooking time.
4. NEVER repeat the same meal twice in the same week.
5. Shopping list must EXCLUDE anything the user already has at home.
6. Every day must hit within 50 calories of the daily target.

CALORIE CALCULATION — use Mifflin-St Jeor:
- Men: (10 × weight kg) + (6.25 × height cm) − (5 × age) + 5
- Women: (10 × weight kg) + (6.25 × height cm) − (5 × age) − 161
- Multiply by activity multiplier:
  - Sedentary: 1.2
  - Light: 1.375
  - Moderate: 1.55
  - Active: 1.725
  - Very Active: 1.9
- Adjust for goal:
  - Cut: subtract 400 calories
  - Bulk: add 400 calories
  - Maintain: no change

PROTEIN TARGETS:
- Cut: 2.2g per kg bodyweight
- Bulk: 1.8g per kg bodyweight
- Maintain: 1.6g per kg bodyweight

MEAL VARIETY:
- Rotate through the user's cuisine preferences across the week
- Distribute preferred cuisines evenly — don't front-load them
- Breakfast should be quick and realistic for a weekday
- Weekend meals (Sat/Sun) can be slightly more complex

SHOPPING LIST:
- Only include what the user does NOT already have
- Categorize into: produce, proteins, dairy, grains, pantry, other
- Use realistic grocery quantities (e.g. "2 chicken breasts" not just "chicken")`
}

function buildUserPrompt(): string {
  const activityLabel: Record<UserProfile['activityLevel'], string> = {
    sedentary: 'Sedentary (desk job, little to no exercise)',
    light: 'Light (light exercise 1-3 days/week)',
    moderate: 'Moderate (moderate exercise 3-5 days/week)',
    active: 'Active (hard exercise 6-7 days/week)',
    very_active: 'Very Active (physical job + hard exercise daily)'
  }

  const goalLabel: Record<UserProfile['goal'], string> = {
    cut: 'Cut (lose fat)',
    bulk: 'Bulk (gain muscle)',
    maintain: 'Maintain current weight'
  }

  return `Generate a 7-day meal plan for this user:

--- PROFILE ---
Gender: ${props.gender}
Age: ${props.age} years old
Weight: ${props.weightKg} kg
Height: ${props.heightCm} cm
Goal: ${goalLabel[props.goal]}
Activity level: ${activityLabel[props.activityLevel]}

--- FOOD PREFERENCES ---
Cuisine preferences: ${props.cuisinePreferences.length > 0 ? props.cuisinePreferences.join(', ') : 'No preference — suggest a variety'}
Allergies / restrictions: ${props.allergies.length > 0 ? props.allergies.join(', ') : 'None'}
Max cooking time per meal: ${props.cookingTimeMinutes} minutes

--- INGREDIENTS ALREADY AT HOME ---
${props.currentIngredients.length > 0 ? props.currentIngredients.map(i => `- ${i}`).join('\n') : 'None — assume pantry is empty'}

--- INSTRUCTIONS ---
1. Calculate my exact daily calorie and macro targets using the Mifflin-St Jeor equation and the rules in your instructions.
2. Build a full 7-day meal plan with breakfast, lunch, and dinner for every day Monday through Sunday.
3. Prioritize using my current ingredients before introducing new ones to minimize waste.
4. Every meal must stay within my max cooking time of ${props.cookingTimeMinutes} minutes.
5. Every meal must be completely free of: ${props.allergies.length > 0 ? props.allergies.join(', ') : 'N/A'}.
6. Generate a shopping list for only what I still need to buy — exclude anything I already have at home.
7. Return the result as a single JSON object matching this exact schema — no markdown, no backticks, no extra text:

{
  "dailyCalorieTarget": number,
  "dailyProteinTarget": number,
  "dailyCarbTarget": number,
  "dailyFatTarget": number,
  "weeklyPlan": [
    {
      "day": "Monday",
      "breakfast": {
        "name": string,
        "cuisine": string,
        "prepTimeMinutes": number,
        "calories": number,
        "protein": number,
        "carbs": number,
        "fat": number,
        "ingredients": string[],
        "usesCurrentIngredients": string[],
        "instructions": string[]
      },
      "lunch": { ...same as breakfast },
      "dinner": { ...same as breakfast },
      "totalCalories": number,
      "totalProtein": number,
      "totalCarbs": number,
      "totalFat": number
    }
  ],
  "shoppingList": {
    "produce": string[],
    "proteins": string[],
    "dairy": string[],
    "grains": string[],
    "pantry": string[],
    "other": string[]
  },
  "notes": string
}

The weeklyPlan array must contain exactly 7 objects, one for each day Monday through Sunday in order.`
}

// --- Handler ---
async function handleGenerate(): Promise<void> {
  loading.value = true
  error.value = null
  mealPlan.value = null

  try {
    const result = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 8000,
      messages: [
        { role: 'system', content: buildSystemPrompt() },
        { role: 'user', content: buildUserPrompt() }
      ]
    })

    const raw = result.choices[0]?.message?.content ?? ''
    const cleaned = raw.replace(/```json|```/g, '').trim()
    mealPlan.value = JSON.parse(cleaned) as MealPlanResponse
    emit('success', mealPlan.value)

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    error.value = message
    emit('error', message)
  } finally {
    loading.value = false
  }
}
</script>
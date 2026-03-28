import { ref } from 'vue'
import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY as string,
  dangerouslyAllowBrowser: true
})

const mealPlan = ref<any>(null)
const loading = ref<boolean>(false)
const error = ref<string | null>(null)

function buildSystemPrompt(): string {
  return `You are a professional nutritionist and meal planning expert.

STRICT RULES:
1. Return ONLY valid JSON. No markdown, no backticks, no text outside the JSON object. Ever.
2. NEVER include an ingredient the user is allergic to or restricted from — not even in trace amounts.
3. NEVER suggest a meal that exceeds the user's max cooking time.
4. NEVER repeat the same meal twice in the same week.
5. Shopping list must EXCLUDE anything the user already has at home in sufficient quantity.
6. Every day must hit within 50 calories of the daily target.
7. When the user has an ingredient at home, check if the quantity is sufficient for the meal before using it.
8. If the quantity is insufficient, add the shortfall amount to the shopping list.
9. Shopping list quantities must be realistic grocery amounts (e.g. "500g chicken breast" not just "chicken breast").
10. Every ingredient in a meal must include a name, quantity, and unit (e.g. { "name": "eggs", "quantity": 3, "unit": "pieces" }).
11. Never list an ingredient as just a string — always use the object format with name, quantity, and unit.
12. Always use these exact units — never deviate:
    - Solid foods: g (grams)
    - Liquids: ml (milliliters)
    - Countable items (eggs, bananas, cans): pieces
    - Spices/seasonings: g (grams)
    - Never use: oz, lb, cups, tbsp, tsp, kg, L — convert everything to g or ml

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
- Only include what the user does NOT already have in sufficient quantity
- Categorize into: produce, proteins, dairy, grains, pantry, other
- Use realistic grocery quantities in standardized units (g, ml, or pieces only)`
}

function normalizeIngredient(i: any): { name: string; quantity: number; unit: string } {
  let quantity = i.quantity
  let unit = i.unit

  if (unit === 'kg') { quantity = quantity * 1000; unit = 'g' }
  else if (unit === 'L' || unit === 'l') { quantity = quantity * 1000; unit = 'ml' }
  else if (unit === 'lb') { quantity = Math.round(quantity * 453.6); unit = 'g' }
  else if (unit === 'oz') { quantity = Math.round(quantity * 28.35); unit = 'g' }
  else if (unit === 'fl_oz') { quantity = Math.round(quantity * 29.57); unit = 'ml' }
  else if (unit === 'cup') { quantity = Math.round(quantity * 240); unit = 'ml' }
  else if (unit === 'tbsp') { quantity = Math.round(quantity * 15); unit = 'ml' }
  else if (unit === 'tsp') { quantity = Math.round(quantity * 5); unit = 'ml' }

  return { name: i.name, quantity, unit }
}

function buildUserPrompt(profile: any): string {
  const activityLabel: Record<string, string> = {
    sedentary: 'Sedentary (desk job, little to no exercise)',
    light: 'Light (light exercise 1-3 days/week)',
    moderate: 'Moderate (moderate exercise 3-5 days/week)',
    active: 'Active (hard exercise 6-7 days/week)',
    very_active: 'Very Active (physical job + hard exercise daily)'
  }

  const goalLabel: Record<string, string> = {
    cut: 'Cut (lose fat)',
    bulk: 'Bulk (gain muscle)',
    maintain: 'Maintain current weight'
  }

  const normalizedIngredients = profile.currentIngredients.map(normalizeIngredient)

  return `Generate a 7-day meal plan for this user:

--- PROFILE ---
Gender: ${profile.gender}
Age: ${profile.age} years old
Weight: ${profile.weightKg} kg
Height: ${profile.heightCm} cm
Goal: ${goalLabel[profile.goal]}
Activity level: ${activityLabel[profile.activityLevel]}

--- FOOD PREFERENCES ---
Cuisine preferences: ${profile.cuisinePreferences.length > 0 ? profile.cuisinePreferences.join(', ') : 'No preference — suggest a variety'}
Allergies / restrictions: ${profile.allergies.length > 0 ? profile.allergies.join(', ') : 'None'}
Max cooking time per meal: ${profile.cookingTimeMinutes} minutes

--- INGREDIENTS ALREADY AT HOME ---
${normalizedIngredients.length > 0
      ? normalizedIngredients.map((i: any) => `- ${i.quantity} ${i.unit} of ${i.name}`).join('\n')
      : 'None — assume pantry is empty'}

--- INSTRUCTIONS ---
1. Calculate my exact daily calorie and macro targets using the Mifflin-St Jeor equation and the rules in your instructions.
2. Build a full 7-day meal plan with breakfast, lunch, and dinner for every day Monday through Sunday.
3. Prioritize using my current ingredients before introducing new ones to minimize waste.
4. Check ingredient quantities — if I don't have enough of something, add the shortfall to the shopping list.
5. Every meal must stay within my max cooking time of ${profile.cookingTimeMinutes} minutes.
6. Every meal must be completely free of: ${profile.allergies.length > 0 ? profile.allergies.join(', ') : 'N/A'}.
7. Generate a shopping list for only what I still need to buy — exclude anything I already have in sufficient quantity.
8. All ingredient quantities must use standardized units only: g for solids, ml for liquids, pieces for countable items.
9. Return the result as a single JSON object matching this exact schema — no markdown, no backticks, no extra text:

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
        "ingredients": [{ "name": string, "quantity": number, "unit": string }],
        "usesCurrentIngredients": [{ "name": string, "quantity": number, "unit": string }],
        "instructions": string[]
      },
      "lunch": {
        "name": string,
        "cuisine": string,
        "prepTimeMinutes": number,
        "calories": number,
        "protein": number,
        "carbs": number,
        "fat": number,
        "ingredients": [{ "name": string, "quantity": number, "unit": string }],
        "usesCurrentIngredients": [{ "name": string, "quantity": number, "unit": string }],
        "instructions": string[]
      },
      "dinner": {
        "name": string,
        "cuisine": string,
        "prepTimeMinutes": number,
        "calories": number,
        "protein": number,
        "carbs": number,
        "fat": number,
        "ingredients": [{ "name": string, "quantity": number, "unit": string }],
        "usesCurrentIngredients": [{ "name": string, "quantity": number, "unit": string }],
        "instructions": string[]
      },
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

export function useMealPlan() {
  async function generateMealPlan(profile: any): Promise<void> {
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
          { role: 'user', content: buildUserPrompt(profile) }
        ]
      })

      const raw = result.choices[0]?.message?.content ?? ''
      const cleaned = raw.replace(/```json|```/g, '').trim()
      mealPlan.value = JSON.parse(cleaned)

    } catch (err) {
      if (err instanceof SyntaxError) {
        error.value = 'Failed to parse meal plan — try generating again.'
      } else {
        error.value = err instanceof Error ? err.message : 'Unknown error'
      }
    } finally {
      loading.value = false
    }
  }

  function clearPlan(): void {
    mealPlan.value = null
    error.value = null
  }

  return { mealPlan, loading, error, generateMealPlan, clearPlan }
}
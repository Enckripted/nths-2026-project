import { ref } from 'vue'
import Groq from 'groq-sdk'
import { supabase } from '@/lib/supabaseClient'
import { getUserId } from './useDataStore'

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY ?? '',
  dangerouslyAllowBrowser: true
})

const MODELS: string[] = [
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
  'gemma2-9b-it',
  'mixtral-8x7b-32768'
]

const mealPlan = ref<any>(null)
const loading = ref<boolean>(false)
const error = ref<string | null>(null)
const activeModel = ref<string>(MODELS[0] ?? '')

// ---------------------------------------------------------------------------
// Ingredient alias map
// Normalises model variant names to canonical pantry keys so lookups match.
// e.g. "scrambled eggs" → "eggs", "salmon fillet" → "salmon"
// Add any new variants here as the model introduces them.
// ---------------------------------------------------------------------------
const INGREDIENT_ALIASES: Record<string, string> = {
  // eggs
  'scrambled eggs': 'eggs',
  'fried eggs': 'eggs',
  'poached eggs': 'eggs',
  'boiled eggs': 'eggs',
  'egg': 'eggs',
  // chicken
  'chicken': 'chicken breast',
  'chicken thigh': 'chicken breast',
  'grilled chicken': 'chicken breast',
  'shredded chicken': 'chicken breast',
  // beef
  'ground beef': 'beef',
  'beef strips': 'beef',
  'beef steak': 'beef',
  'steak': 'beef',
  'minced beef': 'beef',
  // salmon
  'salmon fillet': 'salmon',
  'grilled salmon': 'salmon',
  // garlic
  'garlic clove': 'garlic',
  'garlic cloves': 'garlic',
  'minced garlic': 'garlic',
  // rice
  'white rice': 'rice',
  'brown rice': 'rice',
  'cooked rice': 'rice',
  'steamed rice': 'rice',
  // oats
  'rolled oats': 'oats',
  'instant oats': 'oats',
  'oatmeal': 'oats',
  // olive oil
  'olive oil spray': 'olive oil',
  'cooking oil': 'olive oil',
  'oil': 'olive oil',
  // canned tomatoes
  'canned tomato': 'canned tomatoes',
  'tomato can': 'canned tomatoes',
  'tinned tomatoes': 'canned tomatoes',
  // soy sauce
  'soy sauce mix': 'soy sauce',
  'teriyaki sauce': 'soy sauce',
  // onion
  'yellow onion': 'onion',
  'white onion': 'onion',
  'red onion': 'onion',
  'diced onion': 'onion',
}

function resolveIngredientName(raw: string): string {
  const lower = raw.toLowerCase().trim()
  return INGREDIENT_ALIASES[lower] ?? lower
}

// ---------------------------------------------------------------------------
// Nutrition target calculator (Mifflin-St Jeor)
// Pre-calculated client-side so the model receives hard numbers, not a formula.
// ---------------------------------------------------------------------------
function calculateTargets(profile: any): {
  calories: number
  protein: number
  carbs: number
  fat: number
} {
  const activityMultiplier: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9
  }

  const base =
    profile.gender === 'male'
      ? 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.age + 5
      : 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.age - 161

  const tdee = base * (activityMultiplier[profile.activityLevel] ?? 1.55)

  const goalAdjustment: Record<string, number> = { cut: -400, bulk: 400, maintain: 0 }
  const calories = Math.round(tdee + (goalAdjustment[profile.goal] ?? 0))

  const proteinPerKg: Record<string, number> = { cut: 2.2, bulk: 1.8, maintain: 1.6 }
  const protein = Math.round((proteinPerKg[profile.goal] ?? 1.6) * profile.weightKg)

  const fat = Math.round((calories * 0.25) / 9)
  const carbs = Math.round((calories - protein * 4 - fat * 9) / 4)

  return { calories, protein, carbs, fat }
}

// ---------------------------------------------------------------------------
// Unit normalizer — converts any incoming unit to g / ml / pieces
// ---------------------------------------------------------------------------
function normalizeIngredient(i: any): { name: string; quantity: number; unit: string } {
  let quantity = i.quantity
  let unit = i.unit

  if (unit === 'kg')                     { quantity = quantity * 1000;              unit = 'g'      }
  else if (unit === 'L' || unit === 'l') { quantity = quantity * 1000;              unit = 'ml'     }
  else if (unit === 'lb')                { quantity = Math.round(quantity * 453.6); unit = 'g'      }
  else if (unit === 'oz')                { quantity = Math.round(quantity * 28.35); unit = 'g'      }
  else if (unit === 'fl_oz')             { quantity = Math.round(quantity * 29.57); unit = 'ml'     }
  else if (unit === 'cup')               { quantity = Math.round(quantity * 240);   unit = 'ml'     }
  else if (unit === 'tbsp')              { quantity = Math.round(quantity * 15);    unit = 'ml'     }
  else if (unit === 'tsp')               { quantity = Math.round(quantity * 5);     unit = 'ml'     }
  // A garlic bulb has ~10 cloves — normalise so pantry quantity is comparable
  else if (unit === 'bulb')              { quantity = quantity * 10;                unit = 'pieces' }
  // cans: keep as pieces so count comparisons work
  else if (unit === 'cans' || unit === 'can') { unit = 'pieces' }
  // Any other non-standard unit → 1 piece
  else if (!['g', 'ml', 'pieces'].includes(unit)) { quantity = 1; unit = 'pieces' }

  // Resolve aliases so pantry keys are always canonical
  const name = resolveIngredientName(i.name)
  return { name, quantity, unit }
}

// ---------------------------------------------------------------------------
// Shopping list validator
// Discards the model's shopping list and rebuilds it from scratch by tallying
// actual meal ingredient usage vs what the user has at home.
// ---------------------------------------------------------------------------
function validateAndPatchPlan(plan: any, profile: any): any {
  // Build normalized pantry map: canonical name → { quantity, unit }
  const pantry = new Map<string, { quantity: number; unit: string }>()
  for (const ing of profile.currentIngredients.map(normalizeIngredient)) {
    pantry.set(ing.name, { quantity: ing.quantity, unit: ing.unit })
  }

  console.log('[validateAndPatchPlan] pantry keys:', [...pantry.keys()])
  console.log('[validateAndPatchPlan] pantry:', Object.fromEntries(pantry))

  // Tally total ingredient usage across all 21 meals, resolving aliases
  const totalUsed = new Map<string, { quantity: number; unit: string }>()
  for (const day of plan.weeklyPlan) {
    for (const mealKey of ['breakfast', 'lunch', 'dinner']) {
      const meal = day[mealKey]
      if (!meal?.ingredients) continue
      for (const ing of meal.ingredients) {
        const key = resolveIngredientName(ing.name)
        const existing = totalUsed.get(key)
        if (existing) {
          existing.quantity += ing.quantity
        } else {
          totalUsed.set(key, { quantity: ing.quantity, unit: ing.unit })
        }
      }
    }
  }

  console.log('[validateAndPatchPlan] totalUsed keys:', [...totalUsed.keys()])
  console.log('[validateAndPatchPlan] totalUsed:', Object.fromEntries(totalUsed))

  // Category lookup — proteins checked first to avoid partial-match collisions
  const categoryMap: Record<string, string[]> = {
    proteins: [
      'chicken breast', 'chicken', 'beef', 'steak', 'pork', 'shrimp',
      'salmon', 'tuna', 'turkey', 'lamb', 'eggs', 'tofu', 'tempeh', 'sausage'
    ],
    produce: [
      'bell pepper', 'carrot', 'onion', 'tomato', 'potato', 'sweet potato',
      'zucchini', 'cucumber', 'broccoli', 'cauliflower', 'mushroom', 'garlic',
      'spinach', 'romaine lettuce', 'lettuce', 'kale', 'corn', 'banana', 'apple',
      'orange', 'lemon', 'lime', 'mango', 'avocado', 'peach', 'pear', 'plum', 'kiwi'
    ],
    dairy: [
      'milk', 'cheese', 'yogurt', 'butter', 'sour cream', 'cream',
      'mozzarella', 'parmesan', 'parmesan cheese', 'cheddar', 'cream cheese'
    ],
    grains: [
      'rice', 'oats', 'tortilla', 'tortillas', 'bread', 'pasta', 'noodles',
      'udon noodles', 'ramen noodles', 'flour', 'quinoa', 'couscous',
      'wrap', 'pita', 'breadcrumbs', 'english muffin', 'croutons'
    ],
    pantry: [
      'olive oil', 'soy sauce', 'canned tomatoes', 'tomato sauce', 'marinara sauce',
      'honey', 'sugar', 'salt', 'pepper', 'vinegar', 'hot sauce', 'salsa',
      'caesar dressing', 'dressing', 'mayonnaise', 'ketchup', 'mustard',
      'coconut milk', 'broth', 'stock', 'bouillon'
    ]
  }

  const categoryOf = (name: string): string => {
    const lower = name.toLowerCase().trim()
    for (const [cat, items] of Object.entries(categoryMap)) {
      // Exact match first, then partial — avoids wrong category from substring hits
      if (items.includes(lower)) return cat
    }
    for (const [cat, items] of Object.entries(categoryMap)) {
      if (items.some(item => lower.includes(item))) return cat
    }
    return 'other'
  }

  // Rebuild shopping list from scratch
  const newShoppingList: Record<string, any[]> = {
    produce: [], proteins: [], dairy: [], grains: [], pantry: [], other: []
  }

  for (const [name, used] of totalUsed.entries()) {
    if (name === 'water') continue

    const atHome = pantry.get(name)?.quantity ?? 0
    const shortfall = used.quantity - atHome

    console.log(`[shopping] ${name}: used=${used.quantity}, atHome=${atHome}, shortfall=${shortfall}`)

    if (shortfall > 0) {
      const cat = categoryOf(name)
      newShoppingList[cat]?.push({
        name,
        quantity: Math.ceil(shortfall),
        unit: used.unit
      })
    }
  }

  plan.shoppingList = newShoppingList
  return plan
}

// ---------------------------------------------------------------------------
// Prompts
// ---------------------------------------------------------------------------
function buildSystemPrompt(): string {
  return `You are a professional nutritionist and meal planning expert.

STRICT RULES:
1. Return ONLY valid JSON. No markdown, no backticks, no text outside the JSON object. Ever.
2. NEVER include an ingredient the user is allergic to or restricted from — not even in trace amounts.
3. NEVER suggest a meal that exceeds the user's max cooking time.
4. NEVER repeat the same meal name anywhere in the weekly plan — all 21 meals must have unique names.
5. Every day's totalCalories must be within 50 calories of the EXACT daily calorie target provided. This is a hard constraint.
6. Every day's totalProtein must be within 10g of the EXACT daily protein target provided. This is a hard constraint.
7. Every meal MUST contain a meaningful protein source (meat, fish, eggs, or legumes). Never a meal of only vegetables or carbs.
8. When the user has an ingredient at home, always use it before introducing new ones.
9. Every ingredient must use the object format: { "name": string, "quantity": number, "unit": string }.
10. Always use these exact units:
    - Solid foods (meat, fish, rice, pasta, cheese, oats, nuts, spinach, leafy greens): g
    - Liquids (milk, oil, sauce, broth, juice): ml
    - Spices/seasonings: g
    - ALWAYS "pieces" for: eggs, tortillas, cans, slices of bread, banana, apple, orange,
      lemon, lime, mango, avocado, peach, pear, plum, kiwi, bell pepper, carrot, onion,
      tomato, potato, sweet potato, zucchini, cucumber, broccoli (head), cauliflower (head),
      corn (cob), mushroom, garlic clove
    - NEVER use: oz, lb, cups, tbsp, tsp, kg, L, head, bulb — convert to g, ml, or pieces
11. Always use the canonical ingredient name — never a preparation variant:
    - Use "eggs" not "scrambled eggs", "fried eggs", "poached eggs"
    - Use "chicken breast" not "chicken", "grilled chicken", "shredded chicken"
    - Use "beef" not "steak", "ground beef", "beef strips"
    - Use "garlic" not "garlic clove", "garlic cloves", "minced garlic"
    - Use "rice" not "white rice", "cooked rice", "steamed rice"
    - Use "oats" not "oatmeal", "rolled oats", "instant oats"
    - Use "olive oil" not "oil", "cooking oil"
    - Use "salmon" not "salmon fillet"
    - Use "onion" not "yellow onion", "red onion", "diced onion"
12. NEVER add water to the shopping list.

CALORIE & MACRO RULES:
- Use the exact pre-calculated targets from the user message. Do not recalculate.
- Each day: breakfast + lunch + dinner must sum to within ±50 kcal and ±10g protein of the daily target.
- Hard per-meal calorie ceilings (never exceed these):
  - Breakfast: MAX 750 kcal
  - Lunch: MAX 900 kcal
  - Dinner: MAX 1050 kcal — but aim for the target split, not the ceiling
- If a meal is under on protein, increase the protein source quantity — do not leave a meal nutritionally empty.

MEAL VARIETY:
- All 21 meal names must be completely unique.
- Rotate cuisine preferences evenly across the week — do not front-load.
- Breakfast should be quick for a weekday. Weekend (Sat/Sun) can be more complex.

SHOPPING LIST:
- Only include what the user does NOT have in sufficient quantity at home.
- NEVER include water.
- Every shopping list item must be an object: { "name": string, "quantity": number, "unit": string }.`
}

function buildUserPrompt(profile: any, targets: ReturnType<typeof calculateTargets>): string {
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

  // Per-meal hard targets injected as explicit numbers
  const breakfastCals = Math.round(targets.calories * 0.27)
  const lunchCals     = Math.round(targets.calories * 0.33)
  const dinnerCals    = Math.round(targets.calories * 0.40)
  const breakfastProt = Math.round(targets.protein * 0.25)
  const lunchProt     = Math.round(targets.protein * 0.35)
  const dinnerProt    = Math.round(targets.protein * 0.40)

  return `Generate a 7-day meal plan for this user:

--- PROFILE ---
Gender: ${profile.gender}
Age: ${profile.age} years old
Weight: ${profile.weightKg} kg
Height: ${profile.heightCm} cm
Goal: ${goalLabel[profile.goal]}
Activity level: ${activityLabel[profile.activityLevel]}

--- HARD NUTRITION TARGETS (use exactly — do not recalculate) ---
Daily calories: ${targets.calories} kcal  (each day must land within ±50 kcal)
Daily protein:  ${targets.protein}g       (each day must land within ±10g)
Daily carbs:    ${targets.carbs}g
Daily fat:      ${targets.fat}g

Per-meal targets — stay as close as possible and never exceed the MAX:
- Breakfast: ~${breakfastCals} kcal / ~${breakfastProt}g protein  (MAX: 750 kcal)
- Lunch:     ~${lunchCals} kcal / ~${lunchProt}g protein  (MAX: 900 kcal)
- Dinner:    ~${dinnerCals} kcal / ~${dinnerProt}g protein  (MAX: 1050 kcal)

--- FOOD PREFERENCES ---
Cuisine preferences: ${profile.cuisinePreferences.length > 0 ? profile.cuisinePreferences.join(', ') : 'No preference — suggest a variety'}
Allergies / restrictions: ${profile.allergies.length > 0 ? profile.allergies.join(', ') : 'None'}
Max cooking time per meal: ${profile.cookingTimeMinutes} minutes

--- INGREDIENTS ALREADY AT HOME ---
${normalizedIngredients.length > 0
      ? normalizedIngredients.map((i: any) => `- ${i.quantity} ${i.unit} of ${i.name}`).join('\n')
      : 'None — assume pantry is empty'}

--- INSTRUCTIONS ---
1. Use the exact daily targets above — do not recalculate them.
2. Build a full 7-day meal plan: breakfast, lunch, dinner for Monday through Sunday.
3. All 21 meal names must be unique — no exceptions.
4. Every meal must contain a meaningful protein source.
5. Always use canonical ingredient names (e.g. "eggs" not "scrambled eggs", "chicken breast" not "chicken").
6. Prioritize using current ingredients first to minimize waste.
7. Every meal must stay within ${profile.cookingTimeMinutes} minutes.
8. Every meal must be free of: ${profile.allergies.length > 0 ? profile.allergies.join(', ') : 'N/A'}.
9. Units: g for solids, ml for liquids, pieces for countable items. Never use "head" or "bulb".
10. Return a single JSON object — no markdown, no backticks, no extra text:

{
  "dailyCalorieTarget": ${targets.calories},
  "dailyProteinTarget": ${targets.protein},
  "dailyCarbTarget": ${targets.carbs},
  "dailyFatTarget": ${targets.fat},
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
    "produce":   [{ "name": string, "quantity": number, "unit": string }],
    "proteins":  [{ "name": string, "quantity": number, "unit": string }],
    "dairy":     [{ "name": string, "quantity": number, "unit": string }],
    "grains":    [{ "name": string, "quantity": number, "unit": string }],
    "pantry":    [{ "name": string, "quantity": number, "unit": string }],
    "other":     [{ "name": string, "quantity": number, "unit": string }]
  },
  "notes": string
}

The weeklyPlan array must contain exactly 7 objects: Monday through Sunday in order.`
}

// ---------------------------------------------------------------------------
// Composable
// ---------------------------------------------------------------------------
export function useMealPlan() {
  async function generateMealPlan(profile: any): Promise<void> {
    loading.value = true
    error.value = null
    mealPlan.value = null

    const targets = calculateTargets(profile)

    for (let attempts = 0; attempts < MODELS.length; attempts++) {
      const model = MODELS[attempts]
      activeModel.value = model ?? ''

      console.log(`Trying model (${attempts + 1}/${MODELS.length}): ${model}`)

      try {
        const result = await groq.chat.completions.create({
          model: model as string,
          temperature: 0.7,
          max_tokens: 8000,
          messages: [
            { role: 'system', content: buildSystemPrompt() },
            { role: 'user', content: buildUserPrompt(profile, targets) }
          ]
        })

        const raw = result.choices[0]?.message?.content ?? ''
        const cleaned = raw.replace(/```json|```/g, '').trim()
        const parsed = JSON.parse(cleaned)

        console.log('[debug] profile.currentIngredients:', JSON.stringify(profile.currentIngredients))
        console.log('[debug] parsed weeklyPlan days:', parsed.weeklyPlan?.length)

        // Always rebuild the shopping list client-side — never trust model output
        mealPlan.value = validateAndPatchPlan(parsed, profile)
        loading.value = false
        
        // Save generated plan to Supabase
        const userId = await getUserId()
        if (userId) {
          supabase.from('data').update({ meal_plan: mealPlan.value, updated_at: new Date().toISOString() }).eq('id', userId).then(({error}) => {
            if (error) console.error("Error saving meal plan to Supabase:", error)
          })
        }
        
        return

      } catch (err: any) {
        if (err?.status === 429) {
          console.warn(`Model ${model} is rate limited, trying next...`)
          continue
        }

        if (err instanceof SyntaxError) {
          error.value = 'Failed to parse meal plan — try generating again.'
        } else {
          error.value = err instanceof Error ? err.message : 'Unknown error'
        }

        loading.value = false
        return
      }
    }

    error.value = 'All models are currently rate limited — please wait a few minutes and try again.'
    loading.value = false
  }

  async function clearPlan(): Promise<void> {
    mealPlan.value = null
    error.value = null
    
    // Clear from Supabase as well
    const userId = await getUserId()
    if (userId) {
      supabase.from('data').update({ meal_plan: null }).eq('id', userId).then()
    }
  }

  // Hydrate meal plan from Supabase on initial load if it exists
  const hydratePlan = async () => {
    if (mealPlan.value) return;
    try {
      const userId = await getUserId()
      if (!userId) return

      const { data } = await supabase.from('data').select('meal_plan').eq('id', userId).single()
      if (data && data.meal_plan) {
        mealPlan.value = data.meal_plan
      }
    } catch {
      // Ignore initial load errors
    }
  }
  
  if (!mealPlan.value) {
    hydratePlan()
  }

  return { mealPlan, loading, error, activeModel, generateMealPlan, clearPlan }
}
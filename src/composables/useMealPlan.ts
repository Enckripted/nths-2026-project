import { ref } from 'vue'
import Groq from 'groq-sdk'
import type { Profile, Ingredient, MealPlan } from '@/types/shared.types'

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

const mealPlan = ref<MealPlan | null>(null)
const loading = ref<boolean>(false)
const error = ref<string | null>(null)
const activeModel = ref<string>(MODELS[0] ?? '')

export interface MealPlanInput extends Profile {
  currentIngredients: Ingredient[]
}

// ---------------------------------------------------------------------------
// Ingredient alias map
// Normalises model variant names to canonical pantry keys so lookups match.
// ---------------------------------------------------------------------------
const INGREDIENT_ALIASES: Record<string, string> = {
  'scrambled eggs': 'eggs', 'fried eggs': 'eggs', 'poached eggs': 'eggs', 'boiled eggs': 'eggs', 'egg': 'eggs',
  'chicken': 'chicken breast', 'chicken thigh': 'chicken breast', 'grilled chicken': 'chicken breast', 'shredded chicken': 'chicken breast',
  'ground beef': 'beef', 'beef strips': 'beef', 'beef steak': 'beef', 'steak': 'beef', 'minced beef': 'beef',
  'salmon fillet': 'salmon', 'grilled salmon': 'salmon',
  'garlic clove': 'garlic', 'garlic cloves': 'garlic', 'minced garlic': 'garlic',
  'white rice': 'rice', 'brown rice': 'rice', 'cooked rice': 'rice', 'steamed rice': 'rice',
  'rolled oats': 'oats', 'instant oats': 'oats', 'oatmeal': 'oats',
  'olive oil spray': 'olive oil', 'cooking oil': 'olive oil', 'oil': 'olive oil',
  'canned tomato': 'canned tomatoes', 'tomato can': 'canned tomatoes', 'tinned tomatoes': 'canned tomatoes',
  'soy sauce mix': 'soy sauce', 'teriyaki sauce': 'soy sauce',
  'yellow onion': 'onion', 'white onion': 'onion', 'red onion': 'onion', 'diced onion': 'onion',
}

function resolveIngredientName(raw: string): string {
  const lower = raw.toLowerCase().trim()
  return INGREDIENT_ALIASES[lower] ?? lower
}

// ---------------------------------------------------------------------------
// Nutrition target calculator (Mifflin-St Jeor)
// Pre-calculated client-side so the model receives hard numbers, not a formula.
// ---------------------------------------------------------------------------
function calculateTargets(profile: MealPlanInput): {
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

  const weightKg = profile.weightLbs * 0.453592
  const heightCm = (profile.heightFt * 12 + profile.heightIn) * 2.54

  const base =
    profile.gender.toLowerCase() === 'male'
      ? 10 * weightKg + 6.25 * heightCm - 5 * profile.age + 5
      : 10 * weightKg + 6.25 * heightCm - 5 * profile.age - 161

  const tdee = base * (activityMultiplier[profile.activityLevel] ?? 1.55)

  const goalAdjustment: Record<string, number> = { cut: -400, bulk: 400, maintain: 0 }
  const calories = Math.round(tdee + (goalAdjustment[profile.desiredWeightDirection] ?? 0))

  const proteinPerKg: Record<string, number> = { cut: 2.2, bulk: 1.8, maintain: 1.6 }
  const protein = Math.round((proteinPerKg[profile.desiredWeightDirection] ?? 1.6) * weightKg)

  const fat = Math.round((calories * 0.25) / 9)
  const carbs = Math.round((calories - protein * 4 - fat * 9) / 4)

  return { calories, protein, carbs, fat }
}

// ---------------------------------------------------------------------------
// Unit normalizer — converts any incoming unit to g / ml / pieces
// ---------------------------------------------------------------------------
function normalizeIngredient(i: Record<string, any>): { name: string; quantity: number; unit: string } {
  let quantity = Number(i.quantity) || 1
  let unit = String(i.unit || 'pieces').trim()

  if (unit === 'kg')                     { quantity = quantity * 1000;              unit = 'g'      }
  else if (unit === 'L' || unit === 'l') { quantity = quantity * 1000;              unit = 'ml'     }
  else if (unit === 'lb')                { quantity = Math.round(quantity * 453.6); unit = 'g'      }
  else if (unit === 'oz')                { quantity = Math.round(quantity * 28.35); unit = 'g'      }
  else if (unit === 'fl_oz')             { quantity = Math.round(quantity * 29.57); unit = 'ml'     }
  else if (unit === 'cup')               { quantity = Math.round(quantity * 240);   unit = 'ml'     }
  else if (unit === 'tbsp')              { quantity = Math.round(quantity * 15);    unit = 'ml'     }
  else if (unit === 'tsp')               { quantity = Math.round(quantity * 5);     unit = 'ml'     }
  else if (unit === 'bulb')              { quantity = quantity * 10;                unit = 'pieces' }
  else if (unit === 'cans' || unit === 'can') { unit = 'pieces' }
  else if (!['g', 'ml', 'pieces'].includes(unit)) { quantity = 1; unit = 'pieces' }

  const name = resolveIngredientName(String(i.name || ''))
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
10. Always use exact units: g for solids, ml for liquids, pieces for countable items.
11. Always use the canonical ingredient name ("eggs" not "scrambled eggs", "chicken breast" not "chicken").
12. NEVER add water to the shopping list.`
}

function buildUserPrompt(profile: MealPlanInput, targets: ReturnType<typeof calculateTargets>): string {
  const activityLabel: Record<string, string> = {
    sedentary: 'Sedentary', light: 'Light', moderate: 'Moderate', active: 'Active', very_active: 'Very Active'
  }

  const weightKg = Math.round(profile.weightLbs * 0.453592)
  const heightCm = Math.round((profile.heightFt * 12 + profile.heightIn) * 2.54)
  const goalStr = String(profile.desiredWeightDirection)

  const normalizedIngredients = profile.currentIngredients.map(normalizeIngredient)

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
Weight: ${weightKg} kg
Height: ${heightCm} cm
Goal: ${goalStr}
Activity level: ${activityLabel[profile.activityLevel] ?? profile.activityLevel}

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
Cuisines: ${profile.cuisineFavorites?.length ? profile.cuisineFavorites.join(', ') : 'Variety'}
Allergies: ${profile.allergies?.length ? profile.allergies.join(', ') : 'None'}
Max cooking time: ${profile.minutesForCooking || 30} minutes

--- INGREDIENTS AT HOME ---
${normalizedIngredients.length > 0
  ? normalizedIngredients.map((i: any) => `- ${i.quantity} ${i.unit} of ${i.name}`).join('\n')
  : 'None — assume pantry is empty'}

Return a single JSON matching the structure:
{
  "dailyCalorieTarget": number,
  "dailyProteinTarget": number,
  "dailyCarbTarget": number,
  "dailyFatTarget": number,
  "weeklyPlan": [
    {
       "day": "Monday",
       "breakfast": { "name": "...", "ingredients": [ ... ], "usesCurrentIngredients": [ ... ], "instructions": [ ... ] },
       "lunch": { ... },
       "dinner": { ... },
       "totalCalories": number, "totalProtein": number, "totalCarbs": number, "totalFat": number
    }
  ],
  "shoppingList": {
    "produce":   [{ "name": "...", "quantity": ..., "unit": "..." }],
    "proteins":  [],
    "dairy":     [],
    "grains":    [],
    "pantry":    [],
    "other":     []
  },
  "notes": "..."
}`
}

export function useMealPlan() {
  async function generateMealPlan(profile: MealPlanInput): Promise<void> {
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

        mealPlan.value = validateAndPatchPlan(parsed, profile) as MealPlan
        loading.value = false
        return

      } catch (err: unknown) {
        if (typeof err === 'object' && err !== null && 'status' in err) {
          if ((err as Record<string, unknown>).status === 429) {
            console.warn(`Model ${model} is rate limited, trying next...`)
            continue
          }
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

  function clearPlan(): void {
    mealPlan.value = null
    error.value = null
  }

  return { mealPlan, loading, error, activeModel, generateMealPlan, clearPlan }
}

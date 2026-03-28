<script setup lang="ts">
import { useSelectedMeal } from '@/composables/useSelectedMeal'

const { selectedMeal, clearMeal } = useSelectedMeal()

function onBackdropClick(e: MouseEvent): void {
  if ((e.target as HTMLElement).classList.contains('modal-backdrop')) {
    clearMeal()
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="selectedMeal"
        class="modal-backdrop"
        @click="onBackdropClick"
      >
        <div class="modal-panel">

          <!-- Header -->
          <div class="modal-header">
            <div class="modal-title-block">
              <p v-if="selectedMeal.cuisine" class="modal-cuisine">{{ selectedMeal.cuisine }}</p>
              <h2 class="modal-title">{{ selectedMeal.name }}</h2>
            </div>
            <button class="modal-close" @click="clearMeal">✕</button>
          </div>

          <div class="modal-body">

            <!-- Macro strip -->
            <div class="macro-grid">
              <div class="macro-card macro-cal">
                <p class="macro-label">Calories</p>
                <p class="macro-value">{{ selectedMeal.calories ?? '—' }}</p>
                <p class="macro-unit">kcal</p>
              </div>
              <div class="macro-card macro-prot">
                <p class="macro-label">Protein</p>
                <p class="macro-value">{{ selectedMeal.protein ?? '—' }}</p>
                <p class="macro-unit">g</p>
              </div>
              <div class="macro-card macro-carb">
                <p class="macro-label">Carbs</p>
                <p class="macro-value">{{ selectedMeal.carbs ?? '—' }}</p>
                <p class="macro-unit">g</p>
              </div>
              <div class="macro-card macro-fat">
                <p class="macro-label">Fat</p>
                <p class="macro-value">{{ selectedMeal.fat ?? '—' }}</p>
                <p class="macro-unit">g</p>
              </div>
            </div>

            <!-- Prep time -->
            <div v-if="selectedMeal.prepTimeMinutes" class="prep-row">
              <span class="prep-icon">&#x23F1;</span>
              <span class="prep-badge">{{ selectedMeal.prepTimeMinutes }} min prep</span>
            </div>

            <!-- Ingredients -->
            <div v-if="selectedMeal.ingredients && selectedMeal.ingredients.length" class="section">
              <h3 class="section-heading">
                <span class="section-pip pip-green"></span>
                Ingredients
              </h3>
              <ul class="ingredient-list">
                <li
                  v-for="(ing, i) in selectedMeal.ingredients"
                  :key="i"
                  :class="[
                    'ingredient-item',
                    selectedMeal.usesCurrentIngredients &&
                    selectedMeal.usesCurrentIngredients.some(u => u.name === ing.name)
                      ? 'ingredient-at-home'
                      : 'ingredient-new'
                  ]"
                >
                  <span class="ingredient-name">{{ ing.name }}</span>
                  <span class="ingredient-qty">
                    {{ ing.quantity }} {{ ing.unit }}
                    <span
                      v-if="selectedMeal.usesCurrentIngredients &&
                            selectedMeal.usesCurrentIngredients.some(u => u.name === ing.name)"
                      class="at-home-badge"
                    >at home</span>
                  </span>
                </li>
              </ul>
            </div>

            <!-- Instructions -->
            <div v-if="selectedMeal.instructions && selectedMeal.instructions.length" class="section">
              <h3 class="section-heading">
                <span class="section-pip pip-amber"></span>
                Instructions
              </h3>
              <ol class="instruction-list">
                <li
                  v-for="(step, i) in selectedMeal.instructions"
                  :key="i"
                  class="instruction-item"
                >
                  <span class="step-num">{{ i + 1 }}</span>
                  <p class="step-text">{{ step }}</p>
                </li>
              </ol>
            </div>

          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
}

.modal-panel {
  position: relative;
  width: 100%;
  max-width: 32rem;
  max-height: 90vh;
  overflow-y: auto;
  background: #ffffff;
  border: 4px solid #0f172a;
  border-radius: 1rem;
  box-shadow: 8px 8px 0px rgba(15, 23, 42, 1);
}

/* Header */
.modal-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: #ffffff;
  border-bottom: 4px solid #0f172a;
  padding: 1rem 1.25rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}
.modal-title-block { flex: 1; min-width: 0; }
.modal-cuisine {
  font-family: 'Tomorrow', sans-serif;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #059669;
  margin: 0 0 4px;
}
.modal-title {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 900;
  font-size: 1.1rem;
  color: #0f172a;
  line-height: 1.3;
  margin: 0;
}
.modal-close {
  flex-shrink: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #0f172a;
  border-radius: 0.5rem;
  background: transparent;
  font-weight: 900;
  font-size: 0.8rem;
  cursor: pointer;
  color: #0f172a;
  transition: background 0.15s;
}
.modal-close:hover { background: #f1f5f9; }

/* Body */
.modal-body {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* Macros */
.macro-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
}
.macro-card {
  border-radius: 0.75rem;
  padding: 0.6rem 0.5rem;
  text-align: center;
  border: 1px solid transparent;
}
.macro-cal  { background: #f0fdf4; border-color: #bbf7d0; }
.macro-prot { background: #f5f3ff; border-color: #ddd6fe; }
.macro-carb { background: #f0f9ff; border-color: #bae6fd; }
.macro-fat  { background: #fff1f2; border-color: #fecdd3; }

.macro-label {
  font-family: 'Tomorrow', sans-serif;
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin: 0 0 2px;
}
.macro-cal  .macro-label { color: #059669; }
.macro-prot .macro-label { color: #7c3aed; }
.macro-carb .macro-label { color: #0284c7; }
.macro-fat  .macro-label { color: #e11d48; }

.macro-value {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 900;
  font-size: 1.1rem;
  color: #0f172a;
  line-height: 1;
  margin: 0;
}
.macro-unit {
  font-family: 'Tomorrow', sans-serif;
  font-size: 9px;
  color: #94a3b8;
  margin: 2px 0 0;
}

/* Prep */
.prep-row { display: flex; align-items: center; gap: 0.5rem; }
.prep-icon { font-size: 1rem; }
.prep-badge {
  font-family: 'Tomorrow', sans-serif;
  font-size: 11px;
  font-weight: 700;
  color: #92400e;
  background: #fef3c7;
  border: 1px solid #fcd34d;
  padding: 3px 10px;
  border-radius: 999px;
}

/* Sections */
.section { display: flex; flex-direction: column; gap: 0.6rem; }
.section-heading {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 900;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
}
.section-pip {
  display: inline-block;
  width: 6px;
  height: 16px;
  border-radius: 2px;
  flex-shrink: 0;
}
.pip-green { background: #4ade80; border: 1px solid #16a34a; }
.pip-amber { background: #fbbf24; border: 1px solid #d97706; }

/* Ingredients */
.ingredient-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 4px; }
.ingredient-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid transparent;
}
.ingredient-at-home { background: #f0fdf4; border-color: #bbf7d0; }
.ingredient-new     { background: #f8fafc; border-color: #e2e8f0; }
.ingredient-name {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  color: #1e293b;
  text-transform: capitalize;
}
.ingredient-qty {
  font-family: 'Tomorrow', sans-serif;
  font-weight: 700;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 6px;
}
.at-home-badge {
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #059669;
}

/* Instructions */
.instruction-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
.instruction-item { display: flex; gap: 10px; align-items: flex-start; }
.step-num {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #0f172a;
  color: #ffffff;
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 900;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2px;
}
.step-text {
  font-family: 'Tomorrow', sans-serif;
  font-size: 12px;
  color: #475569;
  line-height: 1.6;
  margin: 0;
}

/* Transition */
.modal-enter-active { transition: opacity 0.2s ease; }
.modal-leave-active { transition: opacity 0.15s ease; }
.modal-enter-from,
.modal-leave-to { opacity: 0; }

.modal-enter-active .modal-panel {
  animation: modal-pop 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.modal-leave-active .modal-panel {
  animation: modal-pop 0.15s ease reverse;
}

@keyframes modal-pop {
  from { transform: scale(0.92) translateY(12px); opacity: 0; }
  to   { transform: scale(1) translateY(0); opacity: 1; }
}
</style>
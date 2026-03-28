<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  label: string
  placeholder: string
}>()
const model = defineModel<string[]>({
  required: true,
})

const newItem = ref('')

const addItem = () => {
  const trimmed = newItem.value.trim()
  if (trimmed && !model.value.includes(trimmed)) {
    console.log('before: ' + model.value)
    model.value.push(trimmed)
    console.log('after: ' + model.value)
    newItem.value = ''
  }
}

const removeItem = (index: number) => {
  console.log('removed')
  model.value.splice(index, 1)
}
</script>

<template>
  <div class="space-y-2">
    <label class="block text-sm font-medium text-gray-700">{{ label }}</label>
    <div
      class="flex flex-wrap gap-2 p-2 border border-gray-300 rounded-md min-h-[40px] focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500"
    >
      <span
        v-for="(item, index) in model"
        :key="index"
        class="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
      >
        {{ item }}
        <button
          @click="removeItem(index)"
          class="ml-1 text-blue-600 hover:text-blue-800 focus:outline-none"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>
      </span>
      <input
        v-model="newItem"
        type="text"
        :placeholder="placeholder"
        @keydown.enter.prevent="addItem"
        class="flex-1 min-w-[120px] outline-none bg-transparent"
      />
    </div>
  </div>
</template>

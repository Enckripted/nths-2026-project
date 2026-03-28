<script setup lang="ts">
import { ref } from 'vue'
import { useGemini } from '@/composables/useGemini'

const { response, loading, error, sendMessage } = useGemini()
const prompt = ref<string>('')

async function handleSend(): Promise<void> {
  if (!prompt.value.trim()) return
  await sendMessage(prompt.value)
  prompt.value = ''
}
</script>

<template>
  <div>
    <input v-model="prompt" type="text" placeholder="Ask Gemini..." />
    <button @click="handleSend" :disabled="loading">
      {{ loading ? 'Thinking...' : 'Send' }}
    </button>
    <p v-if="error" style="color: red">{{ error }}</p>
    <p v-if="response">{{ response }}</p>
  </div>
</template>


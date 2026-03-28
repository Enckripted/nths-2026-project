import { ref } from 'vue'
import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY as string,
  dangerouslyAllowBrowser: true
})

export function useGemini() {
  const response = ref<string>('')
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)
  const chatHistory = ref<{ role: 'user' | 'assistant', content: string }[]>([])

  async function sendMessage(prompt: string): Promise<void> {
    loading.value = true
    error.value = null
    try {
      const result = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }]
      })
      response.value = result.choices[0]?.message?.content ?? ''
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error'
    } finally {
      loading.value = false
    }
  }

  async function sendChatMessage(userMessage: string): Promise<void> {
    loading.value = true
    error.value = null
    try {
      chatHistory.value.push({ role: 'user', content: userMessage })

      const result = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: chatHistory.value
      })

      const aiResponse = result.choices[0]?.message?.content ?? ''
      chatHistory.value.push({ role: 'assistant', content: aiResponse })
      response.value = aiResponse
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error'
    } finally {
      loading.value = false
    }
  }

  function clearChat(): void {
    chatHistory.value = []
    response.value = ''
  }

  return { response, loading, error, chatHistory, sendMessage, sendChatMessage, clearChat }
}
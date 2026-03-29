import { ref } from 'vue'
import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY ?? '',
  dangerouslyAllowBrowser: true
})

// Shared state — one chef conversation per session
const response = ref<string>('')
const loading = ref<boolean>(false)
const error = ref<string | null>(null)
const chatHistory = ref<{ role: 'user' | 'assistant'; content: string }[]>([])

const CHEF_SYSTEM_PROMPT = `You are Chef Claude, a world-class master chef and culinary expert with decades of experience in Michelin-starred kitchens across Italy, Mexico, and Japan.

Your role is to help users:
- Expand on meal plan recipes with detailed techniques, tips, and variations
- Suggest ingredient substitutions and flavour enhancements
- Explain cooking techniques in clear, approachable language
- Share cultural context and history behind dishes
- Answer any cooking questions with warmth and expertise

Keep responses focused, practical, and enthusiastic. Use culinary terminology but always explain it. Format longer responses with clear sections. Keep replies concise unless the user asks for more depth.`

export function useGemini() {
  async function sendMessage(userMessage: string): Promise<void> {
    loading.value = true
    error.value = null

    try {
      chatHistory.value.push({ role: 'user', content: userMessage })

      const result = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 1024,
        messages: [
          { role: 'system', content: CHEF_SYSTEM_PROMPT },
          ...chatHistory.value
        ]
      })

      const aiResponse = result.choices[0]?.message?.content ?? ''
      chatHistory.value.push({ role: 'assistant', content: aiResponse })
      response.value = aiResponse

    } catch (err) {
      // Remove the user message we just pushed if the call failed
      chatHistory.value.pop()
      error.value = err instanceof Error ? err.message : 'Unknown error'
    } finally {
      loading.value = false
    }
  }

  // Convenience: ask about a specific meal from the plan
  async function askAboutMeal(mealName: string, context?: string): Promise<void> {
    const prompt = context
      ? `Tell me more about "${mealName}". Here are the details: ${context}. How can I elevate this dish?`
      : `Tell me more about "${mealName}". Give me tips, techniques, and ways to make it exceptional.`
    await sendMessage(prompt)
  }

  function clearChat(): void {
    chatHistory.value = []
    response.value = ''
    error.value = null
  }

  return { response, loading, error, chatHistory, sendMessage, askAboutMeal, clearChat }
}
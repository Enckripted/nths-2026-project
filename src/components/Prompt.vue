<script setup lang="ts">
import { ref, nextTick, watch } from 'vue'
import { useGemini } from '@/composables/useGemini'

const { chatHistory, loading, error, sendMessage, clearChat } = useGemini()

const prompt = ref<string>('')
const chatEl = ref<HTMLElement | null>(null)

const SUGGESTED_PROMPTS = [
  'How do I make perfect crispy rice?',
  'Best way to marinate chicken breast?',
  'Tips for a quick weeknight stir-fry?',
  'How do I know when salmon is cooked?',
  'What can I make with eggs and oats?',
]

async function handleSend(): Promise<void> {
  const msg = prompt.value.trim()
  if (!msg || loading.value) return
  prompt.value = ''
  await sendMessage(msg)
}

function handleKeydown(e: KeyboardEvent): void {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}

async function useSuggestion(s: string): Promise<void> {
  prompt.value = s
  await handleSend()
}

watch(chatHistory, async () => {
  await nextTick()
  if (chatEl.value) chatEl.value.scrollTop = chatEl.value.scrollHeight
}, { deep: true })

function formatResponse(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br/>')
}
</script>

<template>
  <section class="master-chef-section border-t-4 border-slate-900 bg-[#1a1a2e]">
    <!-- Header -->
    <div class="border-b-4 border-slate-900 bg-[#16213e] px-8 lg:px-14 py-4 flex items-center justify-between">
      <div class="flex items-center gap-4">
        <div class="w-10 h-10 bg-amber-300 border-2 border-slate-900 rounded-xl shadow-[3px_3px_0px_rgba(15,23,42,1)] flex items-center justify-center text-xl">
          👨‍🍳
        </div>
        <div>
          <h2 class="font-spaceGrotesk font-black text-stone-50 uppercase tracking-widest text-base leading-none">
            Master Chef
          </h2>
          <p class="font-tomorrow text-[10px] font-bold text-amber-300 uppercase tracking-wider mt-0.5 opacity-80">
            AI Culinary Expert · Ask anything about your meals
          </p>
        </div>
      </div>
      <button
        v-if="chatHistory.length > 0"
        @click="clearChat"
        class="font-spaceGrotesk font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-500 px-3 py-1.5 rounded-lg transition-all"
      >
        Clear chat
      </button>
    </div>

    <div class="max-w-[1600px] mx-auto px-8 lg:px-14 py-6 flex flex-col gap-5">

      <!-- Empty state -->
      <div v-if="chatHistory.length === 0" class="flex flex-col items-center gap-6 py-8">
        <div class="text-center">
          <p class="font-spaceGrotesk font-black text-stone-300 text-lg uppercase tracking-tight">
            What would you like to cook?
          </p>
          <p class="font-tomorrow text-slate-500 text-xs mt-1 font-bold uppercase tracking-widest">
            Ask about techniques, substitutions, or how to elevate any dish
          </p>
        </div>
        <div class="flex flex-wrap gap-2 justify-center max-w-2xl">
          <button
            v-for="s in SUGGESTED_PROMPTS"
            :key="s"
            @click="useSuggestion(s)"
            :disabled="loading"
            class="font-tomorrow text-xs font-bold text-amber-200 bg-amber-300/10 border border-amber-500/30 hover:bg-amber-300/20 hover:border-amber-400 px-4 py-2 rounded-full transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {{ s }}
          </button>
        </div>
      </div>

      <!-- Chat messages -->
      <div
        v-else
        ref="chatEl"
        class="chat-scroll flex flex-col gap-4 max-h-[420px] overflow-y-auto pr-1"
      >
        <template v-for="(msg, i) in chatHistory" :key="i">
          <div v-if="msg.role === 'user'" class="flex justify-end">
            <div class="max-w-[70%] bg-amber-300 border-2 border-slate-900 rounded-2xl rounded-tr-sm px-4 py-3 shadow-[3px_3px_0px_rgba(15,23,42,1)]">
              <p class="font-spaceGrotesk font-bold text-slate-900 text-sm">{{ msg.content }}</p>
            </div>
          </div>
          <div v-else class="flex justify-start gap-3">
            <div class="w-8 h-8 shrink-0 bg-emerald-400 border-2 border-slate-900 rounded-xl flex items-center justify-center text-sm shadow-[2px_2px_0px_rgba(15,23,42,1)] mt-1">
              👨‍🍳
            </div>
            <div class="max-w-[80%] bg-[#0f3460] border-2 border-slate-700 rounded-2xl rounded-tl-sm px-4 py-3">
              <p class="font-tomorrow text-stone-200 text-sm leading-relaxed chef-text" v-html="formatResponse(msg.content)"></p>
            </div>
          </div>
        </template>

        <!-- Typing indicator -->
        <div v-if="loading" class="flex justify-start gap-3">
          <div class="w-8 h-8 shrink-0 bg-emerald-400 border-2 border-slate-900 rounded-xl flex items-center justify-center text-sm shadow-[2px_2px_0px_rgba(15,23,42,1)]">
            👨‍🍳
          </div>
          <div class="bg-[#0f3460] border-2 border-slate-700 rounded-2xl rounded-tl-sm px-5 py-4">
            <div class="flex gap-1.5 items-center">
              <span class="typing-dot w-2 h-2 bg-amber-300 rounded-full"></span>
              <span class="typing-dot w-2 h-2 bg-amber-300 rounded-full" style="animation-delay:0.15s"></span>
              <span class="typing-dot w-2 h-2 bg-amber-300 rounded-full" style="animation-delay:0.3s"></span>
            </div>
          </div>
        </div>
      </div>

      <!-- Error -->
      <div v-if="error" class="bg-rose-950 border-2 border-rose-500 rounded-xl px-4 py-3">
        <p class="font-tomorrow text-rose-300 text-xs font-bold uppercase tracking-widest">{{ error }}</p>
      </div>

      <!-- Input bar -->
      <div class="flex gap-3 items-end">
        <div class="flex-1 relative">
          <textarea
            v-model="prompt"
            @keydown="handleKeydown"
            :disabled="loading"
            placeholder="Ask Chef Claude anything about cooking, recipes, or techniques…"
            rows="2"
            class="w-full bg-[#0f3460] border-2 border-slate-600 focus:border-amber-400 rounded-xl px-4 py-3 font-tomorrow text-sm text-stone-200 placeholder-slate-500 resize-none outline-none transition-colors disabled:opacity-50"
          ></textarea>
          <span class="absolute bottom-2.5 right-3 font-tomorrow text-[9px] text-slate-600 uppercase tracking-widest pointer-events-none">Enter to send</span>
        </div>
        <button
          @click="handleSend"
          :disabled="loading || !prompt.trim()"
          class="shrink-0 w-12 h-12 bg-amber-300 hover:bg-amber-200 disabled:bg-slate-700 disabled:text-slate-500 border-2 border-slate-900 disabled:border-slate-600 rounded-xl shadow-[3px_3px_0px_rgba(15,23,42,0.8)] hover:shadow-[1px_1px_0px_rgba(15,23,42,0.8)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center justify-center text-xl disabled:cursor-not-allowed"
        >
          <span v-if="loading" class="text-base animate-spin">⟳</span>
          <span v-else class="text-slate-900 font-black">↑</span>
        </button>
      </div>

      <!-- Quick chips after first message -->
      <div v-if="chatHistory.length > 0 && !loading" class="flex flex-wrap gap-2">
        <button
          v-for="s in SUGGESTED_PROMPTS.slice(0, 3)"
          :key="s"
          @click="useSuggestion(s)"
          :disabled="loading"
          class="font-tomorrow text-[10px] font-bold text-slate-400 hover:text-amber-200 border border-slate-700 hover:border-amber-500/40 px-3 py-1.5 rounded-full transition-all disabled:opacity-40"
        >
          {{ s }}
        </button>
      </div>

    </div>
  </section>
</template>

<style scoped>
.chat-scroll {
  scrollbar-width: thin;
  scrollbar-color: #334155 transparent;
}
.chat-scroll::-webkit-scrollbar { width: 4px; }
.chat-scroll::-webkit-scrollbar-track { background: transparent; }
.chat-scroll::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }

.typing-dot {
  animation: bounce 0.6s ease-in-out infinite;
}
@keyframes bounce {
  0%, 100% { transform: translateY(0); opacity: 0.4; }
  50%       { transform: translateY(-4px); opacity: 1; }
}

.chef-text :deep(strong) { color: #fcd34d; font-weight: 700; }
.chef-text :deep(p) { margin-bottom: 0.5rem; }
.chef-text :deep(p:last-child) { margin-bottom: 0; }
</style>
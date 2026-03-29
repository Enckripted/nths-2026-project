<script setup lang="ts">
import { ref } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'vue-router'

const router = useRouter()

const isLogin = ref(true)
const email = ref('')
const password = ref('')
const errorMessage = ref<string | null>(null)
const loading = ref(false)
const successMessage = ref<string | null>(null)

const toggleMode = () => {
  isLogin.value = !isLogin.value
  errorMessage.value = null
  successMessage.value = null
}

const handleSubmit = async () => {
  errorMessage.value = null
  successMessage.value = null
  loading.value = true

  try {
    if (isLogin.value) {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.value,
        password: password.value,
      })
      if (error) throw error
      // Automatically routed or redirect
      router.push('/dashboard')
    } else {
      const { error, data } = await supabase.auth.signUp({
        email: email.value,
        password: password.value,
      })
      if (error) throw error
      
      if (data.session) {
          router.push('/survey')
      } else {
          successMessage.value = 'Sign up successful! Please check your email to confirm your account.'
      }
    }
  } catch (e: unknown) {
    errorMessage.value = e instanceof Error ? e.message : 'An error occurred during authentication.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-6 py-12">
    <div class="max-w-md w-full organic-card p-8 relative overflow-hidden">
      <div 
        class="absolute -top-12 -right-12 w-32 h-32 bg-emerald-200 rounded-full blur-3xl opacity-50 pointer-events-none"
      ></div>

      <div class="text-center mb-8 relative z-10">
        <h1 class="text-3xl font-spaceGrotesk font-black tracking-tight text-slate-900 mb-2">
          {{ isLogin ? 'Welcome Back' : 'Join EASEY PREP' }}
        </h1>
        <p class="text-slate-500 text-sm font-medium">
          {{ isLogin ? 'Sign in to access your meal plan.' : 'Create an account to save your progress.' }}
        </p>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-5 relative z-10">
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
            >Email</label
          >
          <input
            v-model="email"
            type="email"
            required
            placeholder="you@example.com"
            class="w-full bg-slate-50 border-2 border-slate-900 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-200 transition-all placeholder:text-slate-400"
          />
        </div>

        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
            >Password</label
          >
          <input
            v-model="password"
            type="password"
            required
            placeholder="••••••••"
            class="w-full bg-slate-50 border-2 border-slate-900 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-200 transition-all placeholder:text-slate-400"
          />
        </div>

        <div v-if="errorMessage" class="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
          <span class="text-lg">⚠️</span>
          {{ errorMessage }}
        </div>
        
        <div v-if="successMessage" class="bg-emerald-50 border-2 border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
          <span class="text-lg">✅</span>
          {{ successMessage }}
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full brutalist-btn bg-emerald-400 hover:bg-emerald-300 px-6 py-3.5 rounded-xl font-spaceGrotesk font-black uppercase tracking-wider text-sm transition-all focus:ring-4 focus:ring-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
        >
          <span v-if="loading">Processing...</span>
          <span v-else>{{ isLogin ? 'Sign In' : 'Create Account' }}</span>
        </button>
      </form>

      <div class="mt-8 text-center relative z-10 border-t-2 border-slate-100 pt-6">
        <p class="text-sm font-medium text-slate-600">
          {{ isLogin ? "Don't have an account?" : 'Already have an account?' }}
          <button
            @click="toggleMode"
            class="font-bold text-slate-900 hover:text-emerald-600 transition-colors ml-1 underline decoration-2 decoration-emerald-300 underline-offset-4"
          >
            {{ isLogin ? 'Sign up' : 'Log in' }}
          </button>
        </p>
      </div>
    </div>
  </div>
</template>

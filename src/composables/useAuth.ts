import { ref } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import type { User, Session } from '@supabase/supabase-js'
import router from '@/router'

const user = ref<User | null>(null)
const session = ref<Session | null>(null)
const initialized = ref(false)
const isLoggingOut = ref(false)

export default function useAuth() {
  const initializeAuth = async () => {
    if (initialized.value) return

    const { data: { session: existingSession } } = await supabase.auth.getSession()
    session.value = existingSession
    user.value = existingSession?.user ?? null
    initialized.value = true

    supabase.auth.onAuthStateChange(async (_event, newSession) => {
      session.value = newSession
      user.value = newSession?.user ?? null

      // Don't redirect during an intentional logout — the hard reload handles it
      if (isLoggingOut.value) return

      const isAuthRoute = router.currentRoute.value.path === '/auth'
      if (!newSession && !isAuthRoute && router.currentRoute.value.path !== '/') {
        await router.push('/auth')
      }
    })
  }

  const logout = async () => {
    isLoggingOut.value = true
    try {
      await supabase.auth.signOut()
    } finally {
      localStorage.removeItem('data')
      // Hard reload to wipe ALL in-memory Vue state (meal plan, profile, user, etc.)
      // Using replace() so the back button doesn't return to the protected page
      window.location.replace('/')
    }
  }

  return {
    user,
    session,
    initialized,
    initializeAuth,
    logout
  }
}

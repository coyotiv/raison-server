// src/stores/auth.ts
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

type User = {
  id: string
  email: string
  name?: string
  roles?: string[]
}

type LoginCredentials = { email: string; password: string }

const STORAGE_KEY = 'auth.v1'

export const useAuthStore = defineStore('auth', () => {
  // state
  const token = ref<string | null>(null)
  const user = ref<User | null>(null)
  const loading = ref(false)

  // derived
  const isLoggedIn = computed(() => !!token.value)
  const isLoading = computed(() => loading.value)

  // persist / restore
  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: token.value, user: user.value }))
  }

  function restore() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as { token: string | null; user: User | null }
      token.value = parsed.token ?? null
      user.value = parsed.user ?? null
    } catch {
      // ignore corrupted storage
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  function clear() {
    token.value = null
    user.value = null
    localStorage.removeItem(STORAGE_KEY)
  }

  // actions
  async function login(credentials: LoginCredentials) {
    loading.value = true
    try {
      // DEV MOCK (works without backend): accept any non-empty creds
      // ── Replace with your real call below.
      if (!credentials.email || !credentials.password) {
        throw new Error('Missing credentials')
      }

      // 👉 REAL CALL (uncomment and adapt)
      // const res = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(credentials),
      // })
      // if (!res.ok) throw new Error('Login failed')
      // const data = await res.json() as { token: string; user: User }

      // DEV MOCK RESPONSE
      const data = {
        token: 'dev-token-' + Math.random().toString(36).slice(2),
        user: { id: 'u1', email: credentials.email, name: 'Dev User', roles: ['user'] } as User,
      }

      token.value = data.token
      user.value = data.user
      persist()
      return { ok: true as const }
    } catch (err: any) {
      clear()
      return { ok: false as const, error: err?.message ?? 'Login error' }
    } finally {
      loading.value = false
    }
  }

  function logout() {
    clear()
  }

  function hasRole(role: string) {
    return !!user.value?.roles?.includes(role)
  }

  // call once on app start
  restore()

  return {
    // state
    token,
    user,
    // derived
    isLoggedIn,
    isLoading,
    // actions
    login,
    logout,
    hasRole,
    // utils
    restore,
    persist,
    clear,
  }
})

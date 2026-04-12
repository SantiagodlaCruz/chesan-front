import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, ApiResponse } from '~/types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)

  const isLoggedIn = computed(() => !!token.value)

  async function login(credentials: Record<string, string>) {
    try {
      const config = useRuntimeConfig()
      const backendURL = config.public.apiBaseUrl || 'http://127.0.0.1:8000'
      
      const response = await $fetch<{ access_token: string, user: User }>(`${backendURL}/api/auth/login`, {
        method: 'POST',
        body: credentials
      })

      token.value = response.access_token
      user.value = response.user
      
      return navigateTo('/')
    } catch (error: unknown) {
      console.error('Login error', error)
      const err = error as { data?: { message?: string } }
      throw new Error(err.data?.message || 'Error en el servidor.')
    }
  }

  async function logout() {
    try {
      if (token.value) {
        const config = useRuntimeConfig()
        const backendURL = config.public.apiBaseUrl || 'http://127.0.0.1:8000'
        
        await $fetch(`${backendURL}/api/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token.value}` }
        })
      }
    } catch (error) {
      console.error('Logout error', error)
    } finally {
      user.value = null
      token.value = null
      // Clear all items manually just in case
      const authCookie = useCookie('auth')
      authCookie.value = null
      return navigateTo('/login')
    }
  }

  return { user, token, isLoggedIn, login, logout }
}, {
  persist: true
})

export const useAuth = () => useAuthStore()

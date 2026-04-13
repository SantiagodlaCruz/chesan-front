import { defineStore } from 'pinia'
import { computed } from 'vue'
import type { User } from '~/types'

export const useAuthStore = defineStore('auth', () => {
  const config = useRuntimeConfig()
  const backendURL = config.public.apiBaseUrl || 'http://127.0.0.1:8000'
  const cookieMaxAge = 60 * 60 * 24 * 7 // 7 días

  // useCookie es síncrono y compatible con SSR en Nuxt
  const token = useCookie<string | null>('auth-token', {
    maxAge: cookieMaxAge,
    sameSite: 'lax',
    default: () => null,
  })

  const user = useCookie<User | null>('auth-user', {
    maxAge: cookieMaxAge,
    sameSite: 'lax',
    default: () => null,
  })

  const isLoggedIn = computed(() => !!token.value)

  async function login(credentials: Record<string, string>) {
    const response = await $fetch<{
      success: boolean
      message: string
      data: { access_token: string; user: User }
    }>(`${backendURL}/api/auth/login`, {
      method: 'POST',
      body: credentials,
    })

    token.value = response.data.access_token
    user.value = response.data.user
  }

  async function logout() {
    try {
      if (token.value) {
        await $fetch(`${backendURL}/api/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token.value}` },
        })
      }
    } catch (error) {
      console.error('Logout error', error)
    } finally {
      token.value = null
      user.value = null
    }
  }

  return { user, token, isLoggedIn, login, logout }
})

export const useAuth = () => useAuthStore()

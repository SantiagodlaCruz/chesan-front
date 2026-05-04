import { defineStore } from 'pinia'
import { computed } from 'vue'
import type { User } from '~/types'

export const useAuthStore = defineStore('auth', () => {
  const api = useApi()
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

  /**
   * Verifica si el usuario tiene un permiso específico
   */
  function can(permission: string): boolean {
    if (user.value?.roles?.includes('super_admin')) return true
    return user.value?.permissions?.includes(permission) || false
  }

  /**
   * Verifica si el usuario tiene un rol específico
   */
  function hasRole(role: string): boolean {
    return user.value?.roles?.includes(role) || false
  }

  async function login(credentials: Record<string, string>) {
    const response = await api.post<{
      success: boolean
      message: string
      data: { access_token: string; user: User }
    }>('/api/auth/login', credentials)

    token.value = response.data.access_token
    user.value = response.data.user
  }

  async function logout() {
    try {
      if (token.value) {
        await api.post('/api/auth/logout')
      }
    } catch (error) {
      console.error('Logout error', error)
    } finally {
      token.value = null
      user.value = null
    }
  }

  return { user, token, isLoggedIn, can, hasRole, login, logout }
})

export const useAuth = () => useAuthStore()

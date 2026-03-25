import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<any | null>(null)
  const token = ref<string | null>(null)

  const isLoggedIn = computed(() => !!token.value)

  async function login(credentials: Record<string, any>) {
    try {
      const config = useRuntimeConfig()
      const backendURL = config.public.apiBaseUrl || 'http://127.0.0.1:8000'
      
      const response = await $fetch<any>(`${backendURL}/api/auth/login`, {
        method: 'POST',
        body: credentials
      })

      // Laravel typically wraps responses in a `data` object structure
      const payload = response.data || response

      token.value = payload.access_token || payload.token
      user.value = payload.user || { name: credentials.email.split('@')[0] }
      
      // Forces client side routing to the dashboard strictly
      return navigateTo('/')
    } catch (error: any) {
      console.error('Login error', error)
      throw new Error(error.data?.message || 'Credenciales incorrectas o error en el servidor.')
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
      return navigateTo('/login')
    }
  }

  return { user, token, isLoggedIn, login, logout }
}, {
  // @ts-ignore
  persist: {
    storage: {
      getItem: (key: string) => {
        const cookie = useCookie(key)
        return cookie.value ? JSON.stringify(cookie.value) : null
      },
      setItem: (key: string, value: string) => {
        useCookie(key, { maxAge: 60 * 60 * 24 * 7 }).value = JSON.parse(value)
      },
    }
  }
})

export const useAuth = () => useAuthStore()

export default defineNuxtPlugin((nuxtApp) => {
  const auth = useAuth()

  // Interceptar errores de $fetch de forma global
  const originalFetch = globalThis.$fetch

  // @ts-ignore
  globalThis.$fetch = originalFetch.create({
    onRequest({ options }) {
      if (auth.token) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${auth.token}`
        } as any
      }
    },
    async onResponseError({ response }) {
      if (response.status === 401) {
        console.warn('Sesión expirada (401). Redirigiendo al login...')
        auth.logout()
        await navigateTo('/login')
      }
    }
  })
})

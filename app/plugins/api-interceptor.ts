export default defineNuxtPlugin((nuxtApp) => {
  const auth = useAuth()

  // Interceptar errores de $fetch de forma global
  const originalFetch = globalThis.$fetch

  // @ts-ignore
  globalThis.$fetch = originalFetch.create({
    onResponseError({ response }) {
      if (response.status === 401) {
        // Token inválido o expirado
        console.warn('Sesión expirada (401). Redirigiendo al login...')
        auth.logout()
      }
    }
  })
})

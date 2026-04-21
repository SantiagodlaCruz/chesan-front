export const useApi = () => {
  const config = useRuntimeConfig()
  const auth = useAuth()
  const baseUrl = config.public.apiBaseUrl

  /**
   * Petición base centralizada
   */
  const request = async <T = any>(endpoint: string, options: any = {}): Promise<T> => {
    // Asegurar que el endpoint empiece con /
    const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`

    const headers = {
      'Accept': 'application/json',
      ...options.headers,
    }

    // Inyectar Token automáticamente si existe
    if (auth.token) {
      headers['Authorization'] = `Bearer ${auth.token}`
    }

    try {
      return await $fetch<T>(url, {
        ...options,
        headers,
      })
    } catch (error: any) {
      // Manejo centralizado de errores (ej. 401 Unauthorized)
      if (error.response?.status === 401) {
        auth.logout()
        navigateTo('/login')
      }
      throw error
    }
  }

  return {
    get: <T = any>(url: string, opts?: any) => 
      request<T>(url, { ...opts, method: 'GET' }),

    post: <T = any>(url: string, body?: any, opts?: any) => 
      request<T>(url, { ...opts, method: 'POST', body }),

    put: <T = any>(url: string, body?: any, opts?: any) => 
      request<T>(url, { ...opts, method: 'PUT', body }),

    patch: <T = any>(url: string, body?: any, opts?: any) => 
      request<T>(url, { ...opts, method: 'PATCH', body }),

    delete: <T = any>(url: string, opts?: any) => 
      request<T>(url, { ...opts, method: 'DELETE' }),
  }
}

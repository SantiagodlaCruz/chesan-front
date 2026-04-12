import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAuth } from './useAuth'
import type { StockProduct, ApiMeta, ApiLinks, ApiPaginatedResponse } from '~/types'

export const useInventoryStore = defineStore('inventory', () => {
  const items = ref<StockProduct[]>([])
  const meta = ref<Partial<ApiMeta>>({})
  const links = ref<Partial<ApiLinks>>({})
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchProducts(params: Record<string, string | number> = {}) {
    loading.value = true
    error.value = null
    const config = useRuntimeConfig()
    const apiUrl = config.public.apiBaseUrl || 'http://127.0.0.1:8000'
    const auth = useAuth()

    try {
      const query = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          query.append(key, value.toString())
        }
      })

      const res = await $fetch<ApiPaginatedResponse<StockProduct>>(`${apiUrl}/api/stock-products?${query.toString()}`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      })

      items.value = res.data?.data || []
      meta.value = res.data?.meta || {}
      links.value = res.data?.links || {}
    } catch (err: unknown) {
      const e = err as { data?: { message?: string }, message?: string }
      error.value = e.data?.message || e.message || 'Error al cargar productos'
      console.error(error.value, err)
    } finally {
      loading.value = false
    }
  }

  async function saveProduct(data: Partial<StockProduct> | Partial<StockProduct>[]) {
    const config = useRuntimeConfig()
    const apiUrl = config.public.apiBaseUrl || 'http://127.0.0.1:8000'
    const auth = useAuth()

    try {
      if (Array.isArray(data)) {
        await Promise.all(data.map(product => 
          $fetch(`${apiUrl}/api/stock-products`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${auth.token}` },
            body: product
          })
        ))
      } else if (data.id) {
        await $fetch(`${apiUrl}/api/stock-products/${data.id}`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${auth.token}` },
          body: data
        })
      } else {
        await $fetch(`${apiUrl}/api/stock-products`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${auth.token}` },
          body: data
        })
      }
      return true
    } catch (err: unknown) {
      console.error('Error saving product', err)
      return false
    }
  }

  return { items, meta, links, loading, error, fetchProducts, saveProduct }
})

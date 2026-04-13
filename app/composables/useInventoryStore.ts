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

  async function saveProduct(data: any) {
    const config = useRuntimeConfig()
    const apiUrl = config.public.apiBaseUrl || 'http://127.0.0.1:8000'
    const auth = useAuth()

    try {
      const isArray = Array.isArray(data)
      const hasImage = (!isArray && data.image instanceof File) || (isArray && data.some((item: any) => item.image instanceof File))

      if (hasImage && !isArray) {
        // Handle single with image via FormData
        const formData = new FormData()
        Object.entries(data).forEach(([key, value]) => {
          if (value === null || value === undefined) return
          if (key === 'variants' && Array.isArray(value)) {
            value.forEach((v, i) => {
              Object.entries(v).forEach(([vk, vv]) => {
                formData.append(`variants[${i}][${vk}]`, vv as any)
              });
            });
          } else {
            formData.append(key, value as any)
          }
        })

        await $fetch(`${apiUrl}/api/stock-products${data.id ? '/' + data.id : ''}`, {
          method: 'POST', // Use POST for both since we might need _method for PUT with FormData
          headers: { 
            'Authorization': `Bearer ${auth.token}`,
            'Accept': 'application/json'
          },
          params: data.id ? { _method: 'PUT' } : {},
          body: formData
        })
      } else if (isArray) {
        // Current bulk logic (JSON)
        await Promise.all(data.map((product: any) => 
          $fetch(`${apiUrl}/api/stock-products`, {
            method: 'POST',
            headers: { 
              'Authorization': `Bearer ${auth.token}`,
              'Accept': 'application/json'
            },
            body: product
          })
        ))
      } else if (data.id) {
        await $fetch(`${apiUrl}/api/stock-products/${data.id}`, {
          method: 'PUT',
          headers: { 
            'Authorization': `Bearer ${auth.token}`,
            'Accept': 'application/json'
          },
          body: data
        })
      } else {
        await $fetch(`${apiUrl}/api/stock-products`, {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${auth.token}`,
            'Accept': 'application/json'
          },
          body: data
        })
      }
      return true
    } catch (err: any) {
      console.error('Error saving product', err)
      if (err.response?._data) {
        throw err.response._data
      }
      throw err
    }
  }

  async function deleteProduct(id: number | string) {
    const config = useRuntimeConfig()
    const apiUrl = config.public.apiBaseUrl || 'http://127.0.0.1:8000'
    const auth = useAuth()

    try {
      await $fetch(`${apiUrl}/api/stock-products/${id}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${auth.token}`,
          'Accept': 'application/json'
        }
      })
      return true
    } catch (err: any) {
      console.error('Error deleting product', err)
      if (err.response?._data) {
        throw err.response._data
      }
      throw err
    }
  }

  return { items, meta, links, loading, error, fetchProducts, saveProduct, deleteProduct }
})

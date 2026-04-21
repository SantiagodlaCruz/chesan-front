import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { StockProduct, ApiMeta, ApiLinks, ApiPaginatedResponse } from '~/types'

export const useInventoryStore = defineStore('inventory', () => {
  const items = ref<StockProduct[]>([])
  const meta = ref<Partial<ApiMeta>>({})
  const links = ref<Partial<ApiLinks>>({})
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  const api = useApi()

  async function fetchProducts(params: Record<string, string | number> = {}) {
    loading.value = true
    error.value = null

    try {
      const res = await api.get<ApiPaginatedResponse<StockProduct>>('/api/stock-products', { params })

      items.value = res.data?.data || []
      meta.value = res.data?.meta || {}
      links.value = res.data?.links || {}
    } catch (err: any) {
      error.value = err.data?.message || err.message || 'Error al cargar inventario'
      console.error(error.value, err)
    } finally {
      loading.value = false
    }
  }

  async function saveProduct(data: any) {
    try {
      const hasImage = data.image instanceof File

      if (hasImage) {
        // Correctly handle nested objects/arrays for FormData
        const formData = new FormData()
        
        const appendToFormData = (key: string, value: any) => {
          if (value instanceof File) {
            formData.append(key, value)
          } else if (Array.isArray(value)) {
            value.forEach((v, i) => appendToFormData(`${key}[${i}]`, v))
          } else if (typeof value === 'object' && value !== null) {
            Object.entries(value).forEach(([k, v]) => appendToFormData(`${key}[${k}]`, v))
          } else {
            formData.append(key, value ?? '')
          }
        }

        Object.entries(data).forEach(([key, value]) => {
          if (value === null || value === undefined) return
          appendToFormData(key, value)
        })

        // For updates with images, we use POST + _method=PUT to bypass PHP's PUT-formdata limitations
        await api.post(`/api/stock-products${data.id ? '/' + data.id : ''}`, formData, {
          params: data.id ? { _method: 'PUT' } : {}
        })
      } else if (data.id) {
        await api.put(`/api/stock-products/${data.id}`, data)
      } else {
        await api.post('/api/stock-products', data)
      }
      return true
    } catch (err: any) {
      console.error('Error saving product', err)
      if (err.data) throw err.data
      throw err
    }
  }

  async function deleteProduct(id: number | string) {
    try {
      await api.delete(`/api/stock-products/${id}`)
      return true
    } catch (err: any) {
      console.error('Error deleting product', err)
      if (err.data) throw err.data
      throw err
    }
  }

  return { items, meta, links, loading, error, fetchProducts, saveProduct, deleteProduct }
})

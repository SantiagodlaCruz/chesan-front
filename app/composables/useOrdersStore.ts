import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Order, ApiMeta, ApiLinks, ApiPaginatedResponse } from '~/types'

export const useOrdersStore = defineStore('orders', () => {
  const items = ref<Order[]>([])
  const meta = ref<Partial<ApiMeta>>({})
  const links = ref<Partial<ApiLinks>>({})
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  const api = useApi()

  async function fetchOrders(params: Record<string, string | number | boolean> = {}) {
    loading.value = true
    error.value = null

    try {
      const res = await api.get<ApiPaginatedResponse<Order>>('/api/orders', { params })

      items.value = res.data?.data || []
      meta.value = res.data?.meta || {}
      links.value = res.data?.links || {}
    } catch (err: any) {
      error.value = err.data?.message || err.message || 'Error al cargar los pedidos'
      console.error(error.value, err)
    } finally {
      loading.value = false
    }
  }

  return { items, meta, links, loading, error, fetchOrders }
})

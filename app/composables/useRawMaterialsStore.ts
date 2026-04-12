import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAuth } from './useAuth'
import type { RawMaterial, ApiMeta, ApiLinks, ApiPaginatedResponse } from '~/types'

export const useRawMaterialsStore = defineStore('rawMaterials', () => {
  const items = ref<RawMaterial[]>([])
  const meta = ref<Partial<ApiMeta>>({})
  const links = ref<Partial<ApiLinks>>({})
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchMaterials(params: Record<string, string | number> = {}) {
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

      const res = await $fetch<ApiPaginatedResponse<RawMaterial>>(`${apiUrl}/api/raw-materials?${query.toString()}`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      })

      items.value = res.data?.data || []
      meta.value = res.data?.meta || {}
      links.value = res.data?.links || {}
    } catch (err: unknown) {
      const e = err as { data?: { message?: string }, message?: string }
      error.value = e.data?.message || e.message || 'Error al cargar materiales'
      console.error(error.value, err)
    } finally {
      loading.value = false
    }
  }

  async function saveMaterial(data: Partial<RawMaterial>) {
    const config = useRuntimeConfig()
    const apiUrl = config.public.apiBaseUrl || 'http://127.0.0.1:8000'
    const auth = useAuth()

    try {
      const method = data.id ? 'PUT' : 'POST'
      const url = data.id ? `${apiUrl}/api/raw-materials/${data.id}` : `${apiUrl}/api/raw-materials`
      
      await $fetch(url, {
        method,
        headers: { Authorization: `Bearer ${auth.token}` },
        body: data
      })
      return true
    } catch (err: unknown) {
      console.error('Error saving material', err)
      return false
    }
  }

  return { items, meta, links, loading, error, fetchMaterials, saveMaterial }
})

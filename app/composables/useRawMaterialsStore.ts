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

  async function saveMaterial(data: any) {
    const config = useRuntimeConfig()
    const apiUrl = config.public.apiBaseUrl || 'http://127.0.0.1:8000'
    const auth = useAuth()

    try {
      const hasImage = data.image instanceof File

      if (hasImage) {
        // Handle with FormData for image uploads
        const formData = new FormData()
        Object.entries(data).forEach(([key, value]) => {
          if (value === null || value === undefined) return
          formData.append(key, value as any)
        })

        await $fetch(`${apiUrl}/api/raw-materials${data.id ? '/' + data.id : ''}`, {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${auth.token}`,
            'Accept': 'application/json'
          },
          params: data.id ? { _method: 'PUT' } : {},
          body: formData
        })
      } else if (data.id) {
        await $fetch(`${apiUrl}/api/raw-materials/${data.id}`, {
          method: 'PUT',
          headers: { 
            'Authorization': `Bearer ${auth.token}`,
            'Accept': 'application/json'
          },
          body: data
        })
      } else {
        await $fetch(`${apiUrl}/api/raw-materials`, {
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
      console.error('Error saving material', err)
      if (err.response?._data) {
        throw err.response._data
      }
      throw err
    }
  }

  async function deleteMaterial(id: number | string) {
    const config = useRuntimeConfig()
    const apiUrl = config.public.apiBaseUrl || 'http://127.0.0.1:8000'
    const auth = useAuth()

    try {
      await $fetch(`${apiUrl}/api/raw-materials/${id}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${auth.token}`,
          'Accept': 'application/json'
        }
      })
      return true
    } catch (err: any) {
      console.error('Error deleting material', err)
      if (err.response?._data) {
        throw err.response._data
      }
      throw err
    }
  }

  return { items, meta, links, loading, error, fetchMaterials, saveMaterial, deleteMaterial }
})

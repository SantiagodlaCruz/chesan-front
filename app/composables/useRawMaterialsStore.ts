import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { RawMaterial, ApiMeta, ApiLinks, ApiPaginatedResponse } from '~/types'

export const useRawMaterialsStore = defineStore('rawMaterials', () => {
  const items = ref<RawMaterial[]>([])
  const meta = ref<Partial<ApiMeta>>({})
  const links = ref<Partial<ApiLinks>>({})
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  const api = useApi()

  async function fetchMaterials(params: Record<string, string | number> = {}) {
    loading.value = true
    error.value = null

    try {
      const res = await api.get<ApiPaginatedResponse<RawMaterial>>('/api/raw-materials', { params })

      items.value = res.data?.data || []
      meta.value = res.data?.meta || {}
      links.value = res.data?.links || {}
    } catch (err: any) {
      error.value = err.data?.message || err.message || 'Error al cargar materiales'
      console.error(error.value, err)
    } finally {
      loading.value = false
    }
  }

  async function saveMaterial(data: any) {
    try {
      const hasImage = data.image instanceof File

      if (hasImage) {
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

        await api.post(`/api/raw-materials${data.id ? '/' + data.id : ''}`, formData, {
          params: data.id ? { _method: 'PUT' } : {}
        })
      } else if (data.id) {
        await api.put(`/api/raw-materials/${data.id}`, data)
      } else {
        await api.post('/api/raw-materials', data)
      }
      return true
    } catch (err: any) {
      console.error('Error saving material', err)
      if (err.data) throw err.data
      throw err
    }
  }

  async function deleteMaterial(id: number | string) {
    try {
      await api.delete(`/api/raw-materials/${id}`)
      return true
    } catch (err: any) {
      console.error('Error deleting material', err)
      if (err.data) throw err.data
      throw err
    }
  }

  return { items, meta, links, loading, error, fetchMaterials, saveMaterial, deleteMaterial }
})

import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUnitMeasuresStore = defineStore('unitMeasures', () => {
  const api = useApi()
  const items = ref<{id: number, name: string}[]>([])
  const loading = ref(false)

  async function fetchUnitMeasures() {
    loading.value = true
    try {
      const res = await api.get('/api/unit-measures', { 
        params: { 
          per_page: 500,
          sort_by: 'name',
          sort_direction: 'asc'
        } 
      })
      
      let rawItems = []
      if (res.data && Array.isArray(res.data.data)) rawItems = res.data.data
      else if (Array.isArray(res.data)) rawItems = res.data
      
      items.value = rawItems.map((i: any) => ({
        label: i.name,
        value: i.id,
        ...i
      }))
    } catch (err) {
      console.error('Error loading unit measures', err)
    } finally {
      loading.value = false
    }
  }

  async function saveUnitMeasure(name: string) {
    try {
      await api.post('/api/unit-measures', { name })
      await fetchUnitMeasures()
      return true
    } catch (err: any) {
      console.error('Error saving unit measure', err)
      return false
    }
  }

  return { items, loading, fetchUnitMeasures, saveUnitMeasure }
})

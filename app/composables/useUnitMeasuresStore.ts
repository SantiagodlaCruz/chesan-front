import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAuth } from './useAuth'

export const useUnitMeasuresStore = defineStore('unitMeasures', () => {
  const items = ref<{id: number, name: string}[]>([])
  const loading = ref(false)

  async function fetchUnitMeasures() {
    loading.value = true
    const config = useRuntimeConfig()
    const apiUrl = config.public.apiBaseUrl || 'http://127.0.0.1:8000'
    const auth = useAuth()

    try {
      const res = await $fetch<any>(`${apiUrl}/api/unit-measures`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      })
      items.value = res.data || []
    } catch (err) {
      console.error('Error loading unit measures', err)
    } finally {
      loading.value = false
    }
  }

  async function saveUnitMeasure(name: string) {
    const config = useRuntimeConfig()
    const apiUrl = config.public.apiBaseUrl || 'http://127.0.0.1:8000'
    const auth = useAuth()

    try {
      await $fetch(`${apiUrl}/api/unit-measures`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${auth.token}` },
        body: { name }
      })
      await fetchUnitMeasures()
      return true
    } catch (err: any) {
      console.error('Error saving unit measure', err)
      return false
    }
  }

  return { items, loading, fetchUnitMeasures, saveUnitMeasure }
})

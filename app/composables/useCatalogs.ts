import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAuth } from './useAuth'
import type { SelectOption, Category, Client, ApiResponse, Color, Size } from '~/types'

export const useCatalogsStore = defineStore('catalogs', () => {
  const categories = ref<SelectOption[]>([])
  const institutions = ref<SelectOption[]>([])
  const colors = ref<SelectOption[]>([])
  const sizes = ref<SelectOption[]>([])
  
  const loading = ref(false)
  const lastFetched = ref(0)
  
  async function fetchAll(force = false) {
    const now = Date.now()
    // Cache for 5 minutes unless forced
    if (!force && categories.value.length > 0 && (now - lastFetched.value < 5 * 60 * 1000)) {
      return
    }
    
    loading.value = true
    const config = useRuntimeConfig()
    const apiUrl = config.public.apiBaseUrl || 'http://127.0.0.1:8000'
    const auth = useAuth()
    
    try {
      const [catRes, instRes, colorRes, sizeRes] = await Promise.all([
        $fetch<ApiResponse<Category[]>>(`${apiUrl}/api/categories`, { headers: { Authorization: `Bearer ${auth.token}` } }),
        $fetch<ApiResponse<Client[]>>(`${apiUrl}/api/clients/institutions`, { headers: { Authorization: `Bearer ${auth.token}` } }),
        $fetch<ApiResponse<Color[]>>(`${apiUrl}/api/colors`, { headers: { Authorization: `Bearer ${auth.token}` } }),
        $fetch<ApiResponse<Size[]>>(`${apiUrl}/api/sizes`, { headers: { Authorization: `Bearer ${auth.token}` } })
      ])

      categories.value = (catRes.data || []).map((c: Category) => ({ label: c.name, value: c.id }))
      institutions.value = (instRes.data || []).map((i: Client) => ({ label: i.name, value: i.id }))
      colors.value = (colorRes.data || []).map((c: Color) => ({ label: c.name, value: c.id }))
      sizes.value = (sizeRes.data || []).map((s: Size) => ({ label: s.name, value: s.id }))
      
      lastFetched.value = now
    } catch (err) {
      console.error('Error fetching catalogs', err)
    } finally {
      loading.value = false
    }
  }

  function invalidateCache() {
    lastFetched.value = 0
  }

  return { categories, institutions, colors, sizes, loading, fetchAll, invalidateCache }
})

export const useCatalogs = () => useCatalogsStore()

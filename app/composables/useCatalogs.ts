import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCatalogsStore = defineStore('catalogs', () => {
  const colors = ref([])
  const sizes = ref([])
  const units = ref([])
  const categories = ref([])
  const clients = ref([])
  const institutions = ref([])
  const loading = ref(false)
  
  const api = useApi()

  async function fetchAll() {
    loading.value = true
    try {
      const config = { 
        params: { 
          per_page: 500,
          sort_by: 'name',
          sort_direction: 'asc'
        } 
      }
      const [cols, szs, unts, cats, clis, insts] = await Promise.all([
        api.get('/api/colors', config),
        api.get('/api/sizes', config),
        api.get('/api/unit-measures', config),
        api.get('/api/categories', config),
        api.get('/api/clients', config),
        api.get('/api/clients/institutions', config)
      ])

      const mapToOptions = (res: any) => {
        let items = []
        if (res.data && Array.isArray(res.data.data)) items = res.data.data
        else if (Array.isArray(res.data)) items = res.data
        
        return items.map((i: any) => ({
          label: i.name,
          value: i.id,
          hex: i.hex_code || null, // For color select
          ...i
        }))
      }

      colors.value = mapToOptions(cols)
      sizes.value = mapToOptions(szs)
      units.value = mapToOptions(unts)
      categories.value = mapToOptions(cats)
      clients.value = mapToOptions(clis)
      institutions.value = mapToOptions(insts)
    } catch (error) {
      console.error('Error fetching catalogs', error)
    } finally {
      loading.value = false
    }
  }

  return { colors, sizes, units, categories, clients, institutions, loading, fetchAll }
})

export const useCatalogs = () => useCatalogsStore()

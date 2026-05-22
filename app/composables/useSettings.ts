import { ref, computed } from 'vue'

const logoUrl = ref<string | null>(null)
const logoBg = ref<string>('transparent')

export const useSettings = () => {
  const api = useApi()
  const colorMode = useColorMode()

  const logoBgColor = computed(() => {
    const bg = logoBg.value
    if (!bg || bg === 'transparent') {
      return 'transparent'
    }

    if (bg.startsWith('{')) {
      try {
        const parsed = JSON.parse(bg)
        return colorMode.value === 'dark' ? parsed.dark : parsed.light
      } catch (e) {
        console.error('Error parsing logoBg JSON:', e)
      }
    }

    // Fallbacks para compatibilidad con valores antiguos
    if (bg === 'light') return '#ffffff'
    if (bg === 'dark') return '#1e293b'
    
    return bg // Si es un color hexadecimal directo
  })

  const fetchSettings = async () => {
    try {
      const response = await api.get('/api/settings/public')
      logoUrl.value = response.data?.logo_url || null
      logoBg.value = response.data?.logo_bg || 'transparent'
    } catch (e) {
      console.error('Error fetching system settings:', e)
    }
  }

  const updateLogoBg = async (bg: string) => {
    try {
      const response = await api.post('/api/settings/logo-bg', { logo_bg: bg })
      logoBg.value = response.data?.logo_bg || 'transparent'
      return true
    } catch (e) {
      console.error('Error updating logo background:', e)
      return false
    }
  }

  const deleteLogo = async () => {
    try {
      const response = await api.delete('/api/settings/logo')
      logoUrl.value = null
      logoBg.value = response.data?.logo_bg || 'transparent'
      return true
    } catch (e) {
      console.error('Error deleting logo:', e)
      return false
    }
  }

  return {
    logoUrl,
    logoBg,
    logoBgColor,
    fetchSettings,
    updateLogoBg,
    deleteLogo
  }
}

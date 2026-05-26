import { ref, computed } from 'vue'

const logoUrl = ref<string | null>(null)
const logoBg = ref<string>('transparent')

const loginLogoUrl = ref<string | null>(null)
const loginLogoBg = ref<string>('transparent')

const menuLogoUrl = ref<string | null>(null)
const menuLogoBg = ref<string>('transparent')

export const useSettings = () => {
  const api = useApi()
  const colorMode = useColorMode()

  const parseBgColor = (bg: string) => {
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
  }

  const logoBgColor = computed(() => parseBgColor(logoBg.value))
  const loginLogoBgColor = computed(() => parseBgColor(loginLogoBg.value))
  const menuLogoBgColor = computed(() => parseBgColor(menuLogoBg.value))

  const fetchSettings = async () => {
    try {
      const response = await api.get('/api/settings/public')
      logoUrl.value = response.data?.logo_url || null
      logoBg.value = response.data?.logo_bg || 'transparent'

      loginLogoUrl.value = response.data?.login_logo_url || null
      loginLogoBg.value = response.data?.login_logo_bg || 'transparent'

      menuLogoUrl.value = response.data?.menu_logo_url || null
      menuLogoBg.value = response.data?.menu_logo_bg || 'transparent'
    } catch (e) {
      console.error('Error fetching system settings:', e)
    }
  }

  const updateLogoBg = async (bg: string, type?: 'login' | 'menu') => {
    try {
      const response = await api.post('/api/settings/logo-bg', { logo_bg: bg, type })
      const newBg = response.data?.logo_bg || 'transparent'
      
      if (type === 'login') {
        loginLogoBg.value = newBg
      } else if (type === 'menu') {
        menuLogoBg.value = newBg
      } else {
        logoBg.value = newBg
      }
      return true
    } catch (e) {
      console.error('Error updating logo background:', e)
      return false
    }
  }

  const deleteLogo = async (type?: 'login' | 'menu') => {
    try {
      const response = await api.delete('/api/settings/logo', { params: { type } })
      const logoBgVal = response.data?.logo_bg || 'transparent'
      
      if (type === 'login') {
        loginLogoUrl.value = null
        loginLogoBg.value = logoBgVal
      } else if (type === 'menu') {
        menuLogoUrl.value = null
        menuLogoBg.value = logoBgVal
      } else {
        logoUrl.value = null
        logoBg.value = logoBgVal
      }
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
    loginLogoUrl,
    loginLogoBg,
    loginLogoBgColor,
    menuLogoUrl,
    menuLogoBg,
    menuLogoBgColor,
    fetchSettings,
    updateLogoBg,
    deleteLogo
  }
}

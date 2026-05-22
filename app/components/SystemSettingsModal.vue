<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="opacity-0 scale-95"
    enter-to-class="opacity-100 scale-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-95"
  >
    <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center px-4">
      <!-- Dimmed Background -->
      <div class="absolute inset-0 bg-slate-900/40 dark:bg-blue-950/40 backdrop-blur-sm"></div>
      
      <!-- Modal Container -->
      <div class="relative bg-white dark:bg-card-dark w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-border-light dark:border-border-dark flex flex-col max-h-[90vh]">
        
        <!-- Modal Header -->
        <div class="px-8 pt-8 pb-4 shrink-0">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <SettingsIcon class="w-5 h-5" />
            </div>
            <h2 class="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Configuración del Sistema</h2>
          </div>
          <p class="text-sm text-slate-500 dark:text-slate-400">Personaliza la identidad visual y logotipos de la plataforma.</p>
        </div>

        <!-- Content Area (Scrollable) -->
        <div class="flex-1 overflow-y-auto px-8 pb-8 space-y-6 custom-scrollbar">
          
          <!-- Banners -->
          <Transition
            enter-active-class="transition duration-300 ease-out"
            enter-from-class="-translate-y-2 opacity-0"
            enter-to-class="translate-y-0 opacity-100"
          >
            <div v-if="successMsg" class="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-accent-green/10 border border-accent-green/20 text-accent-green text-xs font-semibold">
              <CheckCircleIcon class="w-4 h-4 shrink-0" />
              {{ successMsg }}
            </div>
            <div v-else-if="errorMsg" class="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-accent-red/10 border border-accent-red/20 text-accent-red text-xs font-semibold">
              <AlertCircleIcon class="w-4 h-4 shrink-0" />
              {{ errorMsg }}
            </div>
          </Transition>

          <!-- Section: Logo Upload -->
          <div class="space-y-3">
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Logotipo de la Marca</label>
            
            <!-- Real-time Preview with local theme toggler -->
            <div class="border border-border-light dark:border-border-dark rounded-2xl overflow-hidden shadow-inner bg-slate-50 dark:bg-slate-950/20">
              
              <!-- Tab Preview Switcher -->
              <div class="flex border-b border-border-light dark:border-border-dark p-2 bg-slate-100/50 dark:bg-slate-900/50 justify-between items-center">
                <span class="text-[11px] font-semibold text-slate-500 dark:text-slate-400 pl-2">Vista previa interactiva:</span>
                <div class="flex gap-1 bg-white dark:bg-slate-800 p-0.5 rounded-lg border border-border-light dark:border-border-dark">
                  <button 
                    type="button" 
                    @click="previewTheme = 'light'"
                    class="px-2.5 py-1 text-[10px] font-bold rounded-md transition-all flex items-center gap-1"
                    :class="previewTheme === 'light' ? 'bg-primary text-white shadow' : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'"
                  >
                    <SunIcon class="w-3 h-3" /> Claro
                  </button>
                  <button 
                    type="button" 
                    @click="previewTheme = 'dark'"
                    class="px-2.5 py-1 text-[10px] font-bold rounded-md transition-all flex items-center gap-1"
                    :class="previewTheme === 'dark' ? 'bg-primary text-white shadow' : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'"
                  >
                    <MoonIcon class="w-3 h-3" /> Oscuro
                  </button>
                </div>
              </div>

              <!-- Main Image Display Container -->
              <div class="h-40 flex items-center justify-center p-4 relative bg-checkered">
                <div 
                  class="flex items-center justify-center transition-all duration-300 overflow-hidden"
                  :style="previewContainerStyle"
                >
                  <img 
                    v-if="logoToShow" 
                    :src="logoToShow" 
                    alt="Logo preview" 
                    class="max-h-full max-w-full object-contain mx-auto transition-transform duration-300"
                  />
                  <div v-else class="flex flex-col items-center justify-center gap-1.5 text-slate-400 dark:text-slate-600">
                    <ShirtIcon class="w-10 h-10" stroke-width="1.5" />
                    <span class="text-xs">Sin logotipo configurado</span>
                  </div>
                </div>

                <div 
                  v-if="selectedFile" 
                  class="absolute top-2 right-2 px-2.5 py-0.5 rounded-full bg-amber-500 text-[10px] font-bold text-white tracking-wide shadow"
                >
                  Por subir
                </div>
              </div>
            </div>

            <!-- Upload File Inputs -->
            <div class="flex items-center gap-3">
              <input 
                ref="fileInput"
                type="file" 
                accept="image/*" 
                class="hidden"
                @change="handleLogoChange"
              />
              
              <BaseButton 
                type="button" 
                variant="secondary" 
                class="flex-1 text-xs py-2.5 flex items-center justify-center gap-1.5"
                @click="fileInput.click()"
              >
                <UploadIcon class="w-4 h-4" />
                {{ selectedFile ? 'Cambiar Imagen' : 'Seleccionar Imagen' }}
              </BaseButton>
              
              <BaseButton 
                v-if="logoUrl && !logoDeleted"
                type="button" 
                variant="danger" 
                class="flex-1 text-xs py-2.5 flex items-center justify-center gap-1.5"
                @click="markLogoAsDeleted"
              >
                <Trash2Icon class="w-4 h-4" />
                Eliminar Logo
              </BaseButton>
            </div>
            
            <div class="flex items-center justify-between text-[10px] text-slate-500 px-1">
              <span>Formatos sugeridos: PNG, SVG (máx 2MB)</span>
              <button 
                v-if="selectedFile || logoDeleted" 
                type="button" 
                @click="cancelSelectionOrDeletion"
                class="text-accent-red hover:underline font-semibold"
              >
                {{ selectedFile ? 'Descartar selección' : 'Restaurar logo original' }}
              </button>
            </div>
          </div>

          <!-- Section: Custom Background Configuration -->
          <div class="space-y-4 pt-2 border-t border-border-light dark:border-border-dark">
            <div class="flex items-center justify-between">
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Fondo del Logotipo
              </label>
              <button 
                v-if="logoUrl || selectedFile"
                type="button"
                @click="triggerAutoAnalysis"
                class="text-xs text-primary hover:text-primary-dark font-semibold flex items-center gap-1"
                :disabled="analysisLoading"
              >
                <SparklesIcon class="w-3.5 h-3.5" :class="{ 'animate-spin': analysisLoading }" />
                {{ analysisLoading ? 'Analizando...' : 'Autogenerar Colores IA' }}
              </button>
            </div>

            <!-- BG Mode Options -->
            <div class="grid grid-cols-2 gap-3">
              <button
                type="button"
                @click="selectedBgType = 'transparent'"
                class="flex flex-col items-center gap-2 p-3 rounded-xl border text-[12px] font-semibold transition-all duration-200"
                :class="[
                  selectedBgType === 'transparent' 
                    ? 'border-primary bg-primary/5 text-primary ring-2 ring-primary/20' 
                    : 'border-border-light dark:border-border-dark hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-400'
                ]"
              >
                <div class="w-full h-8 rounded bg-checkered border border-slate-200 dark:border-slate-850 overflow-hidden"></div>
                Transparente
              </button>
              
              <button
                type="button"
                @click="selectedBgType = 'color'"
                class="flex flex-col items-center gap-2 p-3 rounded-xl border text-[12px] font-semibold transition-all duration-200"
                :class="[
                  selectedBgType === 'color' 
                    ? 'border-primary bg-primary/5 text-primary ring-2 ring-primary/20' 
                    : 'border-border-light dark:border-border-dark hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-400'
                ]"
              >
                <div class="w-full h-8 rounded border border-slate-200 dark:border-slate-800 overflow-hidden flex">
                  <div class="w-1/2 h-full" :style="{ backgroundColor: customColors.light }"></div>
                  <div class="w-1/2 h-full" :style="{ backgroundColor: customColors.dark }"></div>
                </div>
                Color Personalizado
              </button>
            </div>

            <!-- Custom Color Pickers Panel -->
            <Transition
              enter-active-class="transition duration-200 ease-out"
              enter-from-class="opacity-0 -translate-y-2"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition duration-150 ease-in"
              leave-from-class="opacity-100 translate-y-0"
              leave-to-class="opacity-0 -translate-y-2"
            >
              <div 
                v-if="selectedBgType === 'color'" 
                class="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-border-light dark:border-border-dark space-y-4"
              >
                <span class="block text-xs font-semibold text-slate-500 dark:text-slate-400">Ajusta los fondos para cada tema del sistema:</span>
                
                <div class="grid grid-cols-2 gap-4">
                  <!-- Light Mode Picker -->
                  <div class="space-y-1.5">
                    <label class="block text-[11px] font-bold text-slate-600 dark:text-slate-400">Modo Claro:</label>
                    <div class="flex items-center gap-2">
                      <div class="relative w-8 h-8 rounded-lg border border-slate-300 dark:border-slate-700 overflow-hidden shrink-0 shadow-sm">
                        <input 
                          type="color" 
                          v-model="customColors.light" 
                          class="absolute inset-0 w-full h-full p-0 border-0 cursor-pointer scale-150" 
                        />
                      </div>
                      <input 
                        type="text" 
                        v-model="customColors.light" 
                        placeholder="#ffffff"
                        class="w-full text-xs font-mono uppercase bg-white dark:bg-card-dark border border-border-light dark:border-border-dark px-2.5 py-1.5 rounded-lg focus:border-primary outline-none text-slate-800 dark:text-slate-200"
                      />
                    </div>
                  </div>

                  <!-- Dark Mode Picker -->
                  <div class="space-y-1.5">
                    <label class="block text-[11px] font-bold text-slate-600 dark:text-slate-400">Modo Oscuro:</label>
                    <div class="flex items-center gap-2">
                      <div class="relative w-8 h-8 rounded-lg border border-slate-300 dark:border-slate-700 overflow-hidden shrink-0 shadow-sm">
                        <input 
                          type="color" 
                          v-model="customColors.dark" 
                          class="absolute inset-0 w-full h-full p-0 border-0 cursor-pointer scale-150" 
                        />
                      </div>
                      <input 
                        type="text" 
                        v-model="customColors.dark" 
                        placeholder="#1e293b"
                        class="w-full text-xs font-mono uppercase bg-white dark:bg-card-dark border border-border-light dark:border-border-dark px-2.5 py-1.5 rounded-lg focus:border-primary outline-none text-slate-800 dark:text-slate-200"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Transition>
          </div>

        </div>

        <!-- Footer Actions -->
        <div class="px-8 py-6 bg-slate-50 dark:bg-slate-900/30 border-t border-border-light dark:border-border-dark flex items-center gap-3 shrink-0">
          <BaseButton 
            type="button" 
            variant="secondary" 
            class="flex-1 py-2.5"
            :disabled="saveLoading" 
            @click="close"
          >
            Cancelar
          </BaseButton>
          
          <BaseButton 
            type="button" 
            variant="primary" 
            class="flex-1 py-2.5"
            :loading="saveLoading"
            loadingText="Guardando..."
            @click="saveSettings"
          >
            Guardar Configuración
          </BaseButton>
        </div>

      </div>

      <!-- Delete Confirmation Modal -->
      <ConfirmModal
        v-model:show="showDeleteConfirm"
        title="Eliminar Logotipo"
        message="¿Estás seguro de que deseas marcar el logotipo para eliminar? (Los cambios se aplicarán al guardar la configuración)"
        confirmText="Sí, marcar para eliminar"
        cancelText="Cancelar"
        confirmVariant="danger"
        @confirm="executeMarkLogoAsDeleted"
      />
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { 
  SettingsIcon,
  UploadIcon,
  ShirtIcon,
  SparklesIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  SunIcon,
  MoonIcon,
  Trash2Icon
} from 'lucide-vue-next'
import BaseButton from '~/components/BaseButton.vue'
import ConfirmModal from '~/components/ConfirmModal.vue'
import { useSettings } from '~/composables/useSettings'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const api = useApi()
const colorMode = useColorMode()
const { logoUrl, logoBg, updateLogoBg, deleteLogo } = useSettings()

const previewTheme = ref('light')
const saveLoading = ref(false)
const analysisLoading = ref(false)
const successMsg = ref('')
const errorMsg = ref('')

const fileInput = ref(null)
const selectedFile = ref(null)
const localPreviewUrl = ref(null)
const logoDeleted = ref(false)
const showDeleteConfirm = ref(false)

const selectedBgType = ref('transparent')
const customColors = ref({
  light: '#ffffff',
  dark: '#1e293b'
})

const logoToShow = computed(() => {
  if (localPreviewUrl.value) return localPreviewUrl.value
  if (logoDeleted.value) return null
  return logoUrl.value
})

// Dynamic background styling for preview box
const previewContainerStyle = computed(() => {
  if (selectedBgType.value === 'transparent') {
    return {
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }
  
  const activeColor = previewTheme.value === 'dark' ? customColors.value.dark : customColors.value.light
  
  return {
    backgroundColor: activeColor,
    borderRadius: '1rem', // rounded-2xl
    border: `1px solid ${previewTheme.value === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
    padding: '0.75rem',
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease'
  }
})

// Initialize from existing DB settings
const loadSettingsFromStore = () => {
  previewTheme.value = colorMode.value || 'light'
  
  const bg = logoBg.value
  if (!bg || bg === 'transparent') {
    selectedBgType.value = 'transparent'
    customColors.value = {
      light: '#ffffff',
      dark: '#1e293b'
    }
  } else if (bg.startsWith('{')) {
    try {
      const parsed = JSON.parse(bg)
      selectedBgType.value = 'color'
      customColors.value = {
        light: parsed.light || '#ffffff',
        dark: parsed.dark || '#1e293b'
      }
    } catch (e) {
      console.error('Error loading settings json:', e)
    }
  } else {
    // Legacy support
    selectedBgType.value = 'color'
    if (bg === 'light') {
      customColors.value = { light: '#ffffff', dark: '#1e293b' }
    } else if (bg === 'dark') {
      customColors.value = { light: '#ffffff', dark: '#1e293b' }
    } else {
      // Raw hex
      customColors.value = {
        light: bg,
        dark: '#1e293b'
      }
    }
  }
}

// Watch modelValue to load settings when opening
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    loadSettingsFromStore()
    successMsg.value = ''
    errorMsg.value = ''
    selectedFile.value = null
    localPreviewUrl.value = null
    logoDeleted.value = false
    showDeleteConfirm.value = false
  }
})

onMounted(() => {
  loadSettingsFromStore()
})

const close = () => {
  if (!saveLoading.value) {
    emit('update:modelValue', false)
    selectedFile.value = null
    logoDeleted.value = false
    showDeleteConfirm.value = false
    if (localPreviewUrl.value) {
      URL.revokeObjectURL(localPreviewUrl.value)
      localPreviewUrl.value = null
    }
  }
}

// Color extraction helper functions
const rgbToHex = (r, g, b) => {
  const toHex = (c) => {
    const hex = Math.max(0, Math.min(255, c)).toString(16)
    return hex.padStart(2, '0')
  }
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

const analyzeLogoColors = (source) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Canvas context not available'))
        return
      }

      // Resize processing boundary
      const maxDim = 100
      let w = img.width
      let h = img.height
      if (w > maxDim || h > maxDim) {
        if (w > h) {
          h = Math.round((h * maxDim) / w)
          w = maxDim
        } else {
          w = Math.round((w * maxDim) / h)
          h = maxDim
        }
      }
      canvas.width = w
      canvas.height = h
      ctx.drawImage(img, 0, 0, w, h)

      try {
        const imgData = ctx.getImageData(0, 0, w, h)
        const data = imgData.data
        let sumR = 0, sumG = 0, sumB = 0
        let count = 0
        let fallbackSumR = 0, fallbackSumG = 0, fallbackSumB = 0
        let fallbackCount = 0

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]
          const a = data[i + 3]

          if (a > 50) {
            fallbackSumR += r
            fallbackSumG += g
            fallbackSumB += b
            fallbackCount++

            // Filter out near-white and near-black pixels to get clean brand color
            const isWhite = r > 240 && g > 240 && b > 240
            const isBlack = r < 25 && g < 25 && b < 25
            if (!isWhite && !isBlack) {
              sumR += r
              sumG += g
              sumB += b
              count++
            }
          }
        }

        let avgR, avgG, avgB
        if (count > 0) {
          avgR = Math.round(sumR / count)
          avgG = Math.round(sumG / count)
          avgB = Math.round(sumB / count)
        } else if (fallbackCount > 0) {
          avgR = Math.round(fallbackSumR / fallbackCount)
          avgG = Math.round(fallbackSumG / fallbackCount)
          avgB = Math.round(fallbackSumB / fallbackCount)
        } else {
          avgR = 59
          avgG = 130
          avgB = 246
        }

        // Blending calculations
        // 1. Light: 92% White + 8% Dominant
        const rLight = Math.round(0.92 * 255 + 0.08 * avgR)
        const gLight = Math.round(0.92 * 255 + 0.08 * avgG)
        const bLight = Math.round(0.92 * 255 + 0.08 * avgB)

        // 2. Dark: 88% Slate-800 (#1e293b -> 30, 41, 59) + 12% Dominant
        const rDark = Math.round(0.88 * 30 + 0.12 * avgR)
        const gDark = Math.round(0.88 * 41 + 0.12 * avgG)
        const bDark = Math.round(0.88 * 59 + 0.12 * avgB)

        resolve({
          light: rgbToHex(rLight, gLight, bLight),
          dark: rgbToHex(rDark, gDark, bDark)
        })
      } catch (e) {
        reject(e)
      }
    }

    img.onerror = (e) => {
      reject(e)
    }

    if (source instanceof File) {
      const reader = new FileReader()
      reader.onload = (event) => {
        img.src = event.target.result
      }
      reader.readAsDataURL(source)
    } else {
      img.src = source
    }
  })
}

const handleLogoChange = async (e) => {
  const files = e.target.files
  if (files && files.length > 0) {
    const file = files[0]
    selectedFile.value = file
    logoDeleted.value = false
    
    if (localPreviewUrl.value) {
      URL.revokeObjectURL(localPreviewUrl.value)
    }
    localPreviewUrl.value = URL.createObjectURL(file)
    successMsg.value = 'Nueva imagen de logotipo seleccionada.'
    
    // Auto-analyze selected file
    try {
      analysisLoading.value = true
      const colors = await analyzeLogoColors(file)
      customColors.value = colors
      selectedBgType.value = 'color'
      successMsg.value = 'Logotipo seleccionado y analizado. Se sugieren colores de fondo adaptativos.'
    } catch (e) {
      console.error('Error analyzing local file:', e)
    } finally {
      analysisLoading.value = false
    }
  }
}

const triggerAutoAnalysis = async () => {
  const source = selectedFile.value || (logoDeleted.value ? null : logoUrl.value)
  if (!source) return

  try {
    analysisLoading.value = true
    errorMsg.value = ''
    successMsg.value = ''
    
    const colors = await analyzeLogoColors(source)
    customColors.value = colors
    selectedBgType.value = 'color'
    successMsg.value = 'Colores óptimos autogenerados e implementados con éxito en los selectores.'
  } catch (e) {
    console.error('Error in manual analysis:', e)
    errorMsg.value = 'No se pudo autogenerar el color por restricciones CORS de la imagen del servidor. Sube la imagen de nuevo para forzar el análisis local.'
  } finally {
    analysisLoading.value = false
  }
}

const cancelSelectionOrDeletion = () => {
  if (selectedFile.value) {
    selectedFile.value = null
    if (localPreviewUrl.value) {
      URL.revokeObjectURL(localPreviewUrl.value)
      localPreviewUrl.value = null
    }
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }
  if (logoDeleted.value) {
    logoDeleted.value = false
    loadSettingsFromStore()
  }
}

const markLogoAsDeleted = () => {
  showDeleteConfirm.value = true
}

const executeMarkLogoAsDeleted = () => {
  showDeleteConfirm.value = false
  logoDeleted.value = true
  selectedFile.value = null
  if (localPreviewUrl.value) {
    URL.revokeObjectURL(localPreviewUrl.value)
    localPreviewUrl.value = null
  }
  if (fileInput.value) {
    fileInput.value.value = ''
  }
  selectedBgType.value = 'transparent'
  customColors.value = {
    light: '#ffffff',
    dark: '#1e293b'
  }
}

const saveSettings = async () => {
  saveLoading.value = true
  errorMsg.value = ''
  successMsg.value = ''

  try {
    let savedSuccessfully = false

    if (logoDeleted.value) {
      const ok = await deleteLogo()
      if (!ok) {
        throw new Error('No se pudo eliminar el logotipo del servidor.')
      }
      savedSuccessfully = true
    } else {
      if (selectedFile.value) {
        const formData = new FormData()
        formData.append('logo', selectedFile.value)
        const res = await api.post('/api/settings/logo', formData)
        logoUrl.value = res.data?.logo_url
      }
      
      let logoBgSettingValue = 'transparent'
      if (selectedBgType.value === 'color') {
        const hexRegex = /^#([A-Fa-f0-9]{6})$/
        if (!hexRegex.test(customColors.value.light) || !hexRegex.test(customColors.value.dark)) {
          throw new Error('Los colores deben ser códigos hexadecimales de 6 dígitos válidos (ej. #FFFFFF).')
        }
        logoBgSettingValue = JSON.stringify({
          light: customColors.value.light.toLowerCase(),
          dark: customColors.value.dark.toLowerCase()
        })
      }

      const ok = await updateLogoBg(logoBgSettingValue)
      if (!ok) {
        throw new Error('No se pudo guardar el fondo del logotipo.')
      }
      savedSuccessfully = true
    }

    if (savedSuccessfully) {
      successMsg.value = 'Configuración guardada exitosamente.'
      
      selectedFile.value = null
      if (localPreviewUrl.value) {
        URL.revokeObjectURL(localPreviewUrl.value)
        localPreviewUrl.value = null
      }
      logoDeleted.value = false
      
      setTimeout(() => {
        close()
      }, 1500)
    }
  } catch (e) {
    console.error('Error saving settings:', e)
    errorMsg.value = e.data?.message || e.message || 'Error al guardar la configuración.'
  } finally {
    saveLoading.value = false
  }
}
</script>

<style scoped>
.bg-checkered {
  background-image: linear-gradient(45deg, #e2e8f0 25%, transparent 25%), 
                    linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), 
                    linear-gradient(45deg, transparent 75%, #e2e8f0 75%), 
                    linear-gradient(-45deg, transparent 75%, #e2e8f0 75%);
  background-size: 16px 16px;
  background-position: 0 0, 0 8px, 8px -8px, -8px 0px;
  background-color: #f8fafc;
}
:global(.dark) .bg-checkered {
  background-image: linear-gradient(45deg, #1e293b 25%, transparent 25%), 
                    linear-gradient(-45deg, #1e293b 25%, transparent 25%), 
                    linear-gradient(45deg, transparent 75%, #1e293b 75%), 
                    linear-gradient(-45deg, transparent 75%, #1e293b 75%);
  background-size: 16px 16px;
  background-position: 0 0, 0 8px, 8px -8px, -8px 0px;
  background-color: #0b0f19;
}

/* Custom scrollbar style */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.3);
  border-radius: 9999px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.5);
}
</style>

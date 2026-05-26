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

        <!-- Tabs Switcher -->
        <div class="px-8 border-b border-border-light dark:border-border-dark flex gap-4 bg-slate-50/50 dark:bg-slate-900/10 shrink-0">
          <button 
            type="button"
            @click="activeTab = 'login'"
            class="py-3.5 text-sm font-semibold border-b-2 transition-all relative focus:outline-none"
            :class="activeTab === 'login' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'"
          >
            Logo de Login
          </button>
          <button 
            type="button"
            @click="activeTab = 'menu'"
            class="py-3.5 text-sm font-semibold border-b-2 transition-all relative focus:outline-none"
            :class="activeTab === 'menu' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'"
          >
            Logo de Menú
          </button>
        </div>

        <!-- Content Area (Scrollable) -->
        <div class="flex-1 overflow-y-auto px-8 pb-8 pt-6 space-y-6 custom-scrollbar">
          
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
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              {{ activeTab === 'login' ? 'Logotipo de Pantalla de Login' : 'Logotipo de Menú Lateral' }}
            </label>
            
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
                  v-if="selectedFiles[activeTab]" 
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
                {{ selectedFiles[activeTab] ? 'Cambiar Imagen' : 'Seleccionar Imagen' }}
              </BaseButton>
              
              <BaseButton 
                v-if="currentLogoUrl && !logosDeleted[activeTab]"
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
                v-if="selectedFiles[activeTab] || logosDeleted[activeTab]" 
                type="button" 
                @click="cancelSelectionOrDeletion"
                class="text-accent-red hover:underline font-semibold"
              >
                {{ selectedFiles[activeTab] ? 'Descartar selección' : 'Restaurar logo original' }}
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
                v-if="currentLogoUrl || selectedFiles[activeTab]"
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
                @click="selectedBgTypes[activeTab] = 'transparent'"
                class="flex flex-col items-center gap-2 p-3 rounded-xl border text-[12px] font-semibold transition-all duration-200"
                :class="[
                  selectedBgTypes[activeTab] === 'transparent' 
                    ? 'border-primary bg-primary/5 text-primary ring-2 ring-primary/20' 
                    : 'border-border-light dark:border-border-dark hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-400'
                ]"
              >
                <div class="w-full h-8 rounded bg-checkered border border-slate-200 dark:border-slate-850 overflow-hidden"></div>
                Transparente
              </button>
              
              <button
                type="button"
                @click="selectedBgTypes[activeTab] = 'color'"
                class="flex flex-col items-center gap-2 p-3 rounded-xl border text-[12px] font-semibold transition-all duration-200"
                :class="[
                  selectedBgTypes[activeTab] === 'color' 
                    ? 'border-primary bg-primary/5 text-primary ring-2 ring-primary/20' 
                    : 'border-border-light dark:border-border-dark hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-400'
                ]"
              >
                <div class="w-full h-8 rounded border border-slate-200 dark:border-slate-800 overflow-hidden flex">
                  <div class="w-1/2 h-full" :style="{ backgroundColor: customColors[activeTab].light }"></div>
                  <div class="w-1/2 h-full" :style="{ backgroundColor: customColors[activeTab].dark }"></div>
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
                v-if="selectedBgTypes[activeTab] === 'color'" 
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
                          v-model="customColors[activeTab].light" 
                          class="absolute inset-0 w-full h-full p-0 border-0 cursor-pointer scale-150" 
                        />
                      </div>
                      <input 
                        type="text" 
                        v-model="customColors[activeTab].light" 
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
                          v-model="customColors[activeTab].dark" 
                          class="absolute inset-0 w-full h-full p-0 border-0 cursor-pointer scale-150" 
                        />
                      </div>
                      <input 
                        type="text" 
                        v-model="customColors[activeTab].dark" 
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
const { 
  loginLogoUrl, 
  loginLogoBg, 
  menuLogoUrl, 
  menuLogoBg, 
  updateLogoBg, 
  deleteLogo 
} = useSettings()

const activeTab = ref('login') // 'login' or 'menu'
const previewTheme = ref('light')
const saveLoading = ref(false)
const analysisLoading = ref(false)
const successMsg = ref('')
const errorMsg = ref('')

const fileInput = ref(null)
const showDeleteConfirm = ref(false)

// Tab-specific states
const selectedFiles = ref({
  login: null,
  menu: null
})

const localPreviewUrls = ref({
  login: null,
  menu: null
})

const logosDeleted = ref({
  login: false,
  menu: false
})

const selectedBgTypes = ref({
  login: 'transparent',
  menu: 'transparent'
})

const customColors = ref({
  login: { light: '#ffffff', dark: '#1e293b' },
  menu: { light: '#ffffff', dark: '#1e293b' }
})

const currentLogoUrl = computed(() => {
  return activeTab.value === 'login' ? loginLogoUrl.value : menuLogoUrl.value
})

const logoToShow = computed(() => {
  const tab = activeTab.value
  if (localPreviewUrls.value[tab]) return localPreviewUrls.value[tab]
  if (logosDeleted.value[tab]) return null
  return tab === 'login' ? loginLogoUrl.value : menuLogoUrl.value
})

// Dynamic background styling for preview box
const previewContainerStyle = computed(() => {
  const tab = activeTab.value
  if (selectedBgTypes.value[tab] === 'transparent') {
    return {
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }
  
  const activeColor = previewTheme.value === 'dark' ? customColors.value[tab].dark : customColors.value[tab].light
  
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
  
  // Load Login settings
  const loginBgVal = loginLogoBg.value
  if (!loginBgVal || loginBgVal === 'transparent') {
    selectedBgTypes.value.login = 'transparent'
    customColors.value.login = { light: '#ffffff', dark: '#1e293b' }
  } else if (loginBgVal.startsWith('{')) {
    try {
      const parsed = JSON.parse(loginBgVal)
      selectedBgTypes.value.login = 'color'
      customColors.value.login = {
        light: parsed.light || '#ffffff',
        dark: parsed.dark || '#1e293b'
      }
    } catch (e) {
      console.error('Error loading login settings json:', e)
    }
  } else {
    selectedBgTypes.value.login = 'color'
    customColors.value.login = {
      light: loginBgVal,
      dark: '#1e293b'
    }
  }

  // Load Menu settings
  const menuBgVal = menuLogoBg.value
  if (!menuBgVal || menuBgVal === 'transparent') {
    selectedBgTypes.value.menu = 'transparent'
    customColors.value.menu = { light: '#ffffff', dark: '#1e293b' }
  } else if (menuBgVal.startsWith('{')) {
    try {
      const parsed = JSON.parse(menuBgVal)
      selectedBgTypes.value.menu = 'color'
      customColors.value.menu = {
        light: parsed.light || '#ffffff',
        dark: parsed.dark || '#1e293b'
      }
    } catch (e) {
      console.error('Error loading menu settings json:', e)
    }
  } else {
    selectedBgTypes.value.menu = 'color'
    customColors.value.menu = {
      light: menuBgVal,
      dark: '#1e293b'
    }
  }
}

// Watch modelValue to load settings when opening
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    loadSettingsFromStore()
    successMsg.value = ''
    errorMsg.value = ''
    
    selectedFiles.value = { login: null, menu: null }
    logosDeleted.value = { login: false, menu: false }
    showDeleteConfirm.value = false
    
    if (localPreviewUrls.value.login) {
      URL.revokeObjectURL(localPreviewUrls.value.login)
    }
    if (localPreviewUrls.value.menu) {
      URL.revokeObjectURL(localPreviewUrls.value.menu)
    }
    localPreviewUrls.value = { login: null, menu: null }
  }
})

onMounted(() => {
  loadSettingsFromStore()
})

const close = () => {
  if (!saveLoading.value) {
    emit('update:modelValue', false)
    selectedFiles.value = { login: null, menu: null }
    logosDeleted.value = { login: false, menu: false }
    showDeleteConfirm.value = false
    if (localPreviewUrls.value.login) {
      URL.revokeObjectURL(localPreviewUrls.value.login)
    }
    if (localPreviewUrls.value.menu) {
      URL.revokeObjectURL(localPreviewUrls.value.menu)
    }
    localPreviewUrls.value = { login: null, menu: null }
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
    const tab = activeTab.value
    selectedFiles.value[tab] = file
    logosDeleted.value[tab] = false
    
    if (localPreviewUrls.value[tab]) {
      URL.revokeObjectURL(localPreviewUrls.value[tab])
    }
    localPreviewUrls.value[tab] = URL.createObjectURL(file)
    successMsg.value = `Nueva imagen para el logotipo del ${tab === 'login' ? 'Login' : 'Menú'} seleccionada.`
    
    // Auto-analyze selected file
    try {
      analysisLoading.value = true
      const colors = await analyzeLogoColors(file)
      customColors.value[tab] = colors
      selectedBgTypes.value[tab] = 'color'
      successMsg.value = 'Logotipo seleccionado y analizado. Se sugieren colores de fondo adaptativos.'
    } catch (e) {
      console.error('Error analyzing local file:', e)
    } finally {
      analysisLoading.value = false
    }
  }
}

const triggerAutoAnalysis = async () => {
  const tab = activeTab.value
  const source = selectedFiles.value[tab] || (logosDeleted.value[tab] ? null : (tab === 'login' ? loginLogoUrl.value : menuLogoUrl.value))
  if (!source) return

  try {
    analysisLoading.value = true
    errorMsg.value = ''
    successMsg.value = ''
    
    const colors = await analyzeLogoColors(source)
    customColors.value[tab] = colors
    selectedBgTypes.value[tab] = 'color'
    successMsg.value = 'Colores óptimos autogenerados e implementados con éxito en los selectores.'
  } catch (e) {
    console.error('Error in manual analysis:', e)
    errorMsg.value = 'No se pudo autogenerar el color por restricciones CORS de la imagen del servidor. Sube la imagen de nuevo para forzar el análisis local.'
  } finally {
    analysisLoading.value = false
  }
}

const cancelSelectionOrDeletion = () => {
  const tab = activeTab.value
  if (selectedFiles.value[tab]) {
    selectedFiles.value[tab] = null
    if (localPreviewUrls.value[tab]) {
      URL.revokeObjectURL(localPreviewUrls.value[tab])
      localPreviewUrls.value[tab] = null
    }
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }
  if (logosDeleted.value[tab]) {
    logosDeleted.value[tab] = false
    loadSettingsFromStore()
  }
}

const markLogoAsDeleted = () => {
  showDeleteConfirm.value = true
}

const executeMarkLogoAsDeleted = () => {
  showDeleteConfirm.value = false
  const tab = activeTab.value
  logosDeleted.value[tab] = true
  selectedFiles.value[tab] = null
  if (localPreviewUrls.value[tab]) {
    URL.revokeObjectURL(localPreviewUrls.value[tab])
    localPreviewUrls.value[tab] = null
  }
  if (fileInput.value) {
    fileInput.value.value = ''
  }
  selectedBgTypes.value[tab] = 'transparent'
  customColors.value[tab] = {
    light: '#ffffff',
    dark: '#1e293b'
  }
}

const saveSettings = async () => {
  saveLoading.value = true
  errorMsg.value = ''
  successMsg.value = ''

  try {
    const tabs = ['login', 'menu']
    for (const tab of tabs) {
      if (logosDeleted.value[tab]) {
        const ok = await deleteLogo(tab)
        if (!ok) {
          throw new Error(`No se pudo eliminar el logotipo de ${tab === 'login' ? 'Login' : 'Menú'} del servidor.`)
        }
      } else {
        if (selectedFiles.value[tab]) {
          const formData = new FormData()
          formData.append('logo', selectedFiles.value[tab])
          formData.append('type', tab)
          const res = await api.post('/api/settings/logo', formData)
          if (tab === 'login') {
            loginLogoUrl.value = res.data?.logo_url
          } else {
            menuLogoUrl.value = res.data?.logo_url
          }
        }
        
        let logoBgSettingValue = 'transparent'
        if (selectedBgTypes.value[tab] === 'color') {
          const hexRegex = /^#([A-Fa-f0-9]{6})$/
          if (!hexRegex.test(customColors.value[tab].light) || !hexRegex.test(customColors.value[tab].dark)) {
            throw new Error('Los colores deben ser códigos hexadecimales de 6 dígitos válidos (ej. #FFFFFF).')
          }
          logoBgSettingValue = JSON.stringify({
            light: customColors.value[tab].light.toLowerCase(),
            dark: customColors.value[tab].dark.toLowerCase()
          })
        }

        const ok = await updateLogoBg(logoBgSettingValue, tab)
        if (!ok) {
          throw new Error(`No se pudo guardar el fondo del logotipo de ${tab === 'login' ? 'Login' : 'Menú'}.`)
        }
      }
    }

    successMsg.value = 'Configuración guardada exitosamente.'
    
    selectedFiles.value = { login: null, menu: null }
    if (localPreviewUrls.value.login) {
      URL.revokeObjectURL(localPreviewUrls.value.login)
      localPreviewUrls.value.login = null
    }
    if (localPreviewUrls.value.menu) {
      URL.revokeObjectURL(localPreviewUrls.value.menu)
      localPreviewUrls.value.menu = null
    }
    logosDeleted.value = { login: false, menu: false }
    
    setTimeout(() => {
      close()
    }, 1500)
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

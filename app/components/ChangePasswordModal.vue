<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center px-4">
      <!-- Dimmed Background -->
      <div class="absolute inset-0 bg-slate-900/40 dark:bg-blue-950/40 backdrop-blur-sm"></div>
      
      <!-- Modal Container -->
      <div class="relative bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-xl w-full max-w-md rounded-xl shadow-2xl overflow-hidden border border-border-light dark:border-[#1e293b] dark:shadow-blue-900/10">
        
        <!-- Modal Header -->
        <div class="px-8 pt-8 pb-4">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <ShieldIcon class="w-5 h-5" />
            </div>
            <h2 class="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Cambiar Contraseña</h2>
          </div>
          <p class="text-sm text-slate-500 dark:text-slate-400">Mantén tu cuenta segura actualizando tu clave de acceso regularmente.</p>
        </div>

        <!-- Form -->
        <VForm :validation-schema="typedPasswordSchema" @submit="submitPasswordChange" class="px-8 pb-8 space-y-6">
          
          <!-- Banners -->
          <div v-if="passwordSuccess" class="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-accent-green/10 border border-accent-green/20 text-accent-green text-xs font-semibold">
            <CheckCircleIcon class="w-4 h-4 shrink-0" />
            {{ passwordSuccess }}
          </div>
          <div v-else-if="passwordError" class="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-accent-red/10 border border-accent-red/20 text-accent-red text-xs font-semibold">
            <AlertCircleIcon class="w-4 h-4 shrink-0" />
            {{ passwordError }}
          </div>

          <BaseInput 
            name="current_password" 
            type="password" 
            label="Contraseña Actual" 
            placeholder="••••••••" 
          />

          <!-- New Password -->
          <div class="space-y-4">
            <BaseInput 
              name="new_password" 
              type="password" 
              label="Nueva Contraseña" 
              placeholder="Mínimo 8 caracteres" 
            />
            
            <VField name="new_password" v-slot="{ field }">
              <!-- Password Strength Indicator -->
              <div class="space-y-4">
                <div class="flex items-center gap-1.5 h-1">
                  <div class="flex-1 h-full rounded-full transition-colors duration-300" :class="passStrength(field.value) >= 1 ? 'bg-primary' : 'bg-slate-200 dark:bg-border-dark'"></div>
                  <div class="flex-1 h-full rounded-full transition-colors duration-300" :class="passStrength(field.value) >= 2 ? 'bg-primary' : 'bg-slate-200 dark:bg-border-dark'"></div>
                  <div class="flex-1 h-full rounded-full transition-colors duration-300" :class="passStrength(field.value) >= 3 ? 'bg-primary' : 'bg-slate-200 dark:bg-border-dark'"></div>
                  <div class="flex-1 h-full rounded-full transition-colors duration-300" :class="passStrength(field.value) >= 4 ? 'bg-primary' : 'bg-slate-200 dark:bg-border-dark'"></div>
                </div>
                
                <div class="grid grid-cols-2 gap-2.5">
                  <div class="flex items-center gap-2 transition-opacity duration-300" :class="(field.value?.length || 0) >= 8 ? 'opacity-100' : 'opacity-40'">
                    <CheckCircleIcon v-if="(field.value?.length || 0) >= 8" class="w-4 h-4 text-primary shrink-0" />
                    <CircleIcon v-else class="w-4 h-4 text-slate-400 shrink-0" />
                    <span class="text-[11px] font-medium text-slate-700 dark:text-slate-200">8+ caracteres</span>
                  </div>
                  <div class="flex items-center gap-2 transition-opacity duration-300" :class="/\d/.test(field.value || '') ? 'opacity-100' : 'opacity-40'">
                    <CheckCircleIcon v-if="/\d/.test(field.value || '')" class="w-4 h-4 text-primary shrink-0" />
                    <CircleIcon v-else class="w-4 h-4 text-slate-400 shrink-0" />
                    <span class="text-[11px] font-medium text-slate-700 dark:text-slate-200">Un número</span>
                  </div>
                  <div class="flex items-center gap-2 transition-opacity duration-300" :class="/[!@#$%^&*(),.?':{}|<>]/.test(field.value || '') ? 'opacity-100' : 'opacity-40'">
                    <CheckCircleIcon v-if="/[!@#$%^&*(),.?':{}|<>]/.test(field.value || '')" class="w-4 h-4 text-primary shrink-0" />
                    <CircleIcon v-else class="w-4 h-4 text-slate-400 shrink-0" />
                    <span class="text-[11px] font-medium text-slate-700 dark:text-slate-200">Un símbolo</span>
                  </div>
                  <div class="flex items-center gap-2 transition-opacity duration-300" :class="/[A-Z]/.test(field.value || '') ? 'opacity-100' : 'opacity-40'">
                    <CheckCircleIcon v-if="/[A-Z]/.test(field.value || '')" class="w-4 h-4 text-primary shrink-0" />
                    <CircleIcon v-else class="w-4 h-4 text-slate-400 shrink-0" />
                    <span class="text-[11px] font-medium text-slate-700 dark:text-slate-200">Mayúscula</span>
                  </div>
                </div>
              </div>
            </VField>
          </div>

          <BaseInput 
            name="new_password_confirmation" 
            type="password" 
            label="Confirmar Nueva Contraseña" 
            placeholder="Repite la nueva contraseña" 
          />

          <!-- Actions -->
          <div class="flex items-center gap-3 pt-4">
            <BaseButton 
              type="button" 
              variant="secondary" 
              :disabled="isSubmittingPassword" 
              @click="$emit('update:modelValue', false)"
            >
              Cancelar
            </BaseButton>
            
            <BaseButton 
              type="submit" 
              variant="primary" 
              :loading="isSubmittingPassword"
              loadingText="Guardando..."
            >
              Guardar Cambios
            </BaseButton>
          </div>

        </VForm>

      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref } from 'vue'
import { Form as VForm, Field as VField } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/yup'
import { changePasswordSchema } from '~/utils/auth.validation'
import BaseInput from '~/components/BaseInput.vue'
import { 
  AlertCircleIcon,
  CheckCircleIcon,
  ShieldIcon,
  CircleIcon
} from 'lucide-vue-next'
import BaseButton from '~/components/BaseButton.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const auth = useAuth()
const isSubmittingPassword = ref(false)
const passwordSuccess = ref('')
const passwordError = ref('')

const typedPasswordSchema = toTypedSchema(changePasswordSchema)

const passStrength = (val) => {
  const v = val || ''
  let score = 0
  if (v.length >= 8) score++
  if (/\d/.test(v)) score++
  if (/[!@#$%^&*(),.?':{}|<>]/.test(v)) score++
  if (/[A-Z]/.test(v)) score++
  return score
}

const submitPasswordChange = async (values, { resetForm }) => {
  isSubmittingPassword.value = true
  passwordError.value = ''
  passwordSuccess.value = ''

  try {
    const config = useRuntimeConfig()
    const backendURL = config.public.apiBaseUrl || 'http://127.0.0.1:8000'
    
    await $fetch(`${backendURL}/api/auth/change-password`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${auth.token}`
      },
      body: values
    })
    
    passwordSuccess.value = 'Contraseña actualizada exitosamente.'
    resetForm()
    
    setTimeout(() => {
      emit('update:modelValue', false)
      passwordSuccess.value = ''
    }, 2000)
    
  } catch (e) {
    let errorMessage = e.data?.message || 'La contraseña actual es incorrecta o hubo un problema.'
    if (e.data?.errors) {
      const firstErrorKey = Object.keys(e.data.errors)[0]
      errorMessage = e.data.errors[firstErrorKey][0]
    }
    passwordError.value = errorMessage
  } finally {
    isSubmittingPassword.value = false
  }
}
</script>

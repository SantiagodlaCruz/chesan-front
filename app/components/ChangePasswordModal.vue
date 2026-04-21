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
      <div class="absolute inset-0 bg-slate-900/40 dark:bg-blue-950/40 backdrop-blur-sm" @click="close"></div>
      
      <!-- Modal Container -->
      <div class="relative bg-white dark:bg-card-dark w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-border-light dark:border-border-dark">
        
        <!-- Modal Header -->
        <div class="px-8 pt-8 pb-4">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <ShieldIcon class="w-5 h-5" />
            </div>
            <h2 class="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Cambiar Contraseña</h2>
          </div>
          <p class="text-sm text-slate-500 dark:text-slate-400">Actualiza tu clave de acceso para mantener tu cuenta segura.</p>
        </div>

        <!-- Form -->
        <VForm :validation-schema="typedPasswordSchema" @submit="submitPasswordChange" class="px-8 pb-8 space-y-6">
          
          <!-- Banners -->
          <Transition
            enter-active-class="transition duration-300 ease-out"
            enter-from-class="-translate-y-2 opacity-0"
            enter-to-class="translate-y-0 opacity-100"
          >
            <div v-if="passwordSuccess" class="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-accent-green/10 border border-accent-green/20 text-accent-green text-xs font-semibold">
              <CheckCircleIcon class="w-4 h-4 shrink-0" />
              {{ passwordSuccess }}
            </div>
            <div v-else-if="passwordError" class="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-accent-red/10 border border-accent-red/20 text-accent-red text-xs font-semibold">
              <AlertCircleIcon class="w-4 h-4 shrink-0" />
              {{ passwordError }}
            </div>
          </Transition>

          <BaseInput 
            name="current_password" 
            type="password" 
            label="Contraseña Actual" 
            placeholder="••••••••" 
          >
            <template #icon>
              <LockIcon class="w-4 h-4" />
            </template>
          </BaseInput>

          <BaseInput 
            name="new_password" 
            type="password" 
            label="Nueva Contraseña" 
            placeholder="Mínimo 8 caracteres" 
          >
            <template #icon>
              <LockIcon class="w-4 h-4" />
            </template>
          </BaseInput>

          <BaseInput 
            name="new_password_confirmation" 
            type="password" 
            label="Confirmar Nueva Contraseña" 
            placeholder="Repita la nueva contraseña" 
          >
            <template #icon>
              <LockIcon class="w-4 h-4" />
            </template>
          </BaseInput>

          <!-- Actions -->
          <div class="flex items-center gap-3 pt-4">
            <BaseButton 
              type="button" 
              variant="secondary" 
              class="flex-1"
              :disabled="loading" 
              @click="close"
            >
              Cancelar
            </BaseButton>
            
            <BaseButton 
              type="submit" 
              variant="primary" 
              class="flex-1"
              :loading="loading"
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
import { Form as VForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/yup'
import { changePasswordSchema } from '~/utils/auth.validation'
import BaseInput from '~/components/BaseInput.vue'
import { 
  AlertCircleIcon,
  CheckCircleIcon,
  ShieldIcon,
  LockIcon
} from 'lucide-vue-next'
import BaseButton from '~/components/BaseButton.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const loading = ref(false)
const passwordSuccess = ref('')
const passwordError = ref('')

const api = useApi()
const typedPasswordSchema = toTypedSchema(changePasswordSchema)

const close = () => {
  if (!loading.value) {
    emit('update:modelValue', false)
    passwordError.value = ''
    passwordSuccess.value = ''
  }
}

const submitPasswordChange = async (values, { resetForm }) => {
  loading.value = true
  passwordError.value = ''
  passwordSuccess.value = ''

  try {
    await api.post('/api/auth/change-password', values)
    
    passwordSuccess.value = 'Contraseña actualizada exitosamente.'
    resetForm()
    
    setTimeout(() => {
      close()
    }, 2000)
    
  } catch (e) {
    passwordError.value = e.data?.message || 'Error al actualizar la contraseña.'
    if (e.data?.errors) {
       const errors = Object.values(e.data.errors).flat()
       passwordError.value = errors[0]
    }
  } finally {
    loading.value = false
  }
}
</script>

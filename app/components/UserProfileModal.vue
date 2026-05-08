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
              <UserIcon class="w-5 h-5" />
            </div>
            <h2 class="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Mi Perfil</h2>
          </div>
          <p class="text-sm text-slate-500 dark:text-slate-400">Actualiza tus datos personales y de contacto.</p>
        </div>

        <!-- Form -->
        <VForm :validation-schema="typedSchema" :initial-values="initialValues" @submit="submitUpdate" class="px-8 pb-8 space-y-6">
          
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

          <BaseInput 
            name="name" 
            type="text" 
            label="Nombre Completo" 
            placeholder="Tu nombre" 
          >
            <template #icon>
              <UserIcon class="w-4 h-4" />
            </template>
          </BaseInput>

          <BaseInput 
            name="email" 
            type="email" 
            label="Correo Electrónico" 
            placeholder="ejemplo@correo.com" 
          >
            <template #icon>
              <MailIcon class="w-4 h-4" />
            </template>
          </BaseInput>

          <BaseInput 
            name="phone" 
            type="text" 
            label="Teléfono" 
            placeholder="10 dígitos" 
          >
            <template #icon>
              <PhoneIcon class="w-4 h-4" />
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
import { ref, computed } from 'vue'
import { Form as VForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/yup'
import { updateProfileSchema } from '~/utils/auth.validation'
import BaseInput from '~/components/BaseInput.vue'
import { 
  AlertCircleIcon,
  CheckCircleIcon,
  UserIcon,
  MailIcon,
  PhoneIcon
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
const loading = ref(false)
const successMsg = ref('')
const errorMsg = ref('')

const api = useApi()
const typedSchema = toTypedSchema(updateProfileSchema)

const initialValues = computed(() => {
  return {
    name: auth.user?.name || '',
    email: auth.user?.email || '',
    phone: auth.user?.phone || ''
  }
})

const close = () => {
  if (!loading.value) {
    emit('update:modelValue', false)
    errorMsg.value = ''
    successMsg.value = ''
  }
}

const submitUpdate = async (values) => {
  loading.value = true
  errorMsg.value = ''
  successMsg.value = ''

  try {
    const res = await api.post('/api/auth/update-profile', values)
    
    // Update local auth store user
    auth.user = res.data
    
    successMsg.value = 'Perfil actualizado exitosamente.'
    
    setTimeout(() => {
      close()
    }, 2000)
    
  } catch (e) {
    errorMsg.value = e.data?.message || 'Error al actualizar el perfil.'
    if (e.data?.errors) {
       const errors = Object.values(e.data.errors).flat()
       errorMsg.value = errors[0]
    }
  } finally {
    loading.value = false
  }
}
</script>

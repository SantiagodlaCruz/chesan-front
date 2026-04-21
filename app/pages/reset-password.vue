<template>
  <div class="flex items-center justify-center w-full min-h-screen font-display overflow-hidden bg-background-light dark:bg-[#0f172a]">
    <div class="w-full max-w-md p-8 relative transition-colors duration-300">
      
      <!-- Theme toggle top-right -->
      <div class="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <!-- Heading -->
      <div class="mb-8 text-center">
        <div class="mx-auto size-14 mb-4 bg-primary rounded-xl flex items-center justify-center shadow-xl shadow-primary/20">
          <ShirtIcon class="text-white size-8" stroke-width="2.5" />
        </div>
        <h2 class="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">Crear Nueva Contraseña</h2>
        <p v-if="!successMsg" class="text-slate-500 dark:text-slate-400 text-sm">
          Asegúrate de que tenga al menos 8 caracteres.
        </p>
      </div>

      <!-- Banners / Mensajes de Estado -->
      <Transition
        enter-active-class="transition duration-500 ease-out"
        enter-from-class="scale-95 opacity-0"
        enter-to-class="scale-100 opacity-100"
      >
        <!-- Tarjeta de Éxito -->
        <div v-if="successMsg" class="text-center bg-white dark:bg-[#1e293b] p-8 rounded-3xl shadow-2xl border border-slate-200 dark:border-white/5 flex flex-col items-center justify-center">
          <div class="size-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-5 ring-8 ring-green-500/5">
            <CheckCircleIcon class="w-8 h-8" stroke-width="2.5" />
          </div>
          <h3 class="text-2xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">¡Contraseña Actualizada!</h3>
          <p class="text-slate-500 dark:text-slate-400 text-sm mb-8 leading-relaxed">
            Tu cuenta ahora está protegida con tu nueva contraseña. Ya puedes acceder al sistema.
          </p>
          <NuxtLink to="/login" class="w-full">
            <BaseButton class="w-full py-3.5 text-base shadow-lg shadow-primary/20">
              Ir a Iniciar Sesión
            </BaseButton>
          </NuxtLink>
        </div>

        <!-- Banner de Error -->
        <div v-else-if="errorMsg" class="mb-6 flex items-center gap-3 px-4 py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm font-semibold shadow-sm">
          <AlertCircleIcon class="w-5 h-5 shrink-0" />
          <span class="leading-snug">{{ errorMsg }}</span>
        </div>
      </Transition>

      <!-- Formulario -->
      <VForm v-if="!successMsg" :validation-schema="schema" @submit="onSubmit" class="space-y-5">
        
        <!-- Password -->
        <div class="relative group">
          <BaseInput name="password" :type="showPassword ? 'text' : 'password'" label="Nueva Contraseña" placeholder="••••••••••••">
            <template #icon>
              <LockIcon class="w-4 h-4" />
            </template>
          </BaseInput>
          <button
            type="button"
            @click="showPassword = !showPassword"
            class="absolute right-10 top-8 text-slate-400 hover:text-primary transition-colors p-1"
          >
            <EyeOffIcon v-if="showPassword" class="w-4 h-4" />
            <EyeIcon v-else class="w-4 h-4" />
          </button>
        </div>

        <!-- Confirm Password -->
        <div class="relative group">
          <BaseInput name="password_confirmation" :type="showConfirmPassword ? 'text' : 'password'" label="Confirmar Contraseña" placeholder="••••••••••••">
            <template #icon>
              <LockIcon class="w-4 h-4" />
            </template>
          </BaseInput>
          <button
            type="button"
            @click="showConfirmPassword = !showConfirmPassword"
            class="absolute right-10 top-8 text-slate-400 hover:text-primary transition-colors p-1"
          >
            <EyeOffIcon v-if="showConfirmPassword" class="w-4 h-4" />
            <EyeIcon v-else class="w-4 h-4" />
          </button>
        </div>

        <!-- Acciones -->
        <div class="pt-4 flex flex-col gap-3">
          <BaseButton type="submit" :loading="isSubmitting" loading-text="Guardando...">
            Guardar Contraseña
          </BaseButton>
          <NuxtLink to="/login" class="text-center text-sm font-bold text-slate-400 hover:text-primary transition-colors">
            Cancelar
          </NuxtLink>
        </div>

      </VForm>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Form as VForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/yup'
import * as yup from 'yup'
import {
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  ShirtIcon
} from 'lucide-vue-next'

definePageMeta({ layout: 'auth' })

const route = useRoute()
const api = useApi()

const token = ref('')
const email = ref('')

const showPassword = ref(false)
const showConfirmPassword = ref(false)
const isSubmitting = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

onMounted(() => {
  token.value = route.query.token as string || ''
  email.value = route.query.email as string || ''
})

const schema = toTypedSchema(yup.object({
  password: yup.string()
    .required('La contraseña es requerida')
    .min(8, 'Debe tener al menos 8 caracteres'),
  password_confirmation: yup.string()
    .required('Confirme su contraseña')
    .oneOf([yup.ref('password')], 'Las contraseñas no coinciden')
}))

const onSubmit = async (values: any) => {
  if (!token.value || !email.value) {
    errorMsg.value = 'El enlace es inválido o está incompleto.'
    return
  }

  isSubmitting.value = true
  errorMsg.value = ''
  
  try {
    await api.post('/api/auth/reset-password', {
        token: token.value,
        email: email.value,
        password: values.password,
        password_confirmation: values.password_confirmation
    })
    
    successMsg.value = '¡Tu contraseña ha sido restablecida exitosamente!'
  } catch (e: any) {
    errorMsg.value = e.data?.message || 'Ocurrió un error. Es posible que el token haya expirado.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

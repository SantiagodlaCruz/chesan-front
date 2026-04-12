<template>
  <div class="flex w-full min-h-screen font-display overflow-hidden">

    <!-- ═══════════════════════════════════════════ -->
    <!-- LEFT PANEL — Branding (solo desktop) -->
    <!-- ═══════════════════════════════════════════ -->
    <div class="hidden lg:flex lg:w-1/2 relative flex-col justify-center items-center overflow-hidden fabric-bg border-r border-border-light dark:border-border-dark">

      <!-- Dot pattern -->
      <div class="absolute inset-0 pattern-bg dark:pattern-bg-dark opacity-100"></div>

      <!-- Glow blobs -->
      <div class="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]"></div>
      <div class="absolute top-[-5%] left-[-5%] w-[300px] h-[300px] bg-accent-red/5 rounded-full blur-[80px]"></div>

      <!-- Content -->
      <div class="relative z-10 w-full max-w-lg p-12">
        <!-- Logo + Title -->
        <div class="mb-14">
          <div class="flex items-center gap-4 mb-2">
            <div class="size-14 bg-primary rounded-xl flex items-center justify-center shadow-xl shadow-primary/20 shrink-0">
              <ShirtIcon class="text-white size-8" stroke-width="2.5" />
            </div>
            <h1 class="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
              CheSan
            </h1>
          </div>
          <p class="text-xl text-slate-500 dark:text-slate-400 font-light tracking-tight ml-1">
            Fábrica de <span class="text-primary font-semibold">Uniformes</span>
          </p>
        </div>

        <!-- Feature list -->
        <div class="space-y-6">
          <div class="flex items-start gap-4">
            <div class="p-2.5 rounded-lg bg-primary/10 shrink-0">
              <FactoryIcon class="text-primary w-5 h-5" />
            </div>
            <div>
              <h3 class="text-slate-800 dark:text-slate-100 font-bold text-base">Estatus de Producción</h3>
              <p class="text-slate-500 text-sm mt-0.5">Monitoreo en tiempo real del estatus y manufactura de órdenes.</p>
            </div>
          </div>
          <div class="flex items-start gap-4">
            <div class="p-2.5 rounded-lg bg-amber-500/10 shrink-0">
              <PackageIcon class="text-amber-500 w-5 h-5" />
            </div>
            <div>
              <h3 class="text-slate-800 dark:text-slate-100 font-bold text-base">Inventario Reactivo</h3>
              <p class="text-slate-500 text-sm mt-0.5">Manejo centralizado de stock, consumos y productos terminados.</p>
            </div>
          </div>
          <div class="flex items-start gap-4">
            <div class="p-2.5 rounded-lg bg-purple-500/10 shrink-0">
              <ShoppingCartIcon class="text-purple-500 w-5 h-5" />
            </div>
            <div>
              <h3 class="text-slate-800 dark:text-slate-100 font-bold text-base">Modulo Punto de Venta</h3>
              <p class="text-slate-500 text-sm mt-0.5">Procesa transacciones inmediatamente sincronizadas al almacén.</p>
            </div>
          </div>
          <div class="flex items-start gap-4">
            <div class="p-2.5 rounded-lg bg-accent-green/10 shrink-0">
              <BarChart3Icon class="text-accent-green w-5 h-5" />
            </div>
            <div>
              <h3 class="text-slate-800 dark:text-slate-100 font-bold text-base">Métricas Integrales</h3>
              <p class="text-slate-500 text-sm mt-0.5">Análisis de rendimiento, desempeño de ventas e ingresos al instante.</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════ -->
    <!-- RIGHT PANEL — Login form -->
    <!-- ═══════════════════════════════════════════ -->
    <div class="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 relative bg-background-light dark:bg-[#0f172a] transition-colors duration-300">

      <!-- Theme toggle top-right -->
      <div class="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div class="w-full max-w-md">

        <!-- Mobile logo -->
        <div class="mb-8 lg:hidden flex items-center gap-3">
          <div class="size-10 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
            <ShirtIcon class="text-white size-5" stroke-width="2.5" />
          </div>
          <span class="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">CheSan</span>
        </div>

        <!-- ======================= -->
        <!--  VISTA DE LOGIN         -->
        <!-- ======================= -->
        <div v-if="currentView === 'login'">
          <!-- Heading -->
          <div class="mb-8">
            <h2 class="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">Bienvenido</h2>
            <p class="text-slate-500 dark:text-slate-400 text-sm">Ingrese sus credenciales para acceder al sistema de gestión.</p>
          </div>

          <!-- Error banner -->
          <Transition
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="-translate-y-2 opacity-0"
          enter-to-class="translate-y-0 opacity-100"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="translate-y-0 opacity-100"
          leave-to-class="-translate-y-2 opacity-0"
        >
          <div v-if="loginError" class="mb-6 flex items-center gap-3 px-4 py-3 rounded-xl bg-accent-red/10 border border-accent-red/20 text-accent-red text-sm font-semibold">
            <AlertCircleIcon class="w-4 h-4 shrink-0" />
            {{ loginError }}
          </div>
        </Transition>

        <!-- Form -->
        <VForm :validation-schema="typedSchema" @submit="onSubmit" class="space-y-5">

          <!-- Email -->
          <BaseInput name="email" type="email" label="Correo Electrónico" placeholder="usuario@chesan.com">
            <template #icon>
              <MailIcon class="w-4 h-4" />
            </template>
          </BaseInput>

          <!-- Password -->
          <div>
            <div class="flex justify-between items-center px-1 mb-1.5">
              <label class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest transition-colors">
                Contraseña
              </label>
              <a href="#" @click.prevent="currentView = 'recovery'" class="text-xs font-bold text-primary hover:text-primary/70 transition-colors">
                ¿Olvidó su contraseña?
              </a>
            </div>
            <div class="relative group">
              <BaseInput name="password" :type="showPassword ? 'text' : 'password'" placeholder="••••••••••••">
                <template #icon>
                  <LockIcon class="w-4 h-4" />
                </template>
              </BaseInput>
              <!-- Toggle visibility -->
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-10 top-3.5 text-slate-400 hover:text-primary transition-colors flex items-center justify-center p-1"
                style="z-index: 10;"
              >
                <EyeOffIcon v-if="showPassword" class="w-4 h-4" />
                <EyeIcon v-else class="w-4 h-4" />
              </button>
            </div>
          </div>

         
          <!-- Submit -->
          <div class="pt-2">
            <BaseButton type="submit" :loading="isSubmitting" loading-text="Verificando...">
              Iniciar Sesión
            </BaseButton>
          </div>

        </VForm>

          <!-- Footer links -->
          <div class="mt-8 pt-8 border-t border-slate-200 dark:border-border-dark">
            <p class="text-center text-sm text-slate-500 dark:text-slate-400">
              ¿Problemas para acceder?
              <a href="#" class="text-accent-red font-bold hover:underline ml-1">Contactar a Soporte</a>
            </p>
          </div>
        </div>

        <!-- ======================= -->
        <!--  VISTA RECUPERACIÓN     -->
        <!-- ======================= -->
        <div v-else-if="currentView === 'recovery'">
          <!-- Heading -->
          <div class="mb-8">
            <button @click="currentView = 'login'" class="mb-6 flex items-center text-sm font-bold text-slate-400 hover:text-primary transition-colors focus:outline-none">
              <ChevronLeftIcon class="w-4 h-4 mr-1" />
              Volver
            </button>
            <h2 class="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">Restablecer</h2>
            <p class="text-slate-500 dark:text-slate-400 text-sm">Ingrese su correo electrónico registrado y le enviaremos instrucciones de recuperación.</p>
          </div>

          <!-- Banners -->
          <Transition
            enter-active-class="transition duration-300 ease-out"
            enter-from-class="-translate-y-2 opacity-0"
            enter-to-class="translate-y-0 opacity-100"
            leave-active-class="transition duration-200 ease-in"
            leave-from-class="translate-y-0 opacity-100"
            leave-to-class="-translate-y-2 opacity-0"
          >
            <div v-if="recoverySuccess" class="mb-6 flex flex-col gap-1 px-4 py-4 rounded-xl bg-accent-green/10 border border-accent-green/20 text-accent-green text-sm font-semibold">
              <div class="flex items-center gap-2">
                <CheckCircleIcon class="w-5 h-5 shrink-0" />
                <span>{{ recoverySuccess }}</span>
              </div>
            </div>
            <div v-else-if="recoveryError" class="mb-6 flex items-center gap-3 px-4 py-3 rounded-xl bg-accent-red/10 border border-accent-red/20 text-accent-red text-sm font-semibold">
              <AlertCircleIcon class="w-4 h-4 shrink-0" />
              {{ recoveryError }}
            </div>
          </Transition>

          <!-- Form -->
          <VForm :validation-schema="typedRecoverySchema" @submit="onRecoverySubmit" class="space-y-5">
            <!-- Email -->
            <BaseInput name="email" type="email" label="Correo Electrónico" placeholder="usuario@chesan.com">
              <template #icon>
                <MailIcon class="w-4 h-4" />
              </template>
            </BaseInput>

            <div class="pt-2">
              <BaseButton type="submit" :loading="isSubmittingRecovery" loading-text="Enviando correo...">
                Enviar Instrucciones
              </BaseButton>
            </div>
          </VForm>

          <!-- Footer -->
          <div class="mt-8 pt-8 border-t border-slate-200 dark:border-border-dark">
            <p class="text-center text-sm text-slate-500 dark:text-slate-400">
              ¿No recibió el correo?
              <button @click="onRecoverySubmit({email: lastRecoveryEmail})" class="text-primary font-bold hover:underline ml-1" :disabled="isSubmittingRecovery || !lastRecoveryEmail">Reenviar correo</button>
            </p>
          </div>
        </div>
      </div>

      <!-- Bottom footer -->
      <footer class="absolute bottom-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-slate-400 dark:text-slate-600 font-medium px-4">
        <span class="text-slate-300 dark:text-slate-700">© 2026 Chesan</span>
      </footer>
    </div>

  </div>
</template>

<script setup lang="ts">
import { Form as VForm, Field as VField } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/yup'
import * as yup from 'yup'
import {
  MailIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  LogInIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  FactoryIcon,
  PackageIcon,
  ShoppingCartIcon,
  BarChart3Icon,
  ShirtIcon,
  ChevronLeftIcon,
} from 'lucide-vue-next'

import { loginSchema, recoverySchema } from '~/utils/auth.validation'

definePageMeta({ layout: 'auth' })

const { login } = useAuth()
const isSubmitting = ref(false)
const showPassword = ref(false)
const loginError = ref('')

const currentView = ref('login')
const isSubmittingRecovery = ref(false)
const recoveryError = ref('')
const recoverySuccess = ref('')
const lastRecoveryEmail = ref('')

const typedSchema = hideToTypedSchema(loginSchema)
const typedRecoverySchema = hideToTypedSchema(recoverySchema)

// Workaround for toTypedSchema if needed or use it directly
function hideToTypedSchema(schema: any) {
  return toTypedSchema(schema)
}

const onRecoverySubmit = async (values: any) => {
  isSubmittingRecovery.value = true
  recoveryError.value = ''
  recoverySuccess.value = ''
  try {
    const config = useRuntimeConfig()
    const backendURL = config.public.apiBaseUrl || 'http://127.0.0.1:8000'
    await $fetch(`${backendURL}/api/auth/forgot-password`, {
      method: 'POST',
      body: { email: values.email }
    })
    recoverySuccess.value = 'Se han enviado las instrucciones a tu correo electrónico registrado.'
    lastRecoveryEmail.value = values.email
  } catch (e: any) {
    recoveryError.value = e.data?.message || 'Ocurrió un error al procesar tu solicitud.'
  } finally {
    isSubmittingRecovery.value = false
  }
}

const onSubmit = async (values: any) => {
  isSubmitting.value = true
  loginError.value = ''
  try {
    await login({ email: values.email, password: values.password })
  } catch (e: any) {
    loginError.value = e.message || 'Credenciales incorrectas. Por favor intente de nuevo.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style>
/* Left panel backgrounds — matching dashboard palette */
.fabric-bg {
  background: linear-gradient(135deg, #ffffff 0%, #f0f4f8 100%);
  transition: background 0.3s ease;
}

.dark .fabric-bg {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
}

/* Dot pattern — light */
.pattern-bg {
  background-color: transparent;
  background-image: radial-gradient(circle at 2px 2px, rgba(59, 130, 246, 0.08) 1px, transparent 0);
  background-size: 24px 24px;
}
/* Dot pattern — dark */
.dark .pattern-bg-dark {
  background-image: radial-gradient(circle at 2px 2px, rgba(255, 255, 255, 0.05) 1px, transparent 0);
  background-size: 24px 24px;
}
</style>

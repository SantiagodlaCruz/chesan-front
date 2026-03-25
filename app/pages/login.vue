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
        <div class="mb-10">
          <div class="size-16 bg-primary rounded-xl flex items-center justify-center mb-6 shadow-xl shadow-primary/20">
            <svg class="text-white size-10" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M24 45.8096C19.6865 45.8096 15.4698 44.5305 11.8832 42.134C8.29667 39.7376 5.50128 36.3314 3.85056 32.3462C2.19985 28.361 1.76794 23.9758 2.60947 19.7452C3.451 15.5145 5.52816 11.6284 8.57829 8.5783C11.6284 5.52817 15.5145 3.45101 19.7452 2.60948C23.9758 1.76795 28.361 2.19986 32.3462 3.85057C36.3314 5.50129 39.7376 8.29668 42.134 11.8833C44.5305 15.4698 45.8096 19.6865 45.8096 24L24 24L24 45.8096Z" fill="currentColor"/>
            </svg>
          </div>
          <h1 class="text-5xl font-black text-slate-900 dark:text-white leading-tight tracking-tighter">
            Chesan<br/>
            <span class="text-primary font-light">Manufactura Textil</span>
          </h1>
        </div>

        <!-- Feature list -->
        <div class="space-y-6">
          <div class="flex items-start gap-4">
            <div class="p-2.5 rounded-lg bg-primary/10 shrink-0">
              <FactoryIcon class="text-primary w-5 h-5" />
            </div>
            <div>
              <h3 class="text-slate-800 dark:text-slate-100 font-bold text-base">Control de Calidad</h3>
              <p class="text-slate-500 text-sm mt-0.5">Monitoreo en tiempo real de cada fase de producción.</p>
            </div>
          </div>
          <div class="flex items-start gap-4">
            <div class="p-2.5 rounded-lg bg-accent-red/10 shrink-0">
              <RulerIcon class="text-accent-red w-5 h-5" />
            </div>
            <div>
              <h3 class="text-slate-800 dark:text-slate-100 font-bold text-base">Diseño Técnico</h3>
              <p class="text-slate-500 text-sm mt-0.5">Gestión avanzada de patrones y especificaciones.</p>
            </div>
          </div>
          <div class="flex items-start gap-4">
            <div class="p-2.5 rounded-lg bg-accent-green/10 shrink-0">
              <BarChart3Icon class="text-accent-green w-5 h-5" />
            </div>
            <div>
              <h3 class="text-slate-800 dark:text-slate-100 font-bold text-base">Reportes en Tiempo Real</h3>
              <p class="text-slate-500 text-sm mt-0.5">Métricas de producción, ventas e inventario al instante.</p>
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
          <div class="size-9 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
            <svg class="text-white size-5" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M24 45.8096C19.6865 45.8096 15.4698 44.5305 11.8832 42.134C8.29667 39.7376 5.50128 36.3314 3.85056 32.3462C2.19985 28.361 1.76794 23.9758 2.60947 19.7452C3.451 15.5145 5.52816 11.6284 8.57829 8.5783C11.6284 5.52817 15.5145 3.45101 19.7452 2.60948C23.9758 1.76795 28.361 2.19986 32.3462 3.85057C36.3314 5.50129 39.7376 8.29668 42.134 11.8833C44.5305 15.4698 45.8096 19.6865 45.8096 24L24 24L24 45.8096Z" fill="currentColor"/>
            </svg>
          </div>
          <span class="text-2xl font-black text-primary tracking-tight">Chesan</span>
        </div>

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
              <a href="#" class="text-xs font-bold text-primary hover:text-primary/70 transition-colors">
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

          <!-- Remember me -->
          <div class="flex items-center gap-2.5 px-1">
            <input
              id="remember"
              type="checkbox"
              class="w-4 h-4 rounded border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark text-primary focus:ring-primary/30 focus:ring-2 transition-colors"
            />
            <label for="remember" class="text-sm text-slate-600 dark:text-slate-400 cursor-pointer select-none">
              Mantener sesión iniciada
            </label>
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

      <!-- Bottom footer -->
      <footer class="absolute bottom-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-slate-400 dark:text-slate-600 font-medium px-4">
        <a href="#" class="hover:text-primary transition-colors">Términos de Servicio</a>
        <a href="#" class="hover:text-primary transition-colors">Política de Privacidad</a>
        <a href="#" class="hover:text-primary transition-colors">Ayuda Técnica</a>
        <span class="text-slate-300 dark:text-slate-700">© 2024 Chesan Group</span>
      </footer>
    </div>

  </div>
</template>

<script setup>
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
  RulerIcon,
  BarChart3Icon,
} from 'lucide-vue-next'

import { loginSchema } from '~/utils/auth.validation'

definePageMeta({ layout: 'auth' })

const { login } = useAuth()
const isSubmitting = ref(false)
const showPassword = ref(false)
const loginError = ref('')

const typedSchema = toTypedSchema(loginSchema)

const onSubmit = async (values) => {
  isSubmitting.value = true
  loginError.value = ''
  try {
    await new Promise(resolve => setTimeout(resolve, 1500))
    login({ email: values.email, name: 'Aziel' }, 'fake-jwt-token')
  } catch (e) {
    loginError.value = 'Credenciales incorrectas. Por favor intente de nuevo.'
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

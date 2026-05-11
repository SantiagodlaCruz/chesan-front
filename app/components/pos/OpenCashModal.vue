<template>
  <BaseModal
    :show="show"
    title="Inicio de Caja"
    subtitle="Ingresa el fondo inicial para comenzar a operar el punto de venta hoy."
    size="md"
    :closeOnBackdrop="false"
    :showClose="false"
  >
    <div class="space-y-6">
      <div class="flex flex-col items-center text-center mb-4">
        <div class="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-2">
          <BanknoteIcon class="w-8 h-8 text-primary" />
        </div>
      </div>

      <div>
        <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Fondo Inicial (Efectivo)</label>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <span class="text-lg font-bold text-slate-400">$</span>
          </div>
          <input
            v-model.number="openingBalance"
            type="number"
            step="0.01"
            min="0"
            class="block w-full pl-8 pr-4 py-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-xl font-black text-slate-800 dark:text-white outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-slate-400"
            placeholder="0.00"
            autofocus
            @keyup.enter="handleOpen"
          />
        </div>
      </div>

      <button
        @click="handleOpen"
        :disabled="loading || openingBalance < 0"
        class="w-full py-4 bg-primary hover:bg-primary/90 text-white font-black text-sm uppercase tracking-[0.2em] rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-3"
      >
        <div v-if="loading" class="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
        <PlayIcon v-else class="w-5 h-5" />
        Abrir Caja Registradora
      </button>
      
      <button
        @click="logout"
        class="w-full py-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-[10px] font-bold uppercase tracking-widest transition-colors"
      >
        Cerrar Sesión de Usuario
      </button>
    </div>
  </BaseModal>
</template>

<script setup>
import { ref } from 'vue'
import { BanknoteIcon, PlayIcon } from 'lucide-vue-next'
import BaseModal from '~/components/BaseModal.vue'

const props = defineProps({
  show: Boolean,
})

const emit = defineEmits(['opened'])

const openingBalance = ref(500)
const loading = ref(false)
const api = useApi()
const { logout: authLogout } = useAuth()

const handleOpen = async () => {
  if (openingBalance.value < 0 || loading.value) return
  
  loading.value = true
  try {
    const response = await api.post('/api/cash-register/open', {
      opening_balance: openingBalance.value
    })
    emit('opened', response.data.session)
  } catch (error) {
    console.error('Error opening cash register:', error)
    alert(error.data?.message || 'Error al abrir la caja')
  } finally {
    loading.value = false
  }
}

const logout = async () => {
  await authLogout()
  window.location.reload()
}
</script>

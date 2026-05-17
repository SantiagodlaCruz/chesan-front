<template>
  <BaseModal
    :show="show"
    title="Corte de Caja"
    subtitle="Resumen de operaciones del turno actual"
    size="xl"
    @update:show="emit('update:show', $event)"
  >
    <div v-if="loadingSummary" class="py-20 flex flex-col items-center justify-center gap-4">
      <div class="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
      <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Calculando saldos...</p>
    </div>

    <div v-else-if="summary" class="space-y-8">
      <Transition name="fade" mode="out-in">
        <!-- Main Form -->
        <div v-if="!showConfirm" key="form" class="space-y-8">
          <!-- Totals Grid -->
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div class="bg-slate-50 dark:bg-white/5 p-5 rounded-2xl border border-slate-200 dark:border-white/5">
              <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Fondo Inicial</p>
              <p class="text-xl font-black text-slate-800 dark:text-white">{{ formatMoney(summary.opening_balance) }}</p>
            </div>
            <div class="bg-slate-50 dark:bg-white/5 p-5 rounded-2xl border border-slate-200 dark:border-white/5">
              <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Ventas Efectivo</p>
              <p class="text-xl font-black text-slate-800 dark:text-white">{{ formatMoney(summary.cash_sales) }}</p>
            </div>
            <div class="bg-green-50 dark:bg-green-500/5 p-5 rounded-2xl border border-green-200 dark:border-green-500/10">
              <p class="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase tracking-widest mb-1">Ingresos Extras</p>
              <p class="text-xl font-black text-green-600 dark:text-green-400">{{ formatMoney(summary.inflows) }}</p>
            </div>
            <div class="bg-red-50 dark:bg-red-500/5 p-5 rounded-2xl border border-red-200 dark:border-red-500/10">
              <p class="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-1">Salidas / Gastos</p>
              <p class="text-xl font-black text-red-600 dark:text-red-400">{{ formatMoney(summary.outflows) }}</p>
            </div>
            <div class="md:col-span-2 bg-primary/5 p-5 rounded-2xl border border-primary/20">
              <p class="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Efectivo Esperado</p>
              <p class="text-2xl font-black text-primary">{{ formatMoney(summary.expected_cash) }}</p>
            </div>
          </div>

          <!-- Informative Totals -->
          <div class="flex items-center gap-4 py-4 px-5 bg-slate-50 dark:bg-white/5 rounded-2xl text-sm font-bold text-slate-500">
            <div class="flex-1 flex flex-col">
              <span class="text-[9px] uppercase tracking-widest opacity-60">Tarjeta (Ref)</span>
              <span class="text-slate-700 dark:text-slate-300">{{ formatMoney(summary.card_sales) }}</span>
            </div>
            <div class="w-px h-8 bg-slate-200 dark:bg-white/10"></div>
            <div class="flex-1 flex flex-col text-right">
              <span class="text-[9px] uppercase tracking-widest opacity-60">Transferencia (Ref)</span>
              <span class="text-slate-700 dark:text-slate-300">{{ formatMoney(summary.transfer_sales) }}</span>
            </div>
          </div>

          <!-- Closing Form -->
          <div class="space-y-6 pt-4 border-t border-slate-200 dark:border-white/10">
            <div>
              <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Efectivo Real en Caja (Conteo Físico)</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span class="text-lg font-bold text-slate-400">$</span>
                </div>
                <input
                  v-model.number="realCash"
                  type="number"
                  step="0.01"
                  class="block w-full pl-8 pr-4 py-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-xl font-black text-slate-800 dark:text-white outline-none focus:border-primary transition-all"
                  placeholder="0.00"
                />
              </div>
              
              <!-- Difference Indicator -->
              <div v-if="realCash !== null" class="mt-3 flex items-center justify-between px-4 py-2 rounded-xl text-xs font-bold"
                  :class="difference >= 0 ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'">
                <span>Diferencia:</span>
                <span>{{ difference >= 0 ? '+' : '' }}{{ formatMoney(difference) }}</span>
              </div>
            </div>

            <div>
              <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Observaciones / Notas</label>
              <textarea
                v-model="notes"
                rows="2"
                class="block w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-sm text-slate-800 dark:text-white outline-none focus:border-primary transition-all resize-none"
                placeholder="Ej. Faltaron $5 pesos, se pagó agua..."
              ></textarea>
            </div>

            <div class="flex gap-4">
              <button
                @click="emit('update:show', false)"
                class="flex-1 py-4 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 font-bold text-xs uppercase tracking-widest transition-colors"
              >
                Continuar Vendiendo
              </button>
              <button
                @click="showConfirm = true"
                :disabled="loadingClose || realCash === null"
                class="flex-[2] py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-sm uppercase tracking-[0.2em] rounded-2xl transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
              >
                <LockIcon class="w-5 h-5" />
                Finalizar y Cerrar Caja
              </button>
            </div>
          </div>
        </div>

        <!-- Confirmation Step -->
        <div v-else key="confirm" class="py-12 px-6 flex flex-col items-center text-center space-y-6 animate-in fade-in zoom-in duration-300">
          <div class="w-20 h-20 bg-amber-500/10 rounded-3xl flex items-center justify-center text-amber-500 mb-2">
            <AlertTriangleIcon class="w-10 h-10" />
          </div>
          <div class="space-y-2">
            <h3 class="text-xl font-black text-slate-800 dark:text-white">¿Confirmar Cierre de Caja?</h3>
            <p class="text-sm text-slate-500 leading-relaxed max-w-xs">
              Una vez cerrada la caja, no podrás realizar más ventas ni movimientos hasta el próximo turno.
            </p>
          </div>

          <div class="w-full flex flex-col gap-3 pt-6">
            <button
              @click="handleClose"
              :disabled="loadingClose"
              class="w-full py-4 bg-primary text-white font-black text-sm uppercase tracking-[0.2em] rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
            >
              <span v-if="loadingClose">Cerrando...</span>
              <span v-else>Sí, Confirmar Cierre</span>
            </button>
            <button
              @click="showConfirm = false"
              class="w-full py-4 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 font-bold text-xs uppercase tracking-widest transition-colors"
            >
              No, Volver al Resumen
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </BaseModal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { FlagIcon, LockIcon, AlertTriangleIcon } from 'lucide-vue-next'
import BaseModal from '~/components/BaseModal.vue'

import { useToast } from '~/composables/useToast'

const props = defineProps({
  show: Boolean,
})

const emit = defineEmits(['update:show', 'closed'])

const { formatMoney } = useFormatter()
const api = useApi()
const { showToast } = useToast()

const summary = ref(null)
const loadingSummary = ref(false)
const realCash = ref(null)
const notes = ref('')
const loadingClose = ref(false)
const showConfirm = ref(false)

const difference = computed(() => {
  if (!summary.value || realCash.value === null) return 0
  return realCash.value - summary.value.expected_cash
})

const fetchSummary = async () => {
  loadingSummary.value = true
  try {
    const response = await api.get('/api/cash-register/summary')
    summary.value = response.summary
    realCash.value = summary.value.expected_cash
  } catch (error) {
    console.error('Error fetching summary:', error)
  } finally {
    loadingSummary.value = false
  }
}

watch(() => props.show, (newVal) => {
  if (newVal) {
    realCash.value = null
    fetchSummary()
    notes.value = ''
    showConfirm.value = false
  }
})

const handleClose = async () => {
  if (realCash.value === null || loadingClose.value) return
  
  loadingClose.value = true
  try {
    const response = await api.post('/api/cash-register/close', {
      real_cash: realCash.value,
      notes: notes.value
    })
    emit('closed', response.session)
    emit('update:show', false)
  } catch (error) {
    console.error('Error closing cash register:', error)
    showToast(error.message || 'Error al cerrar la caja', 'error')
  } finally {
    loadingClose.value = false
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>

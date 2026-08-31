<template>
  <BaseModal
    :show="show"
    title="Corte de Caja"
    subtitle="Resumen de operaciones y arqueo del turno actual"
    size="4xl"
    @update:show="emit('update:show', $event)"
  >
    <!-- Loading State -->
    <div v-if="loadingSummary" class="py-20 flex flex-col items-center justify-center gap-4">
      <div class="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
      <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Calculando saldos y liquidaciones...</p>
    </div>

    <!-- Main Content -->
    <div v-else-if="summary">
      <!-- Vista Principal (2 Columnas) -->
      <div v-if="!showConfirm" class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        <!-- COLUMNA IZQUIERDA: Balance y Desglose Financiero (7 cols) -->
        <div class="lg:col-span-7 space-y-4">
          
          <!-- Hero Card: Efectivo Esperado -->
          <div class="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-5 rounded-2xl border border-primary/20">
            <div class="flex items-center justify-between mb-3">
              <div>
                <span class="text-[10px] font-black text-primary uppercase tracking-widest block">Efectivo Esperado en Cajón</span>
                <p class="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Dinero físico que debe haber en caja</p>
              </div>
              <p class="text-3xl font-black text-primary tracking-tight">{{ formatMoney(summary.expected_cash) }}</p>
            </div>

            <!-- Mini Pipeline de Cálculo -->
            <div class="grid grid-cols-3 gap-2 pt-3 border-t border-primary/15 text-[10px]">
              <div class="bg-white/60 dark:bg-slate-800/60 p-2 rounded-xl border border-slate-200/50 dark:border-white/5">
                <span class="text-slate-400 font-bold block uppercase text-[8px]">Fondo Inicial</span>
                <span class="font-bold text-slate-700 dark:text-slate-200">{{ formatMoney(summary.opening_balance) }}</span>
              </div>
              <div class="bg-white/60 dark:bg-slate-800/60 p-2 rounded-xl border border-slate-200/50 dark:border-white/5">
                <span class="text-blue-500 font-bold block uppercase text-[8px]">+ Cobros Efectivo</span>
                <span class="font-bold text-blue-600 dark:text-blue-400">+{{ formatMoney(summary.cash_sales) }}</span>
              </div>
              <div class="bg-white/60 dark:bg-slate-800/60 p-2 rounded-xl border border-slate-200/50 dark:border-white/5">
                <span class="text-red-500 font-bold block uppercase text-[8px]">- Salidas / Gastos</span>
                <span class="font-bold text-red-600 dark:text-red-400">-{{ formatMoney(summary.outflows) }}</span>
              </div>
            </div>
          </div>

          <!-- Desglose de Entradas en Efectivo (3 Tarjetas) -->
          <div class="space-y-2.5">
            <div class="flex items-center justify-between px-1">
              <span class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <ReceiptIcon class="w-3.5 h-3.5 text-primary" />
                Origen del Dinero en Efectivo
              </span>
              <span class="text-[9px] font-bold text-slate-400">Total: {{ formatMoney(summary.cash_sales) }}</span>
            </div>

            <div class="grid grid-cols-3 gap-2.5">
              <!-- Ventas Directas -->
              <div class="p-3 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200/80 dark:border-white/5 flex flex-col justify-between">
                <div>
                  <div class="flex items-center justify-between gap-1 mb-1">
                    <span class="text-[9px] font-bold text-slate-500 uppercase truncate">Ventas Directas</span>
                    <span class="text-[8px] px-1 py-0.2 bg-slate-200/60 dark:bg-white/10 rounded font-bold text-slate-500 shrink-0">
                      {{ summary.breakdown?.direct_sales?.count || 0 }}
                    </span>
                  </div>
                  <p class="text-base font-black text-slate-800 dark:text-white">
                    {{ formatMoney(summary.breakdown?.direct_sales?.cash || 0) }}
                  </p>
                </div>
                <span class="text-[8px] text-slate-400 mt-1 block">Tickets del turno</span>
              </div>

              <!-- Anticipos de Apartados -->
              <div class="p-3 bg-amber-50/50 dark:bg-amber-500/5 rounded-2xl border border-amber-200/60 dark:border-amber-500/10 flex flex-col justify-between">
                <div>
                  <div class="flex items-center justify-between gap-1 mb-1">
                    <span class="text-[9px] font-bold text-amber-600 dark:text-amber-400 uppercase truncate">Anticipos</span>
                    <span class="text-[8px] px-1 py-0.2 bg-amber-500/20 text-amber-700 dark:text-amber-300 rounded font-bold shrink-0">
                      {{ summary.breakdown?.layaway_advances?.count || 0 }}
                    </span>
                  </div>
                  <p class="text-base font-black text-amber-600 dark:text-amber-400">
                    {{ formatMoney(summary.breakdown?.layaway_advances?.cash || 0) }}
                  </p>
                </div>
                <span class="text-[8px] text-amber-600/70 dark:text-amber-400/70 mt-1 block">Nuevos apartados</span>
              </div>

              <!-- Liquidaciones de Apartados -->
              <div class="p-3 bg-emerald-50/50 dark:bg-emerald-500/5 rounded-2xl border border-emerald-200/60 dark:border-emerald-500/10 flex flex-col justify-between">
                <div>
                  <div class="flex items-center justify-between gap-1 mb-1">
                    <span class="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase truncate">Liquidaciones</span>
                    <span class="text-[8px] px-1 py-0.2 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 rounded font-bold shrink-0">
                      {{ summary.breakdown?.liquidations?.count || 0 }}
                    </span>
                  </div>
                  <p class="text-base font-black text-emerald-600 dark:text-emerald-400">
                    {{ formatMoney(summary.breakdown?.liquidations?.cash || 0) }}
                  </p>
                </div>
                <span class="text-[8px] text-emerald-600/70 dark:text-emerald-400/70 mt-1 block">Entregas de hoy</span>
              </div>
            </div>
          </div>

          <!-- Lista de Liquidaciones (si las hay) -->
          <div v-if="summary.liquidations_list && summary.liquidations_list.length > 0" class="p-3 bg-emerald-50/30 dark:bg-emerald-500/5 rounded-2xl border border-emerald-500/20 space-y-2">
            <div class="flex items-center justify-between px-1">
              <span class="text-[9px] font-black text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircleIcon class="w-3.5 h-3.5 text-emerald-500" />
                Apartados Liquidados en este Turno ({{ summary.liquidations_list.length }})
              </span>
              <span class="text-[9px] font-bold text-emerald-600 dark:text-emerald-400">Total: {{ formatMoney(summary.breakdown?.liquidations?.total || 0) }}</span>
            </div>

            <div class="max-h-28 overflow-y-auto divide-y divide-emerald-500/10 rounded-xl bg-white dark:bg-slate-800/90 border border-emerald-500/10">
              <div v-for="item in summary.liquidations_list" :key="item.id" class="px-3 py-1.5 text-xs flex items-center justify-between">
                <div>
                  <span class="font-bold text-slate-800 dark:text-slate-100 font-mono text-[11px]">{{ item.ticket_number }}</span>
                  <span class="text-slate-500 dark:text-slate-400 text-[10px] ml-1.5">• {{ item.customer_name }}</span>
                </div>
                <div class="text-right flex items-center gap-2">
                  <span 
                    class="text-[8px] font-black uppercase px-1.5 py-0.5 rounded"
                    :class="item.is_delivered ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300'"
                  >
                    {{ item.is_delivered ? 'Entregado' : 'Por entregar' }}
                  </span>
                  <span class="font-black text-emerald-600 dark:text-emerald-400 text-[11px]">+{{ formatMoney(item.liquidation_amount) }}</span>
                </div>
              </div>
            </div>
          </div>


          <!-- Pagos Digitales Informativos (Tarjeta / SPEI) -->
          <div class="flex items-center justify-between px-4 py-2.5 bg-slate-50 dark:bg-white/5 rounded-xl text-[10px] text-slate-500 border border-slate-200/60 dark:border-white/5">
            <span class="font-bold uppercase tracking-wider text-[8px] text-slate-400">Digital (Informativo):</span>
            <div class="flex items-center gap-4">
              <span>Tarjeta: <strong class="text-slate-700 dark:text-slate-200">{{ formatMoney(summary.card_sales) }}</strong></span>
              <span class="text-slate-300 dark:text-white/10">|</span>
              <span>SPEI / Transf: <strong class="text-slate-700 dark:text-slate-200">{{ formatMoney(summary.transfer_sales) }}</strong></span>
            </div>
          </div>

        </div>

        <!-- COLUMNA DERECHA: Conteo Físico & Arqueo (5 cols) -->
        <div class="lg:col-span-5 bg-slate-50/80 dark:bg-white/[0.03] p-5 rounded-2xl border border-slate-200 dark:border-white/10 space-y-4">
          
          <div>
            <label class="block text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest mb-1.5">
              Conteo Físico en Caja
            </label>
            <p class="text-[10px] text-slate-400 mb-2">Ingresa el total de dinero contado en el cajón</p>
            
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <span class="text-lg font-black text-slate-400">$</span>
              </div>
              <input
                v-model.number="realCash"
                type="number"
                v-numeric.decimal
                step="0.01"
                class="block w-full pl-8 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-xl font-black text-slate-900 dark:text-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                placeholder="0.00"
              />
            </div>

            <!-- Indicador de Cuadre -->
            <div v-if="realCash !== null" class="mt-2.5 flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all"
                :class="difference === 0 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : (difference > 0 ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20' : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20')">
              <span class="text-[10px] uppercase tracking-wider">
                {{ difference === 0 ? '✓ Caja Cuadrada' : (difference > 0 ? 'Sobrante:' : 'Faltante:') }}
              </span>
              <span class="font-black text-sm">
                {{ difference > 0 ? '+' : '' }}{{ formatMoney(difference) }}
              </span>
            </div>
          </div>

          <!-- Observaciones -->
          <div>
            <label class="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Notas u Observaciones</label>
            <textarea
              v-model="notes"
              rows="2"
              class="block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-800 dark:text-white outline-none focus:border-primary transition-all resize-none shadow-sm"
              placeholder="Opcional: comentarios del turno..."
            ></textarea>
          </div>

          <!-- Botones de Acción -->
          <div class="pt-2 space-y-2">
            <button
              @click="showConfirm = true"
              :disabled="loadingClose || realCash === null"
              class="w-full py-3.5 bg-primary hover:bg-primary/90 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-primary/20 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <LockIcon class="w-4 h-4" />
              Finalizar y Cerrar Caja
            </button>
            <button
              @click="emit('update:show', false)"
              class="w-full py-2.5 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 font-bold text-[11px] uppercase tracking-wider transition-colors text-center"
            >
              Continuar Vendiendo
            </button>
          </div>

        </div>

      </div>

      <!-- Pantalla de Confirmación de Cierre -->
      <div v-else class="py-10 px-6 flex flex-col items-center text-center space-y-5 animate-in fade-in zoom-in duration-300">
        <div class="w-16 h-16 bg-amber-500/10 rounded-3xl flex items-center justify-center text-amber-500 mb-1">
          <AlertTriangleIcon class="w-8 h-8" />
        </div>
        <div class="space-y-1.5">
          <h3 class="text-xl font-black text-slate-800 dark:text-white">¿Confirmar Cierre de Caja?</h3>
          <p class="text-xs text-slate-500 max-w-sm">
            Al cerrar la caja se registrará el arqueo con <strong class="text-slate-800 dark:text-white">{{ formatMoney(realCash) }}</strong> de efectivo físico.
          </p>
        </div>

        <div class="w-full max-w-xs flex flex-col gap-2.5 pt-4">
          <button
            @click="handleClose"
            :disabled="loadingClose"
            class="w-full py-3.5 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
          >
            <span v-if="loadingClose">Cerrando...</span>
            <span v-else>Sí, Confirmar Cierre</span>
          </button>
          <button
            @click="showConfirm = false"
            class="w-full py-2.5 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 font-bold text-[11px] uppercase tracking-wider transition-colors"
          >
            No, Volver al Resumen
          </button>
        </div>
      </div>
    </div>

    <!-- Error / Fallback State -->
    <div v-else class="py-16 text-center space-y-4">
      <p class="text-sm text-slate-500 dark:text-slate-400">No se pudo cargar el resumen de caja o no hay una sesión abierta.</p>
      <button @click="fetchSummary" class="px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
        Reintentar Carga
      </button>
    </div>
  </BaseModal>
</template>

<script setup>

import { ref, computed, watch, onMounted } from 'vue'
import { FlagIcon, LockIcon, AlertTriangleIcon, ReceiptIcon, CheckCircleIcon } from 'lucide-vue-next'
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
    const data = response?.summary || response?.data?.summary || response
    summary.value = data
    if (data && data.expected_cash !== undefined) {
      realCash.value = data.expected_cash
    }
  } catch (error) {
    console.error('Error fetching summary:', error)
    summary.value = null
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
}, { immediate: true })

onMounted(() => {
  if (props.show) {
    fetchSummary()
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

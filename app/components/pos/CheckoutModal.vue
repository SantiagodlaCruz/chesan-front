<template>
  <BaseModal
    :show="show"
    title="Confirmación de Pago"
    subtitle="Verifica el monto y el método de pago antes de imprimir."
    size="md"
    @update:show="close"
  >
    <div class="space-y-4">
      <!-- Resumen Financiero -->
      <div class="bg-primary/5 dark:bg-primary/10 border border-primary/10 rounded-xl p-4 text-center">
        <span class="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] block mb-1">
          {{ isLayaway ? 'Anticipo del Apartado' : (total < 0 ? 'Monto a Devolver' : 'Total a Cobrar') }}
        </span>
        <div class="flex items-baseline justify-center gap-1.5">
          <span 
            class="text-3xl font-black tracking-tight"
            :class="total < 0 ? 'text-amber-500' : 'text-primary'"
            style="text-shadow: 0 0 30px rgba(59,130,246,0.25)"
          >
            {{ formatMoney(Math.abs(amountToPay)) }}
          </span>
          <span class="text-[10px] text-slate-400 font-bold tracking-widest uppercase">MXN</span>
        </div>

        <!-- Información adicional del apartado -->
        <div v-if="isLayaway" class="mt-3 pt-2.5 border-t border-slate-200/50 dark:border-white/5 grid grid-cols-2 gap-4 text-left">
          <div>
            <span class="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">Total de Venta</span>
            <span class="text-xs font-extrabold text-slate-700 dark:text-slate-200">{{ formatMoney(total) }}</span>
          </div>
          <div>
            <span class="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">Restante por Pagar</span>
            <span class="text-xs font-extrabold text-indigo-500 dark:text-indigo-400">{{ formatMoney(total - amountToPay) }}</span>
          </div>
        </div>
      </div>

      <!-- Método de Pago -->
      <div class="py-2.5 px-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200/60 dark:border-white/10 flex items-center justify-between">
        <div>
          <span class="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Método de Pago</span>
          <span class="text-xs font-extrabold text-slate-700 dark:text-slate-200 uppercase tracking-widest flex items-center gap-1.5">
            <component :is="paymentIcon" class="w-3.5 h-3.5 text-primary" />
            {{ paymentMethodLabel }}
          </span>
        </div>
        <div>
          <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-primary/10 text-primary border border-primary/20 uppercase tracking-wider">
            Listo
          </span>
        </div>
      </div>

      <!-- Sección de Efectivo y Cambio (Grid de 2 columnas) -->
      <div 
        v-if="paymentMethod === 'cash' && amountToPay > 0" 
        class="grid grid-cols-2 gap-4 border-t border-slate-200/50 dark:border-white/5 pt-4"
      >
        <!-- Columna Izquierda: Entrada de Efectivo y Sugerencias -->
        <div class="space-y-3">
          <div>
            <label class="block text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.15em] mb-1.5 ml-1">
              Efectivo Recibido
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span class="text-base font-bold text-slate-400">$</span>
              </div>
              <input
                ref="cashInput"
                v-model.number="receivedAmount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                class="block w-full pl-7 pr-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-base font-black text-slate-800 dark:text-white outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-slate-400"
                @keydown.enter="handleEnterKey"
              />
            </div>
          </div>

          <!-- Botones de billetes sugeridos -->
          <div class="space-y-1">
            <span class="block text-[8px] font-bold text-slate-400 uppercase tracking-wider ml-1">Billetes sugeridos</span>
            <div class="flex flex-wrap gap-1">
              <button
                type="button"
                @click="receivedAmount = amountToPay"
                class="px-2 py-0.5 text-[9px] font-bold rounded-md border border-slate-200 dark:border-white/10 bg-white dark:bg-card-dark text-slate-700 dark:text-slate-300 hover:border-primary hover:text-primary transition-all"
              >
                Exacto
              </button>
              <button
                v-for="bill in quickBills"
                :key="bill"
                type="button"
                @click="receivedAmount = bill"
                class="px-2 py-0.5 text-[9px] font-bold rounded-md border border-slate-200 dark:border-white/10 bg-white dark:bg-card-dark text-slate-700 dark:text-slate-300 hover:border-primary hover:text-primary transition-all"
              >
                ${{ bill }}
              </button>
            </div>
          </div>
        </div>

        <!-- Columna Derecha: Cambio a Entregar -->
        <div 
          class="rounded-xl border transition-all duration-300 text-center flex flex-col justify-center p-3 h-full min-h-[95px]"
          :class="isInsufficient 
            ? 'bg-red-500/10 border-red-500/20 text-red-500' 
            : 'bg-green-500/10 border-green-500/20 text-green-500'"
        >
          <span class="text-[9px] font-bold uppercase tracking-[0.15em] mb-1">
            {{ isInsufficient ? 'Efectivo Insuficiente' : 'Cambio a Entregar' }}
          </span>
          <span class="text-2xl font-black tracking-tight font-mono">
            {{ formatMoney(changeAmount) }}
          </span>
        </div>
      </div>

      <!-- Acciones (Botones en línea) -->
      <div class="grid grid-cols-2 gap-3 border-t border-slate-200/50 dark:border-white/5 pt-4">
        <BaseButton 
          variant="secondary" 
          @click="close" 
          class="w-full py-2.5 text-xs font-bold" 
          :disabled="loading"
        >
          Volver
        </BaseButton>

        <button
          type="button"
          @click="confirm"
          :disabled="loading || (paymentMethod === 'cash' && amountToPay > 0 && isInsufficient)"
          class="w-full py-2.5 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          :class="total < 0 
            ? 'bg-amber-500 hover:bg-amber-400 shadow-amber-500/10' 
            : 'bg-primary hover:bg-primary/90 shadow-primary/10'"
        >
          <div v-if="loading" class="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
          <ReceiptIcon v-else class="w-4 h-4" />
          {{ loading ? 'Procesando...' : (isLayaway ? 'Confirmar' : (total < 0 ? 'Devolver' : 'Cobrar')) }}
        </button>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { 
  BanknoteIcon, 
  CreditCardIcon, 
  ArrowRightLeftIcon, 
  ReceiptIcon 
} from 'lucide-vue-next'
import BaseModal from '~/components/BaseModal.vue'
import BaseButton from '~/components/BaseButton.vue'
import { useFormatter } from '~/composables/useFormatter'

const props = defineProps({
  show: { type: Boolean, default: false },
  total: { type: Number, default: 0 },
  isLayaway: { type: Boolean, default: false },
  layawayDeposit: { type: Number, default: 0 },
  paymentMethod: { type: String, default: 'cash' },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['update:show', 'confirm'])

const { formatMoney } = useFormatter()
const cashInput = ref(null)
const receivedAmount = ref(null)

// Monto real que se cobra en esta transacción
const amountToPay = computed(() => {
  return props.isLayaway ? props.layawayDeposit : props.total
})

// Cambio a entregar
const changeAmount = computed(() => {
  if (props.paymentMethod !== 'cash' || amountToPay.value <= 0) return 0
  if (!receivedAmount.value || receivedAmount.value < amountToPay.value) return 0
  return receivedAmount.value - amountToPay.value
})

// Validación de efectivo insuficiente
const isInsufficient = computed(() => {
  if (props.paymentMethod !== 'cash' || amountToPay.value <= 0) return false
  if (receivedAmount.value === null || receivedAmount.value === '') return true
  return receivedAmount.value < amountToPay.value
})

// Icono correspondiente al método de pago
const paymentIcon = computed(() => {
  if (props.paymentMethod === 'card') return CreditCardIcon
  if (props.paymentMethod === 'transfer') return ArrowRightLeftIcon
  return BanknoteIcon
})

// Nombre descriptivo del método de pago
const paymentMethodLabel = computed(() => {
  if (props.paymentMethod === 'card') return 'Tarjeta'
  if (props.paymentMethod === 'transfer') return 'Transferencia'
  return 'Efectivo'
})

// Billetes sugeridos que cubren el monto
const quickBills = computed(() => {
  const target = amountToPay.value
  if (target <= 0) return []
  const denominations = [20, 50, 100, 200, 500, 1000]
  // Retornar billetes que sean mayores o iguales al monto, máximo 4 opciones
  return denominations.filter(d => d >= target).slice(0, 4)
})

// Resetear efectivo al abrir o cambiar valores
watch(() => props.show, (newVal) => {
  if (newVal) {
    receivedAmount.value = null
    nextTick(() => {
      // Intentar enfocar el input de efectivo para agilizar el cobro
      if (cashInput.value) {
        cashInput.value.focus()
      }
    })
  }
})

const confirm = () => {
  if (props.loading) return
  if (props.paymentMethod === 'cash' && amountToPay.value > 0 && isInsufficient.value) return
  emit('confirm')
}

const handleEnterKey = () => {
  confirm()
}

const close = () => {
  if (!props.loading) {
    emit('update:show', false)
  }
}
</script>

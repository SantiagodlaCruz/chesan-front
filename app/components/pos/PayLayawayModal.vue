<template>
  <BaseModal
    :show="show"
    title="Gestionar Entrega de Apartado"
    subtitle="Seleccione las prendas que se entregan hoy, registre abonos o cancele prendas no deseadas."
    size="4xl"
    @update:show="close"
  >
    <div class="space-y-6" v-if="ticket">
      <!-- 1. Encabezado y Resumen General del Ticket -->
      <div class="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 flex flex-wrap justify-between items-center gap-4">
        <div>
          <span class="text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest block mb-0.5">Folio de Apartado</span>
          <h4 class="text-xl font-black text-slate-800 dark:text-white">{{ ticket.ticket_number }}</h4>
          <p class="text-xs font-bold text-primary mt-0.5">Cliente: {{ ticket.customer_name || ticket.client?.name || 'Venta de Mostrador' }}</p>
        </div>
        <div class="flex items-center gap-6 text-right">
          <div>
            <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Total Apartado</span>
            <p class="text-sm font-black text-slate-700 dark:text-slate-300">{{ formatMoney(ticket.total) }}</p>
          </div>
          <div class="border-l border-slate-200 dark:border-white/10 pl-6">
            <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Abonado Total</span>
            <p class="text-sm font-black text-slate-600 dark:text-slate-300">{{ formatMoney(ticket.received_amount) }}</p>
          </div>
          <div class="border-l border-slate-200 dark:border-white/10 pl-6">
            <span class="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block mb-0.5">Anticipo Disponible</span>
            <p class="text-2xl font-black text-emerald-600 dark:text-emerald-400">{{ formatMoney(availableCreditBeforeToday) }}</p>
          </div>
        </div>
      </div>

      <!-- 2. Grid Principal en 2 Columnas -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        <!-- COLUMNA IZQUIERDA: Lista de Prendas (7 columnas) -->
        <div class="lg:col-span-7 space-y-3">
          <div class="flex justify-between items-center px-1">
            <h3 class="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest flex items-center gap-2">
              <ShirtIcon class="w-4 h-4 text-primary" />
              Prendas del Apartado
            </h3>
            <div class="flex items-center gap-2">
              <button 
                type="button" 
                @click="selectAllForDelivery"
                class="text-xs font-bold text-primary hover:underline"
              >
                Seleccionar todo
              </button>
              <span class="text-slate-300 dark:text-slate-600">|</span>
              <button 
                type="button" 
                @click="clearDeliverySelection"
                class="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:underline"
              >
                Limpiar
              </button>
            </div>
          </div>

          <div class="space-y-2.5 max-h-[440px] overflow-y-auto custom-scrollbar pr-1">
            <div 
              v-for="item in itemsState" 
              :key="item.id"
              class="p-3.5 rounded-xl border transition-all"
              :class="[
                item.is_delivered_already
                  ? 'bg-slate-50 dark:bg-emerald-950/15 border-slate-200 dark:border-emerald-500/20'
                  : item.marked_for_cancel && item.qty_to_cancel >= item.available_to_deliver
                  ? 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40'
                  : item.selected_for_delivery
                  ? 'bg-indigo-50/80 dark:bg-indigo-950/30 border-indigo-300 dark:border-indigo-800 shadow-sm'
                  : 'bg-white dark:bg-card-dark border-slate-200 dark:border-white/10'
              ]"
            >
              <div class="flex items-center justify-between gap-3">
                <!-- Checkbox y Detalle de Prenda -->
                <div class="flex items-center gap-3 min-w-0">
                  <!-- Si ya fue entregada en una visita previa -->
                  <div v-if="item.is_delivered_already" class="size-6 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-300/40 dark:border-emerald-500/30 flex items-center justify-center shrink-0">
                    <CheckIcon class="w-4 h-4 stroke-[3]" />
                  </div>

                  <!-- Si aún está pendiente -->
                  <button 
                    v-else
                    type="button" 
                    :id="'chk-item-' + item.id"
                    @click="!(item.marked_for_cancel && item.qty_to_cancel >= item.available_to_deliver) && (item.selected_for_delivery = !item.selected_for_delivery)"
                    :disabled="item.marked_for_cancel && item.qty_to_cancel >= item.available_to_deliver"
                    class="size-6 rounded-lg border flex items-center justify-center transition-all shrink-0 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    :class="[
                      item.selected_for_delivery
                        ? 'bg-primary text-white border-primary shadow-sm shadow-primary/25'
                        : 'bg-white dark:bg-card-dark border-slate-300 dark:border-white/20 hover:border-primary/60 text-transparent',
                      item.marked_for_cancel && item.qty_to_cancel >= item.available_to_deliver
                        ? 'opacity-30 cursor-not-allowed border-slate-200 dark:border-white/10'
                        : 'cursor-pointer hover:scale-105 active:scale-95'
                    ]"
                  >
                    <CheckIcon class="w-4 h-4 stroke-[3]" />
                  </button>

                  <div 
                    class="min-w-0"
                    :class="{ 'cursor-pointer select-none': !item.is_delivered_already && !(item.marked_for_cancel && item.qty_to_cancel >= item.available_to_deliver) }"
                    @click="!item.is_delivered_already && !(item.marked_for_cancel && item.qty_to_cancel >= item.available_to_deliver) && (item.selected_for_delivery = !item.selected_for_delivery)"
                  >
                    <p class="text-xs font-black truncate" :class="item.is_delivered_already ? 'text-slate-600 dark:text-slate-200' : 'text-slate-800 dark:text-slate-100'">
                      {{ item.product_name }}
                    </p>
                    <div class="flex items-center flex-wrap gap-x-2 gap-y-0.5 mt-0.5 text-[11px] text-slate-500 whitespace-nowrap">
                      <span v-if="item.size_name && item.size_name !== '---'" class="font-bold">Talla: {{ item.size_name }}</span>
                      <span>•</span>
                      <span class="font-bold text-slate-700 dark:text-slate-300">{{ formatMoney(item.unit_price) }} c/u</span>
                      <span v-if="item.available_to_deliver > 1" class="text-slate-400">({{ item.available_to_deliver }} disp.)</span>
                    </div>
                  </div>
                </div>

                <!-- Controles de Cantidad y Botón Cancelar (Compactos y Alineados) -->
                <div class="flex items-center gap-1.5 shrink-0">
                  <!-- Ya cancelada totalmente previamente -->
                  <span v-if="item.is_cancelled_already && item.available_to_deliver === 0" class="px-2.5 py-1 bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-300/40 dark:border-rose-500/40 text-[10px] font-black uppercase tracking-wider rounded-lg whitespace-nowrap shadow-sm">
                    Eliminado ({{ item.cancelled_quantity || item.quantity }}/{{ item.quantity }})
                  </span>

                  <!-- Ya entregada previamente -->
                  <span v-else-if="item.is_delivered_already" class="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-300/40 dark:border-emerald-500/40 text-[10px] font-black uppercase tracking-wider rounded-lg whitespace-nowrap shadow-sm">
                    Entregado ({{ item.delivered_quantity }}/{{ item.quantity }})
                  </span>

                  <!-- Opciones para prenda pendiente -->
                  <template v-else>
                    <!-- Selector de cantidad a entregar si hay más de 1 disponible -->
                    <div v-if="item.selected_for_delivery && maxDeliverable(item) > 1" class="flex items-center gap-1 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800">
                      <span class="text-[10px] font-bold text-indigo-700 dark:text-indigo-400 uppercase">Entr:</span>
                      <select 
                        v-model.number="item.qty_to_deliver" 
                        class="bg-transparent text-xs font-black text-indigo-900 dark:text-indigo-200 outline-none cursor-pointer"
                      >
                        <option v-for="n in maxDeliverable(item)" :key="n" :value="n" class="text-slate-900 bg-white dark:bg-slate-800 dark:text-white">{{ n }}</option>
                      </select>
                    </div>
                    <span v-else-if="item.selected_for_delivery" class="text-xs font-black text-indigo-600 dark:text-indigo-400 px-1 whitespace-nowrap">
                      {{ item.qty_to_deliver }} pza(s)
                    </span>

                    <!-- Control de Cancelación Unificado -->
                    <div v-if="item.marked_for_cancel" class="flex items-center rounded-lg border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 overflow-hidden">
                      <div v-if="maxCancelable(item) > 1" class="flex items-center gap-1 px-2 py-1 border-r border-rose-200 dark:border-rose-900">
                        <span class="text-[10px] font-bold text-rose-700 dark:text-rose-300 uppercase">Canc:</span>
                        <select 
                          v-model.number="item.qty_to_cancel" 
                          class="bg-transparent text-xs font-black text-rose-800 dark:text-rose-200 outline-none cursor-pointer"
                        >
                          <option v-for="n in maxCancelable(item)" :key="n" :value="n" class="text-slate-900 bg-white dark:bg-slate-800 dark:text-white">{{ n }}</option>
                        </select>
                      </div>
                      <button 
                        type="button" 
                        @click="toggleCancelItem(item)"
                        class="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-black uppercase transition-all flex items-center gap-1"
                        title="Deshacer cancelación y mantener prenda en apartado"
                      >
                        <RotateCcwIcon class="w-3 h-3" />
                        <span>Deshacer</span>
                      </button>
                    </div>

                    <!-- Botón para Cancelar (Estado inicial: neutro con contraste, rojo solo en hover) -->
                    <button 
                      v-else
                      type="button" 
                      @click="toggleCancelItem(item)"
                      class="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center gap-1 bg-slate-100 dark:bg-slate-800/90 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-600 dark:text-slate-200 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-700 hover:border-rose-200 dark:hover:border-rose-900/60 whitespace-nowrap shadow-sm"
                      title="El cliente ya no desea esta prenda"
                    >
                      <XIcon class="w-3.5 h-3.5" />
                      <span>No la quiere</span>
                    </button>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- COLUMNA DERECHA: Balance de la Operación y Cobro (5 columnas) -->
        <div class="lg:col-span-5 space-y-4 bg-gradient-to-br from-indigo-50/40 to-slate-50 dark:from-indigo-950/20 dark:to-white/5 border border-indigo-100 dark:border-indigo-900/40 rounded-2xl p-5">
          <h4 class="text-xs font-black text-indigo-950 dark:text-indigo-300 uppercase tracking-widest">
            Balance de Operación
          </h4>

          <!-- Mini Cards de Resumen -->
          <div class="grid grid-cols-2 gap-2.5 text-xs">
            <div class="bg-white dark:bg-card-dark p-3 rounded-xl border border-slate-100 dark:border-white/5">
              <span class="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Entrega Hoy</span>
              <span class="text-base font-black text-slate-800 dark:text-white">{{ formatMoney(valDeliveringToday) }}</span>
              <p class="text-[10px] text-slate-500 mt-0.5">{{ countDeliveringToday }} prenda(s)</p>
            </div>

            <div class="bg-white dark:bg-card-dark p-3 rounded-xl border border-slate-100 dark:border-white/5">
              <span class="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Aún Debe en Tienda</span>
              <span class="text-base font-black text-amber-600 dark:text-amber-400">{{ formatMoney(valRemainingInStore) }}</span>
              <p class="text-[10px] text-slate-500 mt-0.5">{{ countRemainingInStore }} prenda(s)</p>
            </div>
          </div>

          <!-- Anticipo / Abono para prendas que quedan resguardadas -->
          <div v-if="countRemainingInStore > 0" class="bg-white dark:bg-card-dark p-3.5 rounded-xl border border-slate-200 dark:border-white/10 space-y-2.5">
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-200">
              Abono para prendas pendientes
            </label>
            
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">$</span>
              <input 
                v-model.number="depositForPending" 
                type="number" 
                min="0"
                step="10"
                placeholder="0.00"
                class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-primary transition-all outline-none pl-7 pr-3 py-2 rounded-xl text-sm font-black text-slate-800 dark:text-white"
              />
            </div>

            <!-- Mensaje ordenado de crédito remanente -->
            <div v-if="remainingCreditAfterToday > 0" class="flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800/30">
              <CheckCircleIcon class="w-3.5 h-3.5 shrink-0" />
              <span><b>{{ formatMoney(remainingCreditAfterToday) }}</b> de anticipo previo cubre parte de lo pendiente.</span>
            </div>
            <p v-else class="text-[10px] text-slate-400">
              Monto que abona hoy el cliente para mantener apartadas sus prendas restantes.
            </p>
          </div>

            <!-- Total a Cobrar en Caja y Método de Pago -->
            <div class="pt-3 border-t border-slate-200 dark:border-white/10 space-y-3">
              <div class="flex justify-between items-center">
                <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {{ refundAmount > 0 ? 'Devolución al Cliente' : 'Total a Cobrar Hoy' }}
                </span>
                <p class="text-2xl font-black" :class="refundAmount > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'">
                  {{ formatMoney(refundAmount > 0 ? refundAmount : totalToChargeToday) }}
                </p>
              </div>

              <!-- Método de Pago si hay cobro -->
              <div v-if="totalToChargeToday > 0" class="space-y-2">
                <div class="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    @click="paymentMethod = 'cash'"
                    class="py-2 rounded-xl text-xs font-black uppercase transition-all"
                    :class="paymentMethod === 'cash' ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-white dark:bg-card-dark text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10'"
                  >
                    Efectivo
                  </button>
                  <button
                    type="button"
                    @click="paymentMethod = 'card'"
                    class="py-2 rounded-xl text-xs font-black uppercase transition-all"
                    :class="paymentMethod === 'card' ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-white dark:bg-card-dark text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10'"
                  >
                    Tarjeta
                  </button>
                  <button
                    type="button"
                    @click="paymentMethod = 'transfer'"
                    class="py-2 rounded-xl text-xs font-black uppercase transition-all"
                    :class="paymentMethod === 'transfer' ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-white dark:bg-card-dark text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10'"
                  >
                    Transf.
                  </button>
                </div>

                <!-- Efectivo Recibido y Cambio -->
                <div v-if="paymentMethod === 'cash'" class="p-2.5 bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-white/10 flex items-center gap-3">
                  <div class="relative flex-1">
                    <span class="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">$</span>
                    <input 
                      v-model.number="receivedCash" 
                      type="number"
                      placeholder="Efectivo Recibido"
                      class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-primary transition-all outline-none pl-6 pr-2 py-1.5 rounded-lg text-xs font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                  <div class="text-right text-xs shrink-0">
                    <span class="text-[10px] text-slate-400 block">Cambio:</span>
                    <span class="font-black text-sm" :class="changeCash >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'">
                      {{ formatMoney(Math.max(0, changeCash)) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

          <!-- Botones de Acción dentro de la columna derecha -->
          <div class="pt-2 flex flex-col gap-2">
            <button 
              type="button" 
              @click="submitDelivery"
              :disabled="loading || isSubmitDisabled"
              class="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-3 rounded-xl font-black text-xs uppercase tracking-normal flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 active:scale-95 cursor-pointer"
            >
              <div v-if="loading" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              <template v-else>
                <CheckIcon class="w-4 h-4 shrink-0" />
                <span class="truncate">{{ submitButtonText }}</span>
              </template>
            </button>

            <BaseButton variant="secondary" @click="close" :disabled="loading" class="w-full text-xs">
              Cerrar Ventana
            </BaseButton>
          </div>
        </div>

      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { ShirtIcon, CheckIcon, XIcon, CheckCircleIcon, RotateCcwIcon } from 'lucide-vue-next'
import BaseModal from '~/components/BaseModal.vue'
import BaseButton from '~/components/BaseButton.vue'
import { useFormatter } from '~/composables/useFormatter'

const { formatMoney } = useFormatter()

const props = defineProps({
  show: Boolean,
  ticket: Object,
  loading: Boolean
})

const emit = defineEmits(['update:show', 'confirm'])

const paymentMethod = ref('cash')
const receivedCash = ref(null)
const depositForPending = ref(0)
const itemsState = ref([])

// Inicializar estado de las prendas al abrir el modal
watch(() => [props.show, props.ticket], () => {
  if (props.show && props.ticket && props.ticket.items) {
    paymentMethod.value = 'cash'
    receivedCash.value = null
    depositForPending.value = 0

    itemsState.value = props.ticket.items.map(item => {
      const isTicketDelivered = Boolean(props.ticket.is_delivered || props.ticket.delivery_status === 'delivered' || (props.ticket.ticket_type && props.ticket.ticket_type !== 'layaway'))
      const deliveredQty = isTicketDelivered ? item.quantity : (Number(item.delivered_quantity) || 0)
      const cancelledQty = Number(item.cancelled_quantity) || (item.is_cancelled ? Math.max(0, item.quantity - deliveredQty) : 0)
      const activeQty = Math.max(0, item.quantity - cancelledQty)
      const isDeliveredAlready = isTicketDelivered || Boolean(item.is_delivered) || (deliveredQty >= activeQty && activeQty > 0)
      const isCancelledAlready = Boolean(item.is_cancelled) || (cancelledQty >= item.quantity && item.quantity > 0)
      const availableToDeliver = Math.max(0, item.quantity - deliveredQty - cancelledQty)

      return {
        id: item.id,
        product_name: item.product_name || item.product?.name,
        size_name: item.size_name || item.product?.size?.name,
        quantity: item.quantity,
        delivered_quantity: deliveredQty,
        cancelled_quantity: cancelledQty,
        available_to_deliver: availableToDeliver,
        is_delivered_already: isDeliveredAlready,
        is_cancelled_already: isCancelledAlready,
        unit_price: Number(item.unit_price) || 0,
        selected_for_delivery: false,
        qty_to_deliver: availableToDeliver > 0 ? availableToDeliver : 0,
        marked_for_cancel: false,
        qty_to_cancel: 0
      }
    })
  }
}, { immediate: true })

const maxDeliverable = (item) => {
  const cancelQty = item.marked_for_cancel ? (item.qty_to_cancel || 0) : 0
  return Math.max(1, item.available_to_deliver - cancelQty)
}

const maxCancelable = (item) => {
  const deliverQty = item.selected_for_delivery ? (item.qty_to_deliver || 0) : 0
  return Math.max(1, item.available_to_deliver - deliverQty)
}

// Acciones rápidas de selección
const selectAllForDelivery = () => {
  itemsState.value.forEach(item => {
    if (!item.is_delivered_already && !item.marked_for_cancel) {
      item.selected_for_delivery = true
      item.qty_to_deliver = item.available_to_deliver
    }
  })
}

const clearDeliverySelection = () => {
  itemsState.value.forEach(item => {
    item.selected_for_delivery = false
  })
}

const toggleCancelItem = (item) => {
  item.marked_for_cancel = !item.marked_for_cancel
  if (item.marked_for_cancel) {
    const cancelable = maxCancelable(item)
    item.qty_to_cancel = cancelable
    if (item.selected_for_delivery && (item.qty_to_deliver + item.qty_to_cancel > item.available_to_deliver)) {
      item.qty_to_deliver = Math.max(0, item.available_to_deliver - item.qty_to_cancel)
      if (item.qty_to_deliver === 0) item.selected_for_delivery = false
    }
  } else {
    item.qty_to_cancel = 0
  }
}

// ── CÁLCULOS MATEMÁTICOS DINÁMICOS ─────────────────────────────────────────

// Valor de lo que se entrega hoy
const valDeliveringToday = computed(() => {
  return itemsState.value
    .filter(i => i.selected_for_delivery && !i.is_delivered_already)
    .reduce((sum, i) => sum + (i.unit_price * (i.qty_to_deliver || 1)), 0)
})

const countDeliveringToday = computed(() => {
  return itemsState.value
    .filter(i => i.selected_for_delivery && !i.is_delivered_already)
    .reduce((sum, i) => sum + (i.qty_to_deliver || 1), 0)
})

// Valor de lo que queda resguardado en tienda
const valRemainingInStore = computed(() => {
  return itemsState.value
    .filter(i => !i.is_delivered_already)
    .reduce((sum, i) => {
      const deliveringNow = i.selected_for_delivery ? (i.qty_to_deliver || 0) : 0
      const cancellingNow = i.marked_for_cancel ? (i.qty_to_cancel || 0) : 0
      const remainingQty = Math.max(0, i.available_to_deliver - deliveringNow - cancellingNow)
      return sum + (i.unit_price * remainingQty)
    }, 0)
})

const countRemainingInStore = computed(() => {
  return itemsState.value
    .filter(i => !i.is_delivered_already)
    .reduce((sum, i) => {
      const deliveringNow = i.selected_for_delivery ? (i.qty_to_deliver || 0) : 0
      const cancellingNow = i.marked_for_cancel ? (i.qty_to_cancel || 0) : 0
      return sum + Math.max(0, i.available_to_deliver - deliveringNow - cancellingNow)
    }, 0)
})

// Dinero aportado históricamente por el cliente
const originalPaid = computed(() => Number(props.ticket?.received_amount) || 0)

// Valor total de prendas ya entregadas en visitas previas
const valAlreadyDelivered = computed(() => {
  return itemsState.value
    .reduce((sum, i) => sum + (i.unit_price * (i.delivered_quantity || 0)), 0)
})

// Crédito real no consumido disponible antes de los movimientos de hoy
const availableCreditBeforeToday = computed(() => {
  return Math.max(0, originalPaid.value - valAlreadyDelivered.value)
})

// Faltante forzoso para cubrir lo que se entrega hoy
const amountNeededForTodayDeliveries = computed(() => {
  return Math.max(0, valDeliveringToday.value - availableCreditBeforeToday.value)
})

// Saldo a favor sobrante tras cubrir las prendas de hoy
const remainingCreditAfterToday = computed(() => {
  return Math.max(0, availableCreditBeforeToday.value - valDeliveringToday.value)
})

// Saldo a devolver al cliente si ya no quedan prendas en tienda y tiene saldo a favor
const refundAmount = computed(() => {
  if (countRemainingInStore.value === 0 && remainingCreditAfterToday.value > 0) {
    return remainingCreditAfterToday.value
  }
  return 0
})

// Total a cobrar hoy en caja
const totalToChargeToday = computed(() => {
  const deposit = Number(depositForPending.value) || 0
  return amountNeededForTodayDeliveries.value + deposit
})

// Cambio a devolver en efectivo
const changeCash = computed(() => {
  if (paymentMethod.value !== 'cash' || !receivedCash.value) return 0
  return Number(receivedCash.value) - totalToChargeToday.value
})

// Texto dinámico del botón de confirmación
const submitButtonText = computed(() => {
  const hasDelivery = countDeliveringToday.value > 0
  const hasCancel = itemsState.value.some(i => i.marked_for_cancel && (i.qty_to_cancel > 0) && !i.is_delivered_already)
  const isCharging = totalToChargeToday.value > 0
  const isRefunding = refundAmount.value > 0

  if (isRefunding) {
    return `Devolver ${formatMoney(refundAmount.value)} y Cerrar`
  }

  if (isCharging) {
    return `Cobrar ${formatMoney(totalToChargeToday.value)} y Procesar`
  }

  // Sin cobro adicional
  if (hasDelivery && hasCancel) {
    return 'Confirmar Cambios'
  }
  if (hasCancel && !hasDelivery) {
    return 'Confirmar Cancelación'
  }
  if (hasDelivery) {
    return 'Confirmar Entrega'
  }

  return 'Procesar Cambios'
})

// Envío al componente padre
const submitDelivery = () => {
  const deliverItems = itemsState.value
    .filter(i => i.selected_for_delivery && !i.is_delivered_already)
    .map(i => ({ detail_id: i.id, quantity: i.qty_to_deliver || 1 }))

  const cancelItems = itemsState.value
    .filter(i => i.marked_for_cancel && (i.qty_to_cancel > 0) && !i.is_delivered_already)
    .map(i => ({ detail_id: i.id, quantity: i.qty_to_cancel || 1 }))

  emit('confirm', {
    ticket: props.ticket,
    deliverItems,
    cancelItems,
    newPaymentAmount: totalToChargeToday.value,
    refundAmount: refundAmount.value,
    paymentMethod: paymentMethod.value,
    receivedCash: receivedCash.value,
    changeCash: Math.max(0, changeCash.value)
  })
}

const close = () => {
  if (!props.loading) {
    emit('update:show', false)
  }
}
</script>

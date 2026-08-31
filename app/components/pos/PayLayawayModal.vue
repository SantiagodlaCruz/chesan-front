<template>
  <BaseModal
    :show="show"
    title="Completar apartado"
    subtitle="Detalle del apartado escaneado y confirmación de pago del saldo restante."
    size="md"
    @update:show="close"
  >
    <div class="space-y-6" v-if="ticket">
      <!-- Detalle del Ticket -->
      <div class="p-4 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10">
         <p class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] ml-1 transition-colors mb-1">Ticket encontrado</p>
         <h4 class="text-lg font-black text-slate-800 dark:text-white break-all leading-tight">{{ ticket.ticket_number }}</h4>
         <p class="text-sm font-bold text-primary mt-1">Cliente: {{ ticket.customer_name }}</p>
         <p class="text-[10px] text-slate-500 mt-1 uppercase tracking-widest"><span class="font-bold">Límite:</span> {{ ticket.due_date }}</p>
      </div>

      <!-- Financial Summary -->
      <div class="bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-xl p-4">
        <div class="flex justify-between items-center mb-2">
           <span class="text-xs font-bold text-slate-600 dark:text-slate-400">Costo total:</span>
            <span class="text-sm font-mono text-slate-800 dark:text-slate-200">{{ formatMoney(ticket.total) }}</span>
        </div>
        <div class="flex justify-between items-center mb-3">
           <span class="text-xs font-bold text-slate-600 dark:text-slate-400">Anticipo original:</span>
            <span class="text-sm font-mono text-slate-800 dark:text-slate-200">{{ formatMoney(ticket.received_amount) }}</span>
        </div>
        <div class="h-px bg-indigo-200 dark:bg-indigo-500/20 mb-3"></div>
        <div class="flex justify-between items-center">
           <span class="text-[10px] font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-[0.2em] ml-1 transition-colors">Saldo a pagar:</span>
            <span class="text-2xl font-black text-indigo-600 dark:text-indigo-300">{{ formatMoney(ticket.balance) }}</span>
        </div>
      </div>

      <!-- Items List Grouped by School -->
      <div>
         <h3 class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] ml-1 transition-colors mb-3">Productos resguardados</h3>
         <div class="space-y-4 pr-1">
            <div v-for="(items, schoolName) in groupedItems" :key="schoolName" class="space-y-2">
               <div class="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
                  <GraduationCapIcon class="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span class="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">{{ schoolName }}</span>
               </div>
               <div v-for="detail in items" :key="detail.id" 
                    class="p-3 bg-white dark:bg-card-dark border border-slate-100 dark:border-white/5 rounded-xl flex items-center gap-3">
                  
                  <div class="w-10 h-10 rounded-lg bg-slate-50 dark:bg-white/5 flex items-center justify-center shrink-0">
                     <ShirtIcon class="w-5 h-5 text-slate-300" />
                  </div>
                  
                  <div class="flex-1 min-w-0">
                     <p class="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{{ detail.product?.name }}</p>
                     <p class="text-[10px] text-slate-500">{{ detail.product?.barcode }}</p>
                  </div>

                  <div class="text-center font-bold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                     <span class="text-[10px] text-slate-400 block leading-none mb-0.5">CANT</span>
                     {{ detail.quantity }}
                  </div>
               </div>
            </div>
         </div>
      </div>

      <!-- Estado de pago y aviso si ya está pagado -->
      <div v-if="ticket.balance === 0" class="p-3.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl flex items-center gap-3">
        <CheckCircleIcon class="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <div class="text-xs">
          <p class="font-black text-emerald-800 dark:text-emerald-200">Apartado 100% Pagado</p>
          <p class="text-emerald-600 dark:text-emerald-400 text-[11px] mt-0.5">El cliente no tiene saldo pendiente. Confirma la entrega para descontar el stock físico.</p>
        </div>
      </div>

      <!-- Método de Pago de Liquidación (Solo si tiene saldo pendiente) -->
      <div v-if="ticket.balance > 0" class="border-t border-slate-100 dark:border-white/5 pt-5">
         <h3 class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] ml-1 transition-colors mb-3">Método de pago de liquidación</h3>
         <div class="grid grid-cols-3 gap-3">
           <button
             type="button"
             @click="liquidationPaymentMethod = 'cash'"
             class="relative flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-300"
             :class="liquidationPaymentMethod === 'cash'
               ? 'bg-primary border-primary text-white shadow-[0_0_25px_#3b82f6aa] dark:shadow-[0_0_30px_#3b82f6cc] scale-[1.03] z-10'
               : 'bg-panel-light dark:bg-background-dark border-border-light dark:border-border-dark text-slate-400 hover:border-primary/30 shadow-sm dark:shadow-none'"
           >
             <BanknoteIcon class="w-5 h-5 mb-2" />
             <span class="text-[9px] font-bold uppercase tracking-[0.2em] text-center">Efectivo</span>
           </button>
           <button
             type="button"
             @click="liquidationPaymentMethod = 'card'"
             class="relative flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-300"
             :class="liquidationPaymentMethod === 'card'
               ? 'bg-primary border-primary text-white shadow-[0_0_25px_#3b82f6aa] dark:shadow-[0_0_30px_#3b82f6cc] scale-[1.03] z-10'
               : 'bg-panel-light dark:bg-background-dark border-border-light dark:border-border-dark text-slate-400 hover:border-primary/30 shadow-sm dark:shadow-none'"
           >
             <CreditCardIcon class="w-5 h-5 mb-2" />
             <span class="text-[9px] font-bold uppercase tracking-[0.2em] text-center">Tarjeta</span>
           </button>
           <button
             type="button"
             @click="liquidationPaymentMethod = 'transfer'"
             class="relative flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-300"
             :class="liquidationPaymentMethod === 'transfer'
               ? 'bg-primary border-primary text-white shadow-[0_0_25px_#3b82f6aa] dark:shadow-[0_0_30px_#3b82f6cc] scale-[1.03] z-10'
               : 'bg-panel-light dark:bg-background-dark border-border-light dark:border-border-dark text-slate-400 hover:border-primary/30 shadow-sm dark:shadow-none'"
           >
             <ArrowRightLeftIcon class="w-5 h-5 mb-2" />
             <span class="text-[9px] font-bold uppercase tracking-[0.2em] text-center">Transf.</span>
           </button>
         </div>
      </div>

      <!-- Actions -->
      <div class="flex flex-col gap-3 border-t border-slate-100 dark:border-white/5 pt-5">
         <!-- CASO 1: Aún debe saldo (balance > 0) -> Dos opciones: Solo Liquidar vs Liquidar y Entregar -->
         <template v-if="ticket.balance > 0">
           <!-- Botón 1: Liquidar y Entregar (Acción completa inmediata) -->
           <button 
               @click="confirmPayment(true)" 
               :disabled="loading"
               class="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-widest py-3.5 rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
           >
              <div v-if="loading" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              <template v-else>
                 <ShirtIcon class="w-4 h-4" />
              </template>
              <span>{{ loading ? 'Procesando...' : 'Liquidar y Entregar Ahora' }}</span>
           </button>

           <!-- Botón 2: Solo Liquidar (Guarda dinero en caja, prenda queda por entregar) -->
           <button 
               @click="confirmPayment(false)" 
               :disabled="loading"
               class="w-full bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-800 dark:text-slate-100 font-bold text-xs uppercase tracking-wider py-3 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 border border-slate-200 dark:border-white/10"
           >
              <ClockIcon class="w-4 h-4 text-amber-500" />
              <span>Solo Liquidar Saldo (Entrega Posterior)</span>
           </button>
         </template>

         <!-- CASO 2: Ya pagó todo (balance == 0) -> Solo confirmar entrega -->
         <template v-else>
           <button 
               @click="confirmPayment(true)" 
               :disabled="loading"
               class="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-widest py-3.5 rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
           >
              <div v-if="loading" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              <template v-else>
                 <ShirtIcon class="w-4 h-4" />
              </template>
              <span>{{ loading ? 'Entregando...' : 'Confirmar Entrega de Artículos' }}</span>
           </button>
         </template>
         
         <BaseButton variant="secondary" @click="close" class="w-full text-xs" :disabled="loading">
            Cancelar
         </BaseButton>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { ShirtIcon, BanknoteIcon, CreditCardIcon, ArrowRightLeftIcon, GraduationCapIcon, CheckCircleIcon, ClockIcon } from 'lucide-vue-next'
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

const liquidationPaymentMethod = ref('cash')

const groupedItems = computed(() => {
  if (!props.ticket || !props.ticket.items) return {}
  const groups = {}
  props.ticket.items.forEach(detail => {
    const schoolName = detail.product?.institution?.name || 'Sin Escuela / Venta General'
    if (!groups[schoolName]) {
      groups[schoolName] = []
    }
    groups[schoolName].push(detail)
  })
  return groups
})

watch(() => props.show, (newVal) => {
  if (newVal) {
    liquidationPaymentMethod.value = 'cash'
  }
})

const confirmPayment = (deliverNow = true) => {
    emit('confirm', { 
      ticket: props.ticket, 
      paymentMethod: liquidationPaymentMethod.value,
      deliverNow 
    })
}

const close = () => {
  if (!props.loading) {
      emit('update:show', false)
  }
}

</script>

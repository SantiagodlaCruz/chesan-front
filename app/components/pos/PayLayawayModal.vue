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

      <!-- Items List -->
      <div>
         <h3 class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] ml-1 transition-colors mb-3">Productos resguardados</h3>
         <div class="max-h-52 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            <div v-for="detail in ticket.items" :key="detail.id" 
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

      <!-- Actions -->
      <div class="pt-2 flex flex-col gap-3 border-t border-slate-100 dark:border-white/5 pt-5">
         <button 
             @click="confirmPayment" 
             :disabled="loading"
             class="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm uppercase tracking-widest py-4 rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
            <div v-if="loading" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            <BanknoteIcon class="w-5 h-5" v-else />
            {{ loading ? 'Procesando...' : `Liquidar y entregar artículos` }}
         </button>
         
         <BaseButton variant="secondary" @click="close" class="w-full" :disabled="loading">
            Cancelar
         </BaseButton>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { ref } from 'vue'
import { ShirtIcon, BanknoteIcon } from 'lucide-vue-next'
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

const confirmPayment = () => {
    emit('confirm', props.ticket)
}

const close = () => {
  if (!props.loading) {
      emit('update:show', false)
  }
}
</script>

<template>
  <BaseModal
    :show="show"
    title="Convertir a Pedido"
    subtitle="Especifique los detalles finales para enviar a producción."
    size="md"
    @update:show="close"
  >
    <form @submit.prevent="confirm" class="space-y-6 pt-2">
      <div class="grid grid-cols-1 gap-6">
        <!-- Delivery Date -->
        <div class="flex flex-col gap-2">
          <label class="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] ml-1">
            Fecha de Entrega Prometida
          </label>
          <div class="relative">
            <CalendarIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              v-model="form.delivery_date" 
              type="date" 
              required
              class="w-full bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-primary transition-all outline-none pl-10 pr-4 py-2.5 rounded-xl text-sm font-bold text-slate-900 dark:text-white dark:[color-scheme:dark]"
            />
          </div>
          <p class="text-[10px] text-slate-400 italic ml-1">Fecha en la que el cliente espera recibir el pedido.</p>
        </div>

        <!-- Advance Payment -->
        <div class="flex flex-col gap-2">
          <label class="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] ml-1">
            Monto de Anticipo
          </label>
          <div class="relative">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
            <input 
              v-model.number="form.advance_payment" 
              type="number" 
              v-numeric.decimal
              step="0.01"
              min="0"
              class="w-full bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-emerald-500 transition-all outline-none pl-8 pr-4 py-3 rounded-xl text-lg font-black text-emerald-600 dark:text-emerald-400"
              placeholder="0.00"
            />
          </div>
          <p class="text-[10px] text-slate-400 italic ml-1">Monto pagado por el cliente para iniciar la producción.</p>
        </div>

        <!-- Summary -->
        <div v-if="quotation" class="bg-primary/5 rounded-2xl p-4 border border-primary/10">
          <div class="flex justify-between items-center mb-1">
            <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Cotizado</span>
            <span class="text-sm font-black text-primary">${{ Number(quotation.total_amount).toFixed(2) }}</span>
          </div>
          <div class="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase">
            <span>Restante por liquidar</span>
            <span :class="remaining < 0 ? 'text-red-500' : 'text-slate-500'">${{ remaining.toFixed(2) }}</span>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-white/5">
        <button 
          type="button" 
          @click="close" 
          class="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
        >
          Cancelar
        </button>
        <button 
          type="submit" 
          :disabled="loading"
          class="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-black text-sm flex items-center gap-2 transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50"
        >
          <span v-if="loading">Procesando...</span>
          <template v-else>
            <CheckIcon class="w-4 h-4" />
            Confirmar Pedido
          </template>
        </button>
      </div>
    </form>
  </BaseModal>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { CalendarIcon, CheckIcon, DollarSignIcon } from 'lucide-vue-next'
import BaseModal from '~/components/BaseModal.vue'

const props = defineProps({
  show: Boolean,
  quotation: Object,
  loading: Boolean
})

const emit = defineEmits(['update:show', 'confirm'])

const form = reactive({
  delivery_date: '',
  advance_payment: 0
})

const remaining = computed(() => {
  if (!props.quotation) return 0
  return Number(props.quotation.total_amount) - (Number(form.advance_payment) || 0)
})

const close = () => {
  emit('update:show', false)
}

const confirm = () => {
  emit('confirm', { ...form })
}

// Set default delivery date (7 days from now)
watch(() => props.show, (val) => {
  if (val) {
    const date = new Date()
    date.setDate(date.getDate() + 7)
    form.delivery_date = date.toISOString().split('T')[0]
    form.advance_payment = 0
  }
})
</script>

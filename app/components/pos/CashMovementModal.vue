<template>
  <BaseModal
    :show="show"
    :title="type === 'outflow' ? 'Salida de Efectivo' : 'Entrada Manual'"
    subtitle="Registrar movimiento en caja"
    size="md"
    @update:show="emit('update:show', $event)"
  >
    <div class="space-y-6">
      <!-- Toggle Type -->
      <div class="flex items-center gap-1 bg-slate-100 dark:bg-white/5 p-1 rounded-xl text-[10px] uppercase font-black tracking-widest">
        <button @click="type = 'outflow'" :class="type === 'outflow' ? 'bg-white dark:bg-slate-800 text-red-500 shadow-sm' : 'text-slate-400 hover:text-slate-600'" class="flex-1 py-2 rounded-lg transition-all">
          Gasto / Salida
        </button>
        <button @click="type = 'inflow'" :class="type === 'inflow' ? 'bg-white dark:bg-slate-800 text-green-500 shadow-sm' : 'text-slate-400 hover:text-slate-600'" class="flex-1 py-2 rounded-lg transition-all">
          Ingreso Extra
        </button>
      </div>

      <div>
        <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Monto ($)</label>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <span class="text-lg font-bold text-slate-400">$</span>
          </div>
          <input
            v-model.number="amount"
            type="number"
            v-numeric.decimal
            step="0.01"
            class="block w-full pl-8 pr-4 py-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-xl font-black text-slate-800 dark:text-white outline-none focus:border-primary transition-all"
            placeholder="0.00"
            autofocus
          />
        </div>
      </div>

      <div>
        <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Concepto / Motivo</label>
        <input
          v-model="description"
          type="text"
          class="block w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-sm text-slate-800 dark:text-white outline-none focus:border-primary transition-all"
          placeholder="Ej. Pago de garrafón, papelería..."
        />
      </div>

      <div class="flex gap-4">
        <button
          @click="emit('update:show', false)"
          class="flex-1 py-4 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 font-bold text-xs uppercase tracking-widest transition-colors"
        >
          Cancelar
        </button>
        <button
          @click="handleSubmit"
          :disabled="loading || !amount || !description"
          class="flex-[2] py-4 bg-primary text-white font-black text-sm uppercase tracking-[0.2em] rounded-2xl transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 shadow-lg shadow-primary/20"
        >
          <div v-if="loading" class="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
          <CheckIcon v-else class="w-5 h-5" />
          Registrar
        </button>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ArrowDownIcon, ArrowUpIcon, CheckIcon } from 'lucide-vue-next'
import BaseModal from '~/components/BaseModal.vue'

import { useToast } from '~/composables/useToast'

const props = defineProps({
  show: Boolean,
})

const emit = defineEmits(['update:show', 'success'])

const api = useApi()
const { showToast } = useToast()
const type = ref('outflow')
const amount = ref(null)
const description = ref('')
const loading = ref(false)

watch(() => props.show, (newVal) => {
  if (newVal) {
    amount.value = null
    description.value = ''
    type.value = 'outflow'
  }
})

const handleSubmit = async () => {
  if (!amount.value || !description.value || loading.value) return
  
  loading.value = true
  try {
    const response = await api.post('/api/cash-register/movement', {
      amount: amount.value,
      type: type.value,
      description: description.value
    })
    emit('success', response.movement)
    emit('update:show', false)
  } catch (error) {
    console.error('Error recording movement:', error)
    showToast(error.message || 'Error al registrar movimiento', 'error')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <BaseModal
    :show="show"
    title="Finalizar Entrega de Pedido"
    subtitle="Confirme la liquidación del pago para completar la entrega."
    size="md"
    @update:show="close"
  >
    <div v-if="card" class="space-y-6">
      <!-- Resumen Financiero -->
      <div class="bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden">
        <div class="p-4 border-b border-slate-200 dark:border-white/5 flex justify-between items-center">
          <span class="text-xs font-bold text-slate-500 uppercase">Total del Pedido</span>
          <span class="text-lg font-black text-slate-900 dark:text-white">${{ card.order?.total_amount }}</span>
        </div>
        <div class="p-4 border-b border-slate-200 dark:border-white/5 flex justify-between items-center">
          <span class="text-xs font-bold text-slate-500 uppercase">Anticipo Pagado</span>
          <span class="text-sm font-bold text-emerald-600">-${{ card.order?.advance_payment || 0 }}</span>
        </div>
        <div class="p-5 bg-primary/5 flex justify-between items-center">
          <span class="text-sm font-black text-primary uppercase tracking-wider">Monto a Liquidar</span>
          <span class="text-2xl font-black text-primary">${{ pendingAmount }}</span>
        </div>
      </div>

      <!-- Alerta de Confirmación -->
      <div class="flex gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
        <AlertCircleIcon class="w-5 h-5 text-amber-500 shrink-0" />
        <p class="text-xs text-amber-700 dark:text-amber-400 font-medium leading-relaxed">
          Al confirmar, el pedido se moverá a la columna de <b>Entregados</b> y se registrará como liquidado.
        </p>
      </div>

      <!-- Acciones -->
      <div class="flex flex-col gap-3 pt-2">
        <BaseButton 
          variant="primary" 
          size="lg" 
          class="w-full shadow-xl shadow-primary/30"
          :loading="loading"
          @click="confirmDelivery"
        >
          Confirmar Pago y Entregar
        </BaseButton>
        <BaseButton variant="secondary" class="w-full" @click="close">
          Cancelar
        </BaseButton>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { AlertCircleIcon } from 'lucide-vue-next'
import BaseModal from '~/components/BaseModal.vue'
import BaseButton from '~/components/BaseButton.vue'

const props = defineProps<{
  show: boolean
  card: any
}>()

const emit = defineEmits(['update:show', 'confirm'])
const loading = ref(false)

const pendingAmount = computed(() => {
  if (!props.card?.order) return 0
  const total = Number(props.card.order.total_amount) || 0
  const advance = Number(props.card.order.advance_payment) || 0
  return total - advance
})

const close = () => emit('update:show', false)

const confirmDelivery = async () => {
  loading.value = true
  try {
    // Aquí disparamos el evento hacia el padre (production.vue)
    emit('confirm', props.card)
  } finally {
    loading.value = false
  }
}
</script>

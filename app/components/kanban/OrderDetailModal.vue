<template>
  <BaseModal
    :show="show"
    :title="'Detalle de pedido ' + card?.orderId"
    subtitle="Información detallada de la orden de producción."
    size="3xl"
    @update:show="close"
  >
    <div v-if="card" class="space-y-8">
      <!-- Info Superior -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
          <p class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] ml-1 transition-colors mb-1">Cliente</p>
          <p class="text-sm font-bold text-slate-900 dark:text-white">{{ card.title }}</p>
        </div>
        <div class="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
          <p class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] ml-1 transition-colors mb-1">Fecha de entrega</p>
          <div class="flex items-center justify-between">
            <p class="text-sm font-bold text-slate-900 dark:text-white">{{ card.deliveryDate }}</p>
            <p class="text-[10px] font-black px-2 py-1 rounded bg-primary/10 text-primary uppercase">
              {{ card.daysLeft < 0 ? 'Retrasado' : 'Faltan ' + card.daysLeft + ' días' }}
            </p>
          </div>
        </div>
      </div>

      <!-- Tabla de Ítems -->
      <div class="space-y-3">
        <h3 class="text-xs font-black uppercase tracking-widest text-slate-400 px-1">Productos a Fabricar</h3>
        <div class="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 font-bold text-[10px] uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <th class="px-4 py-3">Producto</th>
                <th class="px-4 py-3">Color</th>
                <th class="px-4 py-3 text-center">Talla</th>
                <th class="px-4 py-3 text-center">Cantidad</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 dark:divide-slate-800">
              <tr v-for="item in card.order?.items" :key="item.id" class="text-sm">
                <td class="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">{{ item.product_name }}</td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <span 
                      v-if="item.color?.hex_code" 
                      class="w-3 h-3 rounded-full border border-black/10" 
                      :style="{ backgroundColor: item.color.hex_code }"
                    ></span>
                    <span class="font-medium text-slate-600 dark:text-slate-400">{{ item.color?.name || 'N/A' }}</span>
                  </div>
                </td>
                <td class="px-4 py-3 text-center font-bold text-slate-700 dark:text-slate-300">{{ item.size || '-' }}</td>
                <td class="px-4 py-3 text-center">
                  <span class="px-2.5 py-1 bg-primary/10 text-primary rounded-lg font-black">{{ item.quantity }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Notas -->
      <div v-if="card.order?.notes" class="bg-amber-500/5 border border-amber-500/20 p-4 rounded-2xl">
        <p class="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400 tracking-wider mb-2">Observaciones</p>
        <p class="text-sm text-amber-800 dark:text-amber-200 leading-relaxed font-medium">
          {{ card.order.notes }}
        </p>
      </div>

      <!-- Acciones del Modal -->
      <div class="flex justify-end pt-4">
        <BaseButton variant="secondary" @click="close">Cerrar detalle</BaseButton>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import BaseModal from '~/components/BaseModal.vue'
import BaseButton from '~/components/BaseButton.vue'

defineProps<{
  show: boolean
  card: any
}>()

const emit = defineEmits(['update:show'])

const close = () => {
  emit('update:show', false)
}
</script>

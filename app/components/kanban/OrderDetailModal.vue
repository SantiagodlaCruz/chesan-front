<template>
  <BaseModal
    :show="show"
    :title="'Detalle de Pedido ' + (card?.order?.order_code || card?.orderId)"
    subtitle="Información detallada de la orden de producción."
    size="3xl"
    @update:show="close"
  >
    <div v-if="card" class="space-y-8">
      <!-- Accion Superior Sutil -->
      <div v-if="card.status !== 'Entregados'" class="flex justify-end items-center -mb-4 gap-2">
        <button 
          v-if="card.order?.is_internal && card.status !== 'Pasado a Inventario'"
          @click="emit('edit', card)"
          class="flex items-center gap-2 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-primary bg-primary/5 hover:bg-primary/10 border border-primary/10 rounded-xl transition-all shadow-sm"
        >
          <PencilIcon class="w-3.5 h-3.5" />
          Editar Pedido
        </button>
        <button 
          @click="emit('delete', card)"
          class="flex items-center gap-2 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-red-500 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 border border-red-100 dark:border-red-500/30 rounded-xl transition-all shadow-sm"
        >
          <TrashIcon class="w-3.5 h-3.5" />
          Eliminar Pedido
        </button>
      </div>

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

      <!-- Tarjetas de Ítems -->
      <div class="space-y-4">
        <h3 class="text-xs font-black uppercase tracking-widest text-slate-400 px-1">Productos a Fabricar</h3>
        <div class="grid grid-cols-1 gap-4">
          <div v-for="item in card.order?.items" :key="item.id" class="bg-white dark:bg-white/[0.03] rounded-2xl border border-slate-200 dark:border-white/10 p-5 shadow-sm transition-all hover:shadow-md">
            <div class="flex flex-wrap justify-between items-start gap-4 mb-4">
              <div class="flex-1 min-w-[200px]">
                <div class="flex items-center justify-between">
                  <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Producto / Concepto</p>
                  <span v-if="item.stock_product_id" class="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-md text-[9px] font-black uppercase tracking-wider">
                    Vinculado a Inventario
                  </span>
                </div>
                <p class="text-base font-black text-slate-800 dark:text-white leading-tight">{{ item.product_name }}</p>
              </div>
            </div>

            <!-- Details Line: Size, Quantity, Price -->
            <div class="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-white/5">
              <div class="flex flex-col">
                <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Talla</p>
                <p class="text-sm font-black text-primary">{{ item.size || 'N/A' }}</p>
              </div>
              <div class="flex flex-col text-center">
                <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Cantidad</p>
                <p class="text-sm font-black text-slate-900 dark:text-white">{{ item.quantity }} pzas</p>
              </div>
              <div class="flex flex-col text-right">
                <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Precio Unit.</p>
                <p class="text-sm font-bold text-slate-600 dark:text-slate-400">${{ Number(item.unit_price).toFixed(2) }}</p>
              </div>
            </div>

            <!-- Observations Line -->
            <div v-if="item.observations" class="mt-4 pt-4 border-t border-slate-100 dark:border-white/5">
              <p class="text-[9px] font-black text-primary uppercase tracking-widest mb-1.5">Instrucciones específicas</p>
              <div class="bg-primary/5 border border-primary/10 rounded-xl p-3">
                <p class="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed italic whitespace-pre-line">
                  "{{ item.observations }}"
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Notas / Observaciones Generales -->
      <div v-if="card.order" class="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl">
        <div class="flex justify-between items-center mb-2">
          <p class="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">Observaciones Generales</p>
          <button 
            v-if="!isEditingNotes" 
            @click="startEditingNotes"
            class="text-[10px] font-black uppercase text-primary hover:underline flex items-center gap-1"
          >
            <PencilIcon class="w-3.5 h-3.5" />
            Editar
          </button>
        </div>

        <div v-if="isEditingNotes" class="space-y-3">
          <textarea
            v-model="localNotes"
            rows="3"
            class="w-full bg-white dark:bg-card-dark border border-slate-300 dark:border-slate-700 focus:border-primary outline-none p-3 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
            placeholder="Escriba las observaciones generales de la orden..."
          ></textarea>
          <div class="flex justify-end gap-2">
            <BaseButton size="sm" variant="secondary" :disabled="savingNotes" @click="cancelEditingNotes">
              Cancelar
            </BaseButton>
            <BaseButton size="sm" variant="primary" :loading="savingNotes" @click="saveNotes">
              Guardar
            </BaseButton>
          </div>
        </div>
        <div v-else>
          <p v-if="card.order.notes" class="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium whitespace-pre-line">
            {{ card.order.notes }}
          </p>
          <p v-else class="text-xs text-slate-400 italic">
            Sin observaciones registradas. Haga clic en Editar para agregar.
          </p>
        </div>
      </div>

      <!-- Acciones del Modal -->
      <div class="flex justify-end pt-4 border-t border-slate-100 dark:border-white/5">
        <BaseButton variant="secondary" @click="close">Cerrar detalle</BaseButton>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import BaseModal from '~/components/BaseModal.vue'
import BaseButton from '~/components/BaseButton.vue'
import { TrashIcon, PencilIcon } from 'lucide-vue-next'
import { useApi } from '~/composables/useApi'
import { useToast } from '~/stores/toast'

const props = defineProps<{
  show: boolean
  card: any
}>()

const emit = defineEmits(['update:show', 'delete', 'edit', 'updated'])

const api = useApi()
const toast = useToast()

const isEditingNotes = ref(false)
const localNotes = ref('')
const savingNotes = ref(false)

watch(() => props.show, (newVal) => {
  if (newVal && props.card?.order) {
    localNotes.value = props.card.order.notes || ''
    isEditingNotes.value = false
  }
}, { immediate: true })

watch(() => props.card, (newCard) => {
  if (newCard?.order) {
    localNotes.value = newCard.order.notes || ''
    isEditingNotes.value = false
  }
})

const startEditingNotes = () => {
  localNotes.value = props.card?.order?.notes || ''
  isEditingNotes.value = true
}

const cancelEditingNotes = () => {
  isEditingNotes.value = false
  localNotes.value = props.card?.order?.notes || ''
}

const saveNotes = async () => {
  if (!props.card?.order?.id) return
  
  savingNotes.value = true
  try {
    await api.patch(`/api/orders/${props.card.order.id}/notes`, {
      notes: localNotes.value
    })
    
    if (props.card.order) {
      props.card.order.notes = localNotes.value
    }
    
    toast.success('Observaciones del pedido actualizadas correctamente')
    isEditingNotes.value = false
    emit('updated')
  } catch (err: any) {
    console.error('Error al guardar observaciones:', err)
    const msg = err.data?.message || 'Error al guardar las observaciones'
    toast.error(msg)
  } finally {
    savingNotes.value = false
  }
}

const close = () => {
  emit('update:show', false)
}
</script>

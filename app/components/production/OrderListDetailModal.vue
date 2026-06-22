<template>
  <BaseModal
    :show="show"
    :title="'Detalle de Pedido ' + (order?.order_code || '')"
    subtitle="Desglose detallado del pedido de producción."
    size="3xl"
    @update:show="close"
  >
    <div v-if="order" class="space-y-6">
      
      <!-- Badges de Estado -->
      <div class="flex flex-wrap items-center gap-3">
        <!-- Badge Tipo de Pedido -->
        <span 
          class="px-3 py-1 text-xs font-black uppercase tracking-wider rounded-lg border"
          :class="[
            order.is_internal 
              ? 'bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20' 
              : 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20'
          ]"
        >
          {{ order.is_internal ? 'Pedido Interno' : 'Pedido de Cliente' }}
        </span>

        <!-- Badge Estado de Producción -->
        <span 
          class="px-3 py-1 text-xs font-black uppercase tracking-wider rounded-lg border"
          :class="getProductionStatusClass(order.production_status || null)"
        >
          Etapa: {{ order.production_status || 'Pendiente' }}
        </span>

        <!-- Badge Estado de Pago -->
        <span 
          v-if="order.is_internal"
          class="px-3 py-1 text-xs font-black uppercase tracking-wider rounded-lg border bg-slate-100 text-slate-500 border-slate-200 dark:bg-white/5 dark:text-slate-400 dark:border-white/10"
        >
          No Aplica
        </span>
        <span 
          v-else
          class="px-3 py-1 text-xs font-black uppercase tracking-wider rounded-lg border"
          :class="[
            order.is_liquidated 
              ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' 
              : 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
          ]"
        >
          {{ order.is_liquidated ? 'Liquidado' : 'Pendiente de Pago' }}
        </span>
      </div>

      <!-- Info Superior Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Columna Cliente -->
        <div class="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Cliente</p>
          <p class="text-sm font-bold text-slate-900 dark:text-white">
            {{ order.client?.name || (order.is_internal ? 'Inventario Interno / CheSan' : 'Cliente Desconocido') }}
          </p>
          <div v-if="order.client" class="mt-2 text-xs text-slate-500 space-y-0.5">
            <p v-if="order.client.phone">Tel: {{ order.client.phone }}</p>
            <p v-if="order.client.email">Email: {{ order.client.email }}</p>
          </div>
        </div>

        <!-- Columna Entrega -->
        <div class="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Fechas</p>
          <div class="flex justify-between items-center text-sm font-bold text-slate-900 dark:text-white">
            <div>
              <p class="text-xs text-slate-500 font-normal">Creación: {{ formatDate(order.order_date || null) }}</p>
              <p class="mt-1">Entrega Promesa: {{ formatDate(order.delivery_date) }}</p>
            </div>
            <div v-if="order.delivery_date && order.production_status !== 'Entregados'" class="text-right">
              <span 
                class="inline-block text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider"
                :class="getDaysLeftClass(order.delivery_date)"
              >
                {{ getDaysLeftText(order.delivery_date) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Detalle de Prendas -->
      <div class="space-y-3">
        <h3 class="text-xs font-black uppercase tracking-widest text-slate-400 px-1">Prendas y Productos del Pedido</h3>
        <div class="space-y-3">
          <div 
            v-for="item in order.items" 
            :key="item.id" 
            class="bg-white dark:bg-white/[0.02] rounded-2xl border border-slate-200 dark:border-white/5 p-4 shadow-sm"
          >
            <!-- Cabecera Producto -->
            <div class="flex flex-wrap justify-between items-start gap-2 pb-3 border-b border-slate-100 dark:border-white/5">
              <div>
                <p class="text-sm font-black text-slate-800 dark:text-white uppercase leading-tight">{{ item.product_name }}</p>
              </div>
              <div v-if="item.color" class="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5">
                <div 
                  v-if="item.color.hex_code"
                  class="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-white/20 shadow-sm" 
                  :style="{ backgroundColor: item.color.hex_code }"
                ></div>
                <span class="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase">{{ item.color.name }}</span>
              </div>
            </div>

            <!-- Detalles de Cantidad, Talla, Precios -->
            <div class="grid grid-cols-4 gap-2 pt-3 text-xs leading-none">
              <div>
                <p class="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Talla</p>
                <p class="text-xs font-black text-primary uppercase">{{ item.size || 'N/A' }}</p>
              </div>
              <div class="text-center">
                <p class="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Cantidad</p>
                <p class="text-xs font-black text-slate-800 dark:text-slate-200">{{ item.quantity }} pzas</p>
              </div>
              <div class="text-right">
                <p class="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Precio Unit.</p>
                <p class="text-xs font-semibold text-slate-600 dark:text-slate-400">{{ formatMoney(item.unit_price) }}</p>
              </div>
              <div class="text-right">
                <p class="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Importe</p>
                <p class="text-xs font-black text-slate-800 dark:text-white">{{ formatMoney(item.total || (item.quantity * item.unit_price)) }}</p>
              </div>
            </div>

            <!-- Extras (Si existen) -->
            <div v-if="item.extras?.length" class="mt-2 pt-2 border-t border-slate-100 dark:border-white/5">
              <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Extras / Adicionales</span>
              <div class="flex flex-wrap gap-2">
                <span 
                  v-for="(extra, eIdx) in item.extras" 
                  :key="eIdx"
                  class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20"
                >
                  + {{ extra.description }} ({{ formatMoney(extra.cost) }})
                </span>
              </div>
            </div>

            <!-- Observaciones del Producto -->
            <div v-if="item.observations" class="mt-3 pt-3 border-t border-slate-100 dark:border-white/5">
              <p class="text-[9px] font-bold text-primary uppercase tracking-wider mb-1">Instrucciones de confección</p>
              <div class="bg-primary/5 dark:bg-primary/10 border border-primary/15 rounded-xl p-2.5">
                <p class="text-xs font-medium text-slate-700 dark:text-slate-300 italic">
                  "{{ item.observations }}"
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Notas / Observaciones Generales -->
      <div v-if="order" class="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl">
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
          <p v-if="order.notes" class="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium whitespace-pre-line">
            {{ order.notes }}
          </p>
          <p v-else class="text-xs text-slate-400 italic">
            Sin observaciones registradas. Haga clic en Editar para agregar.
          </p>
        </div>
      </div>

      <!-- Sección de Totales y Liquidación -->
      <div class="bg-slate-50 dark:bg-white/5 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-wrap justify-between items-center gap-4">
        <!-- Lado Izquierdo: Stamp de Pago -->
        <div>
          <div 
            v-if="order.is_internal"
            class="inline-flex items-center px-4 py-2 border-2 border-slate-400 text-slate-500 bg-slate-50 dark:bg-white/5 dark:border-slate-500 rounded-xl font-black text-lg tracking-widest transform -rotate-1 shadow-sm"
          >
            NO APLICA
          </div>
          <div 
            v-else-if="order.is_liquidated" 
            class="inline-flex items-center px-4 py-2 border-2 border-emerald-600 text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:border-emerald-500 rounded-xl font-black text-lg tracking-widest transform -rotate-1 shadow-sm"
          >
            LIQUIDADO
          </div>
          <div 
            v-else 
            class="inline-flex items-center px-4 py-2 border-2 border-orange-500 text-orange-500 bg-orange-50 dark:bg-orange-500/10 dark:border-orange-500 rounded-xl font-black text-lg tracking-widest transform -rotate-1 shadow-sm animate-pulse-soft"
          >
            CON SALDO PENDIENTE
          </div>
        </div>

        <!-- Lado Derecho: Desglose de Montos -->
        <div class="w-64 space-y-2 text-sm">
          <div class="flex justify-between text-slate-500 dark:text-slate-400">
            <span>Total Pedido:</span>
            <span class="font-bold text-slate-800 dark:text-white">{{ formatMoney(order.total_amount) }}</span>
          </div>
          <div class="flex justify-between text-emerald-600 dark:text-emerald-400">
            <span>Anticipo Pagado:</span>
            <span class="font-bold">
              {{ order.is_internal ? formatMoney(0) : '-' + formatMoney(order.advance_payment || 0) }}
            </span>
          </div>
          <div class="flex justify-between border-t border-slate-200 dark:border-slate-800 pt-2 text-base font-black">
            <span class="text-slate-900 dark:text-white">Saldo Restante:</span>
            <span 
              :class="(order.is_internal || (order.remaining_amount ?? 0) <= 0.01) ? 'text-emerald-600 dark:text-emerald-400' : 'text-orange-500 dark:text-orange-400'"
            >
              {{ order.is_internal ? formatMoney(0) : formatMoney(order.remaining_amount ?? 0) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Acciones Inferiores -->
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
import { PencilIcon } from 'lucide-vue-next'
import { useFormatter } from '~/composables/useFormatter'
import { useApi } from '~/composables/useApi'
import { useToast } from '~/stores/toast'
import type { Order } from '~/types'

const props = defineProps<{
  show: boolean
  order: Order | null
}>()

const emit = defineEmits(['update:show', 'updated'])

const { formatMoney } = useFormatter()
const api = useApi()
const toast = useToast()

const isEditingNotes = ref(false)
const localNotes = ref('')
const savingNotes = ref(false)

watch(() => props.show, (newVal) => {
  if (newVal && props.order) {
    localNotes.value = props.order.notes || ''
    isEditingNotes.value = false
  }
}, { immediate: true })

watch(() => props.order, (newOrder) => {
  if (newOrder) {
    localNotes.value = newOrder.notes || ''
    isEditingNotes.value = false
  }
})

const startEditingNotes = () => {
  localNotes.value = props.order?.notes || ''
  isEditingNotes.value = true
}

const cancelEditingNotes = () => {
  isEditingNotes.value = false
  localNotes.value = props.order?.notes || ''
}

const saveNotes = async () => {
  if (!props.order?.id) return
  
  savingNotes.value = true
  try {
    await api.patch(`/api/orders/${props.order.id}/notes`, {
      notes: localNotes.value
    })
    
    if (props.order) {
      props.order.notes = localNotes.value
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

const getProductionStatusClass = (status: string | null) => {
  const s = (status || '').toLowerCase().trim()
  if (s.includes('pendiente')) {
    return 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20'
  }
  if (s.includes('corte')) {
    return 'bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20'
  }
  if (s.includes('confección') || s.includes('confeccion')) {
    return 'bg-violet-50 text-violet-600 border-violet-100 dark:bg-violet-500/10 dark:text-violet-400 dark:border-violet-500/20'
  }
  if (s.includes('bordado')) {
    return 'bg-pink-50 text-pink-600 border-pink-100 dark:bg-pink-500/10 dark:text-pink-400 dark:border-pink-500/20'
  }
  if (s.includes('planchado') || s.includes('empaque') || s.includes('terminado')) {
    return 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
  }
  if (s.includes('inventario') || s.includes('pasado a')) {
    return 'bg-cyan-50 text-cyan-600 border-cyan-100 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/20'
  }
  if (s.includes('entregado')) {
    return 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
  }
  return 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20'
}

// Helpers para fechas
const formatDate = (dateStr: string | null) => {
  if (!dateStr) return 'Sin fecha'
  // parse standard date YYYY-MM-DD
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
}

const getDaysLeft = (deliveryDateStr: string | null) => {
  if (!deliveryDateStr) return 0
  const delivery = new Date(deliveryDateStr + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diffTime = delivery.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

const getDaysLeftText = (deliveryDateStr: string | null) => {
  const days = getDaysLeft(deliveryDateStr)
  if (days < 0) return 'Retrasado'
  if (days === 0) return 'Entrega Hoy'
  if (days === 1) return 'Entrega Mañana'
  return `Faltan ${days} días`
}

const getDaysLeftClass = (deliveryDateStr: string | null) => {
  const days = getDaysLeft(deliveryDateStr)
  if (days < 0) {
    return 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400'
  }
  if (days <= 2) {
    return 'bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400'
  }
  return 'bg-primary/10 text-primary'
}
</script>

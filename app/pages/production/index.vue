<template>
  <div class="flex flex-col h-[calc(100vh-64px)] -m-4 md:-m-8 bg-background-light dark:bg-background-dark">
    <!-- Header -->
    <div class="px-6 py-4 border-b border-border-light dark:border-border-dark bg-white dark:bg-card-dark shrink-0">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-4">
          <h1 class="text-xl font-bold text-slate-800 dark:text-white">Producción</h1>
        </div>
        <div class="flex items-center gap-2">

          <button 
            @click="showAddModal = true"
            class="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:brightness-110 transition-all shadow-lg shadow-primary/20"
          >
            <PlusIcon class="w-5 h-5" /> Nuevo pedido
          </button>
        </div>
      </div>

    </div>

    <!-- Board -->
    <div class="flex-1 overflow-x-auto p-4 gap-4 flex items-start select-none board-scrollbar">
      <KanbanColumn
        v-for="column in columns"
        :key="column.id"
        :title="column.title"
        :color="column.color"
        :column-id="column.id"
        :cards="column.cards"
        @drag-start="(card, e) => onDragStart(card, e)"
        @drop-card="(e, idx) => onDropCard(e, column.id, idx)"
      >
        <template #card="{ card }">
          <div :data-card-index="column.cards.indexOf(card)">
            <KanbanCard
              :card="card"
              @drag-start="(c, ev) => onDragStart(c, ev)"
              @click="openDetail(card)"
              @deliver="handleDeliver"
              @print="handlePrint"
              @delete="confirmDelete"
            />
          </div>
        </template>
      </KanbanColumn>
    </div>

    <AddOrderModal 
      v-model:show="showAddModal" 
      @saved="onOrderSaved"
    />

    <OrderDetailModal
      v-model:show="showDetailModal"
      :card="selectedCard"
      @delete="confirmDelete"
    />

    <DeliverOrderModal
      v-model:show="showDeliverModal"
      :card="selectedCard"
      @confirm="processDelivery"
    />

    <BaseModal
      v-model:show="showDeleteConfirm"
      title="Confirmar Eliminación"
      subtitle="Esta acción no se puede deshacer de forma directa."
    >
      <div class="p-6">
        <div class="flex items-center gap-4 p-4 bg-red-50 dark:bg-red-500/10 rounded-2xl border border-red-100 dark:border-red-500/20 mb-6">
          <div class="p-3 bg-red-500 rounded-xl text-white">
            <TrashIcon class="w-6 h-6" />
          </div>
          <div>
            <h4 class="text-sm font-black text-red-600 uppercase tracking-widest">¿Eliminar este pedido?</h4>
            <p class="text-xs text-red-500 font-medium">Se borrará toda la información de producción.</p>
          </div>
        </div>

        <div v-if="selectedCard" class="bg-slate-50 dark:bg-white/5 p-5 rounded-2xl border border-slate-100 dark:border-white/5 space-y-4">
          <div class="flex justify-between items-center border-b border-slate-200 dark:border-white/5 pb-3">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Folio:</span>
            <span class="text-sm font-black text-slate-900 dark:text-white">#{{ selectedCard.order?.order_code }}</span>
          </div>
          <div class="flex justify-between items-center border-b border-slate-200 dark:border-white/5 pb-3">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cliente:</span>
            <span class="text-sm font-bold text-slate-900 dark:text-white">{{ selectedCard.title }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Monto Total:</span>
            <span class="text-sm font-black text-primary">${{ Number(selectedCard.order?.total_amount).toFixed(2) }}</span>
          </div>
        </div>

        <p class="mt-6 text-[10px] text-slate-400 italic text-center">
          * Si este pedido vino de una cotización, la cotización volverá a estado "Aceptada".
        </p>

        <div class="flex justify-end gap-3 mt-8">
          <BaseButton variant="secondary" @click="showDeleteConfirm = false">Cancelar</BaseButton>
          <BaseButton variant="danger" @click="deleteOrder">Sí, Eliminar Pedido</BaseButton>
        </div>
      </div>
    </BaseModal>

    <!-- Iframe oculto para impresión directa -->
    <iframe id="print-iframe" style="display:none"></iframe>
  </div>
</template>

<script setup>
import { onMounted, computed, ref } from 'vue'
import { FilterIcon, PlusIcon, TrashIcon } from 'lucide-vue-next'
import KanbanColumn from '~/components/kanban/KanbanColumn.vue'
import KanbanCard from '~/components/kanban/KanbanCard.vue'
import AddOrderModal from '~/components/kanban/AddOrderModal.vue'
import OrderDetailModal from '~/components/kanban/OrderDetailModal.vue'
import DeliverOrderModal from '~/components/kanban/DeliverOrderModal.vue'
import ConfirmModal from '~/components/ConfirmModal.vue'
import { useProductionStore } from '~/stores/production'
import { useToast } from '~/stores/toast'
import { useApi } from '~/composables/useApi'

const productionStore = useProductionStore()
const toast = useToast()
const showAddModal = ref(false)
const showDetailModal = ref(false)
const showDeliverModal = ref(false)
const showDeleteConfirm = ref(false)
const selectedCard = ref(null)

const columns = computed(() => productionStore.board?.columns || [])

const openDetail = (card) => {
  selectedCard.value = card
  showDetailModal.value = true
}

const handleDeliver = (card) => {
  selectedCard.value = card
  showDeliverModal.value = true
}

const processDelivery = async (card) => {
  const deliveredColumn = columns.value.find(c => c.title === 'Entregados')
  if (!deliveredColumn) return

  try {
    // 1. Mover la tarjeta a la columna de entregados
    await productionStore.moveCard(card.id, deliveredColumn.id, 1000)
    
    // 2. Cerrar modal y refrescar
    showDeliverModal.value = false
    await productionStore.fetchBoard()
    
    toast.success('Pedido entregado correctamente')
  } catch (err) {
    toast.error('Error al procesar la entrega')
  }
}

const confirmDelete = (card) => {
  selectedCard.value = card
  showDeleteConfirm.value = true
}

const deleteOrder = async () => {
  if (!selectedCard.value?.order?.id) return
  
  const api = useApi()
  try {
    await api.delete(`/api/orders/${selectedCard.value.order.id}`)
    toast.success('Pedido eliminado correctamente')
    showDeleteConfirm.value = false
    showDetailModal.value = false
    await productionStore.fetchBoard()
  } catch (err) {
    toast.error('Error al eliminar el pedido')
  }
}

const handlePrint = (card) => {
  if (card.order?.id) {
    const iframe = document.getElementById('print-iframe')
    if (iframe) {
      iframe.src = `/production/print/${card.order.id}`
    }
  }
}

const onOrderSaved = () => {
  // El store ya hace el fetchBoard en createOrder, pero aseguramos
  productionStore.fetchBoard()
}

// Mapear columnas del store
// Columnas del tablero

const onDragStart = (card, e) => {
  e.dataTransfer.effectAllowed = 'move'
  e.dataTransfer.setData('cardId', card.id)
}

const onDropCard = async (e, columnId, dropIndex) => {
  const cardId = e.dataTransfer.getData('cardId')
  if (!cardId) return

  const column = columns.value.find(c => c.id === columnId)
  if (!column) return

  // BLOQUEO: No se permite arrastrar a la columna de Entregados a menos que esté listo
  if (column.title === 'Entregados') {
    const card = productionStore.board.columns.flatMap(c => c.cards).find(c => c.id == cardId)
    if (card && card.status !== 'Listo para Entrega') {
      toast.error('Solo puedes entregar pedidos que ya estén en la columna "Listo para Entrega".')
      return
    }
    toast.error('La entrega debe procesarse formalmente mediante el botón de Entrega.')
    return
  }

  // Filtramos la tarjeta que se está moviendo si ya estaba en esta columna
  const columnCards = (column.cards || []).filter(c => c.id != cardId)
  let newPosition = 1000.0

  if (columnCards.length > 0) {
    if (dropIndex === 0) {
      newPosition = columnCards[0].position / 2
    } else if (dropIndex >= columnCards.length) {
      newPosition = columnCards[columnCards.length - 1].position + 1000
    } else {
      const prevPos = columnCards[dropIndex - 1].position
      const nextPos = columnCards[dropIndex].position
      newPosition = (prevPos + nextPos) / 2
    }
  }

  try {
    await productionStore.moveCard(Number(cardId), columnId, newPosition)
    await productionStore.fetchBoard()
  } catch (err) {
    alert('Error al mover la tarjeta')
  }
}

onMounted(() => {
  productionStore.fetchBoard()
})
</script>

<style scoped>
.board-scrollbar::-webkit-scrollbar { height: 6px; }
.board-scrollbar::-webkit-scrollbar-track { background: transparent; }
.board-scrollbar::-webkit-scrollbar-thumb { background: rgba(148,163,184,0.15); border-radius: 10px; }
.board-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(148,163,184,0.3); }
</style>

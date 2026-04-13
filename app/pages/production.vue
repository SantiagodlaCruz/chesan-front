<template>
  <div class="flex flex-col h-[calc(100vh-64px)] -m-4 md:-m-8 bg-background-light dark:bg-background-dark">
    <!-- Header -->
    <div class="flex items-center justify-between px-6 py-4 border-b border-border-light dark:border-border-dark bg-white dark:bg-card-dark shrink-0">
      <div class="flex items-center gap-4">
        <h1 class="text-xl font-bold text-slate-900 dark:text-white">Producción</h1>
        <div class="flex bg-slate-100 dark:bg-white/5 p-1 rounded-lg">
          <button class="px-3 py-1.5 text-xs font-bold bg-white dark:bg-[#1e293b] shadow-sm rounded-md text-slate-800 dark:text-slate-100">Tablero</button>
          <button class="px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Lista</button>
          <button class="px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Cronograma</button>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button class="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-[#1e293b] border border-border-light dark:border-white/5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
          <FilterIcon class="w-3.5 h-3.5" /> Filtrar
        </button>
        <button class="flex items-center gap-2 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-bold hover:brightness-110 transition-all shadow-lg shadow-primary/20">
          <PlusIcon class="w-3.5 h-3.5" /> Nuevo Pedido
        </button>
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
        :cards="getCardsByColumn(column.id)"
        @drag-start="(card, e) => onDragStart(card, e)"
        @drop-card="(e, idx) => onDropCard(e, column.id, idx)"
      >
        <template #card="{ card }">
          <div :data-card-index="getCardsByColumn(column.id).indexOf(card)">
            <KanbanCard
              :card="card"
              @drag-start="(c, ev) => onDragStart(c, ev)"
            />
          </div>
        </template>
      </KanbanColumn>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { FilterIcon, PlusIcon } from 'lucide-vue-next'
import KanbanColumn from '~/components/kanban/KanbanColumn.vue'
import KanbanCard from '~/components/kanban/KanbanCard.vue'

const columns = ref([
  { id: 'pendientes', title: 'Pendientes',           color: 'bg-slate-400' },
  { id: 'corte',      title: 'Corte',                color: 'bg-blue-500' },
  { id: 'costura',    title: 'Costura',              color: 'bg-purple-500' },
  { id: 'bordado',    title: 'Bordado / Estampado',  color: 'bg-pink-500' },
  { id: 'calidad',    title: 'Control de Calidad',   color: 'bg-amber-500' },
  { id: 'listo',      title: 'Listo para Entrega',   color: 'bg-emerald-500' }
])

const cards = ref([
  {
    id: 'c1',
    columnId: 'pendientes',
    orderId: '#ORD-4508',
    urgency: 'Alta',
    title: 'Uniforme Industrial - Tech Corp',
    deliveryDate: '15 Abr 2026',
    daysLeft: 5
  },
  {
    id: 'c2',
    columnId: 'pendientes',
    orderId: '#ORD-4512',
    urgency: 'Media',
    title: 'Playeras Polo - Oficinas GRM',
    deliveryDate: '20 Abr 2026',
    daysLeft: 10
  },
  {
    id: 'c3',
    columnId: 'corte',
    orderId: '#ORD-4502',
    urgency: 'Media',
    title: 'Camisas Polo - Colegio San José',
    deliveryDate: '18 Abr 2026',
    daysLeft: 8
  },
  {
    id: 'c4',
    columnId: 'costura',
    orderId: '#ORD-4503',
    urgency: 'Baja',
    title: 'Chaquetas Sport - Gym Central',
    deliveryDate: '25 Abr 2026',
    daysLeft: 15
  },
  {
    id: 'c5',
    columnId: 'costura',
    orderId: '#ORD-4499',
    urgency: 'Alta',
    title: 'Pantalones Cargo - Seguridad MX',
    deliveryDate: '12 Abr 2026',
    daysLeft: 2
  },
  {
    id: 'c6',
    columnId: 'bordado',
    orderId: '#ORD-4498',
    urgency: 'Media',
    title: 'Gorras Promocionales - Eventos X',
    deliveryDate: '22 Abr 2026',
    daysLeft: 12
  },
  {
    id: 'c7',
    columnId: 'calidad',
    orderId: '#ORD-4495',
    urgency: 'Baja',
    title: 'Batas Laboratorio - FarmaChem',
    deliveryDate: '28 Abr 2026',
    daysLeft: 18
  },
  {
    id: 'c8',
    columnId: 'listo',
    orderId: '#ORD-4490',
    urgency: 'Baja',
    title: 'Mandiles Cocina - Chef Gourmet',
    deliveryDate: '10 Abr 2026',
    daysLeft: 0
  },
  {
    id: 'c9',
    columnId: 'listo',
    orderId: '#ORD-4488',
    urgency: 'Alta',
    title: 'Camisetas Staff - Festival Rock',
    deliveryDate: '11 Abr 2026',
    daysLeft: 1
  }
])

const getCardsByColumn = (colId) => cards.value.filter(c => c.columnId === colId)

const onDragStart = (card, e) => {
  e.dataTransfer.effectAllowed = 'move'
  e.dataTransfer.setData('cardId', card.id)
}

const onDropCard = (e, columnId, dropIndex) => {
  const cardId = e.dataTransfer.getData('cardId')
  if (!cardId) return

  const card = cards.value.find(c => c.id === cardId)
  if (!card) return

  // Remove from current position
  const oldIdx = cards.value.indexOf(card)
  cards.value.splice(oldIdx, 1)

  // Update column
  card.columnId = columnId

  // Find the correct insert position in the full array
  const columnCards = cards.value.filter(c => c.columnId === columnId)
  if (dropIndex >= columnCards.length) {
    // Append after the last card of this column
    const lastCard = columnCards[columnCards.length - 1]
    const insertAt = lastCard ? cards.value.indexOf(lastCard) + 1 : cards.value.length
    cards.value.splice(insertAt, 0, card)
  } else {
    // Insert before the card at dropIndex
    const targetCard = columnCards[dropIndex]
    const insertAt = cards.value.indexOf(targetCard)
    cards.value.splice(insertAt, 0, card)
  }
}
</script>

<style scoped>
.board-scrollbar::-webkit-scrollbar { height: 6px; }
.board-scrollbar::-webkit-scrollbar-track { background: transparent; }
.board-scrollbar::-webkit-scrollbar-thumb { background: rgba(148,163,184,0.15); border-radius: 10px; }
.board-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(148,163,184,0.3); }
</style>

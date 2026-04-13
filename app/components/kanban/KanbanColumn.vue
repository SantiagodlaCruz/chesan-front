<template>
  <div class="flex flex-col h-full min-w-[300px] max-w-[300px] gap-3 rounded-2xl px-2.5 py-4 bg-slate-400/5 dark:bg-slate-400/5 border border-slate-400/10 dark:border-white/5">
    <!-- Header -->
    <div class="flex items-center justify-between px-1">
      <div class="flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full shrink-0" :class="color"></span>
        <h3 class="text-[11px] font-black uppercase tracking-widest text-slate-500">{{ title }}</h3>
        <span class="text-[10px] bg-slate-200 dark:bg-white/5 px-2 py-0.5 rounded-full text-slate-500 font-bold">
          {{ cards.length }}
        </span>
      </div>
      <button class="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
        <MoreHorizontalIcon class="w-4 h-4" />
      </button>
    </div>

    <!-- Body / Drop Zone -->
    <div
      ref="dropZone"
      class="flex-1 overflow-y-auto rounded-xl px-1 py-1.5 transition-all duration-200 custom-scrollbar relative"
      :class="isOverColumn ? 'bg-primary/5 dark:bg-primary/5 ring-1 ring-primary/20' : ''"
      @dragover.prevent="onDragOver"
      @dragleave.prevent="onDragLeave"
      @drop.prevent="onDrop"
    >
      <div class="space-y-3">
        <template v-for="(card, idx) in cards" :key="card.id">
          <!-- Ghost placeholder ABOVE this card -->
          <div
            v-if="ghostIndex === idx"
            class="ghost-placeholder h-16 border-2 border-dashed border-primary/40 rounded-xl bg-primary/5 dark:bg-primary/10 transition-all duration-200 flex items-center justify-center"
          >
            <span class="text-[9px] font-bold text-primary/50 uppercase tracking-widest">Soltar aquí</span>
          </div>

          <slot name="card" :card="card" :index="idx">
            <div :data-card-index="idx" class="hover:cursor-pointer">
              <KanbanCard :card="card" @drag-start="$emit('drag-start', $event)" @drag-end="resetGhost" />
            </div>
          </slot>
        </template>

        <!-- Ghost at the END of the list -->
        <div
          v-if="ghostIndex === cards.length"
          class="ghost-placeholder h-16 border-2 border-dashed border-primary/40 rounded-xl bg-primary/5 dark:bg-primary/10 transition-all duration-200 flex items-center justify-center"
        >
          <span class="text-[9px] font-bold text-primary/50 uppercase tracking-widest">Soltar aquí</span>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="cards.length === 0 && ghostIndex === -1" class="h-full min-h-[120px] flex items-center justify-center">
        <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest opacity-40">Sin pedidos</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { MoreHorizontalIcon } from 'lucide-vue-next'
import KanbanCard from './KanbanCard.vue'

const props = defineProps({
  title: String,
  color: String,
  columnId: String,
  cards: { type: Array, default: () => [] }
})



const emit = defineEmits(['drop-card', 'drag-start'])
const dropZone = ref(null)
const isOverColumn = ref(false)
const ghostIndex = ref(-1)

const getDropIndex = (e) => {
  const container = dropZone.value
  if (!container) return props.cards.length

  const cardElements = container.querySelectorAll('[data-card-index]')
  for (let i = 0; i < cardElements.length; i++) {
    const rect = cardElements[i].getBoundingClientRect()
    const midY = rect.top + rect.height / 2
    if (e.clientY < midY) return i
  }
  return props.cards.length
}

const onDragOver = (e) => {
  isOverColumn.value = true
  ghostIndex.value = getDropIndex(e)
}

const onDragLeave = (e) => {
  // Only truly leave if we exited the column entirely
  const rect = dropZone.value?.getBoundingClientRect()
  if (!rect) return
  if (
    e.clientX < rect.left ||
    e.clientX > rect.right ||
    e.clientY < rect.top ||
    e.clientY > rect.bottom
  ) {
    isOverColumn.value = false
    ghostIndex.value = -1
  }
}

const onDrop = (e) => {
  const idx = ghostIndex.value
  isOverColumn.value = false
  ghostIndex.value = -1
  emit('drop-card', e, idx)
}

const resetGhost = () => {
  isOverColumn.value = false
  ghostIndex.value = -1
}
</script>

<style scoped>
.ghost-placeholder {
  animation: ghost-pulse 1.5s ease-in-out infinite;
}
@keyframes ghost-pulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(148,163,184,0.15); border-radius: 10px; }
</style>

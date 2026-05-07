<template>
  <div
    :draggable="card.status !== 'Entregados'"
    @dragstart="onDragStart"
    @dragend="onDragEnd"
    class="kanban-card bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-white/5 p-4 rounded-xl transition-all select-none group"
    :class="[
      card.status === 'Entregados' ? 'opacity-70 grayscale-[0.5] cursor-default border-dashed' : 'cursor-grab cursor-pointer active:cursor-grabbing hover:border-primary/40 hover:shadow-md hover:shadow-primary/5'
    ]"
  >
    <!-- Header: Code + Urgency -->
    <div class="flex justify-between items-center mb-2.5">
      <span class="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md tracking-wide">#ORD-{{ card.order?.order_code }}</span>
      <div v-if="card.status === 'Entregados'" class="flex items-center gap-1 text-[9px] font-black uppercase text-slate-400">
        <CheckIcon class="w-3 h-3" /> Entregado
      </div>
    </div>

    <!-- Title -->
    <h4 class="text-[13px] font-bold text-slate-800 dark:text-slate-100 leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-1">
      {{ card.title }}
    </h4>

    <!-- Product List (Scrollable) -->
    <div class="mb-3 max-h-[80px] overflow-y-auto pr-1 space-y-1 custom-scrollbar-thin">
      <div 
        v-for="item in card.order?.items" 
        :key="item.id"
        class="flex items-center justify-between text-[10px] bg-slate-50 dark:bg-white/5 px-2 py-1 rounded border border-slate-100 dark:border-white/5"
      >
        <div class="flex items-center gap-2 truncate flex-1">
          <span 
            v-if="item.color?.hex_code" 
            class="w-2 h-2 rounded-full border border-black/10 shrink-0" 
            :style="{ backgroundColor: item.color.hex_code }"
          ></span>
          <span class="font-medium text-slate-600 dark:text-slate-400 truncate">
            {{ item.product_name }}
          </span>
        </div>
        <div class="flex items-center gap-1.5 shrink-0">
          <span v-if="item.size" class="text-slate-400 font-bold uppercase">{{ item.size }}</span>
          <span class="bg-primary/10 text-primary px-1.5 rounded font-black">{{ item.quantity }}</span>
        </div>
      </div>
    </div>

    <!-- Acciones de Entrega / Impresión -->
    <div v-if="card.status === 'Listo para Entrega'" class="mt-3 pt-3 border-t border-slate-100 dark:border-white/5">
      <button 
        @click.stop="$emit('deliver', card)"
        class="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
      >
        <CheckCircleIcon class="w-3.5 h-3.5" />
        Procesar Entrega
      </button>
    </div>

    <div v-if="card.status === 'Entregados'" class="mt-3 pt-3 border-t border-slate-100 dark:border-white/5">
      <button 
        @click.stop="$emit('print', card)"
        class="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2"
      >
        <PrinterIcon class="w-3.5 h-3.5" />
        Imprimir Recibo
      </button>
    </div>

      <!-- Footer: Date + Days Left -->
    <div class="flex justify-between items-center mt-4 pt-3 border-t border-slate-100 dark:border-white/5">
      <div class="flex items-center gap-2 text-slate-500 dark:text-slate-400">
        <CalendarIcon class="w-3.5 h-3.5 text-primary/60" />
        <span class="text-[10px] font-bold">{{ card.deliveryDate }}</span>
      </div>

      <!-- Badge de Días Restantes con Semáforo y Alerta de Retraso -->
      <div 
        class="flex items-center gap-1 px-2.5 py-1 rounded-lg font-black text-[10px] uppercase tracking-wider transition-all"
        :class="[
          card.daysLeft < 0 ? 'bg-red-500 text-white shadow-lg shadow-red-500/40 animate-pulse' :
          card.daysLeft <= 3 ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20' :
          card.daysLeft <= 7 ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' :
          'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
        ]"
      >
        <ClockIcon class="w-3.5 h-3.5" />
        {{ card.daysLeft < 0 ? 'Retraso: ' + Math.abs(card.daysLeft) + 'D' : card.daysLeft + ' Días' }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { CalendarIcon, ClockIcon, CheckCircleIcon, CheckIcon, PrinterIcon } from 'lucide-vue-next'

const props = defineProps({
  card: { type: Object, required: true }
})

const emit = defineEmits(['drag-start', 'drag-end', 'deliver', 'print'])

const urgencyClass = computed(() => {
  const u = props.card.urgency?.toLowerCase()
  if (u === 'alta') return 'text-red-500 bg-red-500/10'
  if (u === 'media') return 'text-amber-500 bg-amber-500/10'
  return 'text-emerald-500 bg-emerald-500/10'
})

const daysClass = computed(() => {
  const d = props.card.daysLeft
  if (d <= 2) return 'text-red-500 bg-red-500/10'
  if (d <= 5) return 'text-amber-500 bg-amber-500/10'
  return 'text-slate-500 bg-slate-100 dark:bg-white/5'
})

const onDragStart = (e) => {
  e.dataTransfer.effectAllowed = 'move'
  e.dataTransfer.setData('cardId', props.card.id)
  emit('drag-start', props.card, e)
  requestAnimationFrame(() => {
    e.target.classList.add('dragging')
  })
}

const onDragEnd = (e) => {
  e.target.classList.remove('dragging')
  emit('drag-end')
}
</script>

<style scoped>
.kanban-card.dragging {
  opacity: 0.35;
  transform: scale(0.96);
  border-style: dashed;
  border-color: rgba(59, 130, 246, 0.4);
}

.custom-scrollbar-thin::-webkit-scrollbar {
  width: 3px;
}
.custom-scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar-thin::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.2);
  border-radius: 10px;
}
</style>

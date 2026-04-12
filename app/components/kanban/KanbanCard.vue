<template>
  <div
    draggable="true"
    @dragstart="onDragStart"
    @dragend="onDragEnd"
    class="kanban-card bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-white/5 p-4 rounded-xl transition-all cursor-grab active:cursor-grabbing group select-none hover:border-primary/40 hover:shadow-md hover:shadow-primary/5"
  >
    <!-- Header: Code + Urgency -->
    <div class="flex justify-between items-center mb-2.5">
      <span class="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md tracking-wide">{{ card.orderId }}</span>
      <span
        class="text-[9px] font-black uppercase rounded-md px-2 py-0.5 tracking-wider"
        :class="urgencyClass"
      >
        {{ card.urgency }}
      </span>
    </div>

    <!-- Title -->
    <h4 class="text-[13px] font-bold text-slate-800 dark:text-slate-100 leading-snug mb-3 group-hover:text-primary transition-colors">
      {{ card.title }}
    </h4>

    <!-- Footer: Delivery + Days Left -->
    <div class="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-white/5">
      <div class="flex items-center gap-1.5 text-slate-400">
        <CalendarIcon class="w-3 h-3" />
        <span class="text-[10px] font-medium">{{ card.deliveryDate }}</span>
      </div>
      <div
        class="flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider"
        :class="daysClass"
      >
        <ClockIcon class="w-3 h-3" />
        {{ card.daysLeft }}d
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { CalendarIcon, ClockIcon } from 'lucide-vue-next'

const props = defineProps({
  card: { type: Object, required: true }
})

const emit = defineEmits(['drag-start', 'drag-end'])

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
</style>

<template>
  <BaseModal
    :show="show"
    title="Buscar Apartado Pendiente"
    subtitle="Busca apartados por nombre de cliente o número de ticket para liquidarlos."
    size="lg"
    @update:show="close"
  >
    <div class="space-y-6">
      <!-- Input de búsqueda -->
      <div class="relative flex gap-3">
        <div class="relative flex-1">
          <SearchIcon class="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Ingresa el nombre del cliente o número de ticket..."
            class="w-full bg-slate-50 dark:bg-card-dark border border-slate-200 dark:border-border-dark focus:border-primary outline-none pl-11 pr-4 py-3 rounded-xl text-slate-800 dark:text-slate-100 transition-all text-sm font-semibold"
            @keydown.enter="searchTickets"
          />
        </div>
        <button
          @click="searchTickets"
          :disabled="loading"
          class="px-5 py-3 bg-primary hover:bg-primary/90 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all active:scale-95 disabled:opacity-50"
        >
          {{ loading ? 'Buscando...' : 'Buscar' }}
        </button>
      </div>

      <!-- Errores -->
      <div v-if="error" class="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold rounded-xl">
        {{ error }}
      </div>

      <!-- Listado de tickets -->
      <div class="relative min-h-[250px] max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
        <!-- Spinner de carga -->
        <div v-if="loading" class="absolute inset-0 bg-white/50 dark:bg-slate-900/50 flex items-center justify-center z-10 rounded-xl backdrop-blur-[1px]">
          <div class="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
        </div>

        <!-- Tabla/Lista de resultados -->
        <div v-if="tickets.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="ticket in tickets"
            :key="ticket.id"
            class="p-4 bg-white dark:bg-card-dark border border-slate-150 dark:border-white/5 rounded-2xl hover:border-primary/40 dark:hover:border-primary/30 transition-all flex flex-col justify-between shadow-sm dark:shadow-none group relative overflow-hidden"
          >
            <!-- Decoración sutil de estado de vencimiento -->
            <div
              v-if="isOverdue(ticket.due_date)"
              class="absolute top-0 right-0 left-0 h-1 bg-red-500"
              title="Vencido"
            ></div>

            <div>
              <!-- Cabecera de la tarjeta: Estado y Folio -->
              <div class="flex flex-col mb-2">
                <div class="flex justify-between items-center mb-1">
                  <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Apartado</span>
                  <span
                    v-if="isOverdue(ticket.due_date)"
                    class="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400"
                  >
                    Vencido
                  </span>
                  <span
                    v-else
                    class="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
                  >
                    Vigente
                  </span>
                </div>
                <span class="font-mono text-xs font-black text-slate-400 group-hover:text-primary transition-colors truncate" :title="ticket.ticket_number">
                  {{ ticket.ticket_number }}
                </span>
              </div>

              <!-- Nombre del cliente -->
              <h4 class="text-sm font-black text-slate-800 dark:text-slate-100 leading-tight mb-2 truncate">
                {{ ticket.customer_name || ticket.client?.name || 'Cliente sin nombre' }}
              </h4>

              <!-- Información de fechas -->
              <div class="space-y-1 text-[11px] text-slate-500 mb-4">
                <div class="flex items-center gap-1.5">
                  <CalendarIcon class="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Creado: {{ ticket.created_at_formatted }}</span>
                </div>
                <div class="flex items-center gap-1.5" :class="isOverdue(ticket.due_date) ? 'text-red-500 font-bold' : ''">
                  <CalendarIcon class="w-3.5 h-3.5 shrink-0" />
                  <span>Límite: {{ formatDate(ticket.due_date) }}</span>
                </div>
              </div>
            </div>

            <!-- Resumen Financiero y Botón Seleccionar -->
            <div class="pt-3 border-t border-slate-100 dark:border-white/5 flex flex-col space-y-3">
              <div class="flex justify-between items-end">
                <div class="flex flex-col">
                  <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">
                    Saldo Pendiente
                  </span>
                  <span class="text-lg font-black text-primary leading-none">
                    {{ formatMoney(ticket.balance) }}
                  </span>
                </div>
                <span class="text-[10px] text-slate-500 font-semibold">
                  Total: {{ formatMoney(ticket.total) }}
                </span>
              </div>

              <button
                @click="selectTicket(ticket)"
                class="w-full py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl transition-all flex items-center justify-center gap-1.5 text-xs font-black uppercase tracking-widest active:scale-[0.98]"
              >
                <span>Liquidar</span>
                <ChevronRightIcon class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="!loading" class="absolute inset-0 flex flex-col items-center justify-center text-slate-400 py-12">
          <div class="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center mb-4">
            <InboxIcon class="w-8 h-8 opacity-20" />
          </div>
          <p class="text-xs font-black uppercase tracking-widest opacity-40">No se encontraron apartados</p>
          <p class="text-[11px] mt-1 text-slate-400 text-center px-6">
            Intenta ingresando otro nombre de cliente o revisa si ya fue liquidado.
          </p>
        </div>
      </div>

      <!-- Pie de modal -->
      <div class="flex justify-end pt-2 border-t border-slate-100 dark:border-white/5">
        <BaseButton type="button" variant="secondary" :full="false" @click="close">Cerrar</BaseButton>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { ref, watch } from 'vue'
import { SearchIcon, ChevronRightIcon, CalendarIcon, InboxIcon } from 'lucide-vue-next'
import BaseModal from '~/components/BaseModal.vue'
import BaseButton from '~/components/BaseButton.vue'
import { useFormatter } from '~/composables/useFormatter'

const props = defineProps({
  show: Boolean
})

const emit = defineEmits(['update:show', 'select'])
const api = useApi()
const { formatMoney } = useFormatter()

const searchQuery = ref('')
const loading = ref(false)
const tickets = ref([])
const error = ref('')

const searchTickets = async () => {
  if (!searchQuery.value.trim()) {
    tickets.value = []
    return
  }
  loading.value = true
  error.value = ''
  try {
    const response = await api.get('/api/tickets/layaways/search', {
      params: { search: searchQuery.value }
    })
    tickets.value = response.data || []
  } catch (err) {
    console.error('Error searching layaways:', err)
    error.value = 'Ocurrió un error al buscar los apartados.'
  } finally {
    loading.value = false
  }
}

// Limpiar búsqueda al abrir
watch(() => props.show, (newVal) => {
  if (newVal) {
    searchQuery.value = ''
    tickets.value = []
    error.value = ''
  }
})

const selectTicket = (ticket) => {
  emit('select', ticket)
  close()
}

const close = () => {
  emit('update:show', false)
}

// Determinar si el apartado está vencido
const isOverdue = (dueDate) => {
  if (!dueDate) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const limitDate = new Date(dueDate)
  limitDate.setHours(0, 0, 0, 0)
  return limitDate < today
}

const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  const parts = dateStr.split('-')
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`
  }
  return dateStr
}
</script>

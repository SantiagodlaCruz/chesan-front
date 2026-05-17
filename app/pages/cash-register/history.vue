<template>
  <div class="space-y-8 animate-in fade-in duration-700">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
          Historial de Cortes
        </h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Consulta y audita los cierres de caja realizados anteriormente.
        </p>
      </div>
      <div class="flex items-center gap-3">
        <div class="bg-primary/10 text-primary px-4 py-2 rounded-xl border border-primary/20 flex items-center gap-2">
          <CalendarIcon class="w-4 h-4" />
          <span class="text-xs font-bold uppercase tracking-widest">{{ todayFormatted }}</span>
        </div>
      </div>
    </div>

    <!-- Table Section -->
    <div class="bg-white dark:bg-card-dark rounded-2xl border border-border-light dark:border-border-dark shadow-sm overflow-hidden">
      <div v-if="loading" class="py-20 flex flex-col items-center justify-center gap-4">
        <div class="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sincronizando historial...</p>
      </div>

      <div v-else-if="!sessions || sessions.length === 0" class="py-20 flex flex-col items-center justify-center text-center px-6">
        <div class="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-3xl flex items-center justify-center mb-4">
          <InboxIcon class="w-10 h-10 text-slate-300" />
        </div>
        <h3 class="text-lg font-bold text-slate-800 dark:text-white">No hay cortes registrados</h3>
        <p class="text-sm text-slate-500 max-w-xs mt-1">Aún no se ha realizado ningún cierre de caja en el sistema.</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr class="bg-panel-light dark:bg-white/5 border-b border-border-light dark:border-border-dark">
              <th class="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Fecha Cierre</th>
              <th class="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Usuario</th>
              <th class="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Fondo Inicial</th>
              <th class="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Esperado</th>
              <th class="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Real</th>
              <th class="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Diferencia</th>
              <th class="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right whitespace-nowrap">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border-light dark:divide-border-dark relative">
            <tr v-for="session in sessions" :key="session.id" class="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
              <td class="px-4 py-2.5">
                <p class="text-sm font-bold text-slate-800 dark:text-slate-100">
                  {{ formatDate(session.closing_time) }}
                </p>
                <p class="text-[10px] text-slate-400 uppercase font-medium">
                  {{ formatTime(session.closing_time) }}
                </p>
              </td>
              <td class="px-4 py-2.5">
                <div class="flex items-center gap-2">
                  <div class="w-7 h-7 bg-slate-100 dark:bg-white/10 rounded-lg flex items-center justify-center text-[10px] font-bold text-slate-500 uppercase">
                    {{ session.closed_by?.name?.charAt(0) || 'U' }}
                  </div>
                  <span class="text-xs font-semibold text-slate-700 dark:text-slate-300">{{ session.closed_by?.name || 'Sistema' }}</span>
                </div>
              </td>
              <td class="px-4 py-2.5 text-xs text-slate-500">
                {{ formatMoney(session.opening_balance) }}
              </td>
              <td class="px-4 py-2.5 text-xs text-slate-500 font-medium">
                {{ formatMoney(session.expected_cash) }}
              </td>
              <td class="px-4 py-2.5 text-sm font-black text-slate-800 dark:text-slate-100">
                {{ formatMoney(session.real_cash) }}
              </td>
              <td class="px-4 py-2.5">
                <span 
                  class="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tight border"
                  :class="session.difference >= 0 
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' 
                    : 'bg-red-50 text-red-600 border-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20'"
                >
                  {{ session.difference >= 0 ? '+' : '' }}{{ formatMoney(session.difference) }}
                </span>
              </td>
              <td class="px-4 py-2.5 text-right">
                <button 
                  @click="viewDetails(session)"
                  class="p-1.5 hover:bg-primary/10 rounded-xl transition-all group/btn" 
                  title="Ver Detalle"
                >
                  <EyeIcon class="w-4 h-4 text-primary group-hover/btn:scale-110 transition-transform" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Footer -->
      <div v-if="pagination.last_page > 1" class="px-4 py-2 bg-panel-light dark:bg-white/5 border-t border-border-light dark:border-border-dark flex items-center justify-between">
        <p class="text-[11px] text-slate-500 font-medium">
          Página {{ pagination.current_page }} de {{ pagination.last_page }}
        </p>
        
        <div class="flex items-center gap-1.5">
          <button 
            @click="fetchHistory(pagination.current_page - 1)"
            :disabled="pagination.current_page === 1"
            class="p-2 rounded-xl bg-white dark:bg-card-dark border border-border-light dark:border-border-dark hover:bg-slate-100 dark:hover:bg-white/5 disabled:opacity-30 transition-all hover:text-primary shadow-sm"
          >
            <ChevronLeftIcon class="w-4 h-4" />
          </button>
          <button 
            @click="fetchHistory(pagination.current_page + 1)"
            :disabled="pagination.current_page === pagination.last_page"
            class="p-2 rounded-xl bg-white dark:bg-card-dark border border-border-light dark:border-border-dark hover:bg-slate-100 dark:hover:bg-white/5 disabled:opacity-30 transition-all hover:text-primary shadow-sm"
          >
            <ChevronRightIcon class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Detail Modal -->
    <BaseModal
      :show="!!selectedSession"
      title="Detalle de Corte"
      size="2xl"
      @update:show="selectedSession = null"
    >
      <template #subtitle v-if="selectedSession">
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Cerrado el {{ formatDate(selectedSession.closing_time) }} a las {{ formatTime(selectedSession.closing_time) }}
        </p>
      </template>

      <div v-if="selectedSession" class="space-y-8">
        <div class="space-y-4">
          <!-- Ventas -->
          <div class="grid grid-cols-3 gap-4">
            <div class="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
              <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Ventas Efectivo</p>
              <p class="text-lg font-black text-slate-900 dark:text-white">{{ formatMoney(selectedSession.total_cash_sales) }}</p>
            </div>
            <div class="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
              <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Ventas Tarjeta</p>
              <p class="text-lg font-black text-slate-900 dark:text-white">{{ formatMoney(selectedSession.total_card_sales) }}</p>
            </div>
            <div class="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
              <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Transferencias</p>
              <p class="text-lg font-black text-slate-900 dark:text-white">{{ formatMoney(selectedSession.total_transfer_sales) }}</p>
            </div>
          </div>
          <!-- Movimientos -->
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400 p-4 rounded-2xl border border-green-100 dark:border-green-500/20">
              <p class="text-[9px] font-black opacity-80 uppercase tracking-widest mb-1">Ingresos Extras</p>
              <p class="text-lg font-black">{{ formatMoney(selectedSession.total_inflows) }}</p>
            </div>
            <div class="bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 p-4 rounded-2xl border border-red-100 dark:border-red-500/20">
              <p class="text-[9px] font-black opacity-80 uppercase tracking-widest mb-1">Salidas (Gastos)</p>
              <p class="text-lg font-black">{{ formatMoney(selectedSession.total_outflows) }}</p>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 py-6 border-y border-slate-100 dark:border-white/5">
           <div>
             <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Balance General</h4>
             <div class="space-y-3">
               <div class="flex justify-between text-sm">
                 <span class="text-slate-500">Fondo Inicial:</span>
                 <span class="font-semibold text-slate-700 dark:text-slate-200">{{ formatMoney(selectedSession.opening_balance) }}</span>
               </div>
               <div class="flex justify-between text-sm">
                 <span class="text-slate-500">Ingresos Extras:</span>
                 <span class="font-semibold text-green-600 dark:text-green-400">+{{ formatMoney(selectedSession.total_inflows) }}</span>
               </div>
               <div class="flex justify-between text-sm">
                 <span class="text-slate-500">Salidas / Gastos:</span>
                 <span class="font-semibold text-red-600 dark:text-red-400">-{{ formatMoney(selectedSession.total_outflows) }}</span>
               </div>
               <div class="flex justify-between text-sm border-t border-slate-100 dark:border-white/5 pt-2">
                 <span class="text-slate-500 font-bold">Efectivo Esperado:</span>
                 <span class="font-bold text-slate-800 dark:text-slate-100">{{ formatMoney(selectedSession.expected_cash) }}</span>
               </div>
               <div class="flex justify-between text-sm pt-2 border-t border-dashed border-slate-200 dark:border-white/10">
                 <span class="text-slate-900 dark:text-white font-black">EFECTIVO REAL:</span>
                 <span class="font-black text-primary text-base">{{ formatMoney(selectedSession.real_cash) }}</span>
               </div>
             </div>
           </div>

           <div class="bg-slate-50 dark:bg-white/5 p-5 rounded-2xl border border-slate-100 dark:border-white/5">
             <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Observaciones</h4>
             <p class="text-sm text-slate-600 dark:text-slate-400 italic leading-relaxed">
               {{ selectedSession.notes || 'Sin observaciones registradas.' }}
             </p>
           </div>
        </div>

        <div class="flex items-center gap-4 text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
            Abierto por: <span class="text-slate-600 dark:text-slate-300">{{ selectedSession.opened_by?.name }}</span>
          </div>
          <div class="w-px h-3 bg-slate-200 dark:bg-white/10"></div>
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-red-500"></span>
            Cerrado por: <span class="text-slate-600 dark:text-slate-300">{{ selectedSession.closed_by?.name }}</span>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end">
          <button @click="selectedSession = null" class="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-primary/20">
            Cerrar Detalle
          </button>
        </div>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { 
  CalendarIcon, 
  InboxIcon, 
  EyeIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon 
} from 'lucide-vue-next'
import { useFormatter } from '~/composables/useFormatter'
import BaseModal from '~/components/BaseModal.vue'

const { formatMoney, formatDate, formatTime } = useFormatter()
const api = useApi()

const sessions = ref([])
const loading = ref(true)
const pagination = ref({ current_page: 1, last_page: 1 })
const selectedSession = ref(null)

const todayFormatted = new Date().toLocaleDateString('es-MX', { 
  weekday: 'long', 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})

const fetchHistory = async (page = 1) => {
  loading.value = true
  try {
    const response = await api.get(`/api/cash-register?page=${page}`)
    // En Laravel paginado, los datos vienen en response.data
    sessions.value = response.data || []
    pagination.value = {
      current_page: response.current_page || 1,
      last_page: response.last_page || 1
    }
  } catch (error) {
    console.error('Error fetching history:', error)
    sessions.value = []
  } finally {
    loading.value = false
  }
}

const viewDetails = (session) => {
  selectedSession.value = session
}

onMounted(() => {
  fetchHistory()
})
</script>

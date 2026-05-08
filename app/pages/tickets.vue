<template>
  <div class="flex flex-col gap-6">
    <!-- Header -->
    <div class="flex flex-wrap justify-between items-start gap-4">
      <div class="space-y-1">
        <h2 class="text-3xl font-black tracking-tight text-slate-800 dark:text-slate-100">Historial de tickets</h2>
        <p class="text-sm text-slate-500 dark:text-slate-400">Visualización de todas las ventas y apartados generados en el punto de venta.</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex items-end flex-wrap gap-3 pb-1 pt-1 relative z-10 w-full mb-2">
      <div class="w-64 shrink-0 relative">
        <label class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] ml-1 mb-1.5 block transition-colors">Buscar ticket</label>
        <div class="relative">
          <SearchIcon class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Nº de ticket o cliente..."
            class="w-full bg-white dark:bg-card-dark border border-border-light dark:border-border-dark focus:border-primary/30 outline-none pl-9 pr-4 py-2 rounded-xl text-sm transition-all shadow-sm"
            @input="debouncedFetch"
          />
        </div>
      </div>
      <div class="w-56 shrink-0">
        <Select 
          v-model="clientIdFilter" 
          :options="clientOptions" 
          label="Cliente"
          searchable
          @update:modelValue="fetchTickets"
        />
      </div>
      <div class="w-48 shrink-0">
        <Select 
          v-model="statusFilter" 
          :options="statusOptions" 
          label="Estado"
          @update:modelValue="fetchTickets"
        />
      </div>
      <div class="w-56 shrink-0">
        <Select 
          v-model="userFilter" 
          :options="userOptions" 
          label="Vendido por"
          searchable
          @update:modelValue="fetchTickets"
        />
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white dark:bg-card-dark rounded-2xl border border-border-light dark:border-border-dark overflow-hidden shadow-sm">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] border-b border-border-light dark:border-border-dark">
            <th class="px-6 py-4">Nº Ticket</th>
            <th class="px-6 py-4">Fecha</th>
            <th class="px-6 py-4">Cliente</th>
            <th class="px-6 py-4 text-center">Tipo / Método</th>
            <th class="px-6 py-4 text-right">Monto</th>
            <th class="px-6 py-4 text-center">Estado</th>
            <th class="px-6 py-4 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-border-light dark:divide-border-dark">
          <tr v-if="loading" v-for="i in 5" :key="i" class="animate-pulse">
            <td colspan="7" class="px-6 py-4"><div class="h-4 bg-slate-100 dark:bg-white/5 rounded w-full"></div></td>
          </tr>
          <tr v-else v-for="ticket in filteredTickets" :key="ticket.id" class="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
            <td class="px-6 py-4">
              <span class="font-mono text-xs font-bold text-primary bg-primary/5 px-2.5 py-1 rounded-md border border-primary/10 tracking-wider whitespace-nowrap">
                #{{ ticket.ticket_number }}
              </span>
            </td>
            <td class="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400">
              {{ ticket.created_at_formatted }}
            </td>
            <td class="px-6 py-4">
              <p class="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight">{{ ticket.client?.name || ticket.customer_name || 'Venta General' }}</p>
              <p class="text-[10px] text-slate-400 mt-0.5">Vendido por {{ ticket.user || 'Sistema' }}</p>
            </td>
            <td class="px-6 py-4 text-center">
              <div class="flex flex-col items-center gap-1">
                <span class="text-[9px] font-black uppercase tracking-widest text-slate-400">{{ ticket.ticket_type === 'layaway' ? 'Apartado' : 'Venta' }}</span>
                <span class="text-[10px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                   <CreditCardIcon v-if="ticket.payment_method === 'card'" class="w-3 h-3" />
                   <BanknoteIcon v-else-if="ticket.payment_method === 'cash'" class="w-3 h-3" />
                   <RefreshCwIcon v-else class="w-3 h-3" />
                   {{ formatPaymentMethod(ticket.payment_method) }}
                </span>
              </div>
            </td>
            <td class="px-6 py-4 text-right">
               <div class="flex flex-col items-end">
                 <span class="text-sm font-black text-primary">{{ formatMoney(ticket.total) }}</span>
                 <span v-if="ticket.ticket_type === 'layaway'" class="text-[9px] font-bold text-slate-400">Pendiente: {{ formatMoney(ticket.balance) }}</span>
               </div>
            </td>
            <td class="px-6 py-4 text-center">
              <span 
                class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm"
                :class="getStatusClasses(ticket)"
              >
                {{ getStatusLabel(ticket) }}
              </span>
            </td>
            <td class="px-6 py-4 text-right">
              <button @click="viewDetails(ticket)" class="p-2 hover:bg-primary/10 rounded-xl transition-all group/btn" title="Ver Detalles">
                <EyeIcon class="w-4 h-4 text-primary group-hover/btn:scale-110 transition-transform" />
              </button>
            </td>
          </tr>
          <tr v-if="!loading && filteredTickets.length === 0">
            <td colspan="7" class="px-6 py-12 text-center text-slate-400 text-sm italic">
              No se encontraron tickets con los filtros aplicados.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Details Modal -->
    <BaseModal v-model:show="showDetailsModal" title="Detalle del Ticket" size="xl">
      <template #title>
        <div class="flex items-center gap-3">
          <span class="bg-primary text-white text-[10px] font-black px-2 py-0.5 rounded-lg uppercase tracking-tighter shadow-sm shadow-primary/20">Ticket #{{ selectedTicket?.ticket_number }}</span>
          <h3 class="text-xl font-black text-slate-800 dark:text-white">Detalles de la transacción</h3>
        </div>
      </template>

      <div v-if="selectedTicket" class="space-y-6 py-2">
        <!-- Info Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-border-light dark:border-border-dark">
            <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Cliente</p>
            <p class="text-sm font-black text-slate-800 dark:text-white">{{ selectedTicket.client?.name || selectedTicket.customer_name || 'Público General' }}</p>
            <p class="text-xs text-slate-500 mt-0.5">{{ selectedTicket.client?.email || 'Sin contacto' }}</p>
          </div>
          <div class="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-border-light dark:border-border-dark">
            <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Atendido por</p>
            <p class="text-sm font-black text-slate-800 dark:text-white">{{ selectedTicket.user || 'Sistema' }}</p>
            <p class="text-xs text-slate-500 mt-0.5">{{ selectedTicket.created_at_formatted }}</p>
          </div>
          <div class="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-border-light dark:border-border-dark">
            <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Método de Pago</p>
            <p class="text-sm font-black text-slate-800 dark:text-white uppercase">{{ formatPaymentMethod(selectedTicket.payment_method) }}</p>
            <p class="text-xs text-slate-500 mt-0.5">{{ selectedTicket.ticket_type === 'layaway' ? 'Tipo: Apartado' : 'Tipo: Venta Directa' }}</p>
          </div>
        </div>

        <!-- Items Table -->
        <div class="bg-white dark:bg-card-dark rounded-2xl border border-border-light dark:border-border-dark overflow-hidden shadow-sm">
           <table class="w-full text-left text-sm">
              <thead>
                <tr class="bg-slate-50 dark:bg-white/5 text-slate-500 text-[10px] font-bold uppercase tracking-widest border-b border-border-light dark:border-border-dark">
                  <th class="px-4 py-3">Producto / Talla</th>
                  <th class="px-4 py-3 text-center">Cantidad</th>
                  <th class="px-4 py-3 text-right">P. Unitario</th>
                  <th class="px-4 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border-light dark:divide-border-dark font-medium">
                <tr v-for="item in selectedTicket.items" :key="item.id">
                  <td class="px-4 py-3">
                    <p class="font-bold text-slate-800 dark:text-white">{{ item.product_name }}</p>
                    <span class="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold">Talla: {{ item.size_name }}</span>
                  </td>
                  <td class="px-4 py-3 text-center font-black dark:text-slate-200">{{ item.quantity }}</td>
                  <td class="px-4 py-3 text-right text-slate-500 dark:text-slate-400">{{ formatMoney(item.unit_price) }}</td>
                  <td class="px-4 py-3 text-right font-black text-primary">{{ formatMoney(item.total) }}</td>
                </tr>
              </tbody>
              <tfoot class="bg-slate-50 dark:bg-white/5 font-black">
                <tr>
                  <td colspan="3" class="px-4 py-3 text-right text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-widest">Monto Total</td>
                  <td class="px-4 py-3 text-right text-lg text-primary">{{ formatMoney(selectedTicket.total) }}</td>
                </tr>
              </tfoot>
           </table>
        </div>
      </div>
      
      <template #footer>
        <div class="flex justify-end gap-3 w-full">
          <BaseButton variant="secondary" @click="showDetailsModal = false">Cerrar Ventana</BaseButton>
        </div>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { 
  SearchIcon, 
  EyeIcon, 
  CreditCardIcon, 
  BanknoteIcon, 
  RefreshCwIcon,
  PrinterIcon,
  TicketIcon
} from 'lucide-vue-next'
import Select from '~/components/Select.vue'
import BaseModal from '~/components/BaseModal.vue'
import BaseButton from '~/components/BaseButton.vue'
import { useFormatter } from '~/composables/useFormatter'
import { useToast } from '~/stores/toast'

const { formatMoney, formatHumanDate } = useFormatter()
const api = useApi()
const toast = useToast()
const auth = useAuth()

const tickets = ref([])
const loading = ref(true)
const searchQuery = ref('')
const statusFilter = ref('')
const userFilter = ref('')
const clientIdFilter = ref('')
const users = ref([])
const clients = ref([])
const showDetailsModal = ref(false)
const selectedTicket = ref(null)

const clientOptions = computed(() => [
  { label: 'Todos los clientes', value: '' },
  ...clients.value.map(c => ({ label: c.name, value: c.id }))
])

const userOptions = computed(() => [
  { label: 'Todos los vendedores', value: '' },
  ...users.value.map(u => ({ label: u.name, value: u.id }))
])

const statusOptions = [
  { label: 'Todos', value: '' },
  { label: 'Pagado', value: 'paid' },
  { label: 'Apartado Pendiente', value: 'layaway_pending' },
  { label: 'Apartado Liquidado', value: 'layaway_completed' }
]

const fetchTickets = async () => {
  loading.value = true
  try {
    const res = await api.get('/api/tickets')
    tickets.value = res.data
  } catch (err) {
    toast.error('Error al cargar historial de tickets')
  } finally {
    loading.value = false
  }
}

const filteredTickets = computed(() => {
  return tickets.value.filter(t => {
    // Filter by search (number or client name)
    const matchSearch = !searchQuery.value || 
      t.ticket_number.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (t.client?.name || t.customer_name || '').toLowerCase().includes(searchQuery.value.toLowerCase())

    // Filter by status
    let matchStatus = true
    if (statusFilter.value === 'paid') {
      matchStatus = t.ticket_type !== 'layaway'
    } else if (statusFilter.value === 'layaway_pending') {
      matchStatus = t.ticket_type === 'layaway' && t.balance > 0
    } else if (statusFilter.value === 'layaway_completed') {
      matchStatus = t.ticket_type === 'layaway' && t.balance <= 0
    }

    // Filter by user (seller)
    const matchUser = !userFilter.value || t.user_id === userFilter.value

    // Filter by client
    const matchClient = !clientIdFilter.value || t.client_id === clientIdFilter.value

    return matchSearch && matchStatus && matchUser && matchClient
  })
})

let searchTimeout = null
const debouncedFetch = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    // Filtering is done in frontend for simplicity
  }, 300)
}

const getStatusLabel = (t) => {
  if (t.ticket_type !== 'layaway') return 'Pagado'
  return t.balance > 0 ? 'Apartado' : 'Liquidado'
}

const getStatusClasses = (t) => {
  if (t.ticket_type !== 'layaway') return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
  return t.balance > 0 
    ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' 
    : 'bg-primary/10 text-primary border-primary/20'
}

const formatPaymentMethod = (method) => {
  const methods = {
    cash: 'Efectivo',
    card: 'Tarjeta',
    transfer: 'Transferencia'
  }
  return methods[method] || method
}

const viewDetails = (ticket) => {
  selectedTicket.value = ticket
  showDetailsModal.value = true
}

const printTicket = (ticket) => {
  const iframe = document.createElement('iframe')
  iframe.style.position = 'fixed'
  iframe.style.right = '0'
  iframe.style.bottom = '0'
  iframe.style.width = '0'
  iframe.style.height = '0'
  iframe.style.border = '0'
  iframe.src = `/print-ticket/${ticket.id}`
  document.body.appendChild(iframe)
  
  setTimeout(() => {
    if (document.body.contains(iframe)) {
      document.body.removeChild(iframe)
    }
  }, 10000)
}

const fetchUsers = async () => {
  try {
    const res = await api.get('/api/users-list')
    // Handle both wrapped and unwrapped data
    users.value = res.data?.data || res.data || []
  } catch (err) {
    console.error('Error fetching users:', err)
  }
}

const fetchClients = async () => {
  try {
    const res = await api.get('/api/clients?per_page=1000')
    clients.value = res.data?.data || res.data || []
  } catch (err) {
    console.error('Error fetching clients:', err)
  }
}

onMounted(() => {
  // Check if user is admin or super_admin
  const roles = auth.user?.roles || []
  if (!roles.includes('admin') && !roles.includes('super_admin')) {
    navigateTo('/')
    return
  }
  
  fetchTickets()
  fetchUsers()
  fetchClients()
})

definePageMeta({
  layout: 'default'
})
</script>

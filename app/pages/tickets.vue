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
      <div class="w-64 shrink-0">
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
                {{ ticket.ticket_number }}
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
              <span :class="getStatusClasses(ticket)">
                {{ getStatusLabel(ticket) }}
              </span>
            </td>
            <td class="px-6 py-4 text-right flex justify-end gap-1">
              <button @click="viewDetails(ticket)" class="p-2 hover:bg-primary/10 rounded-xl transition-all group/btn" title="Ver Detalles">
                <EyeIcon class="w-4 h-4 text-primary group-hover/btn:scale-110 transition-transform" />
              </button>
              <button @click="printTicket(ticket)" class="p-2 hover:bg-primary/10 rounded-xl transition-all group/btn" title="Imprimir Ticket">
                <PrinterIcon class="w-4 h-4 text-primary group-hover/btn:scale-110 transition-transform" />
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
          <span class="bg-primary text-white text-[10px] font-black px-2 py-0.5 rounded-lg uppercase tracking-tighter shadow-sm shadow-primary/20">Ticket {{ selectedTicket?.ticket_number }}</span>
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

        <!-- Items Groups by School -->
        <div class="space-y-6">
          <div v-for="(items, schoolName) in groupedItems" :key="schoolName" class="bg-white dark:bg-card-dark rounded-2xl border border-border-light dark:border-border-dark overflow-hidden shadow-sm">
             <div class="bg-indigo-50/50 dark:bg-indigo-950/20 px-4 py-3 border-b border-indigo-100 dark:border-indigo-950/50 flex items-center gap-2">
                <GraduationCapIcon class="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span class="text-xs font-black text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">{{ schoolName }}</span>
             </div>
             <table class="w-full text-left text-sm">
                <thead>
                  <tr class="bg-slate-50/50 dark:bg-white/5 text-slate-500 text-[10px] font-bold uppercase tracking-widest border-b border-border-light dark:border-border-dark">
                    <th class="px-4 py-3">Producto / Talla</th>
                    <th class="px-4 py-3 text-center">Cantidad</th>
                    <th class="px-4 py-3 text-right">P. Unitario</th>
                    <th class="px-4 py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-border-light dark:divide-border-dark font-medium">
                  <tr v-for="item in items" :key="item.id" class="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                    <td class="px-4 py-3">
                      <p class="font-bold text-slate-800 dark:text-white">{{ item.product_name }}</p>
                      <span class="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold">Talla: {{ item.size_name }}</span>
                    </td>
                    <td class="px-4 py-3 text-center font-black dark:text-slate-200">{{ item.quantity }}</td>
                    <td class="px-4 py-3 text-right text-slate-500 dark:text-slate-400">{{ formatMoney(item.unit_price) }}</td>
                    <td class="px-4 py-3 text-right font-black text-primary">{{ formatMoney(item.total) }}</td>
                  </tr>
                </tbody>
             </table>
          </div>

          <!-- Resumen de Monto Total -->
          <div class="flex justify-end bg-slate-50 dark:bg-white/5 rounded-2xl border border-border-light dark:border-border-dark p-4 font-black">
             <div class="flex items-center gap-4">
                <span class="text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-widest">Monto Total</span>
                <span class="text-xl text-primary">{{ formatMoney(selectedTicket.total) }}</span>
             </div>
          </div>
        </div>
      </div>
      
      <template #footer>
        <div class="flex items-center justify-between gap-4 w-full">
          <!-- Indicador de Estado del Ticket (Aprovechando el espacio izquierdo) -->
          <div class="flex items-center gap-3 min-w-0">
            <div 
              class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border"
              :class="selectedTicket.ticket_type === 'layaway' && selectedTicket.balance <= 0 && !selectedTicket.is_delivered
                ? 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'"
            >
              <ShirtIcon v-if="selectedTicket.ticket_type === 'layaway' && selectedTicket.balance <= 0 && !selectedTicket.is_delivered" class="w-4 h-4" />
              <CheckCircleIcon v-else class="w-4 h-4" />
            </div>
            <div class="min-w-0">
              <p class="text-xs font-black text-slate-800 dark:text-slate-100 truncate">
                {{ selectedTicket.ticket_type === 'layaway' && selectedTicket.balance <= 0 && !selectedTicket.is_delivered 
                    ? 'Pendiente de Entrega Física' 
                    : (selectedTicket.ticket_type === 'layaway' && selectedTicket.is_delivered 
                        ? 'Apartado Liquidado y Entregado' 
                        : (selectedTicket.ticket_type === 'layaway' 
                            ? 'Apartado con Saldo Pendiente' 
                            : 'Venta de Mostrador')) }}
              </p>
              <p class="text-[10px] text-slate-400 truncate">
                {{ selectedTicket.ticket_type === 'layaway' && selectedTicket.balance <= 0 && !selectedTicket.is_delivered 
                    ? '100% pagado • Artículos resguardados en tienda' 
                    : (selectedTicket.ticket_type === 'layaway' && selectedTicket.is_delivered 
                        ? 'Prendas entregadas al cliente' 
                        : (selectedTicket.ticket_type === 'layaway' 
                            ? `Saldo por liquidar: ${formatMoney(selectedTicket.balance)}` 
                            : 'Transacción completada')) }}
              </p>
            </div>
          </div>

          <!-- Botón de Acción a la derecha -->
          <div class="flex items-center shrink-0">
            <button
              @click="printTicket(selectedTicket)"
              class="px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-primary/20 active:scale-95 whitespace-nowrap"
            >
              <PrinterIcon class="w-4 h-4" />
              <span>Imprimir Ticket</span>
            </button>
          </div>
        </div>
      </template>





    </BaseModal>
  </div>

  <!-- Area de impresion del ticket (Oculta en pantalla, visible al imprimir) -->
  <Teleport to="body">
    <div id="pos-print-area" class="hidden print:block" v-if="ticketToPrint">
      <div class="pos-ticket">
        <div class="ticket-header">
          <h2 class="company-name">CHESAN UNIFORMES</h2>
          <p class="company-info" v-if="ticketToPrint.ticket_type === 'layaway' && ticketToPrint.balance > 0">COMPROBANTE DE APARTADO</p>
          <p class="company-info" v-else-if="ticketToPrint.ticket_type === 'layaway' && ticketToPrint.balance === 0">LIQUIDACIÓN DE APARTADO</p>
          <p class="company-info" v-else>Venta de Mostrador</p>
          <p class="company-info">Fecha: {{ formatTicketDate(ticketToPrint.created_at) }}</p>
          <p class="company-info ticket-number">Ticket {{ ticketToPrint.ticket_number || 'S/N' }}</p>
          <p v-if="ticketToPrint.ticket_type === 'layaway'" class="company-info">Cliente: {{ ticketToPrint.client?.name || ticketToPrint.customer_name }}</p>
          <p v-if="ticketToPrint.ticket_type === 'layaway' && ticketToPrint.balance > 0" class="company-info">Fecha límite: {{ ticketToPrint.due_date }}</p>
        </div>
        
        <div class="ticket-divider"></div>

        <table class="ticket-items">
          <thead>
            <tr>
              <th class="qty-col">Cant</th>
              <th class="desc-col">Producto</th>
              <th class="price-col">Importe</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in ticketToPrint.items" :key="item.id">
              <td class="qty-col">{{ item.quantity }}</td>
              <td class="desc-col">
                {{ item.product_name }}
                <div v-if="item.size_name" class="item-meta">Talla: {{ item.size_name }}</div>
                <div v-if="item.discount_amount > 0" class="item-meta font-bold">
                  <span>Descto. (-{{ formatMoney(item.discount_amount) }})</span>
                </div>
              </td>
              <td class="price-col">
                <span v-if="item.discount_amount > 0" style="text-decoration: line-through; font-size: 8px;">
                  {{ formatMoney(item.quantity * item.unit_price) }}
                </span>
                <br v-if="item.discount_amount > 0"/>
                {{ formatMoney(item.total) }}
              </td>
            </tr>
          </tbody>
        </table>

        <div class="ticket-divider"></div>

        <div class="ticket-totals">
          <div class="total-row" v-if="ticketToPrint.discount_amount > 0">
            <span>Ahorro en Descuentos:</span>
            <span>-{{ formatMoney(ticketToPrint.discount_amount) }}</span>
          </div>
          <div class="total-row font-bold">
            <span>Total {{ ticketToPrint.ticket_type === 'layaway' ? 'Apartado' : '' }}:</span>
            <span>{{ formatMoney(ticketToPrint.total) }}</span>
          </div>
          
          <div class="total-row" v-if="ticketToPrint.ticket_type === 'layaway' && ticketToPrint.balance === 0">
            <span>Anticipo Original:</span>
            <span>{{ formatMoney(ticketToPrint.advance_amount || 0) }}</span>
          </div>
          <div class="total-row" v-if="ticketToPrint.ticket_type === 'layaway' && ticketToPrint.balance === 0">
            <span>Pago Liquidación:</span>
            <span>{{ formatMoney(ticketToPrint.liquidation_amount || 0) }}</span>
          </div>
          
          <div class="total-row" v-if="ticketToPrint.ticket_type === 'layaway' && ticketToPrint.balance > 0">
            <span>Anticipo Pagado:</span>
            <span>{{ formatMoney(ticketToPrint.received_amount) }}</span>
          </div>
          
          <div class="total-row font-bold" v-if="ticketToPrint.ticket_type === 'layaway'" style="font-size: 12px; margin-top: 2px;">
            <span>RESTA POR PAGAR:</span>
            <span>{{ formatMoney(ticketToPrint.balance) }}</span>
          </div>
        </div>

        <div class="ticket-footer">
          <p>Método de Pago: {{ getPrintPaymentMethod(ticketToPrint) }}</p>
          <p class="thank-you">¡Gracias por tu compra!</p>
          <p class="qr-info">Guarda este ticket para cualquier cambio o aclaración.</p>
          <div class="qr-container">
            <qrcode-vue :value="String(ticketToPrint.ticket_number)" :size="80" level="H" renderAs="canvas" />
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { 
  SearchIcon, 
  EyeIcon, 
  CreditCardIcon, 
  BanknoteIcon, 
  RefreshCwIcon,
  PrinterIcon,
  TicketIcon,
  GraduationCapIcon,
  ShirtIcon,
  CheckCircleIcon,
  ClockIcon
} from 'lucide-vue-next'
import QrcodeVue from 'qrcode.vue'
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

const groupedItems = computed(() => {
  if (!selectedTicket.value || !selectedTicket.value.items) return {}
  const groups = {}
  selectedTicket.value.items.forEach(item => {
    const schoolName = item.product?.institution?.name || 'Sin Escuela / Venta General'
    if (!groups[schoolName]) {
      groups[schoolName] = []
    }
    groups[schoolName].push(item)
  })
  return groups
})

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
  { label: 'Apartado Liquidado', value: 'layaway_completed' },
  { label: 'Apartado Liquidado (Entregado)', value: 'layaway_completed_delivered' },
  { label: 'Apartado Liquidado (Pendiente Entrega)', value: 'layaway_completed_pending' }
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
    } else if (statusFilter.value === 'layaway_completed_delivered') {
      matchStatus = t.ticket_type === 'layaway' && t.balance <= 0 && t.is_delivered
    } else if (statusFilter.value === 'layaway_completed_pending') {
      matchStatus = t.ticket_type === 'layaway' && t.balance <= 0 && !t.is_delivered
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
  if (t.balance > 0) return 'Apartado'
  return t.is_delivered ? 'Liquidado / Entregado' : 'Liquidado / Por Entregar'
}

const getStatusClasses = (t) => {
  const base = 'px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border shadow-sm whitespace-nowrap '
  if (t.ticket_type !== 'layaway') return base + 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
  if (t.balance > 0) return base + 'bg-amber-500/10 text-amber-600 border-amber-500/20'
  return t.is_delivered 
    ? base + 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
    : base + 'bg-rose-500/10 text-rose-600 border-rose-500/20'
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

const ticketToPrint = ref(null)


const printTicket = (ticket) => {
  ticketToPrint.value = ticket
  nextTick(() => {
    window.print()
  })
}

const formatTicketDate = (dateStr) => {
  if (!dateStr) return ''
  try {
    return new Date(dateStr).toLocaleString('es-MX', { timeZone: 'America/Mexico_City' })
  } catch (e) {
    return dateStr
  }
}

const getPrintPaymentMethod = (ticket) => {
  if (!ticket) return ''
  const method = ticket.ticket_type === 'layaway' && ticket.balance === 0
    ? (ticket.liquidation_payment_method || 'cash')
    : (ticket.payment_method || 'cash')
  return formatPaymentMethod(method)
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

<style>
/* Estilos para la impresión del ticket en formato térmico de 58mm */
.pos-ticket {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
  width: 48mm;
  padding: 0.5mm 1mm;
  box-sizing: border-box;
  color: #000000 !important;
  background: white;
  font-weight: 600;
}
.ticket-header { text-align: center; margin-bottom: 4mm; }
.company-name { font-size: 14px; font-weight: 800; margin: 0; color: #000000 !important; }
.company-info { font-size: 9.5px; margin: 1mm 0; color: #000000 !important; }
.ticket-number { font-weight: 800; font-size: 11px; }
.ticket-divider { border-top: 1.5px dashed #000000; margin: 2mm 0; }
.ticket-items { width: 100%; border-collapse: collapse; font-size: 9.5px; color: #000000 !important; }
.ticket-items th { text-align: left; border-bottom: 1.5px solid #000000; padding-bottom: 1mm; font-weight: 800; }
.qty-col { width: 20%; }
.desc-col { width: 50%; }
.price-col { width: 30%; text-align: right; }
.item-meta { font-size: 8.5px; color: #000000 !important; font-weight: 500; }
.ticket-totals { margin-top: 2mm; font-size: 9.5px; color: #000000 !important; }
.total-row { display: flex; justify-content: space-between; margin-bottom: 0.5mm; }
.font-bold { font-weight: 800; }
.ticket-footer { text-align: center; margin-top: 4mm; font-size: 9px; color: #000000 !important; }
.qr-container { margin-top: 3mm; display: flex; justify-content: center; }
.qr-container canvas {
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}

@media print {
  html, body {
    margin: 0 !important;
    padding: 0 !important;
    background: white !important;
    width: 100% !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* Ocultar todo lo que no sea el área de impresión */
  body > * { display: none !important; }
  #pos-print-area { 
    display: block !important; 
    position: absolute !important; 
    left: -1mm !important;
    top: 0 !important; 
    width: 48mm !important;
    margin: 0 !important;
    padding: 0 !important;
    visibility: visible !important;
    background: white !important;
    color: #000000 !important;
  }
  #pos-print-area * { 
    visibility: visible !important;
    color: #000000 !important;
    -webkit-text-fill-color: #000000 !important;
    background: transparent !important;
  }
  
  @page {
    margin: 0 !important;
    size: 58mm auto;
  }
}
</style>

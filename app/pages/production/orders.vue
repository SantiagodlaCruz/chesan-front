<template>
  <div class="flex flex-col gap-4">
    <!-- Header -->
    <div class="flex flex-wrap justify-between items-center gap-4 mb-2">
      <div class="flex items-center gap-6 grow">
        <h2 class="text-2xl font-black tracking-tight text-slate-800 dark:text-slate-100 whitespace-nowrap">Listado de Pedidos</h2>
        
        <!-- Barrita de búsqueda compacta junto al título -->
        <div class="relative max-w-md w-full">
           <SearchIcon class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
           <input 
            v-model="searchQuery" 
            class="w-full bg-white dark:bg-card-dark border border-border-light dark:border-border-dark focus:border-primary transition-all outline-none pl-9 pr-4 py-2 rounded-xl text-sm font-medium placeholder:text-slate-400 text-slate-900 dark:text-slate-100 shadow-sm" 
            placeholder="Buscar por código o nombre de cliente..." 
            type="text" 
           />
        </div>
      </div>

      <!-- Acciones de Cabecera (Refrescar) -->
      <div class="flex items-center gap-3 shrink-0">
        <button 
          @click="fetchData" 
          class="bg-white dark:bg-card-dark hover:bg-slate-50 dark:hover:bg-slate-800 border border-border-light dark:border-border-dark px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-sm text-slate-700 dark:text-slate-300"
        >
          <RefreshCwIcon class="w-4 h-4" :class="{ 'animate-spin': pending }" />
          Refrescar
        </button>
      </div>
    </div>

    <!-- Filters Row -->
    <div class="flex items-end flex-wrap gap-3 pb-1 pt-1 relative z-10 w-full mb-2">
      <!-- Filtro Tipo de Pedido -->
      <div class="w-48 shrink-0">
        <Select 
          v-model="filtroTipo" 
          :options="opcionesTipo" 
          label="Tipo de Pedido" 
          placeholder="Todos" 
          @update:modelValue="debouncedFetch" 
        />
      </div>

      <!-- Filtro Estado de Pago -->
      <div class="w-48 shrink-0">
        <Select 
          v-model="filtroPago" 
          :options="opcionesPago" 
          label="Estado de Pago" 
          placeholder="Todos" 
          @update:modelValue="debouncedFetch" 
        />
      </div>

      <!-- Filtro Estado de Producción (Kanban) -->
      <div class="w-56 shrink-0">
        <Select 
          v-model="filtroProduccion" 
          :options="opcionesProduccion" 
          label="Etapa de Producción" 
          placeholder="Todas" 
          searchable
          @update:modelValue="debouncedFetch" 
        />
      </div>
    </div>

    <!-- Table -->
    <DataTable 
      :columns="[
        { key: 'order_code', label: 'Código', class: 'w-[140px] min-w-[140px]' },
        { key: 'client', label: 'Cliente / Tipo' },
        { key: 'order_date', label: 'F. Registro' },
        { key: 'delivery_date', label: 'F. Promesa' },
        { key: 'total_amount', label: 'Total', align: 'right' },
        { key: 'advance_payment', label: 'Anticipo', align: 'right' },
        { key: 'remaining_amount', label: 'Saldo Restante', align: 'right' },
        { key: 'production_status', label: 'Etapa Producción', align: 'center' },
        { key: 'is_liquidated', label: 'Estado Pago', align: 'center' }
      ]"
      show-actions
      permission-edit="none"
      permission-delete="none"
      :items="items" 
      :loading="pending" 
      :meta="meta"
      :links="links"
      :error-msg="errorMsg"
      :per-page="perPage"
      @view="onView"
      @print="onPrint"
      @page-change="onChangePage"
      @per-page-change="onChangePerPage"
    >
      <!-- Custom footer list sorting -->
      <template #footer-left>
        <div class="flex items-center gap-2 border-l border-slate-200 dark:border-slate-800 pl-4">
          <span class="text-[10px] uppercase font-bold text-slate-400 tracking-tight">Ordenar:</span>
          <Select 
            v-model="filtroOrden" 
            :options="opcionesOrden" 
            placeholder="Seleccionar..." 
            compact
            menu-width="bottom-full mb-2 w-56 rounded-lg right-0"
            @update:modelValue="fetchData" 
          />
        </div>
      </template>

      <!-- Custom actions to only show the view action -->
      <template #actions="{ item }">
        <button @click="onView(item)" class="p-1.5 hover:bg-primary/10 rounded-xl transition-all group/btn" title="Ver Detalle">
          <EyeIcon class="w-4 h-4 text-primary group-hover/btn:scale-110 transition-transform" />
        </button>
      </template>

      <!-- Cell templates -->
      <template #cell-order_code="{ value }">
        <span class="font-mono text-xs text-primary/80 dark:text-primary-400 bg-primary/5 dark:bg-primary/10 px-2.5 py-1 rounded-md border border-primary/10 tracking-wider whitespace-nowrap min-w-[110px] inline-block text-center">
          {{ value || '---' }}
        </span>
      </template>

      <template #cell-client="{ item }">
        <div class="flex flex-col items-start gap-1">
          <div class="flex flex-wrap items-center gap-1.5">
            <span class="font-semibold text-slate-800 dark:text-slate-100">
              {{ item.client?.name || (item.is_internal ? 'CheSan' : 'Cliente Desconocido') }}
            </span>
            <span 
              v-if="item.is_internal"
              class="inline-block text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-50 text-purple-600 border border-purple-100 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20 uppercase tracking-wider"
            >
              Interno
            </span>
          </div>
        </div>
      </template>

      <template #cell-order_date="{ value }">
        <span class="text-xs text-slate-500 dark:text-slate-400 font-medium">{{ formatDate(value) }}</span>
      </template>

      <template #cell-delivery_date="{ value, item }">
        <div class="flex flex-col items-start gap-0.5">
          <span class="text-xs text-slate-700 dark:text-slate-300 font-semibold">{{ formatDate(value) }}</span>
          <span 
            v-if="value && item.production_status !== 'Entregados'"
            class="text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider leading-none"
            :class="getDaysLeftClass(value)"
          >
            {{ getDaysLeftText(value) }}
          </span>
        </div>
      </template>

      <template #cell-total_amount="{ value, item }">
        <span 
          class="font-bold"
          :class="[
            item.is_internal 
              ? 'text-emerald-600 dark:text-emerald-400' 
              : 'text-slate-900 dark:text-white'
          ]"
        >
          {{ item.is_internal ? formatMoney(0) : formatMoney(value) }}
        </span>
      </template>

      <template #cell-advance_payment="{ value }">
        <span class="font-bold text-emerald-600 dark:text-emerald-400">{{ formatMoney(value || 0) }}</span>
      </template>

      <template #cell-remaining_amount="{ value, item }">
        <span 
          class="font-black"
          :class="[
            (item.is_internal || value <= 0.01)
              ? 'text-emerald-600 dark:text-emerald-400' 
              : 'text-orange-500 dark:text-orange-400'
          ]"
        >
          {{ item.is_internal ? formatMoney(0) : formatMoney(value) }}
        </span>
      </template>

      <template #cell-production_status="{ value }">
        <span 
          class="inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full border uppercase"
          :class="getProductionStatusClass(value)"
        >
          {{ value || 'Pendiente' }}
        </span>
      </template>

      <template #cell-is_liquidated="{ value, item }">
        <span 
          v-if="item.is_internal"
          class="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-wider bg-slate-100 text-slate-500 border-slate-200 dark:bg-white/5 dark:text-slate-400 dark:border-white/10"
        >
          No Aplica
        </span>
        <span 
          v-else
          class="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-wider"
          :class="[
            value 
              ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' 
              : 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
          ]"
        >
          {{ value ? 'Liquidado' : 'Pendiente' }}
        </span>
      </template>
    </DataTable>

    <!-- Details Modal -->
    <OrderListDetailModal
      v-model:show="showDetailModal"
      :order="selectedOrder"
    />

    <!-- Iframe oculto para impresión directa -->
    <iframe id="print-iframe-orders" style="display:none"></iframe>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { SearchIcon, PrinterIcon, EyeIcon, RefreshCwIcon } from 'lucide-vue-next'
import Select from '~/components/Select.vue'
import DataTable from '~/components/DataTable.vue'
import OrderListDetailModal from '~/components/production/OrderListDetailModal.vue'
import { useOrdersStore } from '~/composables/useOrdersStore'
import { useProductionStore } from '~/stores/production'
import { useFormatter } from '~/composables/useFormatter'
import type { Order } from '~/types'

const { formatMoney } = useFormatter()

const ordersStore = useOrdersStore()
const productionStore = useProductionStore()

const searchQuery = ref('')
const filtroTipo = ref('')
const filtroPago = ref('')
const filtroProduccion = ref('')
const filtroOrden = ref('id_desc')

const currentPage = ref(1)
const perPage = ref(10)

const showDetailModal = ref(false)
const selectedOrder = ref<Order | null>(null)

const items = computed(() => ordersStore.items)
const meta = computed(() => ordersStore.meta)
const links = computed(() => ordersStore.links)
const pending = computed(() => ordersStore.loading)
const errorMsg = computed(() => ordersStore.error || '')

// Watchers
watch(searchQuery, () => {
  debouncedFetch()
})

// Opciones de Filtros
const opcionesTipo = [
  { label: 'Todos', value: '' },
  { label: 'De Clientes', value: 'false' },
  { label: 'Pedidos Internos', value: 'true' }
]

const opcionesPago = [
  { label: 'Todos', value: '' },
  { label: 'Liquidado', value: 'paid' },
  { label: 'Pendiente de Pago', value: 'pending' },
  { label: 'Con Anticipo', value: 'has_advance' }
]

const opcionesProduccion = computed(() => {
  const cols = productionStore.board?.columns || []
  return [
    { label: 'Todas', value: '' },
    ...cols.map(c => ({ label: c.title, value: c.title }))
  ]
})

const opcionesOrden = [
  { label: 'Más Reciente', value: 'id_desc' },
  { label: 'Más Antiguo', value: 'id_asc' },
  { label: 'Código (A-Z)', value: 'order_code_asc' },
  { label: 'Fecha Entrega (Próxima)', value: 'delivery_date_asc' },
  { label: 'Monto (Mayor)', value: 'total_amount_desc' },
  { label: 'Monto (Menor)', value: 'total_amount_asc' }
]

// Fetching
const fetchData = async () => {
  const [sortBy, sortDirection] = filtroOrden.value.split('_')
  
  const params: Record<string, any> = {
    search: searchQuery.value,
    payment_status: filtroPago.value,
    production_status: filtroProduccion.value,
    sort_by: sortBy || 'id',
    sort_direction: sortDirection || 'desc',
    page: currentPage.value,
    per_page: perPage.value
  }

  // Si se seleccionó algún tipo, enviamos is_internal
  if (filtroTipo.value !== '') {
    params.is_internal = filtroTipo.value
  }

  await ordersStore.fetchOrders(params)
}

let fetchTimeout: ReturnType<typeof setTimeout> | null = null
const debouncedFetch = () => {
  if (fetchTimeout) clearTimeout(fetchTimeout)
  fetchTimeout = setTimeout(() => {
    currentPage.value = 1
    fetchData()
  }, 500)
}

onMounted(() => {
  fetchData()
  // Cargar columnas del Kanban para sincronizar filtros
  productionStore.fetchBoard()
})

const onChangePage = (page: number) => {
  currentPage.value = page
  fetchData()
}

const onChangePerPage = (val: number) => {
  perPage.value = val
  currentPage.value = 1
  fetchData()
}

// Acciones de fila
const onView = (item: Order) => {
  selectedOrder.value = item
  showDetailModal.value = true
}

const onPrint = (item: Order) => {
  if (item.id) {
    const iframe = document.getElementById('print-iframe-orders') as HTMLIFrameElement
    if (iframe) {
      iframe.src = `/production/print/${item.id}`
    }
  }
}

// Helpers locales para fecha y entrega
const formatDate = (dateStr: string | null) => {
  if (!dateStr) return '---'
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
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
  if (days === 0) return 'Hoy'
  if (days === 1) return 'Mañana'
  return `Faltan ${days}d`
}

const getDaysLeftClass = (deliveryDateStr: string | null) => {
  const days = getDaysLeft(deliveryDateStr)
  if (days < 0) {
    return 'bg-red-50 text-red-600 border border-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20'
  }
  if (days <= 2) {
    return 'bg-orange-50 text-orange-600 border border-orange-100 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20 shadow-sm shadow-orange-500/5'
  }
  return 'bg-primary/5 text-primary border border-primary/10'
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
  // Default fallback: light blue
  return 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20'
}

definePageMeta({
  layout: 'default'
})
</script>

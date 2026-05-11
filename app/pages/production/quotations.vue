<template>
  <div class="flex flex-col gap-6">
    <!-- Main Header -->
    <div class="flex flex-wrap justify-between items-start gap-4">
      <div class="space-y-1">
        <h2 class="text-3xl font-black tracking-tight text-slate-800 dark:text-slate-100">Gestión de cotizaciones</h2>
        <p class="text-sm text-slate-500 dark:text-slate-400">Administre el catálogo de precios y genere propuestas para sus clientes.</p>
      </div>

      <div class="flex items-center gap-3">
        <button
          v-if="activeTab === 'quotations'"
          @click="openNewQuotation"
          class="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-primary/20"
        >
          <PlusIcon class="w-5 h-5" />
          Nueva cotización
        </button>
        <button
          v-else
          @click="openNewCatalogPrice"
          class="bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-slate-900/20"
        >
          <PlusIcon class="w-5 h-5" />
          Nueva variación
        </button>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="flex gap-1.5 p-1.5 bg-slate-100 dark:bg-card-dark rounded-[14px] w-fit border border-border-light dark:border-border-dark shadow-sm relative z-20">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        :class="activeTab === tab.id ? 'bg-white dark:bg-white/10 shadow-sm text-primary font-bold' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-white/5 font-medium'"
        class="px-5 py-2 rounded-lg text-sm transition-all flex items-center gap-2"
      >
        <component :is="tab.icon" class="w-4 h-4" />
        {{ tab.label }}
      </button>
    </div>

    <!-- Content -->
    <div class="mt-2">
      <!-- Quotations List -->
      <div v-if="activeTab === 'quotations'" class="space-y-4">
        <!-- Filter Bar -->
        <div class="flex items-end flex-wrap gap-3 pb-1 pt-1 relative z-10 w-full mb-2">
          <!-- Folio Search -->
          <div class="w-64 shrink-0 relative">
            <label class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] ml-1 mb-1.5 block transition-colors">Buscar folio</label>
            <div class="relative">
              <SearchIcon class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                v-model="searchQuery" 
                type="text" 
                placeholder="COT-123..."
                class="w-full bg-white dark:bg-card-dark border border-border-light dark:border-border-dark focus:border-primary/30 outline-none pl-9 pr-4 py-2 rounded-xl text-sm transition-all shadow-sm"
                @input="debouncedFetch"
              />
            </div>
          </div>
          <!-- Client Filter -->
          <div class="w-72 shrink-0">
            <Select 
              v-model="clientIdFilter" 
              :options="clientOptions" 
              label="Filtrar por cliente"
              placeholder="Todos los clientes" 
              searchable 
              @update:modelValue="fetchQuotations"
            />
          </div>
        </div>

        <div class="bg-white dark:bg-card-dark rounded-2xl border border-border-light dark:border-border-dark overflow-hidden shadow-sm">
          <table class="w-full text-left">
            <thead>
              <tr class="bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] border-b border-border-light dark:border-border-dark">
                <th class="px-6 py-4">Folio</th>
                <th class="px-6 py-4">Cliente</th>
                <th class="px-6 py-4 text-center">Fecha</th>
                <th class="px-6 py-4 text-right">Total</th>
                <th class="px-6 py-4 text-center">Estado</th>
                <th class="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border-light dark:divide-border-dark">
              <!-- Loading Skeletons -->
              <tr v-if="loadingQuotations">
                <td colspan="6" class="p-0">
                  <div v-for="n in 5" :key="n" class="flex gap-4 px-6 py-4 animate-pulse border-b border-border-light dark:border-border-dark last:border-0">
                    <div class="h-4 bg-slate-200 dark:bg-white/5 rounded w-24"></div>
                    <div class="h-4 bg-slate-200 dark:bg-white/5 rounded flex-1"></div>
                    <div class="h-4 bg-slate-200 dark:bg-white/5 rounded w-32"></div>
                    <div class="h-4 bg-slate-200 dark:bg-white/5 rounded w-20"></div>
                    <div class="h-4 bg-slate-200 dark:bg-white/5 rounded w-24"></div>
                    <div class="h-4 bg-slate-200 dark:bg-white/5 rounded w-32 ml-auto"></div>
                  </div>
                </td>
              </tr>

              <template v-else>
                <tr v-for="q in quotations" :key="q.id" class="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                  <td class="px-6 py-4">
                    <span class="font-mono text-xs text-primary/80 dark:text-primary-400 bg-primary/5 dark:bg-primary/10 px-2.5 py-1 rounded-md border border-primary/10 tracking-wider whitespace-nowrap">
                      {{ q.folio }}
                    </span>
                  </td>
                  <td class="px-6 py-4 min-w-[280px]">
                    <p class="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight mb-1.5">{{ q.client?.name || 'Cliente sin nombre' }}</p>
                    <div class="flex flex-wrap gap-1.5">
                      <div v-for="(item, iIdx) in q.items?.slice(0, 3)" :key="iIdx" 
                           class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-[9px]">
                        <span class="font-black text-primary">{{ item.quantity }}</span>
                        <span class="text-slate-600 dark:text-slate-400 font-medium truncate max-w-[100px]">{{ getItemDisplayName(item) }}</span>
                      </div>
                      <div v-if="q.items?.length > 3" class="text-[9px] text-slate-400 font-bold self-center ml-0.5">
                        +{{ q.items.length - 3 }} más
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-[11px] text-center font-bold text-slate-500 dark:text-slate-400">
                    {{ formatHumanDate(q.quotation_date) }}
                  </td>
                  <td class="px-6 py-4 font-bold text-right text-primary">{{ formatMoney(q.total_amount) }}</td>
                  <td class="px-6 py-4 text-center">
                    <span 
                      class="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.15em] border whitespace-nowrap inline-flex items-center justify-center min-w-[100px]"
                      :class="statusClasses[q.status]"
                    >
                      {{ q.status === 'order_created' ? 'Pedido Creado' : q.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-right">
                    <div class="flex justify-end gap-1">
                      <button @click="showQuotation(q.id)" class="p-1.5 hover:bg-primary/10 rounded-xl transition-all group/btn" title="Ver Detalles">
                        <EyeIcon class="w-4 h-4 text-primary group-hover/btn:scale-110 transition-transform" />
                      </button>
                      <button @click="printQuotation(q)" class="p-1.5 hover:bg-slate-500/10 dark:hover:bg-slate-400/10 rounded-xl transition-all group/btn" title="Imprimir PDF">
                        <PrinterIcon class="w-4 h-4 text-slate-500 dark:text-slate-400 group-hover/btn:scale-110 transition-transform" />
                      </button>
                      <button @click="editQuotation(q.id)" class="p-1.5 hover:bg-yellow-500/10 rounded-xl transition-all group/btn" title="Editar">
                        <EditIcon class="w-4 h-4 text-[#eab308] group-hover/btn:scale-110 transition-transform" />
                      </button>
                      <button 
                        v-if="q.status === 'accepted'" 
                        @click="convertToOrder(q)" 
                        class="p-1.5 hover:bg-emerald-500/10 rounded-xl transition-all group/btn"
                        title="Convertir a Pedido"
                      >
                        <ArrowRightIcon class="w-4 h-4 text-emerald-500 group-hover/btn:scale-110 transition-transform" />
                      </button>
                      <button 
                        v-if="q.status === 'pending'" 
                        @click="updateStatus(q, 'accepted')" 
                        class="p-1.5 hover:bg-emerald-500/10 rounded-xl transition-all group/btn"
                        title="Aceptar Cotización"
                      >
                        <CheckIcon class="w-4 h-4 text-emerald-500 group-hover/btn:scale-110 transition-transform" />
                      </button>
                      <button 
                        v-if="q.status !== 'accepted'" 
                        @click="deleteQuotation(q.id)" 
                        class="p-1.5 hover:bg-red-500/10 rounded-xl transition-all group/btn"
                        title="Eliminar"
                      >
                        <TrashIcon class="w-4 h-4 text-accent-red group-hover/btn:scale-110 transition-transform" />
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="quotations.length === 0">
                  <td colspan="6" class="px-6 py-12 text-center text-slate-400 text-sm italic">
                    No hay cotizaciones registradas.
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Catalog Prices -->
      <div v-if="activeTab === 'catalog'" class="space-y-6">
        <div v-for="product in catalog" :key="product.id" class="bg-white dark:bg-card-dark rounded-2xl border border-border-light dark:border-border-dark overflow-hidden shadow-sm">
          <div class="p-4 bg-slate-50 dark:bg-white/5 border-b border-border-light dark:border-border-dark flex justify-between items-center">
            <div class="flex flex-col gap-0.5">
              <h3 class="font-black text-slate-800 dark:text-white uppercase tracking-tight">{{ product.name }}</h3>
              <div class="flex items-center gap-2">
                <span class="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-black uppercase tracking-widest">MIN MAYOREO: {{ product.wholesale_min_quantity || 25 }} PCS</span>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button @click="editProduct(product)" class="p-1.5 hover:bg-yellow-500/10 rounded-xl transition-all group/btn" title="Editar Producto">
                <EditIcon class="w-4 h-4 text-[#eab308] group-hover/btn:scale-110 transition-transform" />
              </button>
              <button @click="deleteProduct(product.id)" class="p-1.5 hover:bg-red-500/10 rounded-xl transition-all group/btn" title="Eliminar Producto">
                <TrashIcon class="w-4 h-4 text-accent-red group-hover/btn:scale-110 transition-transform" />
              </button>
            </div>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left">
              <thead>
                <tr class="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 border-b border-border-light dark:border-border-dark">
                  <th class="px-6 py-3">Material / Descripción</th>
                  <th class="px-6 py-3">Rango de tallas</th>
                  <th class="px-6 py-3 text-right">Menudeo</th>
                  <th class="px-6 py-3 text-right text-primary">Mayoreo (>= {{ product.wholesale_min_quantity || 25 }})</th>
                  <th class="px-6 py-3 w-10"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border-light dark:divide-border-dark">
                <!-- Loading Skeletons -->
                <tr v-if="loadingCatalog">
                  <td colspan="5" class="p-0">
                    <div v-for="n in 3" :key="n" class="flex gap-4 px-6 py-3 animate-pulse border-b border-border-light dark:border-border-dark last:border-0">
                      <div class="h-4 bg-slate-200 dark:bg-white/5 rounded flex-1"></div>
                      <div class="h-4 bg-slate-200 dark:bg-white/5 rounded w-32"></div>
                      <div class="h-4 bg-slate-200 dark:bg-white/5 rounded w-20"></div>
                      <div class="h-4 bg-slate-200 dark:bg-white/5 rounded w-20"></div>
                      <div class="h-4 bg-slate-200 dark:bg-white/5 rounded w-16 ml-auto"></div>
                    </div>
                  </td>
                </tr>

                <template v-else>
                  <tr v-for="price in product.prices" :key="price.id" class="text-sm">
                    <td class="px-6 py-3 font-semibold dark:text-slate-200">{{ price.material }}</td>
                    <td class="px-6 py-3 dark:text-slate-400">{{ price.size_range }}</td>
                    <td class="px-6 py-3 text-right font-medium text-slate-600 dark:text-slate-400">{{ formatMoney(price.retail_price) }}</td>
                    <td class="px-6 py-3 text-right font-black text-primary">{{ formatMoney(price.wholesale_price) }}</td>
                    <td class="px-6 py-3">
                      <div class="flex justify-end gap-2">
                        <button @click="editCatalogPrice(price)" class="p-1.5 hover:bg-yellow-500/10 rounded-xl transition-all group/btn" title="Editar">
                          <EditIcon class="w-4 h-4 text-[#eab308] group-hover/btn:scale-110 transition-transform" />
                        </button>
                        <button @click="deleteCatalogPrice(price.id)" class="p-1.5 hover:bg-red-500/10 rounded-xl transition-all group/btn" title="Eliminar">
                          <TrashIcon class="w-4 h-4 text-accent-red group-hover/btn:scale-110 transition-transform" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="!product.prices?.length">
                    <td colspan="5" class="px-6 py-4 text-center text-xs text-slate-400 italic">No hay variantes de precio definidas.</td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <QuotationModal 
      v-model:show="showQuotationModal" 
      :id="selectedQuotationId"
      :read-only="isReadOnly"
      @saved="fetchQuotations" 
    />
    
    <CatalogPriceModal
      v-model:show="showCatalogModal"
      :products="catalog"
      :item="selectedCatalogPrice"
      @saved="fetchCatalog"
    />

    <ProductCatalogModal
      v-model:show="showProductModal"
      :item="selectedProduct"
      @saved="fetchCatalog"
    />

    <ConvertQuotationModal
      v-model:show="showConvertModal"
      :quotation="quotationToConvert"
      :loading="converting"
      @confirm="handleConvertConfirm"
    />

    <ConfirmModal
      v-model:show="showDeleteConfirm"
      :title="activeTab === 'quotations' ? 'Eliminar Cotización' : (itemToDeleteType === 'product' ? 'Eliminar Producto' : 'Eliminar Variación')"
      :message="activeTab === 'quotations' 
        ? '¿Estás seguro de que deseas eliminar permanentemente esta cotización?\n\nEsta acción no se puede deshacer.'
        : (itemToDeleteType === 'product' 
          ? '¿Estás seguro de que deseas eliminar este producto y TODAS sus variantes de precio?\n\nEsta acción no se puede deshacer.'
          : '¿Estás seguro de que deseas eliminar permanentemente esta variación de precio del catálogo?\n\nEsta acción no se puede deshacer.')"
      confirm-text="Eliminar Definitivamente"
      confirm-variant="danger"
      :loading="deleting"
      @confirm="onConfirmDelete"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { 
  ClipboardListIcon, 
  TagIcon, 
  PlusIcon, 
  EyeIcon, 
  PencilIcon,
  PrinterIcon,
  CheckIcon, 
  ArrowRightIcon,
  Trash2Icon,
  AlertCircleIcon,
  EditIcon,
  TrashIcon,
  SearchIcon
} from 'lucide-vue-next'
import QuotationModal from '~/components/quotations/QuotationModal.vue'
import CatalogPriceModal from '~/components/quotations/CatalogPriceModal.vue'
import ProductCatalogModal from '~/components/quotations/ProductCatalogModal.vue'
import ConvertQuotationModal from '~/components/quotations/ConvertQuotationModal.vue'
import ConfirmModal from '~/components/ConfirmModal.vue'
import Select from '~/components/Select.vue'
import { useToast } from '~/stores/toast'
import { useFormatter } from '~/composables/useFormatter'

const { formatHumanDate, formatMoney } = useFormatter()

const api = useApi()
const toast = useToast()

const activeTab = ref('quotations')
const showQuotationModal = ref(false)
const showCatalogModal = ref(false)
const showProductModal = ref(false)
const showConvertModal = ref(false)
const converting = ref(false)
const quotationToConvert = ref(null)

const tabs = [
  { id: 'quotations', label: 'Cotizaciones', icon: ClipboardListIcon },
  { id: 'catalog', label: 'Catálogo de Precios', icon: TagIcon }
]

const searchQuery = ref('')
const clientIdFilter = ref('')
const clients = ref([])
const clientOptions = computed(() => [
  { value: '', label: 'Todos los clientes' },
  ...clients.value.map(c => ({ value: c.id, label: c.name }))
])

const quotations = ref([])
const catalog = ref([])
const loadingQuotations = ref(false)
const loadingCatalog = ref(false)

const statusClasses = {
  pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  accepted: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  rejected: 'bg-red-500/10 text-red-600 border-red-500/20',
  order_created: 'bg-blue-500/10 text-blue-600 border-blue-500/20'
}

const selectedQuotationId = ref(null)
const selectedCatalogPrice = ref(null)
const selectedProduct = ref(null)
const isReadOnly = ref(false)

// Delete handling
const showDeleteConfirm = ref(false)
const itemToDelete = ref(null)
const itemToDeleteType = ref('quotation') // 'quotation', 'product', 'price'
const deleting = ref(false)

const openNewQuotation = () => {
  selectedQuotationId.value = null
  isReadOnly.value = false
  showQuotationModal.value = true
}

const openNewCatalogPrice = () => {
  selectedCatalogPrice.value = null
  showCatalogModal.value = true
}

const editQuotation = (id) => {
  selectedQuotationId.value = id
  isReadOnly.value = false
  showQuotationModal.value = true
}

const showQuotation = (id) => {
  selectedQuotationId.value = id
  isReadOnly.value = true
  showQuotationModal.value = true
}

const fetchQuotations = async () => {
  loadingQuotations.value = true
  try {
    const res = await api.get('/api/quotations', {
      params: {
        search: searchQuery.value,
        client_id: clientIdFilter.value
      }
    })
    quotations.value = res.data
  } catch (err) {
    toast.error('Error al cargar cotizaciones')
  } finally {
    loadingQuotations.value = false
  }
}

let searchTimeout = null
const debouncedFetch = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchQuotations()
  }, 500)
}

const fetchClients = async () => {
  try {
    const res = await api.get('/api/clients?per_page=1000')
    clients.value = res.data?.data || res.data || []
  } catch (err) {
    console.error('Error fetching clients:', err)
  }
}

const fetchCatalog = async () => {
  loadingCatalog.value = true
  try {
    const res = await api.get('/api/catalog-prices')
    catalog.value = res.data
  } catch (err) {
    toast.error('Error al cargar catálogo')
  } finally {
    loadingCatalog.value = false
  }
}

const updateStatus = async (quotation, status) => {
  try {
    await api.put(`/api/quotations/${quotation.id}/status`, { status })
    toast.success(`Cotización ${status === 'accepted' ? 'aceptada' : 'actualizada'}`)
    fetchQuotations()
  } catch (err) {
    toast.error('Error al actualizar estatus')
  }
}

const convertToOrder = (quotation) => {
  quotationToConvert.value = quotation
  showConvertModal.value = true
}

const handleConvertConfirm = async (data) => {
  try {
    converting.value = true
    await api.post(`/api/quotations/${quotationToConvert.value.id}/convert`, data)
    toast.success('Pedido generado correctamente')
    showConvertModal.value = false
    fetchQuotations()
  } catch (err) {
    toast.error(err.data?.message || 'Error al convertir a pedido')
  } finally {
    converting.value = false
  }
}
const deleteQuotation = (id) => {
  itemToDelete.value = id
  itemToDeleteType.value = 'quotation'
  showDeleteConfirm.value = true
}

const onConfirmDelete = async () => {
  if (!itemToDelete.value) return
  
  deleting.value = true
  try {
    let endpoint = ''
    if (activeTab.value === 'quotations') {
      endpoint = `/api/quotations/${itemToDelete.value}`
    } else {
      endpoint = itemToDeleteType.value === 'product' 
        ? `/api/product-catalogs/${itemToDelete.value}`
        : `/api/catalog-prices/${itemToDelete.value}`
    }

    await api.delete(endpoint)
    toast.success('Eliminado correctamente')
    
    if (activeTab.value === 'quotations') {
      fetchQuotations()
    } else {
      fetchCatalog()
    }
  } catch (err) {
    toast.error(err.data?.message || 'Error al eliminar')
    } finally {
    deleting.value = false
    showDeleteConfirm.value = false
    itemToDelete.value = null
  }
}

const calculateTotalPieces = (q) => {
  if (!q.items) return 0
  return q.items.reduce((acc, item) => acc + (parseInt(item.quantity) || 0), 0)
}

const getItemDisplayName = (item) => {
  if (item.custom_description) return item.custom_description
  const price = item.product_catalog_price || item.productCatalogPrice
  return price?.product_catalog?.name || price?.productCatalog?.name || 'Producto'
}

const editCatalogPrice = (price) => {
  selectedCatalogPrice.value = price
  showCatalogModal.value = true
}

const editProduct = (product) => {
  selectedProduct.value = product
  showProductModal.value = true
}

const deleteProduct = (id) => {
  itemToDelete.value = id
  itemToDeleteType.value = 'product'
  showDeleteConfirm.value = true
}

const deleteCatalogPrice = (id) => {
  itemToDelete.value = id
  itemToDeleteType.value = 'price'
  showDeleteConfirm.value = true
}

const printQuotation = (q) => {
  // Crear un iframe invisible para disparar la impresión sin salir de la página
  const iframe = document.createElement('iframe')
  iframe.style.position = 'fixed'
  iframe.style.right = '0'
  iframe.style.bottom = '0'
  iframe.style.width = '0'
  iframe.style.height = '0'
  iframe.style.border = '0'
  iframe.src = `/production/print-quotation/${q.id}`
  document.body.appendChild(iframe)
  
  // Limpiar el iframe después de un tiempo
  setTimeout(() => {
    if (document.body.contains(iframe)) {
      document.body.removeChild(iframe)
    }
  }, 10000)
}

onMounted(() => {
  fetchQuotations()
  fetchCatalog()
  fetchClients()
})

definePageMeta({
  layout: 'default'
})
</script>

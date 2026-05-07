<template>
  <div class="flex flex-col gap-6">
    <!-- Main Header -->
    <div class="flex flex-wrap justify-between items-start gap-4">
      <div class="space-y-1">
        <h2 class="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">Gestión de Cotizaciones</h2>
        <p class="text-sm text-slate-500 dark:text-slate-400">Administre el catálogo de precios y genere propuestas para sus clientes.</p>
      </div>

      <div class="flex items-center gap-3">
        <button
          v-if="activeTab === 'quotations'"
          @click="openNewQuotation"
          class="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-primary/20"
        >
          <PlusIcon class="w-5 h-5" />
          Nueva Cotización
        </button>
        <button
          v-else
          @click="showCatalogModal = true"
          class="bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-slate-900/20"
        >
          <PlusIcon class="w-5 h-5" />
          Nueva Variación
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
        <div class="bg-white dark:bg-card-dark rounded-2xl border border-border-light dark:border-border-dark overflow-hidden shadow-sm">
          <table class="w-full text-left">
            <thead>
              <tr class="bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 text-[11px] font-black uppercase tracking-widest border-b border-border-light dark:border-border-dark">
                <th class="px-6 py-4">Folio</th>
                <th class="px-6 py-4">Cliente</th>
                <th class="px-6 py-4">Fecha</th>
                <th class="px-6 py-4">Total</th>
                <th class="px-6 py-4">Estado</th>
                <th class="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border-light dark:divide-border-dark">
              <tr v-for="q in quotations" :key="q.id" class="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                <td class="px-6 py-4">
                  <span class="font-black text-slate-900 dark:text-white">{{ q.folio }}</span>
                </td>
                <td class="px-6 py-4 text-sm font-medium">{{ q.client?.name || 'Cliente sin nombre' }}</td>
                <td class="px-6 py-4 text-sm text-slate-500">{{ q.quotation_date ? new Date(q.quotation_date).toLocaleDateString() : 'N/A' }}</td>
                <td class="px-6 py-4 font-bold text-primary">${{ q.total_amount }}</td>
                <td class="px-6 py-4">
                  <span 
                    class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border"
                    :class="statusClasses[q.status]"
                  >
                    {{ q.status }}
                  </span>
                </td>
                <td class="px-6 py-4 text-right">
                  <div class="flex justify-end gap-2">
                    <button @click="showQuotation(q.id)" class="p-2 text-slate-400 hover:text-primary transition-colors bg-slate-50 dark:bg-white/5 rounded-lg" title="Ver Detalles">
                      <EyeIcon class="w-4 h-4" />
                    </button>
                    <button @click="printQuotation(q)" class="p-2 text-slate-400 hover:text-emerald-500 transition-colors bg-slate-50 dark:bg-white/5 rounded-lg" title="Imprimir PDF">
                      <PrinterIcon class="w-4 h-4" />
                    </button>
                    <button @click="editQuotation(q.id)" class="p-2 text-slate-400 hover:text-primary transition-colors bg-slate-50 dark:bg-white/5 rounded-lg" title="Editar">
                      <PencilIcon class="w-4 h-4" />
                    </button>
                    <button 
                      v-if="q.status === 'accepted'" 
                      @click="convertToOrder(q)" 
                      class="p-2 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-all"
                      title="Convertir a Pedido"
                    >
                      <ArrowRightIcon class="w-4 h-4" />
                    </button>
                    <button 
                      v-if="q.status === 'pending'" 
                      @click="updateStatus(q, 'accepted')" 
                      class="p-2 text-primary hover:text-emerald-600 transition-colors bg-slate-50 dark:bg-white/5 rounded-lg"
                      title="Aceptar Cotización"
                    >
                      <CheckIcon class="w-4 h-4" />
                    </button>
                    <button 
                      v-if="q.status !== 'accepted'" 
                      @click="deleteQuotation(q.id)" 
                      class="p-2 text-slate-400 hover:text-red-500 transition-colors bg-slate-50 dark:bg-white/5 rounded-lg"
                      title="Eliminar"
                    >
                      <Trash2Icon class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="quotations.length === 0">
                <td colspan="6" class="px-6 py-12 text-center text-slate-400 text-sm italic">
                  No hay cotizaciones registradas.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Catalog Prices -->
      <div v-if="activeTab === 'catalog'" class="space-y-6">
        <div v-for="product in catalog" :key="product.id" class="bg-white dark:bg-card-dark rounded-2xl border border-border-light dark:border-border-dark overflow-hidden shadow-sm">
          <div class="p-4 bg-slate-50 dark:bg-white/5 border-b border-border-light dark:border-border-dark flex justify-between items-center">
            <h3 class="font-black text-slate-900 dark:text-white uppercase tracking-tight">{{ product.name }}</h3>
            <span class="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">BASE: ${{ product.base_price }}</span>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left">
              <thead>
                <tr class="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-border-light dark:border-border-dark">
                  <th class="px-6 py-3">Material / Descripción</th>
                  <th class="px-6 py-3">Rango de Tallas</th>
                  <th class="px-6 py-3 text-right">Menudeo</th>
                  <th class="px-6 py-3 text-right text-primary">Mayoreo (>=25)</th>
                  <th class="px-6 py-3 w-10"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border-light dark:divide-border-dark">
                <tr v-for="price in product.prices" :key="price.id" class="text-sm">
                  <td class="px-6 py-3 font-semibold">{{ price.material }}</td>
                  <td class="px-6 py-3">{{ price.size_range }}</td>
                  <td class="px-6 py-3 text-right font-medium text-slate-600 dark:text-slate-400">${{ price.retail_price }}</td>
                  <td class="px-6 py-3 text-right font-black text-primary">${{ price.wholesale_price }}</td>
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
      @saved="fetchCatalog"
    />

    <ConfirmModal
      v-model:show="showDeleteConfirm"
      title="Eliminar Cotización"
      :message="'¿Estás seguro de que deseas eliminar permanentemente esta cotización?\n\nEsta acción no se puede deshacer.'"
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
  TrashIcon
} from 'lucide-vue-next'
import QuotationModal from '~/components/quotations/QuotationModal.vue'
import CatalogPriceModal from '~/components/quotations/CatalogPriceModal.vue'
import ConfirmModal from '~/components/ConfirmModal.vue'
import { useToast } from '~/stores/toast'

const api = useApi()
const toast = useToast()

const activeTab = ref('quotations')
const showQuotationModal = ref(false)
const showCatalogModal = ref(false)

const tabs = [
  { id: 'quotations', label: 'Cotizaciones', icon: ClipboardListIcon },
  { id: 'catalog', label: 'Catálogo de Precios', icon: TagIcon }
]

const quotations = ref([])
const catalog = ref([])

const statusClasses = {
  pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  accepted: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  rejected: 'bg-red-500/10 text-red-600 border-red-500/20'
}

const selectedQuotationId = ref(null)
const isReadOnly = ref(false)

// Delete handling
const showDeleteConfirm = ref(false)
const itemToDelete = ref(null)
const deleting = ref(false)

const openNewQuotation = () => {
  selectedQuotationId.value = null
  isReadOnly.value = false
  showQuotationModal.value = true
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
  try {
    const res = await api.get('/api/quotations')
    quotations.value = res.data
  } catch (err) {
    toast.error('Error al cargar cotizaciones')
  }
}

const fetchCatalog = async () => {
  try {
    const res = await api.get('/api/catalog-prices')
    catalog.value = res.data
  } catch (err) {
    toast.error('Error al cargar catálogo')
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

const convertToOrder = async (quotation) => {
  try {
    await api.post(`/api/quotations/${quotation.id}/convert`)
    toast.success('Pedido generado correctamente')
    fetchQuotations()
  } catch (err) {
    toast.error(err.data?.message || 'Error al convertir a pedido')
  }
}
const deleteQuotation = (id) => {
  itemToDelete.value = id
  showDeleteConfirm.value = true
}

const onConfirmDelete = async () => {
  if (!itemToDelete.value) return
  
  deleting.value = true
  try {
    const endpoint = activeTab.value === 'quotations' 
      ? `/api/quotations/${itemToDelete.value}`
      : `/api/catalog-prices/${itemToDelete.value}`

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

const editCatalogPrice = (price) => {
  // Logic to open CatalogPriceModal with data
  // Since we only have 'showCatalogModal', maybe we need to pass the item to it
  // I'll check CatalogPriceModal.vue later if needed
  showCatalogModal.value = true
}

const deleteCatalogPrice = (id) => {
  itemToDelete.value = id
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
})

definePageMeta({
  layout: 'default'
})
</script>

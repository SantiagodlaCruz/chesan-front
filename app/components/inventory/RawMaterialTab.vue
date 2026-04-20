<template>
  <div class="space-y-4">
    <!-- Filters -->
    <div class="flex items-end flex-wrap gap-3 pb-1 pt-1 relative z-10 w-full mb-2">
      <div class="w-40 shrink-0">
        <Select v-model="filtroUnidad" :options="unidadesFiltro" label="Unidad" placeholder="Todas" @update:modelValue="debouncedFetch" />
      </div>
      <div class="w-64 shrink-0">
        <Select v-model="filtroColor" :options="coloresFiltro" label="Color" placeholder="Todos" searchable :loading="catalogsStore.loading" @update:modelValue="debouncedFetch" />
      </div>
      <div class="w-32 shrink-0">
        <Select v-model="filtroStock" :options="opcionesStock" label="Stock" placeholder="Todos" @update:modelValue="debouncedFetch" />
      </div>
    </div>

    <!-- Table -->
    <DataTable 
      :columns="[
        { key: 'barcode', label: 'Código' },
        { key: 'image_url', label: 'Foto', align: 'center' },
        { key: 'name', label: 'Material' },
        { key: 'color', label: 'Color', align: 'center' },
        { key: 'unit_price', label: 'Precio Unitario', align: 'right' },
        { key: 'quantity', label: 'Stock Actual', align: 'center' }
      ]"
      show-actions
      :items="items" 
      :loading="pending" 
      :meta="meta"
      :links="links"
      :error-msg="errorMsg"
      :per-page="perPage"
      @view="onView"
      @edit="onEdit"
      @print="onPrint"
      @delete="onDelete"
      @page-change="onChangePage"
      @per-page-change="onChangePerPage"
    >
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

      <template #cell-barcode="{ value }">
        <span class="font-mono text-xs text-primary/80 dark:text-primary-400 bg-primary/5 dark:bg-primary/10 px-2.5 py-1 rounded-md border border-primary/10 tracking-wider">
          {{ value || 'Sin código' }}
        </span>
      </template>

      <template #cell-image_url="{ value }">
        <div class="w-10 h-10 rounded-lg overflow-hidden border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 flex items-center justify-center">
          <img v-if="value" :src="value" class="w-full h-full object-cover" />
          <LayersIcon v-else class="w-5 h-5 text-slate-400" />
        </div>
      </template>

      <template #cell-name="{ value }">
        <span class="font-semibold text-slate-800 dark:text-slate-100">{{ value || 'Sin nombre' }}</span>
      </template>
      
      <template #cell-color="{ item }">
        <div class="flex items-center justify-center">
          <div class="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 font-medium border border-slate-200 dark:border-white/10">
            <div 
              v-if="(item as RawMaterial).color?.hex_code"
              class="w-3 h-3 rounded-full border border-slate-300 dark:border-white/20 shadow-sm shrink-0"
              :style="{ backgroundColor: (item as RawMaterial).color?.hex_code || '' }"
            ></div>
            <span class="text-[11px]">{{ (item as RawMaterial).color?.name || '---' }}</span>
          </div>
        </div>
      </template>

      <template #cell-unit_price="{ value }">
        <span class="font-bold text-slate-900 dark:text-white">${{ parseFloat(value || 0).toFixed(2) }}</span>
      </template>

      <template #cell-quantity="{ item, value }">
        <div class="flex items-center justify-center">
          <span 
            class="text-center text-xs font-black px-2.5 py-1 rounded-lg border transition-all duration-300"
            :class="getStockClass(value, (item as RawMaterial).min_threshold)"
          >
            {{ value || 0 }} / {{ (item as RawMaterial).unit_measure?.name || '---' }}
          </span>
        </div>
      </template>
    </DataTable>

    <!-- Delete Confirmation Modal -->
    <ConfirmModal 
      v-model:show="showDeleteConfirm"
      title="Eliminar Material"
      :message="`¿Estás seguro de que deseas eliminar permanentemente este material?\n\nMaterial: ${itemToDelete?.name}\nUnidad: ${itemToDelete?.unit_measure?.name || '---'}\n\nEsta acción no se puede deshacer.`"
      confirm-text="Eliminar Definitivamente"
      confirm-variant="danger"
      :loading="deleting"
      @confirm="onConfirmDelete"
    />

    <AddRawMaterialModal 
      v-model:show="showAddModal" 
      :unidades="unidadesModal" 
      :colores="coloresModal"
      :item-to-edit="selectedItem"
      :readonly="isReadOnly"
      @saved="onSaveMaterial" 
    />

    <PrintBarcodeModal
      v-model:show="showPrintModal"
      :item="itemToPrint"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { LayersIcon } from 'lucide-vue-next'
import Select from '~/components/Select.vue'
import DataTable from '~/components/DataTable.vue'
import AddRawMaterialModal from './AddRawMaterialModal.vue'
import PrintBarcodeModal from './PrintBarcodeModal.vue'
import ConfirmModal from '~/components/ConfirmModal.vue'
import { useToast } from '~/stores/toast'
import type { RawMaterial, ApiMeta, ApiLinks, ApiPaginatedResponse, SelectOption } from '~/types'

const props = defineProps({
  showModalTrigger: Boolean,
  search: {
    type: String,
    default: ''
  }
})
const emit = defineEmits(['update:showModalTrigger'])

const showAddModal = ref(false)
const selectedItem = ref<RawMaterial | null>(null)
const isReadOnly = ref(false)

// Delete handling
const showDeleteConfirm = ref(false)
const deleting = ref(false)
const itemToDelete = ref<RawMaterial | null>(null)
const toast = useToast()

// Print handling
const showPrintModal = ref(false)
const itemToPrint = ref<RawMaterial | null>(null)

watch(() => props.search, (val) => {
  filtroBusqueda.value = val
  debouncedFetch()
})

watch(() => props.showModalTrigger, (val) => {
  if (val) {
    selectedItem.value = null
    isReadOnly.value = false
    showAddModal.value = true
    emit('update:showModalTrigger', false)
  }
})

const filtroBusqueda = ref('')
const filtroUnidad = ref('')
const filtroColor = ref('')
const filtroStock = ref('')
const filtroOrden = ref('id_desc')
const rawMaterialsStore = useRawMaterialsStore()

const currentPage = ref(1)
const perPage = ref(10)

const items = computed(() => rawMaterialsStore.items)
const meta = computed(() => rawMaterialsStore.meta)
const links = computed(() => rawMaterialsStore.links)
const pending = computed(() => rawMaterialsStore.loading)
const errorMsg = computed(() => rawMaterialsStore.error || '')

const unitMeasuresStore = useUnitMeasuresStore()
const catalogsStore = useCatalogs()

const unidadesFiltro = computed<SelectOption[]>(() => {
  return [
    { label: 'Todas', value: '' },
    ...unitMeasuresStore.items.map(u => ({ label: u.name, value: u.id }))
  ]
})

const unidadesModal = computed<SelectOption[]>(() => {
  return unitMeasuresStore.items.map(u => ({ label: u.name, value: u.id }))
})

const coloresModal = computed<SelectOption[]>(() => {
  return catalogsStore.colors
})

const coloresFiltro = computed<SelectOption[]>(() => {
  return [
    { label: 'Todos', value: '' },
    ...catalogsStore.colors
  ]
})

const opcionesStock = [
  { label: 'Todos', value: '' },
  { label: 'Agotado', value: 'out_of_stock' },
  { label: 'Stock Crítico', value: 'critical' },
  { label: 'Stock Bajo', value: 'low' },
  { label: 'Stock Sano', value: 'healthy' }
]

const opcionesOrden = [
  { label: 'Más Reciente', value: 'id_desc' },
  { label: 'Más Antiguo', value: 'id_asc' },
  { label: 'Mayor Cantidad', value: 'quantity_desc' },
  { label: 'Menor Cantidad', value: 'quantity_asc' },
  { label: 'Nombre (A-Z)', value: 'name_asc' },
  { label: 'Precio (Mayor a Menor)', value: 'unit_price_desc' }
]

const fetchData = async () => {
  let [sortBy, sortDirection] = filtroOrden.value.split('_')
  
  await rawMaterialsStore.fetchMaterials({
    search: filtroBusqueda.value,
    unit_measure_id: filtroUnidad.value,
    color_id: filtroColor.value,
    stock_status: filtroStock.value,
    sort_by: sortBy || 'id',
    sort_direction: sortDirection || 'desc',
    page: currentPage.value,
    per_page: perPage.value
  })
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
  unitMeasuresStore.fetchUnitMeasures()
  catalogsStore.fetchAll()
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

const onView = (item: RawMaterial) => {
  selectedItem.value = item
  isReadOnly.value = true
  showAddModal.value = true
}

const onEdit = (item: RawMaterial) => {
  selectedItem.value = item
  isReadOnly.value = false
  showAddModal.value = true
}

const onPrint = (item: RawMaterial) => {
  if (!item.barcode) {
    toast.error('Este material no tiene código de barras asignado.')
    return
  }
  itemToPrint.value = item
  showPrintModal.value = true
}

const onDelete = (item: RawMaterial) => {
  itemToDelete.value = item
  showDeleteConfirm.value = true
}

const onConfirmDelete = async () => {
  if (!itemToDelete.value) return
  
  try {
    deleting.value = true
    await rawMaterialsStore.deleteMaterial(itemToDelete.value.id)
    toast.success('Material eliminado correctamente')
    showDeleteConfirm.value = false
    fetchData()
  } catch (err: any) {
    toast.error(err.message || 'Error al eliminar el material')
  } finally {
    deleting.value = false
  }
}

const onSaveMaterial = () => {
  fetchData()
}

const getStockClass = (qty: number, minThreshold: number) => {
  const threshold = minThreshold || 10 // fallback if no threshold set
  if (qty <= 0) {
    return 'bg-red-50 text-red-600 border-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20'
  }
  if (qty <= threshold) {
    return 'bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20 animate-pulse-soft shadow-lg shadow-orange-500/20'
  }
  if (qty <= threshold * 2) {
    return 'bg-yellow-50 text-yellow-600 border-yellow-100 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/20'
  }
  return 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
}
</script>

<template>
  <div class="space-y-4">
    <!-- Filters -->
    <div class="flex items-end flex-wrap gap-3 pb-1 pt-1 relative z-10 w-full mb-2">
      <div class="w-40 shrink-0">
        <Select v-model="filtroUnidad" :options="unidadesFiltro" label="Unidad" placeholder="Todas" @update:modelValue="debouncedFetch" />
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
        { key: 'unit_measure', label: 'Unidad' },
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

      <template #cell-unit_price="{ value }">
        <span class="font-bold text-slate-900 dark:text-white">${{ parseFloat(value || 0).toFixed(2) }}</span>
      </template>

      <template #cell-quantity="{ item, value }">
        <div class="flex items-center justify-center">
          <span 
            class="text-center text-xs font-black px-2.5 py-1 rounded-lg border transition-all duration-300"
            :class="getStockClass(value, (item as RawMaterial).min_threshold)"
          >
            {{ value || 0 }} / {{ (item as RawMaterial).unit_measure || '---' }}
          </span>
        </div>
      </template>
    </DataTable>

    <!-- Delete Confirmation Modal -->
    <ConfirmModal 
      v-model:show="showDeleteConfirm"
      title="Eliminar Material"
      :message="`¿Estás seguro de que deseas eliminar permanentemente este material?\n\nMaterial: ${itemToDelete?.name}\nUnidad: ${itemToDelete?.unit_measure}\n\nEsta acción no se puede deshacer.`"
      confirm-text="Eliminar Definitivamente"
      confirm-variant="danger"
      :loading="deleting"
      @confirm="onConfirmDelete"
    />

    <AddRawMaterialModal 
      v-model:show="showAddModal" 
      :unidades="unidadesModal" 
      :item-to-edit="selectedItem"
      :readonly="isReadOnly"
      @saved="onSaveMaterial" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { LayersIcon } from 'lucide-vue-next'
import Select from '~/components/Select.vue'
import DataTable from '~/components/DataTable.vue'
import AddRawMaterialModal from './AddRawMaterialModal.vue'
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

const unidadesFiltro = computed<SelectOption[]>(() => {
  return [
    { label: 'Todas', value: '' },
    ...unitMeasuresStore.items.map(u => ({ label: u.name, value: u.name }))
  ]
})

const unidadesModal = computed<SelectOption[]>(() => {
  return unitMeasuresStore.items.map(u => ({ label: u.name, value: u.name }))
})

const opcionesStock = [
  { label: 'Todos', value: '' },
  { label: 'Agotado (0)', value: 'out_of_stock' },
  { label: 'Crítico (1-5)', value: 'critical' },
  { label: 'Bajo (6-15)', value: 'low' },
  { label: 'Sano (>15)', value: 'healthy' }
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
    unit_measure: filtroUnidad.value,
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

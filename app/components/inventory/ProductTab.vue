<template>
  <div class="space-y-4">
    <!-- Filters -->
    <div class="flex items-end flex-wrap gap-3 pb-1 pt-1 relative z-10 w-full mb-2">
      <div class="w-64 shrink-0">
        <Select v-model="filtroInstitucion" :options="institucionesOp" label="Escuela" placeholder="Todas" searchable :loading="catalogs.loading" @update:modelValue="debouncedFetch" />
      </div>
      <div class="w-44 shrink-0">
        <Select v-model="filtroCategoria" :options="categoriasOp" label="Categoría" placeholder="Todas" searchable :loading="catalogs.loading" @update:modelValue="debouncedFetch" />
      </div>
      <div class="w-36 shrink-0">
        <Select v-model="filtroColor" :options="coloresOp" label="Color" placeholder="Todas" searchable :loading="catalogs.loading" @update:modelValue="debouncedFetch" />
      </div>
      <div class="w-32 shrink-0">
        <Select v-model="filtroTalla" :options="tallasOp" label="Talla" placeholder="Todas" searchable :loading="catalogs.loading" @update:modelValue="debouncedFetch" />
      </div>
      <div class="w-32 shrink-0">
        <Select v-model="filtroStock" :options="opcionesStock" label="Stock" placeholder="Todos" @update:modelValue="debouncedFetch" />
      </div>
    </div>

    <!-- Table -->
    <DataTable 
      :columns="[
        { key: 'barcode', label: 'Código de Producto' },
        { key: 'image_url', label: 'Foto', align: 'center' },
        { key: 'name', label: 'Producto' },
        { key: 'category', label: 'Categoría' },
        { key: 'institution', label: 'Escuela' },
        { key: 'variants', label: 'Color / Talla', align: 'center' },
        { key: 'sale_price', label: 'Precio', align: 'right' },
        { key: 'quantity', label: 'Stock', align: 'center' }
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
          {{ value || '---' }}
        </span>
      </template>

      <template #cell-image_url="{ value }">
        <div class="w-10 h-10 rounded-lg overflow-hidden border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 flex items-center justify-center">
          <img v-if="value" :src="value" class="w-full h-full object-cover" />
          <ShirtIcon v-else class="w-5 h-5 text-slate-400" />
        </div>
      </template>

      <template #cell-name="{ value }">
        <span class="font-semibold text-slate-800 dark:text-slate-100">{{ value || 'Sin nombre' }}</span>
      </template>

      <template #cell-category="{ item }">
        <span class="text-xs text-slate-500">{{ item.category?.name || '---' }}</span>
      </template>

      <template #cell-institution="{ item }">
        <span class="text-xs text-slate-500">{{ item.institution?.name || '---' }}</span>
      </template>

      <template #cell-variants="{ item }">
        <div class="flex items-center justify-center gap-1 text-[11px]">
          <span class="px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium border border-blue-100 dark:border-blue-500/20">{{ item.color || '---' }}</span>
          <span class="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 font-bold uppercase border border-slate-200 dark:border-white/10">{{ item.size || '---' }}</span>
        </div>
      </template>

      <template #cell-sale_price="{ value }">
        <span class="font-bold text-slate-900 dark:text-white">${{ parseFloat(value || 0).toFixed(2) }}</span>
      </template>

      <template #cell-quantity="{ value }">
        <div class="flex items-center justify-center">
          <span 
            class="text-xs font-black px-2.5 py-1 rounded-lg border transition-all duration-300"
            :class="[
              value <= 0 
                ? 'bg-red-50 text-red-600 border-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20' 
                : value <= 5
                ? 'bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20 animate-pulse-soft shadow-lg shadow-orange-500/20'
                : value <= 15
                ? 'bg-yellow-50 text-yellow-600 border-yellow-100 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/20'
                : 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
            ]"
          >
            {{ value || 0 }}
          </span>
        </div>
      </template>
    </DataTable>

    <!-- Confirmation Modal -->
    <ConfirmModal 
      v-model:show="showDeleteConfirm"
      title="Eliminar Producto"
      :message="`¿Estás seguro de que deseas eliminar permanentemente esta variante?\n\nProducto: ${itemToDelete?.name}\nColor: ${itemToDelete?.color}\nTalla: ${itemToDelete?.size}\n\nEsta acción no se puede deshacer.`"
      confirm-text="Eliminar Definitivamente"
      confirm-variant="danger"
      :loading="deleting"
      @confirm="onConfirmDelete"
    />

    <AddProductModal 
      v-model:show="showAddModal" 
      :categorias="catalogs.categories" 
      :instituciones="catalogs.institutions" 
      :colores="catalogs.colors"
      :item-to-edit="selectedItem"
      :readonly="isReadOnly"
      @saved="onSaveProduct"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { EditIcon, TrashIcon, SearchIcon, FilterIcon, ArrowUpDownIcon, ShirtIcon } from 'lucide-vue-next'
import Select from '~/components/Select.vue'
import DataTable from '~/components/DataTable.vue'
import AddProductModal from './AddProductModal.vue'
import ConfirmModal from '~/components/ConfirmModal.vue'
import { useToast } from '~/stores/toast'
import type { StockProduct, ApiMeta, ApiLinks, ApiPaginatedResponse } from '~/types'

const props = defineProps({
  showModalTrigger: Boolean,
  search: {
    type: String,
    default: ''
  }
})
const emit = defineEmits(['update:showModalTrigger'])

const showAddModal = ref(false)
const selectedItem = ref<StockProduct | null>(null)
const isReadOnly = ref(false)

// Delete handling
const showDeleteConfirm = ref(false)
const deleting = ref(false)
const itemToDelete = ref<StockProduct | null>(null)
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

// Filtros
const filtroBusqueda = ref('')
const filtroCategoria = ref('')
const filtroInstitucion = ref('')
const filtroColor = ref('')
const filtroTalla = ref('')
const filtroStock = ref('')
const filtroOrden = ref('id_desc')
const inventoryStore = useInventoryStore()
const catalogs = useCatalogs()

const currentPage = ref(1)
const perPage = ref(10)

const items = computed(() => inventoryStore.items)
const meta = computed(() => inventoryStore.meta)
const links = computed(() => inventoryStore.links)
const pending = computed(() => inventoryStore.loading)
const errorMsg = computed(() => inventoryStore.error || '')

// Computed options sourced from global catalog store
const categoriasOp = computed(() => [{ label: 'Todas', value: '' }, ...(catalogs.categories || [])])
const institucionesOp = computed(() => [{ label: 'Todas', value: '' }, ...(catalogs.institutions || [])])
const coloresOp = computed(() => [{ label: 'Todas', value: '' }, ...(catalogs.colors || [])])
const tallasOp = computed(() => [{ label: 'Todas', value: '' }, ...(catalogs.sizes || [])])
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
  { label: 'Precio (Mayor a Menor)', value: 'sale_price_desc' },
]

const fetchData = async () => {
  let [sortBy, sortDirection] = filtroOrden.value.split('_')
  
  await inventoryStore.fetchProducts({
    search: filtroBusqueda.value,
    category_id: filtroCategoria.value || '',
    institution_id: filtroInstitucion.value || '',
    color: filtroColor.value,
    size: filtroTalla.value,
    stock_status: filtroStock.value,
    sort_by: sortBy || 'id',
    sort_direction: sortDirection || 'desc',
    page: currentPage.value,
    per_page: perPage.value
  })
}

let fetchTimeout: ReturnType<typeof setTimeout> | null = null
const debouncedFetch = () => {
  clearTimeout(fetchTimeout)
  fetchTimeout = setTimeout(() => {
    currentPage.value = 1
    fetchData()
  }, 500)
}

onMounted(() => {
  catalogs.fetchAll()
  fetchData()
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

const onView = (item: StockProduct) => {
  selectedItem.value = item
  isReadOnly.value = true
  showAddModal.value = true
}

const onEdit = (item: StockProduct) => {
  selectedItem.value = item
  isReadOnly.value = false
  showAddModal.value = true
}

const onDelete = (item: StockProduct) => {
  itemToDelete.value = item
  showDeleteConfirm.value = true
}

const onConfirmDelete = async () => {
  if (!itemToDelete.value) return
  
  try {
    deleting.value = true
    await inventoryStore.deleteProduct(itemToDelete.value.id)
    toast.success('Producto eliminado correctamente')
    showDeleteConfirm.value = false
    fetchData()
  } catch (err: any) {
    toast.error(err.message || 'Error al eliminar el producto')
  } finally {
    deleting.value = false
  }
}

const onSaveProduct = () => {
  fetchData()
}
</script>

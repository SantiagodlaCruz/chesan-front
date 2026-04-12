<template>
  <div class="space-y-4">
    <!-- Filters -->
    <div class="flex items-end flex-wrap gap-2 pb-1 pt-1 relative z-10 w-full">
      <div class="w-40 shrink-0">
        <Select v-model="filtroUnidad" :options="unidades" label="Unidad" placeholder="Todas" @update:modelValue="fetchData" />
      </div>

      <div class="w-32 shrink-0">
        <Select v-model="filtroStock" :options="opcionesStock" label="Stock" placeholder="Todos" @update:modelValue="debouncedFetch" />
      </div>

      <div class="w-56 shrink-0">
        <Select v-model="filtroOrden" :options="opcionesOrden" label="Ordenar" placeholder="Seleccionar..." @update:modelValue="fetchData" />
      </div>
    </div>

    <!-- Table -->
    <DataTable 
      :columns="[
        { key: 'name', label: 'Material' },
        { key: 'category', label: 'Categoría' },
        { key: 'unit_measure', label: 'Unidad' },
        { key: 'unit_price', label: 'Precio Unitario', align: 'right' },
        { key: 'quantity', label: 'Stock Actual', align: 'center' },
        { key: 'min_threshold', label: 'Mínimo', align: 'center' }
      ]"
      :items="items" 
      :loading="pending" 
      :meta="meta"
      :links="links"
      :error-msg="errorMsg"
      :per-page="perPage"
      @edit="onEdit"
      @delete="onDelete"
      @page-change="onChangePage"
      @per-page-change="onChangePerPage"
    >
      <template #cell-name="{ value }">
        <span class="font-semibold text-slate-800 dark:text-slate-100">{{ value || 'Sin nombre' }}</span>
      </template>

      <template #cell-unit_price="{ value }">
        <span class="font-bold text-slate-900 dark:text-white">${{ parseFloat(value || 0).toFixed(2) }}</span>
      </template>

      <template #cell-quantity="{ item, value }">
        <div class="flex items-center justify-center gap-2">
          <span 
            class="min-w-[45px] text-center text-xs font-black px-2.5 py-1 rounded-lg border transition-all duration-300"
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
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{{ (item as RawMaterial).unit_measure || '---' }}</span>
        </div>
      </template>

      <template #cell-min_threshold="{ value }">
        <span class="text-xs font-bold text-slate-400 opacity-60 italic">{{ value || 0 }}</span>
      </template>
    </DataTable>

    <AddRawMaterialModal 
      v-model:show="showAddModal" 
      :unidades="unidades" 
      @saved="onSaveMaterial" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { SearchIcon } from 'lucide-vue-next'
import Select from '~/components/Select.vue'
import DataTable from '~/components/DataTable.vue'
import AddRawMaterialModal from './AddRawMaterialModal.vue'
import type { RawMaterial, ApiMeta, ApiLinks, ApiPaginatedResponse, SelectOption } from '~/types'

const props = defineProps({
  showModalTrigger: Boolean,
  search: {
    type: String,
    default: ''
  }
})
const emit = defineEmits(['update:showModalTrigger'])

watch(() => props.search, (val) => {
  filtroBusqueda.value = val
  debouncedFetch()
})

watch(() => props.showModalTrigger, (val) => {
  if (val) {
    showAddModal.value = true
    emit('update:showModalTrigger', false)
  }
})

const showAddModal = ref(false)

const filtroBusqueda = ref('')
const filtroUnidad = ref('')
const filtroStock = ref('')
const filtroOrden = ref('id_desc')
const rawMaterialsStore = useRawMaterialsStore()
const catalogs = useCatalogs()

const currentPage = ref(1)
const perPage = ref(10)

const items = computed(() => rawMaterialsStore.items)
const meta = computed(() => rawMaterialsStore.meta)
const links = computed(() => rawMaterialsStore.links)
const pending = computed(() => rawMaterialsStore.loading)
const errorMsg = computed(() => rawMaterialsStore.error || '')

const unidades = ref<SelectOption[]>([
  { label: 'Todas', value: '' },
  { label: 'Metros', value: 'metros' },
  { label: 'Rollos', value: 'rollos' },
  { label: 'Conos', value: 'conos' },
  { label: 'Kg', value: 'kg' }
])
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

const onEdit = (item: RawMaterial) => {
  console.log('Edit item', item)
}

const onDelete = (item: RawMaterial) => {
  console.log('Delete item', item)
}

const onSaveMaterial = async (materialData: Partial<RawMaterial>) => {
  const success = await rawMaterialsStore.saveMaterial(materialData)
  if (success) {
    showAddModal.value = false
    fetchData()
  }
}
</script>

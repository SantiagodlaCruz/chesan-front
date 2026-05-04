<template>
  <div class="space-y-6">
    <!-- Table -->
    <DataTable
      :columns="fields"
      :items="items"
      :loading="loading"
      :meta="meta"
      :links="links"
      :per-page="perPage"
      show-actions
      @page-change="fetchData"
      @per-page-change="handlePerPageChange"
    >
      <template #actions="{ item }">
        <button 
          v-if="can(permissionEdit)"
          @click="openModal(item)" 
          class="p-1.5 hover:bg-yellow-500/10 rounded-xl transition-all group/btn" 
          title="Editar"
        >
          <EditIcon class="w-4 h-4 text-[#eab308] group-hover/btn:scale-110 transition-transform" />
        </button>
        <button 
          v-if="can(permissionDelete)"
          @click="deleteItem(item.id)" 
          class="p-1.5 hover:bg-red-500/10 rounded-xl transition-all group/btn" 
          title="Eliminar"
        >
          <TrashIcon class="w-4 h-4 text-accent-red group-hover/btn:scale-110 transition-transform" />
        </button>
      </template>
    </DataTable>

    <BaseModal
      v-model:show="showModal"
      :title="(selectedItem ? 'Editar ' : 'Añadir ') + itemLabel"
      size="md"
    >
      <form @submit.prevent="save" class="space-y-4">
        <div v-for="field in fields" :key="field.key" class="flex flex-col gap-1.5">
          <label class="text-xs font-bold text-slate-600 dark:text-slate-400 pl-1">{{ field.label }}</label>
          
          <!-- Color Picker Custom Field -->
          <div v-if="field.type === 'color'" class="flex items-center gap-3 bg-slate-50 dark:bg-[#1e293b] p-2 rounded-xl border-2 border-transparent focus-within:border-primary transition-all">
             <div 
                class="w-10 h-10 rounded-lg border border-slate-200 dark:border-white/10 relative overflow-hidden transition-transform hover:scale-105 cursor-pointer shadow-sm shadow-black/10"
                :style="{ backgroundColor: form[field.key] || '#ffffff' }"
             >
                <input 
                  type="color" 
                  v-model="form[field.key]" 
                  class="absolute inset-0 w-[200%] h-[200%] -translate-x-1/4 -translate-y-1/4 cursor-pointer opacity-0" 
                />
             </div>
             <div class="flex-1 flex flex-col">
                <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">CÓDIGO HEX</span>
                <input
                  v-model="form[field.key]"
                  type="text"
                  class="bg-transparent border-none outline-none text-sm font-mono font-bold uppercase tracking-widest text-slate-900 dark:text-slate-100 p-0 h-auto"
                  placeholder="#FFFFFF"
                />
             </div>
          </div>

          <input
            v-else
            v-model="form[field.key]"
            :type="field.type"
            :placeholder="field.placeholder"
            :required="field.required"
            class="w-full bg-slate-50 dark:bg-[#1e293b] border-2 border-transparent focus:border-primary transition-all outline-none px-4 py-2.5 rounded-xl text-sm font-medium placeholder:text-slate-400 text-slate-900 dark:text-slate-100"
          />
        </div>

        <div class="flex items-center justify-end gap-3 pt-4">
          <button type="button" @click="showModal = false" class="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
            Cancelar
          </button>
          <button type="submit" class="bg-primary text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
            {{ selectedItem ? 'Guardar Cambios' : 'Confirmar' }}
          </button>
        </div>
      </form>
    </BaseModal>

    <!-- Delete Confirmation Modal -->
    <ConfirmModal
      v-model:show="showDeleteConfirm"
      title="Eliminar Registro"
      :message="'¿Estás seguro de que deseas eliminar permanentemente este registro del catálogo?\n\nEsta acción no se puede deshacer.'"
      confirm-text="Eliminar"
      confirm-variant="danger"
      :loading="deleting"
      @confirm="onConfirmDelete"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { EditIcon, TrashIcon } from 'lucide-vue-next'
import DataTable from '~/components/DataTable.vue'
import ConfirmModal from '~/components/ConfirmModal.vue'
import { useToast } from '~/stores/toast'
import { useCatalogs } from '~/composables/useCatalogs'

const props = defineProps({
  endpoint: String,
  itemLabel: String,
  fields: Array,
  permissionEdit: { type: String, default: 'catalogos.editar' },
  permissionDelete: { type: String, default: 'catalogos.eliminar' }
})

const { can } = useAuth()
const toast = useToast()
const items = ref([])
const meta = ref({})
const links = ref({})
const perPage = ref(10)
const loading = ref(false)
const showModal = ref(false)
const selectedItem = ref(null)
const form = reactive({})

const api = useApi()

const fetchData = async (page = 1) => {
  loading.value = true
  try {
    const res = await api.get(props.endpoint, {
      params: { 
        page, 
        per_page: perPage.value,
        sort_by: 'name',
        sort_direction: 'asc'
      }
    })

    const body = res
    if (body.success && body.data) {
      const data = body.data
      
      // Casilla 1: Es una respuesta de "Resource Collection" (data: { data: [], links, meta })
      // Casilla 2: Es una respuesta de "Laravel Paginator" (data: { data: [], current_page, ... })
      if (data.data && Array.isArray(data.data)) {
        items.value = data.data
        
        // Extraer meta/links (Resource style)
        if (data.meta) {
          meta.value = data.meta
          links.value = data.links || {}
        } 
        // Extraer meta/links (Paginator style)
        else if (data.current_page !== undefined) {
          meta.value = {
            current_page: data.current_page,
            from: data.from,
            to: data.to,
            total: data.total,
            last_page: data.last_page,
            per_page: data.per_page
          }
          links.value = {
            prev: data.prev_page_url,
            next: data.next_page_url
          }
        }
      } 
      // Casilla 3: Es un arreglo simple (data: [])
      else if (Array.isArray(data)) {
        items.value = data
        meta.value = {}
        links.value = {}
      }
    } else {
      // Fallback si no hay estructura esperada
      items.value = Array.isArray(body) ? body : (body.data || [])
      meta.value = {}
      links.value = {}
    }
  } catch (err) {
    console.error('Error fetching catalog', err)
  } finally {
    loading.value = false
  }
}

const handlePerPageChange = (newSize) => {
  perPage.value = newSize
  fetchData(1)
}

const openModal = (item = null) => {
  selectedItem.value = item
  props.fields.forEach(f => {
    form[f.key] = item ? item[f.key] : ''
  })
  showModal.value = true
}

const save = async () => {
  const catalogs = useCatalogs()

  try {
    if (selectedItem.value) {
      await api.put(`${props.endpoint}/${selectedItem.value.id}`, form)
    } else {
      await api.post(props.endpoint, form)
    }

    // Limpiar caché global para que otros selects se actualicen
    if (catalogs.invalidateCache) {
      catalogs.invalidateCache()
    }

    showModal.value = false
    fetchData()
  } catch (err) {
    const msg = err?.data?.message || err?.message || 'Error al guardar el registro'
    toast.error(msg)
    console.error('Error saving catalog item', err)
  }
}

const showDeleteConfirm = ref(false)
const itemToDelete = ref(null)
const deleting = ref(false)

const deleteItem = (id) => {
  itemToDelete.value = id
  showDeleteConfirm.value = true
}

const onConfirmDelete = async () => {
  if (!itemToDelete.value) return

  deleting.value = true
  const catalogs = useCatalogs()

  try {
    await api.delete(`${props.endpoint}/${itemToDelete.value}`)
    
    // Invalidad caché global
    if (catalogs.invalidateCache) {
      catalogs.invalidateCache()
    }

    toast.success('Registro eliminado correctamente')
    fetchData()
  } catch (err) {
    const msg = err?.data?.message || err?.message || 'No se pudo eliminar el registro'
    toast.error(msg)
    console.error('Error deleting catalog item', err)
  } finally {
    deleting.value = false
    showDeleteConfirm.value = false
    itemToDelete.value = null
  }
}

defineExpose({ openModal })
onMounted(fetchData)
</script>

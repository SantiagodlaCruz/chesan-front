<template>
  <div class="space-y-6">
    <!-- Table -->
    <DataTable
      :columns="fields"
      :items="items"
      :loading="loading"
      show-actions
    >
      <template #actions="{ item }">
        <button @click="openModal(item)" class="p-1.5 hover:bg-yellow-500/10 rounded-xl transition-all group/btn" title="Editar">
          <EditIcon class="w-4 h-4 text-[#eab308] group-hover/btn:scale-110 transition-transform" />
        </button>
        <button @click="deleteItem(item.id)" class="p-1.5 hover:bg-red-500/10 rounded-xl transition-all group/btn" title="Eliminar">
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
          <input
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
import { useAuth } from '~/composables/useAuth'
import { useCatalogs } from '~/composables/useCatalogs'

const props = defineProps({
  endpoint: String,
  itemLabel: String,
  fields: Array
})

const toast = useToast()
const items = ref([])
const loading = ref(false)
const showModal = ref(false)
const selectedItem = ref(null)
const form = reactive({})

const fetchData = async () => {
  loading.value = true
  const config = useRuntimeConfig()
  const apiUrl = config.public.apiBaseUrl || 'http://127.0.0.1:8000'
  const auth = useAuth()

  try {
    const res = await $fetch(`${apiUrl}${props.endpoint}`, {
      headers: { Authorization: `Bearer ${auth.token}` }
    })
    items.value = res.data || res
  } catch (err) {
    console.error('Error fetching catalog', err)
  } finally {
    loading.value = false
  }
}

const openModal = (item = null) => {
  selectedItem.value = item
  props.fields.forEach(f => {
    form[f.key] = item ? item[f.key] : ''
  })
  showModal.value = true
}

const save = async () => {
  const config = useRuntimeConfig()
  const apiUrl = config.public.apiBaseUrl || 'http://127.0.0.1:8000'
  const auth = useAuth()
  const catalogs = useCatalogs()

  try {
    const method = selectedItem.value ? 'PUT' : 'POST'
    const url = selectedItem.value
      ? `${apiUrl}${props.endpoint}/${selectedItem.value.id}`
      : `${apiUrl}${props.endpoint}`

    await $fetch(url, {
      method,
      headers: { Authorization: `Bearer ${auth.token}` },
      body: form
    })

    // Limpiar caché global para que otros selects se actualicen
    catalogs.invalidateCache()

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
  const config = useRuntimeConfig()
  const apiUrl = config.public.apiBaseUrl || 'http://127.0.0.1:8000'
  const auth = useAuth()
  const catalogs = useCatalogs()

  try {
    await $fetch(`${apiUrl}${props.endpoint}/${itemToDelete.value}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${auth.token}` }
    })
    
    // Invalidad caché global
    catalogs.invalidateCache()

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

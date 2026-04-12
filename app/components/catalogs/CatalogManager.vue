<template>
  <div class="space-y-6">
    <!-- Table -->
    <DataTable 
      :columns="fields"
      :items="items"
      :loading="loading"
      @edit="openModal"
      @delete="(item) => deleteItem(item.id)"
    />

    <!-- Modal -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="showModal = false"></div>
          <div class="relative bg-white dark:bg-[#0f172a] w-full max-w-lg rounded-2xl shadow-2xl border border-border-light dark:border-border-dark p-8">
            <h4 class="text-xl font-black mb-6 dark:text-white">
              {{ selectedItem ? 'Editar' : 'Añadir' }} {{ itemLabel }}
            </h4>
            
            <form @submit.prevent="save" class="space-y-4">
              <div v-for="field in fields" :key="field.key" class="flex flex-col gap-1.5">
                <label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">{{ field.label }}</label>
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
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import DataTable from '~/components/DataTable.vue'

const props = defineProps({
  endpoint: String,
  itemLabel: String,
  fields: Array
})

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
    
    showModal.value = false
    fetchData()
  } catch (err) {
    console.error('Error saving catalog item', err)
  }
}

const deleteItem = async (id) => {
  if (!confirm('¿Estás seguro de eliminar este registro?')) return
  
  const config = useRuntimeConfig()
  const apiUrl = config.public.apiBaseUrl || 'http://127.0.0.1:8000'
  const auth = useAuth()
  
  try {
    await $fetch(`${apiUrl}${props.endpoint}/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${auth.token}` }
    })
    fetchData()
  } catch (err) {
    console.error('Error deleting catalog item', err)
  }
}

defineExpose({ openModal })
onMounted(fetchData)
</script>

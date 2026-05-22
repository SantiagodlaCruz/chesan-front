<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap justify-between items-center gap-4 mb-2">
      <div class="flex items-center gap-6 grow">
        <h2 class="text-2xl font-black tracking-tight text-slate-800 dark:text-slate-100 whitespace-nowrap">Materia prima</h2>
        
        <!-- Barrita de búsqueda compacta junto al título -->
        <div class="relative max-w-md w-full">
           <SearchIcon class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
           <input 
            v-model="searchQuery" 
            class="w-full bg-white dark:bg-card-dark border border-border-light dark:border-border-dark focus:border-primary transition-all outline-none pl-9 pr-4 py-2 rounded-xl text-sm font-medium placeholder:text-slate-400 text-slate-900 dark:text-slate-100 shadow-sm" 
            placeholder="Buscar material o escanear código de barras..." 
            type="text" 
           />
        </div>
      </div>

      <div class="flex items-center gap-2 shrink-0">
        <button 
          v-if="can('materia_prima.editar')"
          @click="showOutflowModal = true" 
          class="bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all"
        >
          <ArrowUpFromLineIcon class="w-5 h-5" />
          Registrar salida
        </button>

        <button 
          v-if="can('materia_prima.crear')"
          @click="triggerAdd = true" 
          class="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-primary/20 shrink-0"
        >
          <PlusIcon class="w-5 h-5" />
          Añadir material
        </button>
      </div>
    </div>

    <RawMaterialTab v-model:showModalTrigger="triggerAdd" :search="searchQuery" ref="rawMaterialTab" />

    <OutflowRawMaterialModal
      v-model:show="showOutflowModal"
      @saved="onOutflowSaved"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { PlusIcon, SearchIcon, ArrowUpFromLineIcon } from 'lucide-vue-next'
import RawMaterialTab from '~/components/inventory/RawMaterialTab.vue'
import OutflowRawMaterialModal from '~/components/inventory/OutflowRawMaterialModal.vue'

const auth = useAuth()
const { can } = auth
const triggerAdd = ref(false)
const searchQuery = ref('')
const showOutflowModal = ref(false)
const rawMaterialTab = ref(null)

const onOutflowSaved = () => {
  // Trigger a refresh on the RawMaterialTab by toggling a dummy prop
  triggerAdd.value = false
  // Force refetch by directly accessing the child's method via template ref
  // The tab watches showModalTrigger, but we just need to refetch data
  // We'll trigger it by briefly setting and unsetting searchQuery or emitting
  const current = searchQuery.value
  searchQuery.value = current + ' '
  nextTick(() => {
    searchQuery.value = current
  })
}

definePageMeta({
  layout: 'default'
})
</script>


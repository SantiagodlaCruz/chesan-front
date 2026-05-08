<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap justify-between items-center gap-4 mb-2">
      <div class="flex items-center gap-6 grow">
        <h2 class="text-2xl font-black tracking-tight text-slate-800 dark:text-slate-100 whitespace-nowrap">Productos</h2>
        
        <!-- Barrita de búsqueda compacta junto al título -->
        <div class="relative max-w-md w-full">
           <SearchIcon class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
           <input 
            v-model="searchQuery" 
            class="w-full bg-white dark:bg-card-dark border border-border-light dark:border-border-dark focus:border-primary transition-all outline-none pl-9 pr-4 py-2 rounded-xl text-sm font-medium placeholder:text-slate-400 text-slate-900 dark:text-slate-100 shadow-sm" 
            placeholder="Buscar por nombre o escanear código..." 
            type="text" 
           />
        </div>
      </div>

      <div class="flex items-center gap-3 shrink-0">
        <button 
          v-if="can('inventario.editar')"
          @click="triggerDiscount = true" 
          class="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 border border-red-200 dark:border-red-500/30 px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><line x1="19" x2="5" y1="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>
          Configurar descuento
        </button>

        <button 
          v-if="can('inventario.crear')"
          @click="triggerAdd = true" 
          class="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-primary/20 shrink-0"
        >
          <PlusIcon class="w-5 h-5" />
          Añadir producto
        </button>
      </div>
    </div> <!-- Contenedor flex wrap restaurado -->

    <ProductTab v-model:showModalTrigger="triggerAdd" :search="searchQuery" ref="productTabRef" />
    <ApplyDiscountModal v-model:show="triggerDiscount" @saved="onDiscountSaved" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { PlusIcon, SearchIcon } from 'lucide-vue-next'
import ProductTab from '~/components/inventory/ProductTab.vue'
import ApplyDiscountModal from '~/components/inventory/ApplyDiscountModal.vue'

const auth = useAuth()
const { can } = auth
const triggerAdd = ref(false)
const triggerDiscount = ref(false)
const searchQuery = ref('')
const productTabRef = ref(null)

const onDiscountSaved = () => {
    // Refrescar tabla en background
    if (productTabRef.value && typeof productTabRef.value.fetchData === 'function') {
         productTabRef.value.fetchData()
    }
}

definePageMeta({
  layout: 'default'
})
</script>

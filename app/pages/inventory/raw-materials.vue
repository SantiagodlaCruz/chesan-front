<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap justify-between items-center gap-4 mb-2">
      <div class="flex items-center gap-6 grow">
        <h2 class="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap">Materia Prima</h2>
        
        <!-- Barrita de búsqueda compacta junto al título -->
        <div class="relative max-w-md w-full">
           <SearchIcon class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
           <input 
            v-model="searchQuery" 
            class="w-full bg-white dark:bg-card-dark border border-border-light dark:border-border-dark focus:border-primary transition-all outline-none pl-9 pr-4 py-2 rounded-xl text-sm font-medium placeholder:text-slate-400 text-slate-900 dark:text-slate-100 shadow-sm" 
            placeholder="Buscar material..." 
            type="text" 
           />
        </div>
      </div>

      <button @click="triggerAdd = true" class="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-primary/20 shrink-0">
        <PlusIcon class="w-5 h-5" />
        Añadir Material
      </button>
    </div>

    <RawMaterialTab v-model:showModalTrigger="triggerAdd" :search="searchQuery" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { PlusIcon, SearchIcon } from 'lucide-vue-next'
import RawMaterialTab from '~/components/inventory/RawMaterialTab.vue'

const triggerAdd = ref(false)
const searchQuery = ref('')

definePageMeta({
  layout: 'default'
})
</script>

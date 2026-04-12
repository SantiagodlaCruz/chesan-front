<template>
  <div class="flex flex-col gap-6">
    <!-- Main Header -->
    <div class="flex flex-wrap justify-between items-start gap-4">
      <div class="space-y-1">
        <h2 class="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">Catálogos</h2>
        <p class="text-sm text-slate-500 dark:text-slate-400">Datos maestros para la gestión del sistema.</p>
      </div>
      
      <button 
        @click="triggerAdd" 
        class="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-primary/20 shrink-0"
      >
        <PlusIcon class="w-5 h-5" />
        Nuevo {{ currentTabLabel }}
      </button>
    </div>

    <!-- Navigation Tabs -->
    <div class="flex gap-1.5 p-1.5 bg-slate-100 dark:bg-card-dark rounded-[14px] w-fit border border-border-light dark:border-border-dark shadow-sm relative z-20">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        @click="activeTab = tab.id"
        :class="activeTab === tab.id ? 'bg-white dark:bg-white/10 shadow-sm text-primary font-bold' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-white/5 font-medium'"
        class="px-5 py-2 rounded-lg text-sm transition-all flex items-center gap-2"
      >
        <component :is="tab.icon" class="w-4 h-4" />
        {{ tab.label }}
      </button>
    </div>

    <!-- Manager Component (rendered conditionally or with dynamic props) -->
    <div class="mt-2">
      <div v-if="activeTab === 'categories'">
        <CatalogManager 
          ref="categoriesMgr"
          item-label="Categoría"
          endpoint="/api/categories"
          :fields="[
            { key: 'name', label: 'Nombre', type: 'text', required: true, placeholder: 'Ej. Playeras' },
            { key: 'description', label: 'Descripción', type: 'text', placeholder: 'Descripción opcional' }
          ]"
        />
      </div>
      
      <div v-if="activeTab === 'institutions'">
        <CatalogManager 
          ref="institutionsMgr"
          item-label="Escuela"
          endpoint="/api/clients/institutions"
          :fields="[
            { key: 'name', label: 'Nombre de la Escuela', type: 'text', required: true, placeholder: 'Ej. Colegio Americano' },
            { key: 'email', label: 'Email', type: 'email' },
            { key: 'phone', label: 'Teléfono', type: 'tel' }
          ]"
        />
      </div>

      <div v-if="activeTab === 'colors'">
        <CatalogManager 
          ref="colorsMgr"
          item-label="Color"
          endpoint="/api/colors"
          :fields="[
            { key: 'name', label: 'Nombre del Color', type: 'text', required: true, placeholder: 'Ej. Azul Marino' },
            { key: 'hex_code', label: 'Código Hex (Opcional)', type: 'text', placeholder: '#0000FF' }
          ]"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { TagIcon, SchoolIcon, PaletteIcon, PlusIcon } from 'lucide-vue-next'
import CatalogManager from '~/components/catalogs/CatalogManager.vue'

const activeTab = ref('categories')

// Component refs to trigger openModal
const categoriesMgr = ref(null)
const institutionsMgr = ref(null)
const colorsMgr = ref(null)

const tabs = [
  { id: 'categories', label: 'Categorías', icon: TagIcon },
  { id: 'institutions', label: 'Escuelas', icon: SchoolIcon },
  { id: 'colors', label: 'Colores', icon: PaletteIcon }
]

const currentTabLabel = computed(() => {
  return tabs.find(t => t.id === activeTab.value)?.label.slice(0, -1) || 'Registro'
})

const triggerAdd = () => {
  if (activeTab.value === 'categories') categoriesMgr.value?.openModal()
  if (activeTab.value === 'institutions') institutionsMgr.value?.openModal()
  if (activeTab.value === 'colors') colorsMgr.value?.openModal()
}

definePageMeta({
  layout: 'default'
})
</script>

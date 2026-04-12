<template>
  <div class="bg-white dark:bg-card-dark rounded-2xl border border-border-light dark:border-border-dark shadow-sm">
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse min-w-[800px]">
        <thead>
          <tr class="bg-panel-light dark:bg-white/5 border-b border-border-light dark:border-border-dark">
            <th 
              v-for="col in columns" 
              :key="col.key" 
              class="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider transition-all whitespace-nowrap"
              :class="{
                'text-left': col.align === 'left' || !col.align,
                'text-right': col.align === 'right',
                'text-center': col.align === 'center'
              }"
            >
              {{ col.label }}
            </th>
            <th v-if="showActions" class="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right whitespace-nowrap">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-border-light dark:divide-border-dark relative">
          <!-- Loading Skeletons -->
          <tr v-if="loading">
            <td :colspan="columns.length + (showActions ? 1 : 0)" class="p-0">
              <div v-for="n in 5" :key="n" class="flex gap-4 px-4 py-3 animate-pulse border-b border-border-light dark:border-border-dark last:border-0">
                <div v-for="col in columns.length + (showActions ? 1 : 0)" :key="col" class="h-4 bg-slate-200 dark:bg-white/5 rounded flex-1"></div>
              </div>
            </td>
          </tr>

          <!-- Error / Empty -->
          <tr v-else-if="errorMsg">
            <td :colspan="columns.length + (showActions ? 1 : 0)" class="px-6 py-12 text-center">
              <AlertCircleIcon class="w-10 h-10 text-accent-red mx-auto mb-3" />
              <p class="text-sm font-bold text-slate-800 dark:text-slate-200">Error al cargar datos</p>
              <p class="text-xs text-accent-red mt-1">{{ errorMsg }}</p>
            </td>
          </tr>
          
          <tr v-else-if="items.length === 0">
            <td :colspan="columns.length + (showActions ? 1 : 0)" class="px-6 py-12 text-center text-slate-400">
              No se encontraron registros.
            </td>
          </tr>

          <!-- Data Rows -->
          <template v-else>
            <tr v-for="item in items" :key="item.id" class="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
              <td 
                v-for="col in columns" 
                :key="col.key" 
                class="px-4 py-2.5 text-sm transition-all"
                :class="{
                  'text-left': col.align === 'left' || !col.align,
                  'text-right': col.align === 'right',
                  'text-center': col.align === 'center'
                }"
              >
                <!-- Custom Slot for the column -->
                <slot :name="`cell-${col.key}`" :item="item" :value="item[col.key]">
                  <span class="text-slate-600 dark:text-slate-300">{{ item[col.key] || '---' }}</span>
                </slot>
              </td>

              <!-- Generic Actions Slot -->
              <td v-if="showActions" class="px-4 py-2.5 whitespace-nowrap">
                <div class="flex items-center gap-1 justify-end">
                  <slot name="actions" :item="item">
                    <button @click="$emit('edit', item)" class="p-1.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors" title="Editar">
                      <EditIcon class="w-4 h-4 text-[#eab308]" />
                    </button>
                    <button @click="$emit('delete', item)" class="p-1.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors" title="Eliminar">
                      <TrashIcon class="w-4 h-4 text-accent-red" />
                    </button>
                  </slot>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <!-- Pagination Footer -->
    <div v-if="meta" class="px-4 py-2 bg-panel-light dark:bg-white/5 border-t border-border-light dark:border-border-dark flex items-center justify-between">
      <div class="flex items-center gap-4">
        <p class="text-[11px] text-slate-500 font-medium">
          Mostrando {{ meta.from || 0 }}-{{ meta.to || 0 }} de {{ meta.total }}
        </p>
        <div class="flex items-center gap-2 border-l border-slate-200 dark:border-slate-800 pl-4">
          <span class="text-[10px] uppercase font-bold text-slate-400 tracking-tight">Ver:</span>
          <Select 
            :model-value="perPage" 
            :options="[1, 5, 10, 20, 50, 100, 300, 500].map(n => ({ label: n, value: n }))"
            compact
            @update:model-value="$emit('per-page-change', $event)"
          />
        </div>
        <slot name="footer-left" />
      </div>

      <div class="flex items-center gap-1.5">
        <button 
          :disabled="!links?.prev"
          @click="meta && meta.current_page && $emit('page-change', meta.current_page - 1)"
          class="p-2 rounded-xl bg-white dark:bg-card-dark border border-border-light dark:border-border-dark hover:bg-slate-100 dark:hover:bg-white/5 disabled:opacity-30 transition-all hover:text-primary"
        >
          <ChevronLeftIcon class="w-4 h-4" />
        </button>

        <!-- Page Numbers -->
        <div class="flex items-center gap-1 mx-1">
          <template v-for="page in visiblePages" :key="page">
            <button 
              v-if="page !== '...'"
              @click="$emit('page-change', page)"
              :class="[
                'min-w-[32px] h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all',
                meta.current_page === page 
                  ? 'bg-primary text-white shadow-lg shadow-primary/25' 
                  : 'bg-white dark:bg-card-dark border border-border-light dark:border-border-dark text-slate-600 dark:text-slate-400 hover:border-primary hover:text-primary'
              ]"
            >
              {{ page }}
            </button>
            <span v-else class="px-1 text-slate-400 text-xs">...</span>
          </template>
        </div>

        <button 
          :disabled="!links?.next"
          @click="meta && meta.current_page && $emit('page-change', meta.current_page + 1)"
          class="p-2 rounded-xl bg-white dark:bg-card-dark border border-border-light dark:border-border-dark hover:bg-slate-100 dark:hover:bg-white/5 disabled:opacity-30 transition-all hover:text-primary"
        >
          <ChevronRightIcon class="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T extends Record<string, any>">
import { computed } from 'vue'
import { EditIcon, TrashIcon, ChevronLeftIcon, ChevronRightIcon, AlertCircleIcon } from 'lucide-vue-next'
import Select from '~/components/Select.vue'
import type { ApiMeta, ApiLinks } from '~/types'

interface Column {
  key: string
  label: string
  align?: 'left' | 'right' | 'center'
}

const props = defineProps<{
  columns: Column[]
  items: T[]
  loading?: boolean
  errorMsg?: string
  meta?: Partial<ApiMeta>
  links?: Partial<ApiLinks>
  perPage?: number | string
  showActions?: boolean
}>()

defineEmits(['edit', 'delete', 'page-change', 'per-page-change'])

// Advanced Pagination Logic
const visiblePages = computed(() => {
  if (!props.meta || !props.meta.current_page || !props.meta.last_page) return []
  
  const current_page = Number(props.meta.current_page)
  const last_page = Number(props.meta.last_page)
  const pages = []
  
  if (last_page <= 1) return [1]
  
  if (last_page <= 5) {
    for (let i = 1; i <= last_page; i++) pages.push(i)
  } else {
    // Principal logic for more than 5 pages
    if (current_page <= 3) {
      pages.push(1, 2, 3, 4, '...', last_page)
    } else if (current_page >= last_page - 2) {
      pages.push(1, '...', last_page - 3, last_page - 2, last_page - 1, last_page)
    } else {
      pages.push(1, '...', current_page - 1, current_page, current_page + 1, '...', last_page)
    }
  }
  
  return pages
})
</script>

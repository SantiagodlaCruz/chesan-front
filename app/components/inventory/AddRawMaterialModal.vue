<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-slate-900/40 dark:bg-blue-950/40 backdrop-blur-sm" @click="close"></div>
        
        <div class="relative bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-xl w-full max-w-2xl rounded-2xl shadow-2xl border border-border-light dark:border-[#1e293b] overflow-hidden flex flex-col max-h-[90vh] dark:shadow-blue-900/10">
          
          <div class="px-8 py-6 border-b border-border-light dark:border-[#1e293b] flex justify-between items-start shrink-0">
            <div>
              <h2 class="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Añadir Nueva Materia Prima</h2>
              <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Registre nuevo material en el inventario.</p>
            </div>
            <button @click="close" class="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors text-slate-400">
              <XIcon class="w-5 h-5" />
            </button>
          </div>

          <div class="p-8 overflow-y-auto custom-scrollbar">
            <form @submit.prevent="submit" class="space-y-6">
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Nombre</label>
                <input v-model="form.name" class="w-full bg-slate-50 dark:bg-[#1e293b] border-2 border-transparent focus:border-primary transition-all outline-none px-4 py-3 rounded-xl text-sm font-medium placeholder:text-slate-400 text-slate-900 dark:text-slate-100" placeholder="Ej. Tela Gabardina Azul" type="text" required/>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div class="flex flex-col gap-1.5">
                  <label class="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Unidad de Medida</label>
                  <Select v-model="form.unit_measure" :options="unidades" placeholder="Seleccionar..." />
                </div>
                <div class="flex flex-col gap-1.5">
                  <label class="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Cantidad Inicial</label>
                  <input v-model="form.quantity" class="w-full bg-slate-50 dark:bg-[#1e293b] border-2 border-transparent focus:border-primary transition-all outline-none px-4 py-3 rounded-xl text-sm font-medium placeholder:text-slate-400 text-slate-900 dark:text-slate-100" placeholder="150" type="number" required/>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div class="flex flex-col gap-1.5">
                  <label class="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Precio Unitario</label>
                  <input v-model="form.unit_price" class="w-full bg-slate-50 dark:bg-[#1e293b] border-2 border-transparent focus:border-primary transition-all outline-none px-4 py-3 rounded-xl text-sm font-medium placeholder:text-slate-400 text-slate-900 dark:text-slate-100" placeholder="45.50" type="number" step="0.01" required/>
                </div>
                <div class="flex flex-col gap-1.5">
                  <label class="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Umbral Mínimo</label>
                  <input v-model="form.min_threshold" class="w-full bg-slate-50 dark:bg-[#1e293b] border-2 border-transparent focus:border-primary transition-all outline-none px-4 py-3 rounded-xl text-sm font-medium placeholder:text-slate-400 text-slate-900 dark:text-slate-100" placeholder="20" type="number" required/>
                </div>
              </div>

              <div class="flex items-center justify-end gap-3 pt-4 mt-6 border-t border-border-light dark:border-[#1e293b]">
                <BaseButton type="button" variant="secondary" :full="false" @click="close">
                  Cancelar
                </BaseButton>
                <BaseButton type="submit" variant="primary" :full="false">
                  Guardar Material
                </BaseButton>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { XIcon } from 'lucide-vue-next'
import BaseButton from '~/components/BaseButton.vue'
import type { SelectOption } from '~/types'

const props = defineProps<{
  show: boolean
  unidades: SelectOption[]
}>()

const emit = defineEmits(['update:show', 'saved'])

const form = reactive({
  name: '',
  unit_measure: '',
  quantity: 0,
  unit_price: null as number | null,
  min_threshold: 0
})

const resetForm = () => {
  form.name = ''
  form.unit_measure = ''
  form.quantity = 0
  form.unit_price = null
  form.min_threshold = 0
}

watch(() => props.show, (newVal) => {
  if (newVal) resetForm()
})

const close = () => {
  emit('update:show', false)
}

const submit = () => {
  emit('saved', { ...form })
  close()
}
</script>

<template>
  <BaseModal
    :show="show"
    title="Añadir Nueva Materia Prima"
    subtitle="Registre nuevo material en el inventario."
    size="xl"
    @update:show="close"
  >
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
  </BaseModal>
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

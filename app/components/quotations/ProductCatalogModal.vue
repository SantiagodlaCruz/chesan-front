<template>
  <BaseModal
    :show="show"
    :title="form.id ? 'Editar Producto del Catálogo' : 'Nuevo Producto'"
    subtitle="Configure los datos maestros del producto."
    size="md"
    @update:show="close"
  >
    <form @submit.prevent="onSubmit" class="space-y-4">
      <div class="flex flex-col gap-1.5">
        <label class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] ml-1 transition-colors">Nombre del producto</label>
        <input 
          v-model="form.name" 
          placeholder="Ej. PLAYERA TIPO POLO CUELLO RAYAS"
          class="w-full bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-primary transition-all outline-none px-4 py-2.5 rounded-xl text-sm font-bold dark:text-slate-100"
          required
        />
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div class="flex flex-col gap-1.5">
          <label class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] ml-1 transition-colors">Precio Base</label>
          <div class="relative">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
            <input 
              v-model.number="form.base_price" 
              type="number" step="0.01"
              class="w-full bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-primary transition-all outline-none pl-7 pr-4 py-2 rounded-xl text-sm font-bold dark:text-slate-100"
              required
            />
          </div>
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-[10px] font-bold text-primary uppercase tracking-[0.2em] ml-1 transition-colors">Mínimo Mayoreo</label>
          <input 
            v-model.number="form.wholesale_min_quantity" 
            type="number"
            class="w-full bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-primary transition-all outline-none px-4 py-2 rounded-xl text-sm font-black text-primary dark:bg-primary/5"
            required
          />
        </div>
      </div>

      <div class="flex items-center justify-end gap-3 pt-6 border-t border-slate-100 dark:border-white/5">
        <BaseButton type="button" variant="secondary" @click="close">
          Cancelar
        </BaseButton>
        <BaseButton type="submit" variant="primary" :loading="saving">
          {{ form.id ? 'Guardar cambios' : 'Crear producto' }}
        </BaseButton>
      </div>
    </form>
  </BaseModal>
</template>

<script setup>
import { reactive, watch } from 'vue'
import BaseModal from '~/components/BaseModal.vue'
import BaseButton from '~/components/BaseButton.vue'
import { useToast } from '~/stores/toast'

const props = defineProps({
  show: Boolean,
  item: Object
})

const emit = defineEmits(['update:show', 'saved'])

const api = useApi()
const toast = useToast()
const saving = ref(false)

const form = reactive({
  id: null,
  name: '',
  base_price: 0,
  wholesale_min_quantity: 25
})

const resetForm = () => {
  form.id = null
  form.name = ''
  form.base_price = 0
  form.wholesale_min_quantity = 25
}

watch(() => props.item, (newVal) => {
  if (newVal) {
    form.id = newVal.id
    form.name = newVal.name
    form.base_price = newVal.base_price
    form.wholesale_min_quantity = newVal.wholesale_min_quantity
  } else {
    resetForm()
  }
}, { immediate: true })

const onSubmit = async () => {
  try {
    saving.value = true
    if (form.id) {
      await api.put(`/api/product-catalogs/${form.id}`, form)
    } else {
      await api.post('/api/product-catalogs', form)
    }
    toast.success('Producto guardado correctamente')
    emit('saved')
    close()
  } catch (err) {
    toast.error('Error al guardar producto')
  } finally {
    saving.value = false
  }
}

const close = () => emit('update:show', false)
</script>

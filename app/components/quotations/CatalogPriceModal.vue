<template>
  <BaseModal
    :show="show"
    title="Nueva variación de precio"
    subtitle="Agregue materiales y rangos de tallas al catálogo de venta."
    size="lg"
    @update:show="close"
  >
    <form @submit.prevent="onSubmit" class="space-y-4">
      <div class="flex flex-col gap-1.5">
        <label class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] ml-1 transition-colors">Producto del catálogo</label>
        <Select 
          v-model="form.product_catalog_id" 
          :options="productOptions" 
          placeholder="Seleccionar producto..." 
          required
        />
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div class="flex flex-col gap-1.5">
          <label class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] ml-1 transition-colors">Material / variación</label>
          <input 
            v-model="form.material" 
            placeholder="Ej. Piqué Blanco"
            class="w-full bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-primary transition-all outline-none px-4 py-2 rounded-xl text-sm font-medium"
            required
          />
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] ml-1 transition-colors">Rango de tallas</label>
          <input 
            v-model="form.size_range" 
            placeholder="Ej. 6-10"
            class="w-full bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-primary transition-all outline-none px-4 py-2 rounded-xl text-sm font-medium"
            required
          />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div class="flex flex-col gap-1.5">
          <label class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] ml-1 transition-colors">Precio menudeo</label>
          <div class="relative">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
            <input 
              v-model.number="form.retail_price" 
              type="number" step="0.01"
              class="w-full bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-primary transition-all outline-none pl-7 pr-4 py-2 rounded-xl text-sm font-bold"
              required
            />
          </div>
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-[10px] font-bold text-primary uppercase tracking-[0.2em] ml-1 transition-colors">Precio mayoreo (>=25)</label>
          <div class="relative">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-primary/50">$</span>
            <input 
              v-model.number="form.wholesale_price" 
              type="number" step="0.01"
              class="w-full bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-primary transition-all outline-none pl-7 pr-4 py-2 rounded-xl text-sm font-black text-primary"
              required
            />
          </div>
        </div>
      </div>

      <div class="flex items-center justify-end gap-3 pt-6 border-t border-slate-100 dark:border-white/5">
        <BaseButton type="button" variant="secondary" @click="close">
          Cancelar
        </BaseButton>
        <BaseButton type="submit" variant="primary" :loading="saving">
          Guardar variación
        </BaseButton>
      </div>
    </form>
  </BaseModal>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import BaseModal from '~/components/BaseModal.vue'
import BaseButton from '~/components/BaseButton.vue'
import Select from '~/components/Select.vue'
import { useToast } from '~/stores/toast'

const props = defineProps({
  show: Boolean,
  products: Array
})

const emit = defineEmits(['update:show', 'saved'])

const api = useApi()
const toast = useToast()
const saving = ref(false)

const productOptions = computed(() => {
  return props.products.map(p => ({ value: p.id, label: p.name }))
})

const form = reactive({
  product_catalog_id: '',
  material: '',
  size_range: '',
  retail_price: 0,
  wholesale_price: 0
})

const onSubmit = async () => {
  try {
    saving.value = true
    await api.post('/api/catalog-prices', form)
    toast.success('Variación guardada correctamente')
    emit('saved')
    close()
    resetForm()
  } catch (err) {
    toast.error('Error al guardar variación')
  } finally {
    saving.value = false
  }
}

const resetForm = () => {
  form.material = ''
  form.size_range = ''
  form.retail_price = 0
  form.wholesale_price = 0
}

const close = () => emit('update:show', false)
</script>

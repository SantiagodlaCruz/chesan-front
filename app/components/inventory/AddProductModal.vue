<template>
  <BaseModal
    :show="show"
    :title="itemToEdit ? 'Editar Producto' : 'Añadir Nuevo Producto'"
    :subtitle="itemToEdit ? 'Modifique los detalles generales y de stock del producto.' : 'Configure el producto y sus diferentes variantes (tallas/colores).'"
    size="4xl"
    @update:show="close"
  >
    <form @submit.prevent="submit" class="space-y-8">
      <!-- General Info -->
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8 pb-8 border-b border-dashed border-slate-200 dark:border-slate-800">
        <!-- Product Photo -->
        <div class="lg:col-span-1">
          <ImageUpload 
            v-model="form.image" 
            label="Imagen Referencial" 
            :initial-preview="form.image_url"
            :readonly="readonly"
          />
        </div>

        <!-- Basic Details -->
        <div class="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div class="md:col-span-2">
            <BaseInput 
              v-model="form.name" 
              label="Nombre Base del Producto" 
              placeholder="" 
              required 
              :disabled="readonly"
            />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Categoría</label>
            <Select v-model="form.category_id" :options="categorias" placeholder="Seleccionar" searchable :loading="useCatalogs().loading" :disabled="readonly" />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Escuela</label>
            <Select v-model="form.institution_id" :options="instituciones" placeholder="Seleccionar" searchable :loading="useCatalogs().loading" :disabled="readonly" />
          </div>
        </div>
      </div>

      <!-- Variants Section -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">Variantes y Stock</h3>
          <button v-if="!itemToEdit && !readonly" type="button" @click="addVariant" class="text-xs font-bold text-primary hover:text-primary/80 flex items-center gap-1.5 transition-colors">
            <PlusIcon class="w-4 h-4" />
            Añadir otra variante
          </button>
        </div>

        <div class="bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-100 dark:bg-white/5 text-slate-500 font-bold uppercase tracking-widest shadow-sm border-b border-slate-200 dark:border-slate-800 text-[10px] whitespace-nowrap">
                <th class="px-4 py-3 min-w-[180px]">Color</th>
                <th class="px-4 py-3 w-20">Talla</th>
                <th class="px-4 py-3 w-24">P. PRODUCCIÓN</th>
                <th class="px-4 py-3 w-24">P. VENTA</th>
                <th class="px-4 py-3 w-28 text-center">Stock Initial</th>
                <th v-if="!itemToEdit && !readonly" class="px-4 py-3 w-10 text-center"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 dark:divide-slate-800">
              <tr v-for="(v, idx) in form.variants" :key="idx" class="group transition-colors">
                <td class="px-2 py-2">
                  <Select v-model="v.color" :options="colores" placeholder="Color" searchable compact direction="down" creatable :loading="useCatalogs().loading" :disabled="readonly" />
                </td>
                <td class="px-2 py-2">
                  <input v-model="v.size" class="w-full bg-transparent border-b-2 border-transparent focus:border-primary transition-all outline-none px-2 py-1.5 font-medium text-slate-900 dark:text-slate-100 uppercase placeholder:normal-case disabled:opacity-70" placeholder="Talla" type="text" required :disabled="readonly" />
                </td>
                <td class="px-2 py-2">
                  <div class="relative">
                    <span class="absolute left-0 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                    <input v-model="v.production_price" class="w-full bg-transparent border-b-2 border-transparent focus:border-primary transition-all outline-none pl-3 pr-2 py-1.5 font-medium text-slate-900 dark:text-slate-100 disabled:opacity-70" type="number" step="0.01" required :disabled="readonly" />
                  </div>
                </td>
                <td class="px-2 py-2">
                  <div class="relative">
                    <span class="absolute left-0 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                    <input v-model="v.sale_price" class="w-full bg-transparent border-b-2 border-transparent focus:border-primary transition-all outline-none pl-3 pr-2 py-1.5 font-medium text-slate-900 dark:text-slate-100 disabled:opacity-70" type="number" step="0.01" required :disabled="readonly" />
                  </div>
                </td>
                <td class="px-2 py-2 text-center">
                  <input v-model="v.quantity" class="w-full text-center bg-transparent border-b-2 border-transparent focus:border-primary transition-all outline-none px-2 py-1.5 font-bold text-slate-900 dark:text-slate-100 disabled:opacity-70" type="number" required :disabled="readonly" />
                </td>
                <td v-if="!itemToEdit && !readonly" class="px-2 py-2 text-center">
                  <button v-if="form.variants.length > 1" type="button" @click="removeVariant(idx)" class="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all">
                    <TrashIcon class="w-4 h-4" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-if="!itemToEdit" class="text-[10px] text-slate-400 italic px-2">
          * Al guardar, cada variante se creará como un registro independiente en el inventario.
        </p>
      </div>

      <div class="flex items-center justify-end gap-3 pt-4 mt-6 border-t border-border-light dark:border-[#1e293b]">
        <BaseButton type="button" variant="secondary" :full="false" @click="close" :disabled="saving">
          {{ readonly ? 'Cerrar' : 'Cancelar' }}
        </BaseButton>
        <BaseButton 
          v-if="!readonly"
          type="submit" 
          variant="primary" 
          :full="false" 
          class="min-w-[140px]"
          :loading="saving"
          loading-text="Guardando..."
        >
          {{ itemToEdit ? 'Actualizar Producto' : 'Guardar Todo (' + form.variants.length + ')' }}
        </BaseButton>
      </div>
    </form>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { XIcon, PlusIcon, TrashIcon, ImageIcon } from 'lucide-vue-next'
import BaseButton from '~/components/BaseButton.vue'
import Select from '~/components/Select.vue'
import ImageUpload from '~/components/ImageUpload.vue'
import type { StockProduct, SelectOption } from '~/types'

const props = defineProps<{
  show: boolean
  categorias: SelectOption[]
  instituciones: SelectOption[]
  colores: SelectOption[]
  itemToEdit: StockProduct | null
  readonly?: boolean
}>()

const emit = defineEmits(['update:show', 'saved'])

interface ProductVariant {
  color: string
  size: string
  production_price: number | null
  sale_price: number | null
  quantity: number
}

const form = reactive<{
  id: number | null
  name: string
  category_id: string | number
  institution_id: string | number
  image: File | null
  image_url: string
  variants: ProductVariant[]
}>({
  id: null,
  name: '',
  category_id: '',
  institution_id: '',
  image: null,
  image_url: '',
  variants: []
})

const addVariant = () => {
  // Try to inherit prices from previous variant if exists
  const last = form.variants[form.variants.length - 1]
  form.variants.push({
    color: last?.color || '',
    size: '',
    production_price: last?.production_price || null,
    sale_price: last?.sale_price || null,
    quantity: last?.quantity || 1
  })
}

const removeVariant = (idx: number) => {
  form.variants.splice(idx, 1)
}

const resetForm = () => {
  form.id = null
  form.name = ''
  form.category_id = ''
  form.institution_id = ''
  form.image = null
  form.image_url = ''
  form.variants = [
    { color: '', size: '', production_price: null, sale_price: null, quantity: 1 }
  ]
}

watch(() => props.show, (newVal) => {
  if (newVal) {
    if (props.itemToEdit) {
      Object.assign(form, {
        id: props.itemToEdit.id,
        name: props.itemToEdit.name || '',
        category_id: props.itemToEdit.category_id || '',
        institution_id: props.itemToEdit.institution_id || '',
        image: null,
        image_url: props.itemToEdit.image_url || '',
        variants: [
          { 
            color: props.itemToEdit.color || '', 
            size: props.itemToEdit.size || '', 
            production_price: props.itemToEdit.production_price || null, 
            sale_price: props.itemToEdit.sale_price || null, 
            quantity: props.itemToEdit.quantity || 0 
          }
        ]
      })
    } else {
      resetForm()
    }
  }
})

const inventoryStore = useInventoryStore()
const toast = useToast()
const saving = ref(false)

const close = () => {
  if (saving.value) return
  emit('update:show', false)
}

const submit = async () => {
  try {
    saving.value = true
    
    // Preparar el payload
    const { image_url, ...payload } = form
    
    // Si estamos editando, traemos los datos de la primera variante al objeto principal
    if (form.id && form.variants.length > 0) {
      Object.assign(payload, form.variants[0])
    }

    const result = await inventoryStore.saveProduct(payload)
    
    if (result) {
      toast.success(props.itemToEdit ? 'Producto actualizado con éxito' : 'Producto y variantes creados correctamente')
      emit('saved') 
      saving.value = false // Clear saving state before closing
      close()
    }
  } catch (err: any) {
    console.error('Error in modal submit:', err)
    
    // Manejo elegante de errores de validación (422)
    if (err.errors) {
      const firstError = Object.values(err.errors)[0] as string[]
      toast.error(firstError[0] || 'Error de validación en los datos')
    } else if (err.message) {
      toast.error(err.message)
    } else {
      toast.error('Ocurrió un error inesperado al guardar')
    }
  } finally {
    saving.value = false
  }
}
</script>

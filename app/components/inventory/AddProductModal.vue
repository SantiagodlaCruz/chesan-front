<template>
  <BaseModal
    :show="show"
    :title="itemToEdit ? 'Editar Producto' : 'Añadir Nuevo Producto'"
    :subtitle="itemToEdit ? 'Modifique los detalles generales y de stock del producto.' : 'Configure el producto y sus diferentes variantes (tallas/colores).'"
    size="4xl"
    @update:show="close"
  >
    <form @submit.prevent="onSubmit" class="space-y-8">
      <!-- General Info -->
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8 pb-8 border-b border-dashed border-slate-200 dark:border-slate-800">
        <!-- Product Photo -->
        <div class="lg:col-span-1">
          <ImageUpload
            v-model="image"
            label="Imagen Referencial"
            :initial-preview="imageUrl"
            :readonly="readonly"
          />
        </div>

        <!-- Basic Details -->
        <div class="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div class="md:col-span-2">
            <BaseInput
              v-model="name"
              name="name"
              label="Nombre Base del Producto"
              placeholder=""
              :disabled="readonly"
            />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-bold text-slate-600 dark:text-slate-400 pl-1">Categoría</label>
            <Select v-model="categoryId" :options="categorias" placeholder="Seleccionar" searchable :loading="useCatalogs().loading" :disabled="readonly" :error="errors.category_id" />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-bold text-slate-600 dark:text-slate-400 pl-1">Escuela</label>
            <Select v-model="institutionId" :options="instituciones" placeholder="Seleccionar" searchable :loading="useCatalogs().loading" :disabled="readonly" />
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

        <!-- Variant validation error -->
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="transform -translate-y-2 opacity-0"
          enter-to-class="transform translate-y-0 opacity-100"
        >
          <p v-if="variantError" class="text-[10px] font-bold text-red-500 dark:text-red-400 ml-1 uppercase tracking-wider">
            {{ variantError }}
          </p>
        </Transition>

        <div class="bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 font-bold shadow-sm border-b border-slate-200 dark:border-slate-800 text-xs whitespace-nowrap">
                <th class="px-4 py-3 min-w-[180px]">Color</th>
                <th class="px-4 py-3 min-w-[90px]">Talla</th>
                <th class="px-4 py-3 w-24">P. Producción</th>
                <th class="px-4 py-3 w-24">P. Venta</th>
                <th class="px-4 py-3 w-36 text-center">Stock Inicial</th>
                <th v-if="!itemToEdit && !readonly" class="px-4 py-3 w-10 text-center"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 dark:divide-slate-800">
              <tr v-for="(v, idx) in variants" :key="idx" class="group transition-colors">
                <td class="px-2 py-2">
                  <Select v-model="v.color_id" :options="colores" placeholder="Color" searchable compact direction="down" :loading="useCatalogs().loading" :disabled="readonly" creatable />
                </td>
                <td class="px-2 py-2">
                  <Select v-model="v.size_id" :options="tallas" placeholder="Talla" searchable compact direction="down" :loading="useCatalogs().loading" :disabled="readonly" />
                </td>
                <td class="px-2 py-2">
                  <div class="relative">
                    <span class="absolute left-0 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                    <input v-model="v.production_price" class="w-full bg-transparent border-b-2 border-transparent focus:border-primary transition-all outline-none pl-3 pr-2 py-1.5 font-medium text-slate-900 dark:text-slate-100 disabled:opacity-70" type="number" step="0.01" :disabled="readonly" />
                  </div>
                </td>
                <td class="px-2 py-2">
                  <div class="relative">
                    <span class="absolute left-0 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                    <input v-model="v.sale_price" class="w-full bg-transparent border-b-2 border-transparent focus:border-primary transition-all outline-none pl-3 pr-2 py-1.5 font-medium text-slate-900 dark:text-slate-100 disabled:opacity-70" type="number" step="0.01" :disabled="readonly" />
                  </div>
                </td>
                <td class="px-2 py-2 text-center">
                  <BaseQuantityInput 
                    v-model="v.quantity" 
                    compact 
                    :disabled="readonly" 
                  />
                </td>
                <td v-if="!itemToEdit && !readonly" class="px-2 py-2 text-center">
                  <button v-if="variants.length > 1" type="button" @click="removeVariant(idx)" class="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all">
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

      <!-- Variant Quick Add Color Palette -->
      <div v-if="newColors.length > 0 && !readonly" class="space-y-3 bg-primary/[0.03] dark:bg-primary/[0.02] p-4 rounded-2xl border border-primary/10">
        <div class="flex items-center gap-2 mb-2">
          <PaletteIcon class="w-4 h-4 text-primary" />
          <h4 class="text-xs font-black uppercase text-primary tracking-wider">Nuevos Colores Detectados</h4>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div v-for="colorName in newColors" :key="colorName" class="flex items-center gap-3 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm">
            <div class="flex-1 min-w-0">
              <p class="text-[10px] font-bold text-slate-800 dark:text-slate-200 truncate">{{ colorName }}</p>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <div 
                class="w-6 h-6 rounded-md border border-slate-100 dark:border-white/5 relative overflow-hidden"
                :style="{ backgroundColor: newColorHexes[colorName] || '#3b82f6' }"
              >
                <input 
                  type="color" 
                  :value="newColorHexes[colorName] || '#3b82f6'" 
                  @input="(e) => newColorHexes[colorName] = (e.target as HTMLInputElement).value"
                  class="absolute inset-0 w-[200%] h-[200%] -translate-x-1/4 -translate-y-1/4 cursor-pointer opacity-0" 
                />
              </div>
              <span class="text-[10px] font-mono font-bold text-slate-400 uppercase w-14">{{ newColorHexes[colorName] || '#3B82F6' }}</span>
            </div>
          </div>
        </div>
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
          {{ itemToEdit ? 'Actualizar Producto' : 'Guardar Todo (' + variants.length + ')' }}
        </BaseButton>
      </div>
    </form>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { useForm, useField } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/yup'
import * as yup from 'yup'
import { PlusIcon, TrashIcon, PaletteIcon } from 'lucide-vue-next'
import BaseButton from '~/components/BaseButton.vue'
import BaseInput from '~/components/BaseInput.vue'
import BaseQuantityInput from '~/components/BaseQuantityInput.vue'
import Select from '~/components/Select.vue'
import ImageUpload from '~/components/ImageUpload.vue'
import type { StockProduct, SelectOption } from '~/types'

const props = defineProps<{
  show: boolean
  categorias: SelectOption[]
  instituciones: SelectOption[]
  colores: SelectOption[]
  tallas: SelectOption[]
  itemToEdit: StockProduct | null
  readonly?: boolean
}>()

const emit = defineEmits(['update:show', 'saved'])

// ── Yup Schema ──
const validationSchema = toTypedSchema(
  yup.object({
    name: yup.string().required('El nombre del producto es obligatorio.').max(255, 'Máximo 255 caracteres.'),
    category_id: yup.mixed().required('La categoría es obligatoria.'),
    institution_id: yup.mixed().nullable(),
  })
)

const { handleSubmit, errors, resetForm, setValues } = useForm({
  validationSchema
})

const { value: name } = useField<string>('name')
const { value: categoryId } = useField<string | number>('category_id')
const { value: institutionId } = useField<string | number | undefined>('institution_id')

const image = ref<File | null>(null)
const imageUrl = ref('')
const variantError = ref('')

interface ProductVariant {
  color_id: number | string
  size_id: number | string
  production_price: number | null
  sale_price: number | null
  quantity: number
}

const variants = reactive<ProductVariant[]>([])

const newColorHexes = reactive<Record<string, string>>({})
const newColors = computed(() => {
  const names = new Set<string>()
  variants.forEach(v => {
    if (typeof v.color_id === 'string' && v.color_id.length > 0) {
      names.add(v.color_id)
    }
  })
  return Array.from(names)
})

const addVariant = () => {
  const last = variants[variants.length - 1]
  variants.push({
    color_id: last?.color_id || '',
    size_id: '',
    production_price: last?.production_price || null,
    sale_price: last?.sale_price || null,
    quantity: last?.quantity || 1
  })
}

const removeVariant = (idx: number) => {
  variants.splice(idx, 1)
}

const resetVariants = () => {
  variants.splice(0, variants.length, { color_id: '', size_id: '', production_price: null, sale_price: null, quantity: 1 })
}

watch(() => props.show, (newVal) => {
  if (newVal) {
    variantError.value = ''
    if (props.itemToEdit) {
      setValues({
        name: props.itemToEdit.name || '',
        category_id: props.itemToEdit.category_id || '',
        institution_id: props.itemToEdit.institution_id || '',
      })
      image.value = null
      imageUrl.value = props.itemToEdit.image_url || ''
      variants.splice(0, variants.length, {
        color_id: props.itemToEdit.color_id || '',
        size_id: props.itemToEdit.size_id || '',
        production_price: props.itemToEdit.production_price || null,
        sale_price: props.itemToEdit.sale_price || null,
        quantity: props.itemToEdit.quantity || 0
      })
    } else {
      resetForm()
      image.value = null
      imageUrl.value = ''
      resetVariants()
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

// ── Submit Handler ──
const onSubmit = handleSubmit(async (values) => {
  // Validate variants manually
  variantError.value = ''
  for (const v of variants) {
    if (!v.color_id) {
      variantError.value = 'Cada variante debe tener un color asignado.'
      return
    }
    if (!v.size_id) {
      variantError.value = 'Cada variante debe tener una talla asignada.'
      return
    }
  }

  try {
    saving.value = true

    const auth = useAuth()
    const config = useRuntimeConfig()
    const apiUrl = config.public.apiBaseUrl || 'http://127.0.0.1:8000'
    
    // Handle Quick Add Colors for variants
    const newlyCreatedColors: Record<string, number> = {}

    for (const variant of variants) {
      if (typeof variant.color_id === 'string') {
        const colorName = variant.color_id
        if (newlyCreatedColors[colorName]) {
          variant.color_id = newlyCreatedColors[colorName]
        } else {
          try {
            const colorRes = await $fetch<any>(`${apiUrl}/api/colors`, {
              method: 'POST',
              body: { name: colorName, hex_code: newColorHexes[colorName] || '#3b82f6' },
              headers: { Authorization: `Bearer ${auth.token}` }
            })
            newlyCreatedColors[colorName] = colorRes.data.id
            variant.color_id = colorRes.data.id
          } catch (err: any) {
            toast.error(`Error al crear el color "${colorName}": ` + (err.data?.message || err.message))
            saving.value = false
            return
          }
        }
      }
    }

    if (Object.keys(newlyCreatedColors).length > 0) {
      useCatalogs().fetchAll(true)
    }

    const payload: any = {
      name: values.name,
      category_id: values.category_id,
      institution_id: values.institution_id,
      variants: [...variants],
    }

    if (props.itemToEdit) {
      payload.id = props.itemToEdit.id
      // When editing, flatten the first variant into the payload
      if (variants.length > 0) {
        Object.assign(payload, variants[0])
      }
    }

    if (image.value instanceof File) {
      payload.image = image.value
    }

    const result = await inventoryStore.saveProduct(payload)

    if (result) {
      toast.success(props.itemToEdit ? 'Producto actualizado con éxito' : 'Producto y variantes creados correctamente')
      emit('saved')
      saving.value = false
      close()
    }
  } catch (err: any) {
    console.error('Error in modal submit:', err)

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
})
</script>

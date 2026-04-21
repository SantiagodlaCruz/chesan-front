<template>
  <BaseModal
    :show="show"
    :title="readonly ? 'Ver Material' : (itemToEdit ? 'Editar Material' : 'Añadir Nueva Materia Prima')"
    :subtitle="readonly ? 'Detalles del material registrado.' : (itemToEdit ? 'Modifique los detalles del material.' : 'Registre nuevo material en el inventario.')"
    size="xl"
    @update:show="close"
  >
    <form @submit.prevent="onSubmit" class="space-y-6">
      <!-- Image + Name Row -->
      <div class="flex gap-6 items-start">
        <div class="w-40 shrink-0">
          <ImageUpload
            v-model="image"
            label="Imagen Referencial"
            :initial-preview="imageUrl"
            :readonly="readonly"
          />
        </div>

        <div class="flex-1 space-y-4">
          <div class="flex flex-col gap-1.5">
            <BaseInput
              v-model="name"
              name="name"
              label="Nombre del Material"
              placeholder=""
              :disabled="readonly"
            />
          </div>
          <div class="space-y-4">
            <Select 
              v-model="unitMeasureId" 
              label="Unidad de Medida" 
              :options="unidades" 
              placeholder="Seleccionar unidad..." 
              searchable 
              :disabled="readonly" 
              :error="errors.unit_measure_id" 
            />
            <Select 
              v-model="colorId" 
              label="Color (Opcional)" 
              :options="colores" 
              placeholder="Seleccionar color..." 
              searchable 
              :disabled="readonly" 
              creatable 
            />
          </div>

          <!-- Quick Add Color Palette -->
          <Transition
            enter-active-class="transition duration-300 ease-out"
            enter-from-class="transform -translate-y-4 opacity-0"
            enter-to-class="transform translate-y-0 opacity-100"
          >
            <div v-if="isNewColor && !readonly" class="bg-primary/[0.03] dark:bg-primary/[0.02] p-4 rounded-2xl border border-primary/10 flex items-center gap-4">
              <div class="flex-1">
                <p class="text-[10px] font-black uppercase text-primary mb-1 tracking-wider">Nuevo Color Detectado: <span class="text-slate-900 dark:text-white">{{ colorId }}</span></p>
                <p class="text-[11px] text-slate-500 leading-relaxed">Este color no existe. Elige un tono para guardarlo en tu catálogo permanentemente.</p>
              </div>
              <div class="flex items-center gap-3 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm">
                <div 
                  class="w-10 h-10 rounded-lg border-2 border-slate-100 dark:border-white/5 relative overflow-hidden transition-transform hover:scale-105"
                  :style="{ backgroundColor: newColorHex }"
                >
                  <input 
                    type="color" 
                    v-model="newColorHex" 
                    class="absolute inset-0 w-[200%] h-[200%] -translate-x-1/4 -translate-y-1/4 cursor-pointer opacity-0" 
                  />
                </div>
                <div class="flex flex-col">
                  <span class="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">HEX</span>
                  <span class="text-xs font-mono font-black text-slate-700 dark:text-slate-200 uppercase">{{ newColorHex }}</span>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>

      <!-- Separator -->
      <div class="border-t-2 border-dashed border-slate-100 dark:border-slate-800"></div>

      <!-- Price + Stock Fields -->
      <div class="grid grid-cols-3 gap-4">
        <div class="flex flex-col gap-1.5">
          <BaseInput
            v-model="unitPrice"
            name="unit_price"
            label="Precio Unitario"
            placeholder="0.00"
            type="number"
            :disabled="readonly"
          />
        </div>
        <div class="flex flex-col gap-1.5">
          <BaseQuantityInput
            v-model="quantity"
            name="quantity"
            :label="itemToEdit ? 'Stock Actual' : 'Cantidad Inicial'"
            :disabled="readonly"
          />
        </div>
        <div class="flex flex-col gap-1.5">
          <BaseQuantityInput
            v-model="minThreshold"
            name="min_threshold"
            label="Umbral Mínimo"
            :disabled="readonly"
          />
        </div>
      </div>

      <!-- Actions -->
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
          {{ itemToEdit ? 'Actualizar Material' : 'Guardar Material' }}
        </BaseButton>
      </div>
    </form>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useForm, useField } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/yup'
import * as yup from 'yup'
import BaseButton from '~/components/BaseButton.vue'
import BaseInput from '~/components/BaseInput.vue'
import BaseQuantityInput from '~/components/BaseQuantityInput.vue'
import ImageUpload from '~/components/ImageUpload.vue'
import Select from '~/components/Select.vue'
import { useToast } from '~/stores/toast'
import type { SelectOption, RawMaterial } from '~/types'

const props = defineProps<{
  show: boolean
  unidades: SelectOption[]
  colores: SelectOption[]
  itemToEdit: RawMaterial | null
  readonly?: boolean
}>()

const emit = defineEmits(['update:show', 'saved'])
const toast = useToast()
const rawMaterialsStore = useRawMaterialsStore()
const saving = ref(false)
const newColorHex = ref('#3b82f6')
const image = ref<File | string | undefined>(undefined)
const imageUrl = ref('')

// ── Yup Schema ──
const validationSchema = toTypedSchema(
  yup.object({
    name: yup.string().required('El nombre del material es obligatorio.').max(255, 'Máximo 255 caracteres.'),
    unit_measure_id: yup.mixed().required('La unidad de medida es obligatoria.'),
    color_id: yup.mixed().nullable(),
    unit_price: yup.number().nullable().min(0, 'El precio no puede ser negativo.').transform((value, original) => original === '' ? null : value),
    quantity: yup.number().nullable().min(0, 'La cantidad no puede ser negativa.').transform((value, original) => original === '' ? null : value),
    min_threshold: yup.number().nullable().min(0, 'El umbral no puede ser negativo.').transform((value, original) => original === '' ? null : value),
  })
)

const { handleSubmit, errors, resetForm, setValues } = useForm({
  validationSchema
})

const { value: name } = useField<string>('name')
const { value: unitMeasureId } = useField<number | string | undefined>('unit_measure_id')
const { value: colorId } = useField<number | string | undefined>('color_id')
const { value: unitPrice } = useField<number | undefined>('unit_price')
const { value: quantity } = useField<number | undefined>('quantity')
const { value: minThreshold } = useField<number | undefined>('min_threshold')

const isNewColor = computed(() => typeof colorId.value === 'string' && colorId.value.length > 0)

// ── Watch show prop to reset/populate form ──
watch(() => props.show, (newVal) => {
  if (newVal) {
    if (props.itemToEdit) {
      setValues({
        name: props.itemToEdit.name,
        unit_measure_id: props.itemToEdit.unit_measure_id || undefined,
        color_id: props.itemToEdit.color_id || undefined,
        unit_price: props.itemToEdit.unit_price || undefined,
        quantity: props.itemToEdit.quantity,
        min_threshold: props.itemToEdit.min_threshold,
      })
      image.value = undefined
      imageUrl.value = props.itemToEdit.image_url || ''
    } else {
      resetForm()
      image.value = undefined
      imageUrl.value = ''
    }
  }
})

const close = () => {
  if (saving.value) return
  emit('update:show', false)
}

// ── Submit Handler ──
const onSubmit = handleSubmit(async (values) => {
  if (props.readonly) return

  try {
    saving.value = true

    // Handle Quick Add Color if needed
    let finalColorId = values.color_id
    if (isNewColor.value) {
      const config = useRuntimeConfig()
      const apiUrl = config.public.apiBaseUrl || 'http://127.0.0.1:8000'
      const auth = useAuth()
      
      try {
        const colorRes = await $fetch<any>(`${apiUrl}/api/colors`, {
          method: 'POST',
          body: { name: values.color_id, hex_code: newColorHex.value },
          headers: { Authorization: `Bearer ${auth.token}` }
        })
        finalColorId = colorRes.data.id
        const catalogsStore = useCatalogs()
        catalogsStore.fetchAll(true)
      } catch (err: any) {
        toast.error('Error al crear el nuevo color: ' + (err.data?.message || err.message))
        saving.value = false
        return
      }
    }

    const payload: any = {
      name: values.name,
      unit_measure_id: values.unit_measure_id,
      color_id: finalColorId,
      unit_price: values.unit_price,
      quantity: values.quantity,
      min_threshold: values.min_threshold,
    }

    if (props.itemToEdit) {
      payload.id = props.itemToEdit.id
      payload.barcode = props.itemToEdit.barcode
    }

    if (image.value instanceof File) {
      payload.image = image.value
    }

    const result = await rawMaterialsStore.saveMaterial(payload)

    if (result) {
      toast.success(props.itemToEdit ? 'Material actualizado con éxito' : 'Material registrado correctamente')
      emit('saved')
      saving.value = false
      close()
    }
  } catch (err: any) {
    const msg = err?.message || 'Error al guardar el material'
    toast.error(msg)
  } finally {
    saving.value = false
  }
})
</script>

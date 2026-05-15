<template>
  <BaseModal
    :show="show"
    :title="readonly ? 'Ver material' : (itemToEdit ? 'Editar material' : 'Añadir nueva materia prima')"
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
              @create="handleCreateColor"
            />
          </div>
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
          {{ itemToEdit ? 'Actualizar material' : 'Guardar material' }}
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
const api = useApi()
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

const handleCreateColor = async (name: string) => {
  try {
    const res = await api.post('/api/colors', { name })
    colorId.value = res.data.id
    // Recargar catálogo de colores en el store global
    useCatalogs().fetchAll()
    toast.success('Nuevo color agregado al catálogo')
  } catch (err: any) {
    toast.error('Error al crear color: ' + (err.data?.message || err.message))
  }
}

const close = () => {
  if (saving.value) return
  emit('update:show', false)
}

// ── Submit Handler ──
const onSubmit = handleSubmit(async (values) => {
  if (props.readonly) return

  try {
    saving.value = true

    let finalColorId = values.color_id

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

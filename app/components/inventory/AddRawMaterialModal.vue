<template>
  <BaseModal
    :show="show"
    :title="readonly ? 'Ver Material' : (itemToEdit ? 'Editar Material' : 'Añadir Nueva Materia Prima')"
    :subtitle="readonly ? 'Detalles del material registrado.' : (itemToEdit ? 'Modifique los detalles del material.' : 'Registre nuevo material en el inventario.')"
    size="xl"
    @update:show="close"
  >
    <form @submit.prevent="submit" class="space-y-6">
      <!-- Image + Name Row -->
      <div class="flex gap-6 items-start">
        <div class="w-40 shrink-0">
          <ImageUpload
            v-model="form.image"
            label="Imagen Referencial"
            :initial-preview="form.image_url"
            :readonly="readonly"
          />
        </div>

        <div class="flex-1 space-y-4">
          <div class="flex flex-col gap-1.5">
            <BaseInput
              v-model="form.barcode"
              label="Código (Opcional)"
              placeholder="Ej. MAT-001 (se autogenera si se deja vacío)"
              :disabled="readonly"
            />
          </div>
          <div class="flex flex-col gap-1.5">
            <BaseInput
              v-model="form.name"
              label="Nombre del Material"
              placeholder="Ej. Tela Gabardina Azul"
              required
              :disabled="readonly"
            />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-bold text-slate-600 dark:text-slate-400 pl-1">Unidad de Medida</label>
            <Select v-model="form.unit_measure_id" :options="unidades" placeholder="Seleccionar..." searchable :disabled="readonly" />
          </div>
        </div>
      </div>

      <!-- Separator -->
      <div class="border-t-2 border-dashed border-slate-100 dark:border-slate-800"></div>

      <!-- Price + Stock Fields -->
      <div class="grid grid-cols-3 gap-4">
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold text-slate-600 dark:text-slate-400 pl-1">Precio Unitario</label>
          <div class="relative">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">$</span>
            <input
              v-model="form.unit_price"
              class="w-full bg-slate-50 dark:bg-[#1e293b] border-2 border-transparent focus:border-primary transition-all outline-none pl-7 pr-4 py-3 rounded-xl text-sm font-medium placeholder:text-slate-400 text-slate-900 dark:text-slate-100 disabled:opacity-60 disabled:cursor-not-allowed"
              placeholder="45.50"
              type="number"
              step="0.01"
              required
              :disabled="readonly"
            />
          </div>
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold text-slate-600 dark:text-slate-400 pl-1">{{ itemToEdit ? 'Stock Actual' : 'Cantidad Inicial' }}</label>
          <input
            v-model="form.quantity"
            class="w-full bg-slate-50 dark:bg-[#1e293b] border-2 border-transparent focus:border-primary transition-all outline-none px-4 py-3 rounded-xl text-sm font-medium placeholder:text-slate-400 text-slate-900 dark:text-slate-100 disabled:opacity-60 disabled:cursor-not-allowed"
            placeholder="150"
            type="number"
            required
            :disabled="readonly"
          />
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold text-slate-600 dark:text-slate-400 pl-1">Umbral Mínimo</label>
          <input
            v-model="form.min_threshold"
            class="w-full bg-slate-50 dark:bg-[#1e293b] border-2 border-transparent focus:border-primary transition-all outline-none px-4 py-3 rounded-xl text-sm font-medium placeholder:text-slate-400 text-slate-900 dark:text-slate-100 disabled:opacity-60 disabled:cursor-not-allowed"
            placeholder="20"
            type="number"
            required
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
import { ref, reactive, watch } from 'vue'
import BaseButton from '~/components/BaseButton.vue'
import BaseInput from '~/components/BaseInput.vue'
import ImageUpload from '~/components/ImageUpload.vue'
import Select from '~/components/Select.vue'
import { useToast } from '~/stores/toast'
import type { SelectOption, RawMaterial } from '~/types'

const props = defineProps<{
  show: boolean
  unidades: SelectOption[]
  itemToEdit: RawMaterial | null
  readonly?: boolean
}>()

const emit = defineEmits(['update:show', 'saved'])
const toast = useToast()
const rawMaterialsStore = useRawMaterialsStore()
const saving = ref(false)

const form = reactive({
  id: null as number | null,
  barcode: '',
  name: '',
  image: null as File | string | null,
  image_url: '' as string,
  unit_measure_id: null as number | string | null,
  quantity: 0,
  unit_price: null as number | null,
  min_threshold: 0
})

const resetForm = () => {
  form.id = null
  form.barcode = ''
  form.name = ''
  form.image = null
  form.image_url = ''
  form.unit_measure_id = null
  form.quantity = 0
  form.unit_price = null
  form.min_threshold = 0
}

watch(() => props.show, (newVal) => {
  if (newVal) {
    if (props.itemToEdit) {
      form.id = props.itemToEdit.id
      form.barcode = props.itemToEdit.barcode || ''
      form.name = props.itemToEdit.name
      form.image = null
      form.image_url = props.itemToEdit.image_url || ''
      form.unit_measure_id = props.itemToEdit.unit_measure_id
      form.quantity = props.itemToEdit.quantity
      form.unit_price = props.itemToEdit.unit_price
      form.min_threshold = props.itemToEdit.min_threshold
    } else {
      resetForm()
    }
  }
})

const close = () => {
  if (saving.value) return
  emit('update:show', false)
}

const submit = async () => {
  if (props.readonly) return

  try {
    saving.value = true

    const payload: any = {
      barcode: form.barcode,
      name: form.name,
      unit_measure_id: form.unit_measure_id,
      unit_price: form.unit_price,
      quantity: form.quantity,
      min_threshold: form.min_threshold,
    }

    if (form.id) {
      payload.id = form.id
    }

    if (form.image instanceof File) {
      payload.image = form.image
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
}
</script>

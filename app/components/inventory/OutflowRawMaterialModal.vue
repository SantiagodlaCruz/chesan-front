<template>
  <BaseModal
    :show="show"
    title="Registrar salida de material"
    subtitle="Escanea o busca materiales para registrar su salida del inventario."
    size="3xl"
    @update:show="close"
  >
    <div class="space-y-6">

      <!-- Scan / Search Input -->
      <div>
        <label class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] ml-1 mb-2 block transition-colors">
          Escanear o buscar material
        </label>
        <div class="relative">
          <ScanLineIcon class="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            ref="barcodeInput"
            v-model="barcodeQuery"
            type="text"
            placeholder="Escribir código de barras o nombre del material..."
            class="w-full bg-slate-50 dark:bg-card-dark border border-slate-200 dark:border-border-dark focus:border-primary outline-none pl-11 pr-4 py-3 rounded-xl text-slate-800 dark:text-slate-100 font-mono tracking-wider transition-all"
            @keydown.enter="searchMaterial"
          />
        </div>
        <p class="text-[10px] uppercase font-bold text-slate-500 tracking-widest mt-2 flex items-center gap-1">
          <InfoIcon class="w-3 h-3" /> Presiona Enter para buscar
        </p>

        <!-- Search Error -->
        <div v-if="searchError" class="mt-3 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold rounded-xl flex items-center gap-2">
          <AlertCircleIcon class="w-4 h-4 shrink-0" />
          {{ searchError }}
        </div>

        <!-- Search Results Dropdown -->
        <div v-if="searchResults.length > 0" class="mt-2 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-[#1e293b] rounded-xl shadow-xl overflow-hidden">
          <p class="px-4 py-2 text-[10px] uppercase font-bold text-slate-500 tracking-widest border-b border-slate-100 dark:border-white/5">
            {{ searchResults.length }} resultado(s) — selecciona para agregar
          </p>
          <button
            v-for="material in searchResults"
            :key="material.id"
            type="button"
            class="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors flex items-center gap-3 border-b last:border-b-0 border-slate-100 dark:border-white/5"
            @click="addMaterialFromSearch(material)"
          >
            <div class="flex-1 min-w-0">
              <p class="font-semibold text-slate-800 dark:text-white text-sm truncate">{{ material.name }}</p>
              <div class="flex items-center gap-2 mt-0.5">
                <span class="font-mono text-[10px] text-primary/70">{{ material.barcode || 'Sin código' }}</span>
                <span v-if="material.color?.name" class="text-[10px] text-slate-400">• {{ material.color.name }}</span>
              </div>
            </div>
            <div class="text-right shrink-0">
              <p class="text-xs font-bold text-slate-600 dark:text-slate-300">
                {{ material.quantity }} {{ material.unit_measure?.name || 'uds' }}
              </p>
              <p class="text-[10px] text-slate-400">disponible</p>
            </div>
            <PlusCircleIcon class="w-5 h-5 text-primary shrink-0" />
          </button>
        </div>
      </div>

      <!-- Items List -->
      <div v-if="outflowItems.length > 0">
        <label class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] ml-1 mb-3 block">
          Materiales a retirar ({{ outflowItems.length }})
        </label>
        <div class="space-y-2">
          <div
            v-for="(item, index) in outflowItems"
            :key="item.material.id"
            class="flex items-center gap-3 bg-slate-50 dark:bg-white/5 border rounded-xl p-3 transition-all"
            :class="item.quantity > item.material.quantity
              ? 'border-red-300 dark:border-red-500/30 bg-red-50/50 dark:bg-red-500/5'
              : 'border-slate-200 dark:border-white/10'"
          >
            <!-- Material Info -->
            <div class="flex-1 min-w-0">
              <p class="font-bold text-sm text-slate-800 dark:text-white truncate">{{ item.material.name }}</p>
              <div class="flex items-center gap-2 mt-0.5">
                <span class="font-mono text-[10px] text-primary/70">{{ item.material.barcode || 'Sin código' }}</span>
                <div
                  v-if="item.material.color?.hex_code"
                  class="w-2.5 h-2.5 rounded-full border border-slate-300 dark:border-white/20"
                  :style="{ backgroundColor: item.material.color.hex_code }"
                ></div>
                <span v-if="item.material.color?.name" class="text-[10px] text-slate-400">{{ item.material.color.name }}</span>
              </div>
            </div>

            <!-- Stock Available -->
            <div class="text-center shrink-0 px-2">
              <p class="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Disponible</p>
              <p class="text-sm font-black text-slate-600 dark:text-slate-300">
                {{ item.material.quantity }}
                <span class="text-[10px] font-medium text-slate-400">{{ item.material.unit_measure?.name || '' }}</span>
              </p>
            </div>

            <!-- Quantity Input -->
            <div class="w-28 shrink-0">
              <label class="text-[9px] uppercase font-bold tracking-wider mb-1 block"
                :class="item.quantity > item.material.quantity ? 'text-red-500' : 'text-slate-400'"
              >
                Cantidad
              </label>
              <input
                v-model.number="item.quantity"
                type="number"
                min="0.01"
                :max="item.material.quantity"
                step="0.01"
                class="w-full bg-white dark:bg-card-dark border focus:border-primary outline-none px-3 py-2 rounded-lg text-sm font-bold text-center transition-all"
                :class="item.quantity > item.material.quantity
                  ? 'border-red-400 dark:border-red-500/50 text-red-600 dark:text-red-400'
                  : 'border-slate-200 dark:border-border-dark text-slate-800 dark:text-slate-100'"
              />
              <p v-if="item.quantity > item.material.quantity" class="text-[9px] text-red-500 font-bold mt-1 text-center">
                Excede stock
              </p>
            </div>

            <!-- Remove Button -->
            <button
              type="button"
              class="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-all shrink-0"
              @click="removeItem(index)"
            >
              <Trash2Icon class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="flex flex-col items-center justify-center py-8 text-center">
        <PackageOpenIcon class="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
        <p class="text-sm font-semibold text-slate-500 dark:text-slate-400">No hay materiales en la lista</p>
        <p class="text-xs text-slate-400 dark:text-slate-500 mt-1">Escanea o busca un material para comenzar</p>
      </div>

      <!-- Reason -->
      <div v-if="outflowItems.length > 0">
        <label class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] ml-1 mb-2 block transition-colors">
          Motivo de salida (opcional)
        </label>
        <input
          v-model="reason"
          type="text"
          placeholder="Ej: Muestras de producción, consumo interno..."
          class="w-full bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark focus:border-primary outline-none px-4 py-2.5 rounded-xl text-sm text-slate-800 dark:text-slate-100 transition-all"
        />
      </div>

      <!-- Actions -->
      <div class="flex items-center justify-end gap-3 pt-4 border-t border-border-light dark:border-[#1e293b]">
        <BaseButton type="button" variant="secondary" :full="false" @click="close" :disabled="saving">
          Cancelar
        </BaseButton>
        <BaseButton
          v-if="outflowItems.length > 0"
          type="button"
          variant="primary"
          :full="false"
          class="min-w-[180px]"
          :loading="saving"
          loading-text="Registrando..."
          :disabled="!canSubmit"
          @click="submitOutflow"
        >
          <ArrowDownToLineIcon class="w-4 h-4" />
          Registrar Salida
        </BaseButton>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import {
  ScanLineIcon,
  InfoIcon,
  AlertCircleIcon,
  PlusCircleIcon,
  Trash2Icon,
  PackageOpenIcon,
  ArrowDownToLineIcon
} from 'lucide-vue-next'
import BaseModal from '~/components/BaseModal.vue'
import BaseButton from '~/components/BaseButton.vue'
import { useToast } from '~/stores/toast'
import type { RawMaterial } from '~/types'

interface OutflowItem {
  material: RawMaterial
  quantity: number
}

const props = defineProps<{
  show: boolean
}>()
const emit = defineEmits(['update:show', 'saved'])
const toast = useToast()
const api = useApi()

const barcodeInput = ref<HTMLInputElement | null>(null)
const barcodeQuery = ref('')
const searchError = ref('')
const searchResults = ref<RawMaterial[]>([])
const outflowItems = ref<OutflowItem[]>([])
const reason = ref('')
const saving = ref(false)

const canSubmit = computed(() => {
  if (outflowItems.value.length === 0) return false
  return outflowItems.value.every(item => item.quantity > 0 && item.quantity <= item.material.quantity)
})

watch(() => props.show, (newVal) => {
  if (newVal) {
    resetAll()
    setTimeout(() => barcodeInput.value?.focus(), 150)
  }
})

const resetAll = () => {
  barcodeQuery.value = ''
  searchError.value = ''
  searchResults.value = []
  outflowItems.value = []
  reason.value = ''
  saving.value = false
}

const searchMaterial = async () => {
  if (!barcodeQuery.value.trim()) return
  searchError.value = ''
  searchResults.value = []

  const query = barcodeQuery.value.trim().replace(/'/g, '-')
  barcodeQuery.value = ''

  try {
    const response = await api.get('/api/raw-materials', { params: { search: query, per_page: 10 } })
    const materialsArray: RawMaterial[] = Array.isArray(response.data)
      ? response.data
      : (response.data?.data || [])

    if (materialsArray.length === 0) {
      searchError.value = `No se encontró ningún material para: "${query}"`
      return
    }

    // Exact barcode match → add directly
    const exactMatch = materialsArray.find(m => m.barcode === query)
    if (exactMatch) {
      addMaterialFromSearch(exactMatch)
      return
    }

    // Single result → add directly
    if (materialsArray.length === 1) {
      addMaterialFromSearch(materialsArray[0])
      return
    }

    // Multiple results → show selector
    searchResults.value = materialsArray
  } catch (err: any) {
    searchError.value = 'Error al conectar con el catálogo de materiales.'
    console.error(err)
  } finally {
    nextTick(() => barcodeInput.value?.focus())
  }
}

const addMaterialFromSearch = (material: RawMaterial) => {
  searchResults.value = []
  searchError.value = ''

  const existing = outflowItems.value.find(item => item.material.id === material.id)
  if (existing) {
    existing.quantity += 1
    toast.success(`Cantidad incrementada para "${material.name}"`)
  } else {
    outflowItems.value.push({ material, quantity: 1 })
    toast.success(`"${material.name}" agregado a la lista`)
  }

  nextTick(() => barcodeInput.value?.focus())
}

const removeItem = (index: number) => {
  outflowItems.value.splice(index, 1)
}

const submitOutflow = async () => {
  if (!canSubmit.value) return
  saving.value = true

  try {
    const payload: any = {
      items: outflowItems.value.map(item => ({
        id: item.material.id,
        quantity: item.quantity,
      })),
    }
    if (reason.value.trim()) {
      payload.reason = reason.value.trim()
    }

    await api.post('/api/raw-materials/outflow', payload)

    toast.success('Salida de materiales registrada correctamente')
    // Emitimos para que la tabla padre se refresque
    emit('saved')
    // Limpiamos la lista y motivo, pero mantenemos el modal abierto
    outflowItems.value = []
    reason.value = ''
  } catch (err: any) {
    const msg = err?.data?.message || err?.message || 'Error al registrar la salida.'
    toast.error(msg)
  } finally {
    saving.value = false
  }
}

const close = () => {
  if (saving.value) return
  emit('update:show', false)
}
</script>

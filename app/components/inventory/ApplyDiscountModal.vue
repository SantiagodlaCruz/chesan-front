<template>
  <BaseModal
    :show="show"
    title="Aplicar descuento a producto"
    subtitle="Escanea un producto para asignarle un descuento especial para ventas futuras."
    size="md"
    @update:show="close"
  >
    <div class="space-y-6">
      
      <!-- Paso 1: Escanear -->
      <div v-if="!scannedProduct">
        <label class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] ml-1 mb-2 block transition-colors">Escanear código de barras</label>
        <div class="relative">
          <ScanLineIcon class="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            ref="barcodeInput"
            v-model="barcodeQuery"
            type="text"
            placeholder="Escribir o escanear código..."
            class="w-full bg-slate-50 dark:bg-card-dark border border-slate-200 dark:border-border-dark focus:border-primary outline-none pl-11 pr-4 py-3 rounded-xl text-slate-800 dark:text-slate-100 font-mono tracking-wider transition-all"
            @keydown.enter="searchProduct"
          />
        </div>
        <p class="text-[10px] uppercase font-bold text-slate-500 tracking-widest mt-2 flex items-center gap-1">
          <InfoIcon class="w-3 h-3" /> Presiona Enter tras escribir
        </p>

        <div v-if="error" class="mt-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold rounded-xl flex items-center gap-2">
          <AlertCircleIcon class="w-4 h-4 shrink-0" />
          {{ error }}
        </div>
      </div>

      <!-- Paso 2: Detalles y Descuento -->
      <div v-else class="space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <!-- Ficha de Producto -->
        <div class="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-4 flex gap-4 items-center">
            <div class="w-14 h-14 rounded-lg overflow-hidden border border-slate-200 dark:border-white/10 bg-white flex items-center justify-center shrink-0">
               <img v-if="scannedProduct.image_url" :src="scannedProduct.image_url" class="w-full h-full object-cover" />
               <ShirtIcon v-else class="w-6 h-6 text-slate-300" />
            </div>
            <div class="flex-1 min-w-0">
               <h4 class="font-bold text-slate-900 dark:text-white truncate">{{ scannedProduct.name }}</h4>
               <p class="text-xs font-mono text-slate-500">{{ scannedProduct.barcode }}</p>
               <div class="flex items-center gap-2 mt-1">
                  <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase">{{ scannedProduct.size?.name || 'S/T' }}</span>

               </div>
            </div>
            <div class="text-right shrink-0">
               <p class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Precio base</p>
               <p class="text-lg font-black text-slate-900 dark:text-white">${{ parseFloat(scannedProduct.sale_price).toFixed(2) }}</p>
            </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
            <div>
              <div class="flex items-center gap-2 mb-2 p-1 bg-slate-100 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10 w-fit">
                 <button 
                   class="px-2 py-1 text-[10px] font-bold rounded uppercase tracking-widest transition-all"
                   :class="discountMode === 'percentage' ? 'bg-white dark:bg-card-dark text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'"
                   @click="discountMode = 'percentage'"
                 >Porcentaje (%)</button>
                 <button 
                   class="px-2 py-1 text-[10px] font-bold rounded uppercase tracking-widest transition-all"
                   :class="discountMode === 'amount' ? 'bg-white dark:bg-card-dark text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'"
                   @click="discountMode = 'amount'"
                 >Monto Fijo ($)</button>
              </div>

              <!-- Porcentaje -->
              <BaseQuantityInput 
                v-if="discountMode === 'percentage'"
                v-model="discountPercentage"
                name="discountPercentage"
                label="Porcentaje de Descuento (%)"
                :min="0"
                :max="100"
                :step="1"
              />
              
              <!-- Monto -->
              <div v-else>
                  <label class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] ml-1 mb-2 block transition-colors">Descuento en dinero ($)</label>
                 <div class="relative">
                   <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                   <input
                     v-model.number="discountAmount"
                     type="number"
                     min="0"
                     :max="scannedProduct.sale_price"
                     step="1"
                     class="w-full bg-white dark:bg-card-dark border border-border-light dark:border-border-dark focus:border-primary outline-none pl-7 pr-3 py-2.5 rounded-lg text-sm font-bold text-slate-800 dark:text-slate-100"
                   />
                 </div>
              </div>
            </div>
            
            <div class="flex flex-col justify-center">
                 <p class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Precio final</p>
                <p class="text-2xl font-black" :class="(discountMode === 'percentage' ? discountPercentage : discountAmount) > 0 ? 'text-primary' : 'text-slate-400'">
                  ${{ finalPrice.toFixed(2) }}
                </p>
                <p class="text-[10px] text-slate-400 mt-1" v-if="discountMode === 'amount'">Equivale a -{{ calculatedPercentage.toFixed(1) }}% de desc.</p>
                <p class="text-[10px] text-slate-400 mt-1" v-if="discountMode === 'percentage'">Equivale a -${{ calculatedAmount.toFixed(2) }} de desc.</p>
            </div>
        </div>

        <div class="flex gap-3 pt-4 border-t border-slate-100 dark:border-white/5">
            <BaseButton type="button" variant="secondary" @click="resetScanner" class="w-full">
              Buscar Otro
            </BaseButton>
            <BaseButton type="button" variant="primary" @click="applyDiscount" class="w-full" :loading="saving">
              Aplicar Descuento
            </BaseButton>
        </div>
      </div>
      
      <!-- Cierre en Paso 1 -->
      <div class="flex justify-end pt-2" v-if="!scannedProduct">
         <BaseButton type="button" variant="secondary" :full="false" @click="close">Cancelar</BaseButton>
      </div>

    </div>
  </BaseModal>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { ScanLineIcon, ShirtIcon, InfoIcon, AlertCircleIcon } from 'lucide-vue-next'
import BaseModal from '~/components/BaseModal.vue'
import BaseButton from '~/components/BaseButton.vue'
import BaseQuantityInput from '~/components/BaseQuantityInput.vue'
import { useToast } from '~/stores/toast'

const props = defineProps({
  show: Boolean
})
const emit = defineEmits(['update:show', 'saved'])
const toast = useToast()
const api = useApi()

const barcodeInput = ref(null)
const barcodeQuery = ref('')
const scannedProduct = ref(null)
const error = ref('')
const saving = ref(false)

const discountMode = ref('percentage') 
const discountPercentage = ref(0)
const discountAmount = ref(0)

const calculatedPercentage = computed(() => {
  if (!scannedProduct.value || !discountAmount.value) return 0
  const base = parseFloat(scannedProduct.value.sale_price) || 0
  if (base === 0) return 0
  return Math.min(100, Math.max(0, (discountAmount.value / base) * 100))
})

const calculatedAmount = computed(() => {
  if (!scannedProduct.value || discountMode.value !== 'percentage') return 0
  const base = parseFloat(scannedProduct.value.sale_price) || 0
  return base * (discountPercentage.value / 100)
})

const finalPrice = computed(() => {
  if (!scannedProduct.value) return 0
  const base = parseFloat(scannedProduct.value.sale_price) || 0
  if (discountMode.value === 'percentage') {
     return Math.max(0, base * (1 - (discountPercentage.value / 100)))
  } else {
     return Math.max(0, base - discountAmount.value)
  }
})

watch(() => props.show, (newVal) => {
  if (newVal) {
    resetScanner()
    setTimeout(() => {
       barcodeInput.value?.focus()
    }, 100)
  }
})

const resetScanner = () => {
  barcodeQuery.value = ''
  scannedProduct.value = null
  discountPercentage.value = 0
  discountAmount.value = 0
  discountMode.value = 'percentage'
  error.value = ''
  nextTick(() => barcodeInput.value?.focus())
}

const searchProduct = async () => {
    if (!barcodeQuery.value.trim()) return
    error.value = ''
    
    const query = barcodeQuery.value.trim().replace(/'/g, '-')
    barcodeQuery.value = ''

    try {
        const response = await api.get('/api/stock-products', { params: { search: query } })
        const productsArray = Array.isArray(response.data) ? response.data : (response.data?.data || [])

        if (productsArray.length > 0) {
           let match = productsArray.find(p => p.barcode === query) || productsArray[0]
           scannedProduct.value = match
           
           discountMode.value = match.discount_type || 'percentage'
           discountPercentage.value = parseFloat(match.discount_percentage) || 0
           discountAmount.value = parseFloat(match.discount_amount) || 0
        } else {
           error.value = `No se hallaron resultados para el código: ${query}`
        }
    } catch (err) {
        error.value = 'Ocurrió un error conectando al catálogo.'
        console.error(err)
    } finally {
        barcodeInput.value?.focus()
    }
}

const applyDiscount = async () => {
    if (!scannedProduct.value) return
    saving.value = true

    try {
        await api.post(`/api/stock-products/${scannedProduct.value.id}/apply-discount`, {
            discount_type: discountMode.value,
            discount_percentage: discountMode.value === 'percentage' ? discountPercentage.value : 0,
            discount_amount: discountMode.value === 'amount' ? discountAmount.value : 0
        })

        toast.success('Descuento actualizado para compras futuras en P.O.S.')
        emit('saved')
        close()
    } catch (err) {
        let msg = err.data?.message || err.message || 'Error al aplicar el descuento.'
        toast.error(msg)
    } finally {
        saving.value = false
    }
}

const close = () => {
  emit('update:show', false)
}
</script>

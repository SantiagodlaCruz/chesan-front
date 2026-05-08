<template>
  <BaseModal
    :show="show"
    title="Escaneo de ticket para cambio"
    subtitle="Escanea el código QR del ticket original para gestionar la devolución."
    size="md"
    @update:show="close"
  >
    <div class="space-y-6">
      <!-- Input de Escaneo -->
      <div v-if="!scannedTicket" class="animate-in fade-in duration-300">
         <label class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] ml-1 transition-colors mb-2 block">Escanear ticket (QR)</label>
         <div class="relative">
           <QrCodeIcon class="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
           <input
             ref="qrInput"
             v-model="ticketNumberQuery"
             type="text"
             placeholder="Esperando QR..."
             class="w-full bg-slate-50 dark:bg-card-dark border border-slate-200 dark:border-border-dark focus:border-primary outline-none pl-11 pr-4 py-3 rounded-xl text-slate-800 dark:text-slate-100 font-mono tracking-wider transition-all"
             @keydown.enter="searchTicket"
           />
         </div>
         <p class="text-[10px] uppercase font-bold text-slate-500 tracking-widest mt-2 flex items-center gap-1">
           <InfoIcon class="w-3 h-3" /> El scanner inyectará el número automáticamente
         </p>

         <div v-if="error" class="mt-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold rounded-xl">
           {{ error }}
         </div>
      </div>

      <!-- Detalle del Ticket y Selección -->
      <div v-else class="space-y-6 animate-in zoom-in-95 duration-300">
         <div class="p-4 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10">
            <p class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] ml-1 transition-colors mb-1">Ticket encontrado</p>
            <h4 class="text-lg font-black text-slate-800 dark:text-white break-all leading-tight">{{ scannedTicket.ticket_number }}</h4>
            <p class="text-xs text-slate-500 mt-1">{{ scannedTicket.created_at_formatted || scannedTicket.created_at }}</p>
         </div>

         <div class="max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            <div v-for="detail in scannedTicket.items" :key="detail.id" 
                 class="p-3 border rounded-xl flex items-center gap-3 group transition-all"
                 :class="(detail.is_returned || detail.quantity < 0) ? 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-white/5 opacity-60' : 'bg-white dark:bg-card-dark border-slate-100 dark:border-white/5 hover:border-primary/30'">
               
               <div class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    :class="(detail.is_returned || detail.quantity < 0) ? 'bg-slate-200 dark:bg-white/5' : 'bg-slate-50 dark:bg-white/5'">
                  <ShirtIcon class="w-5 h-5" :class="(detail.is_returned || detail.quantity < 0) ? 'text-slate-400' : 'text-slate-300'" />
               </div>
               
               <div class="flex-1 min-w-0">
                  <p class="text-xs font-bold truncate" :class="(detail.is_returned || detail.quantity < 0) ? 'text-slate-400' : 'text-slate-800 dark:text-slate-200'">
                    {{ detail.product?.name }}
                  </p>
                  <p class="text-[10px] text-slate-500">
                    {{ detail.product?.barcode }} | {{ detail.quantity }} pza(s)
                    <span v-if="detail.is_returned || detail.quantity < 0" class="ml-2 font-black text-red-500 uppercase tracking-tighter text-[9px] bg-red-500/10 px-1 rounded">
                      {{ detail.quantity < 0 ? 'Devolución' : 'Regresado' }}
                    </span>
                  </p>
               </div>

               <div class="text-right mr-2">
                  <p class="text-xs font-black truncate" :class="(detail.is_returned || detail.quantity < 0) ? 'text-slate-400' : 'text-slate-900 dark:text-white'">
                    {{ formatMoney(detail.unit_price) }}
                  </p>
               </div>

               <button 
                  v-if="!detail.is_returned && detail.quantity > 0"
                  @click="addToCartAsReturn(detail)"
                  class="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors shadow-sm shrink-0"
                  title="Regresar este producto"
               >
                  <RotateCcwIcon class="w-4 h-4" />
               </button>
               <div v-else class="w-8 h-8 flex items-center justify-center shrink-0">
                  <!-- Espacio para mantener alineación -->
               </div>
            </div>
         </div>

         <div class="pt-4 border-t border-slate-100 dark:border-white/5 flex flex-col gap-3">
            <p class="text-[10px] text-slate-500 italic text-center px-4">
               Haz clic en el botón rojo del producto que regresa. Se agregará al carrito como <b>devolución (saldo a favor)</b>.
            </p>
            <BaseButton variant="secondary" @click="resetScanner" class="w-full">
               <QrCodeIcon class="w-4 h-4 mr-2" />
               Escanear otro ticket
            </BaseButton>
         </div>
      </div>

      <div class="flex justify-end pt-2" v-if="!scannedTicket">
         <BaseButton type="button" variant="secondary" :full="false" @click="close">Cerrar</BaseButton>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { QrCodeIcon, InfoIcon, ShirtIcon, RotateCcwIcon } from 'lucide-vue-next'
import BaseModal from '~/components/BaseModal.vue'
import BaseButton from '~/components/BaseButton.vue'
import { useFormatter } from '~/composables/useFormatter'

const { formatMoney } = useFormatter()

const props = defineProps({
  show: Boolean
})
const emit = defineEmits(['update:show', 'addReturn'])
const api = useApi()

const qrInput = ref(null)
const ticketNumberQuery = ref('')
const scannedTicket = ref(null)
const error = ref('')
const loading = ref(false)

watch(() => props.show, (newVal) => {
  if (newVal) {
    resetScanner()
    setTimeout(() => qrInput.value?.focus(), 100)
  }
})

const resetScanner = () => {
  ticketNumberQuery.value = ''
  scannedTicket.value = null
  error.value = ''
  nextTick(() => qrInput.value?.focus())
}

const searchTicket = async () => {
    if (!ticketNumberQuery.value.trim()) return
    error.value = ''
    loading.value = true
    
    const query = ticketNumberQuery.value.trim()
    ticketNumberQuery.value = ''

    try {
        const response = await api.get(`/api/tickets/by-number/${query}`)

        if (response.data) {
           scannedTicket.value = response.data
        } else {
           error.value = 'No se encontró el ticket.'
        }
    } catch (err) {
        error.value = 'Ocurrió un error o el ticket no existe.'
        console.error(err)
    } finally {
        loading.value = false
    }
}

const addToCartAsReturn = (detail) => {
    // Mapear el detalle a un formato que el POS entienda como item
    const product = detail.product
    if (!product) return

    const itemToReturn = {
        id: product.id,
        name: `DEVOLUCIÓN: ${product.name}`,
        barcode: product.barcode,
        size: product.size?.name || '',
        color: product.color?.name || '',
        sale_price: parseFloat(detail.unit_price) || 0,
        discount_percentage: 0, 
        discount_amount: 0,
        discount_type: 'percentage',
        quantity: 999, 
        image_url: product.image_url,
        qty: -1, 
        is_return: true,
        origin_ticket: scannedTicket.value.ticket_number,
        parent_detail_id: detail.id 
    }

    emit('addReturn', itemToReturn)
    close()
}

const close = () => {
  emit('update:show', false)
}
</script>

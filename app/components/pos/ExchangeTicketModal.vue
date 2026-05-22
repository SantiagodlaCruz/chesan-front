<template>
  <BaseModal
    :show="show"
    :title="modalTitle"
    :subtitle="modalSubtitle"
    size="md"
    @update:show="close"
  >
    <div class="space-y-6">
      <!-- Toggle de Modo (solo visible si no hay ticket escaneado) -->
      <div v-if="!scannedTicket" class="flex items-center gap-1 bg-slate-100 dark:bg-white/5 p-1 rounded-xl text-[10px] uppercase font-black tracking-widest">
         <button 
           type="button" 
           @click="setMode(false)" 
           :class="!isSearching ? 'bg-white dark:bg-card-dark text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'" 
           class="flex-1 py-2 rounded-lg transition-all"
         >
           Escanear QR / Folio
         </button>
         <button 
           type="button" 
           @click="setMode(true)" 
           :class="isSearching ? 'bg-white dark:bg-card-dark text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'" 
           class="flex-1 py-2 rounded-lg transition-all"
         >
           Buscar por Cliente
         </button>
      </div>

      <!-- Input de Escaneo (Modo QR) -->
      <div v-if="!scannedTicket && !isSearching" class="animate-in fade-in duration-300 space-y-4">
         <label class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] ml-1 transition-colors block">Escanear ticket (QR)</label>
         <div class="relative">
           <QrCodeIcon class="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
           <input
             ref="qrInput"
             v-model="ticketNumberQuery"
             type="text"
             placeholder="Esperando QR o folio..."
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

      <!-- Vista de Búsqueda por Cliente -->
      <div v-else-if="!scannedTicket && isSearching" class="animate-in fade-in duration-300 space-y-4">
         <label class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] ml-1 transition-colors block">Buscar por cliente / folio</label>
         <div class="relative flex gap-3">
           <div class="relative flex-1">
             <SearchIcon class="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
             <input
               v-model="searchQuery"
               type="text"
               placeholder="Nombre del cliente o folio del ticket..."
               class="w-full bg-slate-50 dark:bg-card-dark border border-slate-200 dark:border-border-dark focus:border-primary outline-none pl-11 pr-4 py-3 rounded-xl text-slate-800 dark:text-slate-100 text-sm font-semibold transition-all"
               @keydown.enter="searchTickets"
             />
           </div>
           <button
             type="button"
             @click="searchTickets"
             :disabled="searchLoading"
             class="px-5 py-3 bg-primary hover:bg-primary/90 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all active:scale-95 disabled:opacity-50"
           >
             {{ searchLoading ? 'Buscando...' : 'Buscar' }}
           </button>
         </div>

         <!-- Errores de Búsqueda -->
         <div v-if="searchError" class="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold rounded-xl">
           {{ searchError }}
         </div>

         <!-- Listado de tickets encontrados -->
         <div class="relative min-h-[150px] max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
           <!-- Spinner de carga -->
           <div v-if="searchLoading" class="absolute inset-0 bg-white/50 dark:bg-slate-900/50 flex items-center justify-center z-10 rounded-xl backdrop-blur-[1px]">
             <div class="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
           </div>

           <!-- Lista de resultados -->
           <div v-if="foundTickets.length > 0" class="space-y-2">
             <div
               v-for="ticket in foundTickets"
               :key="ticket.id"
               class="p-3 bg-white dark:bg-card-dark border border-slate-150 dark:border-white/5 rounded-xl hover:border-primary/40 dark:hover:border-primary/30 transition-all flex items-center justify-between shadow-sm group"
             >
               <div class="min-w-0 flex-1 pr-3">
                 <div class="flex items-center gap-2 mb-1">
                   <span class="font-mono text-xs font-black text-slate-400 group-hover:text-primary transition-colors">
                     {{ ticket.ticket_number }}
                   </span>
                   <span class="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider bg-slate-100 dark:bg-white/10 text-slate-500">
                     {{ ticket.ticket_type === 'layaway' ? 'Apartado' : 'Venta' }}
                   </span>
                 </div>
                 <h4 class="text-xs font-black text-slate-800 dark:text-slate-100 truncate">
                   {{ ticket.customer_name || ticket.client?.name || 'Cliente sin nombre' }}
                 </h4>
                 <p class="text-[10px] text-slate-500 mt-0.5">
                   {{ ticket.created_at_formatted }}
                 </p>
               </div>
               <div class="text-right shrink-0 flex flex-col items-end gap-1.5">
                 <span class="text-xs font-black text-slate-950 dark:text-white">
                   {{ formatMoney(ticket.total) }}
                 </span>
                 <button
                   type="button"
                   @click="selectTicket(ticket)"
                   class="px-3 py-1.5 bg-primary hover:bg-primary/90 text-white rounded-lg text-[10px] font-black uppercase tracking-wider active:scale-[0.98] transition-all flex items-center gap-1"
                 >
                   <span>Seleccionar</span>
                   <ChevronRightIcon class="w-3.5 h-3.5" />
                 </button>
               </div>
             </div>
           </div>

           <!-- Empty State -->
           <div v-else-if="!searchLoading && hasSearched" class="flex flex-col items-center justify-center text-slate-400 py-8">
             <div class="w-12 h-12 bg-slate-100 dark:bg-white/5 rounded-xl flex items-center justify-center mb-2">
               <InboxIcon class="w-6 h-6 opacity-20" />
             </div>
             <p class="text-[10px] font-black uppercase tracking-widest opacity-40">No se encontraron tickets</p>
             <p class="text-[11px] mt-1 text-slate-400 text-center">
               Intenta ingresando otro término de búsqueda.
             </p>
           </div>
         </div>
      </div>

      <!-- Detalle del Ticket y Selección -->
      <div v-else class="space-y-6 animate-in zoom-in-95 duration-300">
          <div class="p-4 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10">
             <p class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] ml-1 transition-colors mb-1">Ticket encontrado</p>
             <h4 class="text-lg font-black text-slate-800 dark:text-white break-all leading-tight">{{ scannedTicket.ticket_number }}</h4>
             <p class="text-[11px] text-slate-600 dark:text-slate-400 mt-1 font-semibold flex flex-wrap gap-x-2 gap-y-1">
                <span>Cliente: {{ scannedTicket.customer_name || scannedTicket.client?.name || 'Cliente sin nombre' }}</span>
                <span>•</span>
                <span>{{ scannedTicket.created_at_formatted || scannedTicket.created_at }}</span>
             </p>
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
                <RotateCcwIcon class="w-4 h-4 mr-2" />
                Buscar o escanear otro ticket
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
import { ref, watch, nextTick, computed } from 'vue'
import { QrCodeIcon, InfoIcon, ShirtIcon, RotateCcwIcon, SearchIcon, ChevronRightIcon, InboxIcon } from 'lucide-vue-next'
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

// Estados para búsqueda por cliente
const isSearching = ref(false)
const searchQuery = ref('')
const foundTickets = ref([])
const searchLoading = ref(false)
const searchError = ref('')
const hasSearched = ref(false)

// Títulos dinámicos de modal
const modalTitle = computed(() => {
  if (scannedTicket.value) return 'Detalle de ticket para cambio'
  return isSearching.value ? 'Buscar ticket para cambio' : 'Escaneo de ticket para cambio'
})

const modalSubtitle = computed(() => {
  if (scannedTicket.value) return 'Haz clic en el botón de regreso para agregar el producto a la mesa de cambios.'
  return isSearching.value 
    ? 'Busca por nombre de cliente o número de ticket para localizar la compra original.' 
    : 'Escanea el código QR del ticket original para gestionar la devolución.'
})

watch(() => props.show, (newVal) => {
  if (newVal) {
    resetScanner()
  }
})

const resetScanner = () => {
  ticketNumberQuery.value = ''
  scannedTicket.value = null
  error.value = ''
  searchQuery.value = ''
  foundTickets.value = []
  searchError.value = ''
  hasSearched.value = false
  
  nextTick(() => {
    if (!isSearching.value) {
      qrInput.value?.focus()
    }
  })
}

const setMode = (searching) => {
  isSearching.value = searching
  resetScanner()
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

const searchTickets = async () => {
  if (!searchQuery.value.trim()) {
    foundTickets.value = []
    return
  }
  searchLoading.value = true
  searchError.value = ''
  hasSearched.value = true
  try {
    const response = await api.get('/api/tickets/search', {
      params: { search: searchQuery.value }
    })
    foundTickets.value = response.data || []
  } catch (err) {
    console.error('Error searching tickets:', err)
    searchError.value = 'Ocurrió un error al buscar los tickets.'
  } finally {
    searchLoading.value = false
  }
}

const selectTicket = (ticket) => {
  scannedTicket.value = ticket
}

const addToCartAsReturn = (detail) => {
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

<template>
  <div class="flex h-[calc(100vh-64px)] -m-4 md:-m-8 overflow-hidden">

    <!-- Main Column: Scan + Cart -->
    <div class="flex-1 flex flex-col p-6 overflow-hidden">

      <!-- Scan Bar -->
      <div class="glass-panel rounded-xl p-5 mb-6 flex items-center gap-5 border border-primary/10 shrink-0">
        <div class="bg-primary/10 p-3 rounded-xl shrink-0">
          <ScanLineIcon class="w-6 h-6 text-primary" />
        </div>
        <input
          ref="barcodeInput"
          v-model="barcodeQuery"
          autofocus
          type="text"
          placeholder="Escanear código de barras o ingresarlo..."
          class="flex-1 bg-transparent border-none outline-none text-xl font-black text-slate-800 dark:text-slate-100 placeholder:text-slate-400 placeholder:font-normal"
          @keydown.enter="onBarcodeSubmit"
        />
        <div class="text-[11px] font-black text-slate-500 uppercase tracking-widest px-4 py-2 border border-border-light dark:border-white/10 rounded-lg shrink-0">
          Enter para agregar
        </div>
      </div>

      <!-- Cart Table -->
      <div class="flex-1 glass-panel rounded-xl overflow-hidden flex flex-col">
        <div class="px-6 py-4 border-b border-border-light dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/30 flex justify-between items-center shrink-0">
          <h3 class="text-[11px] font-black uppercase tracking-widest text-slate-500">
            Venta Actual — {{ cartItems.length }} {{ cartItems.length === 1 ? 'Artículo' : 'Artículos' }}
          </h3>
          <button @click="clearCart" class="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1.5">
            <Trash2Icon class="w-3.5 h-3.5" />
            Limpiar Todo
          </button>
        </div>

        <div class="flex-1 overflow-y-auto custom-scrollbar">
          <table class="w-full text-left border-collapse">
            <thead class="sticky top-0 bg-panel-light/95 dark:bg-white/5 backdrop-blur border-b border-border-light dark:border-border-dark z-10">
              <tr>
                <th class="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Producto</th>
                <th class="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">SKU</th>
                <th class="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap text-right">Unitario</th>
                <th class="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap text-center">Cantidad</th>
                <th class="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap text-right">Total</th>
                <th class="px-4 py-2.5 w-10"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border-light dark:divide-border-dark">
              <TransitionGroup name="row">
                <tr
                  v-for="(item, index) in cartItems"
                  :key="item.id"
                  class="hover:bg-panel-light dark:hover:bg-white/5 transition-colors group"
                >
                  <!-- Product -->
                  <td class="px-4 py-2">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-[#1e293b] overflow-hidden border border-border-light dark:border-white/5 shrink-0">
                        <img v-if="item.image" :src="item.image" :alt="item.name" class="w-full h-full object-cover" />
                        <div v-else class="w-full h-full flex items-center justify-center text-slate-400">
                          <ShirtIcon class="w-5 h-5" />
                        </div>
                      </div>
                      <div class="min-w-0 max-w-[160px]">
                        <p class="text-xs leading-tight font-bold text-slate-800 dark:text-slate-200 whitespace-normal line-clamp-2">{{ item.name }}</p>
                        <p class="text-[9px] text-slate-500 mt-1 truncate">
                          <span v-if="item.size">{{ item.size }}</span>
                          <span v-if="item.size && item.color"> | </span>
                          <span v-if="item.color">{{ item.color }}</span>
                        </p>
                      </div>
                    </div>
                  </td>
                  <!-- SKU -->
                  <td class="px-4 py-2">
                    <span class="font-mono text-[11px] text-slate-400">{{ item.barcode || '—' }}</span>
                  </td>
                  <!-- Unit Price -->
                  <td class="px-4 py-2 text-right">
                    <span class="text-[13px] font-medium text-slate-600 dark:text-slate-300">{{ formatCurrency(item.sale_price) }}</span>
                  </td>
                  <!-- Qty Controls -->
                  <td class="px-4 py-2">
                    <div class="flex items-center justify-center gap-2">
                      <button
                        @click="updateQty(index, -1)"
                        class="w-7 h-7 rounded-lg border border-border-light dark:border-white/10 hover:border-primary/50 hover:text-primary flex items-center justify-center text-slate-400 transition-all"
                      >
                        <MinusIcon class="w-3.5 h-3.5" />
                      </button>
                      <span class="text-sm font-black text-slate-800 dark:text-slate-100 w-5 text-center">{{ String(item.qty).padStart(2, '0') }}</span>
                      <button
                        @click="updateQty(index, 1)"
                        class="w-7 h-7 rounded-lg border border-border-light dark:border-white/10 hover:border-primary/50 hover:text-primary flex items-center justify-center text-slate-400 transition-all"
                      >
                        <PlusIcon class="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                  <!-- Subtotal -->
                  <td class="px-4 py-2 text-right">
                    <span class="text-sm font-black text-primary">{{ formatCurrency(item.sale_price * item.qty) }}</span>
                  </td>
                  <!-- Delete -->
                  <td class="px-4 py-2 text-right">
                    <button @click="removeFromCart(index)" class="text-slate-300 dark:text-slate-600 hover:text-red-500 transition-colors">
                      <XIcon class="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              </TransitionGroup>
            </tbody>
          </table>

          <!-- Empty State -->
          <div v-if="cartItems.length === 0" class="h-full min-h-[300px] flex flex-col items-center justify-center text-slate-400 py-20">
            <div class="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center mb-4">
              <ShoppingCartIcon class="w-9 h-9 opacity-20" />
            </div>
            <p class="text-sm font-black uppercase tracking-widest opacity-40">Carrito Vacío</p>
            <p class="text-xs mt-1 text-slate-400">Escanea un código para comenzar</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Sidebar: Summary -->
    <aside class="w-[330px] shrink-0 bg-card-light dark:bg-card-dark border-l border-border-light dark:border-border-dark flex flex-col p-6 overflow-y-auto custom-scrollbar">

      <!-- Customer -->
      <div class="mb-8">
        <h3 class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Cliente</h3>
        <div class="bg-panel-light dark:bg-background-dark rounded-xl p-4 border border-border-light dark:border-border-dark flex items-center gap-3 shadow-sm dark:shadow-none">
          <div class="bg-white dark:bg-card-dark border border-border-light dark:border-border-dark p-2 rounded-full shrink-0">
            <UserIcon class="w-5 h-5 text-slate-400" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{{ currentCustomer }}</p>
            <p class="text-[10px] text-primary uppercase tracking-widest font-black">Venta Directa</p>
          </div>
          <button class="text-slate-400 hover:text-primary transition-colors shrink-0">
            <EditIcon class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Order Summary -->
      <div class="flex-1">
        <h3 class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Resumen de Orden</h3>
        <div class="space-y-4">
          <div class="flex justify-between items-center text-slate-500 dark:text-slate-400">
            <span class="text-sm font-medium">Subtotal</span>
            <span class="text-sm font-mono tracking-tight">{{ formatCurrency(subtotal) }}</span>
          </div>
          <div class="flex justify-between items-center text-emerald-500">
            <span class="text-sm font-medium">Descuento</span>
            <span class="text-sm font-mono tracking-tight">-$0.00</span>
          </div>

          <div class="h-px bg-border-light dark:bg-white/10 my-2"></div>

          <div class="pt-4 flex flex-col items-center justify-center text-center">
            <span class="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-3">Total a Pagar</span>
            <div class="flex items-baseline justify-center gap-2">
              <span class="block text-4xl font-black text-primary leading-none tracking-normal" style="text-shadow: 0 0 40px rgba(59,130,246,0.5)">
                {{ formatCurrency(total) }}
              </span>
              <span class="text-[10px] text-slate-400/80 font-bold uppercase tracking-widest pl-1">MXN</span>
            </div>

            <!-- Context Metadata -->
            <div class="mt-5 flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-white/5 rounded-full border border-border-light dark:border-white/5">
              <CalendarIcon class="w-3 h-3 text-slate-400" />
              <ClientOnly>
                <span class="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                  {{ new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) }} — {{ new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) }}
                </span>
                <template #fallback>
                  <span class="text-[9px] font-bold text-slate-500 uppercase tracking-widest shadow-sm">Calculando fecha...</span>
                </template>
              </ClientOnly>
            </div>
          </div>
        </div>
      </div>

      <!-- Payment Methods + Checkout -->
      <div class="mt-8 space-y-4">
        <div class="grid grid-cols-3 gap-3">
          <button
            @click="paymentMethod = 'card'"
            class="relative flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-300"
            :class="paymentMethod === 'card'
              ? 'bg-primary border-primary text-white shadow-[0_0_25px_#3b82f6aa] dark:shadow-[0_0_30px_#3b82f6cc] scale-[1.03] z-10'
              : 'bg-panel-light dark:bg-background-dark border-border-light dark:border-border-dark text-slate-400 hover:border-primary/30 shadow-sm dark:shadow-none'"
          >
            <CreditCardIcon class="w-5 h-5 mb-2" />
            <span class="text-[9px] font-black uppercase tracking-widest text-center">Tarjeta</span>
          </button>
          <button
            @click="paymentMethod = 'cash'"
            class="relative flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-300"
            :class="paymentMethod === 'cash'
              ? 'bg-primary border-primary text-white shadow-[0_0_25px_#3b82f6aa] dark:shadow-[0_0_30px_#3b82f6cc] scale-[1.03] z-10'
              : 'bg-panel-light dark:bg-background-dark border-border-light dark:border-border-dark text-slate-400 hover:border-primary/30 shadow-sm dark:shadow-none'"
          >
            <BanknoteIcon class="w-5 h-5 mb-2" />
            <span class="text-[9px] font-black uppercase tracking-widest text-center">Efectivo</span>
          </button>
          <button
            @click="paymentMethod = 'transfer'"
            class="relative flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-300"
            :class="paymentMethod === 'transfer'
              ? 'bg-primary border-primary text-white shadow-[0_0_25px_#3b82f6aa] dark:shadow-[0_0_30px_#3b82f6cc] scale-[1.03] z-10'
              : 'bg-panel-light dark:bg-background-dark border-border-light dark:border-border-dark text-slate-400 hover:border-primary/30 shadow-sm dark:shadow-none'"
          >
            <ArrowRightLeftIcon class="w-5 h-5 mb-2" />
            <span class="text-[9px] font-black uppercase tracking-widest text-center">Transf.</span>
          </button>
        </div>

        <button
          @click="onCheckout"
          :disabled="cartItems.length === 0 || loading"
          class="w-full py-5 bg-primary hover:bg-primary/90 text-white font-black text-base uppercase tracking-widest rounded-xl shadow-[0_0_40px_rgba(59,130,246,0.25)] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
        >
          <div v-if="loading" class="animate-spin rounded-full h-5 w-5 border-4 border-white border-t-transparent"></div>
          <ReceiptIcon v-else class="w-6 h-6" />
          {{ loading ? 'Procesando...' : 'Cobrar' }}
        </button>

        <button
          @click="onExchange"
          class="w-full py-3.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 font-bold text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 border border-border-light dark:border-white/5 active:scale-95"
        >
          <RefreshCcwIcon class="w-4 h-4" />
          Realizar Cambio
        </button>

        <div class="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
          <LockIcon class="w-3.5 h-3.5" />
          Transacción Segura Chesan
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  ScanLineIcon,
  Trash2Icon,
  PlusIcon,
  MinusIcon,
  XIcon,
  ShoppingCartIcon,
  ShirtIcon,
  UserIcon,
  EditIcon,
  CreditCardIcon,
  BanknoteIcon,
  ReceiptIcon,
  LockIcon,
  ArrowRightLeftIcon,
  CalendarIcon,
  RefreshCcwIcon
} from 'lucide-vue-next'

// — State —
const barcodeInput = ref(null)
const barcodeQuery = ref('')
const loading = ref(false)
const paymentMethod = ref('cash')
const currentCustomer = ref('Venta Directa / Mostrador')

// — Mock cart data —
const cartItems = ref([
  {
    id: 1,
    name: 'Polo Industrial Reforzado',
    barcode: 'UNF-PL-NV-L',
    size: 'L',
    color: 'Navy',
    sale_price: 245.00,
    quantity: 10,
    qty: 2,
    image: null
  },
  {
    id: 2,
    name: 'Pantalón Cargo Alta Resistencia',
    barcode: 'UNF-CR-KH-34',
    size: '34',
    color: 'Khaki',
    sale_price: 580.00,
    quantity: 5,
    qty: 1,
    image: null
  },
  {
    id: 3,
    name: 'Gorra de Protección Térmica',
    barcode: 'UNF-CP-BK-OS',
    size: 'Única',
    color: 'Negro',
    sale_price: 120.00,
    quantity: 8,
    qty: 3,
    image: null
  }
])

// — Computed —
const subtotal = computed(() =>
  cartItems.value.reduce((acc, item) => acc + item.sale_price * item.qty, 0)
)
const total = computed(() => subtotal.value)

// — Helpers —
const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(value)
}

// — Actions —
onMounted(() => barcodeInput.value?.focus())

const onBarcodeSubmit = async () => {
  if (!barcodeQuery.value.trim()) return
  const query = barcodeQuery.value.trim()
  barcodeQuery.value = ''

  // TODO: replace with real API call
  const mockProduct = {
    id: Date.now(),
    name: `Producto (${query})`,
    barcode: query,
    size: '',
    color: '',
    sale_price: 0,
    quantity: 99,
    qty: 1,
    image: null
  }
  addToCart(mockProduct)
  barcodeInput.value?.focus()
}

const addToCart = (product) => {
  const existing = cartItems.value.find(i => i.id === product.id)
  if (existing) {
    if (existing.qty < existing.quantity) existing.qty++
    else alert('Stock máximo alcanzado para este producto.')
  } else {
    cartItems.value.unshift({ ...product, qty: 1 })
  }
}

const removeFromCart = (index) => cartItems.value.splice(index, 1)

const updateQty = (index, delta) => {
  const item = cartItems.value[index]
  const newQty = item.qty + delta
  if (newQty < 1) { removeFromCart(index); return }
  if (newQty > item.quantity) { alert('No hay más stock disponible.'); return }
  item.qty = newQty
}

const clearCart = () => {
  if (cartItems.value.length === 0) return
  if (confirm('¿Vaciar el carrito?')) cartItems.value = []
}

const onCheckout = async () => {
  if (!cartItems.value.length) return
  loading.value = true
  await new Promise(r => setTimeout(r, 1500))
  alert('¡Venta registrada exitosamente! 🎉')
  cartItems.value = []
  loading.value = false
  barcodeInput.value?.focus()
}

const onExchange = () => {
  // TODO: Open exchange modal or redirect to exchange flow
  alert('Iniciando flujo de cambio de producto...')
}
</script>

<style scoped>
.glass-panel {
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(0, 0, 0, 0.06);
  backdrop-filter: blur(12px);
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}
.dark .glass-panel {
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: none;
}

/* Row transition */
.row-enter-active, .row-leave-active { transition: all 0.35s ease; }
.row-enter-from { opacity: 0; transform: translateY(-12px); }
.row-leave-to  { opacity: 0; transform: translateX(20px); }

.custom-scrollbar::-webkit-scrollbar { width: 5px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(148,163,184,0.15); border-radius: 10px; }
</style>

<template>
  <BaseModal
    :show="show"
    :title="orderToEdit ? 'Editar pedido interno' : 'Nuevo pedido de producción'"
    :subtitle="orderToEdit ? 'Modifique los detalles del pedido interno.' : 'Registre los detalles del cliente y los productos a fabricar.'"
    size="4xl"
    @update:show="close"
  >
    <form @submit.prevent="onSubmit" class="space-y-6">
      <!-- Selector de Tipo y Pedido Interno -->
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div class="flex gap-1.5 p-1 bg-slate-100 dark:bg-white/5 rounded-xl w-fit border border-slate-200 dark:border-white/10">
          <button 
            type="button"
            @click="form.type = 'uniform'"
            :class="form.type === 'uniform' ? 'bg-white dark:bg-white/10 shadow-sm text-primary font-bold' : 'text-slate-500 font-medium'"
            class="px-4 py-1.5 rounded-lg text-xs transition-all flex items-center gap-2"
          >
            <ShirtIcon class="w-3.5 h-3.5" /> Uniformes
          </button>
          <button 
            type="button"
            @click="form.type = 'embroidery'"
            :class="form.type === 'embroidery' ? 'bg-white dark:bg-white/10 shadow-sm text-primary font-bold' : 'text-slate-500 font-medium'"
            class="px-4 py-1.5 rounded-lg text-xs transition-all flex items-center gap-2"
          >
            <PaletteIcon class="w-3.5 h-3.5" /> Solo Bordado
          </button>
        </div>

        <div class="h-[44px] flex items-center justify-center bg-primary/5 dark:bg-primary/10 px-4 rounded-xl border border-primary/10 hover:border-primary/20 transition-all group">
          <label class="flex items-center gap-3 cursor-pointer select-none w-full justify-center">
            <div class="relative flex items-center">
              <input 
                type="checkbox" 
                v-model="form.is_internal" 
                class="peer sr-only"
              />
              <div class="w-10 h-5 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-checked:bg-primary transition-all duration-300"></div>
              <div class="absolute left-1 top-1 w-3 h-3 bg-white rounded-full peer-checked:translate-x-5 transition-all duration-300 shadow-sm"></div>
            </div>
            <div class="flex flex-col">
              <span class="text-[10px] font-black text-primary uppercase tracking-widest leading-none mb-0.5">Pedido</span>
              <span class="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase leading-none">Interno</span>
            </div>
          </label>
        </div>
      </div>

      <!-- Info General -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5 pb-6 border-b border-dashed border-slate-200 dark:border-slate-800">
        <div class="flex flex-col gap-1.5 md:col-span-2">
          <label class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] ml-1 transition-colors">Cliente</label>
          <Select 
            v-model="form.client_id" 
            :options="catalogs.clients" 
            placeholder="Seleccionar cliente..." 
            searchable 
            creatable
            @create="handleCreateClient"
            :loading="catalogs.loading"
          />
        </div>
        <div class="flex flex-col gap-1.5 md:col-span-1">
          <label class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] ml-1 transition-colors">Fecha de entrega</label>
          <input 
            v-model="form.delivery_date" 
            type="date" 
            class="w-full bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-primary transition-all outline-none px-4 py-2 rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 dark:[color-scheme:dark]"
            required
          />
        </div>
      </div>

      <!-- Items del Pedido -->
      <div class="space-y-4">
        <!-- Selector Maestro de Inventario (Solo Pedidos Internos) -->
        <div v-if="form.is_internal" class="p-5 bg-primary/5 dark:bg-primary/10 rounded-2xl border border-primary/10 space-y-4">
          <div class="flex items-center justify-between">
            <h4 class="text-xs font-black uppercase tracking-wider text-primary">Buscar e importar de Inventario</h4>
            <span class="text-[10px] text-slate-400 font-medium">Seleccione una prenda existente del inventario para vincularla al pedido</span>
          </div>
          <div class="flex flex-col md:flex-row gap-4 items-end">
            <div class="flex-1 min-w-0">
              <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Producto en stock</label>
              <Select 
                v-model="selectedStockProductId" 
                :options="stockProductOptions" 
                placeholder="Buscar por nombre, talla, cliente..." 
                searchable
                :loading="loadingStockProducts"
              />
            </div>
            <div class="w-24 shrink-0">
              <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Cantidad</label>
              <input 
                v-model.number="tempQuantity" 
                type="number" 
                min="1" 
                class="w-full bg-white dark:bg-[#1e293b] border-2 border-slate-200/60 dark:border-transparent focus:border-primary/50 transition-all outline-none px-3 py-2.5 rounded-xl text-sm font-black text-center text-slate-800 dark:text-slate-200"
              />
            </div>
            <button 
              type="button" 
              @click="addStockProductItem" 
              :disabled="!selectedStockProductId"
              class="h-[46px] px-6 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all whitespace-nowrap"
            >
              Agregar
            </button>
          </div>
        </div>

        <div class="flex items-center justify-between">
          <h3 class="text-sm font-black uppercase tracking-widest text-slate-400">
            {{ form.type === 'uniform' ? 'Productos del Pedido' : 'Detalles de Bordado' }}
          </h3>
          <button type="button" @click="addItem" class="text-xs font-bold text-primary hover:text-primary/80 flex items-center gap-1.5 transition-colors">
            <PlusIcon class="w-4 h-4" />
            {{ form.type === 'uniform' ? 'Añadir producto' : 'Añadir concepto' }}
          </button>
        </div>

        <div class="grid grid-cols-1 gap-4">
          <div v-for="(item, idx) in form.items" :key="idx" class="relative group bg-white dark:bg-white/[0.03] rounded-2xl border border-slate-200 dark:border-white/10 p-5 transition-all hover:shadow-xl hover:shadow-primary/5">
            <!-- First Row: Product and Color -->
            <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
              <div :class="[form.is_internal && !item.stock_product_id ? 'md:col-span-8' : 'md:col-span-12', 'flex flex-col gap-1.5']">
                <div class="flex items-center justify-between">
                  <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Producto / Concepto</label>
                  <span v-if="item.stock_product_id" class="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-md text-[9px] font-black uppercase tracking-wider">
                    Vinculado a Inventario
                  </span>
                </div>
                <input 
                  v-model="item.product_name" 
                  :placeholder="form.type === 'uniform' ? 'Ej. Playera Polo' : 'Ej. Bordado espalda chamarra'"
                  class="w-full bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-primary transition-all outline-none px-4 py-2 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-200 disabled:opacity-75 disabled:cursor-not-allowed"
                  :disabled="!!item.stock_product_id"
                  required
                />
              </div>
              <div v-if="form.is_internal && !item.stock_product_id" class="md:col-span-4 flex flex-col gap-1.5">
                <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Categoría</label>
                <Select 
                  v-model="item.category_id" 
                  :options="catalogs.categories" 
                  placeholder="Seleccionar..." 
                  searchable 
                  compact
                  required
                  menu-width="mt-2 w-80 md:w-[450px] rounded-lg right-0 top-full"
                />
              </div>
            </div>

            <!-- Second Row: Size, Quantity, Price -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-white/5 items-center">
              <div v-if="form.type === 'uniform'" class="flex flex-col gap-1.5">
                <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Talla</label>
                <input 
                  v-model="item.size" 
                  placeholder="Ej. 10 o M"
                  class="w-full bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-primary transition-all outline-none px-4 py-2 rounded-xl text-sm text-center font-bold text-slate-700 dark:text-slate-300 disabled:opacity-75 disabled:cursor-not-allowed"
                  :disabled="!!item.stock_product_id"
                />
              </div>

              <div class="flex flex-col gap-1.5">
                <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Cantidad</label>
                <input 
                  v-model.number="item.quantity" 
                  type="number" 
                  v-numeric
                  class="w-full bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-primary transition-all outline-none px-4 py-2 rounded-xl text-sm text-center font-black text-slate-900 dark:text-white"
                  min="1"
                  required
                />
              </div>

              <div class="flex flex-col gap-1.5">
                <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">P. Unitario</label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                  <input 
                    v-model.number="item.unit_price" 
                    type="number" 
                    v-numeric.decimal
                    step="0.01"
                    class="w-full bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-primary transition-all outline-none pl-7 pr-4 py-2 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 text-right disabled:opacity-75 disabled:cursor-not-allowed"
                    :disabled="!!item.stock_product_id"
                    required
                  />
                </div>
              </div>

              <div class="flex flex-col gap-1.5">
                <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Extras</label>
                <button type="button" @click="toggleExtras(idx)" class="h-10 flex items-center justify-center gap-2 bg-slate-50 dark:bg-white/5 border-2 border-transparent hover:border-primary/30 transition-all rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400">
                  <span v-if="item.extras?.length" class="text-primary font-black">+{{ item.extras.length }} Conceptos</span>
                  <span v-else>Añadir</span>
                  <Settings2Icon class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <!-- Third Row: Observations -->
            <div class="mt-4 pt-4 border-t border-slate-100 dark:border-white/5">
              <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Notas especiales del ítem</label>
              <textarea 
                v-model="item.observations"
                rows="2"
                placeholder="Detalles específicos para producción o bordado..."
                class="w-full bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-primary transition-all outline-none px-4 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 placeholder:text-slate-400"
              ></textarea>
            </div>

            <!-- Delete Button (Absolute) -->
            <button 
              v-if="form.items.length > 1" 
              type="button" 
              @click="removeItem(idx)" 
              class="absolute -top-2 -right-2 w-7 h-7 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-full shadow-lg text-slate-400 hover:text-red-500 hover:scale-110 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 z-10"
            >
              <TrashIcon class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <!-- Totales y Notas -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
        <div class="space-y-4">
          <div class="flex flex-col gap-1.5">
            <label class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] ml-1 transition-colors">Notas u observaciones</label>
            <textarea 
              v-model="form.notes" 
              rows="3" 
              class="w-full bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-primary transition-all outline-none px-4 py-3 rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
              placeholder="Detalles adicionales sobre la fabricación o bordado..."
            ></textarea>
          </div>
        </div>

        <div class="bg-slate-50 dark:bg-white/5 rounded-2xl p-6 space-y-4 border border-slate-200 dark:border-slate-800">
          <div class="flex justify-between items-center text-sm">
            <span class="font-bold text-slate-500">Subtotal</span>
            <span class="font-bold text-slate-900 dark:text-white">${{ subtotal.toFixed(2) }}</span>
          </div>
          <div v-if="!form.is_internal" class="flex justify-between items-center gap-4">
            <span class="text-sm font-bold text-slate-500 whitespace-nowrap">Anticipo</span>
            <div class="relative flex-1 max-w-[120px]">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
              <input 
                v-model.number="form.advance_payment" 
                type="number" 
                v-numeric.decimal
                class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg pl-6 pr-3 py-1.5 text-sm font-black text-emerald-600 dark:text-emerald-400 outline-none focus:border-emerald-500"
              />
            </div>
          </div>
          <div class="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <span class="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">Total del Pedido</span>
            <span class="text-2xl font-black text-primary">${{ subtotal.toFixed(2) }}</span>
          </div>
        </div>
      </div>

      <!-- Acciones -->
      <div class="flex items-center justify-end gap-3 pt-6 border-t border-slate-100 dark:border-white/5">
        <BaseButton type="button" variant="secondary" @click="close" :disabled="saving">
          Cancelar
        </BaseButton>
        <BaseButton type="submit" variant="primary" :loading="saving" :loading-text="orderToEdit ? 'Guardando cambios...' : 'Generando Pedido...'">
          {{ orderToEdit ? 'Guardar cambios' : 'Confirmar y enviar a producción' }}
        </BaseButton>
      </div>

      <!-- Extras Sub-Modal for Order -->
      <BaseModal v-model:show="showExtrasModal" title="Extras del Ítem" size="sm">
         <div class="space-y-4 py-2">
            <div v-for="(ex, ei) in currentExtras" :key="ei" class="flex gap-2">
               <input v-model="ex.description" placeholder="Logo extra" class="flex-1 bg-slate-100 dark:bg-white/5 border-none outline-none px-2 py-1 text-xs rounded" />
               <input v-model.number="ex.cost" type="number" v-numeric.decimal class="w-16 bg-slate-100 dark:bg-white/5 border-none outline-none px-2 py-1 text-xs text-right" />
            </div>
            <button type="button" @click="currentExtras.push({description: '', cost: 0})" class="text-[10px] text-primary">+ Añadir concepto</button>
         </div>
         <template #footer>
            <BaseButton variant="primary" size="sm" @click="saveExtras">Guardar</BaseButton>
         </template>
      </BaseModal>
    </form>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { PlusIcon, TrashIcon, ShirtIcon, PaletteIcon, Settings2Icon } from 'lucide-vue-next'
import BaseModal from '~/components/BaseModal.vue'
import BaseButton from '~/components/BaseButton.vue'
import Select from '~/components/Select.vue'
import { useCatalogs } from '~/composables/useCatalogs'
import { useProductionStore } from '~/stores/production'
import { useToast } from '~/stores/toast'

const props = defineProps<{
  show: boolean
  orderToEdit?: any
}>()

const emit = defineEmits(['update:show', 'saved'])

const catalogs = useCatalogs()
const productionStore = useProductionStore()
const toast = useToast()
const saving = ref(false)

interface OrderExtra {
  description: string
  cost: number
}

interface OrderItem {
  product_name: string
  size: string
  quantity: number
  unit_price: number
  extras: OrderExtra[]
  observations: string
  stock_product_id?: number | null
  category_id?: number | null
}

const form = reactive({
  client_id: '',
  type: 'uniform',
  is_internal: false,
  delivery_date: '',
  advance_payment: 0,
  notes: '',
  items: [
    { product_name: '', size: '', quantity: 1, unit_price: 0, extras: [], observations: '', stock_product_id: null, category_id: null }
  ] as OrderItem[]
})

const subtotal = computed(() => {
  return form.items.reduce((acc, item) => {
    const extrasCost = (item.extras || []).reduce((sum, e) => sum + (Number(e.cost) || 0), 0)
    return acc + (item.quantity * (item.unit_price + extrasCost))
  }, 0)
})

// Variables para buscar prendas en el inventario
const stockProducts = ref<any[]>([])
const loadingStockProducts = ref(false)
const selectedStockProductId = ref('')
const tempQuantity = ref(1)

const stockProductOptions = computed(() => {
  return stockProducts.value.map((p: any) => {
    const sizeStr = p.size?.name ? `Talla: ${p.size.name}` : 'Sin Talla'
    const instStr = p.institution?.name ? `Cliente: ${p.institution.name}` : 'CheSan / General'
    const priceStr = `$${Number(p.sale_price).toFixed(2)}`
    const qtyStr = `Stock: ${p.quantity}`
    return {
      label: `${p.name} (${sizeStr}) | ${instStr} | ${priceStr} | ${qtyStr}`,
      value: p.id
    }
  })
})

const fetchStockProducts = async () => {
  if (loadingStockProducts.value) return
  try {
    loadingStockProducts.value = true
    const api = useApi()
    const res = await api.get('/api/stock-products', {
      params: {
        per_page: 500,
        sort_by: 'name',
        sort_direction: 'asc'
      }
    })
    stockProducts.value = res.data?.data || res.data || []
  } catch (err) {
    console.error('Error fetching stock products:', err)
  } finally {
    loadingStockProducts.value = false
  }
}

const addStockProductItem = () => {
  const prod = stockProducts.value.find(p => p.id == selectedStockProductId.value)
  if (!prod) return
  
  // Si solo hay un ítem vacío inicial, lo removemos
  if (form.items.length === 1 && !form.items[0].product_name && !form.items[0].stock_product_id) {
    form.items.splice(0, 1)
  }

  form.items.push({
    product_name: prod.name,
    size: prod.size?.name || '',
    quantity: Number(tempQuantity.value) || 1,
    unit_price: Number(prod.sale_price) || 0,
    extras: [],
    observations: '',
    stock_product_id: prod.id,
    category_id: prod.category_id || null
  })

  selectedStockProductId.value = ''
  tempQuantity.value = 1
  toast.success('Producto de inventario agregado al pedido')
}

// Extras logic
const showExtrasModal = ref(false)
const currentItemIdx = ref(-1)
const currentExtras = ref<OrderExtra[]>([])

const toggleExtras = (idx: number) => {
  currentItemIdx.value = idx
  const item = form.items[idx]
  if (item) {
    currentExtras.value = JSON.parse(JSON.stringify(item.extras || []))
    showExtrasModal.value = true
  }
}

const saveExtras = () => {
  const item = form.items[currentItemIdx.value]
  if (item) {
    item.extras = currentExtras.value.filter(e => e.description)
  }
  showExtrasModal.value = false
}

const handleCreateClient = async (name: string) => {
  const api = useApi()
  try {
    const res = await (api as any).post('/api/clients', { name })
    await catalogs.fetchAll()
    form.client_id = res.data.id
    toast.success('Nuevo cliente registrado')
  } catch (err) {
    toast.error('Error al crear cliente')
  }
}

const getDefaultCategoryId = () => {
  const generalCat = catalogs.categories.find((c: any) => c.label.toLowerCase() === 'general')
  return generalCat ? generalCat.value : null
}

const addItem = () => {
  form.items.push({
    product_name: '',
    size: '',
    quantity: 1,
    unit_price: 0,
    extras: [],
    observations: '',
    stock_product_id: null,
    category_id: form.is_internal ? getDefaultCategoryId() : null
  })
}

const removeItem = (idx: number) => {
  form.items.splice(idx, 1)
}



const close = () => {
  emit('update:show', false)
}

const onSubmit = async () => {
  if (!form.is_internal && !form.client_id) return toast.error('Seleccione un cliente')
  if (form.items.some(i => !i.product_name)) return toast.error('Complete el nombre de los productos')

  try {
    saving.value = true
    
    const sanitizedItems = form.items.map(item => {
      return {
        product_name: item.product_name,
        color_id: null,
        color_name: null,
        hex_code: null,
        size: item.size || null,
        quantity: Number(item.quantity) || 0,
        unit_price: Number(item.unit_price) || 0,
        extras: item.extras || [],
        observations: item.observations || '',
        stock_product_id: item.stock_product_id || null,
        category_id: item.category_id || null
      }
    })

    const payload = {
      client_id: form.client_id || null,
      is_internal: form.is_internal,
      type: form.type,
      delivery_date: form.delivery_date,
      advance_payment: form.is_internal ? 0 : (Number(form.advance_payment) || 0),
      notes: form.notes || null,
      total_amount: subtotal.value,
      items: sanitizedItems
    }

    if (props.orderToEdit) {
      await productionStore.updateOrder(props.orderToEdit.id, payload)
      toast.success('Pedido interno actualizado correctamente')
    } else {
      await productionStore.createOrder(payload)
      toast.success('Pedido creado y enviado a producción')
    }
    resetForm()
    emit('saved')
    close()
  } catch (err: any) {
    console.error('Error creating order:', err)
    toast.error(err.data?.message || err.message || 'Error al crear el pedido')
  } finally {
    saving.value = false
  }
}

const resetForm = () => {
  form.client_id = ''
  form.type = 'uniform'
  form.is_internal = false
  form.delivery_date = ''
  form.advance_payment = 0
  form.notes = ''
  form.items = [{ product_name: '', size: '', quantity: 1, unit_price: 0, extras: [], observations: '', stock_product_id: null, category_id: null }]
}

watch(() => props.show, (val) => {
  if (val) {
    catalogs.fetchAll()
    if (props.orderToEdit) {
      form.client_id = props.orderToEdit.client_id || ''
      form.type = props.orderToEdit.type || 'uniform'
      form.is_internal = !!props.orderToEdit.is_internal
      form.delivery_date = props.orderToEdit.delivery_date ? props.orderToEdit.delivery_date.split('T')[0] : ''
      form.advance_payment = Number(props.orderToEdit.advance_payment) || 0
      form.notes = props.orderToEdit.notes || ''
      form.items = (props.orderToEdit.items || []).map((item: any) => ({
        product_name: item.product_name,
        size: item.size || '',
        quantity: Number(item.quantity) || 1,
        unit_price: Number(item.unit_price) || 0,
        extras: item.extras || [],
        observations: item.observations || '',
        stock_product_id: item.stock_product_id || null,
        category_id: item.category_id || null
      }))
      if (form.is_internal) {
        fetchStockProducts()
      }
    } else {
      resetForm()
    }
  }
})

watch(() => form.is_internal, (val) => {
  if (val) {
    form.advance_payment = 0
    fetchStockProducts()
    const generalCat = catalogs.categories.find((c: any) => c.label.toLowerCase() === 'general')
    if (generalCat) {
      form.items.forEach(item => {
        if (!item.stock_product_id && !item.category_id) {
          item.category_id = generalCat.value
        }
      })
    }
  } else {
    // Limpiar vinculaciones de inventario si cambia a pedido de cliente
    form.items.forEach(item => {
      item.stock_product_id = null
      item.category_id = null
    })
  }
})

watch(() => catalogs.categories, (cats) => {
  if (cats && cats.length) {
    const generalCat = cats.find((c: any) => c.label.toLowerCase() === 'general')
    if (generalCat) {
      form.items.forEach(item => {
        if (form.is_internal && !item.stock_product_id && !item.category_id) {
          item.category_id = generalCat.value
        }
      })
    }
  }
}, { deep: true })
</script>

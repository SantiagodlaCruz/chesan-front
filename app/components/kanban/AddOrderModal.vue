<template>
  <BaseModal
    :show="show"
    title="Nuevo pedido de producción"
    subtitle="Registre los detalles del cliente y los productos a fabricar."
    size="4xl"
    @update:show="close"
  >
    <form @submit.prevent="onSubmit" class="space-y-6">
      <!-- Selector de Tipo -->
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
        <div class="flex flex-col gap-1.5">
          <label class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] ml-1 transition-colors">Fecha de entrega</label>
          <input 
            v-model="form.delivery_date" 
            type="date" 
            class="w-full bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-primary transition-all outline-none px-4 py-2 rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100"
            required
          />
        </div>
      </div>

      <!-- Items del Pedido -->
      <div class="space-y-4">
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
              <div class="md:col-span-12 flex flex-col gap-1.5">
                <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Producto / Concepto</label>
                <input 
                  v-model="item.product_name" 
                  :placeholder="form.type === 'uniform' ? 'Ej. Playera Polo' : 'Ej. Bordado espalda chamarra'"
                  class="w-full bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-primary transition-all outline-none px-4 py-2 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-200"
                  required
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
                  class="w-full bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-primary transition-all outline-none px-4 py-2 rounded-xl text-sm text-center font-bold text-slate-700 dark:text-slate-300"
                />
              </div>

              <div class="flex flex-col gap-1.5">
                <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Cantidad</label>
                <input 
                  v-model.number="item.quantity" 
                  type="number" 
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
                    step="0.01"
                    class="w-full bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-primary transition-all outline-none pl-7 pr-4 py-2 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 text-right"
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
          <div class="flex justify-between items-center gap-4">
            <span class="text-sm font-bold text-slate-500 whitespace-nowrap">Anticipo</span>
            <div class="relative flex-1 max-w-[120px]">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
              <input 
                v-model.number="form.advance_payment" 
                type="number" 
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
        <BaseButton type="submit" variant="primary" :loading="saving" loading-text="Generando Pedido...">
          Confirmar y enviar a producción
        </BaseButton>
      </div>

      <!-- Extras Sub-Modal for Order -->
      <BaseModal v-model:show="showExtrasModal" title="Extras del Ítem" size="sm">
         <div class="space-y-4 py-2">
            <div v-for="(ex, ei) in currentExtras" :key="ei" class="flex gap-2">
               <input v-model="ex.description" placeholder="Logo extra" class="flex-1 bg-slate-100 dark:bg-white/5 border-none outline-none px-2 py-1 text-xs rounded" />
               <input v-model.number="ex.cost" type="number" class="w-16 bg-slate-100 dark:bg-white/5 border-none outline-none px-2 py-1 text-xs text-right" />
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
}

const form = reactive({
  client_id: '',
  type: 'uniform',
  delivery_date: '',
  advance_payment: 0,
  notes: '',
  items: [
    { product_name: '', size: '', quantity: 1, unit_price: 0, extras: [], observations: '' }
  ] as OrderItem[]
})

const subtotal = computed(() => {
  return form.items.reduce((acc, item) => {
    const extrasCost = (item.extras || []).reduce((sum, e) => sum + (Number(e.cost) || 0), 0)
    return acc + (item.quantity * (item.unit_price + extrasCost))
  }, 0)
})

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

const addItem = () => {
  form.items.push({ product_name: '', size: '', quantity: 1, unit_price: 0, extras: [], observations: '' })
}

const removeItem = (idx: number) => {
  form.items.splice(idx, 1)
}



const close = () => {
  emit('update:show', false)
}

const onSubmit = async () => {
  if (!form.client_id) return toast.error('Seleccione un cliente')
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
        observations: item.observations || ''
      }
    })

    const payload = {
      client_id: form.client_id,
      type: form.type,
      delivery_date: form.delivery_date,
      advance_payment: Number(form.advance_payment) || 0,
      notes: form.notes || null,
      total_amount: subtotal.value,
      items: sanitizedItems
    }

    await productionStore.createOrder(payload)
    toast.success('Pedido creado y enviado a producción')
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
  form.delivery_date = ''
  form.advance_payment = 0
  form.notes = ''
  form.items = [{ product_name: '', size: '', quantity: 1, unit_price: 0, extras: [], observations: '' }]
}

watch(() => props.show, (val) => {
  if (val) {
    catalogs.fetchAll()
  }
})
</script>

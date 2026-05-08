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

        <div class="bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-visible">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 font-bold text-[10px] uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <th class="px-4 py-3">{{ form.type === 'uniform' ? 'Producto / Concepto' : 'Descripción del Bordado' }}</th>
                <th v-if="form.type === 'uniform'" class="px-4 py-3 w-48">Color</th>
                <th v-if="form.type === 'uniform'" class="px-4 py-3 w-20 text-center">Talla</th>
                <th class="px-4 py-3 w-20 text-center">Cant.</th>
                <th class="px-4 py-3 w-28 text-right">P. Unit</th>
                <th class="px-4 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 dark:divide-slate-800">
              <tr v-for="(item, idx) in form.items" :key="idx" class="group transition-colors hover:bg-slate-100/50 dark:hover:bg-white/[0.02]">
                <td class="px-2 py-2">
                  <input 
                    v-model="item.product_name" 
                    :placeholder="form.type === 'uniform' ? 'Ej. Playera Polo' : 'Ej. Bordado espalda chamarra'"
                    class="w-full bg-transparent border-none outline-none px-2 py-1.5 text-sm font-semibold text-slate-800 dark:text-slate-200"
                    required
                  />
                  <!-- Extras simplified in Order -->
                  <div v-if="form.type === 'uniform'" class="px-2 pb-1">
                     <button type="button" @click="toggleExtras(idx)" class="text-[9px] font-bold text-slate-400 hover:text-primary transition-colors flex items-center gap-1">
                        <Settings2Icon class="w-3 h-3" /> {{ item.extras?.length ? `${item.extras.length} Extras` : 'Añadir Extras' }}
                     </button>
                  </div>
                </td>
                <td v-if="form.type === 'uniform'" class="px-2 py-2">
                  <Select 
                    v-model="item.color_name" 
                    :options="catalogs.colors" 
                    placeholder="Color" 
                    compact 
                    creatable
                    menu-width="w-64"
                    @update:modelValue="(val) => onColorChange(idx, val)"
                  />
                </td>
                <td v-if="form.type === 'uniform'" class="px-2 py-2">
                  <input 
                    v-model="item.size" 
                    placeholder="Talla"
                    class="w-full bg-transparent border-none outline-none px-2 py-1.5 text-sm text-center font-medium text-slate-700 dark:text-slate-300"
                  />
                </td>
                <td class="px-2 py-2">
                  <input 
                    v-model.number="item.quantity" 
                    type="number" 
                    class="w-full bg-transparent border-none outline-none px-2 py-1.5 text-sm text-center font-bold text-slate-900 dark:text-white"
                    min="1"
                    required
                  />
                </td>
                <td class="px-2 py-2">
                  <div class="flex items-center justify-end gap-1">
                    <span class="text-slate-400 text-xs">$</span>
                    <input 
                      v-model.number="item.unit_price" 
                      type="number" 
                      step="0.01"
                      class="w-20 bg-transparent border-none outline-none py-1.5 text-sm text-right font-bold text-slate-900 dark:text-white"
                      required
                    />
                  </div>
                </td>
                <td class="px-2 py-2 text-center">
                  <button v-if="form.items.length > 1" type="button" @click="removeItem(idx)" class="p-1 text-slate-400 hover:text-red-500 transition-colors">
                    <TrashIcon class="w-4 h-4" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
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
import { PlusIcon, TrashIcon } from 'lucide-vue-next'
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
  color_name: string | number
  hex_code: string
  size: string
  quantity: number
  unit_price: number
  extras: OrderExtra[]
}

const form = reactive({
  client_id: '',
  type: 'uniform',
  delivery_date: '',
  advance_payment: 0,
  notes: '',
  items: [
    { product_name: '', color_name: '', hex_code: '', size: '', quantity: 1, unit_price: 0, extras: [] }
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
  form.items.push({ product_name: '', color_name: '', hex_code: '', size: '', quantity: 1, unit_price: 0, extras: [] })
}

const removeItem = (idx: number) => {
  form.items.splice(idx, 1)
}

const onColorChange = (idx: number, val: any) => {
  const selectedColor = catalogs.colors.find((c: any) => c.value === val || c.label === val)
  if (selectedColor && form.items[idx]) {
    form.items[idx].hex_code = (selectedColor as any).hex || ''
  }
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
      const isNewColor = typeof item.color_name === 'string' && isNaN(Number(item.color_name))
      
      return {
        product_name: item.product_name,
        color_id: !isNewColor ? Number(item.color_name) : null,
        color_name: isNewColor ? item.color_name : null,
        hex_code: item.hex_code || null,
        size: item.size || null,
        quantity: Number(item.quantity) || 0,
        unit_price: Number(item.unit_price) || 0,
        extras: item.extras || [],
        observations: null
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
  form.items = [{ product_name: '', color_name: '', hex_code: '', size: '', quantity: 1, unit_price: 0, extras: [] }]
}

watch(() => props.show, (val) => {
  if (val) {
    catalogs.fetchAll()
  }
})
</script>

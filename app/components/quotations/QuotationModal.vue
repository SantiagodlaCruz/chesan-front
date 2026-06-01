<template>
  <BaseModal
    :show="show"
    :title="readOnly ? 'Detalles de cotización' : (isEdit ? 'Editar cotización' : 'Nueva cotización')"
    :subtitle="readOnly ? 'Vista de solo lectura de la propuesta.' : (isEdit ? 'Modifique los detalles de la propuesta existente.' : 'Cree una propuesta formal basada en el catálogo de precios.')"
    size="5xl"
    @update:show="close"
  >
    <div v-if="loading" class="py-20 flex flex-col items-center justify-center gap-4">
      <div class="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      <p class="text-sm font-bold text-slate-500 animate-pulse">Cargando datos...</p>
    </div>
    <form v-else @submit.prevent="onSubmit" class="space-y-6">
      <!-- Client Section -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 pb-6 border-b border-dashed border-slate-200 dark:border-slate-800 items-end">
        <div class="flex flex-col gap-1.5 md:col-span-3">
          <label class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] ml-1 transition-colors">Cliente</label>
          <Select 
            v-model="form.client_id" 
            :options="clients" 
            :disabled="readOnly"
            placeholder="Buscar en el catálogo de clientes o escribir nombre para crear nuevo..." 
            searchable 
            creatable
            @create="handleCreateClient"
          />
        </div>
        
        <div v-if="!readOnly" class="md:col-span-1 h-[52px] flex items-center justify-center bg-primary/5 dark:bg-primary/10 px-4 rounded-2xl border border-primary/10 hover:border-primary/20 transition-all group">
          <label class="flex items-center gap-3 cursor-pointer select-none w-full justify-center">
            <div class="relative flex items-center">
              <input 
                type="checkbox" 
                v-model="form.force_wholesale" 
                class="peer sr-only"
              />
              <div class="w-10 h-5 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-checked:bg-primary transition-all duration-300"></div>
              <div class="absolute left-1 top-1 w-3 h-3 bg-white rounded-full peer-checked:translate-x-5 transition-all duration-300 shadow-sm"></div>
            </div>
            <div class="flex flex-col">
              <span class="text-[10px] font-black text-primary uppercase tracking-widest leading-none mb-0.5">Mayoreo</span>
              <span class="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase leading-none">Todo</span>
            </div>
          </label>
        </div>
      </div>

      <!-- Items Table -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] ml-1 transition-colors">Productos a cotizar</h3>
          <button v-if="!readOnly" type="button" @click="addItem" class="text-xs font-bold text-primary hover:text-primary/80 flex items-center gap-1.5 transition-colors">
            <PlusIcon class="w-4 h-4" />
            Añadir Línea
          </button>
        </div>

        <div class="grid grid-cols-1 gap-4">
          <div v-for="(item, idx) in form.items" :key="idx" class="relative group bg-white dark:bg-white/[0.03] rounded-2xl border border-slate-200 dark:border-white/10 p-5 transition-all hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20">
            <!-- Header Line: Product Selection -->
            <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
              <div class="md:col-span-5 flex flex-col gap-1.5">
                <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Producto</label>
                <Select 
                  v-model="item.product_catalog_id" 
                  :options="productOptions" 
                  placeholder="Seleccionar..." 
                  searchable
                  :disabled="readOnly"
                  @update:modelValue="onBaseProductChange(idx)"
                />
                <input 
                  v-if="!item.product_catalog_id"
                  v-model="item.custom_description" 
                  :disabled="readOnly"
                  placeholder="Descripción manual..."
                  class="w-full bg-slate-50 dark:bg-white/5 border border-dashed border-slate-200 dark:border-white/10 px-3 py-1.5 rounded-lg text-xs text-slate-500 italic mt-1"
                />
              </div>

              <div class="md:col-span-4 flex flex-col gap-1.5">
                <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Material / Variación</label>
                <Select 
                  v-model="item.material" 
                  :options="getMaterialOptions(item.product_catalog_id)" 
                  placeholder="Material..." 
                  searchable
                  menu-width="w-[350px]"
                  :disabled="readOnly || !item.product_catalog_id"
                  @update:modelValue="onMaterialChange(idx)"
                />
              </div>

              <div class="md:col-span-3 flex flex-col gap-1.5">
                <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Talla</label>
                <Select 
                  v-model="item.specific_size" 
                  :options="getSizeOptions(item.product_catalog_id, item.material)"
                  placeholder="Talla..."
                  searchable
                  creatable
                  menu-width="w-[250px]"
                  :disabled="readOnly || !item.material"
                  @update:modelValue="onSizeBlur(idx)"
                />
              </div>
            </div>

            <!-- Middle Line: Quantity, Price, Subtotal -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100 dark:border-white/5 items-center">
              <div class="flex flex-col gap-1.5">
                <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Cantidad</label>
                <div class="relative">
                  <input 
                    v-model.number="item.quantity" 
                    type="number" 
                    v-numeric
                    :disabled="readOnly"
                    class="w-full bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-primary transition-all outline-none px-4 py-2 rounded-xl text-sm font-black text-slate-900 dark:text-white"
                    min="1"
                    @input="calculateRow(idx)"
                  />
                </div>
              </div>

              <div class="flex flex-col gap-1.5">
                <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Precio Unitario</label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                  <input 
                    v-model.number="item.unit_price" 
                    type="number" 
                    v-numeric.decimal
                    step="0.01"
                    :disabled="readOnly"
                    class="w-full bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-primary transition-all outline-none pl-7 pr-4 py-2 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300"
                    @input="calculateRow(idx)"
                  />
                </div>
                <span v-if="item.is_wholesale" class="text-[8px] font-black text-primary uppercase absolute -top-1 right-0 bg-primary/10 px-1.5 py-0.5 rounded-full">MAYOREO</span>
              </div>

              <div class="flex flex-col gap-1.5">
                <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Extras / Cargos</label>
                <button 
                  type="button" 
                  @click="openExtras(idx)"
                  class="h-10 flex items-center justify-center gap-2 bg-slate-50 dark:bg-white/5 border-2 border-transparent hover:border-primary/30 transition-all rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400"
                >
                  <span v-if="item.extras_total > 0" class="text-primary font-black">+${{ item.extras_total }}</span>
                  <span v-else>Configurar</span>
                  <Settings2Icon class="w-3.5 h-3.5" />
                </button>
              </div>

              <div class="flex flex-col gap-1.5 items-end">
                <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest mr-1">Subtotal</label>
                <div class="text-xl font-black text-primary">
                  {{ formatMoney(item.subtotal) }}
                </div>
              </div>
            </div>

            <!-- Bottom Line: Observations -->
            <div class="mt-4 pt-4 border-t border-slate-100 dark:border-white/5">
              <div class="flex flex-col gap-1.5">
                <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Observaciones especiales del ítem</label>
                <textarea 
                  v-model="item.observations"
                  rows="2"
                  :disabled="readOnly"
                  placeholder="Ej. Bordado de 10x10 cm en espalda, nombre bordado en hilo rojo..."
                  class="w-full bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-primary transition-all outline-none px-4 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 placeholder:text-slate-400"
                ></textarea>
              </div>
            </div>

            <!-- Remove Button (Absolute) -->
            <button 
              v-if="form.items.length > 1 && !readOnly" 
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
          <label class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] ml-1 transition-colors">Notas (aparecerán en la cotización)</label>
          <textarea 
            v-model="form.notes" 
            rows="4" 
            :disabled="readOnly"
            class="w-full bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-primary transition-all outline-none px-4 py-3 rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 disabled:opacity-70"
            placeholder="Condiciones de pago, tiempo de entrega, etc..."
          ></textarea>
        </div>

        <div class="bg-slate-50 dark:bg-white/5 rounded-2xl p-6 space-y-4 border border-slate-200 dark:border-slate-800">
          <div class="flex justify-between items-center text-sm">
            <span class="font-bold text-slate-500">Subtotal</span>
            <span class="font-bold text-slate-900 dark:text-white">{{ formatMoney(totalAmount) }}</span>
          </div>
          <div class="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <span class="text-base font-black text-slate-800 dark:text-white uppercase tracking-tight">Total cotizado</span>
            <span class="text-2xl font-black text-primary">{{ formatMoney(totalAmount) }}</span>
          </div>
          <p class="text-[10px] text-slate-400 italic text-center">* Precios sujetos a cambios sin previo aviso.</p>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center justify-end gap-3 pt-6 border-t border-slate-100 dark:border-white/5">
        <BaseButton type="button" variant="secondary" @click="close">
          {{ readOnly ? 'Cerrar' : 'Cancelar' }}
        </BaseButton>
        <BaseButton v-if="!readOnly" type="submit" variant="primary" :loading="saving">
          {{ isEdit ? 'Actualizar cotización' : 'Guardar cotización' }}
        </BaseButton>
      </div>
    </form>

    <!-- Extras Modal -->
    <BaseModal v-model:show="showExtrasModal" title="Cargos extras" subtitle="Agregue costos manuales para este ítem." size="md">
       <div class="space-y-4 py-4">
         <div v-for="(extra, eIdx) in currentItemExtras" :key="eIdx" class="flex gap-2 items-center">
            <input 
              v-model="extra.description" 
              :disabled="readOnly" 
              placeholder="Ej. Logo manga" 
              class="flex-1 bg-slate-50 dark:bg-white/5 border-none outline-none px-3 py-2 rounded-lg text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400" 
            />
            <input 
              v-model.number="extra.cost" 
              :disabled="readOnly" 
              type="number" 
              v-numeric.decimal
              step="0.01" 
              class="w-24 bg-slate-50 dark:bg-white/5 border-none outline-none px-3 py-2 rounded-lg text-sm text-right font-bold text-slate-800 dark:text-slate-200" 
            />
            <button v-if="!readOnly" @click="currentItemExtras.splice(eIdx, 1)" class="text-red-500 p-1 hover:bg-red-500/10 rounded-lg transition-colors">
              <TrashIcon class="w-4 h-4" />
            </button>
         </div>
         <button v-if="!readOnly" @click="currentItemExtras.push({description: '', cost: 0})" class="text-xs font-bold text-primary hover:underline ml-1">
           + Añadir concepto
         </button>
       </div>
       <template #footer>
         <BaseButton v-if="!readOnly" variant="primary" block @click="saveExtras">Guardar cambios</BaseButton>
         <BaseButton v-else variant="secondary" block @click="showExtrasModal = false">Cerrar</BaseButton>
       </template>
    </BaseModal>

    <!-- New Client Modal -->
    <BaseModal v-model:show="showNewClientModal" title="Nuevo Cliente" subtitle="Complete los datos del cliente para su cotización." size="md">
       <div class="space-y-5 py-2">
         <BaseInput v-model="clientName" name="name" label="Nombre / Razón Social" required :error="clientErrors.name" />
         <BaseInput v-model="clientAddress" name="address" label="Dirección" placeholder="Av. Siempre Viva 123..." :error="clientErrors.address" />
         <BaseInput v-model="clientEmail" name="email" label="Email" type="email" placeholder="ejemplo@correo.com" :error="clientErrors.email" />
         <BaseInput 
           v-model="clientPhone" 
           name="phone" 
           label="Teléfono" 
           type="text" 
           placeholder="10 dígitos (solo números)" 
           :error="clientErrors.phone"
           @input="clientPhone = $event.target.value.replace(/[^0-9]/g, '').slice(0, 10)"
         />
       </div>
       <template #footer>
         <div class="flex gap-3">
           <BaseButton variant="secondary" block @click="showNewClientModal = false">Cancelar</BaseButton>
           <BaseButton variant="primary" block :loading="creatingClient" @click="onClientSubmit">Guardar Cliente</BaseButton>
         </div>
       </template>
    </BaseModal>
  </BaseModal>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { PlusIcon, TrashIcon, Settings2Icon } from 'lucide-vue-next'
import BaseModal from '~/components/BaseModal.vue'
import BaseButton from '~/components/BaseButton.vue'
import Select from '~/components/Select.vue'
import BaseInput from '~/components/BaseInput.vue'
import { useForm, useField } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/yup'
import * as yup from 'yup'
import { useToast } from '~/stores/toast'
import { useFormatter } from '~/composables/useFormatter'

const { formatMoney } = useFormatter()

const props = defineProps({
  show: Boolean,
  id: {
    type: [Number, String],
    default: null
  },
  readOnly: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:show', 'saved'])

const api = useApi()
const toast = useToast()

const saving = ref(false)
const loading = ref(false)
const clients = ref([])
const catalog = ref([])
const catalogOptions = ref([])

const initialForm = {
  client_id: '',
  quotation_date: new Date().toISOString().split('T')[0],
  notes: '',
  force_wholesale: false,
  items: [
    { 
      product_catalog_id: null,
      material: '',
      specific_size: '',
      product_catalog_price_id: null, 
      custom_description: '', 
      quantity: 1, 
      unit_price: 0, 
      subtotal: 0, 
      is_wholesale: false,
      extras: [],
      extras_total: 0,
      observations: ''
    }
  ]
}

const form = reactive(JSON.parse(JSON.stringify(initialForm)))

const isEdit = computed(() => !!props.id)

const totalAmount = computed(() => form.items.reduce((acc, item) => acc + item.subtotal, 0))
const totalQuantity = computed(() => form.items.reduce((acc, item) => acc + Number(item.quantity || 0), 0))

// Extras logic
const showExtrasModal = ref(false)
const currentItemIdx = ref(-1)
const currentItemExtras = ref([])

const openExtras = (idx) => {
  currentItemIdx.value = idx
  currentItemExtras.value = JSON.parse(JSON.stringify(form.items[idx].extras || []))
  showExtrasModal.value = true
}

const saveExtras = () => {
  const item = form.items[currentItemIdx.value]
  item.extras = currentItemExtras.value.filter(e => e.description && e.cost > 0)
  item.extras_total = item.extras.reduce((acc, e) => acc + Number(e.cost), 0)
  calculateRow(currentItemIdx.value)
  showExtrasModal.value = false
}

// New Client Logic
const showNewClientModal = ref(false)
const creatingClient = ref(false)

const clientSchema = toTypedSchema(
  yup.object({
    name: yup.string().required('El nombre es obligatorio'),
    email: yup.string().email('Debe ser un email válido').nullable(),
    phone: yup.string()
      .test('len', 'El teléfono debe tener 10 dígitos', val => !val || val.length === 10)
      .nullable(),
    address: yup.string().nullable(),
  })
)

const { handleSubmit: handleClientSubmit, errors: clientErrors, resetForm: resetClientForm } = useForm({
  validationSchema: clientSchema
})

const { value: clientName } = useField('name')
const { value: clientEmail } = useField('email')
const { value: clientPhone } = useField('phone')
const { value: clientAddress } = useField('address')


const onClientSubmit = handleClientSubmit(async (values) => {
  try {
    creatingClient.value = true
    // Default type to persona if not specified
    const payload = { ...values, type: 'persona' }
    const res = await api.post('/api/clients', payload)
    const newClient = { value: res.data.id, label: res.data.name }
    clients.value.push(newClient)
    form.client_id = res.data.id
    toast.success('Cliente creado y seleccionado')
    showNewClientModal.value = false
    resetClientForm()
  } catch (err) {
    toast.error('Error al crear cliente: ' + (err.data?.message || err.message))
  } finally {
    creatingClient.value = false
  }
})

const productOptions = computed(() => {
  return [
    { value: null, label: 'MANUAL / OTRO' },
    ...catalog.value.map(p => ({
      value: p.id,
      label: p.name
    }))
  ]
})

const getMaterialOptions = (productId) => {
  if (!productId) return []
  const prod = catalog.value.find(p => p.id === productId)
  if (!prod || !prod.prices) return []
  
  // Obtener materiales únicos para este producto
  const materials = [...new Set(prod.prices.map(p => p.material))]
  return materials.map(m => ({ value: m, label: m }))
}

const getSizeOptions = (productId, material) => {
  if (!productId || !material) return []
  const prod = catalog.value.find(p => p.id === productId)
  if (!prod || !prod.prices) return []
  
  return prod.prices
    .filter(p => p.material === material)
    .map(p => ({ value: p.size_range, label: p.size_range }))
}

const fetchInitialData = async () => {
  try {
    const [clientsRes, catalogRes] = await Promise.all([
      api.get('/api/clients?per_page=100'),
      api.get('/api/catalog-prices')
    ])
    
    const clientList = clientsRes.data?.data || clientsRes.data || []
    clients.value = clientList.map(c => ({ value: c.id, label: c.name }))
    
    catalog.value = catalogRes.data || []
  } catch (err) {
    console.error('Error fetching initial data:', err)
    toast.error('Error al cargar datos del catálogo')
  }
}

const onBaseProductChange = (idx) => {
  const item = form.items[idx]
  item.material = ''
  item.product_catalog_price_id = null
  
  // Si solo hay un material disponible, seleccionarlo automáticamente
  const materials = getMaterialOptions(item.product_catalog_id)
  if (materials.length === 1) {
    item.material = materials[0].value
    onMaterialChange(idx)
  }
}

const onMaterialChange = (idx) => {
  const item = form.items[idx]
  
  // Primero intentamos encontrar por talla si existe
  if (item.specific_size) {
    onSizeBlur(idx)
  }
  
  // Si después de intentar por talla (o si no hay talla) el ID sigue vacío, 
  // buscamos cualquier variante de ese material para que no se quede vacío
  if (!item.product_catalog_price_id && item.product_catalog_id && item.material) {
    const prod = catalog.value.find(p => p.id === item.product_catalog_id)
    const variant = prod?.prices?.find(p => p.material === item.material)
    if (variant) {
      item.product_catalog_price_id = variant.id
      calculateRow(idx)
    }
  }
}

const onSizeBlur = (idx) => {
  const item = form.items[idx]
  if (!item.specific_size || !item.product_catalog_id || !item.material) return

  const betterVariant = findVariantForSize(item.product_catalog_id, item.material, item.specific_size)
  if (betterVariant) {
    item.product_catalog_price_id = betterVariant.id
  }
  calculateRow(idx)
}

const checkSizeFits = (size, range) => {
  const s = size.toString().trim().toUpperCase()
  const r = range.toString().trim().toUpperCase()
  
  if (s === r) return true
  
  // Rango numérico tipo "6-10" o "30-40"
  if (r.includes('-')) {
    const parts = r.split('-').map(v => parseInt(v.trim()))
    const val = parseInt(s)
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(val)) {
      return val >= parts[0] && val <= parts[1]
    }
  }
  
  return false
}

const findVariantForSize = (productId, material, size) => {
  // Buscar en todo el catálogo cargado
  const prod = catalog.value.find(p => p.id === productId)
  if (!prod || !prod.prices) return null
  
  // Filtrar por mismo material y que la talla encaje
  return prod.prices.find(p => 
    p.material === material && checkSizeFits(size, p.size_range)
  )
}

const calculateRow = (idx) => {
  const item = form.items[idx]
  
  // Si no tenemos ID de precio pero tenemos producto, material y talla, intentar encontrarlo
  if (!item.product_catalog_price_id && item.product_catalog_id && item.material && item.specific_size) {
    const variant = findVariantForSize(item.product_catalog_id, item.material, item.specific_size)
    if (variant) {
      item.product_catalog_price_id = variant.id
    }
  }

  // Buscar la variante actual en el catálogo para obtener precios
  const prod = catalog.value.find(p => p.id === item.product_catalog_id)
  let variant = null
  
  if (item.product_catalog_price_id) {
    variant = prod?.prices?.find(p => p.id === item.product_catalog_price_id)
    
    // Si la talla ya no coincide con el rango de esta variante, buscar una mejor
    if (variant && item.specific_size && !checkSizeFits(item.specific_size, variant.size_range)) {
       const better = findVariantForSize(item.product_catalog_id, item.material, item.specific_size)
       if (better) {
         item.product_catalog_price_id = better.id
         variant = better
       }
    }
  }
  
  if (variant) {
    const minWholesale = prod?.wholesale_min_quantity || 25
    item.is_wholesale = form.force_wholesale || totalQuantity.value >= minWholesale
    item.unit_price = item.is_wholesale ? Number(variant.wholesale_price) : Number(variant.retail_price)
  }
  
  item.subtotal = (Number(item.unit_price) + Number(item.extras_total)) * Number(item.quantity)
}

const addItem = () => {
  form.items.push({ 
    product_catalog_id: null,
    material: '',
    specific_size: '',
    product_catalog_price_id: null, 
    custom_description: '', 
    quantity: 1, 
    unit_price: 0, 
    subtotal: 0, 
    is_wholesale: false,
    extras: [],
    extras_total: 0,
    observations: ''
  })
}

const removeItem = (idx) => form.items.splice(idx, 1)

const handleCreateClient = (name) => {
  resetClientForm()
  clientName.value = name
  showNewClientModal.value = true
}

const fetchQuotation = async (id) => {
  try {
    loading.value = true
    const res = await api.get(`/api/quotations/${id}`)
    const q = res.data
    form.client_id = q.client_id
    form.notes = q.notes || ''
    form.force_wholesale = !!q.force_wholesale
    form.items = q.items.map(item => {
      const extras_total = (item.extras || []).reduce((acc, e) => acc + Number(e.cost), 0)
      const variant = item.product_catalog_price || item.productCatalogPrice
      return {
        product_catalog_id: variant?.product_catalog_id || variant?.productCatalogId || null,
        material: variant?.material || '',
        specific_size: item.specific_size || '',
        product_catalog_price_id: item.product_catalog_price_id,
        custom_description: item.custom_description || '',
        quantity: item.quantity,
        unit_price: Number(item.unit_price),
        subtotal: Number(item.subtotal),
        extras: item.extras || [],
        extras_total,
        is_wholesale: item.quantity >= (variant?.product_catalog?.wholesale_min_quantity || variant?.productCatalog?.wholesaleMinQuantity || 25),
        observations: item.observations || ''
      }
    })
  } catch (err) {
    toast.error('Error al cargar la cotización')
  } finally {
    loading.value = false
  }
}

const onSubmit = async () => {
  if (!form.client_id) return toast.error('Seleccione un cliente')
  
  // Validar que cada ítem tenga producto seleccionado o descripción manual
  for (let i = 0; i < form.items.length; i++) {
    const item = form.items[i]
    if (!item.product_catalog_id && !item.custom_description?.trim()) {
      return toast.error(`La línea ${i + 1} requiere un producto del catálogo o una descripción manual.`)
    }
  }
  
  try {
    saving.value = true
    form.quotation_date = new Date().toISOString().split('T')[0]
    
    if (isEdit.value) {
      await api.put(`/api/quotations/${props.id}`, form)
      toast.success('Cotización actualizada correctamente')
    } else {
      await api.post('/api/quotations', form)
      toast.success('Cotización guardada correctamente')
    }
    
    emit('saved')
    close()
  } catch (err) {
    toast.error('Error al guardar cotización')
  } finally {
    saving.value = false
  }
}

const close = () => emit('update:show', false)


import { watch } from 'vue'

watch(() => form.force_wholesale, () => {
  form.items.forEach((_, idx) => calculateRow(idx))
})

watch(() => totalQuantity.value, () => {
  form.items.forEach((_, idx) => calculateRow(idx))
})
watch(() => props.show, (val) => {
  if (val) {
    // Reset form if opening for new creation
    if (!props.id) {
      Object.assign(form, JSON.parse(JSON.stringify(initialForm)))
    }
    fetchInitialData().then(() => {
      if (props.id) {
        fetchQuotation(props.id)
      }
    })
  }
})

onMounted(fetchInitialData)
</script>

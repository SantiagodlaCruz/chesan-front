<template>
  <BaseModal
    :show="show"
    :title="readOnly ? 'Detalles de Cotización' : (isEdit ? 'Editar Cotización' : 'Nueva Cotización')"
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
      <div class="grid grid-cols-1 md:grid-cols-4 gap-5 pb-6 border-b border-dashed border-slate-200 dark:border-slate-800">
        <div class="flex flex-col gap-1.5 md:col-span-4">
          <label class="text-xs font-bold text-slate-600 dark:text-slate-400 pl-1">Cliente</label>
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
      </div>

      <!-- Items Table -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-black uppercase tracking-widest text-slate-400">Productos a Cotizar</h3>
          <button v-if="!readOnly" type="button" @click="addItem" class="text-xs font-bold text-primary hover:text-primary/80 flex items-center gap-1.5 transition-colors">
            <PlusIcon class="w-4 h-4" />
            Añadir Línea
          </button>
        </div>

        <div class="bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-visible">
          <table class="w-full text-left table-fixed">
            <thead>
              <tr class="bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 font-bold text-[10px] uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <th class="px-4 py-3 w-[35%]">Producto</th>
                <th class="px-4 py-3 w-[20%]">Material</th>
                <th class="px-4 py-3 w-[10%] text-center">Talla</th>
                <th class="px-4 py-3 w-[10%] text-center">Cant.</th>
                <th class="px-4 py-3 w-[12%] text-right">P. Base</th>
                <th class="px-4 py-3 w-[10%] text-center">Extras</th>
                <th class="px-4 py-3 w-[13%] text-right text-primary">Subtotal</th>
                <th class="px-4 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 dark:divide-slate-800">
              <tr v-for="(item, idx) in form.items" :key="idx" class="group transition-colors hover:bg-slate-100/50 dark:hover:bg-white/[0.02]">
                <!-- Selector de Producto/Precio -->
                <td class="px-2 py-3">
                    <Select 
                      v-model="item.product_catalog_id" 
                      :options="productOptions" 
                      placeholder="Seleccionar..." 
                      compact 
                      searchable
                      menu-width="w-[500px]"
                      :disabled="readOnly"
                      @update:modelValue="onBaseProductChange(idx)"
                    />
                    <input 
                      v-if="!item.product_catalog_id"
                      v-model="item.custom_description" 
                      :disabled="readOnly"
                      placeholder="Descripción manual..."
                      class="w-full bg-transparent border-none outline-none px-2 py-1 text-[10px] text-slate-500 italic mt-1"
                    />
                </td>
                <!-- Material -->
                <td class="px-1 py-3">
                    <Select 
                      v-model="item.material" 
                      :options="getMaterialOptions(item.product_catalog_id)" 
                      placeholder="Material..." 
                      compact 
                      menu-width="w-[250px]"
                      :disabled="readOnly || !item.product_catalog_id"
                      @update:modelValue="onMaterialChange(idx)"
                    />
                </td>
                <!-- Talla Específica -->
                <td class="px-1 py-3 text-center">
                   <input 
                    v-model="item.specific_size" 
                    :disabled="readOnly"
                    class="w-full bg-transparent border-none outline-none px-1 py-1 text-sm text-center font-bold text-slate-900 dark:text-white uppercase placeholder:text-[10px] placeholder:font-normal"
                    placeholder="Talla..."
                    @input="onSizeBlur(idx)"
                  />
                </td>
                <!-- Cantidad -->
                <td class="px-1 py-3 text-center">
                  <input 
                    v-model.number="item.quantity" 
                    type="number" 
                    :disabled="readOnly"
                    class="w-full bg-transparent border-none outline-none px-1 py-1 text-sm text-center font-bold text-slate-900 dark:text-white"
                    min="1"
                    @input="calculateRow(idx)"
                  />
                </td>
                <!-- Precio Base (Calculado) -->
                <td class="px-1 py-3 text-right">
                  <div class="flex items-center justify-end gap-1">
                    <span class="text-slate-400 text-[10px]">$</span>
                    <input 
                      v-model.number="item.unit_price" 
                      type="number" 
                      step="0.01"
                      :disabled="readOnly"
                      class="w-16 bg-transparent border-none outline-none py-1 text-sm text-right font-medium text-slate-700 dark:text-slate-300"
                      @input="calculateRow(idx)"
                    />
                  </div>
                  <span v-if="item.is_wholesale" class="text-[8px] font-black text-primary uppercase block">MAYOREO</span>
                </td>
                <!-- Extras -->
                <td class="px-1 py-3 text-center">
                   <button 
                    type="button" 
                    @click="openExtras(idx)"
                    class="text-[10px] font-bold text-slate-500 hover:text-primary inline-flex items-center gap-1"
                   >
                     <span v-if="item.extras_total > 0" class="text-primary">+${{ item.extras_total }}</span>
                     <span v-else>{{ readOnly ? '$0.00' : '+ Agregar' }}</span>
                     <Settings2Icon class="w-3 h-3" />
                   </button>
                </td>
                <!-- Subtotal -->
                <td class="px-2 py-3 text-right font-black text-primary">
                   <span class="text-sm font-black text-primary">${{ item.subtotal.toFixed(2) }}</span>
                </td>
                <!-- Eliminar -->
                <td class="px-2 py-3 text-center">
                  <button v-if="form.items.length > 1 && !readOnly" type="button" @click="removeItem(idx)" class="p-1 text-slate-400 hover:text-red-500 transition-colors">
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
          <label class="text-xs font-bold text-slate-600 dark:text-slate-400 pl-1">Notas (aparecerán en la cotización)</label>
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
            <span class="font-bold text-slate-900 dark:text-white">${{ totalAmount.toFixed(2) }}</span>
          </div>
          <div class="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <span class="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">Total Cotizado</span>
            <span class="text-2xl font-black text-primary">${{ totalAmount.toFixed(2) }}</span>
          </div>
          <p class="text-[10px] text-slate-400 italic text-center">* Precios sujetos a cambios sin previo aviso.</p>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center justify-end gap-3 pt-6 border-t border-slate-100 dark:border-white/5">
        <BaseButton v-if="id" type="button" variant="secondary" @click="printCurrent">
          <PrinterIcon class="w-4 h-4 mr-2" />
          Imprimir
        </BaseButton>
        <BaseButton type="button" variant="secondary" @click="close">
          {{ readOnly ? 'Cerrar' : 'Cancelar' }}
        </BaseButton>
        <BaseButton v-if="!readOnly" type="submit" variant="primary" :loading="saving">
          {{ isEdit ? 'Actualizar Cotización' : 'Guardar Cotización' }}
        </BaseButton>
      </div>
    </form>

    <!-- Extras Modal -->
    <BaseModal v-model:show="showExtrasModal" title="Cargos Extras" subtitle="Agregue costos manuales para este ítem." size="md">
       <div class="space-y-4 py-4">
         <div v-for="(extra, eIdx) in currentItemExtras" :key="eIdx" class="flex gap-2 items-center">
            <input v-model="extra.description" :disabled="readOnly" placeholder="Ej. Logo manga" class="flex-1 bg-slate-50 dark:bg-white/5 border-none outline-none px-3 py-2 rounded-lg text-sm" />
            <input v-model.number="extra.cost" :disabled="readOnly" type="number" step="0.01" class="w-24 bg-slate-50 dark:bg-white/5 border-none outline-none px-3 py-2 rounded-lg text-sm text-right font-bold" />
            <button v-if="!readOnly" @click="currentItemExtras.splice(eIdx, 1)" class="text-red-500 p-1"><TrashIcon class="w-4 h-4" /></button>
         </div>
         <button v-if="!readOnly" @click="currentItemExtras.push({description: '', cost: 0})" class="text-xs font-bold text-primary">+ Añadir concepto</button>
       </div>
       <template #footer>
         <BaseButton v-if="!readOnly" variant="primary" block @click="saveExtras">Guardar Cambios</BaseButton>
         <BaseButton v-else variant="secondary" block @click="showExtrasModal = false">Cerrar</BaseButton>
       </template>
    </BaseModal>
  </BaseModal>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { PlusIcon, TrashIcon, Settings2Icon, PrinterIcon } from 'lucide-vue-next'
import BaseModal from '~/components/BaseModal.vue'
import BaseButton from '~/components/BaseButton.vue'
import Select from '~/components/Select.vue'
import { useToast } from '~/stores/toast'

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
      extras_total: 0
    }
  ]
}

const form = reactive(JSON.parse(JSON.stringify(initialForm)))

const isEdit = computed(() => !!props.id)

const totalAmount = computed(() => form.items.reduce((acc, item) => acc + item.subtotal, 0))

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
  let variant = null
  if (item.product_catalog_price_id) {
    const prod = catalog.value.find(p => p.id === item.product_catalog_id)
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
    item.is_wholesale = item.quantity >= 25
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
    extras_total: 0
  })
}

const removeItem = (idx) => form.items.splice(idx, 1)

const handleCreateClient = async (name) => {
  try {
    const res = await api.post('/api/clients', { name })
    clients.value.push({ value: res.data.id, label: res.data.name })
    form.client_id = res.data.id
    toast.success('Nuevo cliente registrado')
  } catch (err) {
    toast.error('Error al crear cliente')
  }
}

const fetchQuotation = async (id) => {
  try {
    loading.value = true
    const res = await api.get(`/api/quotations/${id}`)
    const q = res.data
    form.client_id = q.client_id
    form.notes = q.notes || ''
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
        is_wholesale: item.quantity >= 25
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

const printCurrent = () => {
  if (!props.id) return
  const iframe = document.createElement('iframe')
  iframe.style.position = 'fixed'
  iframe.style.right = '0'
  iframe.style.bottom = '0'
  iframe.style.width = '0'
  iframe.style.height = '0'
  iframe.style.border = '0'
  iframe.src = `/production/print-quotation/${props.id}`
  document.body.appendChild(iframe)
  
  setTimeout(() => {
    if (document.body.contains(iframe)) {
      document.body.removeChild(iframe)
    }
  }, 10000)
}

import { watch } from 'vue'
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

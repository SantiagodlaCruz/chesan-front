<template>
  <div v-if="order" class="print-page bg-white text-black font-sans p-0">
    <div class="px-12 py-6 min-h-screen flex flex-col justify-between box-border">
      <!-- Main Content Container -->
      <div class="flex-1">
        <!-- Header Logo / Default Icon (top-left space) -->
        <div class="h-28 mb-4 flex items-center justify-start">
          <div 
            v-if="menuLogoUrl" 
            class="flex items-center justify-center h-full max-w-[280px] overflow-hidden"
            :class="[
              menuLogoBgColor === 'transparent' ? '' : 'rounded-xl p-3 border border-slate-100 shadow-sm'
            ]"
            :style="logoContainerStyle"
          >
            <img :src="menuLogoUrl" alt="Logo" class="max-h-full max-w-full object-contain" />
          </div>
          <div v-else class="flex items-center gap-3">
            <div class="size-14 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
              <ShirtIcon class="text-white size-8" stroke-width="2.5" />
            </div>
            <span class="text-3xl font-black text-slate-800 tracking-tighter">CheSan</span>
          </div>
        </div>

        <!-- Top Info Grid -->
        <div class="flex justify-between items-start mb-10 text-black">
          <div class="space-y-1">
            <h1 class="text-2xl font-black tracking-tight">RECIBO DE PEDIDO</h1>
            <p class="text-sm font-bold uppercase tracking-widest text-black">Uniformes y Bordados CheSan</p>
            <p class="text-[11px] font-normal text-slate-800 max-w-xs leading-tight">
              Fabricamos uniformes escolares y bordados logotipos en general.
            </p>
          </div>

          <div class="text-right space-y-4">
            <!-- Schedule & Contact -->
            <div class="text-[11px] font-normal leading-tight text-slate-800">
              <p class="font-bold uppercase tracking-tighter text-black">Horario de Atención:</p>
              <p>Lunes a Viernes 8:00 am - 5:00 pm</p>
              <p class="font-bold mt-1 text-black">Tel: 922 113 82 91</p>
            </div>

            <!-- Folio and Date -->
            <div class="space-y-1">
              <p class="text-base font-bold">ORDEN: <span class="text-primary font-black">{{ order.order_code }}</span></p>
              <p class="text-xs font-normal text-slate-900 uppercase">FECHA: <span class="font-medium">{{ new Date(order.order_date).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }) }}</span></p>
            </div>
          </div>
        </div>

        <!-- Client Info Box -->
        <div class="border-y-2 border-black py-6 mb-8 text-black">
          <div class="grid grid-cols-2 gap-x-12 gap-y-3 text-sm">
            <div class="flex gap-2">
              <span class="font-bold text-xs uppercase text-black w-24 shrink-0">CLIENTE:</span>
              <span class="font-semibold text-black text-base">{{ order.client?.name }}</span>
            </div>
            <div class="flex gap-2">
              <span class="font-bold text-xs uppercase text-black w-24 shrink-0">E-MAIL:</span>
              <span class="font-normal text-black">{{ order.client?.email || '' }}</span>
            </div>
            <div class="flex gap-2">
              <span class="font-bold text-xs uppercase text-black w-24 shrink-0">DIRECCIÓN:</span>
              <span class="font-normal text-black">{{ order.client?.address || '' }}</span>
            </div>
            <div class="flex gap-2">
              <span class="font-bold text-xs uppercase text-black w-24 shrink-0">TELÉFONO:</span>
              <span class="font-semibold text-black text-base">{{ order.client?.phone || '' }}</span>
            </div>
          </div>
        </div>

        <!-- Table Section -->
        <div class="min-h-[150px] text-black">
          <table class="w-full border-collapse">
            <thead>
              <tr class="border-b-2 border-black text-xs font-black uppercase text-left">
                <th class="py-2 w-20">CANT.</th>
                <th class="py-2 px-4">DETALLE DEL PEDIDO</th>
                <th class="py-2 w-28 text-right">P. UNITARIO</th>
                <th class="py-2 w-28 text-right">IMPORTE</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200">
              <tr v-for="item in order.items" :key="item.id" class="text-sm">
                <td class="py-4 font-medium text-base">{{ item.quantity }}</td>
                <td class="py-4 px-4">
                  <div class="font-bold text-black uppercase text-sm leading-tight">
                    {{ item.product_name }}
                  </div>
                  <div class="text-xs text-slate-700 font-normal mt-0.5 uppercase">
                    TALLA: {{ item.size || 'N/A' }}
                  </div>
                  <!-- Specific Observations -->
                  <div v-if="item.observations" class="mt-2 text-xs text-slate-700 border-l-2 border-black pl-3 py-0.5 italic leading-tight whitespace-pre-line">
                    {{ item.observations }}
                  </div>
                  <!-- Extras if any -->
                  <div v-if="item.extras?.length" class="mt-2 flex flex-wrap gap-x-3 text-xs text-slate-600 font-normal">
                    <span v-for="(extra, eIdx) in item.extras" :key="eIdx">
                      + {{ extra.description }} (${{ formatMoney(extra.cost) }})
                    </span>
                  </div>
                </td>
                <td class="py-4 text-right font-normal">${{ formatMoney(item.unit_price) }}</td>
                <td class="py-4 text-right font-semibold">${{ formatMoney(item.total) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Footer Section & Small Print pushed to the bottom -->
      <div class="mt-4">
        <!-- Footer Section -->
        <div class="flex justify-between border-t-2 border-black pt-6 text-black">
          <div class="w-1/2 space-y-6">
            <div class="flex flex-col gap-1">
              <span class="text-xs font-bold text-black uppercase tracking-widest">FECHA PROMESA DE ENTREGA:</span>
              <div class="text-sm font-semibold border-b-2 border-black w-64 pb-1">
                {{ new Date(order.delivery_date).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }) }}
              </div>
            </div>
            
            <div v-if="order.notes" class="max-w-md">
              <span class="text-xs font-bold text-black uppercase tracking-widest block mb-2">OBSERVACIONES GENERALES:</span>
              <p class="text-xs text-black font-normal leading-relaxed whitespace-pre-line">{{ order.notes }}</p>
            </div>
          </div>

          <div class="w-1/3 space-y-2">
            <div class="flex justify-between text-sm py-1">
              <span class="font-bold text-black uppercase text-xs">TOTAL PEDIDO:</span>
              <span class="font-medium">${{ formatMoney(order.total_amount) }}</span>
            </div>
            <div v-if="order.advance_payment > 0" class="flex justify-between text-sm py-1 text-emerald-700 font-bold">
              <span class="font-bold uppercase text-xs">ANTICIPO PAGADO:</span>
              <span class="font-medium">-${{ formatMoney(order.advance_payment) }}</span>
            </div>
            <div class="flex flex-col pt-4 border-t-2 border-black">
              <div class="flex justify-between text-xl">
                <span class="font-black uppercase tracking-tighter">RESTANTE $:</span>
                <span class="font-black text-2xl">${{ formatMoney(order.total_amount - (order.advance_payment || 0)) }}</span>
              </div>
              <div v-if="Number(order.total_amount - (order.advance_payment || 0)) <= 0.01 || order.kanban_card?.column?.name === 'Entregados'" class="flex justify-end mt-4 text-emerald-700">
                <span class="font-black text-2xl tracking-widest border-2 border-emerald-700 px-4 py-1 rounded-lg transform -rotate-2 bg-white">LIQUIDADO</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Signatures -->
        <div class="mt-12 flex justify-around text-center text-black">
          <div class="w-48 border-t border-black pt-2">
            <p class="text-xs font-bold uppercase text-slate-800">Firma de Conformidad</p>
          </div>
          <div class="w-48 border-t border-black pt-2">
            <p class="text-xs font-bold uppercase text-slate-800">Entregó (Chesan)</p>
          </div>
        </div>

        <!-- Small print -->
        <div class="mt-6 text-center text-black">
          <p class="text-[10px] text-black uppercase tracking-widest font-normal">
            Gracias por su preferencia. No se aceptan cambios ni devoluciones en prendas personalizadas o bordadas.
          </p>
        </div>
      </div>
    </div>

    <!-- Hidden buttons for manual interaction if needed -->
    <div class="fixed bottom-8 right-8 print:hidden flex gap-4">
      <button @click="$router.back()" class="px-4 py-2 bg-slate-100 text-xs font-bold rounded-lg hover:bg-slate-200">Cerrar</button>
      <button @click="manualPrint" class="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg shadow-lg">Imprimir</button>
    </div>
  </div>

  <div v-else-if="loading" class="h-screen flex items-center justify-center">
    <div class="animate-pulse text-xs font-black uppercase tracking-widest text-slate-400">Preparando Recibo...</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useApi } from '~/composables/useApi'
import { useSettings } from '~/composables/useSettings'
import { ShirtIcon } from 'lucide-vue-next'

definePageMeta({
  layout: false
})

const route = useRoute()
const order = ref<any>(null)
const loading = ref(true)
const { menuLogoUrl, menuLogoBgColor, fetchSettings } = useSettings()

const logoContainerStyle = computed(() => {
  if (!menuLogoBgColor.value || menuLogoBgColor.value === 'transparent') {
    return {}
  }
  return {
    backgroundColor: menuLogoBgColor.value,
    borderColor: 'rgba(0, 0, 0, 0.05)'
  }
})

const formatMoney = (value: any) => {
  const num = Number(value)
  if (isNaN(num)) return '0.00'
  return num.toLocaleString('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

onMounted(async () => {
  try {
    const api = useApi()
    const [res] = await Promise.all([
      api.get(`/api/orders/${route.params.id}`),
      fetchSettings()
    ])
    order.value = res.data
    
    setTimeout(() => {
      if (order.value) {
        window.print()
      }
    }, 800)
  } catch (err) {
    console.error('Error cargando pedido para impresión:', err)
  } finally {
    loading.value = false
  }
})

const manualPrint = () => {
  window.print()
}
</script>

<style>
@page {
  size: letter;
  margin: 0;
}

@media print {
  body {
    background: white !important;
  }
  .print-page {
    width: 100%;
    margin: 0;
    padding: 0;
  }
}

* {
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
}
</style>

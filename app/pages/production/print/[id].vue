<template>
  <div v-if="order" class="print-page bg-white text-black font-sans p-0">
    
    <!-- Header Spacer (for physical stamp or letterhead) -->
    <div class="h-24 mb-6"></div>

    <div class="px-12">
      <!-- Top Info Grid -->
      <div class="flex justify-between items-start mb-10">
        <div class="space-y-1">
          <h1 class="text-xl font-bold tracking-tight">RECIBO DE PEDIDO</h1>
          <p class="text-sm text-slate-500 uppercase tracking-widest">Uniformes y Bordados CheSan</p>
          <p class="text-[10px] text-slate-400 max-w-xs leading-tight">
            Fabricamos uniformes escolares y bordados logotipos en general.
          </p>
        </div>

        <div class="text-right space-y-4">
          <!-- Schedule & Contact -->
          <div class="text-[10px] leading-tight text-slate-500">
            <p class="font-bold uppercase tracking-tighter text-black">Horario de Atención:</p>
            <p>Lunes a Viernes 8:00 am - 5:00 pm</p>
            <p class="font-bold mt-1 text-black">Tel: 922 113 82 91</p>
          </div>

          <!-- Folio and Date -->
          <div class="space-y-1">
            <p class="text-sm font-bold">ORDEN: <span class="text-primary">#{{ order.order_code }}</span></p>
            <p class="text-[10px] text-slate-500 uppercase">FECHA: {{ new Date(order.order_date).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }) }}</p>
          </div>
        </div>
      </div>

      <!-- Client Info Box -->
      <div class="border-y border-slate-200 py-6 mb-8">
        <div class="grid grid-cols-2 gap-x-12 gap-y-3 text-sm">
          <div class="flex gap-2">
            <span class="font-bold text-[10px] uppercase text-slate-400 w-24 shrink-0">CLIENTE:</span>
            <span class="font-bold text-slate-900">{{ order.client?.name }}</span>
          </div>
          <div class="flex gap-2">
            <span class="font-bold text-[10px] uppercase text-slate-400 w-24 shrink-0">E-MAIL:</span>
            <span class="text-slate-600">{{ order.client?.email || '' }}</span>
          </div>
          <div class="flex gap-2">
            <span class="font-bold text-[10px] uppercase text-slate-400 w-24 shrink-0">DIRECCIÓN:</span>
            <span class="text-slate-600">{{ order.client?.address || '' }}</span>
          </div>
          <div class="flex gap-2">
            <span class="font-bold text-[10px] uppercase text-slate-400 w-24 shrink-0">TELÉFONO:</span>
            <span class="font-bold text-slate-900">{{ order.client?.phone || '' }}</span>
          </div>
        </div>
      </div>

      <!-- Table Section -->
      <div class="min-h-[350px]">
        <table class="w-full border-collapse">
          <thead>
            <tr class="border-b-2 border-black text-[10px] font-bold uppercase text-left">
              <th class="py-2 w-20">CANT.</th>
              <th class="py-2 px-4">DETALLE DEL PEDIDO</th>
              <th class="py-2 w-28 text-right">P. UNITARIO</th>
              <th class="py-2 w-28 text-right">IMPORTE</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="item in order.items" :key="item.id" class="text-xs">
              <td class="py-4 font-bold">{{ item.quantity }}</td>
              <td class="py-4 px-4">
                <div class="font-bold text-slate-900 uppercase">
                  {{ item.product_name }}
                </div>
                <div class="text-[9px] text-slate-500 mt-0.5 uppercase font-medium">
                  TALLA: {{ item.size || 'N/A' }}
                </div>
                <!-- Specific Observations -->
                <div v-if="item.observations" class="mt-2 text-[10px] text-slate-600 border-l-2 border-primary/30 pl-3 py-1 italic leading-tight bg-slate-50/50">
                  {{ item.observations }}
                </div>
                <!-- Extras if any -->
                <div v-if="item.extras?.length" class="mt-2 flex flex-wrap gap-x-3 text-[9px] text-slate-400 font-medium italic">
                  <span v-for="(extra, eIdx) in item.extras" :key="eIdx">
                    + {{ extra.description }} (${{ Number(extra.cost).toFixed(2) }})
                  </span>
                </div>
              </td>
              <td class="py-4 text-right">${{ Number(item.unit_price).toFixed(2) }}</td>
              <td class="py-4 text-right font-bold">${{ Number(item.total).toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Footer Section -->
      <div class="mt-10 flex justify-between border-t border-slate-200 pt-6">
        <div class="w-1/2 space-y-6">
          <div class="flex flex-col gap-1">
            <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">FECHA PROMESA DE ENTREGA:</span>
            <div class="text-sm font-black border-b border-slate-100 w-64 pb-1">
              {{ new Date(order.delivery_date).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }) }}
            </div>
          </div>
          
          <div v-if="order.notes" class="max-w-md">
            <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-2">OBSERVACIONES GENERALES:</span>
            <p class="text-[10px] text-slate-500 leading-relaxed">{{ order.notes }}</p>
          </div>
        </div>

        <div class="w-1/3 space-y-2">
          <div class="flex justify-between text-xs py-1 text-slate-400">
            <span class="font-bold uppercase text-[10px]">TOTAL PEDIDO:</span>
            <span class="font-bold">${{ Number(order.total_amount).toFixed(2) }}</span>
          </div>
          <div v-if="order.advance_payment > 0" class="flex justify-between text-xs py-1 text-emerald-600">
            <span class="font-bold uppercase text-[10px]">ANTICIPO PAGADO:</span>
            <span class="font-bold">-${{ Number(order.advance_payment).toFixed(2) }}</span>
          </div>
          <div class="flex justify-between text-lg py-4 border-t-2 border-black">
            <span class="font-bold uppercase tracking-tighter">RESTANTE $:</span>
            <span class="font-black text-2xl">${{ Number(order.total_amount - (order.advance_payment || 0)).toFixed(2) }}</span>
          </div>
        </div>
      </div>

      <!-- Signatures -->
      <div class="mt-20 flex justify-around text-center">
        <div class="w-48 border-t border-black pt-2">
          <p class="text-[9px] font-bold uppercase text-slate-400">Firma de Conformidad</p>
        </div>
        <div class="w-48 border-t border-black pt-2">
          <p class="text-[9px] font-bold uppercase text-slate-400">Entregó (Chesan)</p>
        </div>
      </div>

      <!-- Small print -->
      <div class="mt-16 text-center">
        <p class="text-[8px] text-slate-400 uppercase tracking-widest font-medium">
          Gracias por su preferencia. No se aceptan cambios ni devoluciones en prendas personalizadas o bordadas.
        </p>
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
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useApi } from '~/composables/useApi'

definePageMeta({
  layout: false
})

const route = useRoute()
const order = ref<any>(null)
const loading = ref(true)

onMounted(async () => {
  try {
    const api = useApi()
    const response = await api.get(`/api/orders/${route.params.id}`)
    order.value = response.data
    
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
@media print {
  body {
    background: white !important;
  }
  .print-page {
    width: 100%;
    margin: 0;
  }
}

* {
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
}
</style>

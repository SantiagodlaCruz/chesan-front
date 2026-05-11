<template>
  <div v-if="quotation" class="print-page bg-white text-black font-sans p-0">
    
    <!-- Header Spacer (for physical stamp or letterhead) -->
    <div class="h-24 mb-6"></div>

    <div class="px-12">
      <!-- Top Info Grid -->
      <div class="flex justify-between items-start mb-10">
        <div class="space-y-1">
          <h1 class="text-xl font-bold tracking-tight">COTIZACIÓN</h1>
          <p class="text-sm text-slate-500 uppercase tracking-widest">Uniformes y Bordados CheSan</p>
          <p class="text-[10px] text-slate-400 max-w-xs leading-tight">
            Fabricamos uniformes escolares y bordados logotipos en general.
          </p>
        </div>

        <div class="text-right space-y-4">
          <!-- Schedule & Contact -->
          <div class="text-[10px] leading-tight">
            <p class="font-bold uppercase tracking-tighter">Horario de Atención:</p>
            <p>Lunes a Viernes 8:00 am - 5:00 pm</p>
            <p class="font-bold mt-1">Tel: 922 113 82 91</p>
          </div>

          <!-- Folio and Date -->
          <div class="space-y-1">
            <p class="text-sm font-bold">FOLIO: <span class="text-red-600">No. {{ quotation.folio }}</span></p>
            <p class="text-xs text-slate-500 uppercase">FECHA: {{ new Date(quotation.quotation_date).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }) }}</p>
          </div>
        </div>
      </div>

      <!-- Client Info Box -->
      <div class="border-y border-slate-200 py-6 mb-8">
        <div class="grid grid-cols-2 gap-x-12 gap-y-3 text-sm">
          <div class="flex gap-2">
            <span class="font-bold text-[10px] uppercase text-slate-400 w-24 shrink-0">CLIENTE:</span>
            <span class="font-bold text-slate-900">{{ quotation.client?.name }}</span>
          </div>
          <div class="flex gap-2">
            <span class="font-bold text-[10px] uppercase text-slate-400 w-24 shrink-0">E-MAIL:</span>
            <span class="text-slate-600">{{ quotation.client?.email || '' }}</span>
          </div>
          <div class="flex gap-2">
            <span class="font-bold text-[10px] uppercase text-slate-400 w-24 shrink-0">DIRECCIÓN:</span>
            <span class="text-slate-600">{{ quotation.client?.address || '' }}</span>
          </div>
          <div class="flex gap-2">
            <span class="font-bold text-[10px] uppercase text-slate-400 w-24 shrink-0">TELÉFONO:</span>
            <span class="font-bold text-slate-900">{{ quotation.client?.phone || '' }}</span>
          </div>
        </div>
      </div>

      <!-- Table Section -->
      <div class="min-h-[350px]">
        <table class="w-full border-collapse">
          <thead>
            <tr class="border-b-2 border-black text-[10px] font-bold uppercase text-left">
              <th class="py-2 w-20">CANT.</th>
              <th class="py-2 px-4">DESCRIPCIÓN DEL PRODUCTO</th>
              <th class="py-2 w-28 text-right">P. UNITARIO</th>
              <th class="py-2 w-28 text-right">IMPORTE</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="item in quotation.items" :key="item.id" class="text-xs">
              <td class="py-4 font-bold">{{ item.quantity }}</td>
              <td class="py-4 px-4">
              <div class="font-bold text-slate-900 uppercase">
                {{ item.product_catalog_price?.product_catalog?.name || item.custom_description }}
              </div>
                <div v-if="item.product_catalog_price" class="text-[9px] text-slate-500 mt-0.5">
                  {{ item.product_catalog_price.material }} • TALLA: {{ item.specific_size || item.product_catalog_price.size_range }}
                </div>
                <!-- Specific Observations -->
                <div v-if="item.observations" class="mt-2 text-[10px] text-slate-600 border-l-2 border-slate-200 pl-3 py-1 italic leading-tight">
                  {{ item.observations }}
                </div>
                <!-- Extras -->
                <div v-if="item.extras?.length" class="mt-2 flex flex-wrap gap-x-3 text-[9px] text-slate-400 font-medium">
                  <span v-for="(extra, eIdx) in item.extras" :key="eIdx">
                    + {{ extra.description }} (${{ Number(extra.cost).toFixed(2) }})
                  </span>
                </div>
              </td>
              <td class="py-4 text-right">${{ Number(item.unit_price).toFixed(2) }}</td>
              <td class="py-4 text-right font-bold">${{ Number(item.subtotal).toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Footer Section -->
      <div class="mt-10 flex justify-between border-t border-slate-200 pt-6">
        <div class="w-1/2 space-y-6">
          <div class="flex flex-col gap-1">
            <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">FECHA DE ENTREGA:</span>
            <div class="border-b border-slate-200 w-64 h-6"></div>
          </div>
          
          <div v-if="quotation.notes" class="max-w-md">
            <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-2">NOTAS ADICIONALES:</span>
            <p class="text-[10px] text-slate-500 leading-relaxed">{{ quotation.notes }}</p>
          </div>
        </div>

        <div class="w-1/3 space-y-2">
          <div class="flex justify-between text-xs py-1">
            <span class="font-bold text-slate-400 uppercase text-[10px]">SUBTOTAL:</span>
            <span class="font-bold">${{ Number(quotation.total_amount).toFixed(2) }}</span>
          </div>
          <div class="flex justify-between text-lg py-4 border-t-2 border-black">
            <span class="font-bold uppercase tracking-tighter">TOTAL $:</span>
            <span class="font-black">${{ Number(quotation.total_amount).toFixed(2) }}</span>
          </div>
        </div>
      </div>

      <!-- Small print -->
      <div class="mt-12 text-center">
        <p class="text-[8px] text-slate-400 uppercase tracking-widest font-medium">
          Vigencia de cotización: 15 días naturales. Sujeto a cambios sin previo aviso.
        </p>
      </div>
    </div>
  </div>

  <div v-else-if="loading" class="h-screen flex items-center justify-center">
    <div class="animate-pulse text-xs font-black uppercase tracking-widest text-slate-400">Generando documento...</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useApi } from '~/composables/useApi'

const route = useRoute()
const api = useApi()
const quotation = ref(null)
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await api.get(`/api/quotations/${route.params.id}`)
    quotation.value = res.data
    
    setTimeout(() => {
      if (quotation.value) {
        window.print()
      }
    }, 600)
  } catch (err) {
    console.error('Error loading quotation for print:', err)
  } finally {
    loading.value = false
  }
})

definePageMeta({
  layout: false
})
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

/* Ensure colors print correctly */
* {
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
}
</style>


<template>
  <div v-if="quotation" class="print-page bg-white text-black font-sans p-0">
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
            <h1 class="text-2xl font-black tracking-tight">COTIZACIÓN</h1>
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
              <p class="text-base font-bold">FOLIO: <span class="text-red-700 font-black">No. {{ quotation.folio }}</span></p>
              <p class="text-xs font-normal text-slate-900 uppercase">FECHA: <span class="font-medium">{{ new Date(quotation.quotation_date).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }) }}</span></p>
            </div>
          </div>
        </div>

        <!-- Client Info Box -->
        <div class="border-y-2 border-black py-6 mb-8 text-black">
          <div class="grid grid-cols-2 gap-x-12 gap-y-3 text-sm">
            <div class="flex gap-2">
              <span class="font-bold text-xs uppercase text-black w-24 shrink-0">CLIENTE:</span>
              <span class="font-semibold text-black text-base">{{ quotation.client?.name }}</span>
            </div>
            <div class="flex gap-2">
              <span class="font-bold text-xs uppercase text-black w-24 shrink-0">E-MAIL:</span>
              <span class="font-normal text-black">{{ quotation.client?.email || '' }}</span>
            </div>
            <div class="flex gap-2">
              <span class="font-bold text-xs uppercase text-black w-24 shrink-0">DIRECCIÓN:</span>
              <span class="font-normal text-black">{{ quotation.client?.address || '' }}</span>
            </div>
            <div class="flex gap-2">
              <span class="font-bold text-xs uppercase text-black w-24 shrink-0">TELÉFONO:</span>
              <span class="font-semibold text-black text-base">{{ quotation.client?.phone || '' }}</span>
            </div>
          </div>
        </div>

        <!-- Table Section -->
        <div class="min-h-[150px] text-black">
          <table class="w-full border-collapse">
            <thead>
              <tr class="border-b-2 border-black text-xs font-black uppercase text-left">
                <th class="py-2 w-20">CANT.</th>
                <th class="py-2 px-4">DESCRIPCIÓN DEL PRODUCTO</th>
                <th class="py-2 w-28 text-right">P. UNITARIO</th>
                <th class="py-2 w-28 text-right">IMPORTE</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200">
              <tr v-for="item in quotation.items" :key="item.id" class="text-sm">
                <td class="py-4 font-medium text-base">{{ item.quantity }}</td>
                <td class="py-4 px-4">
                  <div class="font-bold text-black uppercase text-sm leading-tight">
                    {{ item.product_catalog_price?.product_catalog?.name || item.custom_description }}
                  </div>
                  <div v-if="item.product_catalog_price" class="text-xs text-slate-700 font-normal mt-0.5">
                    {{ item.product_catalog_price.material }} • TALLA: {{ item.specific_size || item.product_catalog_price.size_range }}
                  </div>
                  <!-- Specific Observations -->
                  <div v-if="item.observations" class="mt-2 text-xs text-slate-700 border-l-2 border-black pl-3 py-0.5 italic leading-tight whitespace-pre-line">
                    {{ item.observations }}
                  </div>
                  <!-- Extras -->
                  <div v-if="item.extras?.length" class="mt-2 flex flex-wrap gap-x-3 text-xs text-slate-600 font-normal">
                    <span v-for="(extra, eIdx) in item.extras" :key="eIdx">
                      + {{ extra.description }} (${{ formatMoney(extra.cost) }})
                    </span>
                  </div>
                </td>
                <td class="py-4 text-right font-normal">${{ formatMoney(item.unit_price) }}</td>
                <td class="py-4 text-right font-semibold">${{ formatMoney(item.subtotal) }}</td>
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
              <span class="text-xs font-bold text-black uppercase tracking-widest">FECHA DE ENTREGA:</span>
              <div class="border-b-2 border-black w-64 h-6"></div>
            </div>
            
            <div v-if="quotation.notes" class="max-w-md">
              <span class="text-xs font-bold text-black uppercase tracking-widest block mb-2">NOTAS ADICIONALES:</span>
              <p class="text-xs text-black font-normal leading-relaxed whitespace-pre-line">{{ quotation.notes }}</p>
            </div>
          </div>

          <div class="w-1/3 space-y-2">
            <div class="flex justify-between text-sm py-1">
              <span class="font-bold text-black uppercase text-xs">SUBTOTAL:</span>
              <span class="font-medium">${{ formatMoney(quotation.total_amount) }}</span>
            </div>
            <div class="flex justify-between text-xl py-4 border-t-2 border-black">
              <span class="font-black uppercase tracking-tighter">TOTAL $:</span>
              <span class="font-black text-2xl">${{ formatMoney(quotation.total_amount) }}</span>
            </div>
          </div>
        </div>

        <!-- Small print -->
        <div class="mt-6 text-center text-black">
          <p class="text-[10px] text-black uppercase tracking-widest font-normal">
            Vigencia de cotización: 15 días naturales. Sujeto a cambios sin previo aviso.
          </p>
        </div>
      </div>
    </div>
  </div>

  <div v-else-if="loading" class="h-screen flex items-center justify-center">
    <div class="animate-pulse text-xs font-black uppercase tracking-widest text-slate-400">Generando documento...</div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useApi } from '~/composables/useApi'
import { useSettings } from '~/composables/useSettings'
import { ShirtIcon } from 'lucide-vue-next'

const route = useRoute()
const api = useApi()
const { menuLogoUrl, menuLogoBgColor, fetchSettings } = useSettings()
const quotation = ref(null)
const loading = ref(true)

const logoContainerStyle = computed(() => {
  if (!menuLogoBgColor.value || menuLogoBgColor.value === 'transparent') {
    return {}
  }
  return {
    backgroundColor: menuLogoBgColor.value,
    borderColor: 'rgba(0, 0, 0, 0.05)'
  }
})

const formatMoney = (value) => {
  const num = Number(value)
  if (isNaN(num)) return '0.00'
  return num.toLocaleString('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

onMounted(async () => {
  try {
    const [res] = await Promise.all([
      api.get(`/api/quotations/${route.params.id}`),
      fetchSettings()
    ])
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

/* Ensure colors print correctly */
* {
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
}
</style>


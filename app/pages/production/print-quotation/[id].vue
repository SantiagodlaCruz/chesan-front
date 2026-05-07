<template>
  <div v-if="quotation" class="p-8 max-w-4xl mx-auto bg-white text-slate-900 print:p-0">
    <!-- Header -->
    <div class="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-8">
      <div>
        <h1 class="text-3xl font-black uppercase tracking-tighter">CHESAN UNIFORMES</h1>
        <p class="text-xs font-bold text-slate-500 uppercase tracking-widest">Cotización Formal</p>
      </div>
      <div class="text-right">
        <p class="text-lg font-black text-slate-900">{{ quotation.folio }}</p>
        <p class="text-xs text-slate-500">{{ new Date(quotation.quotation_date).toLocaleDateString() }}</p>
      </div>
    </div>

    <!-- Info Section -->
    <div class="grid grid-cols-2 gap-12 mb-10">
      <div>
        <h2 class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 border-b border-slate-100">Cliente</h2>
        <p class="font-black text-lg">{{ quotation.client?.name }}</p>
        <p v-if="quotation.client?.phone" class="text-sm text-slate-600">{{ quotation.client.phone }}</p>
        <p v-if="quotation.client?.email" class="text-sm text-slate-600">{{ quotation.client.email }}</p>
      </div>
      <div class="text-right">
        <h2 class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 border-b border-slate-100 justify-end flex">Detalles del Emisor</h2>
        <p class="font-bold text-sm">Calle Emiliano Zapata #25</p>
        <p class="text-sm">Col. Agustín Melgar 2da. Sección</p>
        <p class="text-sm">Cosoleacaque, Veracruz</p>
        <p class="text-sm font-bold mt-1">Tel: 922 113 8291</p>
      </div>
    </div>

    <!-- Items Table -->
    <table class="w-full mb-10">
      <thead>
        <tr class="border-b-2 border-slate-900 text-[10px] font-black uppercase tracking-widest text-slate-900">
          <th class="py-3 text-left">Descripción / Producto</th>
          <th class="py-3 text-center w-20">Cant.</th>
          <th class="py-3 text-right w-32">Precio Unit.</th>
          <th class="py-3 text-right w-32">Total</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-100">
        <tr v-for="item in quotation.items" :key="item.id" class="text-sm">
          <td class="py-4">
            <div class="font-bold text-slate-900">
              {{ item.product_catalog_price?.product?.name || item.custom_description }}
            </div>
            <div v-if="item.product_catalog_price" class="text-xs text-slate-500 font-medium">
              {{ item.product_catalog_price.material }} 
              <span v-if="item.specific_size"> - Talla: {{ item.specific_size }}</span>
              <span v-else> - Talla: {{ item.product_catalog_price.size_range }}</span>
            </div>
            <!-- Extras -->
            <div v-if="item.extras?.length" class="mt-1 space-y-0.5">
              <div v-for="(extra, eIdx) in item.extras" :key="eIdx" class="text-[10px] text-slate-400 italic">
                + {{ extra.description }} (${{ extra.cost }})
              </div>
            </div>
          </td>
          <td class="py-4 text-center font-bold">{{ item.quantity }}</td>
          <td class="py-4 text-right font-medium">${{ item.unit_price }}</td>
          <td class="py-4 text-right font-black">${{ item.subtotal }}</td>
        </tr>
      </tbody>
    </table>

    <!-- Summary -->
    <div class="flex justify-end mb-12">
      <div class="w-64 space-y-3">
        <div class="flex justify-between items-center text-sm">
          <span class="font-bold text-slate-500 uppercase tracking-widest text-[10px]">Subtotal</span>
          <span class="font-bold">${{ quotation.total_amount }}</span>
        </div>
        <div class="flex justify-between items-center pt-3 border-t-2 border-slate-900">
          <span class="font-black text-slate-900 uppercase tracking-tighter text-lg">Total</span>
          <span class="font-black text-2xl text-slate-900">${{ quotation.total_amount }}</span>
        </div>
      </div>
    </div>

    <!-- Notes -->
    <div v-if="quotation.notes" class="mb-12 p-4 bg-slate-50 rounded-xl border border-slate-100">
      <h3 class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Notas y Condiciones</h3>
      <p class="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed">{{ quotation.notes }}</p>
    </div>

    <!-- Footer / Signature -->
    <div class="mt-20 grid grid-cols-2 gap-12 text-center">
      <div class="border-t border-slate-900 pt-4">
        <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Firma de Aceptación</p>
      </div>
      <div class="border-t border-slate-900 pt-4">
        <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Atentamente</p>
        <p class="text-xs font-bold mt-1 text-slate-900">CHESAN UNIFORMES</p>
      </div>
    </div>
  </div>
  <div v-else-if="loading" class="h-screen flex items-center justify-center">
    <div class="animate-spin w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full"></div>
  </div>
</template>

<script setup>
const route = useRoute()
const api = useApi()
const quotation = ref(null)
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await api.get(`/api/quotations/${route.params.id}`)
    quotation.value = res.data
    
    // Esperar a que se renderice y las fuentes se carguen
    setTimeout(() => {
      if (quotation.value) window.print()
    }, 1000)
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
  .no-print {
    display: none !important;
  }
}
</style>

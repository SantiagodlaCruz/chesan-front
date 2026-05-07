<template>
  <div class="min-h-screen bg-slate-200 dark:bg-slate-900 py-10 px-4 print:p-0 print:bg-white print:min-h-0">
    <!-- Hoja Tamaño Carta -->
    <div class="max-w-[850px] mx-auto bg-white shadow-2xl rounded-sm min-h-[1050px] p-12 print:shadow-none print:max-w-full print:p-8 print:mx-0 print:min-h-0">
      
      <!-- Header de la Factura -->
      <div class="flex justify-between items-start border-b-2 border-black pb-6 mb-8">
        <div>
          <h1 class="text-3xl font-black text-black tracking-tighter">CHESAN</h1>
          <p class="text-[10px] font-bold text-black uppercase tracking-widest">Uniformes y Bordados Profesionales</p>
          <div class="mt-4 text-xs space-y-1 text-black font-medium">
            <p>Calle Principal #123, Col. Centro</p>
            <p>Villahermosa, Tabasco, México</p>
            <p>Tel: (993) 123 4567</p>
          </div>
        </div>
        <div class="text-right">
          <h2 class="text-xl font-black uppercase text-black mb-1 opacity-40">Nota de Remisión</h2>
          <p class="text-2xl font-black text-black">#ORD-{{ order?.order_code || '------' }}</p>
          <p class="text-xs font-bold text-black mt-2">Fecha: {{ today }}</p>
        </div>
      </div>

      <!-- Info del Cliente -->
      <div class="grid grid-cols-2 gap-8 mb-10">
        <div class="bg-white p-4 rounded-xl border border-black/20">
          <h3 class="text-[10px] font-black uppercase text-black mb-2 tracking-widest">Datos del Cliente</h3>
          <p class="text-sm font-black text-black">{{ order?.client?.name || 'Cargando...' }}</p>
          <p class="text-[11px] text-black mt-1 font-medium">{{ order?.client?.email }}</p>
          <p class="text-[11px] text-black font-medium">{{ order?.client?.phone }}</p>
        </div>
        <div class="bg-white p-4 rounded-xl border border-black/20 flex flex-col justify-center">
          <h3 class="text-[10px] font-black uppercase text-black mb-2 tracking-widest text-right">Estatus del Pago</h3>
          <p class="text-lg font-black text-black text-right uppercase">TOTALMENTE LIQUIDADO</p>
        </div>
      </div>

      <!-- Tabla de Productos -->
      <div class="mb-10">
        <table class="w-full text-left border-collapse border border-black/10">
          <thead>
            <tr class="bg-black text-white uppercase text-[10px] font-black tracking-widest">
              <th class="px-4 py-3 rounded-l-sm">Descripción del Producto</th>
              <th class="px-4 py-3 text-center">Talla</th>
              <th class="px-4 py-3 text-center">Cant.</th>
              <th class="px-4 py-3 text-right">P. Unitario</th>
              <th class="px-4 py-3 text-right rounded-r-sm">Subtotal</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-black/10">
            <tr v-for="item in order?.items" :key="item.id" class="text-xs text-black font-medium">
              <td class="px-4 py-4">
                <div class="font-black">{{ item.product_name }}</div>
                <div class="text-[10px] text-black/60 flex items-center gap-1 mt-0.5" v-if="item.color">
                  Color: {{ item.color.name }}
                </div>
              </td>
              <td class="px-4 py-4 text-center font-black">{{ item.size || '-' }}</td>
              <td class="px-4 py-4 text-center">
                <span class="font-black">{{ item.quantity }}</span>
              </td>
              <td class="px-4 py-4 text-right">${{ item.unit_price }}</td>
              <td class="px-4 py-4 text-right font-black">${{ item.quantity * item.unit_price }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Totales y Firmas -->
      <div class="grid grid-cols-2 gap-12 mt-16">
        <div class="space-y-12">
          <div v-if="order?.notes">
            <h4 class="text-[10px] font-black uppercase text-black mb-2 tracking-widest">Observaciones</h4>
            <p class="text-[11px] text-black italic border-l-2 border-black pl-3 leading-relaxed">
              {{ order.notes }}
            </p>
          </div>
          <div class="flex gap-16 pt-16">
            <div class="flex-1 border-t border-black pt-2 text-center">
              <p class="text-[9px] font-black uppercase text-black">Entregó (Chesan)</p>
            </div>
            <div class="flex-1 border-t border-black pt-2 text-center">
              <p class="text-[9px] font-black uppercase text-black">Recibió (Cliente)</p>
            </div>
          </div>
        </div>

        <div class="border-2 border-black p-6 rounded-xl flex flex-col gap-4 self-start">
          <div class="flex justify-between text-[11px] font-black text-black">
            <span class="uppercase tracking-widest">Subtotal</span>
            <span>${{ order?.total_amount }}</span>
          </div>
          <div class="flex justify-between text-[11px] font-black text-black border-b border-black/20 pb-4">
            <span class="uppercase tracking-widest">IVA (Incluido)</span>
            <span>$0.00</span>
          </div>
          <div class="flex justify-between items-center text-black">
            <span class="text-xs font-black uppercase tracking-widest">Total Pagado</span>
            <span class="text-4xl font-black">${{ order?.total_amount }}</span>
          </div>
        </div>
      </div>

    </div>

    <!-- Botón flotante para imprimir (Solo visible en pantalla) -->
    <div class="fixed bottom-8 right-8 print:hidden flex gap-4">
      <BaseButton variant="secondary" @click="$router.back()">Regresar al Tablero</BaseButton>
      <BaseButton variant="primary" @click="print" class="shadow-2xl">Imprimir Ahora</BaseButton>
    </div>
  </div>
</template>

<style>
@media print {
  @page {
    size: auto;
    margin: 0mm;
  }
  body {
    margin: 0;
    padding: 0;
  }
}
</style>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import BaseButton from '~/components/BaseButton.vue'

definePageMeta({
  layout: false
})

const route = useRoute()
const order = ref<any>(null)
const today = new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })

onMounted(async () => {
  try {
    const api = useApi()
    const response = await api.get(`/api/orders/${route.params.id}`)
    
    // IMPORTANTE: Acceder a .data porque useApi ya devuelve el cuerpo de la respuesta
    // y BaseApiController envuelve la respuesta real en 'data'
    order.value = response.data
    
    // Auto-imprimir después de un delay suficiente para renderizado
    setTimeout(() => {
      if (order.value) window.print()
    }, 1200)
  } catch (err) {
    console.error('Error cargando pedido para impresión:', err)
  }
})

const print = () => window.print()
</script>

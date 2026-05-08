<template>
  <BaseModal
    :show="show"
    title="Imprimir etiquetas"
    subtitle="Genera e imprime etiquetas de código de barras."
    size="md"
    @update:show="close"
  >
    <div class="space-y-6">
      <!-- Preview -->
      <div v-if="item?.barcode" class="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/5">
        <svg ref="barcodeElement" class="max-w-full h-auto"></svg>
        <p class="text-xs text-slate-600 dark:text-slate-300 mt-4 font-bold text-center px-4">
          {{ itemName }} <br/>
          <span class="font-normal text-slate-500">{{ itemDetails }}</span>
        </p>
      </div>
      <div v-else class="flex flex-col items-center justify-center p-6 bg-red-50 dark:bg-red-500/10 rounded-2xl border border-red-200 dark:border-red-500/20">
        <p class="text-sm font-bold text-red-600 dark:text-red-400">Este producto no tiene código de barras asignado.</p>
      </div>

      <div class="flex flex-col gap-4" v-if="item?.barcode">
        <BaseQuantityInput
          v-model="copies"
          name="copies"
          label="Cantidad a Imprimir"
        />
        
        <div class="grid grid-cols-2 gap-3 pb-2 pt-1 border-t border-slate-100 dark:border-white/5">
          <BaseQuantityInput
            v-model="labelWidth"
            label="Ancho (cm)"
            :min="2"
            :step="0.1"
          />
          <BaseQuantityInput
            v-model="labelHeight"
            label="Alto (cm)"
            :min="1"
            :step="0.1"
          />
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center justify-center gap-3 pt-4 border-t border-border-light dark:border-[#1e293b]">
        <BaseButton type="button" variant="secondary" :full="false" @click="close">
          Cancelar
        </BaseButton>
        <BaseButton
          v-if="item?.barcode"
          type="button"
          variant="primary"
          :full="false"
          class="min-w-[140px]"
          @click="printLabels"
        >
          <PrinterIcon class="w-4 h-4 mr-2 inline-block" />
          Imprimir Etiquetas
        </BaseButton>
      </div>
    </div>
  </BaseModal>

  <!-- Printable Area (Hidden from screen view) -->
  <Teleport to="body">
    <div id="print-area-wrapper" class="hidden print:block" v-if="show && item?.barcode" :style="printDimensionsStyle">
      <div class="print-container">
        <!-- Loop through copies -->
        <div v-for="n in (copies > 0 ? copies : 1)" :key="n" class="print-label">
          <div class="label-content">
            <p class="label-title">{{ itemName }}</p>
            <p v-if="itemDetails" class="label-subtitle">{{ itemDetails }}</p>
            <svg :id="'print-barcode-' + n" class="barcode-svg"></svg>
            <p v-if="price" class="label-price">${{ price }}</p>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue'
import JsBarcode from 'jsbarcode'
import { PrinterIcon } from 'lucide-vue-next'
import BaseModal from '~/components/BaseModal.vue'
import BaseButton from '~/components/BaseButton.vue'
import BaseQuantityInput from '~/components/BaseQuantityInput.vue'
import type { StockProduct, RawMaterial } from '~/types'

const props = defineProps<{
  show: boolean
  item: StockProduct | RawMaterial | null
}>()

const emit = defineEmits(['update:show'])

const barcodeElement = ref<HTMLElement | null>(null)
const copies = ref(1)
const labelWidth = ref(5.1)
const labelHeight = ref(2.5)

const printDimensionsStyle = computed(() => ({
  '--label-width': `${labelWidth.value}cm`,
  '--label-height': `${labelHeight.value}cm`
}))

const itemName = computed(() => props.item?.name || '')

const itemDetails = computed(() => {
  if (!props.item) return ''
  const details = []
  
  // Is StockProduct
  if ('size' in props.item) {
    if ((props.item as any).color?.name) details.push((props.item as any).color.name)
    if ((props.item as any).size?.name) details.push(`Talla ${(props.item as any).size.name}`)
  } 
  // Is RawMaterial
  else if ('unit_measure' in props.item) {
    if ((props.item as any).color?.name) details.push((props.item as any).color.name)
    if ((props.item as any).unit_measure?.name) details.push((props.item as any).unit_measure.name)
  }
  
  return details.join(' - ')
})

const price = computed(() => {
  if (!props.item) return ''
  if ('sale_price' in props.item && (props.item as any).sale_price) {
    return parseFloat((props.item as any).sale_price as string).toFixed(2)
  }
  return ''
})

watch(() => props.show, async (newVal) => {
  if (newVal) {
    copies.value = 1
    labelWidth.value = 5.1
    labelHeight.value = 2.5
    await nextTick()
    renderMainBarcode()
  }
})

const renderMainBarcode = () => {
  if (!barcodeElement.value || !props.item?.barcode) return
  JsBarcode(barcodeElement.value, props.item.barcode, {
    format: "CODE128",
    lineColor: document.documentElement.classList.contains('dark') ? '#e2e8f0' : '#0f172a',
    background: 'transparent',
    width: 2,
    height: 70,
    displayValue: true,
    fontSize: 16,
    fontOptions: "bold",
    margin: 0
  })
}

const printLabels = async () => {
  if (!props.item?.barcode) return

  // Render barcodes for print view
  await nextTick() // Ensure print elements are rendered by Vue
  for (let i = 1; i <= copies.value; i++) {
    const el = document.getElementById(`print-barcode-${i}`)
    if (el) {
      JsBarcode(el, props.item.barcode, {
        format: "CODE128",
        lineColor: "#000000",
        width: 1.5,
        height: 35,
        displayValue: true,
        fontSize: 12,
        fontOptions: "bold",
        margin: 5
      })
    }
  }

  window.print()
}

const close = () => {
  emit('update:show', false)
}
</script>

<style>
/* Estilos solo para cuando se manda a imprimir */
@media print {
  /* Ocultar TODO lo demás del body */
  body > *:not(#print-area-wrapper) {
    display: none !important;
  }
  
  @page {
    margin: 0; /* OBLIGATORIO en 0 para impresoras térmicas de rollo */
  }

  body {
    background: white; /* Important for barcode contrast */
  }

  #print-area-wrapper {
    display: block !important;
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    margin: 0;
    padding: 2mm; /* Pequeño margen interno de seguridad */
    background: white;
  }

  .print-container {
    display: flex;
    flex-wrap: wrap; /* Permitir que las etiquetas fluyan en una hoja A4 normal */
    gap: 15px; /* Espaciado entre etiquetas */
    justify-content: flex-start;
    align-items: flex-start;
    width: 100%;
  }

  .print-label {
    width: var(--label-width, 5.5cm);
    height: var(--label-height, 3cm);
    padding: 5px;
    box-sizing: border-box;
    page-break-inside: avoid; /* Evitar que se corte a la mitad de la hoja */
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: white;
    color: black;
    overflow: hidden;
    /* Un borde muy sutil para saber dónde recortar si imprimen en hoja normal */
    border: 1px dashed #cccccc; 
    border-radius: 4px;
  }

  .label-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }

  .label-title {
    font-size: 10px;
    font-weight: 800;
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
    margin: 0 0 2px 0;
  }

  .label-subtitle {
    font-size: 8px;
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    color: #333333;
    white-space: nowrap;
    margin: 0;
  }

  .label-price {
    font-size: 11px;
    font-weight: 900;
    font-family: monospace;
    margin: 2px 0 0 0;
  }

  .barcode-svg {
    max-width: 100%;
    max-height: 14mm; /* Espacio para que quepa bien el código negro intenso */
    margin-top: 2px;
  }
}
</style>

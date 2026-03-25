<template>
  <div class="flex flex-col gap-4">
    <!-- Title and Actions -->
    <div class="flex flex-wrap justify-between items-end gap-4 mb-1">
      <div class="space-y-1">
        <h2 class="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">Inventario</h2>
      </div>
      <button @click="showAddModal = true" class="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-primary/20">
        <PlusIcon class="w-5 h-5" />
        Añadir Nuevo Artículo
      </button>
    </div>

    <!-- Tabs (Segmented Control Style) -->
    <!-- Tabs (Segmented Control Style) -->
    <div class="flex gap-1.5 p-1.5 bg-slate-100 dark:bg-card-dark rounded-[14px] w-fit border border-border-light dark:border-border-dark shadow-sm -mb-2 mt-1 relative z-20">
      <button 
        @click="activeTab = 'productos'"
        :class="activeTab === 'productos' ? 'bg-white dark:bg-white/10 shadow-sm text-primary font-bold' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-white/5 font-medium'"
        class="px-5 py-2 rounded-lg text-sm transition-all"
      >
        Inventario de Productos
      </button>
      <button 
        @click="activeTab = 'materia_prima'"
        :class="activeTab === 'materia_prima' ? 'bg-white dark:bg-white/10 shadow-sm text-primary font-bold' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-white/5 font-medium'"
        class="px-5 py-2 rounded-lg text-sm transition-all"
      >
        Inventario de Materia Prima
      </button>
    </div>

    <!-- Filters -->
    <div class="flex items-end flex-wrap gap-4 pb-2 pt-2 relative z-10">
      <div class="w-48 shrink-0">
        <Select 
          v-model="filtroCategoria"
          :options="opcionesCategoria"
          label="Categoría"
          placeholder="Cualquiera"
          searchable
        />
      </div>

    

      <div class="w-48 shrink-0">
        <Select 
          v-model="filtroEstado"
          :options="opcionesEstado"
          label="Estado"
          placeholder="Cualquiera"
        />
      </div>

        <div class="w-48 shrink-0">
        <Select 
          v-model="filtroStock"
          :options="opcionesStock"
          label="Ordenar"
          placeholder="Cualquiera"
        />
      </div>

      
      <div class="flex-1 min-w-[200px] flex justify-end">
        <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Mostrando {{ currentItems.length }} artículos</p>
      </div>
    </div>

    <!-- Data Table -->
    <div class="bg-white dark:bg-card-dark rounded-2xl border border-border-light dark:border-border-dark overflow-hidden shadow-sm">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr class="bg-panel-light dark:bg-white/5 border-b border-border-light dark:border-border-dark">
              <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">SKU</th>
              <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Imagen</th>
              <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nombre del Artículo</th>
              <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Categoría</th>
              <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nivel de Stock</th>
              <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</th>
              <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border-light dark:divide-border-dark">
            <tr v-for="item in currentItems" :key="item.sku" class="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
              <td class="px-6 py-4 font-mono text-xs text-slate-500">{{ item.sku }}</td>
              <td class="px-6 py-4">
                <div class="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden border border-border-light dark:border-border-dark bg-cover bg-center" :style="{ backgroundImage: `url(${item.image})` }">
                  <!-- Alternatively we could use <img> instead of background-image for accessibility, but both approach work. Here we mimic the styling from the HTML. -->
                </div>
              </td>
              <td class="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100">{{ item.name }}</td>
              <td class="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{{ item.category }}</td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-bold" :class="getStockColorClass(item.status)">{{ item.stock }}</span>
                  <span class="text-xs text-slate-400">{{ item.unit }}</span>
                </div>
              </td>
              <td class="px-6 py-4">
                <span 
                  class="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border"
                  :class="getStatusClasses(item.status)"
                >
                  {{ item.status }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2 justify-end">
                  <button class="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors" title="Ver Detalles">
                    <EyeIcon class="w-5 h-5 text-primary" />
                  </button>
                  <button class="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors" title="Editar">
                    <EditIcon class="w-5 h-5 text-[#eab308]" />
                  </button>
                  <button class="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors" title="Eliminar">
                    <TrashIcon class="w-5 h-5 text-accent-red" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="currentItems.length === 0">
              <td colspan="7" class="px-6 py-8 text-center text-slate-500">
                No hay artículos para esta pestaña.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Pagination Footer -->
      <div class="px-6 py-4 bg-panel-light dark:bg-white/5 border-t border-border-light dark:border-border-dark flex items-center justify-between">
        <p class="text-sm text-slate-500">Mostrando 1 a {{ currentItems.length }} de {{ allItems.length }} artículos</p>
        <div class="flex items-center gap-2">
          <button class="p-1 rounded bg-white dark:bg-card-dark border border-border-light dark:border-border-dark hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
            <ChevronLeftIcon class="w-4 h-4 text-slate-500" />
          </button>
          <span class="text-xs font-bold px-2 text-slate-700 dark:text-slate-300">1</span>
          <button class="p-1 rounded bg-white dark:bg-card-dark border border-border-light dark:border-border-dark hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
            <ChevronRightIcon class="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </div>
    </div>

    <!-- Add Item Modal -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-blue-950/40 backdrop-blur-md">
          <!-- Modal Container -->
          <div class="bg-white dark:bg-[#0f172a] w-full max-w-2xl rounded-2xl shadow-2xl border border-border-light dark:border-[#1e293b] overflow-hidden flex flex-col max-h-[90vh] dark:shadow-blue-900/10">
            
            <!-- Modal Header -->
            <div class="px-8 py-6 border-b border-border-light dark:border-[#1e293b] flex justify-between items-start shrink-0">
              <div>
                <h2 class="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Añadir Nuevo Artículo</h2>
                <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Registre un nuevo material o producto terminado en el sistema.</p>
              </div>
              <button @click="showAddModal = false" class="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors text-slate-400">
                <XIcon class="w-5 h-5" />
              </button>
            </div>

            <!-- Modal Body / Form -->
            <div class="p-8 overflow-y-auto custom-scrollbar">
              <form @submit.prevent="showAddModal = false" class="space-y-8">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <!-- Left Column: Details -->
                  <div class="space-y-6">
                    <!-- Name -->
                    <div class="flex flex-col gap-1.5">
                      <label class="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Nombre del artículo</label>
                      <input class="w-full bg-slate-50 dark:bg-[#1e293b] border-2 border-transparent focus:border-primary transition-all outline-none px-4 py-3 rounded-xl text-sm font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-slate-100" placeholder="Ej. Lino Natural Premium" type="text" required/>
                    </div>
                    <!-- SKU & Category Row -->
                    <div class="grid grid-cols-2 gap-4">
                      <div class="flex flex-col gap-1.5">
                        <label class="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">SKU</label>
                        <input class="w-full bg-slate-50 dark:bg-[#1e293b] border-2 border-transparent focus:border-primary transition-all outline-none px-4 py-3 rounded-xl text-sm font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-slate-100" placeholder="REF-0000" type="text" required/>
                      </div>
                      <div class="flex flex-col gap-1.5">
                        <label class="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Categoría</label>
                        <Select 
                          v-model="newItemCategory"
                          :options="opcionesModalCategoria"
                          placeholder="Seleccionar..."
                        />
                      </div>
                    </div>
                    <!-- Financials & Stock Row -->
                    <div class="grid grid-cols-2 gap-4">
                      <div class="flex flex-col gap-1.5">
                        <label class="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Precio Unitario</label>
                        <div class="relative">
                          <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                          <input class="w-full bg-slate-50 dark:bg-[#1e293b] border-2 border-transparent focus:border-primary transition-all outline-none pl-8 pr-4 py-3 rounded-xl text-sm font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-slate-100" placeholder="0.00" step="0.01" type="number" required/>
                        </div>
                      </div>
                      <div class="flex flex-col gap-1.5">
                        <label class="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Stock Inicial</label>
                        <input class="w-full bg-slate-50 dark:bg-[#1e293b] border-2 border-transparent focus:border-primary transition-all outline-none px-4 py-3 rounded-xl text-sm font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-slate-100" placeholder="0" type="number" required/>
                      </div>
                    </div>
                  </div>
                  <!-- Right Column: Image Upload -->
                  <div class="flex flex-col gap-1.5 h-full">
                    <label class="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Imagen del Producto</label>
                    <div class="flex-1 border-2 border-dashed border-slate-200 dark:border-[#1e293b] rounded-xl flex flex-col items-center justify-center p-6 bg-slate-50/50 dark:bg-[#1e293b]/50 hover:bg-slate-50 dark:hover:bg-[#1e293b] transition-colors cursor-pointer group min-h-[200px]">
                      <div class="w-16 h-16 rounded-full bg-slate-200 dark:bg-[#0f172a] flex items-center justify-center text-slate-400 dark:text-slate-500 group-hover:scale-110 shadow-inner dark:shadow-black/20 transition-transform duration-300">
                        <ImageIcon class="w-8 h-8" />
                      </div>
                      <p class="mt-4 text-sm font-bold text-slate-800 dark:text-slate-200">Subir Imagen</p>
                      <p class="text-[11px] text-slate-400 text-center mt-1">PNG, JPG hasta 5MB.<br/>Formato recomendado 1:1.</p>
                    </div>
                  </div>
                </div>
                <!-- Modal Actions -->
                <div class="flex items-center justify-end gap-4 pt-4 mt-6 border-t border-border-light dark:border-[#1e293b]">
                  <button @click="showAddModal = false" class="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-white/5 transition-all border border-slate-200 dark:border-[#1e293b]" type="button">
                    Cancelar
                  </button>
                  <button class="px-8 py-2.5 rounded-xl text-sm font-bold text-white bg-primary shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] transition-all" type="submit">
                    Guardar Artículo
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { PlusIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, EditIcon, MoreVerticalIcon, EyeIcon, TrashIcon, XIcon, ImageIcon } from 'lucide-vue-next'

const activeTab = ref('productos')
const showAddModal = ref(false)

const newItemCategory = ref('')
const opcionesModalCategoria = [
  { label: 'Textiles', value: 'textiles' },
  { label: 'Botones', value: 'botones' },
  { label: 'Hilos', value: 'hilos' },
  { label: 'Forros', value: 'forros' }
]

const filtroCategoria = ref('')
const filtroStock = ref('')
const filtroEstado = ref('')
const filtroUbicacion = ref('')

const opcionesCategoria = [
  { label: 'Uniformes', value: 'uniformes' },
  { label: 'Accesorios', value: 'accesorios' },
  { label: 'Materiales', value: 'materiales' },
  { label: 'Todos', value: 'todos' }
]

const opcionesStock = [
  { label: 'Alto a Bajo', value: 'alto_bajo' },
  { label: 'Bajo a Alto', value: 'bajo_alto' }
]

const opcionesEstado = [
  { label: 'En Stock', value: 'En Stock' },
  { label: 'Stock Bajo', value: 'Stock Bajo' },
  { label: 'Agotado', value: 'Agotado' },
  { label: 'Todos', value: 'Todos' }
]


const getStatusClasses = (status) => {
  switch (status) {
    case 'En Stock': return 'status-badge-green'
    case 'Stock Bajo': return 'status-badge-yellow'
    case 'Agotado': return 'status-badge-red'
    default: return ''
  }
}

const getStockColorClass = (status) => {
  switch (status) {
    case 'En Stock': return 'status-text-green'
    case 'Stock Bajo': return 'status-text-yellow'
    case 'Agotado': return 'status-text-red'
    default: return ''
  }
}

const allItems = [
  {
    type: 'productos',
    sku: 'UNI-JKT-001',
    name: 'Chaqueta Ejecutiva Oxford',
    category: 'Uniformes',
    stock: '450',
    unit: 'unidades',
    status: 'En Stock',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCVEJgK-gIkMYEOZQwxaOaT5nHAuCCvTltTV6O2R8VN-2tixaSV3fktmkf2g24q6SQXK1Ei5pycWZtrouGSvsJ-Pv7y2tiQkwd9IGnHaptAj_WtHLbsLwyIAILJGUPMTpPNWnd8ZF2UvCdXvJSQlFsJac1A2FRoJftVAGda5coyVzLbbszfma-6BXoJzZbqfuFita0C-ZC9p7P1oV8cawQfCsjebUu0B4YapJ6oDa-2yvdUZ10jqZT6gyY6qsRf129gmHM8lYtn__w',
  },
  {
    type: 'materia_prima',
    sku: 'FAB-CTN-BLU',
    name: 'Rollo Algodón Premium Azul',
    category: 'Materiales',
    stock: '12',
    unit: 'rollos',
    status: 'Stock Bajo',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCORwsJesBWdfb7AFbF86jVC8JQF26i2e43cquqAor_p5_Afxvm0i47Pj3ivvzbHspowN5K431j_aNO6620QWI1MW1t6FMrl7sDT5f2FMHlPmDB9RlQUIzEmvp4v1p3kdigep8eH9xtvsLJrY8ZILjc3B4EVED94k-brKvzdZ_yXNKATEKJ5gEZ8vzMDTpburZRlhJE5fghkVVULfmqo2Ppq9tv-kamPDc4zCIuXWkUyUcZEuanTbdZuut5wCaU0BZlo6RKF_5Ou2o',
  },
  {
    type: 'materia_prima',
    sku: 'FAB-PLY-BLK',
    name: 'Bovina Poliester Negro',
    category: 'Materiales',
    stock: '30',
    unit: 'rollos',
    status: 'En Stock',
    image: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  },
  {
    type: 'productos',
    sku: 'UNI-SHT-WHT',
    name: 'Camisa Formal Blanca',
    category: 'Uniformes',
    stock: '1,200',
    unit: 'unidades',
    status: 'En Stock',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCtoEOhm7LpuuPhae67hnFqamQQM--C-QLaU3D5lj3AyJz4Zezf9c8YWP163QCoD1BHxLLerpAbvi_igONH5_ySMq_CBglnTSCcX_dlRrgOJTCpOYzwqt15PB2QrTtDJhEtHQ2B0FtP3DnLvLouuc0yXoTuS3xSf3Rv9Q9r3nsSukA6ONQITYzKR53LGB3bwTrX4u7nxDv8OmrobZbEvekWhDG67uVkXUz5AR5v32NxHdM-nB6X3hNTSqSyjTtmysuftAgclC4XD3U',
  },
  {
    type: 'productos',
    sku: 'ACC-TIE-NAV',
    name: 'Corbata Seda Marino',
    category: 'Accesorios',
    stock: '5',
    unit: 'unidades',
    status: 'Agotado',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDfoJ3I16CzyDUlqtNXU1N7FhF6zCDWE8DZIO5nPSPAdowpaGAb3W1bVwkvafoMwoVsodAHsF26OkOgfaxypMexCld__YjJ3gtwhlZb1oH2ErOoBwz93bdjpCmYyeo2kK9KTkhfNIIQM1A66mnclH27l6V5kDMPWGPY_AH8y-JrkHQd2en6IEYtDw-bUyzQf6w5s1q5JrkUzJ2wGdQanO7X77CCcIDT-BbXFGyfWaQC3ikyZHHDxwPzRP9KkhEwdcF4ZsU6dLwLR7s',
  },
  {
    type: 'productos',
    sku: 'UNI-PNT-GRY',
    name: 'Pantalón Sastre Gris',
    category: 'Uniformes',
    stock: '215',
    unit: 'unidades',
    status: 'En Stock',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC68bb4hpi2njkF8H3e_ZYo7iKD710pNDAaiTyD2iwKDSOITCymd7lxHlkLhphO6LC7vDsxmx7cuPCV4pScMKSufQcoXkBw_9_kSDzOQmwNyrn484SjApoSFdsaNM6s5HD86zvpCHc_OTPdnIsH7DzZpC9WZN7wtBAGzftv1tlqZUKoj5L1PDyfoVvVzJgHA3ON_oBe7-ITvcYLLbUIA0pvDqDBhnuNFBQ8Bvx4RlluILv_KXm_88YEpHYC6EDC2dLQPugw0-exKCs',
  }
]

const currentItems = computed(() => {
  return allItems.filter(item => item.type === activeTab.value)
})

definePageMeta({
  layout: 'default'
})
</script>

<style>
.status-badge-green { background-color: rgba(63, 185, 80, 0.1); color: #15803d; border-color: rgba(63, 185, 80, 0.2); }
html.dark .status-badge-green { background-color: rgba(63, 185, 80, 0.1); color: #3fb950; border-color: rgba(63, 185, 80, 0.2); }

.status-badge-yellow { background-color: rgba(234, 179, 8, 0.1); color: #a16207; border-color: rgba(234, 179, 8, 0.2); }
html.dark .status-badge-yellow { background-color: rgba(234, 179, 8, 0.1); color: #eab308; border-color: rgba(234, 179, 8, 0.2); }

.status-badge-red { background-color: rgba(239, 68, 68, 0.1); color: #b91c1c; border-color: rgba(239, 68, 68, 0.2); }
html.dark .status-badge-red { background-color: rgba(239, 68, 68, 0.1); color: #ef4444; border-color: rgba(239, 68, 68, 0.2); }

.status-text-green { color: #15803d; }
html.dark .status-text-green { color: #3fb950; }

.status-text-yellow { color: #a16207; }
html.dark .status-text-yellow { color: #eab308; }

.status-text-red { color: #b91c1c; }
html.dark .status-text-red { color: #ef4444; }
</style>

<template>
  <div class="space-y-8 animate-in fade-in duration-700">
    <!-- Metric Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="stat in stats" :key="stat.label" 
        class="glass-panel p-6 rounded-xl flex flex-col gap-2 transition-all hover:scale-[1.02] duration-300"
      >
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-slate-500 tracking-wide">{{ stat.label }}</span>
          <component :is="stat.icon" class="text-primary w-5 h-5" />
        </div>
        <div class="flex items-baseline gap-2 mt-2">
          <span class="text-4xl font-bold text-slate-900 dark:text-white">
            {{ stat.value }}
          </span>
          <span class="text-sm font-semibold text-accent-green">{{ stat.trend }}</span>
        </div>
        <p class="text-xs text-slate-500 mt-1 font-medium">{{ stat.description }}</p>
      </div>
    </div>

    <div class="grid grid-cols-12 gap-6">
      <!-- Chart Section -->
      <div class="col-span-12 lg:col-span-8 glass-panel p-6 rounded-xl">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h3 class="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Producción Semanal</h3>
            <p class="text-sm font-medium text-slate-500">Unidades manufacturadas por día</p>
          </div>
          <div class="flex gap-2">
            <button class="px-3 py-1.5 text-sm font-semibold rounded-lg bg-primary text-white border border-primary shadow-lg shadow-primary/20">Semana</button>
            <button class="px-3 py-1.5 text-sm font-semibold rounded-lg bg-panel-light dark:bg-white/5 border border-border-light dark:border-border-dark text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all">Mes</button>
          </div>
        </div>
        <div class="h-64 w-full relative">
          <svg class="w-full h-full overflow-visible" viewBox="0 0 800 200">
            <defs>
              <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.25"></stop>
                <stop offset="100%" stop-color="#3b82f6" stop-opacity="0"></stop>
              </linearGradient>
            </defs>
            <!-- Grid Lines -->
            <line v-for="y in [0, 50, 100, 150, 200]" :key="y" stroke="rgba(148,163,184,0.12)" stroke-width="1" x1="0" x2="800" :y1="y" :y2="y"></line>
            <!-- Line Path -->
            <path d="M0,150 C100,160 150,80 200,100 C250,120 300,40 400,60 C500,80 600,120 700,90 L800,100" fill="none" stroke="#3b82f6" stroke-width="3"></path>
            <path d="M0,150 C100,160 150,80 200,100 C250,120 300,40 400,60 C500,80 600,120 700,90 L800,100 L800,200 L0,200 Z" fill="url(#gradient)"></path>
            <!-- Data Points -->
            <circle cx="200" cy="100" fill="#3b82f6" r="5" stroke="white" stroke-width="2"></circle>
            <circle cx="400" cy="60" fill="#3b82f6" r="5" stroke="white" stroke-width="2"></circle>
            <circle cx="700" cy="90" fill="#3b82f6" r="5" stroke="white" stroke-width="2"></circle>
          </svg>
          <div class="flex justify-between mt-4 px-2 text-xs font-semibold text-slate-400 tracking-wide">
            <span>Lun</span><span>Mar</span><span>Mié</span><span>Jue</span><span>Vie</span><span>Sáb</span><span>Dom</span>
          </div>
        </div>
      </div>

      <!-- Inventory Alerts -->
      <div class="col-span-12 lg:col-span-4 glass-panel p-6 rounded-xl flex flex-col h-full">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
            <AlertTriangleIcon class="text-accent-red w-5 h-5" />
            Alertas de inventario
          </h3>
          <NuxtLink to="/inventory" class="text-xs font-semibold text-primary hover:underline">Ver todo</NuxtLink>
        </div>
        <div class="space-y-3">
          <div v-for="alert in inventoryAlerts" :key="alert.name" 
            class="p-3 rounded-xl flex items-center justify-between group transition-all"
            :class="alert.wrapperClass"
          >
            <div class="min-w-0">
              <p class="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{{ alert.name }}</p>
              <p class="text-[11px] font-semibold text-slate-500">Stock actual: {{ alert.stock }}</p>
            </div>
            <span :class="['px-2.5 py-1 text-xs font-bold rounded-lg border truncate ml-2', alert.badgeClass]">
              {{ alert.level }}
            </span>
          </div>
        </div>
        <!-- <button class="mt-6 w-full py-3.5 bg-primary text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 tracking-wide">
          <ShoppingCartIcon class="w-4 h-4" />
          Generar orden de compra
        </button> -->
      </div>
    </div>

    <!-- Recent Orders Table -->
    <div class="glass-panel rounded-xl overflow-hidden">
      <div class="p-6 border-b border-border-light dark:border-border-dark flex flex-col sm:flex-row items-center justify-between gap-4">
        <h3 class="text-base font-bold text-slate-900 dark:text-white tracking-tight">Órdenes de producción recientes</h3>
        <button class="text-xs font-semibold text-slate-500 hover:text-primary flex items-center gap-1 transition-colors">
          Ver historial completo
          <ArrowRightIcon class="w-4 h-4" />
        </button>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead class="bg-panel-light dark:bg-white/[0.02] border-b border-border-light dark:border-border-dark">
            <tr>
              <th class="px-6 py-4 text-xs font-semibold text-slate-500 tracking-wide">ID Orden</th>
              <th class="px-6 py-4 text-xs font-semibold text-slate-500 tracking-wide">Cliente</th>
              <th class="px-6 py-4 text-xs font-semibold text-slate-500 tracking-wide">Producto</th>
              <th class="px-6 py-4 text-xs font-semibold text-slate-500 tracking-wide">Cantidad</th>
              <th class="px-6 py-4 text-xs font-semibold text-slate-500 tracking-wide">Estado</th>
              <th class="px-6 py-4 text-xs font-semibold text-slate-500 tracking-wide text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border-light dark:divide-border-dark">
            <tr v-for="order in recentOrders" :key="order.id" class="hover:bg-panel-light dark:hover:bg-white/[0.01] transition-colors group">
              <td class="px-6 py-5 text-sm font-bold text-slate-800 dark:text-slate-100">{{ order.id }}</td>
              <td class="px-6 py-5 text-sm text-slate-600 dark:text-slate-400 font-semibold">{{ order.customer }}</td>
              <td class="px-6 py-5 text-sm text-slate-500 font-medium">{{ order.product }}</td>
              <td class="px-6 py-5 text-sm text-slate-500 font-medium">{{ order.qty }}</td>
              <td class="px-6 py-5">
                <span :class="`flex items-center gap-1.5 text-xs font-bold ${order.color}`">
                  <span :class="`w-1.5 h-1.5 rounded-full ${order.bgColor} ${order.status === 'En Corte' ? 'animate-pulse' : ''}`"></span>
                  {{ order.status }}
                </span>
              </td>
              <td class="px-6 py-5 text-right">
                <button class="text-slate-400 hover:text-primary transition-colors">
                  <MoreHorizontalIcon class="w-5 h-5 mx-auto" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { 
  RocketIcon, 
  CheckCircleIcon, 
  CreditCardIcon, 
  AlertTriangleIcon, 
  ShoppingCartIcon,
  ArrowRightIcon,
  MoreHorizontalIcon
} from 'lucide-vue-next'

const stats = [
  { 
    label: 'Órdenes Activas', 
    value: '42', 
    trend: '+12%', 
    description: 'En proceso de costura y empaque',
    icon: RocketIcon 
  },
  { 
    label: 'Uniformes Vendidos', 
    value: '1,280', 
    trend: '+5%', 
    description: 'Total de piezas entregadas este mes',
    icon: CheckCircleIcon 
  },
  { 
    label: 'Ingresos Mensuales', 
    value: '$45,200', 
    trend: '+18.2%', 
    description: 'Ingresos brutos proyectados',
    icon: CreditCardIcon 
  }
]

const inventoryAlerts = [
  { 
    name: 'Playera Polo CBTIS Talla M', 
    stock: '12 unidades', 
    level: 'Bajo', 
    wrapperClass: 'bg-panel-light dark:bg-white/[0.02] border border-border-light dark:border-border-dark hover:border-amber-300',
    badgeClass: 'bg-amber-500/10 text-amber-500 border-amber-500/20' 
  },
  { 
    name: 'Rollo de Tela Azul Marino', 
    stock: '2 rollos', 
    level: 'Crítico', 
    wrapperClass: 'bg-red-500/10 border border-red-500/20 hover:bg-red-500/20',
    badgeClass: 'bg-accent-red text-white border-accent-red' 
  },
  { 
    name: 'Hilo Poliéster Negro Gral.', 
    stock: '5 conos', 
    level: 'Bajo',
    wrapperClass: 'bg-panel-light dark:bg-white/[0.02] border border-border-light dark:border-border-dark hover:border-amber-300',
    badgeClass: 'bg-amber-500/10 text-amber-500 border-amber-500/20' 
  },
  { 
    name: 'Botón Institucional 15mm', 
    stock: '45 unidades', 
    level: 'Bajo',
    wrapperClass: 'bg-panel-light dark:bg-white/[0.02] border border-border-light dark:border-border-dark hover:border-amber-300',
    badgeClass: 'bg-amber-500/10 text-amber-500 border-amber-500/20' 
  },
]

const recentOrders = [
  { id: '#OP-8942', customer: 'Colegio San Ángel', product: 'Pantalón Gris Escolar', qty: '250 pzas', status: 'En Corte', color: 'text-primary', bgColor: 'bg-primary' },
  { id: '#OP-8941', customer: 'Hospital General Oax.', product: 'Batas Médicas Blancas', qty: '120 pzas', status: 'Completado', color: 'text-accent-green', bgColor: 'bg-accent-green' },
  { id: '#OP-8940', customer: 'Restaurante El Patio', product: 'Delantales Bordados', qty: '45 pzas', status: 'En Espera', color: 'text-orange-400', bgColor: 'bg-slate-400' },
]
</script>

<style>
/* Light mode */
.glass-panel {
  background: #ffffff;
  border: 1px solid #d0d7de;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.04);
}

/* Dark mode */
.dark .glass-panel {
  background: rgba(30, 41, 59, 0.75); /* Slate 800 with 75% opacity */
  border: 1px solid #334155; /* Slate 700 */
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.1);
}

/* Chart gradient: más azul en light mode */
#gradient stop:first-child {
  stop-opacity: 0.55;
}
#gradient stop:last-child {
  stop-opacity: 0.08;
}

/* Dark mode: más sutil */
.dark #gradient stop:first-child {
  stop-opacity: 0.22;
}
.dark #gradient stop:last-child {
  stop-opacity: 0;
}
</style>

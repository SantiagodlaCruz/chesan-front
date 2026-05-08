<template>
  <div class="space-y-6 animate-in fade-in duration-500">
    <!-- Metric Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="stat in stats" :key="stat.label" 
        class="flex flex-col gap-3 rounded-2xl p-6 bg-slate-400/5 dark:bg-slate-400/5 border border-slate-400/10 dark:border-white/5 transition-all hover:bg-slate-400/10"
      >
        <div class="flex items-center justify-between">
          <div :class="`p-2.5 rounded-xl ${stat.iconBg}`">
            <component :is="stat.icon" :class="`w-5 h-5 ${stat.iconColor}`" />
          </div>
          <div v-if="stat.trend !== '-'" class="text-[9px] font-black uppercase rounded-md px-2 py-1 tracking-wider bg-emerald-500/10 text-emerald-500">
            {{ stat.trend }}
          </div>
        </div>
        
        <div class="space-y-1">
          <h3 class="text-[11px] font-black uppercase tracking-widest text-slate-500">{{ stat.label }}</h3>
          <div class="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tighter">
            {{ stat.value }}
          </div>
          <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest opacity-60">{{ stat.description }}</p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-12 gap-6">
      <!-- Chart Section -->
      <div class="col-span-12 lg:col-span-8 bg-slate-400/5 dark:bg-slate-400/5 border border-slate-400/10 dark:border-white/5 p-6 rounded-2xl relative overflow-hidden">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
          <div class="flex items-center gap-4">
            <h3 
              class="text-[11px] font-black uppercase tracking-widest cursor-pointer transition-colors"
              :class="chartType === 'ingresos' ? 'text-primary' : 'text-slate-400 hover:text-slate-500'"
              @click="chartType = 'ingresos'"
            >
              Flujo de Ingresos
            </h3>
            <span class="text-slate-200 dark:text-slate-800">|</span>
            <h3 
              class="text-[11px] font-black uppercase tracking-widest cursor-pointer transition-colors"
              :class="chartType === 'pedidos' ? 'text-primary' : 'text-slate-400 hover:text-slate-500'"
              @click="chartType = 'pedidos'"
            >
              Pedidos en curso
            </h3>
          </div>
          
          <div class="flex items-center gap-1 p-1 bg-slate-200/50 dark:bg-white/5 rounded-xl">
            <button 
              @click="chartPeriod = 'semana'"
              :class="chartPeriod === 'semana' ? 'bg-white dark:bg-slate-800 text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'"
              class="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all"
            >
              Semana
            </button>
            <button 
              @click="chartPeriod = 'mes'"
              :class="chartPeriod === 'mes' ? 'bg-white dark:bg-slate-800 text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'"
              class="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all"
            >
              Mes
            </button>
          </div>
        </div>

        <div class="h-64 w-full relative">
          <svg class="w-full h-full overflow-visible" viewBox="0 0 800 200">
            <defs>
              <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.15"></stop>
                <stop offset="100%" stop-color="#3b82f6" stop-opacity="0"></stop>
              </linearGradient>
            </defs>
            <line v-for="y in [0, 50, 100, 150, 200]" :key="y" stroke="currentColor" stroke-width="1" x1="0" x2="800" :y1="y" :y2="y" class="text-slate-400/10 dark:text-white/5"></line>
            
            <path :d="svgAreaPath" fill="url(#chartGradient)" class="transition-all duration-700"></path>
            <path :d="svgPath" fill="none" stroke="#3b82f6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="transition-all duration-700"></path>
            
            <circle v-for="(point, index) in chartPoints" :key="index" :cx="point.x" :cy="point.y" fill="#3b82f6" r="3.5" stroke="white" stroke-width="2"></circle>
          </svg>
        </div>

        <!-- Labels move outside fixed height container -->
        <div class="flex justify-between mt-3 -mx-2">
          <div v-for="(label, idx) in chartData.labels" :key="idx" class="flex-1 text-center">
            <span class="text-[10px] font-bold text-primary dark:text-blue-400 uppercase tracking-widest block">
              {{ label }}
            </span>
          </div>
        </div>
      </div>

      <!-- Inventory Alerts -->
      <div class="col-span-12 lg:col-span-4 rounded-2xl p-6 bg-slate-400/5 dark:bg-slate-400/5 border border-slate-400/10 dark:border-white/5 flex flex-col h-full">
        <div class="flex items-center justify-between mb-8">
          <div class="flex flex-col gap-1">
             <h3 class="text-[11px] font-black uppercase tracking-widest text-slate-500">Alertas de Stock</h3>
             <div class="flex items-center gap-3 mt-2">
                <button 
                  @click="activeInventoryTab = 'products'"
                  :class="activeInventoryTab === 'products' ? 'text-primary' : 'text-slate-400 opacity-50'"
                  class="text-[9px] font-black uppercase tracking-widest transition-all"
                >
                  Productos
                </button>
                <span class="w-1 h-1 rounded-full bg-slate-300"></span>
                <button 
                  @click="activeInventoryTab = 'materials'"
                  :class="activeInventoryTab === 'materials' ? 'text-primary' : 'text-slate-400 opacity-50'"
                  class="text-[9px] font-black uppercase tracking-widest transition-all"
                >
                  Materia Prima
                </button>
             </div>
          </div>
          <NuxtLink :to="activeInventoryTab === 'products' ? '/inventory/products' : '/inventory/raw-materials'" class="text-[9px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-md">Ver Todo</NuxtLink>
        </div>
        
        <div class="space-y-3 flex-1 overflow-y-auto max-h-[300px] custom-scrollbar pr-1">
          <div v-for="alert in currentAlerts" :key="alert.name" 
            class="p-3 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-white/5 rounded-xl flex items-center justify-between group transition-all hover:border-primary/30"
            :class="alert.wrapperClass"
          >
            <div class="min-w-0">
              <p class="text-[12px] font-bold text-slate-800 dark:text-slate-100 truncate mb-1">{{ alert.name }}</p>
              <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">{{ alert.stock }}</p>
            </div>
            <div :class="['text-[9px] font-black uppercase rounded-md px-2 py-0.5 tracking-wider', alert.badgeClass]">
              {{ alert.level }}
            </div>
          </div>
          <div v-if="!currentAlerts.length" class="h-40 flex flex-col items-center justify-center text-center opacity-30">
            <CheckCircleIcon class="w-8 h-8 text-emerald-500 mb-2" />
            <p class="text-[10px] font-black uppercase tracking-widest">Stock saludable</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Sales Table -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Sales Column -->
      <div class="rounded-2xl p-2 bg-slate-400/5 dark:bg-slate-400/5 border border-slate-400/10 dark:border-white/5 overflow-hidden">
        <div class="p-4 flex items-center justify-between gap-4 border-b border-slate-200/50 dark:border-white/5 mb-2">
          <div class="flex items-center gap-2 px-2">
            <span class="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            <h3 class="text-[11px] font-black uppercase tracking-widest text-slate-500">Ventas Recientes</h3>
          </div>
          <NuxtLink to="/point-of-sale" class="text-[9px] font-black uppercase tracking-widest text-primary hover:underline">Ir a Caja</NuxtLink>
        </div>
        
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <tbody class="divide-y divide-slate-200/50 dark:divide-white/5">
              <tr v-for="ticket in recentTickets" :key="ticket.id" class="hover:bg-slate-400/5 transition-colors group">
                <td class="px-4 py-4">
                  <p class="text-[10px] font-bold text-primary tracking-tighter">{{ ticket.id }}</p>
                  <p class="text-[9px] text-slate-400 font-black uppercase tracking-widest">{{ ticket.date }}</p>
                </td>
                <td class="px-4 py-4 text-xs font-bold text-slate-700 dark:text-slate-200">{{ ticket.customer }}</td>
                <td class="px-4 py-4 font-black text-slate-800 dark:text-white text-xs">{{ ticket.total }}</td>
                <td class="px-4 py-4 text-right">
                  <div :class="`inline-flex text-[8px] font-black uppercase rounded-md px-2 py-0.5 tracking-wider ${ticket.status === 'Completed' || ticket.status === 'Pagado' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-200 text-slate-500'}`">
                    {{ ticket.status }}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Active Orders Column -->
      <div class="rounded-2xl p-2 bg-slate-400/5 dark:bg-slate-400/5 border border-slate-400/10 dark:border-white/5 overflow-hidden">
        <div class="p-4 flex items-center justify-between gap-4 border-b border-slate-200/50 dark:border-white/5 mb-2">
          <div class="flex items-center gap-2 px-2">
            <span class="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
            <h3 class="text-[11px] font-black uppercase tracking-widest text-slate-500">Pedidos Activos</h3>
          </div>
          <NuxtLink to="/production" class="text-[9px] font-black uppercase tracking-widest text-primary hover:underline">Ver Tablero</NuxtLink>
        </div>
        
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <tbody class="divide-y divide-slate-200/50 dark:divide-white/5">
              <tr v-for="order in activeProductionOrders" :key="order.id" class="hover:bg-slate-400/5 transition-colors group">
                <td class="px-4 py-4">
                  <p class="text-[10px] font-bold text-orange-500 tracking-tighter">{{ order.id }}</p>
                  <p class="text-[9px] text-slate-400 font-black uppercase tracking-widest">{{ order.date }}</p>
                </td>
                <td class="px-4 py-4 text-xs font-bold text-slate-700 dark:text-slate-200">{{ order.customer }}</td>
                <td class="px-4 py-4 font-black text-slate-800 dark:text-white text-xs">{{ order.total }}</td>
                <td class="px-4 py-4 text-right">
                  <div class="inline-flex text-[8px] font-black uppercase rounded-md px-2 py-0.5 tracking-wider bg-orange-500/10 text-orange-500">
                    {{ order.status }}
                  </div>
                </td>
              </tr>
              <tr v-if="!activeProductionOrders.length" class="opacity-30">
                <td colspan="4" class="px-4 py-10 text-center text-[10px] font-black uppercase tracking-widest">No hay pedidos en curso</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { 
  RocketIcon, 
  CheckCircleIcon, 
  CreditCardIcon, 
  AlertTriangleIcon, 
  ShoppingCartIcon,
  ArrowRightIcon,
  MoreHorizontalIcon,
  TrendingUpIcon
} from 'lucide-vue-next'

const api = useApi()

const iconMap = {
  RocketIcon,
  CheckCircleIcon,
  CreditCardIcon
}

const stats = ref([
  { 
    label: 'Órdenes Activas', 
    value: '0', 
    trend: '-', 
    description: 'En proceso de costura (Próximo)', 
    icon: RocketIcon,
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
    bgDecoration: 'bg-primary'
  },
  { 
    label: 'Uniformes Vendidos', 
    value: '0', 
    trend: 'N/A', 
    description: 'Total acumulado del mes', 
    icon: CheckCircleIcon,
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-500',
    bgDecoration: 'bg-emerald-500'
  },
  { 
    label: 'Ingresos Mensuales', 
    value: '$0.00', 
    trend: 'N/A', 
    description: 'Ventas facturadas en caja', 
    icon: CreditCardIcon,
    iconBg: 'bg-indigo-500/10',
    iconColor: 'text-indigo-500',
    bgDecoration: 'bg-indigo-500'
  }
])

const inventoryAlerts = ref({ products: [], materials: [] })
const activeInventoryTab = ref('products')
const currentAlerts = computed(() => inventoryAlerts.value[activeInventoryTab.value] || [])

const recentTickets = ref([])
const activeProductionOrders = ref([])
const chartType = ref('ingresos')
const chartPeriod = ref('semana')
const chartData = ref({ series: [0, 0, 0, 0, 0, 0, 0], labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'] })

const chartPoints = computed(() => {
    const series = chartData.value.series
    const max = Math.max(...series, 10) 
    const w = 800
    const h = 180 
    const step = w / Math.max(series.length - 1, 1)
    
    return series.map((val, i) => {
        return {
            x: i * step,
            y: h - (val / max * h) + 10 
        }
    })
})

const svgPath = computed(() => {
    if (!chartPoints.value.length) return ''
    const pts = chartPoints.value
    let d = `M${pts[0].x},${pts[0].y}`
    for(let i=1; i < pts.length; i++){
        d += ` L${pts[i].x},${pts[i].y}`
    }
    return d
})

const svgAreaPath = computed(() => {
    if (!chartPoints.value.length) return ''
    const pts = chartPoints.value
    let d = svgPath.value
    d += ` L${pts[pts.length-1].x},200 L0,200 Z`
    return d
})

const fetchDashboardData = async () => {
    try {
        const response = await api.get('/api/dashboard', {
            params: {
                type: chartType.value,
                period: chartPeriod.value
            }
        })
        
        if (response.data) {
            const newStats = response.data.stats.map((s, idx) => {
                const base = stats.value[idx] || {}
                return {
                    ...s,
                    icon: iconMap[s.icon] || RocketIcon,
                    iconBg: base.iconBg,
                    iconColor: base.iconColor,
                    bgDecoration: base.bgDecoration
                }
            })
            stats.value = newStats
            inventoryAlerts.value = response.data.inventoryAlerts
            recentTickets.value = response.data.recentTickets
            activeProductionOrders.value = response.data.recentOrders
            if (response.data.chartData) {
                chartData.value = response.data.chartData
            }
        }
    } catch (error) {
        console.error('Error fetching dashboard data:', error)
    }
}

watch([chartType, chartPeriod], fetchDashboardData)

onMounted(fetchDashboardData)
</script>

<style>
@keyframes bounce-slow {
  0%, 100% { transform: translateY(-5%); animation-timing-function: cubic-bezier(0.8, 0, 1, 1); }
  50% { transform: translateY(0); animation-timing-function: cubic-bezier(0, 0, 0.2, 1); }
}
.animate-bounce-slow {
  animation: bounce-slow 3s infinite;
}

.glass-panel {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
}

.dark .glass-panel {
  background: rgba(15, 23, 42, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.2);
}

#chartGradient stop:first-child {
  stop-opacity: 0.6;
}
#chartGradient stop:last-child {
  stop-opacity: 0.02;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.2);
  border-radius: 10px;
}
</style>

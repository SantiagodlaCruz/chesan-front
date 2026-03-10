<template>
  <div class="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-100 font-display transition-colors duration-300">
    <!-- Sidebar -->
    <aside 
      class="bg-card-light dark:bg-card-dark border-r border-border-light dark:border-border-dark flex flex-col shrink-0 transition-all duration-500 relative z-40"
      :class="[isCollapsed ? 'w-20' : 'w-64']"
    >
      <!-- Logo Section -->
      <div class="p-6 flex items-center justify-between overflow-hidden">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
            <FactoryIcon class="text-white w-5 h-5" />
          </div>
          <h1 v-if="!isCollapsed" class="text-xl font-bold tracking-tight text-slate-900 dark:text-white transition-opacity duration-300">
            Chesan
          </h1>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-3 space-y-1 mt-4 overflow-y-auto overflow-x-hidden custom-scrollbar">
        <NuxtLink 
          v-for="item in navItems" 
          :key="item.path"
          :to="item.path"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group relative"
          :class="[
            $route.path === item.path 
              ? 'bg-primary/10 text-primary border-r-2 border-primary font-semibold' 
              : 'text-slate-500 dark:text-slate-400 hover:bg-panel-light dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-100'
          ]"
        >
          <component :is="item.icon" class="w-5 h-5 shrink-0" />
          <span 
            v-if="!isCollapsed" 
            class="text-sm font-medium whitespace-nowrap transition-opacity duration-300"
          >
            {{ item.label }}
          </span>

          <!-- Tooltip for collapsed mode -->
          <div 
            v-if="isCollapsed" 
            class="absolute left-full ml-4 px-2 py-1.5 bg-slate-900 text-white text-xs rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap"
          >
            {{ item.label }}
          </div>
        </NuxtLink>
      </nav>

      <!-- Bottom Actions -->
      <div class="p-4 border-t border-border-light dark:border-border-dark space-y-2">
        <button 
          @click="isCollapsed = !isCollapsed"
          class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-panel-light dark:hover:bg-white/5 transition-all group"
        >
          <ChevronLeftIcon class="w-5 h-5 transition-transform duration-500" :class="{ 'rotate-180': isCollapsed }" />
          <span v-if="!isCollapsed" class="text-sm font-medium">Colapsar</span>
        </button>

        <button 
          @click="handleLogout" 
          class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all group"
        >
          <LogOutIcon class="w-5 h-5" />
          <span v-if="!isCollapsed" class="text-sm font-medium">Cerrar Sesión</span>
        </button>

        <!-- Profile Widget -->
        <div 
          v-if="!isCollapsed"
          class="flex items-center gap-3 px-3 py-3 mt-4 bg-panel-light dark:bg-white/5 rounded-xl border border-border-light dark:border-border-dark"
        >
          <div class="w-8 h-8 rounded-full bg-slate-200 dark:bg-charcoal overflow-hidden shrink-0 border border-border-light dark:border-border-dark">
            <UserIcon class="w-full h-full p-1 text-slate-400" />
          </div>
          <div class="min-w-0">
            <p class="text-xs font-semibold truncate text-slate-900 dark:text-slate-100">{{ user?.name || 'Usuario' }}</p>
            <p class="text-[10px] text-slate-500 truncate">Admin Principal</p>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <!-- Navbar / Header -->
      <header class="h-16 border-b border-border-light dark:border-border-dark flex items-center justify-between px-8 shrink-0 bg-card-light/80 dark:bg-background-dark/80 backdrop-blur-md sticky top-0 z-30 transition-colors">
        <div class="flex items-center gap-4">
          <h2 class="text-sm font-medium text-slate-400">Dashboard</h2>
          <span class="text-slate-300 dark:text-slate-700">/</span>
          <h2 class="text-sm font-semibold text-slate-800 dark:text-slate-100">Resumen General</h2>
        </div>

        <div class="flex items-center gap-4">
          <div class="relative group hidden sm:block">
            <SearchIcon class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Buscar..."
              class="bg-panel-light dark:bg-white/5 border border-border-light dark:border-border-dark rounded-lg pl-10 pr-4 py-1.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 w-64 transition-all text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
            />
          </div>

          <ThemeToggle />

          <button class="w-9 h-9 flex items-center justify-center rounded-lg border border-border-light dark:border-border-dark hover:bg-panel-light dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 relative transition-all">
            <BellIcon class="w-5 h-5" />
            <span class="absolute top-2 right-2 w-2 h-2 bg-accent-red rounded-full border-2 border-card-light dark:border-background-dark"></span>
          </button>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar relative">
        <div class="max-w-7xl mx-auto space-y-8">
          <slot />
        </div>
        
        <!-- Background decorative blur -->
        <div class="fixed bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { 
  FactoryIcon, 
  LayoutDashboardIcon, 
  ShoppingCartIcon, 
  SettingsIcon, 
  LogOutIcon,
  ChevronLeftIcon,
  SearchIcon,
  BellIcon,
  UserIcon,
  BoxIcon,
  LineChartIcon
} from 'lucide-vue-next'

const { user, logout } = useAuth()
const isCollapsed = useState('sidebar-collapsed', () => false)

const navItems = [
  { label: 'Inicio', path: '/', icon: LayoutDashboardIcon },
  { label: 'Pedidos', path: '/orders', icon: ShoppingCartIcon },
  { label: 'Producción', path: '/production', icon: FactoryIcon },
  { label: 'Inventario', path: '/inventory', icon: BoxIcon },
  { label: 'Reportes', path: '/reports', icon: LineChartIcon },
  { label: 'Ajustes', path: '/settings', icon: SettingsIcon },
]

const handleLogout = () => {
  logout()
}
</script>

<style>
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.2);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(148, 163, 184, 0.4);
}

.font-display {
  font-family: 'Inter', sans-serif;
}
</style>

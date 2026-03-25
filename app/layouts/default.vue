<template>
  <div class="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-100 font-display transition-colors duration-300">
    <!-- Sidebar -->
    <aside 
      class="bg-card-light dark:bg-card-dark border-r border-border-light dark:border-border-dark flex flex-col shrink-0 transition-all duration-500 relative z-40"
      :class="[isCollapsed ? 'w-20' : 'w-64']"
    >
      <!-- Collapse Button Floating -->
      <button 
        @click="isCollapsed = !isCollapsed"
        class="absolute -right-3.5 top-8 w-7 h-7 bg-white dark:bg-card-dark border border-border-light dark:border-border-dark rounded-full flex items-center justify-center text-slate-500 hover:text-primary transition-colors shadow-sm z-50 focus:outline-none"
      >
        <ChevronLeftIcon class="w-4 h-4 transition-transform duration-500" :class="{ 'rotate-180': isCollapsed }" />
      </button>

      <!-- Logo Section -->
      <div class="p-6 flex items-center justify-between overflow-hidden">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
            <ShirtIcon class="text-white w-5 h-5" stroke-width="2.5" />
          </div>
          <h1 
            class="text-2xl font-black tracking-tighter text-slate-900 dark:text-white transition-all duration-500 overflow-hidden whitespace-nowrap"
            :class="isCollapsed ? 'max-w-0 opacity-0' : 'max-w-[100px] opacity-100'"
          >
            CheSan
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
            class="text-sm font-medium whitespace-nowrap transition-all duration-500 overflow-hidden"
            :class="isCollapsed ? 'max-w-0 opacity-0' : 'max-w-[150px] opacity-100'"
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
      <div class="p-4 border-t border-border-light dark:border-border-dark space-y-2 flex flex-col">
        <ThemeToggle :is-collapsed="isCollapsed" />
        <button 
          @click="handleLogout" 
          class="flex items-center gap-3 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all group overflow-hidden"
          :class="isCollapsed ? 'justify-center w-12 h-12 mx-auto' : 'w-full px-3 py-2.5'"
          title="Cerrar Sesión"
        >
          <LogOutIcon class="w-5 h-5 shrink-0" />
          <span 
            class="text-sm font-medium whitespace-nowrap transition-all duration-500 overflow-hidden"
            :class="isCollapsed ? 'max-w-0 opacity-0 ml-0' : 'max-w-[120px] opacity-100 ml-0'"
          >
            Cerrar Sesión
          </span>
        </button>

        <!-- Profile Widget -->
        <div class="relative mt-4">
          <!-- Popover Menu -->
          <Transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="opacity-0 translate-y-2 scale-95"
            enter-to-class="opacity-100 translate-y-0 scale-100"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100 translate-y-0 scale-100"
            leave-to-class="opacity-0 translate-y-2 scale-95"
          >
            <div 
              v-if="showProfileMenu" 
              class="absolute bottom-full left-0 mb-3 w-48 bg-white dark:bg-[#0f172a] rounded-xl shadow-2xl border border-border-light dark:border-border-dark p-1.5 z-50 origin-bottom-left"
            >
              <button 
                @click="showProfileMenu = false"
                class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1e293b] hover:text-slate-900 dark:hover:text-white transition-colors text-left"
              >
                <UserIcon class="w-4 h-4 text-slate-400 dark:text-slate-500" />
                Mi Perfil
              </button>
              <button 
                @click="showProfileMenu = false; showPasswordModal = true" 
                class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1e293b] hover:text-slate-900 dark:hover:text-white transition-colors text-left"
              >
                <ShieldIcon class="w-4 h-4 text-slate-400 dark:text-slate-500" />
                Cambiar Contraseña
              </button>
            </div>
          </Transition>

          <!-- Backstop to close menu when clicking outside -->
          <div v-if="showProfileMenu" @click="showProfileMenu = false" class="fixed inset-0 z-40"></div>

          <button 
            @click="showProfileMenu = !showProfileMenu"
            class="w-full flex items-center text-left gap-3 rounded-xl transition-all group focus:outline-none relative z-50 hover:bg-slate-100 dark:hover:bg-slate-800 bg-slate-50 dark:bg-[#1e293b] border border-border-light dark:border-[#334155] shadow-sm"
            :class="isCollapsed ? 'justify-center py-2' : 'px-3 py-3'"
            title="Opciones de Cuenta"
          >
            <div class="w-8 h-8 rounded-full bg-slate-200 dark:bg-background-dark overflow-hidden shrink-0 border border-border-light dark:border-border-dark shadow-inner group-hover:ring-2 group-hover:ring-primary/30 transition-all">
              <UserIcon class="w-full h-full p-1.5 text-slate-500 dark:text-slate-400 group-hover:text-primary transition-colors" />
            </div>
            <div 
              class="min-w-0 transition-all duration-500 overflow-hidden origin-left"
              :class="isCollapsed ? 'max-w-0 opacity-0' : 'max-w-[150px] opacity-100'"
            >
              <p class="text-xs font-semibold truncate text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors">{{ user?.name || 'Usuario' }}</p>
              <!-- <p class="text-[10px] text-slate-500 truncate dark:text-slate-400">Opciones de Cuenta</p> -->
            </div>
          </button>
        </div>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <!-- Page Content -->
      <main class="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar relative">
        <div class="max-w-7xl mx-auto space-y-8">
          <slot />
        </div>
        
        <!-- Background decorative blur -->
        <div class="fixed bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
      </main>
    </div>

    <!-- Password Change Modal -->
    <Teleport to="body">
      <ChangePasswordModal v-model="showPasswordModal" />
    </Teleport>
  </div>
</template>

<script setup>
import { 
  FactoryIcon, 
  LayoutDashboardIcon, 
  ShoppingCartIcon, 
  LogOutIcon,
  ChevronLeftIcon,
  SearchIcon,
  BellIcon,
  UserIcon,
  BoxIcon,
  ShirtIcon,
  ShieldIcon
} from 'lucide-vue-next'
import ChangePasswordModal from '~/components/ChangePasswordModal.vue'

const auth = useAuth()
const user = computed(() => auth.user)

const isCollapsed = useState('sidebar-collapsed', () => false)

const navItems = [
  { label: 'Inicio', path: '/', icon: LayoutDashboardIcon },
  { label: 'Inventario', path: '/inventory', icon: BoxIcon },
  { label: 'Producción', path: '/production', icon: FactoryIcon },
  { label: 'Punto de venta', path: '/pos', icon: ShoppingCartIcon },
]

const showProfileMenu = ref(false)
const showPasswordModal = ref(false)
const handleLogout = () => {
  auth.logout()
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

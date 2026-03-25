<template>
  <button
    @click="toggleColorMode"
    class="flex items-center gap-3 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-primary dark:hover:text-primary transition-all group overflow-hidden"
    :class="[
      isCollapsed ? 'justify-center w-12 h-12 mx-auto' : 'w-full px-3 py-2.5'
    ]"
    :title="`Cambiar a modo ${colorMode.value === 'dark' ? 'claro' : 'oscuro'}`"
  >
    <div class="relative w-5 h-5 flex items-center justify-center overflow-hidden shrink-0">
      <Transition
        enter-active-class="transition duration-500 ease-out"
        leave-active-class="transition duration-500 ease-in"
        enter-from-class="transform translate-y-8 rotate-45 opacity-0"
        leave-to-class="transform -translate-y-8 -rotate-45 opacity-0"
      >
        <MoonIcon v-if="colorMode.value === 'light'" class="w-5 h-5 absolute" />
        <SunIcon v-else class="w-5 h-5 absolute text-amber-400" />
      </Transition>
    </div>

    <span 
      class="text-sm font-medium whitespace-nowrap transition-all duration-500 overflow-hidden text-left"
      :class="isCollapsed ? 'max-w-0 opacity-0 ml-0' : 'max-w-[120px] opacity-100 ml-0'"
    >
      {{ colorMode.value === 'dark' ? 'Modo Claro' : 'Modo Oscuro' }}
    </span>
  </button>
</template>

<script setup>
import { SunIcon, MoonIcon } from 'lucide-vue-next'

const props = defineProps({
  isCollapsed: {
    type: Boolean,
    default: false
  }
})

const colorMode = useColorMode()

const toggleColorMode = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>

<style scoped>
.text-primary {
  color: #3b82f6;
}
</style>

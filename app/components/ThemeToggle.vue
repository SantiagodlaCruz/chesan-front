<template>
  <button
    @click="toggleColorMode"
    class="p-2.5 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:text-primary transition-all duration-300"
    :title="`Cambiar a modo ${colorMode.value === 'dark' ? 'claro' : 'oscuro'}`"
  >
    <div class="relative w-5 h-5 flex items-center justify-center overflow-hidden">
      <Transition
        enter-active-class="transition duration-500 ease-out"
        leave-active-class="transition duration-500 ease-in"
        enter-from-class="transform translate-y-8 rotate-45 opacity-0"
        leave-to-class="transform -translate-y-8 -rotate-45 opacity-0"
      >
        <MoonIcon v-if="colorMode.value === 'light'" class="w-5 h-5 absolute" />
        <SunIcon v-else class="w-5 h-5 absolute" />
      </Transition>
    </div>
  </button>
</template>

<script setup>
import { SunIcon, MoonIcon } from 'lucide-vue-next'

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

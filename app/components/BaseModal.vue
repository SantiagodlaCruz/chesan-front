<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div 
          class="absolute inset-0 bg-slate-900/40 dark:bg-blue-950/40 backdrop-blur-sm" 
          @click="onBackdropClick"
        ></div>
        
        <!-- Modal Content -->
        <div 
          :class="[
            'relative bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-xl w-full rounded-2xl shadow-2xl border border-border-light dark:border-[#1e293b] overflow-hidden flex flex-col max-h-[90vh] dark:shadow-blue-900/10 transition-all duration-300',
            sizeClass
          ]"
        >
          <!-- Header -->
          <div class="px-8 py-6 border-b border-border-light dark:border-[#1e293b] flex justify-between items-start shrink-0">
            <div>
              <h2 class="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">{{ title }}</h2>
              <slot name="subtitle">
                <p v-if="subtitle" class="text-sm text-slate-500 dark:text-slate-400 mt-1">{{ subtitle }}</p>
              </slot>
            </div>
            <button @click="close" class="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors text-slate-400">
              <XIcon class="w-5 h-5" />
            </button>
          </div>

          <!-- Body -->
          <div class="p-8 overflow-y-auto custom-scrollbar flex-1">
            <slot />
          </div>

          <!-- Footer -->
          <div v-if="$slots.footer" class="px-8 py-4 bg-slate-50/50 dark:bg-white/5 border-t border-border-light dark:border-[#1e293b] shrink-0">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { XIcon } from 'lucide-vue-next'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  subtitle: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: '2xl' // sm, md, lg, xl, 2xl, 3xl, 4xl, 5xl, full
  },
  closeOnBackdrop: {
    type: Boolean,
    default: false // USER explicitly asked to only close by button
  }
})

const emit = defineEmits(['update:show', 'close'])

const sizeClass = computed(() => {
  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    full: 'max-w-[95vw]'
  }
  return sizes[props.size as keyof typeof sizes] || sizes['2xl']
})

const close = () => {
  emit('update:show', false)
  emit('close')
}

const onBackdropClick = () => {
  if (props.closeOnBackdrop) {
    close()
  }
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.2);
  border-radius: 10px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
}
</style>

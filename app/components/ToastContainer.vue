<template>
  <div class="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none max-w-md w-full sm:w-auto">
    <TransitionGroup 
      enter-active-class="transition duration-500 ease-out"
      enter-from-class="transform translate-x-12 opacity-0"
      enter-to-class="transform translate-x-0 opacity-100"
      leave-active-class="transition duration-300 ease-in"
      leave-from-class="transform translate-x-0 opacity-100"
      leave-to-class="transform translate-x-12 opacity-0"
      move-class="transition-all duration-500"
    >
      <div 
        v-for="toast in toastStore.toasts" 
        :key="toast.id"
        class="pointer-events-auto group relative overflow-hidden"
      >
        <div 
          class="flex items-center gap-4 px-5 py-4 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all duration-300"
          :class="[
            toast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' :
            toast.type === 'error' ? 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400' :
            'bg-slate-900/10 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300'
          ]"
        >
          <!-- Icons -->
          <div 
            class="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center"
            :class="[
              toast.type === 'success' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' :
              toast.type === 'error' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30' :
              'bg-slate-800 text-white shadow-lg shadow-slate-800/30'
            ]"
          >
            <CheckIcon v-if="toast.type === 'success'" class="w-5 h-5" />
            <XIcon v-else-if="toast.type === 'error'" class="w-5 h-5" />
            <InfoIcon v-else class="w-5 h-5" />
          </div>

          <!-- Message -->
          <div class="flex-grow pr-4">
            <p class="text-[13px] font-bold tracking-tight leading-relaxed">
              {{ toast.message }}
            </p>
          </div>

          <!-- Close Button -->
          <button 
            @click="toastStore.remove(toast.id)"
            class="flex-shrink-0 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <XIcon class="w-4 h-4" />
          </button>

          <!-- Progress bar -->
          <div 
            v-if="toast.duration"
            class="absolute bottom-0 left-0 h-1 bg-current opacity-20 animate-progress"
            :style="{ animationDuration: toast.duration + 'ms' }"
          ></div>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { CheckIcon, XIcon, InfoIcon } from 'lucide-vue-next'
import { useToast } from '~/stores/toast'

const toastStore = useToast()
</script>

<style scoped>
@keyframes progress {
  from { width: 100%; }
  to { width: 0%; }
}
.animate-progress {
  animation-name: progress;
  animation-timing-function: linear;
  animation-fill-mode: forwards;
}
</style>

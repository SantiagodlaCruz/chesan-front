<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-500 ease-out"
      enter-from-class="translate-y-[-100%] opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-300 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-[-100%] opacity-0"
    >
      <div v-if="toast" class="fixed top-8 left-1/2 -translate-x-1/2 z-[200] w-full max-w-md px-4 pointer-events-none">
        <div 
          class="pointer-events-auto bg-white dark:bg-slate-900 border shadow-2xl rounded-2xl p-4 flex items-center gap-4 transition-all duration-300"
          :class="[
            toast.type === 'success' ? 'border-green-500/30' : 
            toast.type === 'error' ? 'border-red-500/30' : 
            'border-primary/30'
          ]"
        >
          <div 
            class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            :class="[
              toast.type === 'success' ? 'bg-green-500/10 text-green-500' : 
              toast.type === 'error' ? 'bg-red-500/10 text-red-500' : 
              'bg-primary/10 text-primary'
            ]"
          >
            <CheckCircleIcon v-if="toast.type === 'success'" class="w-6 h-6" />
            <AlertCircleIcon v-else-if="toast.type === 'error'" class="w-6 h-6" />
            <InfoIcon v-else class="w-6 h-6" />
          </div>
          
          <div class="flex-1 min-w-0">
            <p class="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">
              {{ toast.type === 'success' ? 'Éxito' : toast.type === 'error' ? 'Error' : 'Aviso' }}
            </p>
            <p class="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              {{ toast.message }}
            </p>
          </div>

          <button @click="hideToast" class="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors text-slate-400 shrink-0">
            <XIcon class="w-4 h-4" />
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { CheckCircleIcon, AlertCircleIcon, InfoIcon, XIcon } from 'lucide-vue-next'
import { useToast } from '~/composables/useToast'

const { toast, hideToast } = useToast()
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    class="relative flex items-center justify-center gap-2 font-bold transition-all duration-300 active:scale-[0.98] disabled:cursor-not-allowed"
    :class="variantClasses"
  >
    <!-- Ripple/Glow effect on hover (for primary) -->
    <div v-if="variant === 'primary'" class="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
    
    <span v-if="!loading" class="flex items-center gap-2">
      <slot />
    </span>
    
    <span v-else class="flex items-center justify-center gap-2">
      <div class="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
      {{ loadingText || 'Cargando...' }}
    </span>
  </button>
</template>

<script setup>
const props = defineProps({
  type: { type: String, default: 'button' },
  variant: { type: String, default: 'primary' },
  loading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  loadingText: { type: String, default: '' },
  full: { type: Boolean, default: true }
})

const variantClasses = computed(() => {
  const base = "py-3.5 px-6 rounded-lg font-bold shadow-lg transition-all"
  const width = props.full ? 'w-full' : ''
  
  const variants = {
    primary: "bg-primary hover:opacity-90 text-white shadow-primary/20",
    dark: "bg-card-dark border border-border-dark text-white hover:bg-background-dark",
    light: "bg-white border border-slate-200 text-slate-900 hover:bg-slate-50",
    ghost: "bg-transparent hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 shadow-none"
  }
  
  return [base, width, variants[props.variant], props.disabled || props.loading ? 'opacity-60 grayscale-[0.5]' : 'active:scale-95'].join(' ')
})
</script>

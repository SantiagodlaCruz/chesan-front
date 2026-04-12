<template>
  <div class="space-y-1.5 w-full">
    <label v-if="label" class="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] ml-1 transition-colors">
      {{ label }}
    </label>
    
    <div class="relative group">
      <!-- Icon Slot -->
      <div v-if="$slots.icon" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors duration-300">
        <slot name="icon" />
      </div>

      <input
        :value="modelValue"
        :type="type"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        class="w-full bg-white dark:bg-[#1e293b] border-2 rounded-2xl py-3 text-sm font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none transition-all duration-300 shadow-sm"
        :class="[
          $slots.icon ? 'pl-11 pr-4' : 'px-4',
          error 
            ? 'border-red-500/50 ring-4 ring-red-500/10' 
            : 'border-slate-200/60 dark:border-transparent hover:border-slate-300 dark:hover:border-white/10 focus:border-primary/50 dark:focus:border-primary/50 focus:ring-4 focus:ring-primary/10'
        ]"
        @input="$emit('update:modelValue', $event.target.value)"
      />
      
      <!-- Validation Feedback Icons -->
      <div v-if="error || success" class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
        <div v-if="success" class="text-green-500 animate-in zoom-in-50">
          <CheckCircleIcon class="w-4 h-4" />
        </div>
        <div v-else-if="error" class="text-red-500 animate-in zoom-in-50">
          <AlertCircleIcon class="w-4 h-4" />
        </div>
      </div>
    </div>

    <!-- Error Message -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="transform -translate-y-2 opacity-0"
      enter-to-class="transform translate-y-0 opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="transform translate-y-0 opacity-100"
      leave-to-class="transform -translate-y-2 opacity-0"
    >
      <p v-if="error" class="text-[10px] font-bold text-red-500 dark:text-red-400 ml-1 uppercase tracking-wider">
        {{ error }}
      </p>
    </Transition>
  </div>
</template>

<script setup>
import { CheckCircleIcon, AlertCircleIcon } from 'lucide-vue-next'

defineProps({
  modelValue: [String, Number],
  type: { type: String, default: 'text' },
  label: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  error: { type: String, default: '' },
  success: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false }
})

defineEmits(['update:modelValue'])
</script>

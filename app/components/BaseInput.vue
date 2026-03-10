<template>
  <div class="space-y-1.5 w-full">
    <label v-if="label" :for="name" class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1 transition-colors">
      {{ label }}
    </label>
    
    <div class="relative group">
      <div v-if="$slots.icon" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors duration-300">
        <slot name="icon" />
      </div>

      <input
        v-bind="inputProps"
        :id="name"
        :type="type"
        :placeholder="placeholder"
        class="w-full bg-card-light dark:bg-card-dark border rounded-xl py-3 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 outline-none transition-all duration-300"
        :class="[
          $slots.icon ? 'pl-11 pr-4' : 'px-4',
          errorMessage 
            ? 'border-accent-red/50 ring-2 ring-accent-red/20' 
            : 'border-border-light dark:border-border-dark focus:ring-2 focus:ring-primary/20 focus:border-primary'
        ]"
      />
      
      <!-- Interactive feedback indicator -->
      <div v-if="meta.touched" class="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity duration-300">
        <div v-if="meta.valid" class="text-green-500 animate-in zoom-in-50">
          <CheckCircleIcon class="w-5 h-5" />
        </div>
        <div v-else-if="errorMessage" class="text-red-500 animate-in zoom-in-50">
          <AlertCircleIcon class="w-5 h-5" />
        </div>
      </div>
    </div>

    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="transform -translate-y-2 opacity-0"
      enter-to-class="transform translate-y-0 opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="transform translate-y-0 opacity-100"
      leave-to-class="transform -translate-y-2 opacity-0"
    >
      <p v-if="errorMessage" class="text-[11px] font-medium text-red-500 dark:text-red-400 ml-1 flex items-center gap-1">
        {{ errorMessage }}
      </p>
    </Transition>
  </div>
</template>

<script setup>
import { useField } from 'vee-validate'
import { CheckCircleIcon, AlertCircleIcon } from 'lucide-vue-next'

const props = defineProps({
  name: { type: String, required: true },
  type: { type: String, default: 'text' },
  label: { type: String, default: '' },
  placeholder: { type: String, default: '' }
})

const { 
  value: inputValue, 
  errorMessage, 
  handleBlur, 
  handleChange, 
  meta 
} = useField(props.name, undefined, {
  validateOnValueUpdate: true,
})

const inputProps = computed(() => ({
  value: inputValue.value,
  onBlur: handleBlur,
  onInput: (e) => handleChange(e, !!errorMessage.value)
}))
</script>

<style scoped>
.text-primary {
  color: #3b82f6;
}
.border-primary\/50 {
  border-color: rgba(59, 130, 246, 0.5);
}
.ring-primary\/10 {
  --tw-ring-color: rgba(59, 130, 246, 0.1);
}
</style>

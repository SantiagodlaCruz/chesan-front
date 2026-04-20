<template>
  <div class="space-y-1.5 w-full">
    <label v-if="label" class="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] ml-1 transition-colors">
      {{ label }}
    </label>

    <div class="flex items-center" :class="compact ? 'gap-1' : 'gap-2'">
      <button
        type="button"
        @click="decrement"
        :disabled="disabled || internalValue <= min"
        class="rounded-xl border border-slate-200 dark:border-white/10 hover:border-primary/50 hover:text-primary flex items-center justify-center text-slate-400 transition-all disabled:opacity-20 disabled:cursor-not-allowed bg-white dark:bg-slate-900 shadow-sm active:scale-90"
        :class="compact ? 'w-7 h-7' : 'w-9 h-9'"
      >
        <MinusIcon :class="compact ? 'w-3 h-3' : 'w-4 h-4'" />
      </button>

      <div class="relative flex-1">
        <input
          v-model.number="internalValue"
          type="number"
          :disabled="disabled"
          class="w-full text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl py-2 text-sm font-black text-slate-800 dark:text-slate-100 outline-none transition-all duration-300 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 appearance-none shadow-sm"
          :class="compact ? 'py-1 px-1' : 'py-2'"
          @blur="onBlur"
        />
      </div>

      <button
        type="button"
        @click="increment"
        :disabled="disabled || (max !== undefined && internalValue >= max)"
        class="rounded-xl border border-slate-200 dark:border-white/10 hover:border-primary/50 hover:text-primary flex items-center justify-center text-slate-400 transition-all disabled:opacity-20 disabled:cursor-not-allowed bg-white dark:bg-slate-900 shadow-sm active:scale-90"
        :class="compact ? 'w-7 h-7' : 'w-9 h-9'"
      >
        <PlusIcon :class="compact ? 'w-3 h-3' : 'w-4 h-4'" />
      </button>
    </div>

    <!-- Error Message -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="transform -translate-y-2 opacity-0"
      enter-to-class="transform translate-y-0 opacity-100"
    >
      <p v-if="errorMessage" class="text-[10px] font-bold text-red-500 dark:text-red-400 ml-1 uppercase tracking-wider">
        {{ errorMessage }}
      </p>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { PlusIcon, MinusIcon } from 'lucide-vue-next'
import { useField } from 'vee-validate'

const props = defineProps<{
  name?: string
  modelValue?: number
  label?: string
  disabled?: boolean
  compact?: boolean
  min?: number
  max?: number
  step?: number
}>()

const emit = defineEmits(['update:modelValue'])

const step = props.step ?? 1
const min = props.min ?? 0

// Integrate with vee-validate if name is provided
const field = props.name
  ? useField<number>(() => props.name!, undefined, {
      initialValue: props.modelValue,
      syncVModel: true
    })
  : null

const veeValue = field ? field.value : null
const errorMessage = field ? field.errorMessage : ref('')

const internalValue = computed({
  get: () => {
    const val = props.name && field ? field.value.value : props.modelValue
    return (val === undefined || val === null) ? 0 : Number(val)
  },
  set: (val) => {
    const num = (val === null || val === undefined || String(val) === '') ? 0 : Number(val)
    if (props.name && field) {
      field.value.value = num
    }
    emit('update:modelValue', num)
  }
})

const increment = () => {
  const newVal = (internalValue.value || 0) + step
  if (props.max !== undefined && newVal > props.max) return
  internalValue.value = newVal
}

const decrement = () => {
  const newVal = (internalValue.value || 0) - step
  if (newVal < min) return
  internalValue.value = newVal
}

const onBlur = () => {
  if (internalValue.value < min) internalValue.value = min
  if (props.max !== undefined && internalValue.value > props.max) internalValue.value = props.max
}
</script>

<style scoped>
/* Hide arrows */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type=number] {
  -moz-appearance: textfield;
  appearance: textfield;
}
</style>

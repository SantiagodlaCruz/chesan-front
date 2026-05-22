<template>
  <div class="space-y-1.5 w-full group/input">
    <label v-if="label" class="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] ml-1 transition-colors duration-300 group-focus-within/input:text-primary dark:group-focus-within/input:text-primary">
      {{ label }}
    </label>
    
    <div class="relative group">
      <!-- Icon Slot -->
      <div v-if="$slots.icon" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-primary transition-colors duration-300">
        <slot name="icon" />
      </div>

      <input
        v-model="value"
        :type="inputType"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        @keydown="handleKeydown"
        @input="handleInput"
        class="w-full bg-white dark:bg-[#1e293b] border-2 rounded-2xl py-3 text-sm font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none transition-all duration-300 shadow-sm group-focus-within/input:bg-slate-50/50 dark:group-focus-within/input:bg-[#0f172a] group-focus-within/input:shadow-md group-focus-within/input:shadow-primary/10"
        :class="[
          $slots.icon ? 'pl-11 pr-12' : 'pl-4 pr-12',
          errorMessage 
            ? 'border-red-500/50 ring-4 ring-red-500/10' 
            : 'border-slate-200/60 dark:border-transparent hover:border-slate-300 dark:hover:border-white/10 focus:border-primary/50 dark:focus:border-primary/50 focus:ring-4 focus:ring-primary/10'
        ]"
      />
      
      <!-- Password Visibility Toggle -->
      <button
        v-if="type === 'password'"
        type="button"
        @click="togglePassword"
        class="absolute right-10 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors flex items-center justify-center p-1 z-10"
      >
        <EyeOffIcon v-if="showPassword" class="w-4 h-4" />
        <EyeIcon v-else class="w-4 h-4" />
      </button>

      <!-- Validation Feedback Icons -->
      <div v-if="errorMessage || meta.valid" class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
        <div v-if="meta.valid && value" class="text-green-500 animate-in zoom-in-50 duration-200">
          <CheckCircleIcon class="w-4 h-4" />
        </div>
        <div v-else-if="errorMessage" class="text-red-500 animate-in zoom-in-50 duration-200">
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
      <p v-if="errorMessage" class="text-[10px] font-bold text-red-500 dark:text-red-400 ml-1 uppercase tracking-wider">
        {{ errorMessage }}
      </p>
    </Transition>
  </div>
</template>

<script setup>
import { useField } from 'vee-validate'
import { computed, ref, reactive } from 'vue'
import { CheckCircleIcon, AlertCircleIcon, EyeIcon, EyeOffIcon } from 'lucide-vue-next'
import { useNumericInput } from '~/composables/useNumericInput'

const props = defineProps({
  name: { type: String, default: undefined },
  modelValue: [String, Number],
  type: { type: String, default: 'text' },
  label: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  required: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  error: { type: String, default: '' }
})

const emit = defineEmits(['update:modelValue'])

const showPassword = ref(false)
const togglePassword = () => {
  showPassword.value = !showPassword.value
}

const inputType = computed(() => {
  if (props.type === 'password') {
    return showPassword.value ? 'text' : 'password'
  }
  return props.type
})

const { onNumericKeydown, cleanNumericValue } = useNumericInput()

const handleKeydown = (e) => {
  if (props.type === 'number') {
    onNumericKeydown(e, { allowDecimal: true, allowNegative: true })
  } else if (props.type === 'tel') {
    onNumericKeydown(e, { isPhone: true })
  }
}

const handleInput = (e) => {
  if (props.type === 'number') {
    const cleaned = cleanNumericValue(e.target.value, { allowDecimal: true })
    if (e.target.value !== cleaned) {
      value.value = cleaned
    }
  } else if (props.type === 'tel') {
    const cleaned = cleanNumericValue(e.target.value, { isPhone: true })
    if (e.target.value !== cleaned) {
      value.value = cleaned
    }
  }
}

// If no name is provided, use standard v-model behavior
// If name is provided, integrate with vee-validate
const field = props.name 
  ? useField(() => props.name, undefined, {
      initialValue: props.modelValue,
      syncVModel: true
    })
  : { 
      value: computed({
        get: () => props.modelValue,
        set: (v) => emit('update:modelValue', v)
      }),
      errorMessage: ref(''),
      meta: reactive({ valid: false })
    }

const value = field.value
const meta = field.meta
const errorMessage = computed(() => props.error || field.errorMessage.value)
</script>

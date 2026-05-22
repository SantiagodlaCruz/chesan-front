<template>
  <div class="relative w-full overflow-visible group/select" ref="container">
    <label v-if="label" class="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] ml-1 mb-1.5 transition-colors duration-300 group-focus-within/select:text-primary dark:group-focus-within/select:text-primary">
      {{ label }}
    </label>
    <!-- Trigger Button -->
    <button 
      type="button"
      :class="[
        'w-full flex items-center justify-between bg-white dark:bg-[#1e293b] border-2 shadow-sm transition-all duration-300 focus:outline-none group-focus-within/select:bg-slate-50/50 dark:group-focus-within/select:bg-[#0f172a] group-focus-within/select:shadow-md group-focus-within/select:shadow-primary/10',
        compact ? 'px-3 py-2 rounded-xl' : 'px-4 py-3 rounded-2xl',
        error ? 'border-red-500/50 ring-4 ring-red-500/10' : 'border-slate-200/60 dark:border-transparent hover:border-slate-300 dark:hover:border-white/10',
        disabled ? 'opacity-60 cursor-not-allowed bg-slate-50 dark:bg-slate-900/40' : (error ? '' : 'focus:border-primary/50 focus:ring-4 focus:ring-primary/10')
      ]"
      :disabled="disabled"
      @click.stop="!disabled && openDropdown()"
    >
      <span :class="[
        'truncate flex items-center gap-2',
        compact ? 'text-xs' : 'text-sm',
        selectedLabel ? 'text-slate-800 dark:text-slate-100 font-semibold' : 'text-slate-500 font-medium'
      ]">
        <div 
          v-if="selectedOption?.hex" 
          class="w-3 h-3 rounded-full border border-slate-200 dark:border-white/10 shadow-sm shrink-0"
          :style="{ backgroundColor: selectedOption.hex }"
        ></div>
        {{ selectedLabel || placeholder }}
      </span>
      <Loader2Icon 
        v-if="loading" 
        :class="[compact ? 'w-3 h-3' : 'w-4 h-4', 'text-primary animate-spin shrink-0']" 
      />
      <ChevronDownIcon 
        v-else
        :class="[compact ? 'w-3 h-3' : 'w-4 h-4', 'text-slate-400 shrink-0 transition-transform duration-300', {'rotate-180': isOpen}]" 
      />
    </button>

    <!-- Dropdown Options -->
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="transform scale-95 opacity-0 -translate-y-2"
      enter-to-class="transform scale-100 opacity-100 translate-y-0"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="transform scale-100 opacity-100 translate-y-0"
      leave-to-class="transform scale-95 opacity-0 -translate-y-2"
    >
      <div 
        v-if="isOpen" 
        :class="[
          'absolute z-[9999] bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-[#1e293b] shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col focus:outline-none overflow-hidden',
          menuWidth ? menuWidth : (
            compact 
              ? (direction === 'down' ? 'mt-2 w-56 rounded-lg left-0 top-full' : 'bottom-full mb-2 w-24 rounded-lg right-0') 
              : 'mt-2 w-full rounded-2xl left-0'
          )
        ]"
      >
        <!-- Search Input -->
        <div v-if="searchable" class="shrink-0 p-2 border-b border-slate-100 dark:border-[#1e293b] bg-slate-50 dark:bg-[#0f172a]">
          <input 
            ref="searchInput"
            v-model="searchQuery"
            type="text" 
            placeholder="Buscar..."
            class="w-full bg-white dark:bg-[#1e293b] border border-border-light dark:border-transparent rounded px-2.5 py-1 text-[11px] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
            @keydown.esc="closeDropdown"
            @keydown.down.prevent="navigateOptions(1)"
            @keydown.up.prevent="navigateOptions(-1)"
            @keydown.enter.prevent="selectHighlighted"
          />
        </div>

        <div class="max-h-60 overflow-y-auto py-1 custom-scrollbar">
          <div 
            v-if="filteredOptions.length === 0" 
            class="px-4 py-3 text-sm text-slate-400 text-center"
          >
          No results
        </div>
        <button
          type="button"
          v-for="(option, index) in filteredOptions"
          :key="option.value"
          @click.stop="selectOption(option)"
          @mouseover="highlightedIndex = index"
          :class="[
            'w-full text-left px-4 py-2 text-sm transition-colors flex items-center justify-between',
            highlightedIndex === index ? 'bg-slate-50 dark:bg-[#1e293b]' : '',
            modelValue == option.value ? 'text-primary font-bold bg-primary/5 dark:bg-primary/10' : 'text-slate-700 dark:text-slate-300'
          ]"
        >
          <div class="flex items-center gap-2 truncate pr-4">
            <div 
              v-if="option.hex" 
              class="w-2.5 h-2.5 rounded-full border border-slate-200 dark:border-white/10 shadow-sm shrink-0"
              :style="{ backgroundColor: option.hex }"
            ></div>
            <span class="truncate">{{ option.label }}</span>
          </div>
          <CheckIcon v-if="modelValue == option.value" class="w-3.5 h-3.5 text-primary shrink-0" />
        </button>
        </div>
      </div>
    </Transition>

    <!-- Error Message -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="transform -translate-y-2 opacity-0"
      enter-to-class="transform translate-y-0 opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="transform translate-y-0 opacity-100"
      leave-to-class="transform -translate-y-2 opacity-0"
    >
      <p v-if="error" class="text-[10px] font-bold text-red-500 dark:text-red-400 ml-1 mt-1 uppercase tracking-wider">
        {{ error }}
      </p>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { ChevronDownIcon, CheckIcon, Loader2Icon } from 'lucide-vue-next'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  options: {
    type: Array,
    required: true,
  },
  placeholder: {
    type: String,
    default: 'Seleccionar...'
  },
  label: {
    type: String,
    default: ''
  },
  searchable: {
    type: Boolean,
    default: false
  },
  compact: {
    type: Boolean,
    default: false
  },
  direction: {
    type: String, // 'up', 'down', 'auto'
    default: 'auto'
  },
  creatable: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  menuWidth: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'create'])

const container = ref(null)
const searchInput = ref(null)
const isOpen = ref(false)
const searchQuery = ref('')
const highlightedIndex = ref(-1)

// Determine what label to show
const selectedOption = computed(() => props.options.find(opt => opt.value == props.modelValue))
const selectedLabel = computed(() => {
  if (searchQuery.value) return ''
  if (selectedOption.value) return selectedOption.value.label
  if (props.creatable && props.modelValue && !props.options.some(o => o.value == props.modelValue)) return props.modelValue
  return ''
})

const filteredOptions = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  let result = props.options
  
  if (query) {
    const words = query.split(' ').filter(w => w.length > 0)
    result = props.options.filter(opt => {
      const label = opt.label.toString().toLowerCase()
      // Todas las palabras ingresadas deben estar presentes en el label (en cualquier orden)
      return words.every(word => label.includes(word))
    })
  }

  // If creatable, add a virtual option if query doesn't match exactly any existing option
  if (props.creatable && query) {
    const exists = props.options.find(opt => opt.label.toString().toLowerCase() === query)
    if (!exists) {
      result = [...result, { label: `+ Agregar "${searchQuery.value}"`, value: searchQuery.value, isCustom: true }]
    }
  }
  
  return result
})

const openDropdown = async () => {
  isOpen.value = true
  const currentIndex = filteredOptions.value.findIndex(o => o.value == props.modelValue)
  highlightedIndex.value = currentIndex >= 0 ? currentIndex : 0

  if (props.searchable) {
    await nextTick()
    searchInput.value?.focus()
  }
}

const closeDropdown = () => {
  isOpen.value = false
  searchQuery.value = ''
  highlightedIndex.value = -1
}

const selectOption = (option) => {
  if (option.isCustom) {
    emit('create', option.value)
  } else {
    emit('update:modelValue', option.value)
  }
  closeDropdown()
}

const navigateOptions = (direction) => {
  if (!isOpen.value) {
    openDropdown()
    return
  }
  highlightedIndex.value += direction
  if (highlightedIndex.value < 0) highlightedIndex.value = filteredOptions.value.length - 1
  else if (highlightedIndex.value >= filteredOptions.value.length) highlightedIndex.value = 0
}

const selectHighlighted = () => {
  if (isOpen.value && highlightedIndex.value >= 0 && highlightedIndex.value < filteredOptions.value.length) {
    selectOption(filteredOptions.value[highlightedIndex.value])
  } else {
    openDropdown()
  }
}

const handleClickOutside = (e) => {
  if (container.value && !container.value.contains(e.target)) {
    closeDropdown()
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})
</script>

<template>
  <div class="relative w-full" ref="container">
    <label v-if="label" class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">{{ label }}</label>
    <!-- Trigger Button -->
    <button 
      type="button"
      class="w-full flex items-center justify-between bg-white dark:bg-[#1e293b] border border-border-light dark:border-transparent hover:border-primary dark:hover:border-primary transition-all rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/50"
      @click="openDropdown"
    >
      <span class="text-sm truncate" :class="selectedLabel ? 'text-slate-800 dark:text-slate-100 font-semibold' : 'text-slate-500 font-medium'">
        {{ selectedLabel || placeholder }}
      </span>
      <ChevronDownIcon class="w-4 h-4 text-slate-400 shrink-0 transition-transform duration-300" :class="{'rotate-180': isOpen}" />
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
        class="absolute z-50 w-full mt-2 bg-white dark:bg-[#0f172a] border border-border-light dark:border-[#1e293b] rounded-xl shadow-xl dark:shadow-blue-900/20 flex flex-col focus:outline-none overflow-hidden"
      >
        <!-- Search Input -->
        <div v-if="searchable" class="shrink-0 p-2 border-b border-border-light dark:border-[#1e293b] bg-slate-50 dark:bg-[#0f172a]">
          <input 
            ref="searchInput"
            v-model="searchQuery"
            type="text" 
            placeholder="Buscar en opciones..."
            class="w-full bg-white dark:bg-[#1e293b] border border-border-light dark:border-transparent rounded-lg px-3 py-1.5 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
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
          No se encontraron resultados
        </div>
        <button
          v-for="(option, index) in filteredOptions"
          :key="option.value"
          @click.stop="selectOption(option)"
          @mouseover="highlightedIndex = index"
          class="w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between"
          :class="[
            highlightedIndex === index ? 'bg-slate-50 dark:bg-[#1e293b]' : '',
            modelValue === option.value ? 'text-primary font-bold bg-primary/5 dark:bg-primary/10' : 'text-slate-700 dark:text-slate-300'
          ]"
        >
          <span class="truncate pr-4">{{ option.label }}</span>
          <CheckIcon v-if="modelValue === option.value" class="w-4 h-4 text-primary shrink-0" />
        </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { ChevronDownIcon, CheckIcon } from 'lucide-vue-next'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  options: {
    type: Array,
    required: true,
    // Expected structure: [{ label: 'Option 1', value: 'op1' }, ...]
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
  }
})

const emit = defineEmits(['update:modelValue'])

const container = ref(null)
const searchInput = ref(null)
const isOpen = ref(false)
const searchQuery = ref('')
const highlightedIndex = ref(-1)

// Determine what label to show in the placeholder if an item is selected
const selectedLabel = computed(() => {
  const selected = props.options.find(opt => opt.value === props.modelValue)
  // Only display the label as placeholder if we are not actively typing a search query
  if (selected && !searchQuery.value) return selected.label
  return ''
})

// Filter options based on search query
const filteredOptions = computed(() => {
  if (!searchQuery.value) return props.options
  const query = searchQuery.value.toLowerCase()
  return props.options.filter(opt => opt.label.toLowerCase().includes(query))
})

// Open dropdown and highlight current value
const openDropdown = async () => {
  isOpen.value = true
  
  const currentIndex = filteredOptions.value.findIndex(o => o.value === props.modelValue)
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
  searchInput.value?.blur()
}

// Select the chosen option
const selectOption = (option) => {
  emit('update:modelValue', option.value)
  closeDropdown()
}

// Keyboard navigation (up/down)
const navigateOptions = (direction) => {
  if (!isOpen.value) {
    openDropdown()
    return
  }
  
  highlightedIndex.value += direction
  
  if (highlightedIndex.value < 0) {
    highlightedIndex.value = filteredOptions.value.length - 1
  } else if (highlightedIndex.value >= filteredOptions.value.length) {
    highlightedIndex.value = 0
  }
}

// Keyboard 'Enter' handling
const selectHighlighted = () => {
  if (isOpen.value && highlightedIndex.value >= 0 && highlightedIndex.value < filteredOptions.value.length) {
    selectOption(filteredOptions.value[highlightedIndex.value])
  } else {
    openDropdown()
  }
}

// Close when clicking outside of component
const handleClickOutside = (e) => {
  if (container.value && !container.value.contains(e.target)) {
    closeDropdown()
  }
}

// Reset search when the value externally updates
watch(() => props.modelValue, () => {
  searchQuery.value = ''
})

// Update highlight when results change
watch(filteredOptions, () => {
  highlightedIndex.value = filteredOptions.value.length > 0 ? 0 : -1
})

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})
</script>

<style scoped>
/* To eliminate browser autofill styles */
input:-webkit-autofill,
input:-webkit-autofill:hover, 
input:-webkit-autofill:focus, 
input:-webkit-autofill:active{
  -webkit-box-shadow: 0 0 0 30px transparent inset !important;
  -webkit-text-fill-color: inherit !important;
  transition: background-color 5000s ease-in-out 0s;
  background-color: transparent !important;
}
</style>

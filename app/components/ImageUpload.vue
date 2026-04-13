<template>
  <div class="space-y-2">
    <label v-if="label" class="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 block">
      {{ label }}
    </label>
    
    <div 
      class="relative group"
      :class="[
        readonly ? 'cursor-default' : 'cursor-pointer',
      ]"
      @dragover.prevent="!readonly && (isDragging = true)"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="!readonly && handleDrop($event)"
    >
      <!-- Dropzone / Preview Area -->
      <div 
        class="relative w-full aspect-square rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center overflow-hidden bg-slate-50 dark:bg-white/5"
        :class="[
          isDragging ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700',
          previewUrl && !isLoading ? 'border-solid border-transparent' : ''
        ]"
      >
        <!-- Loading State -->
        <div v-if="isLoading" class="absolute inset-0 z-20 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
          <div class="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
          <p class="text-[10px] font-black text-primary uppercase tracking-widest animate-pulse">Procesando...</p>
        </div>
        <!-- Image Preview -->
        <template v-if="previewUrl">
          <img :src="previewUrl" class="w-full h-full object-cover animate-in fade-in zoom-in-95 duration-500" @error="onImageError" />
          <div v-if="!readonly" class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
            <button type="button" @click="triggerInput" class="p-2.5 bg-white/20 hover:bg-white/40 rounded-full text-white transition-all transform hover:scale-110">
              <UploadIcon class="w-5 h-5" />
            </button>
            <button type="button" @click="removeImage" class="p-2.5 bg-red-500/20 hover:bg-red-500/60 rounded-full text-white transition-all transform hover:scale-110">
              <Trash2Icon class="w-5 h-5" />
            </button>
          </div>
        </template>

        <!-- Placeholder -->
        <template v-else>
          <div class="flex flex-col items-center gap-2 p-4 text-center pointer-events-none">
            <div class="w-10 h-10 rounded-xl bg-white dark:bg-white/5 shadow-sm border border-slate-100 dark:border-white/5 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
              <ImageIcon class="w-5 h-5" stroke-width="1.5" />
            </div>
            <div>
              <p class="text-[11px] font-black text-slate-700 dark:text-slate-200 uppercase tracking-tighter">
                Subir Foto
              </p>
              <p class="text-[10px] text-slate-500 font-bold mt-0.5">
                Arrastrar o clic
              </p>
            </div>
          </div>
          <button type="button" v-if="!readonly" @click="triggerInput" class="absolute inset-0 w-full h-full outline-none focus:ring-2 focus:ring-primary/50 rounded-2xl cursor-pointer"></button>
        </template>
      </div>

      <!-- Hidden Input -->
      <input 
        ref="fileInput"
        type="file"
        class="hidden"
        accept="image/*"
        @change="handleFileChange"
      />
    </div>

    <!-- Info Footer -->
    <div class="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
      <span>JPG, PNG o WEBP</span>
      <span>Máx. 5MB</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ImageIcon, UploadIcon, Trash2Icon } from 'lucide-vue-next'

const props = defineProps<{
  modelValue: string | File | Record<string, any> | null | undefined
  label?: string
  initialPreview?: string
  readonly?: boolean
}>()

const emit = defineEmits(['update:modelValue'])

const fileInput = ref<HTMLInputElement | null>(null)
const previewUrl = ref(props.initialPreview || '')
const isDragging = ref(false)
const isLoading = ref(false)

// Watch for initial preview changes (e.g. when editing)
watch(() => props.initialPreview, (val) => {
  if (val) previewUrl.value = val
}, { immediate: true })

const triggerInput = () => {
  fileInput.value?.click()
}

const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) processFile(file)
}

const handleDrop = (e: DragEvent) => {
  isDragging.value = false
  const file = e.dataTransfer?.files[0]
  if (file && file.type.startsWith('image/')) {
    processFile(file)
  }
}

const processFile = (file: File) => {
  if (props.readonly) return
  isLoading.value = true
  // Update model
  emit('update:modelValue', file)
  
  // Create preview
  const reader = new FileReader()
  reader.onload = (e: ProgressEvent<FileReader>) => {
    const result = e.target?.result
    if (typeof result === 'string') {
      previewUrl.value = result
    }
    setTimeout(() => {
      isLoading.value = false
    }, 400) // Small delay for smooth transition
  }
  reader.onerror = () => {
    isLoading.value = false
  }
  reader.readAsDataURL(file)
}

const removeImage = () => {
  if (props.readonly) return
  previewUrl.value = ''
  emit('update:modelValue', null)
  if (fileInput.value) fileInput.value.value = ''
}

const onImageError = () => {
  // If the image fails to load, we can show a placeholder or do nothing
}
</script>

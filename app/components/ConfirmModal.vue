<template>
  <BaseModal 
    :show="show" 
    :title="title" 
    :size="size"
    @update:show="emit('update:show', $event)"
  >
    <div class="flex flex-col items-center text-center py-4">
      <div 
        class="w-16 h-16 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-300"
        :class="variantClasses.iconBg"
      >
        <component :is="icon" class="w-8 h-8" :class="variantClasses.icon" />
      </div>
      
      <p class="text-slate-600 dark:text-slate-300 mb-8 max-w-sm whitespace-pre-line">
        {{ message }}
      </p>

      <div class="flex items-center justify-center gap-3 w-full">
        <BaseButton 
          type="button" 
          variant="secondary" 
          :full="false" 
          class="min-w-[120px]"
          @click="emit('update:show', false)"
          :disabled="loading"
        >
          {{ cancelText }}
        </BaseButton>
        <BaseButton 
          type="button" 
          :variant="confirmVariant" 
          :full="false" 
          class="min-w-[120px]"
          :loading="loading"
          @click="emit('confirm')"
        >
          {{ confirmText }}
        </BaseButton>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { AlertTriangleIcon, Trash2Icon, InfoIcon, CheckCircleIcon } from 'lucide-vue-next'
import BaseModal from './BaseModal.vue'
import BaseButton from './BaseButton.vue'

interface Props {
  show: boolean
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  confirmVariant?: 'primary' | 'danger' | 'success' | 'warning'
  loading?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Confirmar Acción',
  confirmText: 'Confirmar',
  cancelText: 'Cancelar',
  confirmVariant: 'danger',
  loading: false,
  size: 'md'
})

const emit = defineEmits(['update:show', 'confirm'])

const icon = computed(() => {
  switch (props.confirmVariant) {
    case 'danger': return Trash2Icon
    case 'warning': return AlertTriangleIcon
    case 'success': return CheckCircleIcon
    default: return InfoIcon
  }
})

const variantClasses = computed(() => {
  switch (props.confirmVariant) {
    case 'danger': return {
      iconBg: 'bg-red-50 dark:bg-red-500/10',
      icon: 'text-red-500'
    }
    case 'warning': return {
      iconBg: 'bg-orange-50 dark:bg-orange-500/10',
      icon: 'text-orange-500'
    }
    case 'success': return {
      iconBg: 'bg-emerald-50 dark:bg-emerald-500/10',
      icon: 'text-emerald-500'
    }
    default: return {
      iconBg: 'bg-primary/10',
      icon: 'text-primary'
    }
  }
})
</script>

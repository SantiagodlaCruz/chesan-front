import { ref } from 'vue'

interface Toast {
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
}

const toast = ref<Toast | null>(null)

export const useToast = () => {
  const showToast = (message: string, type: Toast['type'] = 'info') => {
    toast.value = { message, type }
    
    // Auto-hide success and info after 4 seconds
    if (type === 'success' || type === 'info') {
      setTimeout(() => {
        if (toast.value?.message === message) {
          toast.value = null
        }
      }, 4000)
    }
  }

  const hideToast = () => {
    toast.value = null
  }

  return {
    toast,
    showToast,
    hideToast
  }
}

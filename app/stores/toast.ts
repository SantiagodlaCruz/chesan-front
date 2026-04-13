import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Toast {
  id: number
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

export const useToast = defineStore('toast', () => {
  const toasts = ref<Toast[]>([])
  let nextId = 1

  function add(message: string, type: Toast['type'] = 'info', duration = 4000) {
    const id = nextId++
    toasts.value.push({ id, message, type, duration })

    if (duration > 0) {
      setTimeout(() => {
        remove(id)
      }, duration)
    }
    
    return id
  }

  function success(message: string, duration?: number) {
    return add(message, 'success', duration)
  }

  function error(message: string, duration?: number) {
    return add(message, 'error', duration)
  }

  function remove(id: number) {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index !== -1) {
      toasts.value.splice(index, 1)
    }
  }

  return { toasts, add, success, error, remove }
})

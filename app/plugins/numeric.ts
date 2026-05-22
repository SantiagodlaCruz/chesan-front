import { defineNuxtPlugin } from '#app'
import { useNumericInput } from '../composables/useNumericInput'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('numeric', {
    mounted(el, binding) {
      const input = el.tagName === 'INPUT' ? el : el.querySelector('input')
      if (!input) return

      const { onNumericKeydown, cleanNumericValue } = useNumericInput()

      const modifiers = binding.modifiers || {}
      const options = {
        allowDecimal: !!modifiers.decimal,
        allowNegative: !!modifiers.negative,
        isPhone: !!modifiers.phone
      }

      el._keydownHandler = (e: KeyboardEvent) => {
        onNumericKeydown(e, options)
      }

      el._inputHandler = (e: Event) => {
        const target = e.target as HTMLInputElement
        const cleaned = cleanNumericValue(target.value, options)
        if (target.value !== cleaned) {
          target.value = cleaned
          target.dispatchEvent(new Event('input', { bubbles: true }))
        }
      }

      input.addEventListener('keydown', el._keydownHandler)
      input.addEventListener('input', el._inputHandler)
    },
    unmounted(el) {
      const input = el.tagName === 'INPUT' ? el : el.querySelector('input')
      if (!input) return

      if (el._keydownHandler) input.removeEventListener('keydown', el._keydownHandler)
      if (el._inputHandler) input.removeEventListener('input', el._inputHandler)
    }
  })
})

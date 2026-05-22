export function useNumericInput() {
  const onNumericKeydown = (e: KeyboardEvent, options: { allowDecimal?: boolean, allowNegative?: boolean, isPhone?: boolean } = {}) => {
    // Permitir teclas de control y navegación
    const allowedKeys = [
      'Backspace', 'Tab', 'Enter', 'Escape', 
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 
      'Delete', 'Home', 'End', 'Copy', 'Paste', 'Cut'
    ]
    if (allowedKeys.includes(e.key) || e.ctrlKey || e.metaKey) {
      return
    }

    // Modo Teléfono: Solo dígitos 0-9
    if (options.isPhone) {
      if (!/^\d$/.test(e.key)) {
        e.preventDefault()
      }
      return
    }

    // Modo Decimal: Permitir un solo punto
    if (options.allowDecimal && e.key === '.') {
      const input = e.target as HTMLInputElement
      if (input && input.value.includes('.')) {
        e.preventDefault()
      }
      return
    }

    // Modo Negativo: Permitir guion al inicio
    if (options.allowNegative && e.key === '-') {
      const input = e.target as HTMLInputElement
      if (input && (input.value.includes('-') || input.selectionStart !== 0)) {
        e.preventDefault()
      }
      return
    }

    // Bloquear cualquier carácter que no sea dígito 0-9 (bloquea e, E, +, letras, símbolos)
    if (!/^\d$/.test(e.key)) {
      e.preventDefault()
    }
  }

  const cleanNumericValue = (val: any, options: { allowDecimal?: boolean, isPhone?: boolean } = {}) => {
    if (val === null || val === undefined) return ''
    let str = String(val)
    if (options.isPhone) {
      return str.replace(/\D/g, '').slice(0, 10)
    }
    if (options.allowDecimal) {
      str = str.replace(/[^0-9.]/g, '')
      const parts = str.split('.')
      if (parts.length > 2) {
        str = parts[0] + '.' + parts.slice(1).join('')
      }
      return str
    }
    return str.replace(/\D/g, '')
  }

  return {
    onNumericKeydown,
    cleanNumericValue
  }
}

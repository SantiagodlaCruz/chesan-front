export const useFormatter = () => {
  const formatHumanDate = (dateString: string | Date) => {
    if (!dateString) return 'Fecha no disponible'
    
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString
    
    // Check if valid date
    if (isNaN(date.getTime())) return 'Fecha inválida'

    return new Intl.DateTimeFormat('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date)
  }

  const formatRelativeTime = (dateString: string | Date) => {
    if (!dateString) return ''
    
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return 'hace un momento'
    if (diffInSeconds < 3600) return `hace ${Math.floor(diffInSeconds / 60)} min`
    if (diffInSeconds < 86400) return `hace ${Math.floor(diffInSeconds / 3600)} horas`
    if (diffInSeconds < 604800) return `hace ${Math.floor(diffInSeconds / 86400)} días`
    
    return formatHumanDate(date)
  }

  const formatMoney = (amount: number | string) => {
    const value = typeof amount === 'string' ? parseFloat(amount) : amount
    if (isNaN(value)) return '$0.00'
    
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(value)
  }

  return {
    formatHumanDate,
    formatRelativeTime,
    formatMoney
  }
}

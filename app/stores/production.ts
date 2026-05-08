import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useProductionStore = defineStore('production', () => {
  const api = useApi()
  const board = ref<any>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchBoard() {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/api/kanban/board')
      board.value = response.data
    } catch (err: any) {
      error.value = err.message || 'Error al cargar el tablero'
    } finally {
      loading.value = false
    }
  }

  async function moveCard(cardId: number, newColumnId: number, newPosition: number) {
    try {
      await api.post('/api/kanban/move-card', {
        card_id: cardId,
        new_column_id: newColumnId,
        new_position: newPosition
      })
      // Opcionalmente refrescar el board o actualizar localmente
    } catch (err: any) {
      console.error('Error moving card', err)
      throw err
    }
  }

  async function createOrder(orderData: any) {
    try {
      const response = await api.post('/api/orders', orderData)
      await fetchBoard() // Refrescar para ver la nueva tarjeta
      return response.data
    } catch (err: any) {
      console.error('Error creating order', err)
      throw err
    }
  }

  return {
    board,
    loading,
    error,
    fetchBoard,
    moveCard,
    createOrder
  }
})

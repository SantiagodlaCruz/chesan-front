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

  async function moveCardOptimistically(cardId: number, newColumnId: number, newPosition: number, dropIndex: number) {
    if (!board.value) return

    // 1. Guardar copia de seguridad del tablero actual para rollback
    const originalBoard = JSON.parse(JSON.stringify(board.value))

    // 2. Encontrar la tarjeta y su columna original
    let foundCard: any = null
    let sourceColumn: any = null

    for (const col of board.value.columns) {
      const idx = col.cards?.findIndex((c: any) => c.id === cardId)
      if (idx !== -1 && idx !== undefined) {
        foundCard = col.cards[idx]
        sourceColumn = col
        col.cards.splice(idx, 1) // remover de la columna original
        break
      }
    }

    if (!foundCard || !sourceColumn) {
      return
    }

    // 3. Encontrar la columna de destino
    const targetColumn = board.value.columns.find((c: any) => c.id === newColumnId)
    if (!targetColumn) {
      board.value = originalBoard
      return
    }

    // 4. Actualizar propiedades locales de la tarjeta movida
    foundCard.kanban_column_id = newColumnId
    foundCard.position = newPosition
    foundCard.status = targetColumn.title // Sincronizar con el nombre de la columna para botones y estilos

    // 5. Insertar en la posición dropIndex de la columna destino
    if (!targetColumn.cards) {
      targetColumn.cards = []
    }
    targetColumn.cards.splice(dropIndex, 0, foundCard)

    // 6. Hacer la llamada a la API y manejar rollback si falla
    try {
      await api.post('/api/kanban/move-card', {
        card_id: cardId,
        new_column_id: newColumnId,
        new_position: newPosition
      })
      
      // Refrescar silenciosamente de fondo para asegurar sincronización con DB
      const response = await api.get('/api/kanban/board')
      board.value = response.data
    } catch (err: any) {
      // Revertir al estado original en caso de error
      board.value = originalBoard
      console.error('Error al mover tarjeta (rollback ejecutado):', err)
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

  async function updateOrder(id: number, orderData: any) {
    try {
      const response = await api.put(`/api/orders/${id}`, orderData)
      await fetchBoard() // Refrescar para ver la tarjeta actualizada
      return response.data
    } catch (err: any) {
      console.error('Error updating order', err)
      throw err
    }
  }

  return {
    board,
    loading,
    error,
    fetchBoard,
    moveCard,
    moveCardOptimistically,
    createOrder,
    updateOrder
  }
})

import type { Order } from './order';

export interface KanbanCard {
  id: number;
  kanban_column_id: number;
  order_id: number;
  position: number;
  order?: Order; 
  urgency_status?: 'normal' | 'urgent' | 'critical';
}

export interface KanbanColumn {
  id: number;
  kanban_board_id: number;
  name: string;
  color: string;
  position: number;
  cards: KanbanCard[];
}

export interface KanbanBoard {
  id: number;
  name: string;
  columns: KanbanColumn[];
}

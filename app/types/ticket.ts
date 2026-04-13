import type { Client } from './client';

export interface TicketDetail {
  id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  discount_percentage: number;
  total: number;
}

export interface Ticket {
  id: number;
  ticket_number: string;
  user: string | null;
  client_id: number;
  client?: Client;
  subtotal: number;
  discount_amount: number;
  total: number;
  received_amount: number;
  change_amount: number;
  payment_method: string;
  status: string;
  items: TicketDetail[];
  created_at: string;
}

import type { Client } from './client';

export interface OrderItem {
  id: number;
  order_id: number;
  product_name: string;
  color_name: string | null;
  hex_code: string | null;
  size: string | null;
  quantity: number;
  unit_price: number;
  observations: string | null;
  color?: { name: string; hex_code: string | null } | null;
  total?: number;
  extras?: { description: string; cost: number }[];
}

export interface Order {
  id: number;
  client_id: number;
  client?: Client;
  delivery_date: string;
  advance_payment: number;
  total_amount: number;
  notes: string | null;
  items: OrderItem[];
  created_at: string;
  order_code?: string;
  is_internal?: boolean;
  production_status?: string | null;
  is_liquidated?: boolean;
  remaining_amount?: number;
  order_date?: string;
}

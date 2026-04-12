import type { Category } from './category';
import type { Client } from './client';

export interface StockProduct {
  id: number;
  name: string;
  category_id: number;
  category?: Category;
  institution_id: number;
  institution?: Client;
  color: string;
  size: string;
  barcode: string | null;
  production_price: number;
  sale_price: number;
  discount_percentage: number;
  quantity: number;
  reserved_quantity: number;
  available_quantity: number;
  image_url?: string;
}

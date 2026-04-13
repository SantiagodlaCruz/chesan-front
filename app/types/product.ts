import type { Category } from './category';
import type { Client } from './client';
import type { Color, Size } from './color';

export interface StockProduct {
  id: number;
  name: string;
  category_id: number;
  category?: Category;
  institution_id: number;
  institution?: Client;
  color_id: number | null;
  color?: Color;
  size_id: number | null;
  size?: Size;
  barcode: string | null;
  production_price: number;
  sale_price: number;
  discount_percentage: number;
  quantity: number;
  reserved_quantity: number;
  available_quantity: number;
  image_url?: string;
}

import type { UnitMeasure, Color } from './color';

export interface RawMaterial {
  id: number;
  barcode?: string;
  name: string;
  image?: string;
  image_url?: string;
  unit_measure_id: number | null;
  unit_measure?: UnitMeasure;
  color_id: number | null;
  color?: Color;
  unit_price: number;
  quantity: number;
  min_threshold: number;
}

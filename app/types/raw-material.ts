import type { UnitMeasure } from './color';

export interface RawMaterial {
  id: number;
  barcode?: string;
  name: string;
  image?: string;
  image_url?: string;
  unit_measure_id: number | null;
  unit_measure?: UnitMeasure;
  unit_price: number;
  quantity: number;
  min_threshold: number;
}

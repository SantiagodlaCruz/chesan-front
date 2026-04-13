export interface RawMaterial {
  id: number;
  barcode?: string;
  name: string;
  image?: string;
  image_url?: string;
  unit_measure: string;
  unit_price: number;
  quantity: number;
  min_threshold: number;
}

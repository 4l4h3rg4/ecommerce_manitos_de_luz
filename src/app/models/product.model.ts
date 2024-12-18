export interface Product {
  id?: number;
  name: string;
  price: number;
  description?: string;
  stock: number;
  images: string[];  // Array de URLs de imágenes
  created_at?: Date;
} 
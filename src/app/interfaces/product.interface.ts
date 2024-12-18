export interface Product {
    id?: number;
    name: string;
    price: number;
    description?: string;
    stock: number;
    image_url?: string;
    created_at?: Date;
  }
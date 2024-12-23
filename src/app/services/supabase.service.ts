import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from 'src/environments/environment';
import { Product } from '../interfaces/product.interface';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;
  private productsSubject = new Subject<void>();
  private urlCache = new Map<string, string>();
  private storageUrl = 'https://lnhbnqacxsyqmlonfldv.supabase.co/storage/v1/object/public/products/';

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );
  }

  async getProducts(): Promise<Product[]> {
    const { data, error } = await this.supabase
      .from('products')
      .select('id, name, price, description, image_url, stock');

    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }

    // Construir la URL completa de las imágenes
    return data.map(product => ({
      ...product,
      image_url: this.storageUrl + product.image_url
    })) as Product[];
  }

  async getProductByName(name: string): Promise<Product> {
    const { data, error } = await this.supabase
      .from('products')
      .select('id, name, price, description, image_url, stock')
      .eq('name', name)
      .single();

    if (error) {
      console.error('Error al obtener el producto:', error);
      throw error;
    }

    // Construir la URL completa de la imagen
    return {
      ...data,
      image_url: this.storageUrl + data.image_url
    } as Product;
  }

  getProductImageUrl(fileName: string): string {
    if (!fileName) return 'assets/default-product.png';

    try {
      const justFileName = fileName.includes('/') 
        ? fileName.split('/').pop() 
        : fileName;

      if (!justFileName) return 'assets/default-product.png';

      if (this.urlCache.has(justFileName)) {
        return this.urlCache.get(justFileName)!;
      }

      const { data } = this.supabase.storage
        .from('products')
        .getPublicUrl(justFileName);

      console.log('Nombre del archivo:', justFileName);
      console.log('URL generada:', data.publicUrl);

      this.urlCache.set(justFileName, data.publicUrl);
      
      return data.publicUrl;
    } catch (error) {
      console.error('Error al obtener URL:', error);
      return 'assets/default-product.png';
    }
  }

  async uploadProductImage(file: File): Promise<string> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { error: uploadError } = await this.supabase.storage
        .from('products')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      return fileName;
    } catch (error) {
      console.error('Error al subir imagen:', error);
      throw error;
    }
  }

  async addProduct(product: Partial<Product>): Promise<void> {
    const { error } = await this.supabase
      .from('products')
      .insert([product]);

    if (error) throw error;
    this.productsSubject.next();
  }

  async updateProduct(id: number, product: Partial<Product>): Promise<void> {
    const { error } = await this.supabase
      .from('products')
      .update(product)
      .eq('id', id);

    if (error) throw error;
    this.productsSubject.next();
  }

  async deleteProduct(id: number): Promise<void> {
    const { error } = await this.supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
    this.productsSubject.next();
  }

  // Para autenticación
  async signIn(email: string, password: string) {
    return await this.supabase.auth.signInWithPassword({ email, password });
  }

  // Para obtener la sesión actual
  async getSession() {
    return await this.supabase.auth.getSession();
  }

  // Para obtener un producto específico
  async getProductById(id: string) {
    return await this.supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
  }

  // Para suscripción a cambios en tiempo real
  subscribeToProducts(callback: Function) {
    return this.supabase
      .channel('products')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, 
          (payload) => callback(payload))
      .subscribe();
  }

  // Para notificar cambios (usado con Subject)
  getProductsUpdates() {
    return this.productsSubject.asObservable();
  }

  getPublicUrl(path: string): string {
    if (!path) {
      console.log('No hay ruta de imagen, usando default');
      return 'assets/default-product.png';
    }
    
    const { data } = this.supabase
      .storage
      .from('products')
      .getPublicUrl(path);
    
    console.log('URL pública generada:', data.publicUrl);
    return data.publicUrl || 'assets/default-product.png';
  }

  async addProductWithImages(product: Product, imageUrls: string[]): Promise<void> {
    try {
      // Guardar el producto principal
      const { data: newProduct, error: productError } = await this.supabase
      .from('products')
      .insert([{ name: product.name, description: product.description, price: product.price }])
      .select()
      .single();

      if (newProduct) {
        const imagesData = imageUrls.map((url) => ({
          product_id: newProduct.id,
          image_url: url,
        }));
      }

      // Guardar las imágenes relacionadas
      const imagesData = imageUrls.map((url) => ({ product_id: newProduct.id, image_url: url }));
      const { error: imagesError } = await this.supabase
        .from('product_images')
        .insert(imagesData);
  
      if (imagesError) throw imagesError;
  
      console.log('Producto e imágenes guardados exitosamente.');
    } catch (error: any) {
      console.error('Error al guardar el producto:', error.message);
      throw error;
    }
  }
}
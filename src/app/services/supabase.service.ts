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

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );
  }

  async getProducts(): Promise<Product[]> {
    const { data, error } = await this.supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
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
} 
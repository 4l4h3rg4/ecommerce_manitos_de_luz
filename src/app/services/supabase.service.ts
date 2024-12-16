import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from 'src/environments/environment';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;
  private _user = new BehaviorSubject<any>(null);

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );
    
    // Escuchar cambios en la autenticación
    this.supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        this._user.next(session.user);
      } else {
        this._user.next(null);
      }
    });
  }

  // Autenticación
  async signIn(email: string, password: string) {
    return this.supabase.auth.signInWithPassword({ email, password });
  }

  async signOut() {
    return this.supabase.auth.signOut();
  }

  // Productos
  async getProducts() {
    return this.supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
  }

  async addProduct(product: any) {
    return this.supabase
      .from('products')
      .insert(product);
  }

  async updateProduct(id: number, updates: any) {
    return this.supabase
      .from('products')
      .update(updates)
      .match({ id });
  }

  async deleteProduct(id: number) {
    return this.supabase
      .from('products')
      .delete()
      .match({ id });
  }

  // Suscripción a cambios en productos
  subscribeToProducts(callback: (payload: any) => void) {
    return this.supabase
      .channel('products')
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'products' }, 
          callback)
      .subscribe();
  }

  async getProductById(id: number) {
    return this.supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
  }

  async uploadImage(file: File) {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;
  
      const { data, error } = await this.supabase.storage
        .from('products') // Asegúrate de que este bucket exista en Supabase
        .upload(filePath, file);
  
      if (error) throw error;
  
      // Obtener la URL pública de la imagen
      const { data: { publicUrl } } = this.supabase.storage
        .from('products')
        .getPublicUrl(filePath);
  
      return publicUrl;
    } catch (error) {
      console.error('Error al subir imagen:', error);
      throw error;
    }
  }
} 
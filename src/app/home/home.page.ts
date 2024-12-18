import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../services/supabase.service';
import { Product } from '../interfaces/product.interface';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  products: Product[] = [];

  constructor(private supabaseService: SupabaseService) {}

  async ngOnInit() {
    // Cargar productos
    this.products = await this.supabaseService.getProducts();

    // Suscribirse a cambios
    this.supabaseService.subscribeToProducts((_payload?: any) => {
      // Actualizar lista de productos cuando haya cambios
      this.loadProducts();
    });
  }

  async loadProducts() {
    try {
      this.products = await this.supabaseService.getProducts();
    } catch (error) {
      console.error('Error al cargar productos:', error);
    }
  }
} 
import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../services/supabase.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  products: any[] = [];

  constructor(private supabaseService: SupabaseService) {}

  async ngOnInit() {
    // Cargar productos
    const { data, error } = await this.supabaseService.getProducts();
    if (data) {
      this.products = data;
    }

    // Suscribirse a cambios
    this.supabaseService.subscribeToProducts((payload) => {
      // Actualizar lista de productos cuando haya cambios
      this.loadProducts();
    });
  }

  async loadProducts() {
    const { data } = await this.supabaseService.getProducts();
    if (data) {
      this.products = data;
    }
  }
} 
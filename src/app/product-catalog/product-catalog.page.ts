import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../services/supabase.service';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-product-catalog',
  templateUrl: './product-catalog.page.html',
  styleUrls: ['./product-catalog.page.scss'],
})
export class ProductCatalogPage implements OnInit {
  products: any[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private supabaseService: SupabaseService,
    private loadingCtrl: LoadingController
  ) { }

  async ngOnInit() {
    await this.loadProducts();
    
    // Suscribirse a cambios en tiempo real
    this.supabaseService.subscribeToProducts(() => {
      this.loadProducts();
    });
  }

  async loadProducts() {
    const loading = await this.loadingCtrl.create({
      message: 'Cargando productos...'
    });
    await loading.present();

    try {
      const { data, error } = await this.supabaseService.getProducts();
      if (error) throw error;
      this.products = data;
    } catch (error: any) {
      this.error = error.message;
    } finally {
      loading.dismiss();
    }
  }
}

import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../services/supabase.service';
import { Product } from '../interfaces/product.interface';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-product-catalog',
  templateUrl: './product-catalog.page.html',
  styleUrls: ['./product-catalog.page.scss'],
})
export class ProductCatalogPage implements OnInit {
  products: Product[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    public supabaseService: SupabaseService,
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
      this.products = await this.supabaseService.getProducts();
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      loading.dismiss();
    }
  }

  handleImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = 'assets/default-product.png';
    }
  }

  trackByFn(index: number, product: Product) {
    return product.id;
  }
}

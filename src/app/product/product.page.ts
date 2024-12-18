import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LoadingController, NavController } from '@ionic/angular';
import { SupabaseService } from '../services/supabase.service';
import { Product } from '../interfaces/product.interface';

@Component({
  selector: 'app-product',
  templateUrl: './product.page.html',
  styleUrls: ['./product.page.scss'],
})
export class ProductPage implements OnInit {
  product: Product | null = null;
  error: string | null = null;

  constructor(
    public supabaseService: SupabaseService,
    private route: ActivatedRoute,
    private loadingCtrl: LoadingController,
    private navCtrl: NavController
  ) { }

  async ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      await this.loadProduct(id);
    }
  }

  async loadProduct(id: number) {
    const loading = await this.loadingCtrl.create({
      message: 'Cargando producto...'
    });
    await loading.present();

    try {
      const { data, error } = await this.supabaseService.getProductById(id.toString());
      if (error) throw error;
      
      if (!data || data.length === 0) {
        this.error = 'Producto no encontrado';
        return;
      }
      
      this.product = data[0];
    } catch (error: any) {
      this.error = error.message;
    } finally {
      loading.dismiss();
    }
  }

  goBack() {
    this.navCtrl.back();
  }

  async buyProduct() {
    if (!this.product) return;
    // Aquí irá la integración con Mercado Pago
    console.log('Comprando producto:', this.product.id);
  }

  handleImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = 'assets/default-product.png';
    }
  }
}

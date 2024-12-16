import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LoadingController, NavController } from '@ionic/angular';
import { SupabaseService } from '../services/supabase.service';

@Component({
  selector: 'app-product',
  templateUrl: './product.page.html',
  styleUrls: ['./product.page.scss'],
})
export class ProductPage implements OnInit {
  product: any = null;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private supabaseService: SupabaseService,
    private loadingCtrl: LoadingController,
    private navCtrl: NavController
  ) { }

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      await this.loadProduct(parseInt(id));
    }
  }

  async loadProduct(id: number) {
    const loading = await this.loadingCtrl.create({
      message: 'Cargando producto...'
    });
    await loading.present();

    try {
      const { data, error } = await this.supabaseService.getProductById(id);
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
    // Aquí irá la integración con Mercado Pago
    console.log('Comprando producto:', this.product.id);
  }
}

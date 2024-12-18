import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoadingController, ToastController } from '@ionic/angular';
import { SupabaseService } from '../services/supabase.service';
import { Product } from '../interfaces/product.interface';

@Component({
  selector: 'app-administration',
  templateUrl: './administration.page.html',
  styleUrls: ['./administration.page.scss'],
})
export class AdministrationPage implements OnInit {
  products: Product[] = [];
  productForm: FormGroup;
  isEditing = false;
  editingProductId: number | null = null;
  selectedFile: File | null = null;
  previewImage: string | null = null;
  isUploading = false;

  constructor(
    public supabaseService: SupabaseService,
    private formBuilder: FormBuilder,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {
    this.productForm = this.formBuilder.group({
      name: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      description: [''],
      stock: [0, [Validators.required, Validators.min(0)]],
      image_url: ['']
    });
  }

  ngOnInit() {
    this.loadProducts();
    this.supabaseService.getProductsUpdates().subscribe(() => {
      this.loadProducts();
    });
  }

  async loadProducts() {
    try {
      this.products = await this.supabaseService.getProducts();
    } catch (error) {
      console.error('Error al cargar productos:', error);
      await this.showToast('Error al cargar productos', 'danger');
    }
  }

  async onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const maxSize = 2 * 1024 * 1024; // 2MB
      if (file.size > maxSize) {
        throw new Error('La imagen no debe superar los 2MB');
      }

      if (!file.type.startsWith('image/')) {
        throw new Error('El archivo debe ser una imagen');
      }

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewImage = e.target.result;
      };
      reader.readAsDataURL(file);

      this.selectedFile = file;
    } catch (error: any) {
      await this.showToast(error.message, 'danger');
      event.target.value = '';
      this.previewImage = null;
      this.selectedFile = null;
    }
  }

  async saveProduct() {
    if (!this.productForm.valid) {
      await this.showToast('Por favor, complete todos los campos requeridos', 'warning');
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: this.isEditing ? 'Actualizando...' : 'Guardando...'
    });
    await loading.present();

    try {
      this.isUploading = true;
      let imageUrl = this.productForm.get('image_url')?.value;

      if (this.selectedFile) {
        imageUrl = await this.supabaseService.uploadProductImage(this.selectedFile);
      }

      const productData = {
        ...this.productForm.value,
        image_url: imageUrl
      };

      if (this.isEditing && this.editingProductId) {
        await this.supabaseService.updateProduct(this.editingProductId, productData);
        await this.showToast('Producto actualizado correctamente');
      } else {
        await this.supabaseService.addProduct(productData);
        await this.showToast('Producto creado correctamente');
      }

      this.resetForm();
    } catch (error: any) {
      console.error('Error al guardar producto:', error);
      await this.showToast(error.message || 'Error al guardar el producto', 'danger');
    } finally {
      this.isUploading = false;
      loading.dismiss();
    }
  }

  handleImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = 'assets/default-product.png';
    }
  }

  resetForm() {
    this.isEditing = false;
    this.editingProductId = null;
    this.productForm.reset({ stock: 0 });
    this.selectedFile = null;
    this.previewImage = null;
  }

  private async showToast(message: string, color: string = 'success') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }

  onImageLoad(productName: string) {
    console.log('Imagen cargada:', productName);
  }

  editProduct(product: Product) {
    this.isEditing = true;
    this.editingProductId = product.id || null;
    this.productForm.patchValue({
      name: product.name,
      price: product.price,
      description: product.description || '',
      stock: product.stock,
      image_url: product.image_url || ''
    });
    if (product.image_url) {
      this.previewImage = this.supabaseService.getProductImageUrl(product.image_url);
    }
  }

  async deleteProduct(id: number) {
    try {
      await this.supabaseService.deleteProduct(id);
      await this.showToast('Producto eliminado correctamente');
    } catch (error: any) {
      await this.showToast(error.message || 'Error al eliminar el producto', 'danger');
    }
  }
}

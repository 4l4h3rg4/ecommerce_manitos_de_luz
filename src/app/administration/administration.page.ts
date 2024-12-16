import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoadingController, ToastController } from '@ionic/angular';
import { SupabaseService } from '../services/supabase.service';

@Component({
  selector: 'app-administration',
  templateUrl: './administration.page.html',
  styleUrls: ['./administration.page.scss'],
})
export class AdministrationPage implements OnInit {
  products: any[] = [];
  productForm: FormGroup;
  isEditing = false;
  editingProductId: number | null = null;
  previewImage: string | null = null;

  constructor(
    private supabaseService: SupabaseService,
    private formBuilder: FormBuilder,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {
    this.productForm = this.formBuilder.group({
      name: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      description: [''],
      image_url: [''],
      stock: [0, [Validators.required, Validators.min(0)]]
    });
  }

  async ngOnInit() {
    await this.loadProducts();
  }

  async loadProducts() {
    const { data } = await this.supabaseService.getProducts();
    if (data) {
      this.products = data;
    }
  }

  async saveProduct() {
    console.log('Datos del formulario:', this.productForm.value);
    const loading = await this.loadingCtrl.create({
      message: this.isEditing ? 'Actualizando...' : 'Guardando...'
    });
    await loading.present();

    try {
      if (this.isEditing && this.editingProductId) {
        await this.supabaseService.updateProduct(
          this.editingProductId,
          this.productForm.value
        );
      } else {
        await this.supabaseService.addProduct(this.productForm.value);
      }

      await this.showToast(
        this.isEditing ? 'Producto actualizado' : 'Producto agregado',
        'success'
      );
      this.resetForm();
      await this.loadProducts();
    } catch (error: any) {
      await this.showToast(error.message, 'danger');
    } finally {
      loading.dismiss();
    }
  }

  async deleteProduct(id: number) {
    const loading = await this.loadingCtrl.create({
      message: 'Eliminando...'
    });
    await loading.present();

    try {
      await this.supabaseService.deleteProduct(id);
      await this.showToast('Producto eliminado', 'success');
      await this.loadProducts();
    } catch (error: any) {
      await this.showToast(error.message, 'danger');
    } finally {
      loading.dismiss();
    }
  }

  editProduct(product: any) {
    this.isEditing = true;
    this.editingProductId = product.id;
    this.productForm.patchValue(product);
  }

  async onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      console.log('Archivo seleccionado:', file);
      const loading = await this.loadingCtrl.create({
        message: 'Subiendo imagen...'
      });
      await loading.present();

      try {
        // Crear preview
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.previewImage = e.target.result;
        };
        reader.readAsDataURL(file);

        // Subir imagen a Supabase
        const imageUrl = await this.supabaseService.uploadImage(file);
        this.productForm.patchValue({
          image_url: imageUrl
        });

        await this.showToast('Imagen subida correctamente', 'success');
      } catch (error: any) {
        await this.showToast('Error al subir la imagen', 'danger');
        console.error('Error:', error);
      } finally {
        loading.dismiss();
      }
    }
  }

  resetForm() {
    this.isEditing = false;
    this.editingProductId = null;
    this.productForm.reset({
      stock: 0
    });
    this.previewImage = null;
  }

  private async showToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }
}

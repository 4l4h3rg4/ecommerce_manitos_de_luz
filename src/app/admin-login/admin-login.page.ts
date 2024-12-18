import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.page.html',
  styleUrls: ['./admin-login.page.scss']
})
export class AdminLoginPage {
  loginForm: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;
  showPassword: boolean = false;

  constructor(
    private fb: FormBuilder,
    private supabaseService: SupabaseService,
    private router: Router,
    private toastController: ToastController
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  async onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      try {
        const { email, password } = this.loginForm.value;
        const { error } = await this.supabaseService.signIn(email, password);
        
        if (error) throw error;
        
        await this.presentToast('¡Inicio de sesión exitoso!', 'success');
        this.router.navigate(['/admin']);
      } catch (error: any) {
        this.errorMessage = 'Credenciales inválidas. Por favor, intente nuevamente.';
        await this.presentToast('Error al iniciar sesión', 'danger');
      } finally {
        this.isLoading = false;
      }
    }
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  async presentToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'top'
    });
    await toast.present();
  }
}

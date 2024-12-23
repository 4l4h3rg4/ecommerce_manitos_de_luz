import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { ProductDetailsComponent } from './product-details/product-details.component';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'product-catalog',
    loadChildren: () => import('./product-catalog/product-catalog.module').then( m => m.ProductCatalogPageModule)
  },
  {
    path: 'products/:productName',
    component: ProductDetailsComponent
  },
  {
    path: 'shopping-cart',
    loadChildren: () => import('./shopping-cart/shopping-cart.module').then( m => m.ShoppingCartPageModule)
  },
  {
    path: 'administration',
    loadChildren: () => import('./administration/administration.module').then( m => m.AdministrationPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'admin-login',
    loadChildren: () => import('./admin-login/admin-login.module').then( m => m.AdminLoginPageModule)
  },
  {
    path: 'admin',
    loadChildren: () => import('./administration/administration.module').then(m => m.AdministrationPageModule),
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

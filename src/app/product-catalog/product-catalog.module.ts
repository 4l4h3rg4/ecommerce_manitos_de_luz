import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProductCatalogPageRoutingModule } from './product-catalog-routing.module';

import { ProductCatalogPage } from './product-catalog.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProductCatalogPageRoutingModule
  ],
  declarations: [ProductCatalogPage]
})
export class ProductCatalogPageModule {}

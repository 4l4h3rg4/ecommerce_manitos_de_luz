import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AdministrationPageRoutingModule } from './administration-routing.module';

import { AdministrationPage } from './administration.page';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    AdministrationPageRoutingModule
  ],
  declarations: [AdministrationPage]
})
export class AdministrationPageModule {}

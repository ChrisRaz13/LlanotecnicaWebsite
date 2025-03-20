import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ProductSectionComponent } from './product-section.component';

const routes: Routes = [
  { path: '', component: ProductSectionComponent }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ]
})
export class ProductSectionModule { }

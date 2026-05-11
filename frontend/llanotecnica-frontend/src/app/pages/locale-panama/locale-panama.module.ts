import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LocalePanamaComponent } from './locale-panama.component';

const routes: Routes = [
  { path: '', component: LocalePanamaComponent }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ]
})
export class LocalePanamaModule { }

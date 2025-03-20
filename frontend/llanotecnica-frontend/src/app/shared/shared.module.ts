import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

// Import shared components from the components folder
import { BannerComponent } from '../components/banner/banner.component';
import { FooterComponent } from '../components/footer/footer.component';
import { NavbarComponent } from '../components/navbar/navbar.component';

@NgModule({
  declarations: [
    BannerComponent,
    FooterComponent,
    NavbarComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule
  ],
  exports: [
    // Export components to make them available to importing modules
    BannerComponent,
    FooterComponent,
    NavbarComponent,
    // Export common modules that are frequently used
    CommonModule,
    RouterModule,
    TranslateModule
  ]
})
export class SharedModule { }

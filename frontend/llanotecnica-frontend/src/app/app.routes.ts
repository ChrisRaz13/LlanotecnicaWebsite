import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { AboutUsComponent } from './pages/about-us/about-us.component';
import { ProductSectionComponent } from './pages/product-section/product-section.component';
import { ContactComponent } from './pages/contact/contact.component';
import { provideRouter, withViewTransitions, withInMemoryScrolling } from '@angular/router';
import { ApplicationConfig } from '@angular/core';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'about-us', component: AboutUsComponent },
  { path: 'products', component: ProductSectionComponent },
  { path: 'contact', component: ContactComponent },
];

export const appRouting: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withViewTransitions(),
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'enabled'
      })
    )
  ]
};

import { Routes, ResolveFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { PLATFORM_ID, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { isPlatformBrowser } from '@angular/common';
import { SitemapService } from './services/sitemap.service';
import { Component, OnInit, Inject, PLATFORM_ID as PLATFORM_ID_TOKEN } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Response } from 'express';

// Sitemap component for serving XML
@Component({
  template: '',
  standalone: true
})
export class SitemapComponent implements OnInit {
  constructor(
    private sitemapService: SitemapService,
    @Inject(PLATFORM_ID_TOKEN) private platformId: Object,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // For client-side, redirect to server-rendered sitemap
      window.location.href = '/sitemap.xml';
    } else {
      // Server-side rendering
      const sitemap = this.sitemapService.generateSitemap();

      // Set proper content type for XML
      if (typeof window === 'undefined' && typeof global !== 'undefined') {
        // Server-side: try to access response object
        try {
          const response = (global as any).res as Response;
          if (response) {
            response.setHeader('Content-Type', 'application/xml; charset=utf-8');
            response.send(sitemap);
            return;
          }
        } catch (error) {
          console.log('Could not access response object:', error);
        }
      }

      // Fallback: write to document
      this.document.open();
      this.document.write(sitemap);
      this.document.close();
    }
  }
}



export const languageResolver: ResolveFn<string> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): string => {
  const translate = inject(TranslateService);
  const platformId = inject(PLATFORM_ID);

  // If the URL already starts with a language prefix, use it.
  if (state.url.startsWith('/en') || state.url.startsWith('/es')) {
    const lang = state.url.startsWith('/es') ? 'es' : 'en';
    translate.use(lang);
    if (isPlatformBrowser(platformId)) {
      try {
        localStorage.setItem('preferredLanguage', lang);
      } catch (error) {
        console.error('Error setting localStorage:', error);
      }
    }
    return lang;
  }

  // Otherwise, try to read from localStorage (if available)
  if (isPlatformBrowser(platformId)) {
    try {
      const storedLang = localStorage.getItem('preferredLanguage');
      if (storedLang === 'en' || storedLang === 'es') {
        translate.use(storedLang);
        return storedLang;
      }
    } catch (error) {
      console.error('Error accessing localStorage:', error);
    }
  }

  translate.use('en');
  return 'en';
};

export const routes: Routes = [
  // Default route - load home page directly in English
  {
    path: '',
    loadChildren: () => import('./pages/home/home.module').then(m => m.HomeModule),
    data: { language: 'en' },
    pathMatch: 'full'
  },

  // English routes with lazy loading
  {
    path: 'en',
    loadChildren: () => import('./pages/home/home.module').then(m => m.HomeModule),
    data: { language: 'en' }
  },
  {
    path: 'en/about-us',
    loadChildren: () => import('./pages/about-us/about-us.module').then(m => m.AboutUsModule),
    data: { language: 'en' }
  },
  {
    path: 'en/products',
    loadChildren: () => import('./pages/product-section/product-section.module').then(m => m.ProductSectionModule),
    data: { language: 'en' }
  },
  {
    path: 'en/contact',
    loadChildren: () => import('./pages/contact/contact.module').then(m => m.ContactModule),
    data: { language: 'en' }
  },

  // Spanish routes with lazy loading
  {
    path: 'es',
    loadChildren: () => import('./pages/home/home.module').then(m => m.HomeModule),
    data: { language: 'es' }
  },
  {
    path: 'es/sobre-nosotros',
    loadChildren: () => import('./pages/about-us/about-us.module').then(m => m.AboutUsModule),
    data: { language: 'es' }
  },
  {
    path: 'es/productos',
    loadChildren: () => import('./pages/product-section/product-section.module').then(m => m.ProductSectionModule),
    data: { language: 'es' }
  },
  {
    path: 'es/contacto',
    loadChildren: () => import('./pages/contact/contact.module').then(m => m.ContactModule),
    data: { language: 'es' }
  },

  // 301 Redirects for removed language-agnostic routes
  // These ensure clean SEO signals and preserve any existing external links
  {
    path: 'about-us',
    redirectTo: '/en/about-us',
    pathMatch: 'full'
  },
  {
    path: 'products',
    redirectTo: '/en/products',
    pathMatch: 'full'
  },
  {
    path: 'contact',
    redirectTo: '/en/contact',
    pathMatch: 'full'
  },
  {
    path: 'sobre-nosotros',
    redirectTo: '/es/sobre-nosotros',
    pathMatch: 'full'
  },
  {
    path: 'productos',
    redirectTo: '/es/productos',
    pathMatch: 'full'
  },
  {
    path: 'contacto',
    redirectTo: '/es/contacto',
    pathMatch: 'full'
  },

  // Sitemap route
  {
    path: 'sitemap.xml',
    component: SitemapComponent
  },

  // Catch-all route: redirect to home page
  {
    path: '**',
    redirectTo: ''
  }
];


export function initializeLanguage(translateService: TranslateService, platformId: Object) {
  return () => {
    translateService.addLangs(['en', 'es']);
    translateService.setDefaultLang('en');

    if (isPlatformBrowser(platformId)) {
      try {
        const storedLang = localStorage.getItem('preferredLanguage');
        if (storedLang === 'en' || storedLang === 'es') {
          translateService.use(storedLang);
        } else {
          const browserLang = navigator.language || '';
          const langCode = browserLang.split('-')[0].toLowerCase();
          const useLang = langCode === 'es' ? 'es' : 'en';
          translateService.use(useLang);
          localStorage.setItem('preferredLanguage', useLang);
        }
      } catch (error) {
        console.error('Error initializing language:', error);
        translateService.use('en');
      }
    } else {
      translateService.use('en');
    }
  };
}

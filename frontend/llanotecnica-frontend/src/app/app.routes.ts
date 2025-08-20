import { Routes, ResolveFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { PLATFORM_ID, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { isPlatformBrowser } from '@angular/common';



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

  // Direct route access with language resolver and lazy loading
  {
    path: 'about-us',
    loadChildren: () => import('./pages/about-us/about-us.module').then(m => m.AboutUsModule),
    resolve: { language: languageResolver }
  },
  {
    path: 'products',
    loadChildren: () => import('./pages/product-section/product-section.module').then(m => m.ProductSectionModule),
    resolve: { language: languageResolver }
  },
  {
    path: 'contact',
    loadChildren: () => import('./pages/contact/contact.module').then(m => m.ContactModule),
    resolve: { language: languageResolver }
  },
  {
    path: 'sobre-nosotros',
    loadChildren: () => import('./pages/about-us/about-us.module').then(m => m.AboutUsModule),
    resolve: { language: languageResolver }
  },
  {
    path: 'productos',
    loadChildren: () => import('./pages/product-section/product-section.module').then(m => m.ProductSectionModule),
    resolve: { language: languageResolver }
  },
  {
    path: 'contacto',
    loadChildren: () => import('./pages/contact/contact.module').then(m => m.ContactModule),
    resolve: { language: languageResolver }
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

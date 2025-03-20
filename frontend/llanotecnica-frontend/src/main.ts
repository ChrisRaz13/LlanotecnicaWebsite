import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideRouter, withViewTransitions, withInMemoryScrolling, withPreloading, PreloadAllModules } from '@angular/router';
import { routes } from './app/app.routes';
import { APP_INITIALIZER, importProvidersFrom } from '@angular/core';

// Firebase imports
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideStorage, getStorage } from '@angular/fire/storage';
import { firebaseConfig } from './app/firebase.config';

// Translation imports
import { TranslateLoader, TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';

// SEO service
import { SeoLanguageService } from './app/services/language-selector/seo-language.service';

// ✅ Function to load translations
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

// ✅ Function to initialize language settings
export function initializeLanguageSettings(translateService: TranslateService, seoService: SeoLanguageService) {
  return () => {
    translateService.addLangs(['en', 'es']);
    translateService.setDefaultLang('en');

    try {
      const storedLang = localStorage.getItem('preferredLanguage');
      if (storedLang && ['en', 'es'].includes(storedLang)) {
        translateService.use(storedLang);
      } else {
        const browserLang = navigator.language.startsWith('es') ? 'es' : 'en';
        translateService.use(browserLang);
        localStorage.setItem('preferredLanguage', browserLang);
      }
    } catch (error) {
      console.error('Error handling language detection:', error);
      translateService.use('en');
    }

    seoService.initialize();
    return Promise.resolve();
  };
}

bootstrapApplication(AppComponent, {
  providers: [
    provideAnimations(),
    provideHttpClient(withFetch()),

    provideRouter(
      routes,
      withViewTransitions(),
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'enabled',
      }),
      withPreloading(PreloadAllModules)
    ),

    // ✅ Firebase services
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth()),
    provideStorage(() => getStorage()),

    // ✅ Translation service setup
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient],
        },
        defaultLanguage: 'en',
        useDefaultLang: true,
        isolate: false,
      })
    ),

    // ✅ Ensuring TranslateStore is explicitly provided
    TranslateStore,
    TranslateService,

    {
      provide: APP_INITIALIZER,
      useFactory: initializeLanguageSettings,
      deps: [TranslateService, SeoLanguageService],
      multi: true,
    },
  ],
}).catch(err => console.error('Error bootstrapping the application:', err));

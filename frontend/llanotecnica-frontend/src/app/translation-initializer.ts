import { APP_INITIALIZER, Provider, PLATFORM_ID, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { isPlatformBrowser } from '@angular/common';
import { firstValueFrom } from 'rxjs';

/**
 * Initialize translations with proper error handling
 */
export function initializeTranslation(translate: TranslateService, platformId: Object): () => Promise<any> {
  return async () => {
    console.log('Initializing translations...');

    try {
      // Set available languages
      translate.addLangs(['en', 'es']);
      translate.setDefaultLang('en');

      // Try to get from localStorage in browser environment
      let savedLang: string | null = null;

      if (isPlatformBrowser(platformId)) {
        try {
          savedLang = localStorage.getItem('preferredLanguage');
        } catch (e) {
          console.error('Error accessing localStorage:', e);
        }
      }

      if (savedLang && ['en', 'es'].includes(savedLang)) {
        console.log(`Using saved language: ${savedLang}`);
        // Use firstValueFrom instead of deprecated toPromise
        await firstValueFrom(translate.use(savedLang));
      } else {
        // Default to English
        console.log('No saved language preference, using default (en)');
        await firstValueFrom(translate.use('en'));
      }

      console.log('✓ Translation initialization complete');
      return true;
    } catch (error) {
      console.error('Translation initialization had an error, but app will continue:', error);
      // Don't throw - always return a resolved promise to allow app to continue
      return Promise.resolve(true);
    }
  };
}

/**
 * App initializer providers for translation setup
 */
export const TRANSLATION_PROVIDERS: Provider[] = [
  {
    provide: APP_INITIALIZER,
    useFactory: () => {
      const translate = inject(TranslateService);
      const platformId = inject(PLATFORM_ID);
      return initializeTranslation(translate, platformId);
    },
    multi: true
  }
];

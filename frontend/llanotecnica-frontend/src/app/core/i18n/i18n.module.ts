import { NgModule, ModuleWithProviders, APP_INITIALIZER, Optional } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { TranslateUniversalLoader } from './translate-universal-loader';
import { INITIAL_LANGUAGE, SUPPORTED_LANGUAGES } from './i18n-tokens';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

/**
 * Factory function to create the universal translate loader
 */
export function createTranslateLoader(http: HttpClient, platformId: Object): TranslateLoader {
  return new TranslateUniversalLoader(http, platformId);
}

/**
 * Factory function to initialize the translation service
 */
export function initTranslateFactory(
  translate: TranslateService,
  platformId: Object,
  initialLanguage?: string
): () => Promise<void> {
  return async () => {
    // Configure available languages - create a mutable copy of the array
    const supportedLanguages = [...SUPPORTED_LANGUAGES];
    translate.addLangs(supportedLanguages);
    translate.setDefaultLang('en');

    let langToUse = 'en';

    // Determine which language to use
    if (initialLanguage && SUPPORTED_LANGUAGES.includes(initialLanguage as any)) {
      // Use language provided by server
      console.log(`Using server-provided language: ${initialLanguage}`);
      langToUse = initialLanguage;
    } else if (isPlatformBrowser(platformId)) {
      // In browser: check localStorage and URL
      try {
        // Check URL first
        const path = window.location.pathname;
        if (path.startsWith('/es')) {
          langToUse = 'es';
        } else if (path.startsWith('/en')) {
          langToUse = 'en';
        } else {
          // Then check localStorage
          const storedLang = localStorage.getItem('preferredLanguage');
          if (storedLang && SUPPORTED_LANGUAGES.includes(storedLang as any)) {
            langToUse = storedLang;
          } else {
            // Finally, check browser language
            const browserLang = navigator.language?.split('-')[0];
            if (browserLang === 'es') {
              langToUse = 'es';
            }
          }
        }
      } catch (error) {
        console.error('Error determining language:', error);
      }
    }

    // Apply the selected language
    console.log(`Setting application language to: ${langToUse}`);
    try {
      if (translate.use) {
        if (translate.use(langToUse).toPromise) {
          await translate.use(langToUse).toPromise();
        } else {
          // Handle newer RxJS versions where toPromise is deprecated
          await new Promise<void>(resolve => {
            translate.use(langToUse).subscribe(() => resolve());
          });
        }
      }
    } catch (error) {
      console.error('Error setting language:', error);
    }
  };
}

@NgModule({
  imports: [
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient, PLATFORM_ID]
      },
      defaultLanguage: 'en',
      isolate: false
    })
  ],
  exports: [TranslateModule]
})
export class I18nModule {
  /**
   * Create module with custom providers for root application
   */
  static forRoot(initialLanguage?: string): ModuleWithProviders<I18nModule> {
    return {
      ngModule: I18nModule,
      providers: [
        // Optional initial language from server
        ...(initialLanguage ? [{ provide: INITIAL_LANGUAGE, useValue: initialLanguage }] : []),

        // App initializer for translations
        {
          provide: APP_INITIALIZER,
          useFactory: initTranslateFactory,
          deps: [
            TranslateService,
            PLATFORM_ID,
            [new Optional(), INITIAL_LANGUAGE]
          ],
          multi: true
        }
      ]
    };
  }
}

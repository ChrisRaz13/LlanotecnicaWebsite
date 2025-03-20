import { mergeApplicationConfig, ApplicationConfig, APP_INITIALIZER } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { appConfig } from './app.config';
import { INITIAL_LANGUAGE } from './core/i18n/injection-tokens';
import { TranslateService } from '@ngx-translate/core';

/**
 * Server-side translation provider factory function
 */
export function serverLanguageInitializer(translate: TranslateService) {
  return () => {
    // Set available languages
    translate.addLangs(['en', 'es']);
    translate.setDefaultLang('en');

    // Default to English, but the INITIAL_LANGUAGE provider will override this
    translate.use('en');

    // Force translations to load synchronously for SSR
    return translate.get('HOME_PAGE.SEO.TITLE').toPromise();
  };
}

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),

    // Basic language initialization
    {
      provide: APP_INITIALIZER,
      useFactory: serverLanguageInitializer,
      deps: [TranslateService],
      multi: true
    }
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);

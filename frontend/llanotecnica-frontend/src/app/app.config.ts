import { ApplicationConfig, importProvidersFrom, PLATFORM_ID } from '@angular/core';
import { provideRouter, withViewTransitions, withInMemoryScrolling, withPreloading } from '@angular/router';
import { SelectivePreloadingStrategy } from './core/selective-preloading-strategy';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideClientHydration, withHttpTransferCacheOptions, withIncrementalHydration } from '@angular/platform-browser';
import { provideHttpClient, withFetch, HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { of } from 'rxjs';
import { TranslateModule, TranslateLoader, TranslateStore, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { IMAGE_CONFIG } from '@angular/common';

import { routes } from './app.routes';
import { environment } from '../environments/environment.prod';
import { TRANSLATION_PROVIDERS } from './translation-initializer';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, '/assets/i18n/', '.json');
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withViewTransitions(),
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'enabled',
      }),
      withPreloading(SelectivePreloadingStrategy)
    ),
    provideAnimations(),
    // Hydrate the prerendered HTML in place instead of destroying + rebuilding
    // the DOM on bootstrap. Without this, every prerendered route paints the
    // SSR HTML, then the entire app re-renders on hydration — that's the
    // ~1.0 viewport CLS we were seeing on the footer.
    //
    // `withIncrementalHydration()` lets `@defer (hydrate on viewport)` blocks
    // stay dehydrated (HTML rendered, JS not executed) until they enter the
    // viewport. Currently used to defer the footer + WhatsApp widget on every
    // route — both render below the fold, both pull JS that doesn't need to
    // run before the user scrolls there.
    //
    // Note: incremental hydration enables event replay automatically.
    provideClientHydration(
      withIncrementalHydration(),
      withHttpTransferCacheOptions({
        // Replay any HTTP responses captured during SSR (e.g. translation
        // JSON when the server-side translate loader uses HTTP) on the
        // client, eliminating the post-hydration re-fetch flash.
        includeHeaders: [],
        filter: () => true,
      }),
    ),
    // Use fetch instead of XHR — required for the HTTP transfer cache to work
    // and faster on Node 20+ during prerender.
    provideHttpClient(withFetch()),

    TranslateStore,
    TranslateService,

    {
      provide: IMAGE_CONFIG,
      useValue: {
        disableImageSizeWarning: true,
        disableImageLazyLoadWarning: true,
        breakpoints: [768, 1024, 1440],
      },
    },
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: createTranslateLoader,
          deps: [HttpClient],
        },
        defaultLanguage: 'en',
        useDefaultLang: true,
        isolate: false,
      })
    ),
    ...TRANSLATION_PROVIDERS,
  ],
};

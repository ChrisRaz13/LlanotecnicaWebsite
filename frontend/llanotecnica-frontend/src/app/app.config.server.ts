import { provideServerRendering } from '@angular/ssr';
import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { TranslateLoader } from '@ngx-translate/core';
import { appConfig } from './app.config';
import { serverTranslateLoaderFactory } from './server-translate-loader';

/**
 * Server-side overrides for SSR/prerender:
 *   - Enables Angular server rendering
 *   - Swaps the browser animations module for the noop one (the BrowserAnimations
 *     module needs DOM APIs unavailable during prerender)
 *   - Replaces the HTTP-based ngx-translate loader with a filesystem-based
 *     loader so prerender (Node, no HTTP server) can resolve translation JSON.
 */
const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    provideNoopAnimations(),
    {
      provide: TranslateLoader,
      useFactory: serverTranslateLoaderFactory,
    },
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);

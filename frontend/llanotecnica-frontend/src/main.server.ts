import { mergeApplicationConfig } from '@angular/core';
import { APP_BASE_HREF } from '@angular/common';
import { bootstrapApplication, BootstrapContext } from '@angular/platform-browser';

import { config as serverAppConfig } from './app/app.config.server';
import { AppComponent } from './app/app.component';
import { INITIAL_LANGUAGE } from './app/core/i18n/injection-tokens';

const detectLanguageFromUrl = (url: string): string => {
  if (url.startsWith('/es/') || url === '/es') return 'es';
  const spanishPaths = ['/sobre-nosotros', '/productos', '/contacto'];
  if (spanishPaths.some((p) => url === p || url.startsWith(p))) return 'es';
  return 'en';
};

const bootstrap = (context: BootstrapContext) => {
  // The SSR harness exposes the request URL on the context so we can pre-pick
  // the correct locale before bootstrap.
  const url = (context as { url?: string })?.url ?? '/';
  const lang = detectLanguageFromUrl(url);

  return bootstrapApplication(
    AppComponent,
    mergeApplicationConfig(serverAppConfig, {
      providers: [
        { provide: APP_BASE_HREF, useValue: '/' },
        { provide: INITIAL_LANGUAGE, useValue: lang },
      ],
    }),
    context,
  );
};

export default bootstrap;

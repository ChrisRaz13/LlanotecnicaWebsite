import { renderApplication } from '@angular/platform-server';
import { APP_BASE_HREF } from '@angular/common';
import { INITIAL_LANGUAGE } from './app/core/i18n/injection-tokens';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { bootstrapApplication } from '@angular/platform-browser';

const detectLanguageFromUrl = (url: string): string => {
  if (url.startsWith('/es/') || url === '/es') {
    return 'es';
  }
  const spanishPaths = ['/sobre-nosotros', '/productos', '/contacto'];
  if (spanishPaths.some(path => url === path || url.startsWith(path))) {
    return 'es';
  }
  return 'en';
};

export default async function bootstrap({
  // Fallback document now includes <app-root>
  document = '<!DOCTYPE html><html lang="en"><head></head><body><app-root></app-root></body></html>',
  url = '/',
  providers = [],
} = {}): Promise<string> {
  const lang = detectLanguageFromUrl(url);
  const documentWithLang = document.replace(
    /<html lang=".*?">/,
    `<html lang="${lang}">`
  );

  return renderApplication(() =>
    bootstrapApplication(AppComponent, {
      ...appConfig,
      providers: [
        { provide: APP_BASE_HREF, useValue: '/' },
        { provide: INITIAL_LANGUAGE, useValue: lang },
        ...providers,
      ],
    }),
    {
      document: documentWithLang,
      url,
    }
  );
}

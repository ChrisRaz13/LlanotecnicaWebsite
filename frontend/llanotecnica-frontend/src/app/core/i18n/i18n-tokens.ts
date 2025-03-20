import { InjectionToken } from '@angular/core';

// Token for translation file path configuration
export const TRANSLATION_FILE_PATH = new InjectionToken<string>('TRANSLATION_FILE_PATH', {
  factory: () => 'assets/i18n'
});

// Supported languages
export const SUPPORTED_LANGUAGES = ['en', 'es'] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

// Token for passing the initial language from server to app
export const INITIAL_LANGUAGE = new InjectionToken<string>('INITIAL_LANGUAGE');

// Route path mapping for different languages
export interface RoutePathMapping {
  [routeKey: string]: string;
}

// Route mappings for different languages
export const ROUTE_MAPPINGS: Record<SupportedLanguage, RoutePathMapping> = {
  'en': {
    'about-us': 'about-us',
    'products': 'products',
    'contact': 'contact'
  },
  'es': {
    'about-us': 'sobre-nosotros',
    'products': 'productos',
    'contact': 'contacto'
  }
};

// Reverse mapping to find base routes
export const REVERSE_ROUTE_MAPPINGS: Record<string, string> = {
  // English routes map to themselves
  'about-us': 'about-us',
  'products': 'products',
  'contact': 'contact',
  // Spanish translations map to English base routes
  'sobre-nosotros': 'about-us',
  'productos': 'products',
  'contacto': 'contact'
};

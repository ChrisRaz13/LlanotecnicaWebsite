import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LanguageRouteService {
  // Define the type with index signature to avoid TypeScript errors
  private routeTranslations: { [key: string]: string } = {
    'about-us': 'sobre-nosotros',
    'products': 'productos',
    'contact': 'contacto'
  };

  private previousLanguage: string = '';

  constructor(
    private router: Router,
    private translate: TranslateService
  ) {
    // Listen for language changes and update URL if needed
    this.translate.onLangChange.subscribe(event => {
      const currentUrl = this.router.url;
      const currentLang = event.lang;

      // Only update route if language actually changed
      if (this.previousLanguage && this.previousLanguage !== currentLang) {
        this.updateRouteForLanguage(currentUrl, currentLang);
      }

      this.previousLanguage = currentLang;
    });

    // Listen for route changes to sync language
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.syncLanguageWithRoute(event.url);
    });
  }

  /**
   * Navigate to a route in the current language
   */
  navigateTo(route: string): void {
    const currentLang = this.translate.currentLang || 'en';
    const localizedRoute = this.getLocalizedRoute(route, currentLang);

    this.router.navigate([localizedRoute]);
  }

  /**
   * Get URL for the current page in the specified language
   */
  getUrlInLanguage(language: string): string {
    return this.updateRouteForLanguage(this.router.url, language, false);
  }

  /**
   * Update current route for a different language
   */
  private updateRouteForLanguage(url: string, language: string, navigate: boolean = true): string {
    // Skip empty URLs
    if (!url) return '';

    // Handle root path
    if (url === '/' || url === '/en' || url === '/es') {
      const newUrl = '/' + language;
      if (navigate) {
        this.router.navigate([newUrl]);
      }
      return newUrl;
    }

    // Parse current URL
    const segments = url.split('/').filter(segment => segment);
    const currentLang = segments[0];

    // Check if first segment is a language code
    if (currentLang === 'en' || currentLang === 'es') {
      // Get the rest of the path without the language
      let path = segments.slice(1);

      // Translate path components if needed
      if (currentLang !== language) {
        path = path.map(segment => {
          // If changing from English to Spanish
          if (currentLang === 'en' && language === 'es') {
            // Check if the segment exists in our translations
            return this.routeTranslations[segment] || segment;
          }

          // If changing from Spanish to English
          if (currentLang === 'es' && language === 'en') {
            // Find the English equivalent for the Spanish path
            const englishPath = Object.entries(this.routeTranslations)
              .find(([_, esPath]) => esPath === segment)?.[0];

            return englishPath || segment;
          }

          return segment;
        });
      }

      // Construct the new URL
      const newUrl = '/' + language + (path.length ? '/' + path.join('/') : '');

      // Navigate if requested
      if (navigate) {
        this.router.navigate([newUrl]);
      }

      return newUrl;
    }

    // If no language in URL, just add the language prefix
    const newUrl = '/' + language + url;
    if (navigate) {
      this.router.navigate([newUrl]);
    }

    return newUrl;
  }

  /**
   * Get the localized version of a route
   */
  getLocalizedRoute(route: string, language: string): string {
    if (language === 'es') {
      // Check if this route has a translation
      const translatedRoute = this.routeTranslations[route];
      return '/es/' + (translatedRoute || route);
    }
    return '/en/' + route;
  }

  /**
   * Ensure language setting matches current route
   */
  private syncLanguageWithRoute(url: string): void {
    const segments = url.split('/').filter(segment => segment);

    if (segments.length > 0) {
      const firstSegment = segments[0];

      if (firstSegment === 'en' || firstSegment === 'es') {
        // Only update language if it doesn't match the URL
        if (this.translate.currentLang !== firstSegment) {
          this.translate.use(firstSegment);
          localStorage.setItem('preferredLanguage', firstSegment);
        }
      }
    }
  }
}

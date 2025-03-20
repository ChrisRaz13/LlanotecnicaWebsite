import { Injectable, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject, firstValueFrom } from 'rxjs';

interface RouteMetadata {
  title: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class SeoLanguageService implements OnDestroy {
  private destroyed$ = new Subject<void>();

  // Map of routes to their respective translation keys
  private routeMappings: Record<string, Record<string, string>> = {
    'en': {
      '': '/',
      'about-us': '/about-us',
      'products': '/products',
      'contact': '/contact'
    },
    'es': {
      '': '/',
      'about-us': '/sobre-nosotros',
      'products': '/productos',
      'contact': '/contacto'
    }
  };

  // Map for reverse lookup: path segments to base route keys
  private pathToRouteKeyMap: Record<string, string> = {
    // English paths
    'about-us': 'about-us',
    'products': 'products',
    'contact': 'contact',
    // Spanish paths
    'sobre-nosotros': 'about-us',
    'productos': 'products',
    'contacto': 'contact'
  };

  // Map of route keys to their metadata translation keys
  private metadataKeysMap: Record<string, RouteMetadata> = {
    '': {
      title: 'HOME_PAGE.SEO.TITLE',
      description: 'HOME_PAGE.SEO.DESCRIPTION'
    },
    'about-us': {
      title: 'ABOUT_US_PAGE.SEO.TITLE',
      description: 'ABOUT_US_PAGE.SEO.DESCRIPTION'
    },
    'products': {
      title: 'HOME_PAGE.SEO.TITLE', // Update if you have products page SEO
      description: 'HOME_PAGE.SEO.DESCRIPTION' // Update if you have products page SEO
    },
    'contact': {
      title: 'HOME_PAGE.SEO.TITLE', // Update if you have contact page SEO
      description: 'HOME_PAGE.SEO.DESCRIPTION' // Update if you have contact page SEO
    }
  };

  constructor(
    private router: Router,
    private translate: TranslateService,
    private titleService: Title,
    private metaService: Meta,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  initialize(): void {
    // Set up navigation end listener
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroyed$)
    ).subscribe(() => {
      this.updateLanguageMetadata();
    });

    // Listen for language changes
    this.translate.onLangChange.pipe(
      takeUntil(this.destroyed$)
    ).subscribe(() => {
      this.updateLanguageMetadata();
    });

    // Set initial metadata
    this.updateLanguageMetadata();
  }

  ngOnDestroy(): void {
    // Clean up subscriptions
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  private async updateLanguageMetadata(): Promise<void> {
    const currentLang = this.translate.currentLang || 'en';
    const currentUrl = this.router.url;

    // Set HTML lang attribute
    if (isPlatformBrowser(this.platformId)) {
      this.document.documentElement.lang = currentLang;
    }

    // Get route key from current URL
    const routeKey = this.getRouteKeyFromUrl(currentUrl);

    // Update metadata based on route key
    await this.updatePageMetadata(routeKey, currentLang);

    // Add hreflang links
    this.addHreflangLinks(currentUrl, currentLang);
  }

  private getRouteKeyFromUrl(url: string): string {
    // Default to home page
    let routeKey = '';

    // Extract path segment (ignore language prefix)
    const segments = url.split('/').filter(s => s);

    // Skip if there's only language segment or no segments
    if (segments.length <= 1) {
      return routeKey;
    }

    // Second segment is the path after language
    const pathSegment = segments[1];

    // Look up the route key from path segment
    if (pathSegment in this.pathToRouteKeyMap) {
      routeKey = this.pathToRouteKeyMap[pathSegment];
    }

    return routeKey;
  }

  private async updatePageMetadata(routeKey: string, lang: string): Promise<void> {
    // Get metadata keys for the route
    const metadataKeys = this.metadataKeysMap[routeKey] || this.metadataKeysMap[''];

    try {
      // Update title
      const title = await firstValueFrom(this.translate.get(metadataKeys.title));
      this.titleService.setTitle(title);

      // Update meta description
      const description = await firstValueFrom(this.translate.get(metadataKeys.description));
      this.metaService.updateTag({ name: 'description', content: description });

      // Update OpenGraph tags
      this.metaService.updateTag({ property: 'og:title', content: title });
      this.metaService.updateTag({ property: 'og:description', content: description });
      this.metaService.updateTag({ property: 'og:locale', content: lang === 'es' ? 'es_ES' : 'en_US' });

      // Update Twitter cards
      this.metaService.updateTag({ name: 'twitter:title', content: title });
      this.metaService.updateTag({ name: 'twitter:description', content: description });

      // Set canonical link
      this.updateCanonicalLink(routeKey, lang);
    } catch (error) {
      console.error('Error updating page metadata:', error);
    }
  }

  private updateCanonicalLink(routeKey: string, lang: string): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Remove existing canonical link if any
    const existingCanonical = this.document.querySelector('link[rel="canonical"]');
    if (existingCanonical) {
      existingCanonical.parentNode?.removeChild(existingCanonical);
    }

    // Create new canonical link
    const canonicalUrl = this.buildFullUrl(routeKey, lang);
    const link = this.document.createElement('link');
    link.rel = 'canonical';
    link.href = canonicalUrl;
    this.document.head.appendChild(link);
  }

  private addHreflangLinks(url: string, currentLang: string): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Remove any existing hreflang links
    const existingLinks = this.document.querySelectorAll('link[rel="alternate"][hreflang]');
    existingLinks.forEach(link => link.parentNode?.removeChild(link));

    // Base URL (e.g., "https://llanotecnica.com")
    const baseUrl = this.document.location.origin;

    // Get route key from current URL
    const routeKey = this.getRouteKeyFromUrl(url);

    // Get equivalent paths in both languages
    const enPath = this.getPathInLanguage(routeKey, 'en');
    const esPath = this.getPathInLanguage(routeKey, 'es');

    // Create and add English hreflang
    const enLink = this.document.createElement('link');
    enLink.rel = 'alternate';
    enLink.hreflang = 'en';
    enLink.href = `${baseUrl}${enPath}`;
    this.document.head.appendChild(enLink);

    // Create and add Spanish hreflang
    const esLink = this.document.createElement('link');
    esLink.rel = 'alternate';
    esLink.hreflang = 'es';
    esLink.href = `${baseUrl}${esPath}`;
    this.document.head.appendChild(esLink);

    // Add x-default hreflang (usually points to English or your main language)
    const defaultLink = this.document.createElement('link');
    defaultLink.rel = 'alternate';
    defaultLink.hreflang = 'x-default';
    defaultLink.href = `${baseUrl}/en`;
    this.document.head.appendChild(defaultLink);
  }

  private getPathInLanguage(routeKey: string, targetLang: string): string {
    // For home page
    if (!routeKey) {
      return `/${targetLang}`;
    }

    // For other pages, use the route mappings
    if (routeKey in this.metadataKeysMap) {
      const pathSegment = this.routeMappings[targetLang][routeKey];
      return `/${targetLang}${pathSegment}`;
    }

    // Fallback to language home page
    return `/${targetLang}`;
  }

  private buildFullUrl(routeKey: string, lang: string): string {
    const baseUrl = this.document.location.origin;
    const path = this.getPathInLanguage(routeKey, lang);
    return `${baseUrl}${path}`;
  }
}

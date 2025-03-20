import { Component, HostListener, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { filter } from 'rxjs/operators';
import { LanguageSelectorComponent } from "../../core/i18n/language-selector.component";

// Define type constants outside the class
const SUPPORTED_ROUTES = ['about-us', 'products', 'contact'] as const;
const SUPPORTED_LANGUAGES = ['en', 'es'] as const;

// Define the types based on the constants
type RouteKey = typeof SUPPORTED_ROUTES[number];
type LanguageKey = typeof SUPPORTED_LANGUAGES[number];

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, LanguageSelectorComponent],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  isScrolled = false;
  isMenuOpen = false;
  isCatalogModalOpen = false;
  currentLang: LanguageKey = 'en';

  // Inject services
  private translate = inject(TranslateService);
  private router = inject(Router);

  // Reference the constants in the class
  private readonly supportedRoutes = SUPPORTED_ROUTES;
  private readonly supportedLanguages = SUPPORTED_LANGUAGES;

  // Define bidirectional route mappings for all supported languages
  private routeMappings: Record<LanguageKey, Record<RouteKey, string>> = {
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

  // Map of translated routes back to base route keys
  private translatedToBaseRoute: Record<string, RouteKey> = {
    // English routes map to themselves
    'about-us': 'about-us',
    'products': 'products',
    'contact': 'contact',
    // Spanish translations map to English base routes
    'sobre-nosotros': 'about-us',
    'productos': 'products',
    'contacto': 'contact'
  };

  ngOnInit(): void {
    // Set initial language based on URL
    this.updateLanguageFromUrl(this.router.url);

    // Listen for route changes to update language
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.updateLanguageFromUrl(event.url);
    });

    // Also listen to language service changes
    this.translate.onLangChange.subscribe(event => {
      this.currentLang = event.lang as LanguageKey;
    });
  }

  /**
   * Update language based on URL
   */
  private updateLanguageFromUrl(url: string): void {
    if (url.startsWith('/es')) {
      this.currentLang = 'es';
      this.translate.use('es');
    } else {
      this.currentLang = 'en';
      this.translate.use('en');
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    const bannerHeight = 96;
    this.isScrolled = window.scrollY >= bannerHeight;
  }

  /**
   * Get localized route path based on current language and base path
   */
  getRoutePath(basePath: string): string {
    // For home page (empty path)
    if (!basePath) {
      return `/${this.currentLang}`;
    }

    // Ensure we're working with a valid route
    if (this.isValidRouteKey(basePath)) {
      // It's a supported route, get its localized version
      return `/${this.currentLang}/${this.routeMappings[this.currentLang][basePath]}`;
    }

    // Fallback for any other routes
    return `/${this.currentLang}/${basePath}`;
  }

  /**
   * Type guard to check if a string is a valid route key
   */
  private isValidRouteKey(key: string): key is RouteKey {
    return this.supportedRoutes.includes(key as any);
  }

  /**
   * Switch language while maintaining current page context
   */
  switchLanguage(newLang: string): void {
    // Ensure we're switching to a valid language
    if (!this.isValidLanguageKey(newLang) || newLang === this.currentLang) {
      return;
    }

    const typedLang = newLang as LanguageKey;

    // Save preference
    try {
      localStorage.setItem('preferredLanguage', typedLang);
    } catch (error) {
      console.error('Error saving language preference:', error);
    }

    // Set language in translate service
    this.translate.use(typedLang);

    // Get current URL path to maintain context when switching
    const currentPath = this.router.url;
    const segments = currentPath.split('/').filter(s => s);

    // Skip if we only have the language segment or no segments
    if (segments.length <= 1) {
      this.router.navigate([`/${typedLang}`]);
      return;
    }

    // Get current route (second segment)
    const currentRoute = segments[1];

    // If this is a known route, find the equivalent in the target language
    if (currentRoute in this.translatedToBaseRoute) {
      // Get the base route key
      const baseRouteKey = this.translatedToBaseRoute[currentRoute];

      // Get the version in the target language
      const targetRoute = this.routeMappings[typedLang][baseRouteKey];

      // Navigate to equivalent page in new language
      this.router.navigate([`/${typedLang}/${targetRoute}`]);
    } else {
      // Unknown route, just change the language prefix
      this.router.navigate([`/${typedLang}/${currentRoute}`]);
    }
  }

  /**
   * Type guard for language keys
   */
  private isValidLanguageKey(key: string): key is LanguageKey {
    return this.supportedLanguages.includes(key as any);
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
    document.body.classList.toggle('menu-open', this.isMenuOpen);
  }

  closeMenu(): void {
    if (this.isMenuOpen) {
      this.isMenuOpen = false;
      document.body.classList.remove('menu-open');
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }

  openCatalogModal(): void {
    this.isCatalogModalOpen = true;
  }

  closeCatalogModal(): void {
    this.isCatalogModalOpen = false;
  }

  downloadCatalog(language: LanguageKey): void {
    const fileName = language === 'en' ? 'Catalog-Eng.pdf' : 'Catalog-Esp.pdf';
    const link = document.createElement('a');
    link.setAttribute('target', '_blank');
    link.setAttribute('href', `assets/photos/${fileName}`);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.closeCatalogModal();
  }
}

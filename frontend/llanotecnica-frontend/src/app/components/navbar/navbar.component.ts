import {
  Component,
  inject,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser, NgOptimizedImage } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { filter, Subject, takeUntil } from 'rxjs';
import gsap from 'gsap';

const SUPPORTED_ROUTES = ['about-us', 'products', 'contact'] as const;
const SUPPORTED_LANGUAGES = ['en', 'es'] as const;

type RouteKey = typeof SUPPORTED_ROUTES[number];
type LanguageKey = typeof SUPPORTED_LANGUAGES[number];

@Component({
  selector: 'app-navbar',
  imports: [RouterModule, TranslateModule, NgOptimizedImage],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  host: {
    '(window:scroll)': 'onWindowScroll()',
    '(document:keydown.escape)': 'onEscape()',
  },
})
export class NavbarComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('logoImg') logoElement!: ElementRef<HTMLImageElement>;
  @ViewChild('mobileOverlay') mobileOverlayEl?: ElementRef<HTMLDivElement>;

  isScrolled = false;
  isMenuOpen = false;
  isCatalogModalOpen = false;
  isOnHomePage = true;
  currentLang: LanguageKey = 'en';

  private translate = inject(TranslateService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private destroy$ = new Subject<void>();
  private menuTimeline: gsap.core.Timeline | null = null;

  private readonly supportedRoutes = SUPPORTED_ROUTES;
  private readonly supportedLanguages = SUPPORTED_LANGUAGES;

  private routeMappings: Record<LanguageKey, Record<RouteKey, string>> = {
    en: { 'about-us': 'about-us', products: 'products', contact: 'contact' },
    es: { 'about-us': 'sobre-nosotros', products: 'productos', contact: 'contacto' },
  };

  private translatedToBaseRoute: Record<string, RouteKey> = {
    'about-us': 'about-us',
    products: 'products',
    contact: 'contact',
    'sobre-nosotros': 'about-us',
    productos: 'products',
    contacto: 'contact',
  };

  ngOnInit(): void {
    this.updateLanguageFromUrl(this.router.url);
    this.updateHomePageFlag(this.router.url);

    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$),
      )
      .subscribe((event: any) => {
        this.updateLanguageFromUrl(event.url);
        this.updateHomePageFlag(event.url);
      });

    this.translate.onLangChange.pipe(takeUntil(this.destroy$)).subscribe((event) => {
      this.currentLang = event.lang as LanguageKey;
    });
  }

  ngAfterViewInit(): void {
    if (this.logoElement?.nativeElement) {
      const logo = this.logoElement.nativeElement;
      logo.style.width = 'auto';
      logo.style.maxWidth = '180px';
      logo.style.objectFit = 'contain';
    }

    if (isPlatformBrowser(this.platformId)) {
      this.buildMenuTimeline();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.menuTimeline?.kill();
    if (isPlatformBrowser(this.platformId)) {
      document.body.classList.remove('menu-open');
    }
  }

  /**
   * Build a paused GSAP timeline for the mobile overlay.
   * - Backdrop fades + scales in
   * - Numbered links stagger-fade up with weighty easing
   * - Catalog CTA settles last
   * Reverse on close.
   */
  private buildMenuTimeline(): void {
    const overlay = this.mobileOverlayEl?.nativeElement;
    if (!overlay) return;

    const content = overlay.querySelector('.overlay-content');
    const links = overlay.querySelectorAll('.overlay-links li');
    const catalog = overlay.querySelector('.overlay-catalog');

    // Respect reduced-motion preference — instant open/close
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      this.menuTimeline = gsap.timeline({ paused: true })
        .set(overlay, { autoAlpha: 1 })
        .set([content, links, catalog], { autoAlpha: 1, x: 0, y: 0 });
      return;
    }

    this.menuTimeline = gsap
      .timeline({ paused: true, defaults: { ease: 'power3.out' } })
      .set(overlay, { display: 'block' })
      .fromTo(
        overlay,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.32, ease: 'power2.out' },
      )
      .fromTo(
        content,
        { y: 24, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.5 },
        '-=0.1',
      )
      .fromTo(
        links,
        { y: 32, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.55, stagger: 0.07 },
        '-=0.35',
      )
      .fromTo(
        catalog,
        { y: 16, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.4 },
        '-=0.3',
      );
  }

  private updateLanguageFromUrl(url: string): void {
    if (url.startsWith('/es')) {
      this.currentLang = 'es';
      this.translate.use('es');
    } else {
      this.currentLang = 'en';
      this.translate.use('en');
    }
  }

  /**
   * Home is the only page where the navbar is transparent over a hero.
   * Match: '/', '/en', '/en/', '/es', '/es/' — anything else gets the solid bar.
   */
  private updateHomePageFlag(url: string): void {
    const trimmed = url.split('?')[0].split('#')[0];
    this.isOnHomePage =
      trimmed === '/' ||
      trimmed === '/en' ||
      trimmed === '/en/' ||
      trimmed === '/es' ||
      trimmed === '/es/';
  }

  onWindowScroll(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const bannerHeight = 96;
    this.isScrolled = window.scrollY >= bannerHeight;
  }

  /** Close menu on Escape key */
  onEscape(): void {
    if (this.isMenuOpen) this.closeMenu();
  }

  getRoutePath(basePath: string): string {
    if (!basePath) return `/${this.currentLang}`;
    if (this.isValidRouteKey(basePath)) {
      return `/${this.currentLang}/${this.routeMappings[this.currentLang][basePath]}`;
    }
    return `/${this.currentLang}/${basePath}`;
  }

  private isValidRouteKey(key: string): key is RouteKey {
    return this.supportedRoutes.includes(key as any);
  }

  switchLanguage(newLang: string): void {
    if (!this.isValidLanguageKey(newLang) || newLang === this.currentLang) return;

    const typedLang = newLang as LanguageKey;

    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.setItem('preferredLanguage', typedLang);
      } catch (error) {
        console.error('Error saving language preference:', error);
      }
    }

    this.translate.use(typedLang);

    const currentPath = this.router.url;
    const segments = currentPath.split('/').filter((s) => s);

    if (segments.length <= 1) {
      this.router.navigate([`/${typedLang}`]);
      return;
    }

    const currentRoute = segments[1];
    if (currentRoute in this.translatedToBaseRoute) {
      const baseRouteKey = this.translatedToBaseRoute[currentRoute];
      const targetRoute = this.routeMappings[typedLang][baseRouteKey];
      this.router.navigate([`/${typedLang}/${targetRoute}`]);
    } else {
      this.router.navigate([`/${typedLang}/${currentRoute}`]);
    }
  }

  private isValidLanguageKey(key: string): key is LanguageKey {
    return this.supportedLanguages.includes(key as any);
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;

    if (isPlatformBrowser(this.platformId)) {
      document.body.classList.toggle('menu-open', this.isMenuOpen);

      if (this.menuTimeline) {
        if (this.isMenuOpen) {
          this.menuTimeline.timeScale(1).play();
        } else {
          // Snappier close
          this.menuTimeline.timeScale(1.6).reverse();
        }
      }
    }
  }

  closeMenu(): void {
    if (!this.isMenuOpen) return;
    this.isMenuOpen = false;

    if (isPlatformBrowser(this.platformId)) {
      document.body.classList.remove('menu-open');
      this.menuTimeline?.timeScale(1.6).reverse();
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
    if (!isPlatformBrowser(this.platformId)) return;

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

import { Component, inject, OnInit, OnDestroy, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject, takeUntil, filter } from 'rxjs';

interface LinkItem {
  text: string;
  route: string;
  action?: 'manual' | 'faq' | 'catalog';
}

type LanguageKey = 'en' | 'es';

const ROUTE_MAPPINGS: Record<LanguageKey, Record<'about-us' | 'products' | 'contact', string>> = {
  en: { 'about-us': 'about-us', products: 'products', contact: 'contact' },
  es: { 'about-us': 'sobre-nosotros', products: 'productos', contact: 'contacto' },
};

@Component({
  selector: 'app-footer',
  imports: [RouterModule, TranslateModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
})
export class FooterComponent implements OnInit, OnDestroy {
  currentYear = new Date().getFullYear();
  currentLang: LanguageKey = 'en';

  companyInfo = {
    phone: '',
    whatsapp: '',
    email: '',
    address: '',
    socialLinks: {
      facebook: '',
      instagram: '',
    },
  };

  quickLinks: LinkItem[] = [];
  products: LinkItem[] = [];
  support: LinkItem[] = [];

  showManualModal = false;
  showCatalogModal = false;

  /** Phone number with whitespace stripped — for `tel:` URI. */
  get phoneTelLink(): string {
    return 'tel:' + (this.companyInfo.phone || '').replace(/\s+/g, '');
  }

  get emailMailtoLink(): string {
    return 'mailto:' + (this.companyInfo.email || '');
  }

  private router = inject(Router);
  private translate = inject(TranslateService);
  private platformId = inject(PLATFORM_ID);
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.updateLanguageFromUrl(this.router.url);
    this.loadTranslations();

    // React to language changes (URL navigation OR explicit translate.use())
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd), takeUntil(this.destroy$))
      .subscribe((e: any) => {
        this.updateLanguageFromUrl(e.url);
        this.loadTranslations();
      });

    this.translate.onLangChange.pipe(takeUntil(this.destroy$)).subscribe((event) => {
      this.currentLang = event.lang as LanguageKey;
      this.loadTranslations();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateLanguageFromUrl(url: string): void {
    this.currentLang = url.startsWith('/es') ? 'es' : 'en';
  }

  /** Build a language-aware route for a base key. */
  private getRoutePath(baseKey: 'about-us' | 'products' | 'contact'): string {
    return `/${this.currentLang}/${ROUTE_MAPPINGS[this.currentLang][baseKey]}`;
  }

  loadTranslations(): void {
    this.translate.get('FOOTER.COMPANY_INFO').subscribe((data: any) => {
      this.companyInfo = {
        phone: data?.PHONE || '',
        whatsapp: data?.WHATSAPP_URL || '',
        email: data?.EMAIL || '',
        address: data?.ADDRESS || '',
        socialLinks: {
          facebook: data?.SOCIAL_LINKS?.FACEBOOK_URL || '',
          instagram: data?.SOCIAL_LINKS?.INSTAGRAM_URL || '',
        },
      };
    });

    // Quick links — language-aware routes (preserves Spanish URLs)
    this.quickLinks = [
      { text: this.translate.instant('FOOTER.QUICK_LINKS.0.TEXT'), route: this.getRoutePath('about-us') },
      { text: this.translate.instant('FOOTER.QUICK_LINKS.1.TEXT'), route: this.getRoutePath('products') },
      { text: this.translate.instant('FOOTER.QUICK_LINKS.3.TEXT'), route: this.getRoutePath('contact') },
    ];

    // Product links all go to the products page
    this.products = [
      { text: this.translate.instant('FOOTER.PRODUCTS.0.TEXT'), route: this.getRoutePath('products') },
      { text: this.translate.instant('FOOTER.PRODUCTS.1.TEXT'), route: this.getRoutePath('products') },
      { text: this.translate.instant('FOOTER.PRODUCTS.2.TEXT'), route: this.getRoutePath('products') },
    ];

    // Support items trigger actions instead of navigating
    this.support = [
      { text: this.translate.instant('FOOTER.SUPPORT.1.TEXT'), action: 'manual', route: '' },
      { text: this.translate.instant('FOOTER.SUPPORT.2.TEXT'), action: 'faq', route: '' },
      { text: this.translate.instant('FOOTER.SUPPORT.3.TEXT'), action: 'catalog', route: '' },
    ];
  }

  handleLinkClick(item: LinkItem): void {
    if (item.route) this.router.navigate([item.route]);
  }

  handleSupportAction(item: LinkItem): void {
    switch (item.action) {
      case 'manual':
        this.toggleManualModal();
        break;
      case 'faq':
        this.goToFaq();
        break;
      case 'catalog':
        this.toggleCatalogModal();
        break;
    }
  }

  toggleManualModal(): void {
    this.showManualModal = !this.showManualModal;
  }

  toggleCatalogModal(): void {
    this.showCatalogModal = !this.showCatalogModal;
  }

  closeManualModal(): void {
    this.showManualModal = false;
  }

  closeCatalogModal(): void {
    this.showCatalogModal = false;
  }

  downloadManual(language: LanguageKey): void {
    this.downloadFile(language === 'en' ? 'Manual-Eng.pdf' : 'Manual-Esp.pdf');
    this.closeManualModal();
  }

  downloadCatalog(language: LanguageKey): void {
    this.downloadFile(language === 'en' ? 'Catalog-Eng.pdf' : 'Catalog-Esp.pdf');
    this.closeCatalogModal();
  }

  private downloadFile(fileName: string): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const link = document.createElement('a');
    link.setAttribute('target', '_blank');
    link.setAttribute('href', `assets/photos/${fileName}`);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  goToFaq(): void {
    this.router.navigate([`/${this.currentLang}`], { fragment: 'faq' });
  }

  scrollToTop(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

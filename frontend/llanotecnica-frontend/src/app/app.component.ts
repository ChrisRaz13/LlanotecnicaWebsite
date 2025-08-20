import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';
import { NavbarComponent } from './components/navbar/navbar.component';
import { BannerComponent } from './components/banner/banner.component';
import { FooterComponent } from "./components/footer/footer.component";
import { WhatsappWidgetComponent } from './components/whatsapp-widget/whatsapp-widget.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Title, Meta } from '@angular/platform-browser';
import { filter } from 'rxjs/operators';
import { SeoLanguageService } from './services/language-selector/seo-language.service';
import { RecaptchaService } from './services/language-selector/recaptcha.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    NavbarComponent,
    BannerComponent,
    FooterComponent,
    WhatsappWidgetComponent,
    TranslateModule
  ],
  template: `
    <app-banner></app-banner>
    <app-navbar></app-navbar>
    <router-outlet></router-outlet>
    <app-footer></app-footer>
    <app-whatsapp-widget></app-whatsapp-widget>
  `
})
export class AppComponent implements OnInit {
  title = 'llanotecnica';

  constructor(
    private translate: TranslateService,
    private titleService: Title,
    private router: Router,
    private seoService: SeoLanguageService,
    private recaptchaService: RecaptchaService,
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) private document: Document
  ) {
    // Set available languages and default
    this.translate.addLangs(['en', 'es']);
    this.translate.setDefaultLang('en');

    // Initialize language
    this.initializeLanguage();
  }

  private initializeLanguage(): void {
    // Only access localStorage in browser environment
    if (isPlatformBrowser(this.platformId)) {
      try {
        // Use the stored language preference if available
        const storedLang = localStorage.getItem('preferredLanguage');
        if (storedLang === 'en' || storedLang === 'es') {
          this.translate.use(storedLang);
        } else {
          // Simple browser language detection
          const browserLang = navigator.language || '';
          const langCode = browserLang.split('-')[0].toLowerCase();
          const useLang = langCode === 'es' ? 'es' : 'en';
          this.translate.use(useLang);
          localStorage.setItem('preferredLanguage', useLang);
        }
      } catch (error) {
        // Fallback to default language if browser detection fails
        this.translate.use('en');
        localStorage.setItem('preferredLanguage', 'en');
      }
    } else {
      // In SSR, just use default language
      // This will be overridden by the server-side language detection if available
      this.translate.use('en');
    }
  }

  ngOnInit(): void {
    // Initialize SEO service
    this.seoService.initialize();

    // Only subscribe to router events in browser environment
    if (isPlatformBrowser(this.platformId)) {
      // Set document language
      this.document.documentElement.lang = this.translate.currentLang || 'en';

      // Listen for route changes to update page title
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd)
      ).subscribe(() => {
        this.updatePageTitle();
      });

      // Listen for language changes
      this.translate.onLangChange.subscribe(() => {
        this.document.documentElement.lang = this.translate.currentLang;
        this.updatePageTitle();
      });
    }
  }

  // Update page title based on current route
  private updatePageTitle(): void {
    const currentPath = this.router.url;
    let titleKey = 'HOME_PAGE.SEO.TITLE';

    if (currentPath.includes('/about-us') || currentPath.includes('/sobre-nosotros')) {
      titleKey = 'ABOUT_US_PAGE.SEO.TITLE';
    } else if (currentPath.includes('/products') || currentPath.includes('/productos')) {
      titleKey = 'HOME_PAGE.SEO.TITLE'; // Update this if you have a product page title
    } else if (currentPath.includes('/contact') || currentPath.includes('/contacto')) {
      titleKey = 'HOME_PAGE.SEO.TITLE'; // Update this if you have a contact page title
    }

    this.translate.get(titleKey).subscribe((res: string) => {
      this.titleService.setTitle(res !== titleKey ? res : 'Llanotecnica');
    });
  }
}

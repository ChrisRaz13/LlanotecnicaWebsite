import { Component, inject, OnInit, OnDestroy, PLATFORM_ID, Inject, HostListener } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ROUTE_MAPPINGS, REVERSE_ROUTE_MAPPINGS, SupportedLanguage } from './i18n-tokens';

interface Language {
  key: SupportedLanguage;
  name: string;
  nativeName: string;
}

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="language-selector">
      <div
        class="lang-toggle"
        (click)="toggleDropdown($event)"
        [attr.aria-label]="'COMMON.CHANGE_LANGUAGE' | translate">

        <!-- Flag Toggle (Both Desktop and Mobile) -->
        <div class="flag-option" [class.active]="currentLang === 'en'" (click)="switchLanguage('en', $event)">
          <img src="assets/flags/gb.svg" alt="English" class="flag-icon" />
        </div>

        <span class="divider">|</span>

        <div class="flag-option" [class.active]="currentLang === 'es'" (click)="switchLanguage('es', $event)">
          <img src="assets/flags/es.svg" alt="Español" class="flag-icon" />
        </div>
      </div>

      <!-- Mobile Dropdown (Only shown when dropdown is explicitly opened) -->
      <div class="language-dropdown" *ngIf="isDropdownOpen && isMobile" role="menu" [attr.aria-label]="'COMMON.LANGUAGE_SELECTION' | translate">
        <div class="dropdown-header">
          <span>{{ 'COMMON.SELECT_LANGUAGE' | translate }}</span>
        </div>
        <div class="dropdown-items">
          <button
            *ngFor="let language of languages"
            class="language-option"
            [class.active]="language.key === currentLang"
            (click)="switchLanguage(language.key, $event)"
            role="menuitem">
            <img
              [src]="'assets/flags/' + (language.key === 'en' ? 'gb' : language.key) + '.svg'"
              [alt]="language.name"
              class="flag-icon" />
            <span class="language-name">{{language.nativeName}}</span>
            <span class="language-check" *ngIf="language.key === currentLang">✓</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Base Container */
    .language-selector {
      position: relative;
    }

    /* Language Toggle */
    .lang-toggle {
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 5px 10px;
      border-radius: 5px;
      background: rgba(0, 135, 81, 0.1);
      transition: all 0.3s ease;
      margin-left: 30px;
    }

    .lang-toggle:hover {
      background: rgba(0, 135, 81, 0.2);
    }

    /* Flag options */
    .flag-option {
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      padding: 2px;
      border-radius: 3px;
      transition: all 0.2s ease;
    }

    .flag-option.active {
      background: rgba(0, 135, 81, 0.2);
      transform: scale(1.1);
    }

    /* Divider */
    .lang-toggle .divider {
      color: #999;
      font-weight: 300;
      cursor: default;
    }

    /* Flag icon */
    .flag-icon {
      width: 24px;
      height: 16px;
      border-radius: 2px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      object-fit: cover;
    }

    /* Mobile Dropdown Menu */
    .language-dropdown {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      width: 100%;
      max-height: 50vh;
      background: white;
      border-radius: 15px 15px 0 0;
      box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.2);
      z-index: 1100;
      animation: slideUp 0.3s ease;
      overflow: hidden;
    }

    @keyframes slideUp {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
    }

    /* Dropdown header */
    .dropdown-header {
      padding: 15px;
      background: #f5f5f5;
      border-bottom: 1px solid #eaeaea;
      color: #333;
      font-size: 1rem;
      text-align: center;
      font-weight: 500;
    }

    /* Dropdown items container */
    .dropdown-items {
      max-height: calc(50vh - 50px);
      overflow-y: auto;
    }

    /* Language option */
    .language-option {
      display: flex;
      align-items: center;
      width: 100%;
      padding: 15px;
      border: none;
      background: transparent;
      text-align: left;
      cursor: pointer;
      transition: background 0.2s ease;
      gap: 10px;
      font-size: 1rem;
    }

    .language-option:hover {
      background: #f5f5f5;
    }

    .language-option.active {
      background: rgba(0, 135, 81, 0.05);
      color: #008751;
    }

    /* Language name */
    .language-name {
      flex-grow: 1;
    }

    /* Check mark for selected language */
    .language-check {
      color: #008751;
      font-weight: bold;
    }

    /* Mobile styles adjustments */
    @media (max-width: 768px) {
      .lang-toggle {
        margin-left: 0;
        position: fixed;
        top: 20px;
        right: 70px;
        background: rgba(255, 255, 255, 0.9);
        border-radius: 5px;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        z-index: 1002;
      }
    }
  `]
})
export class LanguageSelectorComponent implements OnInit, OnDestroy {
  currentLang: SupportedLanguage = 'en';
  isDropdownOpen = false;
  isMobile = false;
  private destroy$ = new Subject<void>();

  // Define available languages
  languages: Language[] = [
    { key: 'en', name: 'English', nativeName: 'English' },
    { key: 'es', name: 'Spanish', nativeName: 'Español' }
  ];

  // Inject services
  private router = inject(Router);
  private translate = inject(TranslateService);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    // Get initial language from URL (SSR-safe)
    this.updateLanguageFromUrl(this.router.url);

    // Check screen size
    this.checkScreenSize();

    // Listen for route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe((event: any) => {
      this.updateLanguageFromUrl(event.url);
    });

    // Listen for language changes from the service
    this.translate.onLangChange.pipe(
      takeUntil(this.destroy$)
    ).subscribe(event => {
      this.currentLang = event.lang as SupportedLanguage;
    });

    // Initialize with saved preference if in browser environment
    if (isPlatformBrowser(this.platformId)) {
      const savedLang = localStorage.getItem('preferredLanguage') as SupportedLanguage | null;
      if (savedLang && (savedLang === 'en' || savedLang === 'es') && savedLang !== this.currentLang) {
        // Only apply if different from URL-detected language
        this.translate.use(savedLang);
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Update the current language based on URL
   */
  private updateLanguageFromUrl(url: string): void {
    this.currentLang = url.startsWith('/es') ? 'es' : 'en';
  }

  /**
   * Toggle dropdown visibility
   */
  toggleDropdown(event: Event): void {
    // Only show dropdown on mobile and only if clicking the container (not the flags)
    if (this.isMobile && (event.target as HTMLElement).classList.contains('lang-toggle')) {
      event.stopPropagation();
      this.isDropdownOpen = !this.isDropdownOpen;
    }
  }

  /**
   * Close dropdown when clicking outside
   */
  @HostListener('document:click')
  closeDropdown(): void {
    this.isDropdownOpen = false;
  }

  /**
   * Check screen size to determine if mobile
   */
  @HostListener('window:resize')
  checkScreenSize(): void {
    this.isMobile = window.innerWidth <= 768;
  }

  /**
   * Switch to a different language and navigate to the equivalent route
   */
  switchLanguage(lang: SupportedLanguage, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    if (lang === this.currentLang) {
      this.isDropdownOpen = false;
      return;
    }

    // Save preference in browser environments
    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.setItem('preferredLanguage', lang);
      } catch (error) {
        console.error('Error saving language preference:', error);
      }
    }

    // Apply new language
    this.translate.use(lang);

    // Navigate to equivalent route in new language
    const currentPath = this.router.url;
    const segments = currentPath.split('/').filter(s => s);

    // If just at language root, navigate to new language
    if (segments.length <= 1) {
      this.router.navigate([`/${lang}`]);
      this.isDropdownOpen = false;
      return;
    }

    // Get current route and find equivalent in target language
    const currentRoute = segments[1];
    let targetRoute = currentRoute;

    // Determine the target route based on language direction
    if (currentRoute in REVERSE_ROUTE_MAPPINGS) {
      const baseRoute = REVERSE_ROUTE_MAPPINGS[currentRoute];
      if (baseRoute) {
        targetRoute = ROUTE_MAPPINGS[lang][baseRoute] || currentRoute;
      }
    }

    // Navigate to new language route
    this.router.navigate([`/${lang}/${targetRoute}`]);

    // Close dropdown
    this.isDropdownOpen = false;
  }

  /**
   * Get current language object
   */
  get currentLanguage(): Language {
    return this.languages.find(lang => lang.key === this.currentLang) || this.languages[0];
  }
}

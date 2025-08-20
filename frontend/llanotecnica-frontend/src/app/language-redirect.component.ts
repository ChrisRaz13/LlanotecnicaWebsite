import { Component, OnInit, inject, PLATFORM_ID, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { catchError, of, timeout, finalize } from 'rxjs';

type SupportedLanguage = 'en' | 'es';

@Component({
  selector: 'app-language-redirect',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="language-redirect-container">
      <p>{{ 'Redirecting...' | translate }}</p>
      <div *ngIf="isRedirecting" class="loading-spinner"></div>
    </div>
  `,
  styles: [`
    .language-redirect-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      font-family: 'Montserrat', sans-serif;
    }
    .loading-spinner {
      margin-top: 20px;
      width: 40px;
      height: 40px;
      border: 3px solid rgba(0, 0, 0, 0.1);
      border-radius: 50%;
      border-top-color: #008751;
      animation: spin 1s ease-in-out infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class LanguageRedirectComponent implements OnInit {
  private readonly LANGUAGE_STORAGE_KEY = 'preferredLanguage';
  private readonly SPANISH_COUNTRIES = ['ES', 'MX', 'AR', 'CO', 'PE', 'CL', 'VE', 'EC', 'GT', 'CU', 'BO', 'DO', 'HN', 'NI', 'SV', 'CR', 'PA'];
  // Maximum time to wait for API response before falling back
  private readonly API_TIMEOUT_MS = 1500;

  isRedirecting = true;
  private redirectTimeoutId: number | null = null;

  private router = inject(Router);
  private translate = inject(TranslateService);
  private http = inject(HttpClient);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    this.detectLanguageAndRedirect();

    // Safety fallback - redirect after 200ms regardless of API response
    this.redirectTimeoutId = window.setTimeout(() => {
      if (this.isRedirecting) {
        console.warn('Fallback timeout reached, redirecting to default language (en)');
        this.setLanguageAndRedirect('en');
      }
    }, 200);
  }

  private detectLanguageAndRedirect(): void {
    // For server-side rendering, default to English
    if (!isPlatformBrowser(this.platformId)) {
      this.redirectToLanguage('en');
      return;
    }

    // Clear URL parameters or fragments if present
    const hasUrlExtras = window.location.search !== '' || window.location.hash !== '';
    if (hasUrlExtras) {
      // Remove search params and hash for cleaner redirect
      console.log('Clearing URL parameters before language redirect');
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // 1. First check: URL-based language detection
    const path = window.location.pathname;
    if (path.startsWith('/es/') || path === '/es') {
      console.log('Language detected from URL path: es');
      this.setLanguageAndRedirect('es');
      return;
    } else if (path.startsWith('/en/') || path === '/en') {
      console.log('Language detected from URL path: en');
      this.setLanguageAndRedirect('en');
      return;
    }

    // 2. Second check: localStorage preference
    try {
      const storedLang = localStorage.getItem(this.LANGUAGE_STORAGE_KEY);
      if (storedLang && ['en', 'es'].includes(storedLang)) {
        console.log(`Using stored language preference: ${storedLang}`);
        this.redirectToLanguage(storedLang as SupportedLanguage);
        return;
      }
    } catch (error) {
      console.error('Error accessing localStorage:', error);
    }

    // 3. Third check: browser language
    try {
      const browserLang = this.getBrowserLanguage();
      if (browserLang === 'es') {
        console.log('Spanish browser language detected');
        this.setLanguageAndRedirect('es');
        return;
      }
    } catch (error) {
      console.error('Error detecting browser language:', error);
    }

    // 4. Fourth check: country detection (skip for localhost)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.log('Development environment detected, using default language (en)');
      this.setLanguageAndRedirect('en');
      return;
    }

    // Perform country detection with timeout
    this.http.get('https://ipapi.co/json/')
      .pipe(
        timeout(this.API_TIMEOUT_MS),
        catchError(error => {
          console.error('Error or timeout detecting country:', error);
          return of(null);
        }),
        finalize(() => {
          // If we still haven't redirected by this point, use English
          if (this.isRedirecting) {
            console.log('Country detection completed, no matching country found');
            this.setLanguageAndRedirect('en');
          }
        })
      )
      .subscribe((response: any) => {
        if (!response) return; // Error case handled in finalize

        if (this.SPANISH_COUNTRIES.includes(response.country_code)) {
          console.log(`Spanish-speaking country detected: ${response.country_code}`);
          this.setLanguageAndRedirect('es');
        } else {
          console.log(`Non-Spanish country detected (${response.country_code}), using English`);
          this.setLanguageAndRedirect('en');
        }
      });
  }

  private getBrowserLanguage(): string {
    try {
      // Try to get language from navigator
      const lang = navigator.language || (navigator.languages && navigator.languages[0]) || '';
      return lang.split('-')[0].toLowerCase();
    } catch (error) {
      console.error('Error getting browser language:', error);
      return 'en';
    }
  }

  private setLanguageAndRedirect(lang: SupportedLanguage): void {
    // Cancel fallback timeout if active
    if (this.redirectTimeoutId !== null) {
      window.clearTimeout(this.redirectTimeoutId);
      this.redirectTimeoutId = null;
    }

    // Save to localStorage
    try {
      localStorage.setItem(this.LANGUAGE_STORAGE_KEY, lang);
    } catch (error) {
      console.error('Error setting localStorage:', error);
    }

    // Set the language in the translate service
    this.translate.use(lang);

    // Redirect
    this.redirectToLanguage(lang);
  }

  private redirectToLanguage(lang: SupportedLanguage): void {
    // Only redirect once
    if (!this.isRedirecting) return;

    this.isRedirecting = false;

    // Navigate immediately to the appropriate language route
    this.router.navigate([`/${lang}`]);
  }
}

import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, from, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

// Hardcode the site key to avoid environment import issues
const RECAPTCHA_SITE_KEY = '6LdRYeYqAAAAANM-PRPuJGsG8gOzCLPsa2e2naiO';

declare global {
  interface Window {
    grecaptcha: {
      enterprise: {
        ready: (callback: () => void) => void;
        execute: (siteKey: string, options: { action: string }) => Promise<string>;
      };
    };
  }
}

@Injectable({
  providedIn: 'root'
})
export class RecaptchaService {
  private siteKey = RECAPTCHA_SITE_KEY;
  private scriptLoaded = false;
  private scriptLoading = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    // Load reCAPTCHA script on service initialization
    if (isPlatformBrowser(this.platformId)) {
      this.loadRecaptchaScript();
    }
  }

  /**
   * Loads the reCAPTCHA Enterprise script if not already loaded
   */
  private loadRecaptchaScript(): Promise<void> {
    // If script is already loaded, return resolved promise
    if (this.scriptLoaded) {
      return Promise.resolve();
    }

    // If script is currently loading, wait for it
    if (this.scriptLoading) {
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (this.scriptLoaded) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 100);
      });
    }

    // Start loading the script
    this.scriptLoading = true;

    return new Promise((resolve, reject) => {
      // Check if script is already in the DOM
      if (document.querySelector('script[src*="recaptcha/enterprise.js"]')) {
        this.scriptLoaded = true;
        this.scriptLoading = false;
        resolve();
        return;
      }

      // Create and load script
      const script = document.createElement('script');
      script.src = `https://www.google.com/recaptcha/enterprise.js?render=${this.siteKey}`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        console.log('✅ reCAPTCHA Enterprise script loaded successfully');
        this.scriptLoaded = true;
        this.scriptLoading = false;
        resolve();
      };

      script.onerror = (error) => {
        console.error('Error loading reCAPTCHA Enterprise script:', error);
        this.scriptLoading = false;
        reject(error);
      };

      document.head.appendChild(script);
    });
  }

  /**
   * Executes reCAPTCHA and returns a token for the specified action
   * @param action The action name for this reCAPTCHA execution
   * @returns An Observable with the reCAPTCHA token
   */
  public executeRecaptcha(action: string): Observable<string> {
    if (!isPlatformBrowser(this.platformId)) {
      return throwError(() => new Error('reCAPTCHA can only run in browser environment'));
    }

    return from(
      this.loadRecaptchaScript()
        .then(() => {
          if (!window.grecaptcha || !window.grecaptcha.enterprise) {
            throw new Error('reCAPTCHA Enterprise failed to initialize properly');
          }

          return new Promise<string>((resolve, reject) => {
            window.grecaptcha.enterprise.ready(() => {
              window.grecaptcha.enterprise.execute(this.siteKey, { action })
                .then(token => {
                  console.log('✅ reCAPTCHA token generated successfully for action:', action);
                  resolve(token);
                })
                .catch(err => {
                  console.error('🔴 Error executing reCAPTCHA:', err);
                  reject(err);
                });
            });
          });
        })
    ).pipe(
      catchError(error => {
        console.error('🔴 Error in reCAPTCHA execution:', error);
        return throwError(() => error);
      })
    );
  }
}

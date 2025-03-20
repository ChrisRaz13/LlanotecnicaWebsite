import { TranslateLoader } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, Inject, Optional, InjectionToken } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { TRANSLATION_FILE_PATH, SUPPORTED_LANGUAGES } from './i18n-tokens';

/**
 * Universal loader for translations that works in both browser and server environments
 */
export class TranslateUniversalLoader implements TranslateLoader {
  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
    @Optional() @Inject(TRANSLATION_FILE_PATH) private translationPath: string = 'assets/i18n'
  ) {}

  /**
   * Get translation file for the specified language
   * @param lang Language code
   * @returns Observable with translation data
   */
  getTranslation(lang: string): Observable<any> {
    // Validate language is supported
    if (!SUPPORTED_LANGUAGES.includes(lang as any)) {
      console.warn(`Language '${lang}' is not supported. Falling back to English.`);
      lang = 'en';
    }

    if (isPlatformBrowser(this.platformId)) {
      // In the browser, use HTTP to load the translation file
      return this.http.get(`${this.translationPath}/${lang}.json`).pipe(
        catchError(error => {
          console.error(`Error loading translation file for ${lang}:`, error);
          // Return a minimal translation object to avoid breaking the app
          return of({});
        })
      );
    } else {
      // In SSR: load the file from the filesystem
      try {
        // Use dynamic import to avoid bundling Node.js modules with browser code
        const fs = require('fs');
        const path = require('path');

        // Adjust the path based on the project structure
        const distPath = 'dist';
        const appName = 'llanotecnica';

        // Build path to translation file
        const filePath = path.join(
          process.cwd(),
          distPath,
          appName,
          'browser',
          this.translationPath,
          `${lang}.json`
        );

        console.log(`[SSR] Loading translation file: ${filePath}`);

        // Read and parse file
        const fileContents = fs.readFileSync(filePath, 'utf8');

        try {
          const translations = JSON.parse(fileContents);
          return of(translations);
        } catch (parseError) {
          console.error(`Error parsing translation file for ${lang}:`, parseError);
          return of({});
        }
      } catch (error) {
        console.error(`[SSR] Error loading translation file for ${lang}:`, error);

        // Try alternate path if main path fails
        try {
          const fs = require('fs');
          const path = require('path');

          // Try alternative path within the project
          const altPath = path.join(
            process.cwd(),
            'src',
            this.translationPath,
            `${lang}.json`
          );

          console.log(`[SSR] Attempting alternate path: ${altPath}`);

          const fileContents = fs.readFileSync(altPath, 'utf8');
          return of(JSON.parse(fileContents));
        } catch (altError) {
          console.error('[SSR] Alternative path also failed:', altError);
          // Return empty object to prevent app from breaking
          return of({});
        }
      }
    }
  }
}

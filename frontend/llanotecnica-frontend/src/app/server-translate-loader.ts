import { Observable, of } from 'rxjs';
import { TranslateLoader } from '@ngx-translate/core';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Server-side translate loader. During SSR/prerender there is no HTTP server to
 * fetch /assets/i18n/{lang}.json from, so we read the JSON straight off the disk
 * out of the source `src/assets/i18n` directory (resolved relative to the
 * project working directory at build time).
 */
export class ServerTranslateLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<any> {
    try {
      const jsonPath = join(process.cwd(), 'src', 'assets', 'i18n', `${lang}.json`);
      const contents = readFileSync(jsonPath, 'utf8');
      return of(JSON.parse(contents));
    } catch (e) {
      console.error(`[ServerTranslateLoader] Failed to load ${lang}:`, e);
      return of({});
    }
  }
}

export function serverTranslateLoaderFactory(): TranslateLoader {
  return new ServerTranslateLoader();
}

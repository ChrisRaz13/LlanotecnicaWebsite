import { Component, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './language-selector.component.html',
  styleUrls: ['./language-selector.component.css']
})
export class LanguageSelectorComponent {
  currentLang: 'en' | 'es' = 'en';

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private translate: TranslateService
  ) {
    if (isPlatformBrowser(this.platformId)) {
      // Check localStorage
      const savedLang = localStorage.getItem('preferredLanguage') as 'en' | 'es' | null;

      if (savedLang === 'en' || savedLang === 'es') {
        this.currentLang = savedLang;
        this.translate.use(savedLang);
      } else {
        // Default to English (or Spanish) if nothing is saved
        this.translate.use('en');
      }
    }
  }

  toggleLanguage() {
    console.log('Language toggle clicked');
    if (isPlatformBrowser(this.platformId)) {
      // Swap languages
      this.currentLang = this.currentLang === 'en' ? 'es' : 'en';

      // Save preference in localStorage
      localStorage.setItem('preferredLanguage', this.currentLang);

      // Tell ngx-translate to load the new language from /assets/i18n/<lang>.json
      this.translate.use(this.currentLang);
    }
  }
}

import { Component, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './language-selector.component.html',
  styleUrls: ['./language-selector.component.css']
})
export class LanguageSelectorComponent {
  currentLang: 'en' | 'es' = 'en';

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      const savedLang = localStorage.getItem('preferredLanguage');
      if (savedLang === 'en' || savedLang === 'es') {
        this.currentLang = savedLang;
      }
    }
  }

  toggleLanguage() {
    if (isPlatformBrowser(this.platformId)) {
      this.currentLang = this.currentLang === 'en' ? 'es' : 'en';
      localStorage.setItem('preferredLanguage', this.currentLang);
      window.location.reload();
    }
  }
}

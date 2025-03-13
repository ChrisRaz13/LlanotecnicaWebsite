import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './language-selector.component.html',
  styleUrls: ['./language-selector.component.css']
})
export class LanguageSelectorComponent implements OnInit {
  currentLang: 'en' | 'es' = 'en';

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private translate: TranslateService
  ) {
    if (isPlatformBrowser(this.platformId)) {
      const savedLang = localStorage.getItem('preferredLanguage');
      if (savedLang === 'en' || savedLang === 'es') {
        this.currentLang = savedLang;
        this.translate.use(savedLang);
      } else {
        const browserLang = navigator.language.split('-')[0];
        this.currentLang = browserLang === 'es' ? 'es' : 'en';
        this.translate.use(this.currentLang);
        localStorage.setItem('preferredLanguage', this.currentLang);
      }
    }
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
        this.currentLang = event.lang as 'en' | 'es';
      });
    }
  }

  toggleLanguage(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.currentLang = this.currentLang === 'en' ? 'es' : 'en';
      localStorage.setItem('preferredLanguage', this.currentLang);
      this.translate.use(this.currentLang);
    }
  }
}

import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { BannerComponent } from './components/banner/banner.component';
import { FooterComponent } from "./components/footer/footer.component";
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, BannerComponent, FooterComponent],
  template: `
    <app-banner></app-banner>
    <app-navbar></app-navbar>
    <router-outlet></router-outlet>
    <app-footer></app-footer>
  `
})
export class AppComponent implements OnInit {
  title = 'llanotecnica';

  constructor(
    private translate: TranslateService,
    private titleService: Title,
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.translate.setDefaultLang('en');
  }

  ngOnInit(): void {
    this.setLanguageBasedOnIPAndBrowser();
    this.updatePageTitle();
  }

  private setLanguageBasedOnIPAndBrowser(): void {
    if (isPlatformBrowser(this.platformId)) {
      const storedLang = localStorage.getItem('lang');
      if (storedLang) {
        this.translate.use(storedLang);
      } else {
        let browserLang = navigator.language.split('-')[0];
        this.http.get('https://ipapi.co/json/').subscribe((res: any) => {
          if (res && res.country_code) {
            const spanishCountries = ['ES', 'MX', 'AR', 'CO', 'PE', 'CL', 'VE', 'EC', 'GT', 'CU', 'BO', 'DO', 'HN', 'NI', 'SV', 'CR', 'PA'];
            const selectedLang = spanishCountries.includes(res.country_code) ? 'es' : (browserLang || 'en');
            this.translate.use(selectedLang);
            localStorage.setItem('lang', selectedLang);
          } else {
            this.translate.use(browserLang || 'en');
            localStorage.setItem('lang', browserLang || 'en');
          }
          this.updatePageTitle();
        }, (error) => {
          this.translate.use(browserLang || 'en');
          localStorage.setItem('lang', browserLang || 'en');
          this.updatePageTitle();
        });
      }
    } else {
      this.translate.use('en');
    }
  }

  private updatePageTitle(): void {
    this.translate.get('HOME_PAGE.SEO.TITLE').subscribe((res: string) => {
      const finalTitle = (res && res !== 'HOME_PAGE.SEO.TITLE') ? res : 'Professional Concrete Mixers | Industrial Mixing Solutions';
      this.titleService.setTitle(finalTitle);
    });
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageSelectorComponent } from '../../core/i18n/language-selector.component';

interface LinkItem {
  text: string;
  route: string;
  action?: string; // Special action like 'manual', 'faq', 'catalog'
}

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, LanguageSelectorComponent],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {
  currentYear = new Date().getFullYear();

  companyInfo = {
    phone: '',
    whatsapp: '',
    email: '',
    address: '',
    socialLinks: {
      facebook: '',
      instagram: ''
    }
  };

  quickLinks: LinkItem[] = [];
  products: LinkItem[] = [];
  support: LinkItem[] = [];

  showManualModal = false;
  showCatalogModal = false;

  constructor(
    private router: Router,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.loadTranslations();
    this.translate.onLangChange.subscribe(() => {
      this.loadTranslations();
    });
  }

  loadTranslations() {
    this.translate.get('FOOTER.COMPANY_INFO').subscribe((data: any) => {
      this.companyInfo = {
        phone: data?.PHONE || '',
        whatsapp: data?.WHATSAPP_URL || '',
        email: data?.EMAIL || '',
        address: data?.ADDRESS || '',
        socialLinks: {
          facebook: data?.SOCIAL_LINKS?.FACEBOOK_URL || '',
          instagram: data?.SOCIAL_LINKS?.INSTAGRAM_URL || ''
        }
      };
    });

    // Quick links now only include "Sobre Nosotros", "Productos", and "Contacto"
    this.quickLinks = [
      { text: this.translate.instant('FOOTER.QUICK_LINKS.0.TEXT'), route: '/about-us' },
      { text: this.translate.instant('FOOTER.QUICK_LINKS.1.TEXT'), route: '/products' },
      { text: this.translate.instant('FOOTER.QUICK_LINKS.3.TEXT'), route: '/contact' }
    ];

    // Product links: all go to the Products page (/products)
    this.products = [
      { text: this.translate.instant('FOOTER.PRODUCTS.0.TEXT'), route: '/products' },
      { text: this.translate.instant('FOOTER.PRODUCTS.1.TEXT'), route: '/products' },
      { text: this.translate.instant('FOOTER.PRODUCTS.2.TEXT'), route: '/products' }
    ];

    // Support remains unchanged
    this.support = [
      { text: this.translate.instant('FOOTER.SUPPORT.1.TEXT'), action: 'manual', route: '' },
      { text: this.translate.instant('FOOTER.SUPPORT.2.TEXT'), action: 'faq', route: '' },
      { text: this.translate.instant('FOOTER.SUPPORT.3.TEXT'), action: 'catalog', route: '' }
    ];
  }

  // Navigation using Angular's router
  handleLinkClick(item: LinkItem) {
    console.log('Navigating to:', item.route);
    this.router.navigate([item.route]);
  }

  handleSupportAction(item: LinkItem) {
    if (item.action === 'manual') {
      this.toggleManualModal();
    } else if (item.action === 'faq') {
      this.goToFaq();
    } else if (item.action === 'catalog') {
      this.toggleCatalogModal();
    }
  }

  toggleManualModal() {
    this.showManualModal = !this.showManualModal;
  }

  toggleCatalogModal() {
    this.showCatalogModal = !this.showCatalogModal;
  }

  downloadManual(language: 'en' | 'es') {
    const fileName = language === 'en' ? 'Manual-Eng.pdf' : 'Manual-Esp.pdf';
    const link = document.createElement('a');
    link.setAttribute('target', '_blank');
    link.setAttribute('href', `assets/photos/${fileName}`);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.showManualModal = false;
  }

  downloadCatalog(language: 'en' | 'es') {
    const fileName = language === 'en' ? 'Catalog-Eng.pdf' : 'Catalog-Esp.pdf';
    const link = document.createElement('a');
    link.setAttribute('target', '_blank');
    link.setAttribute('href', `assets/photos/${fileName}`);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.showCatalogModal = false;
  }

  goToFaq() {
    this.router.navigate(['/'], { fragment: 'faq' });
  }
}

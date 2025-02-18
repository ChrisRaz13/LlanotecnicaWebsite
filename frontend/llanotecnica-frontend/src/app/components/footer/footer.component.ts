import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';


@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {
  currentYear = new Date().getFullYear();

  companyInfo = {
    phone: '+507 6566-4942',
    whatsapp: 'https://wa.me/50765664942',
    email: 'ventas@llanotecnica.com',
    address: 'Llanotecnica SA, Rio Chico, Calle Principal, Corregimiento de, Pacora, Provincia de Panamá, Panamá',
    socialLinks: {
      facebook: 'https://facebook.com/llanotecnica',
      instagram: 'https://instagram.com/llanotecnica'
    }
  };

  quickLinks = [
    { text: 'Home', route: '/' },
    { text: 'About Us', route: '/about-us' },
    { text: 'Products', route: '/products' },
    { text: 'Contact', route: '/contact' }
  ];

  products = [
    { text: 'MT-370 Mixer', route: '/products' },
    { text: 'MT-480 Mixer', route: '/products' },
    { text: 'Engines', route: '/products' }
  ];

  support = [
    { text: 'Mixer Manual', route: null },
    { text: 'FAQ', route: null },
    { text: 'Download Catalog', route: null }
  ];

  showManualModal = false;
  showCatalogModal = false;

  constructor(private router: Router) {}

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

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.css']
})
export class BannerComponent {
  phoneNumber = '+507 6566-4942';
  whatsappLink = 'https://wa.me/50765664942';
  socialLinks = {
    facebook: 'https://www.facebook.com/llanotecnica2007/',
    instagram: 'https://instagram.com/llanotecnica'
  };

  // Tracks whether the Catalog Modal is open
  showCatalogModal = false;

  // Toggle the catalog modal
  toggleCatalogModal() {
    this.showCatalogModal = !this.showCatalogModal;
  }

  // Download Catalog in English or Spanish
  downloadCatalog(language: 'en' | 'es'): void {
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
}

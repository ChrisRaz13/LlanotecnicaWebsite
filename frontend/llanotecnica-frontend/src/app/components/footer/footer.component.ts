import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

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
    email: 'info@llanotecnica.com',
    address: 'Panama City, Panama',
    socialLinks: {
      facebook: 'https://facebook.com/llanotecnica',
      instagram: 'https://instagram.com/llanotecnica'
    }
  };

  quickLinks = [
    { text: 'About Us', route: '/about' },
    { text: 'Products', route: '/products' },
    { text: 'Services', route: '/services' },
    { text: 'Contact', route: '/contact' }
  ];

  products = [
    { text: 'MT-370 Mixer', route: '/products/mt-370' },
    { text: 'MT-480 Mixer', route: '/products/mt-480' },
    { text: 'Spare Parts', route: '/products/parts' },
    { text: 'Accessories', route: '/products/accessories' }
  ];

  support = [
    { text: 'Technical Support', route: '/support' },
    { text: 'Maintenance Guide', route: '/maintenance' },
    { text: 'FAQ', route: '/faq' },
    { text: 'Download Catalog', route: '/catalog' }
  ];
}

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
  catalogPath = 'assets/downloads/catalog.pdf';
}

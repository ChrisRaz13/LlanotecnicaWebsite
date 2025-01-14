// banner.component.ts
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
  phoneNumber = '+1 (234) 567-890';
  socialLinks = {
    facebook: 'https://facebook.com/llanotecnica',
    instagram: 'https://instagram.com/llanotecnica'
  };
  catalogPath = 'assets/downloads/catalog.pdf';
}

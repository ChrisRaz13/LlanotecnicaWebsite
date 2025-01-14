import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  companyName = 'MixMaster Pro';
  products = [
    {
      title: 'Industrial Mixer X5000',
      description: 'Professional-grade cement mixer with 5000L capacity. Perfect for large construction projects.',
      features: ['5000L capacity', 'Heavy-duty motor', 'Digital controls'],
      icon: 'fas fa-cog'
    },
    {
      title: 'Portable Mix-2000',
      description: 'Compact and powerful mixer for medium-sized projects and residential use.',
      features: ['2000L capacity', 'Easy transport', 'Low maintenance'],
      icon: 'fas fa-truck'
    },
    {
      title: 'SmartMix Pro',
      description: 'Smart cement mixer with automated mixing cycles and remote monitoring.',
      features: ['3000L capacity', 'Smart controls', 'Mobile app integration'],
      icon: 'fas fa-mobile-alt'
    }
  ];

  testimonials = [
    {
      name: 'John Builder',
      company: 'BuildRight Construction',
      text: 'The X5000 has revolutionized our workflow. Reliable and efficient.'
    },
    {
      name: 'Sarah Chen',
      company: 'Chen Development Corp',
      text: 'Best investment weve made this year. Support team is excellent.'
    }
  ];
}

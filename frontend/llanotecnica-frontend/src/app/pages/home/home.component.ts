
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
  mixers = [
    {
      name: 'Concrete Mixer MT-370',
      description: 'Compact and powerful mixer perfect for small to medium projects',
      features: [
        'Ideal for residential construction',
        'Easy to transport and maneuver',
        'Durable steel construction'
      ],
      specs: {
        capacity: '370 Liters',
        enginePower: '7-9 HP',
        weight: 'Lightweight Design'
      },
      image: 'assets/photos/MT-370.jpg'
    },
    {
      name: 'Concrete Mixer MT-480',
      description: 'Heavy-duty mixer engineered for large commercial projects',
      features: [
        'Perfect for commercial construction',
        'Maximum mixing efficiency',
        'Heavy-duty construction'
      ],
      specs: {
        capacity: '480 Liters',
        enginePower: '13+ HP',
        weight: 'Industrial Grade'
      },
      image: 'assets/photos/MT-480.jpg'
    }
  ];

  benefits = [
    {
      title: 'Reliable Performance',
      description: 'Built with high-quality materials and components for consistent operation',
      icon: 'fas fa-cog'
    },
    {
      title: 'Easy Maintenance',
      description: 'Simple design allows for quick cleaning and routine maintenance',
      icon: 'fas fa-tools'
    },
    {
      title: 'Cost Effective',
      description: 'Maximize your investment with durable equipment built to last',
      icon: 'fas fa-dollar-sign'
    },
    {
      title: 'Technical Support',
      description: 'Expert assistance and spare parts readily available',
      icon: 'fas fa-headset'
    }
  ];

  features = [
    'Reinforced drum design',
    'Protected gear mechanism',
    'Enhanced safety features',
    'Efficient mixing paddles',
    'Multiple engine options',
    'Quick-release system'
  ];
}

// home.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, style, animate, transition, stagger, query } from '@angular/animations';
import { LucideAngularModule } from 'lucide-angular';

type FeatureCategory = 'safety' | 'performance' | 'design' | 'operation';
type CategoryType = FeatureCategory | 'all';

interface Feature {
  title: string;
  description: string;
  icon: string;
  highlight: string;
  category: FeatureCategory;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  animations: [
    trigger('cardAnimation', [
      transition(':enter', [
        query('.feature-card, .product-card', [
          style({ opacity: 0, transform: 'translateY(50px)' }),
          stagger(200, [
            animate('0.5s cubic-bezier(0.35, 0, 0.25, 1)',
              style({ opacity: 1, transform: 'translateY(0)' })
            )
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class HomeComponent {
  mixers = [
    {
      name: 'Concrete Mixer MT-370',
      description: 'Compact mixer perfect for small to medium projects',
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

  features: Feature[] = [
    {
      title: 'Reinforced Drum Design',
      description: 'Heavy-duty steel construction with double-reinforced joints and wear-resistant coating for maximum durability.',
      icon: 'fa-solid fa-shield',
      highlight: '50% increased lifespan',
      category: 'design'
    },
    {
      title: 'Protected Gear Mechanism',
      description: 'Sealed gearbox system with automatic lubrication and debris protection for minimal maintenance.',
      icon: 'fa-solid fa-gears',
      highlight: '10,000+ operation hours',
      category: 'performance'
    },
    {
      title: 'Enhanced Safety Features',
      description: 'Multiple emergency stops, protective guards, and safety interlocks ensure operator protection.',
      icon: 'fa-solid fa-shield-halved',
      highlight: 'Triple safety system',
      category: 'safety'
    },
    {
      title: 'Efficient Mixing Paddles',
      description: 'Optimized paddle design with anti-stick coating ensures thorough mixing and easy cleaning.',
      icon: 'fa-solid fa-rotate',
      highlight: '30% faster mixing',
      category: 'performance'
    },
    {
      title: 'Multiple Engine Options',
      description: 'Choose from diesel, gasoline, or electric power options to match your site requirements.',
      icon: 'fa-solid fa-gauge-high',
      highlight: '3 power options',
      category: 'operation'
    },
    {
      title: 'Quick-Release System',
      description: 'Patented quick-lock mechanism enables tool-free drum removal and maintenance access.',
      icon: 'fa-solid fa-unlock',
      highlight: '5-minute setup time',
      category: 'operation'
    }
  ];

  activeCategory: CategoryType = 'all';

  get featureCategories(): CategoryType[] {
    const categories: CategoryType[] = ['all'];
    const uniqueCategories = new Set(this.features.map(feature => feature.category));
    return [...categories, ...uniqueCategories];
  }

  filterFeatures(category: CategoryType): void {
    this.activeCategory = category;
  }

  get filteredFeatures(): Feature[] {
    return this.activeCategory === 'all'
      ? this.features
      : this.features.filter(feature => feature.category === this.activeCategory);
  }

  formatCategory(category: string): string {
    return category.charAt(0).toUpperCase() + category.slice(1);
  }
}

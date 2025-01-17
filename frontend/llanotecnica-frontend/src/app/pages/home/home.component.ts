import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { animate, query, stagger, style, transition, trigger } from '@angular/animations';

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
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  animations: [
    trigger('cardAnimation', [
      transition(':enter', [
        query('.feature-card', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger(100, [
            animate('0.5s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class HomeComponent implements OnInit {
  activeTab: 'video' | 'products' = 'video';
  videoUrl = 'assets/videos/mixer-showcase.mp4';

  heroWords = [
    { text: 'Reliable', class: '' },
    { text: 'Durable', class: '' },
    { text: 'Quality', class: '' },
    { text: 'Mixers', class: 'emphasis' },
  ];

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

  ngOnInit(): void {
    this.startWordAnimations();
  }

  private startWordAnimations(): void {
    const fillDelay = 600;
    const totalFillDuration = fillDelay * this.heroWords.length;
    const smoothOverDelay = fillDelay * this.heroWords.length + 100;

    // Animate words from bottom to top
    this.heroWords
    .slice()
    .reverse()
    .forEach((_, index) => {
      setTimeout(() => {
        const elementIndex = this.heroWords.length - 1 - index;
        const element = document.querySelector(`.hero-word:nth-child(${elementIndex + 1})`) as HTMLElement;
        if (element) {
          element.classList.add('animate');
        }
      }, index * fillDelay);
    });

  // After all words are filled, trigger the smooth-over effect
  setTimeout(() => {
    this.heroWords.forEach((_, index) => {
      const element = document.querySelector(`.hero-word:nth-child(${index + 1})`) as HTMLElement;
      if (element) {
        element.classList.add('smooth-over');
      }
    });
  }, totalFillDuration + smoothOverDelay);
}

  setActiveTab(tab: 'video' | 'products'): void {
    this.activeTab = tab;
  }

  get featureCategories(): CategoryType[] {
    const categories: CategoryType[] = ['all'];
    const uniqueCategories = new Set(this.features.map((feature) => feature.category));
    return [...categories, ...uniqueCategories];
  }

  filterFeatures(category: CategoryType): void {
    this.activeCategory = category;
  }

  get filteredFeatures(): Feature[] {
    return this.activeCategory === 'all'
      ? this.features
      : this.features.filter((feature) => feature.category === this.activeCategory);
  }

  formatCategory(category: string): string {
    return category.charAt(0).toUpperCase() + category.slice(1);
  }
}

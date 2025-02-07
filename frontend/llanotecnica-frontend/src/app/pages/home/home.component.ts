import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
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

interface Product {
  name: string;
  description: string;
  features: string[];
  specs: {
    capacity: string;
    enginePower: string;
    weight: string;
  };
  image: string;
}

interface Benefit {
  title: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [
    trigger('cardAnimation', [
      transition(':enter', [
        query('.feature-card', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger(100, [
            animate('0.5s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ]),
      transition(':leave', [
        query('.feature-card', [
          stagger(100, [
            animate('0.5s ease-out', style({ opacity: 0, transform: 'translateY(20px)' }))
          ])
        ], { optional: true })
      ])
    ]),
    trigger('fadeSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.6s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class HomeComponent implements OnInit {
  isBrowser = false;
  isVideoPlaying = false;
  activeTab: 'video' | 'products' = 'video';
  activeSection = 'hero';
  activeCategory: CategoryType = 'all';
  videoUrl = 'assets/videos/mixer-showcase.mp4';

  readonly heroWords = [
    { text: 'Reliable', class: '' },
    { text: 'Durable', class: '' },
    { text: 'Quality', class: '' },
    { text: 'Mixers', class: 'emphasis' }
  ];

  readonly mixers: Product[] = [
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

  readonly benefits: Benefit[] = [
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

  readonly features: Feature[] = [
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

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.initializeAnimations();
      this.observeScroll();
    }
  }

  private initializeAnimations(): void {
    const fillDelay = 600;
    const totalDuration = fillDelay * this.heroWords.length;
    const smoothDelay = totalDuration + 100;

    this.heroWords.slice().reverse().forEach((_, index) => {
      setTimeout(() => {
        const elementIndex = this.heroWords.length - 1 - index;
        const element = document.querySelector(`.hero-word:nth-child(${elementIndex + 1})}`);
        element?.classList.add('animate');
      }, index * fillDelay);
    });

    setTimeout(() => {
      this.heroWords.forEach((_, index) => {
        const element = document.querySelector(`.hero-word:nth-child(${index + 1})`);
        element?.classList.add('smooth-over');
      });
    }, smoothDelay);
  }

  private observeScroll(): void {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            this.activeSection = entry.target.id;
          }
        });
      },
      { threshold: 0.3 }
    );

    document.querySelectorAll('section[id]').forEach(section => observer.observe(section));
  }

  setActiveTab(tab: 'video' | 'products'): void {
    this.activeTab = tab;
  }

  get featureCategories(): CategoryType[] {
    return ['all', ...new Set(this.features.map(f => f.category))];
  }

  filterFeatures(category: CategoryType): void {
    this.activeCategory = category;
  }

  get filteredFeatures(): Feature[] {
    return this.activeCategory === 'all'
      ? this.features
      : this.features.filter(f => f.category === this.activeCategory);
  }

  formatCategory(category: string): string {
    return category.charAt(0).toUpperCase() + category.slice(1);
  }

  toggleVideo(): void {
    this.isVideoPlaying = !this.isVideoPlaying;
    const video = document.querySelector('video');
    if (video) {
      this.isVideoPlaying ? video.play() : video.pause();
    }
  }

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

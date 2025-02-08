import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { animate, query, stagger, style, transition, trigger, state } from '@angular/animations';
import { Meta, Title } from '@angular/platform-browser';

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

interface FAQ {
  question: string;
  answer: string;
  videoUrl?: string;
  posterImage?: string;
}

interface Flag {
  country: string;
  code: string;
  region: 'northAmerica' | 'caribbean' | 'centralAmerica' | 'southAmerica';
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.6s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-30px)' }),
        animate('0.8s ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ]),
    trigger('staggerFade', [
      transition(':enter', [
        query('.feature-card', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger(100, [
            animate('0.5s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ]),
    trigger('scrollIndicator', [
      state('visible', style({ opacity: 1, transform: 'translateY(0)' })),
      state('hidden', style({ opacity: 0, transform: 'translateY(20px)' })),
      transition('visible <=> hidden', animate('0.3s ease-in-out'))
    ])
  ]
})
export class HomeComponent implements OnInit, OnDestroy {
  // Expose Math to template
  readonly Math = Math;
  @ViewChild('demoVideo') demoVideo?: ElementRef<HTMLVideoElement>;
  @ViewChild('heroVideo') heroVideo?: ElementRef<HTMLVideoElement>;

  activeSection = 'hero';
  activeFaq: number | null = null;
  isVideoPlaying = false;
  showScrollIndicator = true;
  currentHeroBackground = 0;
  private scrollInterval: any;

  readonly flags: Flag[] = [
    { country: 'United States', code: 'us', region: 'northAmerica' },
    { country: 'Canada', code: 'ca', region: 'northAmerica' },
    { country: 'Mexico', code: 'mx', region: 'northAmerica' },
    { country: 'Brazil', code: 'br', region: 'southAmerica' },
    { country: 'Argentina', code: 'ar', region: 'southAmerica' },
    { country: 'Chile', code: 'cl', region: 'southAmerica' },
    { country: 'Colombia', code: 'co', region: 'southAmerica' },
    { country: 'Peru', code: 'pe', region: 'southAmerica' },
    { country: 'Venezuela', code: 've', region: 'southAmerica' },
    { country: 'Jamaica', code: 'jm', region: 'caribbean' },
    { country: 'Dominican Republic', code: 'do', region: 'caribbean' },
    { country: 'Panama', code: 'pa', region: 'centralAmerica' },
    { country: 'Costa Rica', code: 'cr', region: 'centralAmerica' },
    { country: 'Guatemala', code: 'gt', region: 'centralAmerica' },
    { country: 'Honduras', code: 'hn', region: 'centralAmerica' },
    { country: 'El Salvador', code: 'sv', region: 'centralAmerica' },
    { country: 'Nicaragua', code: 'ni', region: 'centralAmerica' },
    { country: 'Belize', code: 'bz', region: 'centralAmerica' }
  ];

  // Create duplicated array for seamless scrolling
  duplicatedFlags = [...this.flags, ...this.flags];

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
        weight: '750 kg'
      },
      image: '/assets/photos/MT-370.1.jpg'
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
        weight: '950 kg'
      },
      image: '/assets/photos/MT-480.jpg'
    }
  ];

  readonly features: Feature[] = [
    {
      title: 'Reinforced Drum Design',
      description: 'Heavy-duty steel construction with double-reinforced joints and wear-resistant coating.',
      icon: 'fa-solid fa-shield',
      highlight: '50% increased lifespan',
      category: 'design'
    },
    {
      title: 'Protected Gear Mechanism',
      description: 'Sealed gearbox system with automatic lubrication and debris protection.',
      icon: 'fa-solid fa-gears',
      highlight: '10,000+ operation hours',
      category: 'performance'
    },
    {
      title: 'Enhanced Safety Features',
      description: 'Multiple emergency stops, protective guards, and safety interlocks for operator protection.',
      icon: 'fa-solid fa-shield-halved',
      highlight: 'Triple safety system',
      category: 'safety'
    }
  ];

  readonly faqs: FAQ[] = [
    {
      question: 'How do I operate the MT-370 and MT-480 mixers?',
      answer: 'Watch our detailed demonstration video below:',
      videoUrl: '/assets/videos/instruction.mp4',
      posterImage: '/assets/photos/instruction-poster.png'
    },
    {
      question: 'What maintenance is required?',
      answer: 'Regular maintenance includes daily cleaning, weekly lubrication checks, and monthly mechanical inspections.'
    },
    {
      question: 'Which mixer is right for my project?',
      answer: 'The MT-370 is ideal for residential and small commercial projects, while the MT-480 is designed for larger commercial applications.'
    },
    {
      question: 'What warranty do you offer?',
      answer: 'We provide a comprehensive 2-year warranty on all components, with extended warranty options available.'
    },
    {
      question: 'Are spare parts readily available?',
      answer: 'Yes, we maintain a complete inventory of spare parts with next-day delivery available for most components.'
    }
  ];

  readonly companyStats = {
    yearsExperience: '20+',
    mixersDelivered: '5000+',
    clientSatisfaction: '98%'
  };

  readonly heroBackgrounds = [
    {
      type: 'image',
      src: '/assets/photos/twomixers1.jpg',
      alt: 'Industrial cement mixer in action'
    },
    {
      type: 'video',
      src: '/assets/videos/homepage3.mp4',
      poster: '/assets/photos/hero-video-poster.jpg'
    }
  ];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private meta: Meta,
    private title: Title
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeScrollObserver();
      this.setupScrollIndicator();
      this.setupSEO();
      this.initializeFlagCarousel();
    }
  }

  ngOnDestroy(): void {
    if (this.scrollInterval) {
      clearInterval(this.scrollInterval);
    }
  }

  private initializeFlagCarousel(): void {
    // Duplicate flags for seamless scrolling
    this.duplicatedFlags = [...this.flags, ...this.flags];
    this.startAutoScroll();
  }

  private startAutoScroll(): void {
    const flagContainer = document.querySelector('.flag-carousel-inner');
    if (flagContainer) {
      flagContainer.classList.add('scrolling');
    }
  }

  getFlagUrl(code: string): string {
    return `/assets/flags/${code.toLowerCase()}.svg`;
  }

  private setupSEO(): void {
    this.title.setTitle('Professional Concrete Mixers | Industrial Mixing Solutions');
    this.meta.updateTag({
      name: 'description',
      content: 'Professional-grade concrete mixers delivering reliability and performance for over two decades. Explore our range of industrial mixing solutions.'
    });

    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'Industrial Concrete Mixers',
      description: 'Professional-grade concrete mixers for construction projects',
      manufacturer: {
        '@type': 'Organization',
        name: 'Your Company Name'
      }
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(structuredData);
    document.head.appendChild(script);
  }

  private setupScrollIndicator(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', () => {
        this.showScrollIndicator = window.scrollY < 100;
      });
    }
  }

  private initializeScrollObserver(): void {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.activeSection = entry.target.id;
          }
        });
      },
      { threshold: 0.3 }
    );

    document.querySelectorAll('section[id]').forEach(section => {
      observer.observe(section);
    });
  }

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  toggleFaq(index: number): void {
    if (index === 0 && this.activeFaq === 0) {
      if (this.demoVideo?.nativeElement) {
        this.demoVideo.nativeElement.pause();
        this.demoVideo.nativeElement.currentTime = 0;
      }
    }
    this.activeFaq = this.activeFaq === index ? null : index;
  }

  playDemoVideo(): void {
    this.scrollToSection('video');
    setTimeout(() => {
      const video = document.querySelector('video');
      if (video) {
        video.play();
      }
    }, 1000);
  }

  toggleHeroBackground(): void {
    this.currentHeroBackground =
      (this.currentHeroBackground + 1) % this.heroBackgrounds.length;
  }
}

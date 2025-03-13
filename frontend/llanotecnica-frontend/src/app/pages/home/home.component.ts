import {
  Component,
  OnInit,
  OnDestroy,
  Inject,
  PLATFORM_ID,
  ViewChild,
  ViewChildren,
  ElementRef,
  QueryList,
  HostListener,
  AfterViewInit
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  animate,
  query,
  stagger,
  style,
  transition,
  trigger,
  state
} from '@angular/animations';
import { Meta, Title } from '@angular/platform-browser';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

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
  shortDesc?: string;
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

interface CompanyStat {
  icon: string;
  value: string;
  label: string;
  detail: string;
}

interface CustomerReview {
  name: string;
  company: string;
  text: string;
  rating: number;
  avatar: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
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
    trigger('staggerFadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('0.4s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('scrollIndicator', [
      state('visible', style({ opacity: 1, transform: 'translateY(0)' })),
      state('hidden', style({ opacity: 0, transform: 'translateY(20px)' })),
      transition('visible <=> hidden', animate('0.3s ease-in-out'))
    ]),
    trigger('productFadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate(
          '0.8s cubic-bezier(0.21, 1.02, 0.73, 1)',
          style({ opacity: 1, transform: 'translateY(0)' })
        )
      ])
    ]),
    trigger('ctaFadeIn', [
      transition(':enter', [
        query('.cta-button', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger(150, [
            animate(
              '0.5s cubic-bezier(0.21, 1.02, 0.73, 1)',
              style({ opacity: 1, transform: 'translateY(0)' })
            )
          ])
        ], { optional: true })
      ])
    ]),
    trigger('buttonReveal', [
      state('void', style({
        opacity: 0,
        transform: 'translateY(20px)'
      })),
      state('visible', style({
        opacity: 1,
        transform: 'translateY(0)'
      })),
      transition('void => visible', [
        animate('0.4s cubic-bezier(0.21, 1.02, 0.73, 1)')
      ])
    ]),
    trigger('productCardHover', [
      state('default', style({
        transform: 'translateY(0)',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)'
      })),
      state('hovered', style({
        transform: 'translateY(-12px)',
        boxShadow: '0 20px 32px rgba(0, 0, 0, 0.12)'
      })),
      transition('default <=> hovered', [
        animate('0.3s cubic-bezier(0.21, 1.02, 0.73, 1)')
      ])
    ]),
    trigger('productTransition', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95)' }),
        animate('0.5s cubic-bezier(0.34, 1.56, 0.64, 1)', style({ opacity: 1, transform: 'scale(1)' }))
      ]),
      transition(':leave', [
        animate('0.3s cubic-bezier(0.21, 1.02, 0.73, 1)', style({ opacity: 0, transform: 'scale(0.95)' }))
      ])
    ]),
    trigger('featureHighlight', [
      state('inactive', style({
        opacity: '0.7',
        transform: 'scale(1)'
      })),
      state('active', style({
        opacity: '1',
        transform: 'scale(1.05)'
      })),
      transition('inactive <=> active', [
        animate('0.2s ease-out')
      ])
    ]),
    trigger('statFadeIn', [
      transition(':enter', [
        query('.stat-card', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger(100, [
            animate('0.5s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {
  readonly Math = Math;
  @ViewChild('demoVideo') demoVideo?: ElementRef<HTMLVideoElement>;
  @ViewChild('heroVideo') heroVideo?: ElementRef<HTMLVideoElement>;
  @ViewChildren('productCard') productCards!: QueryList<ElementRef>;

  activeSection = 'hero';
  activeFaq: number | null = null;
  isVideoPlaying = false;
  showScrollIndicator = true;
  currentHeroBackground = 0;
  private scrollInterval: any;

  // Product section variables
  selectedProductIndex = 0;
  productZoomLevel = 1;
  productRotation = 0;

  // Review section variables
  currentReviewIndex = 0;

  // Modal state
  isModalOpen = false;

  productCardStates: string[] = ['default', 'default'];
  buttonStates: string[] = ['void', 'void', 'void'];
  isComparisonMode = false;
  hoveredProduct: number | null = null;
  activeFeatures: boolean[] = [];
  selectedProduct: Product | null = null;

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

  duplicatedFlags = [...this.flags, ...this.flags];

  mixers: Product[] = [];
  features: Feature[] = [];
  faqs: FAQ[] = [];
  companyStats: CompanyStat[] = [];

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

  readonly customerReviews: CustomerReview[] = [
    {
      name: 'Michael Rodriguez',
      company: 'Rodriguez Construction',
      text: 'The MT-370 has transformed our residential projects. Efficient, reliable, and surprisingly easy to maintain. Worth every penny.',
      rating: 5,
      avatar: '/assets/photos/reviewer-1.jpg'
    },
    {
      name: 'Sarah Williams',
      company: 'Williams & Sons Contractors',
      text: 'After trying multiple mixers, we settled on the MT-480 for our commercial projects. Its capacity and durability have significantly improved our workflow.',
      rating: 5,
      avatar: '/assets/photos/reviewer-2.jpg'
    },
    {
      name: 'David Chen',
      company: 'Pacific Builders Inc.',
      text: 'The customer service is just as impressive as the mixers themselves. When we needed parts, they arrived within days. Highly recommend.',
      rating: 5,
      avatar: '/assets/photos/reviewer-3.jpg'
    }
  ];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private meta: Meta,
    private title: Title,
    private router: Router,
    private route: ActivatedRoute,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeScrollObserver();
      this.setupScrollIndicator();
      this.setupSEO();
      this.initializeFlagCarousel();
      this.initializeReviewSlider();

      // Load translation data for dynamic content
      this.loadTranslations();

      // Subscribe to language changes to update content
      this.translate.onLangChange.subscribe(() => {
        this.loadTranslations();
        this.setupSEO(); // Update SEO meta tags
      });
    }
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Check for fragment after view initialization
      this.route.fragment.subscribe(fragment => {
        if (fragment === 'comparison') {
          // Wait for DOM to be fully rendered
          setTimeout(() => {
            const element = document.getElementById('comparison');
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }, 800);
        }
      });
    }
  }

  ngOnDestroy(): void {
    if (this.scrollInterval) {
      clearInterval(this.scrollInterval);
    }
  }

  // Load translated content for dynamic elements
  private loadTranslations(): void {
    // Load features translations
    this.loadFeaturesTranslations();

    // Load mixers translations
    this.loadMixersTranslations();

    // Load FAQ translations
    this.loadFaqsTranslations();

    // Load company stats translations
    this.loadCompanyStatsTranslations();
  }

  private loadFeaturesTranslations(): void {
    this.translate.get([
      'HOME_PAGE.FEATURES.DRUM_DESIGN.TITLE',
      'HOME_PAGE.FEATURES.DRUM_DESIGN.DESCRIPTION',
      'HOME_PAGE.FEATURES.DRUM_DESIGN.HIGHLIGHT',
      'HOME_PAGE.FEATURES.GEAR_MECHANISM.TITLE',
      'HOME_PAGE.FEATURES.GEAR_MECHANISM.DESCRIPTION',
      'HOME_PAGE.FEATURES.GEAR_MECHANISM.HIGHLIGHT',
      'HOME_PAGE.FEATURES.SAFETY.TITLE',
      'HOME_PAGE.FEATURES.SAFETY.DESCRIPTION',
      'HOME_PAGE.FEATURES.SAFETY.HIGHLIGHT'
    ]).subscribe(translations => {
      this.features = [
        {
          title: translations['HOME_PAGE.FEATURES.DRUM_DESIGN.TITLE'] || 'Reinforced Drum Design',
          description: translations['HOME_PAGE.FEATURES.DRUM_DESIGN.DESCRIPTION'] || 'Heavy-duty steel construction with double-reinforced joints and wear-resistant coating.',
          icon: 'fa-solid fa-shield',
          highlight: translations['HOME_PAGE.FEATURES.DRUM_DESIGN.HIGHLIGHT'] || '50% increased lifespan',
          category: 'design'
        },
        {
          title: translations['HOME_PAGE.FEATURES.GEAR_MECHANISM.TITLE'] || 'Protected Gear Mechanism',
          description: translations['HOME_PAGE.FEATURES.GEAR_MECHANISM.DESCRIPTION'] || 'Sealed gearbox system with automatic lubrication and debris protection.',
          icon: 'fa-solid fa-gears',
          highlight: translations['HOME_PAGE.FEATURES.GEAR_MECHANISM.HIGHLIGHT'] || '10,000+ operation hours',
          category: 'performance'
        },
        {
          title: translations['HOME_PAGE.FEATURES.SAFETY.TITLE'] || 'Enhanced Safety Features',
          description: translations['HOME_PAGE.FEATURES.SAFETY.DESCRIPTION'] || 'Multiple emergency stops, protective guards, and safety interlocks for operator protection.',
          icon: 'fa-solid fa-shield-halved',
          highlight: translations['HOME_PAGE.FEATURES.SAFETY.HIGHLIGHT'] || 'Triple safety system',
          category: 'safety'
        }
      ];
    });
  }

  private loadMixersTranslations(): void {
    this.translate.get([
      'HOME_PAGE.MIXERS.MT370.NAME',
      'HOME_PAGE.MIXERS.MT370.SHORT_DESC',
      'HOME_PAGE.MIXERS.MT370.DESC',
      'HOME_PAGE.MIXERS.MT370.FEATURES.1',
      'HOME_PAGE.MIXERS.MT370.FEATURES.2',
      'HOME_PAGE.MIXERS.MT370.FEATURES.3',
      'HOME_PAGE.MIXERS.MT370.FEATURES.4',
      'HOME_PAGE.MIXERS.MT370.FEATURES.5',
      'HOME_PAGE.MIXERS.MT370.SPECS.CAPACITY',
      'HOME_PAGE.MIXERS.MT370.SPECS.POWER',
      'HOME_PAGE.MIXERS.MT370.SPECS.WEIGHT',
      'HOME_PAGE.MIXERS.MT480.NAME',
      'HOME_PAGE.MIXERS.MT480.SHORT_DESC',
      'HOME_PAGE.MIXERS.MT480.DESC',
      'HOME_PAGE.MIXERS.MT480.FEATURES.1',
      'HOME_PAGE.MIXERS.MT480.FEATURES.2',
      'HOME_PAGE.MIXERS.MT480.FEATURES.3',
      'HOME_PAGE.MIXERS.MT480.FEATURES.4',
      'HOME_PAGE.MIXERS.MT480.FEATURES.5',
      'HOME_PAGE.MIXERS.MT480.SPECS.CAPACITY',
      'HOME_PAGE.MIXERS.MT480.SPECS.POWER',
      'HOME_PAGE.MIXERS.MT480.SPECS.WEIGHT'
    ]).subscribe(translations => {
      this.mixers = [
        {
          name: translations['HOME_PAGE.MIXERS.MT370.NAME'] || 'Concrete Mixer MT-370',
          shortDesc: translations['HOME_PAGE.MIXERS.MT370.SHORT_DESC'] || 'Compact Mixer',
          description: translations['HOME_PAGE.MIXERS.MT370.DESC'] || 'Compact mixer perfect for small to medium projects, engineered for versatility and reliability in residential construction.',
          features: [
            translations['HOME_PAGE.MIXERS.MT370.FEATURES.1'] || 'Ideal for residential construction',
            translations['HOME_PAGE.MIXERS.MT370.FEATURES.2'] || 'Easy to transport and maneuver',
            translations['HOME_PAGE.MIXERS.MT370.FEATURES.3'] || 'Durable steel construction',
            translations['HOME_PAGE.MIXERS.MT370.FEATURES.4'] || 'Low maintenance requirements',
            translations['HOME_PAGE.MIXERS.MT370.FEATURES.5'] || 'Fuel-efficient operation'
          ],
          specs: {
            capacity: translations['HOME_PAGE.MIXERS.MT370.SPECS.CAPACITY'] || '370 Liters',
            enginePower: translations['HOME_PAGE.MIXERS.MT370.SPECS.POWER'] || '7-9 HP',
            weight: translations['HOME_PAGE.MIXERS.MT370.SPECS.WEIGHT'] || '750 kg'
          },
          image: '/assets/photos/MT-370.jpg'
        },
        {
          name: translations['HOME_PAGE.MIXERS.MT480.NAME'] || 'Concrete Mixer MT-480',
          shortDesc: translations['HOME_PAGE.MIXERS.MT480.SHORT_DESC'] || 'Commercial Mixer',
          description: translations['HOME_PAGE.MIXERS.MT480.DESC'] || 'Heavy-duty mixer engineered for large commercial projects, delivering maximum mixing efficiency and durability for demanding worksites.',
          features: [
            translations['HOME_PAGE.MIXERS.MT480.FEATURES.1'] || 'Perfect for commercial construction',
            translations['HOME_PAGE.MIXERS.MT480.FEATURES.2'] || 'Maximum mixing efficiency',
            translations['HOME_PAGE.MIXERS.MT480.FEATURES.3'] || 'Heavy-duty construction',
            translations['HOME_PAGE.MIXERS.MT480.FEATURES.4'] || 'Enhanced durability components',
            translations['HOME_PAGE.MIXERS.MT480.FEATURES.5'] || 'High-torque power system'
          ],
          specs: {
            capacity: translations['HOME_PAGE.MIXERS.MT480.SPECS.CAPACITY'] || '480 Liters',
            enginePower: translations['HOME_PAGE.MIXERS.MT480.SPECS.POWER'] || '13+ HP',
            weight: translations['HOME_PAGE.MIXERS.MT480.SPECS.WEIGHT'] || '950 kg'
          },
          image: '/assets/photos/MT-480.jpg'
        }
      ];
    });
  }

  private loadFaqsTranslations(): void {
    // For demonstration, we'll only load the first FAQ, but in a real app you would load all
    this.translate.get([
      'HOME_PAGE.FAQ_SECTION.FAQ_1_QUESTION',
      'HOME_PAGE.FAQ_SECTION.FAQ_1_ANSWER'
    ]).subscribe(translations => {
      // In a real application, you'd load all FAQs similarly
      this.faqs = [
        {
          question: translations['HOME_PAGE.FAQ_SECTION.FAQ_1_QUESTION'] || 'How do I operate the MT-370 and MT-480 mixers?',
          answer: translations['HOME_PAGE.FAQ_SECTION.FAQ_1_ANSWER'] || 'Watch our detailed demonstration video below:',
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
          answer: 'Our concrete mixers are covered by a 6-month warranty against any manufacturing defects. For more information, please contact technical support.'
        },
        {
          question: 'Are spare parts readily available?',
          answer: 'Yes, we maintain a complete inventory of spare parts with delivery on request.'
        }
      ];
    });
  }

  private loadCompanyStatsTranslations(): void {
    this.translate.get([
      'HOME_PAGE.COMPANY_SECTION.STATS_YEARS_EXPERIENCE',
      'HOME_PAGE.COMPANY_SECTION.STATS_MIXERS_DELIVERED',
      'HOME_PAGE.COMPANY_SECTION.STATS_COUNTRIES_SERVED',
      'HOME_PAGE.COMPANY_SECTION.DETAIL_YEARS',
      'HOME_PAGE.COMPANY_SECTION.DETAIL_MIXERS',
      'HOME_PAGE.COMPANY_SECTION.DETAIL_COUNTRIES'
    ]).subscribe(translations => {
      this.companyStats = [
        {
          icon: '🏭',
          value: '20+',
          label: translations['HOME_PAGE.COMPANY_SECTION.STATS_YEARS_EXPERIENCE'] || 'Years Experience',
          detail: translations['HOME_PAGE.COMPANY_SECTION.DETAIL_YEARS'] || 'Industry leadership since 2002'
        },
        {
          icon: '🚛',
          value: '5000+',
          label: translations['HOME_PAGE.COMPANY_SECTION.STATS_MIXERS_DELIVERED'] || 'Mixers Delivered',
          detail: translations['HOME_PAGE.COMPANY_SECTION.DETAIL_MIXERS'] || 'Serving global construction needs'
        },
        {
          icon: '🌍',
          value: '30+',
          label: translations['HOME_PAGE.COMPANY_SECTION.STATS_COUNTRIES_SERVED'] || 'Countries Served',
          detail: translations['HOME_PAGE.COMPANY_SECTION.DETAIL_COUNTRIES'] || 'Global presence and support'
        }
      ];
    });
  }

  // Method for scrolling to comparison section
  scrollToComparison(): void {
    // Navigate to products page with a fragment identifier
    this.router.navigate(['/products'], { fragment: 'comparison' });

    this.trackEvent('comparison_clicked', {
      location: 'products_section',
      button_type: 'accent'
    });
  }

  // Added for modal functionality with ESC key
  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.isModalOpen) {
      this.closeCatalogModal();
    }
  }

  // Modal backdrop click handler
  onModalBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.closeCatalogModal();
    }
  }

  // Modal open/close methods
  openCatalogModal(): void {
    this.isModalOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeCatalogModal(): void {
    this.isModalOpen = false;
    document.body.style.overflow = 'auto';
  }

  // Added for product details navigation
  viewProductDetails(product: Product): void {
    this.router.navigate(['/products']);

    this.trackEvent('view_product_details', {
      product_name: product.name,
      source: 'product_card'
    });
  }

  // Helper method to create URL-friendly slugs
  private getProductSlug(productName: string): string {
    return productName
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
  }

  // Product selector methods
  selectProduct(index: number): void {
    this.selectedProductIndex = index;
    this.productZoomLevel = 1;
    this.productRotation = 0;

    this.trackEvent('product_selected', {
      product_name: this.mixers[index].name
    });
  }

  // Product view control methods
  rotateProduct(direction: 'left' | 'right'): void {
    const rotationAmount = direction === 'left' ? -90 : 90;
    this.productRotation = (this.productRotation + rotationAmount) % 360;

    const productImageContainer = document.querySelector('.product-display.active');
    if (productImageContainer) {
      (productImageContainer as HTMLElement).style.transform = `rotateY(${this.productRotation}deg) scale(${this.productZoomLevel})`;
    }
  }

  zoomProduct(action: 'in' | 'out'): void {
    const zoomFactor = action === 'in' ? 0.1 : -0.1;
    const newZoom = this.productZoomLevel + zoomFactor;

    // Limit zoom range
    if (newZoom >= 0.5 && newZoom <= 1.5) {
      this.productZoomLevel = newZoom;

      const productImageContainer = document.querySelector('.product-display.active');
      if (productImageContainer) {
        (productImageContainer as HTMLElement).style.transform = `rotateY(${this.productRotation}deg) scale(${this.productZoomLevel})`;
      }
    }
  }

  // Review slider methods
  nextReview(): void {
    this.currentReviewIndex = (this.currentReviewIndex + 1) % this.customerReviews.length;
    this.updateReviewSlider();
  }

  prevReview(): void {
    this.currentReviewIndex = (this.currentReviewIndex - 1 + this.customerReviews.length) % this.customerReviews.length;
    this.updateReviewSlider();
  }

  goToReview(index: number): void {
    this.currentReviewIndex = index;
    this.updateReviewSlider();
  }

  private updateReviewSlider(): void {
    const slider = document.querySelector('.reviews-slider');
    if (slider) {
      const reviewWidth = slider.querySelector('.review-card')?.clientWidth || 0;
      const translateX = -this.currentReviewIndex * (reviewWidth + 20); // Adding gap

      const track = slider.querySelector('.review-track') as HTMLElement;
      if (track) {
        track.style.transform = `translateX(${translateX}px)`;
      }
    }
  }

  private initializeReviewSlider(): void {
    // Start automatic slideshow
    setInterval(() => {
      this.nextReview();
    }, 7000);
  }

  // consultation method
  requestConsultation(): void {
    this.router.navigate(['/contact'], {
      queryParams: {
        type: 'consultation',
        source: 'product_comparison'
      }
    });

    this.trackEvent('consultation_request', {
      source: 'comparison_section'
    });
  }

  private initializeFlagCarousel(): void {
    this.duplicatedFlags = [...this.flags, ...this.flags];
    this.startAutoScroll();
  }

  private startAutoScroll(): void {
    const flagContainer = document.querySelector('.flag-carousel-inner');
    if (flagContainer) {
      flagContainer.classList.add('scrolling');
    }
  }

  private trackEvent(action: string, data?: any): void {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', action, {
        ...data,
        source: 'products_section'
      });
    }
  }

  private setupSEO(): void {
    // Use TranslateService for SEO titles and descriptions
    this.translate.get('HOME_PAGE.SEO.TITLE').subscribe((res: string) => {
      if (res) {
        this.title.setTitle(res);
      } else {
        // Fallback if translation key doesn't exist
        this.title.setTitle('Professional Concrete Mixers | Industrial Mixing Solutions');
      }
    });

    this.translate.get('HOME_PAGE.SEO.DESCRIPTION').subscribe((res: string) => {
      if (res) {
        this.meta.updateTag({
          name: 'description',
          content: res
        });
      } else {
        // Fallback if translation key doesn't exist
        this.meta.updateTag({
          name: 'description',
          content: 'Professional-grade concrete mixers delivering reliability and performance for over two decades. Explore our range of industrial mixing solutions.'
        });
      }
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

  requestQuote(): void {
    this.router.navigate(['/contact'], {
      queryParams: {
        type: 'quote',
        source: 'home_page'
      }
    });

    this.trackEvent('quote_request_clicked', {
      location: 'home_page',
      button_type: 'primary'
    });
  }

  navigateToContact(): void {
    this.requestQuote();
  }

  // Updated to use modal
  downloadCatalog(): void {
    this.openCatalogModal();

    this.trackEvent('catalog_download_clicked', {
      location: 'products_section',
      button_type: 'secondary'
    });
  }

  navigateToComparison(): void {
    this.scrollToSection('comparison');

    this.trackEvent('comparison_clicked', {
      location: 'products_section',
      button_type: 'accent'
    });
  }

  trackStatBy(index: number, stat: CompanyStat): string {
    return stat.label;
  }
}

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

type FeatureCategory = 'safety' | 'performance' | 'design' | 'operation';
type CategoryType = FeatureCategory | 'all';

interface Feature {
  title: string;
  description: string;
  icon: string;
  highlight: string;
  category: FeatureCategory;
  detailedDescription?: string;
  techSpecs?: { label: string; value: string }[];
  imageUrl?: string;
  animations?: string[];
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
  imports: [CommonModule, RouterModule],
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
    ]),
    trigger('featureDetailTransition', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95)' }),
        animate('0.5s cubic-bezier(0.34, 1.56, 0.64, 1)', style({ opacity: 1, transform: 'scale(1)' }))
      ]),
      transition(':leave', [
        animate('0.3s cubic-bezier(0.21, 1.02, 0.73, 1)', style({ opacity: 0, transform: 'scale(0.95)' }))
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

  // Feature section variables
  activeFeatureCategory: CategoryType = 'all';
  activeFeatureIndex: number | null = null;

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

  readonly mixers: Product[] = [
    {
      name: 'Concrete Mixer MT-370',
      shortDesc: 'Compact Mixer',
      description: 'Compact mixer perfect for small to medium projects, engineered for versatility and reliability in residential construction.',
      features: [
        'Ideal for residential construction',
        'Easy to transport and maneuver',
        'Durable steel construction',
        'Low maintenance requirements',
        'Fuel-efficient operation'
      ],
      specs: {
        capacity: '370 Liters',
        enginePower: '7-9 HP',
        weight: '750 kg'
      },
      image: '/assets/photos/MT-370.jpg'
    },
    {
      name: 'Concrete Mixer MT-480',
      shortDesc: 'Commercial Mixer',
      description: 'Heavy-duty mixer engineered for large commercial projects, delivering maximum mixing efficiency and durability for demanding worksites.',
      features: [
        'Perfect for commercial construction',
        'Maximum mixing efficiency',
        'Heavy-duty construction',
        'Enhanced durability components',
        'High-torque power system'
      ],
      specs: {
        capacity: '480 Liters',
        enginePower: '13+ HP',
        weight: '950 kg'
      },
      image: '/assets/photos/MT-480.jpg'
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

  readonly features: Feature[] = [
    {
      title: 'Reinforced Drum Design',
      description: 'Heavy-duty steel construction with double-reinforced joints and wear-resistant coating.',
      icon: 'fa-solid fa-shield',
      highlight: '50% increased lifespan',
      category: 'design',
      detailedDescription: 'Our proprietary drum construction features 6mm high-grade steel with reinforced mixing blades and specialized wear-resistant interior coating that significantly reduces material buildup and extends operational life.',
      techSpecs: [
        { label: 'Steel Grade', value: 'Industrial S355JR' },
        { label: 'Wall Thickness', value: '6mm reinforced' },
        { label: 'Coating', value: 'Polymer-enhanced abrasion resistant' },
        { label: 'Joint Type', value: 'Double-welded reinforced' }
      ],
      imageUrl: '/assets/photos/feature-drum.jpg',
      animations: ['rotation', 'highlight-blades']
    },
    {
      title: 'Protected Gear Mechanism',
      description: 'Sealed gearbox system with automatic lubrication and debris protection.',
      icon: 'fa-solid fa-gears',
      highlight: '10,000+ operation hours',
      category: 'performance',
      detailedDescription: 'Our precision-engineered gearbox incorporates hardened steel gears with specialized sealing technology to prevent contamination, while maintaining optimal lubrication in all operating conditions.',
      techSpecs: [
        { label: 'Gear Material', value: 'Hardened alloy steel' },
        { label: 'Lubrication', value: 'Self-regulating system' },
        { label: 'Seal Type', value: 'Triple-barrier protection' },
        { label: 'Expected Lifespan', value: '10,000+ hours' }
      ],
      imageUrl: '/assets/photos/feature-gears.jpg',
      animations: ['rotation', 'oil-flow']
    },
    {
      title: 'Enhanced Safety Features',
      description: 'Multiple emergency stops, protective guards, and safety interlocks for operator protection.',
      icon: 'fa-solid fa-shield-halved',
      highlight: 'Triple safety system',
      category: 'safety',
      detailedDescription: 'Our comprehensive safety system includes strategically placed emergency stops, automatic drum locking during maintenance, and operator presence detection to prevent accidental operation.',
      techSpecs: [
        { label: 'Emergency Stops', value: '3 positions' },
        { label: 'Guard Rating', value: 'Impact resistant' },
        { label: 'Interlock System', value: 'Redundant circuits' },
        { label: 'Safety Compliance', value: 'ISO 12100, EN 12151' }
      ],
      imageUrl: '/assets/photos/feature-safety.jpg',
      animations: ['highlight-emergency', 'show-guards']
    },
    {
      title: 'Precision Mixing Control',
      description: 'Advanced mixing control system that ensures consistent concrete quality through precise drum rotation.',
      icon: 'fa-solid fa-sliders',
      highlight: 'Uniform mixing results',
      category: 'operation',
      detailedDescription: 'Our proprietary mixing control technology automatically adjusts drum speed and angle based on load weight and material viscosity, ensuring optimal mixing efficiency and consistent quality output.',
      techSpecs: [
        { label: 'Speed Range', value: '0-25 RPM variable' },
        { label: 'Angle Control', value: 'Automated hydraulic' },
        { label: 'Response Time', value: '<0.5 seconds' },
        { label: 'Control Type', value: 'Digital precision system' }
      ],
      imageUrl: '/assets/photos/feature-control.jpg',
      animations: ['control-panel', 'angle-adjustment']
    },
    {
      title: 'All-Terrain Mobility',
      description: 'Specialized chassis design with heavy-duty tires and stabilizers for secure operation on uneven surfaces.',
      icon: 'fa-solid fa-truck-monster',
      highlight: '30° incline capability',
      category: 'operation',
      detailedDescription: 'The reinforced chassis features independent suspension with auto-leveling capability, allowing safe operation on construction sites with up to 30° inclines while maintaining mixing performance.',
      techSpecs: [
        { label: 'Tire Type', value: 'All-terrain industrial' },
        { label: 'Suspension', value: 'Heavy-duty independent' },
        { label: 'Stabilizers', value: 'Hydraulic auto-leveling' },
        { label: 'Max Safe Incline', value: '30 degrees' }
      ],
      imageUrl: '/assets/photos/feature-mobility.jpg',
      animations: ['terrain-adaptation', 'stabilizer-movement']
    },
    {
      title: 'Eco-Performance Engine',
      description: 'Fuel-efficient engine technology that reduces consumption while maintaining optimal power delivery.',
      icon: 'fa-solid fa-leaf',
      highlight: '25% fuel savings',
      category: 'performance',
      detailedDescription: 'Our advanced engine management system dynamically adjusts power output based on load requirements, significantly reducing fuel consumption while maintaining torque delivery when needed most.',
      techSpecs: [
        { label: 'Fuel Efficiency', value: '25% better than standard' },
        { label: 'Emissions Rating', value: 'Tier 4 compliant' },
        { label: 'Power Management', value: 'Dynamic load sensing' },
        { label: 'Engine Type', value: 'Commercial-grade industrial' }
      ],
      imageUrl: '/assets/photos/feature-eco.jpg',
      animations: ['fuel-flow', 'efficiency-graph']
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
      answer: 'Our concrete mixers are covered by a 6-month warranty against any manufacturing defects. For more information, please contact technical support.'
    },
    {
      question: 'Are spare parts readily available?',
      answer: 'Yes, we maintain a complete inventory of spare parts with delivery on request.'
    }
  ];

  readonly companyStats: CompanyStat[] = [
    {
      icon: '🏭',
      value: '20+',
      label: 'Years Experience',
      detail: 'Industry leadership since 2002'
    },
    {
      icon: '🚛',
      value: '5000+',
      label: 'Mixers Delivered',
      detail: 'Serving global construction needs'
    },
    {
      icon: '🌍',
      value: '30+',
      label: 'Countries Served',
      detail: 'Global presence and support'
    }
  ];

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
    private title: Title,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeScrollObserver();
      this.setupScrollIndicator();
      this.setupSEO();
      this.initializeFlagCarousel();
      this.initializeReviewSlider();
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

  // Feature section methods
  filterFeaturesByCategory(category: CategoryType): void {
    this.activeFeatureCategory = category;
    this.activeFeatureIndex = null; // Reset active feature when changing categories
  }

  toggleFeatureDetail(index: number): void {
    this.activeFeatureIndex = this.activeFeatureIndex === index ? null : index;
  }

  get filteredFeatures(): Feature[] {
    return this.activeFeatureCategory === 'all'
      ? this.features
      : this.features.filter(feature => feature.category === this.activeFeatureCategory);
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

  trackFeatureView(feature: Feature): void {
    this.trackEvent('feature_viewed', {
      feature_name: feature.title,
      feature_category: feature.category,
      section: 'features_section'
    });
  }

  // Feature interactions
  playFeatureAnimation(featureIndex: number, animationType: string): void {
    const feature = this.filteredFeatures[featureIndex];
    if (!feature.animations?.includes(animationType)) return;

    // Animation logic would be implemented here
    // This is a placeholder for future animation implementations
    console.log(`Playing ${animationType} animation for ${feature.title}`);

    this.trackEvent('feature_animation_played', {
      feature: feature.title,
      animation: animationType
    });
  }

  // Method to handle tab focusing in the feature section
  onFeatureTabFocus(event: FocusEvent): void {
    const target = event.target as HTMLElement;
    if (target.classList.contains('feature-tab')) {
      target.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }

  // Method to check if a feature belongs to a specific category
  featureBelongsToCategory(feature: Feature, category: CategoryType): boolean {
    return category === 'all' || feature.category === category;
  }

  // Get the number of features in each category (for displaying counts in tabs)
  getCategoryCount(category: FeatureCategory): number {
    return this.features.filter(feature => feature.category === category).length;
  }

  trackStatBy(index: number, stat: CompanyStat): string {
    return stat.label;
  }
}

import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { animate, trigger, style, transition, query, stagger, state } from '@angular/animations';

interface CompanyStats {
  value: string;
  label: string;
  icon: string;
}

interface ProductFeature {
  icon: string;
  title: string;
  description: string;
  metric?: string;
}

interface ProductSpec {
  label: string;
  value: string;
  icon: string;
}

interface Product {
  id: string;
  name: string;
  model: string;
  description: string;
  features: ProductFeature[];
  specs: ProductSpec[];
  gallery: string[];
  mainImage: string;
  highlights: string[];
}

interface VideoContent {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  url: string;
  duration: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.6s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('slideInLeft', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-100px)' }),
        animate('0.6s ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ]),
    trigger('staggerFade', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(30px)' }),
          stagger(100, [
            animate('0.5s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class HomeComponent implements OnInit {
  headerFixed: boolean = false;
  activeSection: string = 'hero';
  selectedProduct: string = 'mt-370';
  videoModalActive: boolean = false;
  currentVideo: VideoContent | null = null;

  readonly companyStats: CompanyStats[] = [
    {
      value: '20+',
      label: 'Years Experience',
      icon: 'fa-clock'
    },
    {
      value: '5000+',
      label: 'Units Delivered',
      icon: 'fa-truck'
    },
    {
      value: '98%',
      label: 'Customer Satisfaction',
      icon: 'fa-star'
    }
  ];

  readonly products: Product[] = [
    {
      id: 'mt-370',
      name: 'Concrete Mixer MT-370',
      model: 'MT-370',
      description: 'Compact yet powerful mixer perfect for small to medium construction projects.',
      features: [
        {
          icon: 'fa-gauge',
          title: 'Enhanced Efficiency',
          description: 'Optimized paddle design ensures thorough mixing',
          metric: '30% faster'
        },
        {
          icon: 'fa-shield',
          title: 'Durable Build',
          description: 'Industrial-grade materials and construction',
          metric: '10+ years'
        }
      ],
      specs: [
        {
          label: 'Capacity',
          value: '370L',
          icon: 'fa-flask'
        },
        {
          label: 'Power',
          value: '7-9 HP',
          icon: 'fa-bolt'
        }
      ],
      gallery: [
        'assets/photos/MT-370.jpg',
        'assets/photos/PHOTO-2025-01-31-15-45-46.jpg',
        'assets/photos/PHOTO-2025-01-31-15-45-47.jpg',
        'assets/photos/PHOTO-2025-01-31-15-45-48.jpg'
      ],
      mainImage: 'assets/photos/MT-370.jpg',
      highlights: [
        'Perfect for residential projects',
        'Easy transport and setup',
        'Low maintenance design'
      ]
    },
    {
      id: 'mt-480',
      name: 'Concrete Mixer MT-480',
      model: 'MT-480',
      description: 'Heavy-duty industrial mixer designed for large commercial projects.',
      features: [
        {
          icon: 'fa-industry',
          title: 'Industrial Power',
          description: 'Maximum mixing capacity for heavy workloads',
          metric: '40% more'
        },
        {
          icon: 'fa-gears',
          title: 'Advanced Systems',
          description: 'Premium components and controls',
          metric: '15+ years'
        }
      ],
      specs: [
        {
          label: 'Capacity',
          value: '480L',
          icon: 'fa-flask'
        },
        {
          label: 'Power',
          value: '13+ HP',
          icon: 'fa-bolt'
        }
      ],
      gallery: [
        'assets/photos/MT-480.jpg',
        'assets/photos/PHOTO-2025-01-31-15-50-19.jpg',
        'assets/photos/PHOTO-2025-01-31-15-50-20.jpg',
        'assets/photos/PHOTO-2025-01-31-15-50-21_2.jpg'
      ],
      mainImage: 'assets/photos/MT-480.jpg',
      highlights: [
        'Ideal for commercial construction',
        'Heavy-duty performance',
        'Advanced safety features'
      ]
    }
  ];

  readonly videos: VideoContent[] = [
    {
      id: 'mixer-overview',
      title: 'Product Overview',
      description: 'Comprehensive guide to our mixer range',
      thumbnail: 'assets/photos/PHOTO-2025-01-31-15-45-46.jpg',
      url: 'assets/videos/MixersEnglishDub.mp4',
      duration: '3:45'
    },
    {
      id: 'demo-video',
      title: 'Live Demonstration',
      description: 'See our mixers in action',
      thumbnail: 'assets/photos/PHOTO-2025-01-31-15-50-19.jpg',
      url: 'assets/videos/VIDEO-2025-01-31-15-51-32.mp4',
      duration: '2:30'
    }
  ];

  readonly galleryImages: string[] = [
    'assets/photos/20160914_171413.jpg',
    'assets/photos/PHOTO-2025-01-31-15-44-41.jpg',
    'assets/photos/PHOTO-2025-01-31-15-45-48.jpg',
    'assets/photos/PHOTO-2025-01-31-15-50-19.jpg',
    'assets/photos/20160914_171514.jpg',
    'assets/photos/PHOTO-2025-01-31-15-50-20.jpg'
  ];

  @HostListener('window:scroll', ['$event'])
  onScroll() {
    this.headerFixed = window.scrollY > 50;
    this.checkActiveSection();
  }

  ngOnInit() {
    this.initializeScrollObserver();
  }

  private initializeScrollObserver() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            const id = entry.target.getAttribute('id');
            if (id) this.activeSection = id;
          }
        });
      },
      { threshold: 0.3 }
    );

    document.querySelectorAll('section[id]').forEach(section => {
      observer.observe(section);
    });
  }

  private checkActiveSection() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPosition = window.scrollY + window.innerHeight / 3;

    sections.forEach(section => {
      const sectionTop = (section as HTMLElement).offsetTop;
      const sectionHeight = section.clientHeight;
      const sectionId = section.getAttribute('id');

      if (scrollPosition >= sectionTop && scrollPosition <= sectionTop + sectionHeight) {
        this.activeSection = sectionId || 'hero';
      }
    });
  }

  selectProduct(productId: string) {
    this.selectedProduct = productId;
  }

  getSelectedProduct(): Product {
    return this.products.find(p => p.id === this.selectedProduct) || this.products[0];
  }

  playVideo(video: VideoContent) {
    this.currentVideo = video;
    this.videoModalActive = true;

    setTimeout(() => {
      const videoElement = document.querySelector('.video-modal video') as HTMLVideoElement;
      if (videoElement) {
        videoElement.play().catch(err => console.warn('Autoplay prevented:', err));
      }
    }, 100);
  }

  closeVideoModal() {
    this.videoModalActive = false;
    this.currentVideo = null;
  }

  scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}

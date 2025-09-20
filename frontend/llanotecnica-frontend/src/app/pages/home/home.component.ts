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

interface VideoHighlight {
  icon: string;
  text: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  animations: [
    // Core essential animations only
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('0.4s ease-out', style({ opacity: 1 }))
      ])
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-20px)' }),
        animate('0.5s ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ]),
    trigger('scrollIndicator', [
      state('visible', style({ opacity: 1, transform: 'translateY(0)' })),
      state('hidden', style({ opacity: 0, transform: 'translateY(20px)' })),
      transition('visible <=> hidden', animate('0.3s ease-in-out'))
    ]),
    // Merged multiple stagger animations into one reusable animation
    trigger('staggerItems', [
      transition(':enter', [
        query('.stagger-item', [
          style({ opacity: 0, transform: 'translateY(15px)' }),
          stagger(80, [
            animate('0.4s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {
  readonly Math = Math;
  @ViewChild('demoVideo') demoVideo?: ElementRef<HTMLVideoElement>;
  @ViewChild('heroVideoDesktop') heroVideoDesktop?: ElementRef<HTMLVideoElement>;
  @ViewChild('heroVideoMobile') heroVideoMobile?: ElementRef<HTMLVideoElement>;
  @ViewChild('mainVideo') mainVideo?: ElementRef<HTMLVideoElement>;
  @ViewChildren('productCard') productCards!: QueryList<ElementRef>;

  // State variables
  activeSection = 'hero';
  activeFaq: number | null = null;
  isVideoPlaying = false;
  showScrollIndicator = true;
  currentHeroBackground = 0;

  // Performance optimization variables
  heroBackgroundImage = '';
  heroImageLoaded = false;
  heroVideoLoaded = false;
  heroVideoPlaying = false;
  heroPosterLoaded = false;
  isMobileDevice = false;

  // Video section variables
  isPortraitVideo = true;
  currentVideoSrc = '';
  currentVideoPoster = '';
  videoHighlights: VideoHighlight[] = [];
  videoInfoTitle = '';
  videoInfoDescription = '';
  videoCTAText = '';

  // Product section variables
  selectedProductIndex = 0;
  productZoomLevel = 1;
  productRotation = 0;

  // Review section variables
  currentReviewIndex = 0;

  // Modal state
  isModalOpen = false;

  // UI state tracking variables
  productCardStates: string[] = ['default', 'default'];
  buttonStates: string[] = ['void', 'void', 'void'];
  isComparisonMode = false;
  hoveredProduct: number | null = null;
  activeFeatures: boolean[] = [];
  selectedProduct: Product | null = null;

  // Data storage - Fixed flag codes to match flagcdn.com API format
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

  // No longer duplicating the flags in TypeScript
  // CSS will handle the infinite scroll effect
  flags_for_display = this.flags;

  mixers: Product[] = [];
  features: Feature[] = [];
  faqs: FAQ[] = [];
  companyStats: CompanyStat[] = [];

  readonly heroBackgrounds = [
    // Hero backgrounds defined here
  ];

  // Tracking variables
  private scrollInterval: any;
  private intersectionObserver: IntersectionObserver | null = null;

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
      // Detect device type for optimized video loading
      this.detectDeviceType();

      // IMMEDIATELY mute any existing hero videos on component initialization
      this.immediatelyMuteHeroVideos();

      // Initialize hero background image for immediate LCP
      this.initializeHeroBackground();

      // Critical content first
      this.setupSEO();
      this.loadTranslations();
      this.updateVideoSources();

      // Subscribe to language changes
      this.translate.onLangChange.subscribe(() => {
        // IMMEDIATELY mute videos again when language changes
        setTimeout(() => this.immediatelyMuteHeroVideos(), 0);
        this.loadTranslations();
        this.setupSEO();
        this.updateVideoSources();
      });

      // Delay non-critical initializations
      setTimeout(() => {
        this.initializeScrollObserver();
        this.setupScrollIndicator();
        this.initializeFlagCarousel();
      }, 500);
    }
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // IMMEDIATELY mute hero videos before any other configuration
      this.immediatelyMuteHeroVideos();

      // Configure hero videos first (basic properties)
      this.configureHeroVideo(this.heroVideoDesktop);
      this.configureHeroVideo(this.heroVideoMobile);

      // Check for URL fragment after view initialization
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

      // Optimize video loading - load video sources after critical content
      setTimeout(() => {
        // Load hero videos with proper sources
        if (this.heroVideoDesktop?.nativeElement) {
          this.loadHeroVideo(this.heroVideoDesktop.nativeElement, 'desktop');
        }

        if (this.heroVideoMobile?.nativeElement) {
          this.loadHeroVideo(this.heroVideoMobile.nativeElement, 'mobile');
        }
      }, 1500);

      // Set up main product video metadata detection
      if (this.mainVideo && this.mainVideo.nativeElement) {
        this.mainVideo.nativeElement.addEventListener('loadedmetadata', () => {
          if (this.mainVideo && this.mainVideo.nativeElement) {
            // Check if video is portrait (height > width)
            this.isPortraitVideo = this.mainVideo.nativeElement.videoHeight > this.mainVideo.nativeElement.videoWidth;
          }
        });
      }

      // Optimize all image elements by setting explicit dimensions
      this.ensureImageDimensions();
    }
  }

  private loadHeroVideo(videoElement: HTMLVideoElement, type: 'desktop' | 'mobile'): void {
    if (!videoElement) return;

    // Set poster image based on device type (using existing files)
    const posterImage = type === 'desktop'
      ? '/assets/photos/herosectionposter-optimized.jpg'
      : '/assets/photos/herosectionposter-optimized.jpg';

    videoElement.setAttribute('poster', posterImage);

    // Use existing video sources (fallback until optimized versions are created)
    const videoSrc = type === 'desktop'
      ? '/assets/compressedvideos/herosectiondesktop-ultra-optimized.mp4'
      : '/assets/compressedvideos/herosectionmobile-ultra-optimized.mp4';

    // Create and add video source
    const source = document.createElement('source');
    source.src = videoSrc;
    source.type = 'video/mp4';
    videoElement.appendChild(source);

    // Force mute the video to ensure it stays muted - HERO VIDEOS MUST NEVER HAVE SOUND
    videoElement.muted = true;
    videoElement.defaultMuted = true;
    videoElement.volume = 0;

    // Mobile-specific video attributes for better playback
    if (type === 'mobile') {
      videoElement.setAttribute('webkit-playsinline', 'true');
      videoElement.setAttribute('playsinline', 'true');
      videoElement.setAttribute('x-webkit-airplay', 'allow');
      videoElement.setAttribute('controls', 'false');

      // Force mobile video to load metadata for better playback
      videoElement.preload = 'metadata';
    }

    // Add multiple event listeners to ensure video NEVER plays sound
    const enforceHeroVideoMuting = () => {
      if (videoElement.muted !== true) {
        videoElement.muted = true;
      }
      if (videoElement.volume !== 0) {
        videoElement.volume = 0;
      }
    };

    // Enforce muting on all possible events
    videoElement.addEventListener('volumechange', enforceHeroVideoMuting);
    videoElement.addEventListener('play', enforceHeroVideoMuting);
    videoElement.addEventListener('playing', enforceHeroVideoMuting);
    videoElement.addEventListener('canplay', enforceHeroVideoMuting);
    videoElement.addEventListener('canplaythrough', enforceHeroVideoMuting);
    videoElement.addEventListener('loadeddata', enforceHeroVideoMuting);
    videoElement.addEventListener('loadedmetadata', enforceHeroVideoMuting);

    // Mobile-specific playback handling
    if (type === 'mobile') {
      // Add touch event listener to trigger playback on mobile
      const handleMobilePlay = () => {
        if (videoElement.paused) {
          const playPromise = videoElement.play();
          if (playPromise !== undefined) {
            playPromise.catch(() => {
              console.log('Mobile video autoplay prevented, will retry on next user interaction');
            });
          }
        }
      };

      // Try to play on various mobile events
      document.addEventListener('touchstart', handleMobilePlay, { once: true, passive: true });
      document.addEventListener('click', handleMobilePlay, { once: true, passive: true });

      // Also try when video becomes visible
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && videoElement.paused) {
            handleMobilePlay();
            observer.disconnect();
          }
        });
      }, { threshold: 0.1 });

      observer.observe(videoElement);
    }

    // Set up a periodic check to ensure muting is maintained
    const mutingInterval = setInterval(() => {
      if (videoElement && !videoElement.paused) {
        enforceHeroVideoMuting();
      }
    }, 100);

    // Clean up interval when video is removed from DOM
    videoElement.addEventListener('remove', () => {
      clearInterval(mutingInterval);
    });

    // Load and attempt to play
    videoElement.load();
    const playPromise = videoElement.play();

    if (playPromise !== undefined) {
      playPromise.catch(() => {
        console.log('Auto-play prevented by browser policy, will attempt on user interaction');
      });
    }

    this.heroVideoLoaded = true;
  }

// Ensure all images have explicit dimensions to prevent layout shifts
private ensureImageDimensions(): void {
  if (!isPlatformBrowser(this.platformId)) return;

  // Set dimensions for all images without explicit width/height
  setTimeout(() => {
    const images = document.querySelectorAll('img:not([width]):not([height])');
    images.forEach(img => {
      // Cast to HTMLImageElement to access naturalWidth and naturalHeight
      const imgElement = img as HTMLImageElement;

      // Set default dimensions or calculate based on parent
      const parent = imgElement.parentElement;
      if (parent) {
        const parentWidth = parent.clientWidth;
        const aspectRatio = imgElement.naturalWidth && imgElement.naturalHeight
          ? imgElement.naturalWidth / imgElement.naturalHeight
          : 1.5;

        imgElement.setAttribute('width', String(parentWidth));
        imgElement.setAttribute('height', String(Math.round(parentWidth / aspectRatio)));
      } else {
        // Default fallback dimensions
        imgElement.setAttribute('width', '300');
        imgElement.setAttribute('height', '200');
      }
    });
  }, 100);
}

  // IMMEDIATE muting method to prevent any sound during navigation/language switching
  private immediatelyMuteHeroVideos(): void {
    // Mute desktop hero video immediately
    if (this.heroVideoDesktop?.nativeElement) {
      const video = this.heroVideoDesktop.nativeElement;
      video.muted = true;
      video.defaultMuted = true;
      video.volume = 0;
      // Pause immediately to prevent any sound
      video.pause();
    }

    // Mute mobile hero video immediately
    if (this.heroVideoMobile?.nativeElement) {
      const video = this.heroVideoMobile.nativeElement;
      video.muted = true;
      video.defaultMuted = true;
      video.volume = 0;
      // Pause immediately to prevent any sound
      video.pause();
    }

    // Also find and mute any video elements in the DOM immediately
    const allVideos = document.querySelectorAll('video');
    allVideos.forEach(video => {
      if (video.classList.contains('hero-bg-video')) {
        video.muted = true;
        video.defaultMuted = true;
        video.volume = 0;
        video.pause();
      }
    });
  }

  private configureHeroVideo(videoRef?: ElementRef<HTMLVideoElement>): void {
    if (videoRef && videoRef.nativeElement) {
      const video = videoRef.nativeElement;

      // Set preload attribute to 'none' to prevent immediate loading
      video.preload = 'none';

      // Force mute the video AGAIN (redundant but safe)
      video.muted = true;
      video.defaultMuted = true;
      video.volume = 0;

      // Add multiple event listeners to ensure video NEVER plays sound
      const enforceHeroMuting = () => {
        if (video.muted !== true) {
          video.muted = true;
        }
        if (video.volume !== 0) {
          video.volume = 0;
        }
      };

      // Listen to ALL possible events that could unmute the video
      const mutingEvents = [
        'volumechange', 'play', 'playing', 'canplay', 'canplaythrough',
        'loadeddata', 'loadedmetadata', 'loadstart', 'progress', 'suspend',
        'abort', 'error', 'emptied', 'stalled', 'loadedmetadata', 'durationchange'
      ];

      mutingEvents.forEach(eventType => {
        video.addEventListener(eventType, enforceHeroMuting, { passive: true });
      });

      // Set up a continuous monitoring interval for hero videos
      const mutingInterval = setInterval(() => {
        if (video && !video.paused) {
          enforceHeroMuting();
        }
      }, 50); // Check every 50ms for maximum responsiveness

      // Clean up interval when component is destroyed
      video.addEventListener('remove', () => {
        clearInterval(mutingInterval);
      });
    }
  }

  ngOnDestroy(): void {
    // Clean up resources
    if (this.scrollInterval) {
      clearInterval(this.scrollInterval);
    }

    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
      this.intersectionObserver = null;
    }
  }

  // Load translated content for dynamic elements - optimized to run once
  private loadTranslations(): void {
    // Create a single request for all translations to avoid multiple HTTP requests
    const translationKeys = [
      // Video section
      'HOME_PAGE.VIDEO_SECTION.TITLE',
      'HOME_PAGE.VIDEO_SECTION.SUBTITLE',
      'HOME_PAGE.VIDEO_SECTION.INFO_TITLE',
      'HOME_PAGE.VIDEO_SECTION.INFO_DESC',
      'HOME_PAGE.VIDEO_SECTION.HIGHLIGHT_1',
      'HOME_PAGE.VIDEO_SECTION.HIGHLIGHT_2',
      'HOME_PAGE.VIDEO_SECTION.HIGHLIGHT_3',
      'HOME_PAGE.VIDEO_SECTION.CTA_TEXT',

      // Features section
      'HOME_PAGE.FEATURES.DRUM_DESIGN.TITLE',
      'HOME_PAGE.FEATURES.DRUM_DESIGN.DESCRIPTION',
      'HOME_PAGE.FEATURES.DRUM_DESIGN.HIGHLIGHT',
      'HOME_PAGE.FEATURES.GEAR_MECHANISM.TITLE',
      'HOME_PAGE.FEATURES.GEAR_MECHANISM.DESCRIPTION',
      'HOME_PAGE.FEATURES.GEAR_MECHANISM.HIGHLIGHT',
      'HOME_PAGE.FEATURES.SAFETY.TITLE',
      'HOME_PAGE.FEATURES.SAFETY.DESCRIPTION',
      'HOME_PAGE.FEATURES.SAFETY.HIGHLIGHT',

      // Mixers section
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
      'HOME_PAGE.MIXERS.MT480.SPECS.WEIGHT',

      // FAQ section
      'HOME_PAGE.FAQ_SECTION.FAQ_1_QUESTION',
      'HOME_PAGE.FAQ_SECTION.FAQ_1_ANSWER',

      // Company stats section
      'HOME_PAGE.COMPANY_SECTION.STATS_YEARS_EXPERIENCE',
      'HOME_PAGE.COMPANY_SECTION.STATS_MIXERS_DELIVERED',
      'HOME_PAGE.COMPANY_SECTION.STATS_COUNTRIES_SERVED',
      'HOME_PAGE.COMPANY_SECTION.DETAIL_YEARS',
      'HOME_PAGE.COMPANY_SECTION.DETAIL_MIXERS',
      'HOME_PAGE.COMPANY_SECTION.DETAIL_COUNTRIES'
    ];

    // Single batch request for better performance
    this.translate.get(translationKeys).subscribe(translations => {
      // Process all translations at once
      this.processVideoSectionTranslations(translations);
      this.processFeaturesTranslations(translations);
      this.processMixersTranslations(translations);
      this.processFaqsTranslations(translations);
      this.processCompanyStatsTranslations(translations);
    });
  }

  // Optimize video source updates
  private updateVideoSources(): void {
    const currentLang = this.translate.currentLang || 'en';

    // Set poster image - use WebP format for better performance with fallback
    this.currentVideoPoster = '/assets/photos/coverphoto.webp';

    // Set video source based on language (using existing files)
    this.currentVideoSrc = currentLang === 'es'
      ? '/assets/compressedvideos/IntroductionSpanish.mp4'
      : '/assets/compressedvideos/IntroductionEnglish.mp4';

    // Lazy load if element exists
    if (this.mainVideo && this.mainVideo.nativeElement) {
      // Use setAttribute to avoid triggering immediate load
      this.mainVideo.nativeElement.setAttribute('poster', this.currentVideoPoster);

      // Delay loading video source until it's visible
      if (isPlatformBrowser(this.platformId) && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting && this.mainVideo?.nativeElement) {
              this.mainVideo.nativeElement.src = this.currentVideoSrc;
              this.mainVideo.nativeElement.load();
              observer.disconnect();
            }
          });
        }, { threshold: 0.1 });

        observer.observe(this.mainVideo.nativeElement);
      } else {
        // Fallback for browsers without IntersectionObserver
        this.mainVideo.nativeElement.load();
      }
    }
  }

  // Separated translation processing methods for clarity
  private processVideoSectionTranslations(translations: any): void {
    this.videoInfoTitle = translations['HOME_PAGE.VIDEO_SECTION.INFO_TITLE'] || 'Professional Grade Concrete Mixers';
    this.videoInfoDescription = translations['HOME_PAGE.VIDEO_SECTION.INFO_DESC'] || 'Our mixers are engineered for durability and performance in the most demanding construction environments.';
    this.videoCTAText = translations['HOME_PAGE.VIDEO_SECTION.CTA_TEXT'] || 'Request a Consultation';

    this.videoHighlights = [
      {
        icon: 'shield',
        text: translations['HOME_PAGE.VIDEO_SECTION.HIGHLIGHT_1'] || 'Enhanced safety features with automatic shutdown'
      },
      {
        icon: 'rotate',
        text: translations['HOME_PAGE.VIDEO_SECTION.HIGHLIGHT_2'] || 'Superior mixing efficiency with dual-direction drum'
      },
      {
        icon: 'toolbox',
        text: translations['HOME_PAGE.VIDEO_SECTION.HIGHLIGHT_3'] || 'Easy maintenance with accessible components'
      }
    ];
  }

  private processFeaturesTranslations(translations: any): void {
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
  }

  private processMixersTranslations(translations: any): void {
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
        image: '/assets/photos/MT-370.png'
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
  }

  private processFaqsTranslations(translations: any): void {
    this.faqs = [
      {
        question: translations['HOME_PAGE.FAQ_SECTION.FAQ_1_QUESTION'] || 'How do I operate the MT-370 and MT-480 mixers?',
        answer: translations['HOME_PAGE.FAQ_SECTION.FAQ_1_ANSWER'] || 'Watch our detailed demonstration video below:',
        videoUrl: '/assets/compressedvideos/instruction.mp4',
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
  }

  private processCompanyStatsTranslations(translations: any): void {
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
  }

  /**
   * Handles video playback when clicked on mobile devices
   * @param event Click event from video or overlay
   */
  playVideoOnMobile(event: MouseEvent): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Check if the video element exists
    if (this.mainVideo && this.mainVideo.nativeElement) {
      const video = this.mainVideo.nativeElement;

      // If the video is already playing, do nothing
      if (!video.paused) return;

      // Try to play the video
      const playPromise = video.play();

      // Handle the play promise to catch any autoplay restrictions
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // Hide the play overlay when video starts playing
            const overlay = document.querySelector('.video-play-overlay') as HTMLElement;
            if (overlay) {
              overlay.style.opacity = '0';
              setTimeout(() => {
                overlay.style.pointerEvents = 'none';
              }, 300);
            }
          })
          .catch((error) => {
            console.error('Playback prevented:', error);
            // Show user-friendly message in the UI
            const messageEl = document.createElement('div');
            messageEl.className = 'video-play-message';
            messageEl.textContent = 'Click to play video';

            const overlay = document.querySelector('.video-play-overlay');
            if (overlay) {
              overlay.appendChild(messageEl);
            }
          });
      }

      // Stop event propagation
      event.stopPropagation();
    }
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

  // Modal functionality with ESC key
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

  // Product view control methods - optimized to prevent layout thrashing
  rotateProduct(direction: 'left' | 'right'): void {
    const rotationAmount = direction === 'left' ? -90 : 90;
    this.productRotation = (this.productRotation + rotationAmount) % 360;

    // Use requestAnimationFrame for smoother animation
    requestAnimationFrame(() => {
      const productImageContainer = document.querySelector('.product-display.active');
      if (productImageContainer) {
        (productImageContainer as HTMLElement).style.transform =
          `rotateY(${this.productRotation}deg) scale(${this.productZoomLevel})`;
      }
    });
  }

  zoomProduct(action: 'in' | 'out'): void {
    const zoomFactor = action === 'in' ? 0.1 : -0.1;
    const newZoom = this.productZoomLevel + zoomFactor;

    // Limit zoom range
    if (newZoom >= 0.5 && newZoom <= 1.5) {
      this.productZoomLevel = newZoom;

      // Use requestAnimationFrame for smoother animation
      requestAnimationFrame(() => {
        const productImageContainer = document.querySelector('.product-display.active');
        if (productImageContainer) {
          (productImageContainer as HTMLElement).style.transform =
            `rotateY(${this.productRotation}deg) scale(${this.productZoomLevel})`;
        }
      });
    }
  }

  // Consultation method
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

  // Optimized flag carousel without duplicating flags in memory
  private initializeFlagCarousel(): void {
    // Don't duplicate flags array - CSS will handle the infinite scroll effect
    const flagContainer = document.querySelector('.flag-carousel-inner');
    if (flagContainer) {
      flagContainer.classList.add('scrolling');
    }
  }

  private startAutoScroll(): void {
    const flagTrack = document.querySelector('.flag-carousel-track');
    if (flagTrack) {
      // Add CSS animation class instead of JavaScript animation
      flagTrack.classList.add('auto-scrolling');
    }
  }

  // Event tracking helper
  private trackEvent(action: string, data?: any): void {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', action, {
        ...data,
        source: 'products_section'
      });
    }
  }

  // SEO optimization
  private setupSEO(): void {
    // Set robots meta tag
    this.meta.updateTag({
      name: 'robots',
      content: 'index, follow'
    });

    // Use TranslateService for SEO titles and descriptions
    this.translate.get('HOME_PAGE.SEO.TITLE').subscribe((res: string) => {
      if (res) {
        this.title.setTitle(res);
      } else {
        // Fallback
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
        // Fallback
        this.meta.updateTag({
          name: 'description',
          content: 'Professional-grade concrete mixers delivering reliability and performance for over two decades. Explore our range of industrial mixing solutions.'
        });
      }
    });

    // Add structured data for better SEO
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

    // Remove any existing structured data first to prevent duplicates
    const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
    existingScripts.forEach(script => script.remove());

    // Add new structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(structuredData);
    document.head.appendChild(script);
  }

  private setupScrollIndicator(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Use passive event listener for better scroll performance
      window.addEventListener('scroll', () => {
        this.showScrollIndicator = window.scrollY < 100;
      }, { passive: true });
    }
  }

  private initializeScrollObserver(): void {
    if (!isPlatformBrowser(this.platformId) || !('IntersectionObserver' in window)) return;

    this.intersectionObserver = new IntersectionObserver(
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
      if (this.intersectionObserver) {
        this.intersectionObserver.observe(section);
      }
    });
  }

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      // Use native scrollIntoView with smooth behavior
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }

  toggleFaq(index: number): void {
    // Pause video if closing the first FAQ which contains a video
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

    // Delay video playback until section is fully visible
    setTimeout(() => {
      const video = document.querySelector('video');
      if (video) {
        const playPromise = video.play();

        if (playPromise !== undefined) {
          playPromise.catch(() => {
            console.log('Auto-play prevented, will require user interaction');
          });
        }
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

  // Performance optimization methods
  private initializeHeroBackground(): void {
    // Set responsive background image for immediate LCP - OPTIMIZED
    const isMobile = window.innerWidth <= 768;
    const backgroundImage = isMobile
      ? 'url("/assets/photos/background-mobile-780x1080.webp")'
      : 'url("/assets/photos/background-desktop-1920x1080.webp")';

    this.heroBackgroundImage = backgroundImage;

    // Immediately mark as loaded and trigger display
    this.heroImageLoaded = true;
    this.heroPosterLoaded = true;

    // Force immediate rendering by triggering change detection
    setTimeout(() => {
      this.heroVideoPlaying = false; // Ensure poster is visible
    }, 0);
  }

  // Video event handlers for performance optimization
  onHeroVideoLoaded(type: string): void {
    console.log(`Hero video ${type} loaded`);
    this.heroVideoLoaded = true;
  }

  onHeroVideoReady(type: string): void {
    console.log(`Hero video ${type} ready to play`);
    // Start playing the video and hide the poster
    if (type === 'desktop' && this.heroVideoDesktop?.nativeElement) {
      this.heroVideoDesktop.nativeElement.play().then(() => {
        this.heroVideoPlaying = true;
      }).catch(err => console.log('Desktop video autoplay prevented:', err));
    } else if (type === 'mobile' && this.heroVideoMobile?.nativeElement) {
      this.heroVideoMobile.nativeElement.play().then(() => {
        this.heroVideoPlaying = true;
      }).catch(err => console.log('Mobile video autoplay prevented:', err));
    }
  }

  onHeroPosterLoaded(): void {
    console.log('Hero poster loaded');
    this.heroPosterLoaded = true;
    // Start loading the video sources after poster is visible
    setTimeout(() => {
      this.loadVideoSources();
    }, 500);
  }

  onHeroVideoCanPlay(): void {
    // Dynamically load video sources after LCP
    if (!this.heroVideoLoaded) {
      setTimeout(() => {
        this.loadVideoSources();
      }, 100);
    }
  }

  private detectDeviceType(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Detect mobile device using multiple methods for accuracy
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobileUserAgent = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      const isMobileScreen = window.innerWidth <= 768;
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

      // Consider it mobile if any of these conditions are true
      this.isMobileDevice = isMobileUserAgent || (isMobileScreen && isTouchDevice);

      console.log('Device detection:', {
        isMobileUserAgent,
        isMobileScreen,
        isTouchDevice,
        finalResult: this.isMobileDevice
      });
    }
  }

  private loadVideoSources(): void {
    // Only load the video source for the current device type
    if (this.isMobileDevice) {
      // Load only mobile video source
      if (this.heroVideoMobile?.nativeElement) {
        const mobileVideo = this.heroVideoMobile.nativeElement;
        if (!mobileVideo.querySelector('source')) {
          const source = document.createElement('source');
          source.src = '/assets/compressedvideos/herosectionmobile-ultra-optimized.mp4';
          source.type = 'video/mp4';
          mobileVideo.appendChild(source);
          mobileVideo.load();
        }
      }
    } else {
      // Load only desktop video source
      if (this.heroVideoDesktop?.nativeElement) {
        const desktopVideo = this.heroVideoDesktop.nativeElement;
        if (!desktopVideo.querySelector('source')) {
          const source = document.createElement('source');
          source.src = '/assets/compressedvideos/herosectiondesktop-ultra-optimized.mp4';
          source.type = 'video/mp4';
          desktopVideo.appendChild(source);
          desktopVideo.load();
        }
      }
    }
  }
}

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
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SeoService } from '../../services/seo.service';
import { LtButtonComponent } from '../../ui/button/lt-button.component';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

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
    imports: [CommonModule, RouterModule, TranslateModule, LtButtonComponent],
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css'],
    host: {
      '(window:keydown)': 'handleKeyDown($event)'
    },
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

  /** 'en' or 'es' — derived from current URL, used for language-aware routing in template. */
  get currentRouteLang(): 'en' | 'es' {
    return this.router.url.startsWith('/es') ? 'es' : 'en';
  }

  // Hero animation refs
  @ViewChild('heroSection') heroSection?: ElementRef<HTMLElement>;
  @ViewChild('heroBackground') heroBackground?: ElementRef<HTMLElement>;
  @ViewChild('heroEyebrow') heroEyebrow?: ElementRef<HTMLElement>;
  @ViewChild('heroHeadline') heroHeadline?: ElementRef<HTMLElement>;
  @ViewChild('heroDescription') heroDescription?: ElementRef<HTMLElement>;
  @ViewChild('heroCta') heroCta?: ElementRef<HTMLElement>;
  @ViewChild('heroScrollIndicator') heroScrollIndicator?: ElementRef<HTMLElement>;
  private heroEntryTimeline: gsap.core.Timeline | null = null;
  private heroParallaxTrigger: ScrollTrigger | null = null;

  // Video section animation refs
  @ViewChild('videoSection') videoSection?: ElementRef<HTMLElement>;
  @ViewChild('videoSectionEyebrow') videoSectionEyebrow?: ElementRef<HTMLElement>;
  @ViewChild('videoSectionTitle') videoSectionTitle?: ElementRef<HTMLElement>;
  @ViewChild('videoSectionSubtitle') videoSectionSubtitle?: ElementRef<HTMLElement>;
  @ViewChild('videoFrame') videoFrame?: ElementRef<HTMLElement>;
  @ViewChild('videoInfo') videoInfo?: ElementRef<HTMLElement>;
  private videoSectionTrigger: ScrollTrigger | null = null;

  // Products section animation refs
  @ViewChild('productsSection') productsSectionEl?: ElementRef<HTMLElement>;
  @ViewChild('productsHeader') productsHeader?: ElementRef<HTMLElement>;
  @ViewChild('productsEyebrow') productsEyebrow?: ElementRef<HTMLElement>;
  @ViewChild('productsTitle') productsTitle?: ElementRef<HTMLElement>;
  @ViewChild('productsSubtitle') productsSubtitle?: ElementRef<HTMLElement>;
  @ViewChild('productCardsWrap') productCardsWrap?: ElementRef<HTMLElement>;
  @ViewChild('productsCtaBar') productsCtaBar?: ElementRef<HTMLElement>;
  @ViewChild('comparisonSection') comparisonSection?: ElementRef<HTMLElement>;
  private productsSectionTriggers: ScrollTrigger[] = [];
  private productsImageParallaxCleanups: Array<() => void> = [];

  // Features + Company section refs
  @ViewChild('featuresSection') featuresSectionEl?: ElementRef<HTMLElement>;
  @ViewChild('featuresEyebrow') featuresEyebrow?: ElementRef<HTMLElement>;
  @ViewChild('featuresTitle') featuresTitleEl?: ElementRef<HTMLElement>;
  @ViewChild('featuresSubtitle') featuresSubtitleEl?: ElementRef<HTMLElement>;
  @ViewChild('featuresGrid') featuresGrid?: ElementRef<HTMLElement>;
  @ViewChild('companySection') companySectionEl?: ElementRef<HTMLElement>;
  @ViewChild('companyEyebrow') companyEyebrow?: ElementRef<HTMLElement>;
  @ViewChild('companyTitle') companyTitleEl?: ElementRef<HTMLElement>;
  @ViewChild('companySubtitle') companySubtitleEl?: ElementRef<HTMLElement>;
  @ViewChild('companyStatsGrid') companyStatsGrid?: ElementRef<HTMLElement>;
  private featuresCompanyTriggers: ScrollTrigger[] = [];

  // FAQ section refs
  @ViewChild('faqSection') faqSection?: ElementRef<HTMLElement>;
  @ViewChild('faqEyebrow') faqEyebrow?: ElementRef<HTMLElement>;
  @ViewChild('faqTitle') faqTitle?: ElementRef<HTMLElement>;
  @ViewChild('faqSubtitle') faqSubtitle?: ElementRef<HTMLElement>;
  @ViewChild('faqList') faqList?: ElementRef<HTMLElement>;
  private faqSectionTrigger: ScrollTrigger | null = null;

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

  // Duplicated for seamless infinite scroll: when track translates -50%,
  // the second copy aligns with the start, so the loop is invisible.
  flags_for_display: Flag[] = [...this.flags, ...this.flags];

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
    private router: Router,
    private route: ActivatedRoute,
    private translate: TranslateService,
    private seoService: SeoService
  ) {}

  ngOnInit(): void {
    // SEO must run on the server too so prerendered HTML has correct
    // canonical/hreflang/og tags. If gated to browser-only, every prerendered
    // route inherits the index.html defaults and Google flags them as
    // alternates of /.
    this.setupSEO();

    if (isPlatformBrowser(this.platformId)) {
      // Detect device type for optimized video loading
      this.detectDeviceType();

      // IMMEDIATELY mute any existing hero videos on component initialization
      this.immediatelyMuteHeroVideos();

      // Initialize hero background image for immediate LCP
      this.initializeHeroBackground();

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
      // Register the ScrollTrigger plugin once
      gsap.registerPlugin(ScrollTrigger);

      // Build the cinematic hero entry sequence + scroll-driven parallax
      this.buildHeroEntryTimeline();
      this.setupHeroParallax();
      this.setupVideoSectionReveal();
      // Defer products animations until after first paint (cards + table only
      // need to be ready by the time the user scrolls there)
      requestAnimationFrame(() => {
        this.setupProductsSectionReveal();
        this.setupFeaturesAndCompanyReveal();
        this.setupFaqSectionReveal();
      });

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

    // Don't re-inject sources if already done
    if (videoElement.querySelector('source')) return;

    // AV1 first (modern browsers, smaller + sharper), H.264 fallback (older Safari/iOS)
    const av1Src = type === 'desktop'
      ? '/assets/compressedvideos/hero-desktop.av1.mp4'
      : '/assets/compressedvideos/hero-mobile.av1.mp4';
    const h264Src = type === 'desktop'
      ? '/assets/compressedvideos/hero-desktop.h264.mp4'
      : '/assets/compressedvideos/hero-mobile.h264.mp4';

    const av1Source = document.createElement('source');
    av1Source.src = av1Src;
    av1Source.type = 'video/mp4; codecs=av01.0.05M.08';
    videoElement.appendChild(av1Source);

    const h264Source = document.createElement('source');
    h264Source.src = h264Src;
    h264Source.type = 'video/mp4; codecs=avc1.640028';
    videoElement.appendChild(h264Source);

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

    // Kill GSAP timeline + ScrollTriggers
    this.heroEntryTimeline?.kill();
    this.heroParallaxTrigger?.kill();
    this.videoSectionTrigger?.kill();
    this.productsSectionTriggers.forEach((t) => t.kill());
    this.productsImageParallaxCleanups.forEach((cleanup) => cleanup());
    this.featuresCompanyTriggers.forEach((t) => t.kill());
    this.faqSectionTrigger?.kill();
  }

  /**
   * Cinematic hero entry sequence (~1.4s total).
   * Eyebrow → split-word headline reveal → description wipe → CTA cascade
   * → scroll indicator. All starting states are set in CSS (opacity:0, etc.)
   * so SSR HTML doesn't flash unstyled content.
   */
  private buildHeroEntryTimeline(): void {
    const eyebrow = this.heroEyebrow?.nativeElement;
    const headline = this.heroHeadline?.nativeElement;
    const description = this.heroDescription?.nativeElement;
    const ctaWrap = this.heroCta?.nativeElement;
    const scrollInd = this.heroScrollIndicator?.nativeElement;

    if (!eyebrow || !headline || !description || !ctaWrap) return;

    // Reduced motion → skip animations, just reveal everything
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      gsap.set([eyebrow, description, scrollInd], { opacity: 1, y: 0 });
      gsap.set(description, { clipPath: 'inset(0 0 0 0)' });
      gsap.set(ctaWrap.children, { opacity: 1, y: 0, scale: 1 });
      return;
    }

    // Manual word-split for headline (avoids the SplitText plugin dep —
    // works for any text content, RTL-safe, screen-reader-friendly).
    const originalHeadline = headline.textContent?.trim() || '';
    if (originalHeadline && !headline.querySelector('.hero-headline__word')) {
      headline.setAttribute('aria-label', originalHeadline);
      const words = originalHeadline.split(/\s+/);
      headline.innerHTML = words
        .map(
          (w) =>
            `<span class="hero-headline__line"><span class="hero-headline__word" aria-hidden="true" style="display:inline-block;will-change:transform">${w}</span></span>`,
        )
        .join(' ');
    }

    // Same word-split for description (smaller / faster cascade than headline)
    const originalDesc = description.textContent?.trim() || '';
    if (originalDesc && !description.querySelector('.hero-description__word')) {
      description.setAttribute('aria-label', originalDesc);
      const descWords = originalDesc.split(/\s+/);
      description.innerHTML = descWords
        .map(
          (w) =>
            `<span class="hero-description__word" aria-hidden="true" style="display:inline-block;will-change:transform,opacity">${w}</span>`,
        )
        .join(' ');
      // Reset the inline starting state we set in CSS — GSAP will manage from here
      description.style.clipPath = '';
      description.style.opacity = '1';
    }

    const headlineWords = headline.querySelectorAll('.hero-headline__word');
    const descriptionWords = description.querySelectorAll('.hero-description__word');
    const eyebrowBar = eyebrow.querySelector('.hero-eyebrow__bar');
    const eyebrowLabel = eyebrow.querySelector('.hero-eyebrow__label');

    this.heroEntryTimeline = gsap
      .timeline({ defaults: { ease: 'power3.out' } })
      // Eyebrow assembles: parent visible, bar draws to width, label fades + slides in
      .set(eyebrow, { opacity: 1 })
      .fromTo(
        eyebrowBar,
        { width: 0 },
        { width: 32, duration: 0.4, ease: 'power3.out' },
      )
      .fromTo(
        eyebrowLabel,
        { opacity: 0, x: -6 },
        { opacity: 1, x: 0, duration: 0.35, ease: 'power2.out' },
        '-=0.15',
      )
      // Headline words: stagger reveal from below, expo-out (the showpiece)
      .fromTo(
        headlineWords,
        { yPercent: 110, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.08,
          ease: 'expo.out',
        },
        '-=0.2',
      )
      // Description words: smaller, faster cascade — flows visually from the headline
      .fromTo(
        descriptionWords,
        { y: 12, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.45,
          stagger: 0.018,
          ease: 'power3.out',
        },
        '-=0.35',
      )
      // CTA buttons: decisive settle, no overshoot
      .fromTo(
        ctaWrap.children,
        { y: 12, opacity: 0, scale: 0.96 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.55,
          stagger: 0.08,
          ease: 'power4.out',
        },
        '-=0.25',
      );

    if (scrollInd) {
      this.heroEntryTimeline.fromTo(
        scrollInd,
        { y: 12, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' },
        '-=0.1',
      );
    }
  }

  /**
   * Scroll-driven parallax for the hero background — depth without distraction.
   * Background drifts upward at ~0.6× scroll rate; text exits faster.
   */
  private setupHeroParallax(): void {
    const heroSection = this.heroSection?.nativeElement;
    const heroBg = this.heroBackground?.nativeElement;

    if (!heroSection || !heroBg) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const tween = gsap.to(heroBg, {
      yPercent: 18,
      ease: 'none',
      scrollTrigger: {
        trigger: heroSection,
        start: 'top top',
        end: 'bottom top',
        scrub: 0.4,
      },
    });

    // Hold a reference to the underlying ScrollTrigger so ngOnDestroy can kill it
    this.heroParallaxTrigger = tween.scrollTrigger ?? null;
  }

  /**
   * Scroll-triggered reveal for the demo-video section.
   * Eyebrow → title → subtitle → video frame settle → highlights stagger → CTA.
   * Plays once, ~600ms before the section is fully in view.
   */
  private setupVideoSectionReveal(): void {
    const sectionEl = this.videoSection?.nativeElement;
    const eyebrow = this.videoSectionEyebrow?.nativeElement;
    const title = this.videoSectionTitle?.nativeElement;
    const subtitle = this.videoSectionSubtitle?.nativeElement;
    const frame = this.videoFrame?.nativeElement;
    const infoCol = this.videoInfo?.nativeElement;

    if (!sectionEl || !eyebrow || !title || !subtitle || !frame || !infoCol) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Children that animate inside the info column
    const infoChildren = infoCol.querySelectorAll(
      ':scope > *, :scope > .lt-video-info__highlights > li',
    );

    if (prefersReducedMotion) {
      gsap.set([eyebrow, title, subtitle, frame, ...Array.from(infoChildren)], {
        opacity: 1,
        y: 0,
        scale: 1,
        clearProps: 'transform',
      });
      return;
    }

    // Set initial states (avoids FOUC if SSR hydrates before timeline runs)
    gsap.set([eyebrow, title, subtitle], { opacity: 0, y: 24 });
    gsap.set(frame, { opacity: 0, scale: 0.96, y: 20 });
    gsap.set(infoChildren, { opacity: 0, y: 16 });

    const tl = gsap.timeline({
      defaults: { ease: 'power3.out' },
      scrollTrigger: {
        trigger: sectionEl,
        start: 'top 78%',
        toggleActions: 'play none none reverse',
      },
    });

    tl.to(eyebrow, { opacity: 1, y: 0, duration: 0.45 })
      .to(title, { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out' }, '-=0.25')
      .to(subtitle, { opacity: 1, y: 0, duration: 0.55 }, '-=0.4')
      .to(
        frame,
        { opacity: 1, scale: 1, y: 0, duration: 0.7, ease: 'power4.out' },
        '-=0.45',
      )
      .to(
        infoChildren,
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.07, ease: 'power3.out' },
        '-=0.5',
      );

    this.videoSectionTrigger = tl.scrollTrigger ?? null;
  }

  /**
   * Products section: orchestrated reveal — header → cards (with spec count-up)
   * → CTA bar → comparison table. Plus cursor-aware image parallax on desktop.
   */
  private setupProductsSectionReveal(): void {
    const sectionEl = this.productsSectionEl?.nativeElement;
    const eyebrow = this.productsEyebrow?.nativeElement;
    const title = this.productsTitle?.nativeElement;
    const subtitle = this.productsSubtitle?.nativeElement;
    const cardsWrap = this.productCardsWrap?.nativeElement;
    const ctaBar = this.productsCtaBar?.nativeElement;
    const compSection = this.comparisonSection?.nativeElement;

    if (!sectionEl || !eyebrow || !title || !subtitle || !cardsWrap) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const cards = cardsWrap.querySelectorAll('.lt-product-card');
    const ctaActions = ctaBar?.querySelectorAll('.lt-products-cta-bar__actions > *');
    const compRows = compSection?.querySelectorAll('.lt-comparison__table tbody tr');

    if (prefersReducedMotion) {
      gsap.set([eyebrow, title, subtitle, ...Array.from(cards)], {
        opacity: 1,
        y: 0,
        scale: 1,
      });
      if (ctaActions) gsap.set(Array.from(ctaActions), { opacity: 1, y: 0 });
      if (compRows) gsap.set(Array.from(compRows), { opacity: 1, y: 0 });
      return;
    }

    // Initial states
    gsap.set([eyebrow, title, subtitle], { opacity: 0, y: 24 });
    gsap.set(cards, { opacity: 0, y: 32, scale: 0.97 });
    if (ctaActions) gsap.set(Array.from(ctaActions), { opacity: 0, y: 16 });
    if (compRows) gsap.set(Array.from(compRows), { opacity: 0, y: 12 });

    // 1. Header + cards reveal — fires when section is 78% in viewport
    const headerCardsTl = gsap.timeline({
      defaults: { ease: 'power3.out' },
      scrollTrigger: {
        trigger: sectionEl,
        start: 'top 78%',
        toggleActions: 'play none none none',
      },
    });
    headerCardsTl
      .to(eyebrow, { opacity: 1, y: 0, duration: 0.45 })
      .to(title, { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out' }, '-=0.25')
      .to(subtitle, { opacity: 1, y: 0, duration: 0.55 }, '-=0.4')
      .to(
        cards,
        { opacity: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.18, ease: 'power4.out' },
        '-=0.35',
      )
      .add(() => this.runSpecCountUps(cards), '-=0.3');
    if (headerCardsTl.scrollTrigger) this.productsSectionTriggers.push(headerCardsTl.scrollTrigger);

    // 2. CTA bar reveal
    if (ctaBar && ctaActions) {
      const ctaTl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        scrollTrigger: { trigger: ctaBar, start: 'top 85%', toggleActions: 'play none none none' },
      });
      ctaTl.to(Array.from(ctaActions), {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.08,
      });
      if (ctaTl.scrollTrigger) this.productsSectionTriggers.push(ctaTl.scrollTrigger);
    }

    // 3. Comparison table rows stagger
    if (compSection && compRows && compRows.length) {
      const compTl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        scrollTrigger: { trigger: compSection, start: 'top 80%', toggleActions: 'play none none none' },
      });
      compTl.to(Array.from(compRows), {
        opacity: 1,
        y: 0,
        duration: 0.45,
        stagger: 0.07,
      });
      if (compTl.scrollTrigger) this.productsSectionTriggers.push(compTl.scrollTrigger);
    }

    // 4. Cursor-aware parallax on product images (desktop only, hover-capable input)
    if (window.matchMedia('(hover: hover) and (min-width: 1024px)').matches) {
      cards.forEach((card) => {
        const cardEl = card as HTMLElement;
        const imgWrap = cardEl.querySelector('.lt-product-card__image-wrap') as HTMLElement | null;
        const img = cardEl.querySelector('.lt-product-card__image') as HTMLElement | null;
        if (!imgWrap || !img) return;

        const onMove = (e: MouseEvent) => {
          const rect = imgWrap.getBoundingClientRect();
          const cx = (e.clientX - rect.left) / rect.width - 0.5; // -0.5..0.5
          const cy = (e.clientY - rect.top) / rect.height - 0.5;
          gsap.to(img, {
            x: cx * 14,
            y: cy * 10,
            duration: 0.6,
            ease: 'power3.out',
            overwrite: 'auto',
          });
        };
        const onLeave = () => {
          gsap.to(img, { x: 0, y: 0, duration: 0.7, ease: 'power3.out' });
        };

        imgWrap.addEventListener('mousemove', onMove);
        imgWrap.addEventListener('mouseleave', onLeave);
        this.productsImageParallaxCleanups.push(() => {
          imgWrap.removeEventListener('mousemove', onMove);
          imgWrap.removeEventListener('mouseleave', onLeave);
        });
      });
    }
  }

  /**
   * Features (dark) + Company (light) sections reveal:
   * - Features: header → 3 feature cards stagger fade-up
   * - Company: header → 3 stat cards stagger fade-up + count-up numbers → CTA
   */
  private setupFeaturesAndCompanyReveal(): void {
    // ----- FEATURES -----
    const fSection = this.featuresSectionEl?.nativeElement;
    const fEyebrow = this.featuresEyebrow?.nativeElement;
    const fTitle = this.featuresTitleEl?.nativeElement;
    const fSubtitle = this.featuresSubtitleEl?.nativeElement;
    const fGrid = this.featuresGrid?.nativeElement;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (fSection && fEyebrow && fTitle && fSubtitle && fGrid) {
      const fCards = fGrid.querySelectorAll('.lt-feature-card');

      if (prefersReducedMotion) {
        gsap.set([fEyebrow, fTitle, fSubtitle, ...Array.from(fCards)], {
          opacity: 1, y: 0, scale: 1,
        });
      } else {
        gsap.set([fEyebrow, fTitle, fSubtitle], { opacity: 0, y: 24 });
        gsap.set(fCards, { opacity: 0, y: 32, scale: 0.97 });

        const fTl = gsap.timeline({
          defaults: { ease: 'power3.out' },
          scrollTrigger: {
            trigger: fSection,
            start: 'top 78%',
            toggleActions: 'play none none none',
          },
        });
        fTl.to(fEyebrow, { opacity: 1, y: 0, duration: 0.45 })
          .to(fTitle, { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out' }, '-=0.25')
          .to(fSubtitle, { opacity: 1, y: 0, duration: 0.55 }, '-=0.4')
          .to(
            fCards,
            { opacity: 1, y: 0, scale: 1, duration: 0.65, stagger: 0.12, ease: 'power4.out' },
            '-=0.3',
          );
        if (fTl.scrollTrigger) this.featuresCompanyTriggers.push(fTl.scrollTrigger);
      }
    }

    // ----- COMPANY -----
    const cSection = this.companySectionEl?.nativeElement;
    const cEyebrow = this.companyEyebrow?.nativeElement;
    const cTitle = this.companyTitleEl?.nativeElement;
    const cSubtitle = this.companySubtitleEl?.nativeElement;
    const cGrid = this.companyStatsGrid?.nativeElement;

    if (cSection && cEyebrow && cTitle && cSubtitle && cGrid) {
      const cStats = cGrid.querySelectorAll('.lt-stat');
      const cCta = cSection.querySelector('.lt-company-section__cta');

      if (prefersReducedMotion) {
        gsap.set(
          [cEyebrow, cTitle, cSubtitle, ...Array.from(cStats), cCta].filter(Boolean) as Element[],
          { opacity: 1, y: 0, scale: 1 },
        );
      } else {
        gsap.set([cEyebrow, cTitle, cSubtitle], { opacity: 0, y: 24 });
        gsap.set(cStats, { opacity: 0, y: 28, scale: 0.97 });
        if (cCta) gsap.set(cCta, { opacity: 0, y: 16 });

        const cTl = gsap.timeline({
          defaults: { ease: 'power3.out' },
          scrollTrigger: {
            trigger: cSection,
            start: 'top 78%',
            toggleActions: 'play none none none',
          },
        });
        cTl.to(cEyebrow, { opacity: 1, y: 0, duration: 0.45 })
          .to(cTitle, { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out' }, '-=0.25')
          .to(cSubtitle, { opacity: 1, y: 0, duration: 0.55 }, '-=0.4')
          .to(
            cStats,
            { opacity: 1, y: 0, scale: 1, duration: 0.65, stagger: 0.12, ease: 'power4.out' },
            '-=0.3',
          )
          .add(() => this.runStatCountUps(cStats), '-=0.3');
        if (cCta) {
          cTl.to(cCta, { opacity: 1, y: 0, duration: 0.5 }, '-=0.2');
        }
        if (cTl.scrollTrigger) this.featuresCompanyTriggers.push(cTl.scrollTrigger);
      }
    }
  }

  /**
   * FAQ section reveal: header → accordion items stagger-fade up from below.
   * The accordion expand-collapse itself is pure CSS (grid-template-rows trick).
   */
  private setupFaqSectionReveal(): void {
    const sectionEl = this.faqSection?.nativeElement;
    const eyebrow = this.faqEyebrow?.nativeElement;
    const title = this.faqTitle?.nativeElement;
    const subtitle = this.faqSubtitle?.nativeElement;
    const list = this.faqList?.nativeElement;

    if (!sectionEl || !eyebrow || !title || !subtitle || !list) return;

    const items = list.querySelectorAll('.lt-faq-item');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      gsap.set([eyebrow, title, subtitle, ...Array.from(items)], { opacity: 1, y: 0 });
      return;
    }

    gsap.set([eyebrow, title, subtitle], { opacity: 0, y: 24 });
    gsap.set(items, { opacity: 0, y: 16 });

    const tl = gsap.timeline({
      defaults: { ease: 'power3.out' },
      scrollTrigger: {
        trigger: sectionEl,
        start: 'top 78%',
        toggleActions: 'play none none none',
      },
    });

    tl.to(eyebrow, { opacity: 1, y: 0, duration: 0.45 })
      .to(title, { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out' }, '-=0.25')
      .to(subtitle, { opacity: 1, y: 0, duration: 0.55 }, '-=0.4')
      .to(
        items,
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.06, ease: 'power3.out' },
        '-=0.3',
      );

    this.faqSectionTrigger = tl.scrollTrigger ?? null;
  }

  /**
   * Animate the company stat numbers up from 0 to their target value.
   * Reads `data-stat-value` so the source-of-truth is in the DOM.
   */
  private runStatCountUps(stats: NodeListOf<Element>): void {
    stats.forEach((stat) => {
      const valueEl = stat.querySelector('.lt-stat__value') as HTMLElement | null;
      if (!valueEl) return;
      const target = parseInt(valueEl.dataset['statValue'] || valueEl.textContent || '0', 10);
      if (!Number.isFinite(target) || target <= 0) return;
      const counter = { val: 0 };
      gsap.to(counter, {
        val: target,
        duration: 1.4,
        ease: 'power2.out',
        onUpdate: () => {
          valueEl.textContent = String(Math.round(counter.val));
        },
        onComplete: () => {
          valueEl.textContent = String(target);
        },
      });
    });
  }

  /**
   * For each product card, find the spec values and animate the leading number
   * up from 0. Pure visual flourish — works for any leading-number string format
   * ("370 Liters", "9 HP", "750 kg", "13+ HP") by parsing the prefix.
   */
  private runSpecCountUps(cards: NodeListOf<Element>): void {
    cards.forEach((card) => {
      const specValues = card.querySelectorAll('.lt-spec__value');
      specValues.forEach((el) => {
        const text = el.textContent?.trim() || '';
        const match = text.match(/^(\d+(?:\.\d+)?)/);
        if (!match) return;
        const target = parseFloat(match[1]);
        const suffix = text.slice(match[0].length); // " Liters", " HP", "+ HP", etc.
        const counter = { val: 0 };
        gsap.to(counter, {
          val: target,
          duration: 1.1,
          ease: 'power2.out',
          onUpdate: () => {
            const current = Math.round(counter.val);
            el.textContent = current + suffix;
          },
          onComplete: () => {
            // Snap to original text (preserves any decimals/special chars)
            el.textContent = text;
          },
        });
      });
    });
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

  /**
   * Single source of truth for the demo-video language source.
   * Called on init AND on every language change.
   * Preserves playback position across the swap so switching mid-video doesn't
   * jolt the user back to 0:00.
   */
  private updateVideoSources(): void {
    const currentLang = this.translate.currentLang || 'en';

    // Language-aware poster — actual frame from the corresponding video at ~3.5s.
    // Naturally matches the 3:4 portrait frame, looks like a paused video.
    const lcLang = currentLang === 'es' ? 'spanish' : 'english';
    this.currentVideoPoster = `/assets/photos/intro-poster-${lcLang}.webp`;

    // Pick AV1 (smaller, sharper) for modern browsers, H.264 for older Safari/iOS.
    // Portrait-cropped 720x1080 sources — natively match the 3:4 frame, no
    // wasted pixels. Down from 47-48MB original master to 12-13MB AV1.
    const useAv1 = this.canPlayAv1();
    const codec = useAv1 ? 'av1' : 'h264';
    this.currentVideoSrc = `/assets/compressedvideos/intro-${lcLang}-portrait.${codec}.mp4`;

    if (!isPlatformBrowser(this.platformId)) return;

    const videoEl = this.mainVideo?.nativeElement;
    if (!videoEl) return;

    videoEl.setAttribute('poster', this.currentVideoPoster);

    // Capture playback state BEFORE swapping the source
    const wasPlaying = !videoEl.paused && !videoEl.ended;
    const previousTime = videoEl.currentTime;
    const sameSrcAlready = videoEl.currentSrc.endsWith(this.currentVideoSrc);

    // Initial-load path: defer the actual src load until video is in viewport.
    // Subsequent language switches: swap immediately if already in viewport.
    if (!videoEl.currentSrc) {
      // Never loaded yet — observe and load on viewport entry
      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(
          (entries, obs) => {
            for (const entry of entries) {
              if (entry.isIntersecting && this.mainVideo?.nativeElement) {
                this.swapVideoSrc(this.mainVideo.nativeElement, this.currentVideoSrc);
                obs.disconnect();
              }
            }
          },
          { threshold: 0.1 },
        );
        observer.observe(videoEl);
      } else {
        this.swapVideoSrc(videoEl, this.currentVideoSrc);
      }
      return;
    }

    // Already loaded — language change scenario. Only swap if the src actually changed.
    if (sameSrcAlready) return;

    this.swapVideoSrc(videoEl, this.currentVideoSrc, previousTime, wasPlaying);
  }

  /**
   * Detect AV1 video playback support. Cached after first call.
   * Returns true on Chrome/Edge ≥90, Firefox, Safari ≥17. False on older Safari/iOS.
   */
  private _av1Supported: boolean | null = null;
  private canPlayAv1(): boolean {
    if (this._av1Supported !== null) return this._av1Supported;
    if (!isPlatformBrowser(this.platformId)) return false;
    const probe = document.createElement('video');
    const support = probe.canPlayType('video/mp4; codecs=av01.0.05M.08');
    this._av1Supported = support === 'probably' || support === 'maybe';
    return this._av1Supported;
  }

  /**
   * Swap the video element's source and load it.
   * Optionally restores playback position + resumes if user was watching.
   */
  private swapVideoSrc(
    videoEl: HTMLVideoElement,
    src: string,
    restoreTime = 0,
    resume = false,
  ): void {
    const onMetadata = () => {
      try {
        if (restoreTime > 0 && restoreTime < videoEl.duration) {
          videoEl.currentTime = restoreTime;
        }
        if (resume) {
          videoEl.play().catch(() => {
            // Autoplay was blocked — that's fine, user clicks play
          });
        }
      } finally {
        videoEl.removeEventListener('loadedmetadata', onMetadata);
      }
    };

    videoEl.addEventListener('loadedmetadata', onMetadata, { once: true });
    videoEl.src = src;
    videoEl.load();
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

  // Modal functionality with ESC key (bound via host on @Component)
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
    const currentLang = this.translate.currentLang || 'en';
    const currentPath = this.router.url.split('?')[0];

    // Determine canonical URL based on current path
    let canonicalPath = '/en';
    if (currentPath.startsWith('/es')) {
      canonicalPath = '/es';
    } else if (currentPath === '/') {
      canonicalPath = '/en';
    }

    // Use TranslateService for SEO titles and descriptions
    this.translate.get(['HOME_PAGE.SEO.TITLE', 'HOME_PAGE.SEO.DESCRIPTION', 'HOME_PAGE.SEO.KEYWORDS']).subscribe((translations: any) => {
      const title = translations['HOME_PAGE.SEO.TITLE'] || 'Llanotecnica - Professional Concrete Mixers MT-370 & MT-480';
      const description = translations['HOME_PAGE.SEO.DESCRIPTION'] || 'Professional concrete mixers MT-370 and MT-480. High-quality construction equipment for contractors in Panama and Central America.';
      const keywords = translations['HOME_PAGE.SEO.KEYWORDS'] || 'concrete mixer, construction equipment, MT-370, MT-480, Panama, Central America';

      this.seoService.updateMetaTags({
        title: title,
        description: description,
        keywords: keywords,
        image: 'https://www.llanotecnica.com/assets/photos/MT-370-optimized.jpg',
        url: canonicalPath,
        type: 'website'
      });

      // Add hreflang tags
      this.seoService.addHreflangTags([
        { lang: 'en', url: 'https://www.llanotecnica.com/en' },
        { lang: 'es', url: 'https://www.llanotecnica.com/es' },
        { lang: 'x-default', url: 'https://www.llanotecnica.com/en' }
      ]);

      // Add enhanced structured data schemas
      this.addBreadcrumbSchema(currentLang);
      this.addLocalBusinessSchema();
      this.addVideoObjectSchemas(currentLang);
      this.addItemListSchema();
      this.addHowToSchema(currentLang);
    });
  }

  private addBreadcrumbSchema(lang: string): void {
    const breadcrumbData = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': [
        {
          '@type': 'ListItem',
          'position': 1,
          'name': lang === 'es' ? 'Inicio' : 'Home',
          'item': `https://www.llanotecnica.com/${lang}`
        }
      ]
    };
    this.seoService.addStructuredData(breadcrumbData);
  }

  private addLocalBusinessSchema(): void {
    const localBusinessData = {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      '@id': 'https://www.llanotecnica.com/#business',
      'name': 'Llanotecnica',
      'image': 'https://www.llanotecnica.com/assets/photos/coverphoto.webp',
      'description': 'Professional concrete mixers MT-370 and MT-480. High-quality construction equipment for contractors in Panama and Central America since 2002.',
      'url': 'https://www.llanotecnica.com',
      'telephone': '+507-6566-4942',
      'email': 'ventas@llanotecnica.com',
      'address': {
        '@type': 'PostalAddress',
        'streetAddress': 'Rio Chico, Calle Principal, Corregimiento de Pacora',
        'addressLocality': 'Panama City',
        'addressRegion': 'Panama',
        'addressCountry': 'PA'
      },
      'geo': {
        '@type': 'GeoCoordinates',
        'latitude': 9.0735,
        'longitude': -79.3991
      },
      'openingHoursSpecification': [
        {
          '@type': 'OpeningHoursSpecification',
          'dayOfWeek': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          'opens': '08:00',
          'closes': '17:00'
        },
        {
          '@type': 'OpeningHoursSpecification',
          'dayOfWeek': 'Saturday',
          'opens': '08:00',
          'closes': '13:00'
        }
      ],
      'priceRange': '$$',
      'areaServed': [
        {
          '@type': 'Country',
          'name': 'Panama'
        },
        {
          '@type': 'Country',
          'name': 'Costa Rica'
        },
        {
          '@type': 'Country',
          'name': 'Guatemala'
        },
        {
          '@type': 'Country',
          'name': 'Honduras'
        },
        {
          '@type': 'Country',
          'name': 'El Salvador'
        },
        {
          '@type': 'Country',
          'name': 'Nicaragua'
        }
      ],
      'sameAs': [
        'https://www.facebook.com/llanotecnica2007/',
        'https://www.instagram.com/llanotecnica'
      ]
    };
    this.seoService.addStructuredData(localBusinessData);
  }

  private addVideoObjectSchemas(lang: string): void {
    // Main introduction video
    const introVideoSrc = lang === 'es'
      ? 'https://www.llanotecnica.com/assets/compressedvideos/IntroductionSpanish.mp4'
      : 'https://www.llanotecnica.com/assets/compressedvideos/IntroductionEnglish.mp4';

    const introVideoData = {
      '@context': 'https://schema.org',
      '@type': 'VideoObject',
      'name': lang === 'es' ? 'Introducción a Mezcladores de Concreto Llanotecnica' : 'Introduction to Llanotecnica Concrete Mixers',
      'description': lang === 'es'
        ? 'Video de presentación de nuestros mezcladores de concreto profesionales MT-370 y MT-480 para proyectos de construcción.'
        : 'Introduction video showcasing our professional concrete mixers MT-370 and MT-480 for construction projects.',
      'thumbnailUrl': 'https://www.llanotecnica.com/assets/photos/coverphoto.webp',
      'uploadDate': '2024-01-01T00:00:00Z',
      'contentUrl': introVideoSrc,
      'embedUrl': introVideoSrc,
      'duration': 'PT2M30S'
    };
    this.seoService.addStructuredData(introVideoData);

    // Instruction video
    const instructionVideoData = {
      '@context': 'https://schema.org',
      '@type': 'VideoObject',
      'name': lang === 'es' ? 'Cómo Operar Mezcladores MT-370 y MT-480' : 'How to Operate MT-370 and MT-480 Mixers',
      'description': lang === 'es'
        ? 'Video instructivo detallado sobre la operación correcta de nuestros mezcladores de concreto MT-370 y MT-480.'
        : 'Detailed instructional video on proper operation of our MT-370 and MT-480 concrete mixers.',
      'thumbnailUrl': 'https://www.llanotecnica.com/assets/photos/instruction-poster.png',
      'uploadDate': '2024-01-01T00:00:00Z',
      'contentUrl': 'https://www.llanotecnica.com/assets/compressedvideos/instruction.mp4',
      'embedUrl': 'https://www.llanotecnica.com/assets/compressedvideos/instruction.mp4',
      'duration': 'PT5M00S'
    };
    this.seoService.addStructuredData(instructionVideoData);
  }

  private addItemListSchema(): void {
    const itemListData = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      'itemListElement': [
        {
          '@type': 'Product',
          'position': 1,
          'name': 'MT-370 Concrete Mixer',
          'description': 'Compact 370L capacity concrete mixer perfect for residential and small commercial projects.',
          'image': 'https://www.llanotecnica.com/assets/photos/MT-370-optimized.jpg',
          'brand': {
            '@type': 'Brand',
            'name': 'Llanotecnica'
          },
          'offers': {
            '@type': 'Offer',
            'availability': 'https://schema.org/InStock',
            'priceCurrency': 'USD',
            'url': 'https://www.llanotecnica.com/en/products'
          }
        },
        {
          '@type': 'Product',
          'position': 2,
          'name': 'MT-480 Concrete Mixer',
          'description': 'Heavy-duty 480L capacity concrete mixer designed for large commercial construction projects.',
          'image': 'https://www.llanotecnica.com/assets/photos/MT-480-optimized.jpg',
          'brand': {
            '@type': 'Brand',
            'name': 'Llanotecnica'
          },
          'offers': {
            '@type': 'Offer',
            'availability': 'https://schema.org/InStock',
            'priceCurrency': 'USD',
            'url': 'https://www.llanotecnica.com/en/products'
          }
        }
      ]
    };
    this.seoService.addStructuredData(itemListData);
  }

  private addHowToSchema(lang: string): void {
    const howToData = {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      'name': lang === 'es' ? 'Cómo Operar un Mezclador de Concreto' : 'How to Operate a Concrete Mixer',
      'description': lang === 'es'
        ? 'Guía paso a paso para operar correctamente los mezcladores de concreto MT-370 y MT-480.'
        : 'Step-by-step guide to properly operating MT-370 and MT-480 concrete mixers.',
      'image': 'https://www.llanotecnica.com/assets/photos/instruction-poster.png',
      'totalTime': 'PT10M',
      'tool': [
        {
          '@type': 'HowToTool',
          'name': lang === 'es' ? 'Mezclador de Concreto MT-370 o MT-480' : 'MT-370 or MT-480 Concrete Mixer'
        }
      ],
      'supply': [
        {
          '@type': 'HowToSupply',
          'name': lang === 'es' ? 'Cemento' : 'Cement'
        },
        {
          '@type': 'HowToSupply',
          'name': lang === 'es' ? 'Agregado' : 'Aggregate'
        },
        {
          '@type': 'HowToSupply',
          'name': lang === 'es' ? 'Agua' : 'Water'
        }
      ],
      'step': [
        {
          '@type': 'HowToStep',
          'position': 1,
          'name': lang === 'es' ? 'Inspección previa' : 'Pre-operation check',
          'text': lang === 'es'
            ? 'Inspeccione todos los componentes y asegure la configuración adecuada antes de iniciar.'
            : 'Inspect all components and ensure proper setup before starting.',
          'url': 'https://www.llanotecnica.com/en#faq'
        },
        {
          '@type': 'HowToStep',
          'position': 2,
          'name': lang === 'es' ? 'Encender el motor' : 'Start the engine',
          'text': lang === 'es'
            ? 'Siga los procedimientos apropiados de arranque del motor según el tipo de motor.'
            : 'Follow proper engine startup procedures according to your engine type.',
          'url': 'https://www.llanotecnica.com/en#faq'
        },
        {
          '@type': 'HowToStep',
          'position': 3,
          'name': lang === 'es' ? 'Configurar posición del tambor' : 'Set drum position',
          'text': lang === 'es'
            ? 'Ajuste el tambor a la posición de mezcla apropiada usando el pedal de control.'
            : 'Set drum to proper mixing position using the foot pedal control.',
          'url': 'https://www.llanotecnica.com/en#faq'
        },
        {
          '@type': 'HowToStep',
          'position': 4,
          'name': lang === 'es' ? 'Cargar materiales' : 'Load materials',
          'text': lang === 'es'
            ? 'Agregue cemento, agregado y agua según las proporciones de mezcla requeridas.'
            : 'Add cement, aggregate, and water according to required mix proportions.',
          'url': 'https://www.llanotecnica.com/en#faq'
        }
      ],
      'video': {
        '@type': 'VideoObject',
        'name': lang === 'es' ? 'Video de Demostración de Operación' : 'Operation Demonstration Video',
        'description': lang === 'es'
          ? 'Video instructivo completo mostrando la operación correcta.'
          : 'Complete instructional video showing proper operation.',
        'thumbnailUrl': 'https://www.llanotecnica.com/assets/photos/instruction-poster.png',
        'contentUrl': 'https://www.llanotecnica.com/assets/compressedvideos/instruction.mp4',
        'uploadDate': '2024-01-01T00:00:00Z'
      }
    };
    this.seoService.addStructuredData(howToData);
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
    // Inject AV1 + H.264 sources for the device type. Browser picks AV1 if it
    // can decode it (smaller + sharper); falls back to H.264 otherwise.
    const target = this.isMobileDevice
      ? this.heroVideoMobile?.nativeElement
      : this.heroVideoDesktop?.nativeElement;

    if (!target) return;
    if (target.querySelector('source')) return; // already loaded

    const av1Path = this.isMobileDevice
      ? '/assets/compressedvideos/hero-mobile.av1.mp4'
      : '/assets/compressedvideos/hero-desktop.av1.mp4';
    const h264Path = this.isMobileDevice
      ? '/assets/compressedvideos/hero-mobile.h264.mp4'
      : '/assets/compressedvideos/hero-desktop.h264.mp4';

    const av1 = document.createElement('source');
    av1.src = av1Path;
    av1.type = 'video/mp4; codecs=av01.0.05M.08';
    target.appendChild(av1);

    const h264 = document.createElement('source');
    h264.src = h264Path;
    h264.type = 'video/mp4; codecs=avc1.640028';
    target.appendChild(h264);

    target.load();
  }
}

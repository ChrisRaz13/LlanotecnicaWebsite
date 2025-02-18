import {
  Component, OnInit, AfterViewInit, OnDestroy, ElementRef, QueryList, ViewChildren, ViewChild, Inject, PLATFORM_ID, ChangeDetectorRef, NgZone
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { trigger, transition, style, animate } from '@angular/animations';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { debounceTime, distinctUntilChanged, map, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

interface Value {
  icon: string;
  title: string;
  description: string;
}

interface ProductionStage {
  image: string;
  title: string;
  description: string;
  visible: boolean;
}

@Component({
  selector: 'app-about-us',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './about-us.component.html',
  styleUrls: ['./about-us.component.css'],
  animations: [
    trigger('fadeSlideInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0, transform: 'translateY(-10px)' }))
      ])
    ])
  ]
})
export class AboutUsComponent implements OnInit, AfterViewInit, OnDestroy {
  [x: string]: any;
  @ViewChildren('stageElement') stageElements!: QueryList<ElementRef>;
  @ViewChild('finalCtaElement') finalCtaElement!: ElementRef;
  @ViewChild('videoElement') videoElement!: ElementRef;
  @ViewChild('heroContent') heroContent!: ElementRef;
  @ViewChildren('statNumber') statNumbers!: QueryList<ElementRef>;

  finalCtaVisible = false;
  heroContentVisible = false;

  values: Value[] = [
    { icon: 'fas fa-lightbulb', title: 'Innovation', description: 'Pushing boundaries in mixing technology with cutting-edge solutions' },
    { icon: 'fas fa-shield-alt', title: 'Quality', description: 'Unwavering commitment to excellence in every machine we produce' },
    { icon: 'fas fa-leaf', title: 'Sustainability', description: 'Environmental responsibility through efficient, eco-friendly designs' },
    { icon: 'fas fa-handshake', title: 'Partnership', description: 'Building lasting relationships through trust and mutual success' }
  ];

  productionStages: ProductionStage[] = [
    { image: 'assets/photos/worker1.jpg', title: 'Precision Welding', description: 'Ensuring durability & strength in every frame.', visible: false },
    { image: 'assets/photos/worker2.jpg', title: 'Expert Assembly', description: 'Every part meticulously placed for peak performance.', visible: false },
    { image: 'assets/photos/worker3.jpg', title: 'Quality Assurance', description: 'Rigorous testing to meet industry standards.', visible: false },
    { image: 'assets/photos/worker4.jpg', title: 'Final Inspections', description: 'Ensuring perfection before shipping out.', visible: false },
    { image: 'assets/photos/worker5.jpg', title: 'Premium Finishing', description: 'High-quality coatings for a lasting impact.', visible: false },
    { image: 'assets/photos/worker6.jpg', title: 'Final Quality Check', description: 'A comprehensive final inspection ensuring every machine meets our rigorous standards.', visible: false }
  ];

  private observers: IntersectionObserver[] = [];
  private finalCtaObserver: IntersectionObserver | null = null;
  private heroObserver: IntersectionObserver | null = null;
  private statsObserver: IntersectionObserver | null = null;
  private destroy$ = new Subject<void>();

  mapUrl: SafeResourceUrl | undefined;

  inquiryTypes: string[] = [
    'Product Information',
    'Price Quote',
    'Spare Parts',
    'Technical Support',
    'Maintenance Service',
    'Dealer/Distribution',
    'Warranty Claim',
    'General Inquiry'
  ];

  companyDetails = {
    phone: '+507 6566-4942',
    whatsapp: 'https://wa.me/50765664942',
    email: 'ventas@llanotecnica.com',
    address: 'Panama City, Panama',
    mapLocation: {
      lat: 8.9824,
      lng: -79.5199
    }
  };

  socialLinks = {
    facebook: 'https://www.facebook.com/llanotecnica2007/',
    instagram: 'https://instagram.com/llanotecnica'
  };

  constructor(
    private fb: FormBuilder,
    private sanitizer: DomSanitizer,
    private ngZone: NgZone,
    private http: HttpClient,
    private cd: ChangeDetectorRef,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this['initializeMap']();
    }
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this['loadRecaptcha']();
      this['loadCountries']().then(() => {
        this['setupCountrySearch']();
      });
      this.router.events.subscribe(event => {
        if (event instanceof NavigationEnd) {
          this['loadCountries']();
        }
      });
    }
    setTimeout(() => {
      this.heroContentVisible = true;
    }, 100);
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      if (this.videoElement) {
        this.videoElement.nativeElement.muted = true;
      }
      window.requestAnimationFrame(() => {
        this.setupIntersectionObservers();
        this.setupFinalCtaObserver();
        this.setupHeroObserver();
        this.setupStatsAnimation();
      });
    }
  }

  private setupIntersectionObservers(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.productionStages.forEach(stage => stage.visible = true);
      return;
    }
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.stageElements.forEach((element, index) => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              this.productionStages[index].visible = true;
              observer.disconnect();
            }
          });
        },
        { threshold: 0.2, rootMargin: '0px 0px -100px 0px' }
      );
      observer.observe(element.nativeElement);
      this.observers.push(observer);
    });
  }

  private setupStatsAnimation(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.animateAllStats();
      return;
    }
    const options = { threshold: 0.3, rootMargin: '0px 0px -100px 0px' };
    this.statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const card = entry.target as HTMLElement;
          this.animateStatCard(card);
          this.statsObserver?.unobserve(card);
        }
      });
    }, options);
    if (isPlatformBrowser(this.platformId)) {
      const statCards = document.querySelectorAll('.stat-card');
      statCards.forEach(card => this.statsObserver?.observe(card));
    }
  }

  private animateStatCard(card: HTMLElement): void {
    const number = card.querySelector('.stat-number');
    const label = card.querySelector('.stat-label');
    if (number && label) {
      number.classList.add('animate');
      label.classList.add('animate');
      const targetValue = parseInt(number.getAttribute('data-value') || '0');
      this.animateNumber(number as HTMLElement, targetValue);
    }
  }

  private animateNumber(element: HTMLElement, target: number): void {
    const steps = 60;
    const stepValue = target / steps;
    let current = 0;
    const updateNumber = () => {
      current += stepValue;
      if (current > target) current = target;
      element.textContent = Math.round(current).toString() + (target > 100 ? '+' : '');
      if (current < target) {
        requestAnimationFrame(updateNumber);
      }
    };
    requestAnimationFrame(updateNumber);
  }

  private animateAllStats(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach(card => this.animateStatCard(card as HTMLElement));
  }

  private setupFinalCtaObserver(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.finalCtaVisible = true;
      return;
    }
    if (this.finalCtaElement) {
      this.finalCtaObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              this.finalCtaVisible = true;
              this.finalCtaObserver?.disconnect();
            }
          });
        },
        { threshold: 0.3, rootMargin: '0px 0px -100px 0px' }
      );
      this.finalCtaObserver.observe(this.finalCtaElement.nativeElement);
    }
  }

  private setupHeroObserver(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.heroContentVisible = true;
      return;
    }
    if (this.heroContent) {
      this.heroObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              this.heroContentVisible = true;
              this.heroObserver?.disconnect();
            }
          });
        },
        { threshold: 0.2, rootMargin: '0px' }
      );
      this.heroObserver.observe(this.heroContent.nativeElement);
    }
  }

  ngOnDestroy(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.finalCtaObserver?.disconnect();
    this.heroObserver?.disconnect();
    this.statsObserver?.disconnect();
    this.destroy$.next();
    this.destroy$.complete();
  }
}

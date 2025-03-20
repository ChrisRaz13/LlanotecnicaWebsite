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
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { RecaptchaModule } from 'ng-recaptcha';

@Component({
  selector: 'app-about-us',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    TranslateModule,
    RecaptchaModule
  ],
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
  @ViewChildren('stageElement') stageElements!: QueryList<ElementRef>;
  @ViewChild('finalCtaElement') finalCtaElement!: ElementRef;
  @ViewChild('videoElement') videoElement!: ElementRef;
  @ViewChild('heroContent') heroContent!: ElementRef;
  @ViewChildren('statNumber') statNumbers!: QueryList<ElementRef>;

  contactForm: FormGroup;
  finalCtaVisible = false;
  heroContentVisible = false;
  stageVisibility: boolean[] = [];

  private observers: IntersectionObserver[] = [];
  private finalCtaObserver: IntersectionObserver | null = null;
  private heroObserver: IntersectionObserver | null = null;
  private statsObserver: IntersectionObserver | null = null;
  private destroy$ = new Subject<void>();

  mapUrl: SafeResourceUrl | undefined;
  companyDetails = {
    phone: '',
    whatsapp: '',
    email: '',
    address: '',
    mapLocation: {
      lat: 8.9824,
      lng: -79.5199
    }
  };

  socialLinks = {
    facebook: '',
    instagram: ''
  };

  constructor(
    private fb: FormBuilder,
    private sanitizer: DomSanitizer,
    private ngZone: NgZone,
    private http: HttpClient,
    private cd: ChangeDetectorRef,
    private router: Router,
    private translate: TranslateService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeMap();
    }

    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      company: [''],
      country: ['', Validators.required],
      inquiryType: ['', Validators.required],
      message: ['', Validators.required],
      recaptcha: ['', Validators.required]
    });

    // Initialize stage visibility
    this.translate.get('ABOUT_US_PAGE.PRODUCTION_STORY.STAGES').subscribe((stages: any[]) => {
      if (stages && Array.isArray(stages)) {
        this.stageVisibility = new Array(stages.length).fill(false);
      }
    });
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadRecaptcha();
      this.loadCountries().then(() => {
        this.setupCountrySearch();
      });
      this.router.events.pipe(
        takeUntil(this.destroy$)
      ).subscribe(event => {
        if (event instanceof NavigationEnd) {
          this.loadCountries();
        }
      });

      // Load company details from translations
      this.translate.get('ABOUT_US_PAGE.COMPANY_DETAILS').subscribe((details: any) => {
        if (details) {
          this.companyDetails.phone = details.PHONE || this.companyDetails.phone;
          this.companyDetails.email = details.EMAIL || this.companyDetails.email;
          this.companyDetails.address = details.ADDRESS || this.companyDetails.address;

          // Update WhatsApp URL based on phone
          this.companyDetails.whatsapp = `https://wa.me/${this.companyDetails.phone.replace(/[^0-9]/g, '')}`;
        }
      });

      // Load social links from translations (if available)
      this.translate.get('FOOTER.COMPANY_INFO.SOCIAL_LINKS').subscribe((links: any) => {
        if (links) {
          this.socialLinks.facebook = links.FACEBOOK_URL || this.socialLinks.facebook;
          this.socialLinks.instagram = links.INSTAGRAM_URL || this.socialLinks.instagram;
        }
      });
    }

    setTimeout(() => {
      this.heroContentVisible = true;
    }, 100);
  }

  private initializeMap(): void {
    const mapUrl = `https://www.google.com/maps/embed/v1/place?key=${environment.googleMapsApiKey}
      &q=${this.companyDetails.mapLocation.lat},${this.companyDetails.mapLocation.lng}`;
    this.mapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(mapUrl);
  }

  private loadRecaptcha(): void {
    if (!document.getElementById('recaptcha-script') && environment.recaptcha?.siteKey) {
      const script = document.createElement('script');
      script.id = 'recaptcha-script';
      script.src = `https://www.google.com/recaptcha/api.js?render=${environment.recaptcha.siteKey}`;
      document.body.appendChild(script);
    }
  }

  private async loadCountries(): Promise<void> {
    try {
      const response = await this.http.get<any[]>('assets/data/countries.json').toPromise();
      return Promise.resolve();
    } catch (error) {
      console.error('Error loading countries:', error);
      return Promise.reject(error);
    }
  }

  private setupCountrySearch(): void {
    this.contactForm.get('country')?.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(value => {
      // Implement country search logic
    });
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      if (this.videoElement?.nativeElement) {
        this.videoElement.nativeElement.muted = true;
      }
      setTimeout(() => {
        this.setupIntersectionObservers();
        this.setupFinalCtaObserver();
        this.setupHeroAnimation();
        this.setupStatsAnimation();
      }, 0);
    }
  }

  private setupIntersectionObservers(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.stageVisibility = this.stageVisibility.map(() => true);
      return;
    }

    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];

    this.stageElements.forEach((element, index) => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              this.ngZone.run(() => {
                this.stageVisibility[index] = true;
                this.cd.detectChanges();
              });
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
      return;
    }

    setTimeout(() => {
      const options = {
        threshold: 0.1,
        rootMargin: '0px 0px -10% 0px'
      };

      this.statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const card = entry.target as HTMLElement;
            this.ngZone.run(() => {
              this.animateStatCard(card);
            });
            this.statsObserver?.unobserve(card);
          }
        });
      }, options);

      const statCards = document.querySelectorAll('.stat-card');
      if (statCards.length > 0) {
        statCards.forEach(card => {
          this.statsObserver?.observe(card);
        });
      }
    }, 100);
  }

  private animateStatCard(card: HTMLElement): void {
    const number = card.querySelector('.stat-number');
    const label = card.querySelector('.stat-label');

    if (number && label) {
      this.cd.detectChanges();

      number.classList.add('animate');
      label.classList.add('animate');

      const targetValue = parseInt(number.getAttribute('data-value') || '0');
      this.animateNumber(number as HTMLElement, targetValue);
    }
  }

  private animateNumber(element: HTMLElement, target: number): void {
    const duration = 2000;
    const steps = 60;
    let start: number | null = null;

    const updateNumber = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      const percentage = Math.min(progress / duration, 1);

      const current = Math.min(Math.round(target * percentage), target);
      element.textContent = current.toString() + (target > 100 ? '+' : '');

      if (progress < duration) {
        requestAnimationFrame(updateNumber);
      }
    };

    requestAnimationFrame(updateNumber);
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
              this.ngZone.run(() => {
                this.finalCtaVisible = true;
                this.cd.detectChanges();
              });
              this.finalCtaObserver?.disconnect();
            }
          });
        },
        { threshold: 0.3, rootMargin: '0px 0px -100px 0px' }
      );
      this.finalCtaObserver.observe(this.finalCtaElement.nativeElement);
    }
  }

  private setupHeroAnimation(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.heroContentVisible = true;
      return;
    }

    if (this.heroContent) {
      this.heroObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              this.ngZone.run(() => {
                this.heroContentVisible = true;
                this.cd.detectChanges();
              });
              this.heroObserver?.disconnect();
            }
          });
        },
        { threshold: 0.1 }
      );
      this.heroObserver.observe(this.heroContent.nativeElement);
    } else {
      // If the hero content element isn't available yet, make it visible anyway
      setTimeout(() => {
        this.heroContentVisible = true;
      }, 100);
    }
  }

  private setupHeroObserver(): void {
    this.setupHeroAnimation();
  }

  onSubmit(): void {
    if (this.contactForm.valid) {
      console.log(this.contactForm.value);
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

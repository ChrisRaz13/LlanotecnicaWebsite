// Type declaration for Google reCAPTCHA Enterprise
declare global {
  interface Window {
    grecaptcha: {
      enterprise: {
        ready: (callback: () => void) => void;
        execute: (siteKey: string, options: { action: string }) => Promise<string>;
      };
    };
  }
}

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  OnInit,
  OnDestroy,
  PLATFORM_ID,
  ElementRef,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { trigger, transition, style, animate } from '@angular/animations';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { debounceTime, distinctUntilChanged, map, takeUntil, timeout, catchError } from 'rxjs/operators';
import { Subject, of } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SeoService } from '../../services/seo.service';
import { RecaptchaService } from '../../services/language-selector/recaptcha.service';

import { ClickOutsideDirective } from '../../shared/directives/click-outside.directive';
import { Country, FALLBACK_COUNTRIES } from '../../shared/data/countries.data';
import { LtButtonComponent } from '../../ui/button/lt-button.component';

interface ContactForm {
  name: string;
  email: string;
  phone?: string;
  country: string;
  countryCode: string;
  inquiryType: string;
  message: string;
  recaptchaToken: string;
}

interface SubmitResponse {
  message: string;
  recaptchaScore?: number;
  error?: string;
}

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css'],
  imports: [ReactiveFormsModule, TranslateModule, ClickOutsideDirective, LtButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(window:keydown)': 'handleKeyboardEvent($event)',
  },
  animations: [
    trigger('fadeSlideInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0, transform: 'translateY(-10px)' })),
      ]),
    ]),
  ],
})
export class ContactComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('countryInput') countryInput!: ElementRef;
  @ViewChild('contactHeroEyebrow') contactHeroEyebrow?: ElementRef<HTMLElement>;
  @ViewChild('contactHeroTitle') contactHeroTitle?: ElementRef<HTMLElement>;
  @ViewChild('contactHeroDescription') contactHeroDescription?: ElementRef<HTMLElement>;
  @ViewChild('contactHeroLinks') contactHeroLinks?: ElementRef<HTMLElement>;
  @ViewChild('contactFormSection') contactFormSection?: ElementRef<HTMLElement>;
  @ViewChild('contactFormEyebrow') contactFormEyebrow?: ElementRef<HTMLElement>;
  @ViewChild('contactFormTitle') contactFormTitle?: ElementRef<HTMLElement>;
  @ViewChild('contactFormSubtitle') contactFormSubtitle?: ElementRef<HTMLElement>;
  @ViewChild('contactFormCard') contactFormCard?: ElementRef<HTMLElement>;
  @ViewChild('contactInfoCard') contactInfoCard?: ElementRef<HTMLElement>;

  // ----- DI (modern v21 inject() pattern) -----
  private readonly fb = inject(FormBuilder);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly recaptchaService = inject(RecaptchaService);
  private readonly seoService = inject(SeoService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly translate = inject(TranslateService);

  // ----- Reactive form (FormGroup has its own change-tracking, kept as a property) -----
  readonly contactForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^[a-zA-ZÀ-ÿ\s]*$/)]],
    email: ['', [Validators.required, Validators.email, Validators.pattern(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)]],
    phone: ['', [Validators.pattern(/^\+?[\d\s-]{10,}$/)]],
    country: ['', [Validators.required]],
    countryCode: ['', [Validators.required]],
    inquiryType: ['', Validators.required],
    message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]],
    recaptchaToken: [''],
  });

  // ----- Signal-based state (templates read via `()`, OnPush picks up changes) -----
  readonly countries = signal<Country[]>([]);
  readonly filteredCountries = signal<Country[]>([]);
  readonly showCountryDropdown = signal(false);
  readonly isLoadingCountries = signal(false);
  readonly selectedCountryIndex = signal(-1);
  readonly isSubmitting = signal(false);
  readonly submitSuccess = signal(false);
  readonly submitError = signal(false);
  readonly errorMessage = signal('');
  readonly mapUrl = signal<SafeResourceUrl | undefined>(undefined);

  private readonly destroy$ = new Subject<void>();
  private recaptchaScript?: HTMLScriptElement;
  private heroEntryTimeline: gsap.core.Timeline | null = null;
  private contactScrollTriggers: ScrollTrigger[] = [];

  readonly inquiryTypes: ReadonlyArray<string> = [
    'Product Information',
    'Price Quote',
    'Spare Parts',
    'Technical Support',
    'Maintenance Service',
    'Dealer/Distribution',
    'Warranty Claim',
    'General Inquiry',
  ];

  // companyDetails is mutated once during initializeMap (synchronously, in the
  // constructor). By the time the view first paints the address is final, so
  // a plain object is fine — no signal needed.
  companyDetails = {
    phone: '+507 6566-4942',
    whatsapp: 'https://wa.me/50765664942',
    email: 'ventas@llanotecnica.com',
    address: 'Panama City, Panama',
    mapLocation: { lat: 8.9824, lng: -79.5199 },
  };

  readonly socialLinks = {
    facebook: 'https://www.facebook.com/llanotecnica2007/',
    instagram: 'https://instagram.com/llanotecnica',
  };

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeMap();
    }
  }

  ngOnInit() {
    // SEO setup must run on the server too so prerendered HTML has correct
    // canonical/hreflang tags.
    this.setupSEO();

    if (isPlatformBrowser(this.platformId)) {
      this.loadCountries().then(() => {
        this.setupCountrySearch();
      });

      this.router.events.subscribe(event => {
        if (event instanceof NavigationEnd) {
          this.loadCountries();
        }
      });

      this.translate.onLangChange.subscribe(() => {
        this.setupSEO();
      });
    }
  }

  private setupSEO(): void {
    const currentPath = this.router.url.split('?')[0];

    let canonicalPath = '/en/contact';
    if (currentPath.includes('/es/') || currentPath.includes('/contacto')) {
      canonicalPath = '/es/contacto';
    }

    this.translate
      .get(['CONTACT_PAGE.SEO.TITLE', 'CONTACT_PAGE.SEO.DESCRIPTION', 'CONTACT_PAGE.SEO.KEYWORDS'])
      .subscribe((translations: any) => {
        const title = translations['CONTACT_PAGE.SEO.TITLE'] || "Contact Us - Llanotecnica | Get a Quote";
        const description =
          translations['CONTACT_PAGE.SEO.DESCRIPTION'] ||
          "Contact Llanotecnica for quotes, technical support, and product information. We're here to help with all your concrete mixer needs.";
        const keywords =
          translations['CONTACT_PAGE.SEO.KEYWORDS'] ||
          'contact, quote, technical support, Llanotecnica, Panama';

        this.seoService.updateMetaTags({
          title,
          description,
          keywords,
          image: 'https://www.llanotecnica.com/assets/photos/coverphoto.webp',
          url: canonicalPath,
          type: 'website',
        });

        this.seoService.addHreflangTags([
          { lang: 'en', url: 'https://www.llanotecnica.com/en/contact' },
          { lang: 'es', url: 'https://www.llanotecnica.com/es/contacto' },
          { lang: 'x-default', url: 'https://www.llanotecnica.com/en/contact' },
        ]);
      });
  }

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    gsap.registerPlugin(ScrollTrigger);
    this.buildContactHeroEntry();
    requestAnimationFrame(() => this.setupContactSectionReveals());
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.heroEntryTimeline?.kill();
    this.contactScrollTriggers.forEach((t) => t.kill());
    if (isPlatformBrowser(this.platformId) && this.recaptchaScript) {
      this.recaptchaScript.remove();
    }
  }

  /** Hero entry — eyebrow bar draws, then title + description + quick-links cascade. */
  private buildContactHeroEntry(): void {
    const eyebrow = this.contactHeroEyebrow?.nativeElement;
    const title = this.contactHeroTitle?.nativeElement;
    const desc = this.contactHeroDescription?.nativeElement;
    const links = this.contactHeroLinks?.nativeElement;
    if (!eyebrow || !title || !desc || !links) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      gsap.set([eyebrow, title, desc, links], { opacity: 1, y: 0 });
      return;
    }

    const eyebrowBar = eyebrow.querySelector('.lt-contact-hero__eyebrow-bar');
    const eyebrowText = eyebrow.querySelector('.lt-contact-hero__eyebrow-text');
    const linkPills = links.querySelectorAll('.lt-contact-quick');

    gsap.set(eyebrow, { opacity: 1 });
    gsap.set(eyebrowBar, { width: 0 });
    gsap.set(eyebrowText, { opacity: 0, x: -6 });
    gsap.set([title, desc, links], { opacity: 0, y: 20 });
    gsap.set(linkPills, { opacity: 0, y: 12 });

    this.heroEntryTimeline = gsap
      .timeline({ defaults: { ease: 'power3.out' } })
      .to(eyebrowBar, { width: 32, duration: 0.4 })
      .to(eyebrowText, { opacity: 1, x: 0, duration: 0.35, ease: 'power2.out' }, '-=0.15')
      .to(title, { opacity: 1, y: 0, duration: 0.7, ease: 'expo.out' }, '-=0.1')
      .to(desc, { opacity: 1, y: 0, duration: 0.55 }, '-=0.4')
      .to(links, { opacity: 1, y: 0, duration: 0.4 }, '-=0.3')
      .to(linkPills, { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, ease: 'power2.out' }, '-=0.2');
  }

  /** Scroll-triggered reveal for the form/info cards. */
  private setupContactSectionReveals(): void {
    const section = this.contactFormSection?.nativeElement;
    if (!section) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const heads = [
      this.contactFormEyebrow?.nativeElement,
      this.contactFormTitle?.nativeElement,
      this.contactFormSubtitle?.nativeElement,
    ].filter(Boolean) as HTMLElement[];
    const cards = [
      this.contactFormCard?.nativeElement,
      this.contactInfoCard?.nativeElement,
    ].filter(Boolean) as HTMLElement[];

    if (reduced) {
      gsap.set([...heads, ...cards], { opacity: 1, y: 0, scale: 1 });
      return;
    }

    gsap.set(heads, { opacity: 0, y: 24 });
    gsap.set(cards, { opacity: 0, y: 28, scale: 0.97 });

    const tl = gsap.timeline({
      defaults: { ease: 'power3.out' },
      scrollTrigger: { trigger: section, start: 'top 78%', toggleActions: 'play none none none' },
    });
    heads.forEach((el, i) => {
      tl.to(el, { opacity: 1, y: 0, duration: 0.5 }, i === 0 ? 0 : '-=0.3');
    });
    if (cards.length) {
      tl.to(
        cards,
        { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.12, ease: 'power4.out' },
        '-=0.25',
      );
    }
    if (tl.scrollTrigger) this.contactScrollTriggers.push(tl.scrollTrigger);
  }

  private setupCountrySearch() {
    this.contactForm
      .get('country')
      ?.valueChanges.pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((value) => {
        if (typeof value === 'string') this.filterCountries(value);
      });
  }

  private async loadCountries() {
    try {
      this.isLoadingCountries.set(true);

      const response = await this.http
        .get<Country[]>('https://restcountries.com/v3.1/all?fields=name,cca2,flags,region')
        .pipe(
          timeout(5000),
          map((countries) => countries.sort((a, b) => a.name.common.localeCompare(b.name.common))),
          catchError((error) => {
            console.warn('⚠️ Countries API failed, using fallback list:', error);
            return of(FALLBACK_COUNTRIES.sort((a, b) => a.name.common.localeCompare(b.name.common)));
          }),
        )
        .toPromise();

      if (response && response.length > 0) {
        this.countries.set(response);
        this.filteredCountries.set([...response]);
      } else {
        throw new Error('Empty response from API');
      }
    } catch (error) {
      console.error('🚨 Error loading countries, using fallback:', error);
      const fallback = [...FALLBACK_COUNTRIES].sort((a, b) =>
        a.name.common.localeCompare(b.name.common),
      );
      this.countries.set(fallback);
      this.filteredCountries.set(fallback);
    } finally {
      this.isLoadingCountries.set(false);
    }
  }

  filterCountries(value: string) {
    const searchTerm = value.toLowerCase();
    this.filteredCountries.set(
      this.countries().filter(
        (c) =>
          c.name.common.toLowerCase().includes(searchTerm) ||
          c.name.official.toLowerCase().includes(searchTerm),
      ),
    );
    this.showCountryDropdown.set(true);
    this.selectedCountryIndex.set(-1);
  }

  selectCountry(country: Country) {
    this.contactForm.patchValue({ country: country.name.common, countryCode: country.cca2 });
    this.showCountryDropdown.set(false);
    this.selectedCountryIndex.set(-1);
  }

  handleKeyboardEvent(event: KeyboardEvent) {
    if (!this.showCountryDropdown()) return;
    const max = this.filteredCountries().length - 1;
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.selectedCountryIndex.update((i) => Math.min(i + 1, max));
        this.scrollToSelectedCountry();
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.selectedCountryIndex.update((i) => Math.max(i - 1, -1));
        this.scrollToSelectedCountry();
        break;
      case 'Enter':
        event.preventDefault();
        const idx = this.selectedCountryIndex();
        if (idx >= 0) this.selectCountry(this.filteredCountries()[idx]);
        break;
      case 'Escape':
        this.showCountryDropdown.set(false);
        this.selectedCountryIndex.set(-1);
        break;
    }
  }

  private scrollToSelectedCountry() {
    const idx = this.selectedCountryIndex();
    if (idx < 0) return;
    const dropdown = document.querySelector('.country-dropdown');
    const selectedOption = document.querySelector(`.country-option:nth-child(${idx + 1})`);
    if (!dropdown || !selectedOption) return;
    const dRect = dropdown.getBoundingClientRect();
    const sRect = selectedOption.getBoundingClientRect();
    if (sRect.bottom > dRect.bottom) {
      dropdown.scrollTop += sRect.bottom - dRect.bottom;
    } else if (sRect.top < dRect.top) {
      dropdown.scrollTop -= dRect.top - sRect.top;
    }
  }

  onCountryInputFocus() {
    if (this.filteredCountries().length > 0) {
      this.showCountryDropdown.set(true);
    }
  }

  onClickOutside(event: Event) {
    if (!(event.target as HTMLElement).closest('.country-selector')) {
      this.showCountryDropdown.set(false);
      this.selectedCountryIndex.set(-1);
    }
  }

  getSelectedCountryFlag(): string | null {
    const selectedCountry = this.countries().find(
      (c) => c.name.common === this.contactForm.get('country')?.value,
    );
    return selectedCountry?.flags.svg || null;
  }

  private initializeMap() {
    if (!environment.googleMapsApiKey) {
      console.error('🚨 Google Maps API key is missing');
      return;
    }
    const address = encodeURIComponent(
      'Llanotecnica SA, Rio Chico, Calle Principal, Corregimiento de, Pacora, Provincia de Panamá, Panamá',
    );
    this.mapUrl.set(
      this.sanitizer.bypassSecurityTrustResourceUrl(
        `https://www.google.com/maps/embed/v1/place?key=${environment.googleMapsApiKey}&q=${address}&zoom=16`,
      ),
    );
    this.companyDetails = {
      ...this.companyDetails,
      address: 'Rio Chico, Calle Principal, Corregimiento de Pacora, Provincia de Panamá, Panamá',
    };
  }

  async onSubmit() {
    if (!isPlatformBrowser(this.platformId)) return;
    if (!this.contactForm.valid || this.isSubmitting()) {
      this.markFormGroupTouched(this.contactForm);
      return;
    }

    this.isSubmitting.set(true);
    this.submitSuccess.set(false);
    this.submitError.set(false);
    this.errorMessage.set('');

    try {
      const token = await this.recaptchaService.executeRecaptcha('contact_form_submit').toPromise();

      const formData: ContactForm = { ...this.contactForm.value, recaptchaToken: token };

      const response = await this.http
        .post<SubmitResponse>(environment.contactFormEndpoint, formData)
        .toPromise();

      this.submitSuccess.set(true);
      this.contactForm.reset();
      if (response?.recaptchaScore) {
        console.log('📊 reCAPTCHA Score:', response.recaptchaScore);
      }
    } catch (error) {
      this.submitError.set(true);
      // All non-2xx HttpErrorResponses + network errors get the same generic
      // message — the original code mapped 400/403/429/default all to the
      // same key, so keep that behavior but skip the redundant switch.
      this.errorMessage.set(this.translate.instant('CONTACT_PAGE.ERROR_MESSAGE'));
      if (error instanceof HttpErrorResponse) {
        console.error(`🔥 Form submission HTTP ${error.status}:`, error);
      } else {
        console.error('🔥 Form submission error:', error);
      }
    } finally {
      this.isSubmitting.set(false);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  getErrorMessage(controlName: string): string {
    const control = this.contactForm.get(controlName);
    if (!control || !control.errors || !control.touched) return '';

    if (control.errors['required']) return this.translate.instant('CONTACT_PAGE.ERROR_REQUIRED');
    if (control.errors['email']) return this.translate.instant('CONTACT_PAGE.ERROR_EMAIL');
    if (control.errors['minlength']) {
      return this.translate.instant('CONTACT_PAGE.ERROR_MINLENGTH', {
        value: control.errors['minlength'].requiredLength,
      });
    }
    if (control.errors['maxlength']) {
      return this.translate.instant('CONTACT_PAGE.ERROR_MAXLENGTH', {
        value: control.errors['maxlength'].requiredLength,
      });
    }
    if (control.errors['pattern']) return this.translate.instant('CONTACT_PAGE.ERROR_PATTERN');

    return this.translate.instant('CONTACT_PAGE.ERROR_MESSAGE');
  }
}

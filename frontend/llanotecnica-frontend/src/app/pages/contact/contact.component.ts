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
  Component,
  OnInit,
  OnDestroy,
  HostListener,
  Inject,
  PLATFORM_ID,
  NgZone,
  ElementRef,
  ViewChild,
  ChangeDetectorRef
} from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { trigger, transition, style, animate } from '@angular/animations';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { debounceTime, distinctUntilChanged, map, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';

interface Country {
  name: {
    common: string;
    official: string;
  };
  cca2: string;
  flags: {
    svg: string;
    png: string;
  };
  region?: string;
}

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
  styleUrls: ['./contact.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
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
export class ContactComponent implements OnInit, OnDestroy {
  @ViewChild('countryInput') countryInput!: ElementRef;

  contactForm!: FormGroup;
  countries: Country[] = [];
  filteredCountries: Country[] = [];
  showCountryDropdown = false;
  isLoadingCountries = false;
  selectedCountryIndex = -1;
  isSubmitting = false;
  submitSuccess = false;
  submitError = false;
  errorMessage = '';
  isFormTouched = false;
  private destroy$ = new Subject<void>();
  private recaptchaScript?: HTMLScriptElement;
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
    this.initializeForm();
    if (isPlatformBrowser(this.platformId)) {
      this.initializeMap();
    }
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadRecaptcha();
      this.loadCountries().then(() => {
        this.setupCountrySearch();
      });
      this.router.events.subscribe(event => {
        if (event instanceof NavigationEnd) {
          this.loadCountries();
        }
      });
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    if (isPlatformBrowser(this.platformId) && this.recaptchaScript) {
      this.recaptchaScript.remove();
    }
  }

  private initializeForm() {
    this.contactForm = this.fb.group({
      name: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.pattern(/^[a-zA-ZÀ-ÿ\s]*$/)
      ]],
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.pattern(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)
      ]],
      phone: ['', [
        Validators.pattern(/^\+?[\d\s-]{10,}$/)
      ]],
      country: ['', [Validators.required]],
      countryCode: ['', [Validators.required]],
      inquiryType: ['', Validators.required],
      message: ['', [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(1000)
      ]],
      recaptchaToken: ['']
    });
  }

  private setupCountrySearch() {
    this.contactForm.get('country')?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(value => {
        if (typeof value === 'string') {
          this.filterCountries(value);
        }
      });
  }

  private async loadCountries() {
    try {
      this.isLoadingCountries = true;
      const response = await this.http
        .get<Country[]>('https://restcountries.com/v3.1/all?fields=name,cca2,flags,region')
        .pipe(map(countries => countries.sort((a, b) => a.name.common.localeCompare(b.name.common))))
        .toPromise();
      if (response) {
        this.countries = response;
        this.filteredCountries = [...this.countries];
        this.cd.detectChanges();
      }
    } catch (error) {
      console.error('Error loading countries:', error);
    } finally {
      this.isLoadingCountries = false;
    }
  }

  filterCountries(value: string) {
    const searchTerm = value.toLowerCase();
    this.filteredCountries = this.countries.filter(country =>
      country.name.common.toLowerCase().includes(searchTerm) ||
      country.name.official.toLowerCase().includes(searchTerm)
    );
    this.showCountryDropdown = true;
    this.selectedCountryIndex = -1;
  }

  selectCountry(country: Country) {
    this.contactForm.patchValue({
      country: country.name.common,
      countryCode: country.cca2
    });
    this.showCountryDropdown = false;
    this.selectedCountryIndex = -1;
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (!this.showCountryDropdown) return;
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.selectedCountryIndex = Math.min(
          this.selectedCountryIndex + 1,
          this.filteredCountries.length - 1
        );
        this.scrollToSelectedCountry();
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.selectedCountryIndex = Math.max(this.selectedCountryIndex - 1, -1);
        this.scrollToSelectedCountry();
        break;
      case 'Enter':
        event.preventDefault();
        if (this.selectedCountryIndex >= 0) {
          this.selectCountry(this.filteredCountries[this.selectedCountryIndex]);
        }
        break;
      case 'Escape':
        this.showCountryDropdown = false;
        this.selectedCountryIndex = -1;
        break;
    }
  }

  private scrollToSelectedCountry() {
    if (this.selectedCountryIndex >= 0) {
      const dropdown = document.querySelector('.country-dropdown');
      const selectedOption = document.querySelector(
        `.country-option:nth-child(${this.selectedCountryIndex + 1})`
      );
      if (dropdown && selectedOption) {
        const dropdownRect = dropdown.getBoundingClientRect();
        const selectedRect = selectedOption.getBoundingClientRect();
        if (selectedRect.bottom > dropdownRect.bottom) {
          dropdown.scrollTop += selectedRect.bottom - dropdownRect.bottom;
        } else if (selectedRect.top < dropdownRect.top) {
          dropdown.scrollTop -= dropdownRect.top - selectedRect.top;
        }
      }
    }
  }

  onCountryInputFocus() {
    if (this.filteredCountries.length > 0) {
      this.showCountryDropdown = true;
    }
  }

  onClickOutside(event: Event) {
    if (!(event.target as HTMLElement).closest('.country-selector')) {
      this.showCountryDropdown = false;
      this.selectedCountryIndex = -1;
    }
  }

  getSelectedCountryFlag(): string | null {
    const selectedCountry = this.countries.find(
      country => country.name.common === this.contactForm.get('country')?.value
    );
    return selectedCountry?.flags.svg || null;
  }

  private initializeMap() {
    if (!environment.googleMapsApiKey) {
      console.error('🚨 Google Maps API key is missing');
      return;
    }
    const address = encodeURIComponent(
      'Llanotecnica SA, Rio Chico, Calle Principal, Corregimiento de, Pacora, Provincia de Panamá, Panamá'
    );
    this.mapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.google.com/maps/embed/v1/place?key=${environment.googleMapsApiKey}&q=${address}&zoom=16`
    );
    this.companyDetails = {
      ...this.companyDetails,
      address: 'Rio Chico, Calle Principal, Corregimiento de Pacora, Provincia de Panamá, Panamá'
    };
  }

  private loadRecaptcha() {
    if (!environment.recaptcha || !environment.recaptcha.siteKey || !isPlatformBrowser(this.platformId)) {
      return;
    }
    // Create and load the reCAPTCHA Enterprise script
    this.recaptchaScript = document.createElement('script');
    this.recaptchaScript.src = `https://www.google.com/recaptcha/enterprise.js?render=${environment.recaptcha.siteKey}`;
    this.recaptchaScript.async = true;
    this.recaptchaScript.defer = true;
    this.recaptchaScript.onload = () => {
      this.ngZone.run(() => {
        if (typeof window.grecaptcha !== 'undefined') {
          // Use the enterprise API
          window.grecaptcha.enterprise.ready(() => {
            console.log('✅ reCAPTCHA Enterprise is ready');
          });
        }
      });
    };
    document.head.appendChild(this.recaptchaScript);
  }

  async onSubmit() {
    if (!isPlatformBrowser(this.platformId)) return;
    if (this.contactForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      this.submitSuccess = false;
      this.submitError = false;
      this.errorMessage = '';
      try {
        // Ensure reCAPTCHA Enterprise is loaded
        if (typeof window.grecaptcha === 'undefined' || typeof window.grecaptcha.enterprise === 'undefined') {
          throw new Error('reCAPTCHA Enterprise is not loaded.');
        }
        // Request a token with your site key and action name
        const token = await window.grecaptcha.enterprise.execute(environment.recaptcha.siteKey, {
          action: 'contact_form_submit'
        });
        const formData: ContactForm = {
          ...this.contactForm.value,
          recaptchaToken: token
        };
        console.log('DEBUG (Angular): Sending formData:', formData);
        const response = await this.http
          .post<SubmitResponse>(environment.contactFormEndpoint, formData)
          .toPromise();
        this.ngZone.run(() => {
          this.submitSuccess = true;
          this.contactForm.reset();
          if (response?.recaptchaScore) {
            console.log('📊 reCAPTCHA Score:', response.recaptchaScore);
          }
        });
      } catch (error) {
        this.ngZone.run(() => {
          this.submitError = true;
          if (error instanceof HttpErrorResponse) {
            switch (error.status) {
              case 400:
                this.errorMessage = 'Please check your form inputs and try again.';
                break;
              case 403:
                this.errorMessage = 'Security verification failed. Please try again.';
                break;
              case 429:
                this.errorMessage = 'Too many attempts. Please try again later.';
                break;
              default:
                this.errorMessage = 'An error occurred. Please try again later.';
            }
          } else {
            this.errorMessage = 'An unexpected error occurred. Please try again.';
          }
          console.error('🔥 Form submission error:', error);
        });
      } finally {
        this.ngZone.run(() => {
          this.isSubmitting = false;
        });
      }
    } else {
      this.markFormGroupTouched(this.contactForm);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  getErrorMessage(controlName: string): string {
    const control = this.contactForm.get(controlName);
    if (!control || !control.errors || !control.touched) return '';
    const errors = {
      required: 'This field is required',
      email: 'Please enter a valid email address',
      minlength: `Minimum length is ${control.errors?.['minlength']?.requiredLength} characters`,
      maxlength: `Maximum length is ${control.errors?.['maxlength']?.requiredLength} characters`,
      pattern: this.getPatternErrorMessage(controlName)
    };
    const firstError = Object.keys(control.errors)[0] as keyof typeof errors;
    return errors[firstError] || 'Invalid input';
  }

  private getPatternErrorMessage(controlName: string): string {
    switch (controlName) {
      case 'name':
        return 'Please enter a valid name (letters only)';
      case 'email':
        return 'Please enter a valid email address';
      case 'phone':
        return 'Please enter a valid phone number';
      default:
        return 'Invalid format';
    }
  }
}

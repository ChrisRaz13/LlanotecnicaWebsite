import { RecaptchaService } from './../../services/language-selector/recaptcha.service';
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

// Import TranslateModule to make the translation pipe available in your template
import { TranslateModule, TranslateService } from '@ngx-translate/core';

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
  styleUrls: ['./contact.component.css'],
  standalone: true,
  // Added TranslateModule to the imports array so that the translate pipe works in your template
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
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
    private recaptchaService: RecaptchaService, // Added RecaptchaService
    @Inject(PLATFORM_ID) private platformId: Object,
    private translate: TranslateService
  ) {
    this.initializeForm();
    if (isPlatformBrowser(this.platformId)) {
      this.initializeMap();
    }
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // We'll keep the loadRecaptcha call for backward compatibility
      // but the service will handle the actual loading
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

  // This method is kept for backward compatibility but is no longer needed
  // as the RecaptchaService handles this now
  private loadRecaptcha() {
    // Function kept for compatibility - no longer used actively
    console.log('ℹ️ Using centralized RecaptchaService instead of local implementation');
  }

  async onSubmit() {
    if (!isPlatformBrowser(this.platformId)) return;
    if (this.contactForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      this.submitSuccess = false;
      this.submitError = false;
      this.errorMessage = '';
      try {
        // Use RecaptchaService to get the token
        console.log('Generating reCAPTCHA token using RecaptchaService...');
        const token = await this.recaptchaService.executeRecaptcha('contact_form_submit').toPromise();

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
                this.errorMessage = this.translate.instant('CONTACT_PAGE.ERROR_MESSAGE');
                break;
              case 403:
                this.errorMessage = this.translate.instant('CONTACT_PAGE.ERROR_MESSAGE');
                break;
              case 429:
                this.errorMessage = this.translate.instant('CONTACT_PAGE.ERROR_MESSAGE');
                break;
              default:
                this.errorMessage = this.translate.instant('CONTACT_PAGE.ERROR_MESSAGE');
            }
          } else {
            this.errorMessage = this.translate.instant('CONTACT_PAGE.ERROR_MESSAGE');
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

    // Required
    if (control.errors['required']) {
      return this.translate.instant('CONTACT_PAGE.ERROR_REQUIRED');
    }
    // Email
    if (control.errors['email']) {
      return this.translate.instant('CONTACT_PAGE.ERROR_EMAIL');
    }
    // Min length
    if (control.errors['minlength']) {
      const requiredLength = control.errors['minlength'].requiredLength;
      return this.translate.instant('CONTACT_PAGE.ERROR_MINLENGTH', { value: requiredLength });
    }
    // Max length
    if (control.errors['maxlength']) {
      const requiredLength = control.errors['maxlength'].requiredLength;
      return this.translate.instant('CONTACT_PAGE.ERROR_MAXLENGTH', { value: requiredLength });
    }
    // Pattern
    if (control.errors['pattern']) {
      return this.translate.instant('CONTACT_PAGE.ERROR_PATTERN');
    }

    // Fallback
    return this.translate.instant('CONTACT_PAGE.ERROR_MESSAGE');
  }

  private getPatternErrorMessage(controlName: string): string {
    switch (controlName) {
      case 'name':
        return this.translate.instant('CONTACT_PAGE.ERROR_PATTERN_NAME');
      case 'email':
        return this.translate.instant('CONTACT_PAGE.ERROR_PATTERN_EMAIL');
      case 'phone':
        return this.translate.instant('CONTACT_PAGE.ERROR_PATTERN_PHONE');
      default:
        return this.translate.instant('CONTACT_PAGE.ERROR_PATTERN');
    }
  }
}

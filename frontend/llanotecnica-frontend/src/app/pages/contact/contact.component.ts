import { Component, OnInit, OnDestroy, HostListener, Inject, PLATFORM_ID, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { trigger, transition, style, animate } from '@angular/animations';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { environment } from '../../../environments/environment';

declare var grecaptcha: any;

interface ContactForm {
  name: string;
  email: string;
  phone?: string;
  inquiryType: string;
  message: string;
  recaptchaToken: string;
}

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css'],
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
  contactForm!: FormGroup;
  isSubmitting = false;
  submitSuccess = false;
  submitError = false;
  isFormTouched = false;
  private recaptchaScript?: HTMLScriptElement;
  mapUrl: SafeResourceUrl | undefined;

  inquiryTypes = [
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
    email: 'info@llanotecnica.com',
    address: 'Panama City, Panama',
    mapLocation: {
      lat: 8.9824,
      lng: -79.5199
    }
  };

  socialLinks = {
    facebook: 'https://facebook.com/llanotecnica',
    instagram: 'https://instagram.com/llanotecnica'
  };

  constructor(
    private fb: FormBuilder,
    private sanitizer: DomSanitizer,
    private ngZone: NgZone,
    private http: HttpClient,
    private firestore: Firestore,
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
    }
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId) && this.recaptchaScript) {
      this.recaptchaScript.remove();
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardNavigation(event: KeyboardEvent) {
    if (event.key === 'Tab') {
      this.isFormTouched = true;
    }
  }

  private initializeForm() {
    this.contactForm = this.fb.group({
      name: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.pattern(/^[a-zA-Z\s]*$/)
      ]],
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.pattern(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)
      ]],
      phone: ['', [
        Validators.pattern(/^\+?[\d\s-]{10,}$/)
      ]],
      inquiryType: ['', Validators.required],
      message: ['', [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(1000)
      ]],
      recaptchaToken: ['']
    });

    this.contactForm.valueChanges.subscribe(() => {
      this.isFormTouched = true;
    });
  }

  private initializeMap() {
    if (!environment.googleMapsApiKey) {
      console.error('🚨 Google Maps API key is missing');
      return;
    }

    const mapUrl = `https://www.google.com/maps/embed/v1/place?key=${environment.googleMapsApiKey}&q=Panama+City+Panama&zoom=15`;
    this.mapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(mapUrl);
  }

  private loadRecaptcha() {
    if (!environment.recaptchaSiteKey || !isPlatformBrowser(this.platformId)) {
      return;
    }

    this.recaptchaScript = document.createElement('script');
    this.recaptchaScript.src = `https://www.google.com/recaptcha/api.js?render=${environment.recaptchaSiteKey}`;
    this.recaptchaScript.async = true;
    this.recaptchaScript.defer = true;

    this.recaptchaScript.onload = () => {
      this.ngZone.run(() => {
        console.log('✅ reCAPTCHA script loaded successfully');
        if (typeof grecaptcha !== 'undefined') {
          grecaptcha.ready(() => {
            console.log('✅ reCAPTCHA is ready');
          });
        }
      });
    };

    this.recaptchaScript.onerror = (error) => {
      this.ngZone.run(() => {
        console.error('🔥 Error loading reCAPTCHA script:', error);
      });
    };

    document.head.appendChild(this.recaptchaScript);
  }

  async onSubmit() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (this.contactForm.valid) {
      this.isSubmitting = true;
      this.submitSuccess = false;
      this.submitError = false;

      try {
        if (typeof grecaptcha === 'undefined') {
          throw new Error('reCAPTCHA is not loaded');
        }

        const token = await new Promise<string>((resolve, reject) => {
          grecaptcha.ready(async () => {
            try {
              const token = await grecaptcha.execute(environment.recaptchaSiteKey, {
                action: 'contact_form_submit'
              });
              this.ngZone.run(() => resolve(token));
            } catch (error) {
              this.ngZone.run(() => reject(error));
            }
          });
        });

        this.contactForm.patchValue({ recaptchaToken: token });

        const formData = {
          ...this.contactForm.value,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent
        };

        console.log('🚀 Submitting form data:', formData);

        await addDoc(collection(this.firestore, 'contactMessages'), formData);

        this.ngZone.run(() => {
          console.log('✅ Form successfully submitted');
          this.submitSuccess = true;
          this.contactForm.reset();
        });
      } catch (error) {
        this.ngZone.run(() => {
          console.error('🔥 Form submission error:', error);
          this.submitError = true;
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

    return errors[Object.keys(control.errors)[0] as keyof typeof errors] || 'Invalid input';
  }

  private getPatternErrorMessage(controlName: string): string {
    return controlName === 'name' ? 'Please enter a valid name (letters only)'
         : controlName === 'email' ? 'Please enter a valid email address'
         : controlName === 'phone' ? 'Please enter a valid phone number'
         : 'Invalid format';
  }
}

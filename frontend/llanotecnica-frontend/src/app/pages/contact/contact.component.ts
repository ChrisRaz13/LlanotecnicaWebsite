import { Component, OnInit, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { trigger, transition, style, animate } from '@angular/animations';
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
export class ContactComponent implements OnInit {
  contactForm!: FormGroup;
  isSubmitting = false;
  submitSuccess = false;
  submitError = false;
  isFormTouched = false;
  recaptchaLoaded = false;
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
    private firestore: Firestore
  ) {
    this.initializeForm();
    this.initializeMap();
  }

  ngOnInit() {
    this.loadRecaptcha();
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardNavigation(event: KeyboardEvent) {
    if (event.key === 'Tab') {
      this.isFormTouched = true;
    }
  }

  private initializeForm() {
    this.contactForm = this.fb.group<ContactForm>({
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
      recaptchaToken: ['', Validators.required]
    } as any);

    this.contactForm.valueChanges.subscribe(() => {
      this.isFormTouched = true;
    });
  }

  private initializeMap() {
    const mapUrl = `https://www.google.com/maps/embed/v1/place?key=${environment.googleMapsApiKey}&q=Panama+City+Panama`;
    this.mapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(mapUrl);
  }

  private loadRecaptcha() {
    if (!this.recaptchaLoaded) {
      const script = document.createElement('script');
      script.src = 'https://www.google.com/recaptcha/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      script.onload = () => this.setupRecaptcha();
      document.body.appendChild(script);
      this.recaptchaLoaded = true;
    }
  }

  private setupRecaptcha() {
    grecaptcha.ready(() => {
      grecaptcha.render('recaptcha-container', {
        sitekey: environment.recaptchaSiteKey,
        callback: (token: string) => this.onRecaptchaResolved(token)
      });
    });
  }

  onRecaptchaResolved(token: string) {
    this.contactForm.patchValue({ recaptchaToken: token });
  }

  async onSubmit() {
    if (this.contactForm.valid) {
      this.isSubmitting = true;
      this.submitSuccess = false;
      this.submitError = false;

      try {
        const contactRef = collection(this.firestore, 'contactMessages');
        await addDoc(contactRef, {
          ...this.contactForm.value,
          timestamp: new Date().toISOString()
        });

        console.log('✅ Form successfully saved to Firestore');

        this.submitSuccess = true;
        this.contactForm.reset();
        grecaptcha.reset();

      } catch (error) {
        this.submitError = true;
        console.error('🔥 Firestore submission error:', error);
      } finally {
        this.isSubmitting = false;
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

    const errorKey = Object.keys(control.errors)[0];
    return errors[errorKey as keyof typeof errors] || 'Invalid input';
  }

  private getPatternErrorMessage(controlName: string): string {
    switch (controlName) {
      case 'name': return 'Please enter a valid name (letters only)';
      case 'email': return 'Please enter a valid email address';
      case 'phone': return 'Please enter a valid phone number';
      default: return 'Invalid format';
    }
  }
}

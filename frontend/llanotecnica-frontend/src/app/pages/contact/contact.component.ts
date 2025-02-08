import { Component, OnInit, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { trigger, transition, style, animate } from '@angular/animations';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';

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
  isDarkMode = false;
  isFormTouched = false;

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

  mapUrl: SafeResourceUrl | undefined;

  constructor(
    private fb: FormBuilder,
    private sanitizer: DomSanitizer,
    private firestore: Firestore // Inject Firestore for database access
  ) {
    this.initializeForm();
    this.initializeMap();
    this.checkDarkMode();
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
    const mapUrl = `https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API_KEY&q=Panama+City+Panama`;
    this.mapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(mapUrl);
  }

  private loadRecaptcha() {
    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js';
    document.body.appendChild(script);
    (window as any).onRecaptchaResolved = this.onRecaptchaResolved.bind(this);
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
        const contactRef = collection(this.firestore, 'contactMessages'); // Reference to Firestore collection
        await addDoc(contactRef, {
          ...this.contactForm.value,
          timestamp: new Date().toISOString()
        });

        console.log('Form successfully saved to Firestore');

        this.submitSuccess = true;
        this.contactForm.reset();
        (window as any).grecaptcha.reset();

      } catch (error) {
        this.submitError = true;
        console.error('Firestore submission error:', error);
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

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', String(this.isDarkMode));
  }

  private checkDarkMode() {
    const savedMode = localStorage.getItem('darkMode');
    this.isDarkMode = savedMode === 'true';
    if (this.isDarkMode) {
      document.body.classList.add('dark-mode');
    }
  }
}

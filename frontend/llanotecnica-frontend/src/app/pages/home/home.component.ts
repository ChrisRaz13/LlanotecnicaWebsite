import { Component, OnInit, Inject, PLATFORM_ID, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { animate, query, stagger, style, transition, trigger } from '@angular/animations';

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
}

interface FAQ {
  question: string;
  answer: string;
  videoUrl?: string;
  posterImage?: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.6s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('staggerFade', [
      transition(':enter', [
        query('.feature-card', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger(100, [
            animate('0.5s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class HomeComponent implements OnInit {
  @ViewChild('demoVideo') demoVideo?: ElementRef<HTMLVideoElement>;
  activeSection = 'hero';
  activeFaq: number | null = null;
  isVideoPlaying = false;

  readonly mixers: Product[] = [
    {
      name: 'Concrete Mixer MT-370',
      description: 'Compact mixer perfect for small to medium projects',
      features: [
        'Ideal for residential construction',
        'Easy to transport and maneuver',
        'Durable steel construction'
      ],
      specs: {
        capacity: '370 Liters',
        enginePower: '7-9 HP',
        weight: '750 kg'
      },
      image: '/assets/photos/MT-370.1.jpg'
    },
    {
      name: 'Concrete Mixer MT-480',
      description: 'Heavy-duty mixer engineered for large commercial projects',
      features: [
        'Perfect for commercial construction',
        'Maximum mixing efficiency',
        'Heavy-duty construction'
      ],
      specs: {
        capacity: '480 Liters',
        enginePower: '13+ HP',
        weight: '950 kg'
      },
      image: '/assets/photos/MT-480.jpg'
    }
  ];

  readonly features: Feature[] = [
    {
      title: 'Reinforced Drum Design',
      description: 'Heavy-duty steel construction with double-reinforced joints and wear-resistant coating.',
      icon: 'fa-solid fa-shield',
      highlight: '50% increased lifespan',
      category: 'design'
    },
    {
      title: 'Protected Gear Mechanism',
      description: 'Sealed gearbox system with automatic lubrication and debris protection.',
      icon: 'fa-solid fa-gears',
      highlight: '10,000+ operation hours',
      category: 'performance'
    },
    {
      title: 'Enhanced Safety Features',
      description: 'Multiple emergency stops, protective guards, and safety interlocks for operator protection.',
      icon: 'fa-solid fa-shield-halved',
      highlight: 'Triple safety system',
      category: 'safety'
    }
  ];

  readonly faqs: FAQ[] = [
    {
      question: 'How do I operate the MT-370 and MT-480 mixers?',
      answer: 'Watch our detailed demonstration video below:',
      videoUrl: '/assets/videos/instruction.mp4',
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
      answer: 'We provide a comprehensive 2-year warranty on all components, with extended warranty options available.'
    },
    {
      question: 'Are spare parts readily available?',
      answer: 'Yes, we maintain a complete inventory of spare parts with next-day delivery available for most components.'
    }
  ];

  readonly companyStats = {
    yearsExperience: '20+',
    mixersDelivered: '5000+',
    clientSatisfaction: '98%'
  };

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeScrollObserver();
    }
  }

  private initializeScrollObserver(): void {
    const observer = new IntersectionObserver(
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
      observer.observe(section);
    });
  }

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  toggleFaq(index: number): void {
    // If we're closing the FAQ that contains the video (index 0)
    if (index === 0 && this.activeFaq === 0) {
      // Using ViewChild reference to control video
      if (this.demoVideo?.nativeElement) {
        this.demoVideo.nativeElement.pause();
        this.demoVideo.nativeElement.currentTime = 0; // Reset to start
      }
    }
    this.activeFaq = this.activeFaq === index ? null : index;
  }

  playDemoVideo(): void {
    this.scrollToSection('video');
    setTimeout(() => {
      const video = document.querySelector('video');
      if (video) {
        video.play();
      }
    }, 1000);
  }
}

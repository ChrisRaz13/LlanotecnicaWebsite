import { Component, OnInit, AfterViewInit, ElementRef, QueryList, ViewChildren, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

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
  imports: [CommonModule, RouterLink],
  templateUrl: './about-us.component.html',
  styleUrls: ['./about-us.component.css']
})
export class AboutUsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChildren('stageElement') stageElements!: QueryList<ElementRef>;
  @ViewChild('finalCtaElement') finalCtaElement!: ElementRef;
  @ViewChild('videoElement') videoElement!: ElementRef;  // Reference for the video element

  finalCtaVisible: boolean = false;

  values: Value[] = [
    { icon: 'fas fa-lightbulb', title: 'Innovation', description: 'Pushing boundaries in mixing technology with cutting-edge solutions' },
    { icon: 'fas fa-shield-alt', title: 'Quality', description: 'Unwavering commitment to excellence in every machine we produce' },
    { icon: 'fas fa-leaf', title: 'Sustainability', description: 'Environmental responsibility through efficient, eco-friendly designs' },
    { icon: 'fas fa-handshake', title: 'Partnership', description: 'Building lasting relationships through trust and mutual success' }
  ];

  productionStages: ProductionStage[] = [
    {
      image: 'assets/photos/worker1.jpg',
      title: 'Precision Welding',
      description: 'Ensuring durability & strength in every frame.',
      visible: false
    },
    {
      image: 'assets/photos/worker2.jpg',
      title: 'Expert Assembly',
      description: 'Every part meticulously placed for peak performance.',
      visible: false
    },
    {
      image: 'assets/photos/worker3.jpg',
      title: 'Quality Assurance',
      description: 'Rigorous testing to meet industry standards.',
      visible: false
    },
    {
      image: 'assets/photos/worker4.jpg',
      title: 'Final Inspections',
      description: 'Ensuring perfection before shipping out.',
      visible: false
    },
    {
      image: 'assets/photos/worker5.jpg',
      title: 'Premium Finishing',
      description: 'High-quality coatings for a lasting impact.',
      visible: false
    },
    {
      image: 'assets/photos/worker6.jpg',
      title: 'Final Quality Check',
      description: 'A comprehensive final inspection ensuring every machine meets our rigorous standards.',
      visible: false
    }
  ];

  private observers: IntersectionObserver[] = [];
  private finalCtaObserver: IntersectionObserver | null = null;

  constructor() {}

  ngOnInit(): void {
    // Any initialization logic if needed
  }

  ngAfterViewInit(): void {
    // Mute the video element after the view has initialized
    if (this.videoElement) {
      this.videoElement.nativeElement.muted = true;
    }

    // Use requestAnimationFrame if available; otherwise, fall back to setTimeout.
    if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
      window.requestAnimationFrame(() => {
        this.setupIntersectionObservers();
        this.setupFinalCtaObserver();
      });
    } else {
      setTimeout(() => {
        this.setupIntersectionObservers();
        this.setupFinalCtaObserver();
      }, 0);
    }
  }

  private setupIntersectionObservers(): void {
    // Fallback if IntersectionObserver is not defined
    if (typeof IntersectionObserver === 'undefined') {
      // Make all production stages visible if the API is not available
      this.productionStages.forEach((stage, index) => {
        stage.visible = true;
      });
      return;
    }

    // Clean up existing observers
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];

    // Set up observers for production stages
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
        {
          threshold: 0.2,
          rootMargin: '0px 0px -100px 0px'
        }
      );
      observer.observe(element.nativeElement);
      this.observers.push(observer);
    });
  }

  private setupFinalCtaObserver(): void {
    // Fallback if IntersectionObserver is not defined
    if (typeof IntersectionObserver === 'undefined') {
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
        {
          threshold: 0.3,
          rootMargin: '0px 0px -100px 0px'
        }
      );
      this.finalCtaObserver.observe(this.finalCtaElement.nativeElement);
    }
  }

  ngOnDestroy(): void {
    // Clean up all observers
    this.observers.forEach(observer => observer.disconnect());
    this.finalCtaObserver?.disconnect();
  }
}

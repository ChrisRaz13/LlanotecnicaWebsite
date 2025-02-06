import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import * as AOS from 'aos';

interface Value {
  icon: string;
  title: string;
  description: string;
}

interface TeamMember {
  image: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-about-us',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './about-us.component.html',
  styleUrls: ['./about-us.component.css']
})
export class AboutUsComponent implements OnInit {
  values: Value[] = [
    { icon: 'fas fa-lightbulb', title: 'Innovation', description: 'Pushing boundaries in mixing technology with cutting-edge solutions' },
    { icon: 'fas fa-shield-alt', title: 'Quality', description: 'Unwavering commitment to excellence in every machine we produce' },
    { icon: 'fas fa-leaf', title: 'Sustainability', description: 'Environmental responsibility through efficient, eco-friendly designs' },
    { icon: 'fas fa-handshake', title: 'Partnership', description: 'Building lasting relationships through trust and mutual success' }
  ];

  teamGallery: TeamMember[] = [
    { image: 'assets/photos/worker1.jpg', title: 'Precision Welding', description: 'Ensuring durability & strength in every frame.' },
    { image: 'assets/photos/worker2.jpg', title: 'Expert Assembly', description: 'Every part meticulously placed for peak performance.' },
    { image: 'assets/photos/worker3.jpg', title: 'Quality Assurance', description: 'Rigorous testing to meet industry standards.' },
    { image: 'assets/photos/worker4.jpg', title: 'Final Inspections', description: 'Ensuring perfection before shipping out.' },
    { image: 'assets/photos/worker5.jpg', title: 'Premium Finishing', description: 'High-quality coatings for a lasting impact.' },
    { image: 'assets/photos/worker6.jpg', title: 'Efficient Delivery', description: 'On-time and safe transportation to customers.' }
  ];

  modalActive: boolean = false;
  selectedMember: TeamMember | null = null;

  ngOnInit(): void {
    AOS.init({
      duration: 1000,
      once: true,
      easing: 'ease-out-cubic',
      offset: 100
    });
  }

  openModal(index: number): void {
    this.selectedMember = this.teamGallery[index];
    this.modalActive = true;

    setTimeout(() => {
      const modalElement = document.querySelector('.modal-container');
      if (modalElement) {
        modalElement.classList.add('active');
      }
    }, 50);
  }

  closeModal(): void {
    const modalElement = document.querySelector('.modal-container');
    if (modalElement) {
      modalElement.classList.remove('active');

      setTimeout(() => {
        this.modalActive = false;
        this.selectedMember = null;
      }, 300);
    }
  }
}

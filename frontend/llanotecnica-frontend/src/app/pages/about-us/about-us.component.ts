
/* about-us.component.ts */
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import * as AOS from 'aos';

interface Value {
  icon: string;
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
    {
      icon: 'fas fa-lightbulb',
      title: 'Innovation',
      description: 'Pushing boundaries in mixing technology with cutting-edge solutions'
    },
    {
      icon: 'fas fa-shield-alt',
      title: 'Quality',
      description: 'Unwavering commitment to excellence in every machine we produce'
    },
    {
      icon: 'fas fa-leaf',
      title: 'Sustainability',
      description: 'Environmental responsibility through efficient, eco-friendly designs'
    },
    {
      icon: 'fas fa-handshake',
      title: 'Partnership',
      description: 'Building lasting relationships through trust and mutual success'
    }
  ];

  ngOnInit(): void {
    AOS.init({
      duration: 1000,
      once: true,
      easing: 'ease-out-cubic',
      offset: 100
    });
  }
}

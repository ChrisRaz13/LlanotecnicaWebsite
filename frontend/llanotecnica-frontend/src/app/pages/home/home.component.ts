import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  companyName = 'Llanotecnica';

  pillars = [
    {
      title: 'Quality',
      description: 'The quality of Llanotecnica products is guaranteed by constant development and innovation. We ensure rigorous monitoring of production processes and comprehensive support before and after sale.',
      icon: 'fas fa-award'
    },
    {
      title: 'Mission',
      description: 'We are innovators by definition, continuously seeking new industrial technologies. We prioritize operator safety, product quality, and environmental responsibility while delivering excellence to our customers.',
      icon: 'fas fa-bullseye'
    },
    {
      title: 'Vision',
      description: 'To be the leading company in our operating sectors globally, recognized for our ability to anticipate and adapt to market dynamics, with an unwavering focus on sustainability and excellence.',
      icon: 'fas fa-eye'
    }
  ];

  achievements = [
    {
      number: '21+',
      text: 'Years of Excellence'
    },
    {
      number: '1000+',
      text: 'Projects Completed'
    },
    {
      number: '50+',
      text: 'Countries Served'
    }
  ];
}

// product-section.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface EngineCompatibility {
  model: string;
  powerEngines: boolean[];
  hondaEngines: boolean[];
  electricEngines: boolean[];
}

@Component({
  selector: 'app-product-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-section.component.html',
  styleUrl: './product-section.component.css'
})
export class ProductSectionComponent {
  engineCompatibility: EngineCompatibility[] = [
    {
      model: 'MT-370',
      powerEngines: [true, true, false, true, false],
      hondaEngines: [true, false, false, true, false],
      electricEngines: [false, true]
    },
    {
      model: 'MT-480',
      powerEngines: [false, true, false, true, false],
      hondaEngines: [false, false, false, true, false],
      electricEngines: [false, true]
    }
  ];

  downloadManual(): void {
    console.log('Downloading manual...');
  }

  requestQuote(): void {
    console.log('Requesting quote...');
  }

  contactSales(): void {
    console.log('Contacting sales...');
  }
}

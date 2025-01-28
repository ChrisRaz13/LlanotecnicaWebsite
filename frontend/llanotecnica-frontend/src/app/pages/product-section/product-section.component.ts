import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

/** Engine Compatibility interface */
interface EngineCompatibility {
  model: string;
  powerEngines: boolean[];     // e.g. [7HP, 9HP, 13HP]
  hondaEngines: boolean[];     // e.g. [GX160, GX200, GX270, GX390]
  electricEngines: boolean[];  // e.g. [2-5HP, 3-5HP]
}

/** Product Specifications interface */
interface ProductSpecs {
  unitSpecs: {
    managementSystem: string;
    dumpType: string;
    dischargeHeight: string;
    drumType: string;
    wheelSize: string;
    chassisType: string;
    paintType: string;
    powerSupply: string;
    trailerType: string;
  };
  drumSpecs: {
    capacity: string;
    openingDiameter: string;
    depth: string;
  };
}

/** Engine Details interface */
interface EngineDetails {
  type: string;
  power: string[];
  features: string[];
}

@Component({
  selector: 'app-product-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-section.component.html',
  styleUrls: ['./product-section.component.css']
})
export class ProductSectionComponent {

  /** Flip card states for each product */
  isFlipped370: boolean = false;
  isFlipped480: boolean = false;

  /** Engine details panel states for each product */
  showEngineDetails370: boolean = false;
  showEngineDetails480: boolean = false;

  /** Product specs data for each mixer */
  productSpecs: { [key: string]: ProductSpecs } = {
    'MT-370': {
      unitSpecs: {
        managementSystem: 'V-BELT (A71)',
        dumpType: 'MANUAL',
        dischargeHeight: '22 IN (550MM)',
        drumType: 'STEEL',
        wheelSize: '145/70-R13',
        chassisType: 'TUBULAR, STABLE & REINFORCED IN T',
        paintType: 'QUICK DRYING',
        powerSupply: 'GASOLINE, DIESEL, ELECTRIC',
        trailerType: 'HITCH COUPLER, SAFETY SCREW'
      },
      drumSpecs: {
        capacity: '370L (13 CU.FT / 1 BAG)',
        openingDiameter: '18 IN (450MM)',
        depth: '32 IN (800MM)'
      }
    },
    'MT-480': {
      unitSpecs: {
        managementSystem: 'V-BELT (A69)',
        dumpType: 'MANUAL',
        dischargeHeight: '23 IN (580MM)',
        drumType: 'STEEL',
        wheelSize: '145/70-R13',
        chassisType: 'TUBULAR, STABLE & REINFORCED IN T',
        paintType: 'QUICK DRYING',
        powerSupply: 'GASOLINE, DIESEL, ELECTRIC',
        trailerType: 'HITCH COUPLER, SAFETY SCREW'
      },
      drumSpecs: {
        capacity: '420L (15 CU.FT / 2 BAGS)',
        openingDiameter: '19 IN (460MM)',
        depth: '41 IN (1020MM)'
      }
    }
  };

  /** Engine compatibility data for the chart */
  engineCompatibility: EngineCompatibility[] = [
    {
      model: 'MT-370',
      powerEngines: [true, true, false],        // 7HP, 9HP, (13HP = false)
      hondaEngines: [true, true, true, false],  // GX160, GX200, GX270, GX390
      electricEngines: [true, false]            // 2-5HP (true), 3-5HP (false)
    },
    {
      model: 'MT-480',
      powerEngines: [false, false, true],       // (7HP= false, 9HP= false), 13HP= true
      hondaEngines: [false, false, false, true],// GX160, GX200, GX270, GX390
      electricEngines: [false, true]            // 2-5HP (false), 3-5HP (true)
    }
  ];

  /** Engine details data for each product */
  engineDetails: { [key: string]: EngineDetails[] } = {
    'MT-370': [
      {
        type: '4Power Gasoline',
        power: ['7HP', '9HP'],
        features: ['Cost-effective', 'Easy maintenance']
      },
      {
        type: '4Power Diesel',
        power: ['7HP'],
        features: ['Fuel efficient', 'High torque']
      },
      {
        type: 'Honda',
        power: ['GX160', 'GX200', 'GX270'],
        features: ['Premium quality', 'Reliable']
      },
      {
        type: 'Electric',
        power: ['2HP - 5HP Range'],
        features: ['Zero emissions', 'Low maintenance']
      }
    ],
    'MT-480': [
      {
        type: '4Power Gasoline',
        power: ['13HP'],
        features: ['High power', 'Durable']
      },
      {
        type: '4Power Diesel',
        power: ['9HP'],
        features: ['Efficient', 'Long-lasting']
      },
      {
        type: 'Honda',
        power: ['GX390'],
        features: ['Premium quality', 'High performance']
      },
      {
        type: 'Electric',
        power: ['3HP - 5HP Range'],
        features: ['Clean energy', 'Low noise']
      }
    ]
  };

  /**
   * Toggles the card (front/back) for either MT-370 or MT-480.
   * Hides the engine details panel if flipping to the back.
   */
  flipCard(model: '370' | '480'): void {
    if (model === '370') {
      this.isFlipped370 = !this.isFlipped370;
      // If flipping to specs, close engine details
      if (this.isFlipped370) {
        this.showEngineDetails370 = false;
      }
    } else {
      this.isFlipped480 = !this.isFlipped480;
      // If flipping to specs, close engine details
      if (this.isFlipped480) {
        this.showEngineDetails480 = false;
      }
    }
  }

  /**
   * Toggles the engine details side panel for a given product
   * Also ensures the card's specs side isn't shown while the panel is open
   */
  toggleEngineDetails(model: '370' | '480'): void {
    if (model === '370') {
      this.showEngineDetails370 = !this.showEngineDetails370;
      if (this.showEngineDetails370) {
        // close the specs by flipping to front
        this.isFlipped370 = false;
      }
    } else {
      this.showEngineDetails480 = !this.showEngineDetails480;
      if (this.showEngineDetails480) {
        this.isFlipped480 = false;
      }
    }
  }

  /**
   * Returns the engine details array for the requested model.
   * e.g. getEngineDetails('370') => engineDetails['MT-370']
   */
  getEngineDetails(model: '370' | '480'): EngineDetails[] {
    return this.engineDetails[`MT-${model}`];
  }

  /**
   * Download Handlers for manuals / specs (PDF)
   */
  downloadManual(model: string): void {
    console.log(`Downloading manual for ${model}...`);
    const fileName = `${model.toLowerCase()}_manual.pdf`;
    this.triggerDownload(fileName);
  }

  downloadSpecs(model: string): void {
    console.log(`Downloading specifications for ${model}...`);
    const fileName = `${model.toLowerCase()}_specifications.pdf`;
    this.triggerDownload(fileName);
  }

  private triggerDownload(fileName: string): void {
    const link = document.createElement('a');
    link.setAttribute('target', '_blank');
    link.setAttribute('href', `/assets/documents/${fileName}`);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /** Contact & Quote Handlers */
  requestQuote(): void {
    console.log('Processing quote request...');
  }

  contactSales(): void {
    console.log('Initiating sales contact...');
  }
}

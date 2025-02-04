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

/** Comparison Spec interface */
interface ComparisonSpec {
  label: string;
  key: string;
  mt370Value: string;
  mt480Value: string;
  highlight?: 'MT-370' | 'MT-480' | null;
}

/** Engine Category interface */
interface EngineCategory {
  title: string;
  options: EngineOption[];
}

/** Engine Option interface */
interface EngineOption {
  name: string;
  power: string;
  type: string;
  mt370Compatible: boolean;
  mt480Compatible: boolean;
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
  // Active tab for comparison section
  activeTab: 'specs' | 'engines' = 'specs';

  /** Product specs data */
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

  /** Engine categories data */
  engineCategories: EngineCategory[] = [
    {
      title: '4Power Gasoline Engines',
      options: [
        {
          name: '4Power 7HP',
          power: '7 Horsepower',
          type: 'gas',
          mt370Compatible: true,
          mt480Compatible: false,
          features: ['Cost-effective', 'Easy maintenance', 'Optimal efficiency']
        },
        {
          name: '4Power 9HP',
          power: '9 Horsepower',
          type: 'gas',
          mt370Compatible: true,
          mt480Compatible: false,
          features: ['Enhanced power', 'Reliable performance', 'Versatile usage']
        },
        {
          name: '4Power 13HP',
          power: '13 Horsepower',
          type: 'gas',
          mt370Compatible: false,
          mt480Compatible: true,
          features: ['High power', 'Heavy-duty performance', 'Maximum output']
        }
      ]
    },
    {
      title: '4Power Diesel Engines',
      options: [
        {
          name: '4Power Diesel 7HP',
          power: '7 Horsepower',
          type: 'diesel',
          mt370Compatible: true,
          mt480Compatible: false,
          features: ['Fuel efficient', 'High torque', 'Durable design']
        },
        {
          name: '4Power Diesel 9HP',
          power: '9 Horsepower',
          type: 'diesel',
          mt370Compatible: false,
          mt480Compatible: true,
          features: ['Enhanced efficiency', 'Maximum torque', 'Long-lasting']
        }
      ]
    },
    {
      title: 'Honda Engines',
      options: [
        {
          name: 'Honda GX160',
          power: '5.5HP',
          type: 'honda',
          mt370Compatible: true,
          mt480Compatible: false,
          features: ['Premium quality', 'Reliable', 'Low maintenance']
        },
        {
          name: 'Honda GX200',
          power: '6.5HP',
          type: 'honda',
          mt370Compatible: true,
          mt480Compatible: false,
          features: ['Premium quality', 'Enhanced power', 'Efficient operation']
        },
        {
          name: 'Honda GX270',
          power: '9HP',
          type: 'honda',
          mt370Compatible: true,
          mt480Compatible: false,
          features: ['Premium quality', 'High performance', 'Professional grade']
        },
        {
          name: 'Honda GX390',
          power: '13HP',
          type: 'honda',
          mt370Compatible: false,
          mt480Compatible: true,
          features: ['Premium quality', 'Maximum power', 'Industrial strength']
        }
      ]
    },
    {
      title: 'Electric Motors',
      options: [
        {
          name: 'EcoDrive Electric',
          power: '2HP-5HP (1725 RPM)',
          type: 'electric',
          mt370Compatible: true,
          mt480Compatible: false,
          features: ['Zero emissions', 'Low maintenance', 'Quiet operation']
        },
        {
          name: 'EcoDrive Plus',
          power: '3HP-5HP (1725 RPM)',
          type: 'electric',
          mt370Compatible: false,
          mt480Compatible: true,
          features: ['Clean energy', 'Enhanced power', 'Silent performance']
        }
      ]
    }
  ];

  /** Get drum specifications for comparison */
  getDrumSpecs(): ComparisonSpec[] {
    return [
      {
        label: 'Drum Capacity',
        key: 'capacity',
        mt370Value: this.productSpecs['MT-370'].drumSpecs.capacity,
        mt480Value: this.productSpecs['MT-480'].drumSpecs.capacity,
        highlight: 'MT-480'
      },
      {
        label: 'Opening Diameter',
        key: 'openingDiameter',
        mt370Value: this.productSpecs['MT-370'].drumSpecs.openingDiameter,
        mt480Value: this.productSpecs['MT-480'].drumSpecs.openingDiameter,
        highlight: 'MT-480'
      },
      {
        label: 'Drum Depth',
        key: 'depth',
        mt370Value: this.productSpecs['MT-370'].drumSpecs.depth,
        mt480Value: this.productSpecs['MT-480'].drumSpecs.depth,
        highlight: 'MT-480'
      }
    ];
  }

  /** Get unit specifications for comparison */
  getUnitSpecs(): ComparisonSpec[] {
    return [
      {
        label: 'Management System',
        key: 'managementSystem',
        mt370Value: this.productSpecs['MT-370'].unitSpecs.managementSystem,
        mt480Value: this.productSpecs['MT-480'].unitSpecs.managementSystem
      },
      {
        label: 'Discharge Height',
        key: 'dischargeHeight',
        mt370Value: this.productSpecs['MT-370'].unitSpecs.dischargeHeight,
        mt480Value: this.productSpecs['MT-480'].unitSpecs.dischargeHeight,
        highlight: 'MT-480'
      },
      {
        label: 'Wheel Size',
        key: 'wheelSize',
        mt370Value: this.productSpecs['MT-370'].unitSpecs.wheelSize,
        mt480Value: this.productSpecs['MT-480'].unitSpecs.wheelSize
      }
    ];
  }

  /** Set active comparison tab */
  setActiveTab(tab: 'specs' | 'engines'): void {
    this.activeTab = tab;
  }

  /** Request quote for specific model */
  requestQuote(model: string): void {
    console.log(`Requesting quote for ${model}`);
    // Implement quote request logic
  }

  /** Contact sales team */
  contactSales(): void {
    console.log('Contacting sales team');
    // Implement sales contact logic
  }

  /** Download product manual */
  downloadManual(model: string, language: 'en' | 'es'): void {
    const fileName = `${model.toLowerCase()}_manual_${language}.pdf`;
    this.triggerDownload(fileName);
  }

  /** Trigger file download */
  private triggerDownload(fileName: string): void {
    const link = document.createElement('a');
    link.setAttribute('target', '_blank');
    link.setAttribute('href', `/assets/documents/${fileName}`);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

interface EngineCompatibility {
  model: string;
  powerEngines: boolean[];
  hondaEngines: boolean[];
  electricEngines: boolean[];
}

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

interface EngineDetails {
  type: string;
  power: string[];
  features: string[];
}

interface ComparisonSpec {
  label: string;
  key: string;
  mt370Value: string;
  mt480Value: string;
  highlight?: 'MT-370' | 'MT-480' | null;
}

interface EngineCategory {
  title: string;
  options: EngineOption[];
}

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
  imports: [CommonModule, RouterModule],
  templateUrl: './product-section.component.html',
  styleUrls: ['./product-section.component.css']
})
export class ProductSectionComponent {
  activeTab: 'specs' | 'engines' = 'specs';

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

  engineCategories: EngineCategory[] = [
    {
      title: '4Power Gasoline Engines',
      options: [
        {
          name: '4Power Gasoline',
          power: '7 HP',
          type: 'gas',
          mt370Compatible: true,
          mt480Compatible: false,
          features: ['Cost-effective', 'Easy maintenance', 'Optimal efficiency']
        },
        {
          name: '4Power Gasoline',
          power: '9 HP',
          type: 'gas',
          mt370Compatible: true,
          mt480Compatible: false,
          features: ['Enhanced power', 'Reliable performance', 'Versatile usage']
        },
        {
          name: '4Power Gasoline',
          power: '13 HP',
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
          name: '4Power Diesel',
          power: '7 HP',
          type: 'diesel',
          mt370Compatible: true,
          mt480Compatible: false,
          features: ['Fuel efficient', 'High torque', 'Durable design']
        },
        {
          name: '4Power Diesel',
          power: '9 HP',
          type: 'diesel',
          mt370Compatible: false,
          mt480Compatible: true,
          features: ['Enhanced efficiency', 'Maximum torque', 'Long-lasting']
        }
      ]
    },
    {
      title: 'Honda Engines (Gasoline)',
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
      title: '4Power Electric Motors',
      options: [
        {
          name: '4Power Electric',
          power: '2HP-5HP (1725 RPM)',
          type: 'electric',
          mt370Compatible: true,
          mt480Compatible: false,
          features: ['Zero emissions', 'Low maintenance', 'Quiet operation']
        },
        {
          name: '4Power Electric Plus',
          power: '3HP-5HP (1725 RPM)',
          type: 'electric',
          mt370Compatible: false,
          mt480Compatible: true,
          features: ['Clean energy', 'Enhanced power', 'Silent performance']
        }
      ]
    }
  ];

  constructor(private router: Router) {}

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

  setActiveTab(tab: 'specs' | 'engines'): void {
    this.activeTab = tab;
  }

  requestQuote(model: string): void {
    this.router.navigate(['/contact']);
  }

  contactSales(): void {}

  downloadManual(model: string, language: 'en' | 'es'): void {
    const fileName = language === 'en' ? 'Manual-Eng.pdf' : 'Manual-Esp.pdf';
    this.triggerDownload(fileName);
  }

  private triggerDownload(fileName: string): void {
    const link = document.createElement('a');
    link.setAttribute('target', '_blank');
    link.setAttribute('href', `assets/photos/${fileName}`);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

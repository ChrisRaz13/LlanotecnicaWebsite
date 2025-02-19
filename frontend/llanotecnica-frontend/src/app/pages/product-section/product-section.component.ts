import { Component, signal, computed, ChangeDetectionStrategy, ViewChild, ElementRef, AfterViewInit, TemplateRef, TrackByFunction } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

// Interfaces
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

interface ProductImage {
  model: string;
  src: string;
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

interface EngineSpecification {
  type: string;
  specs: {
    bore_stroke: string;
    displacement: string;
    compression_ratio: string;
    max_power: string;
    max_torque: string;
    start_model: string;
    ignition_system: string;
    fuel_consumption?: string;
    oil_capacity: string;
    fuel_tank?: string;
    dimensions: string;
    dry_weight: string;
    additional_features?: string[];
  };
}

@Component({
  selector: 'app-product-section',
  standalone: true,
  imports: [CommonModule, RouterModule, MatDialogModule, MatButtonModule],
  templateUrl: './product-section.component.html',
  styleUrls: ['./product-section.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductSectionComponent implements AfterViewInit {
  activeTab = signal<'specs' | 'engines'>('specs');
  selectedEngine = signal<EngineSpecification | null>(null);
  showEngineDialog = signal<boolean>(false);

  readonly productSpecs = signal<{ [key: string]: ProductSpecs }>({
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
  });

  readonly engineSpecs = signal<{ [key: string]: EngineSpecification }>({
    'GX160H2': {
      type: 'honda',
      specs: {
        bore_stroke: '68 x 45 mm',
        displacement: '163 cm³',
        compression_ratio: '8.5:1',
        max_power: '5.5 hp @ 3600 rpm',
        max_torque: '10.3 Nm @ 2500 rpm',
        start_model: 'Manual',
        ignition_system: 'Transistorized coil',
        fuel_consumption: '1.4 L/h @ 3600 rpm',
        oil_capacity: '0.6 Liter',
        fuel_tank: '3.1 L',
        dimensions: '314 x 362 x 346 mm',
        dry_weight: '15.1 kg',
        additional_features: [
          'Single cylinder 4 stroke',
          'Inclined cylinder 25°',
          'Steel jacket',
          'OHV Gasoline engine type'
        ]
      }
    },
    'GX270H2': {
      type: 'honda',
      specs: {
        bore_stroke: '77 x 58 mm',
        displacement: '270 cm³',
        compression_ratio: '8.5:1',
        max_power: '9.0 hp @ 3600 rpm',
        max_torque: '19.1 Nm @ 2500 rpm',
        start_model: 'Manual (Electrical start option)',
        ignition_system: 'Transistorized coil',
        fuel_consumption: '2.4 L/h @ 3600 rpm',
        oil_capacity: '1.1 Liter',
        fuel_tank: '5.3 L',
        dimensions: '381 x 428 x 422 mm',
        dry_weight: '25.8 kg',
        additional_features: [
          'Single cylinder 4 stroke',
          'Inclined cylinder 25°',
          'Steel jacket',
          'OHV Gasoline engine type'
        ]
      }
    },
    'GX390H2': {
      type: 'honda',
      specs: {
        bore_stroke: '88 x 64 mm',
        displacement: '389 cm³',
        compression_ratio: '8.5:1',
        max_power: '13.0 hp @ 3600 rpm',
        max_torque: '26.5 Nm @ 2500 rpm',
        start_model: 'Manual/Electric start',
        ignition_system: 'Transistorized coil',
        fuel_consumption: '3.5 L/h @ 3600 rpm',
        oil_capacity: '1.1 Liter',
        fuel_tank: '6.1 L',
        dimensions: '406 x 460 x 448 mm',
        dry_weight: '31.7 kg',
        additional_features: [
          'Single cylinder 4 stroke',
          'Inclined cylinder 25°',
          'Steel jacket',
          'OHV Gasoline engine type'
        ]
      }
    },
    '4Power-D7': {
      type: 'diesel',
      specs: {
        bore_stroke: '78 x 62 mm',
        displacement: '296 cc',
        compression_ratio: 'Direct Injection',
        max_power: '7.0 hp @ 3600 rpm',
        max_torque: '11.6 N.m @ 2880 rpm',
        start_model: 'Manual / Electric start',
        ignition_system: 'Direct Injection',
        oil_capacity: '1.1 Liter',
        dimensions: '485 x 430 x 525 mm',
        dry_weight: '33 kg',
        additional_features: [
          'Single-cylinder, vertical',
          '4-stroke, air-cooled',
          'Direct injection system',
          'Left rotation output axis'
        ]
      }
    },
    '4Power-D9': {
      type: 'diesel',
      specs: {
        bore_stroke: '86 x 72 mm',
        displacement: '418 cc',
        compression_ratio: 'Direct Injection',
        max_power: '9.0 hp @ 3600 rpm',
        max_torque: '18.7 N.m @ 2880 rpm',
        start_model: 'Manual / Electric start',
        ignition_system: 'Direct Injection',
        oil_capacity: '1.65 Liter',
        dimensions: '525 x 515 x 580 mm',
        dry_weight: '44 kg',
        additional_features: [
          'Single-cylinder, vertical',
          '4-stroke, air-cooled',
          'Direct injection system',
          'Left rotation output axis'
        ]
      }
    },
    '170F': {
      type: 'gas',
      specs: {
        bore_stroke: '70 x 55 mm',
        displacement: '212 cc',
        compression_ratio: '8.5:1',
        max_power: '7.0 HP @ 3600 rpm',
        max_torque: '13.5 Nm @ 2500 rpm',
        start_model: 'Electric',
        ignition_system: 'Non-contact transistorized ignition (TCI)',
        fuel_consumption: '395 g/kWh',
        oil_capacity: '0.6 L',
        fuel_tank: '3.6 L',
        dimensions: '415 x 360 x 360 mm',
        dry_weight: '17 kg',
        additional_features: [
          '4-stroke 25° single cylinder',
          'Air-cooled system',
          'Semi-dry type air cleaner',
          'Enhanced fuel efficiency'
        ]
      }
    },
    '177F': {
      type: 'gas',
      specs: {
        bore_stroke: '70 x 58 mm',
        displacement: '270 cc',
        compression_ratio: '8.2:1',
        max_power: '9.0 HP @ 3600 rpm',
        max_torque: '15.5 Nm @ 2500 rpm',
        start_model: 'Recoil and hand-operated',
        ignition_system: 'Non-contact transistorized ignition (TCI)',
        fuel_consumption: '374 g/kWh',
        oil_capacity: '1.1 L',
        fuel_tank: '6.0 L',
        dimensions: '465 x 435 x 480 mm',
        dry_weight: '26 kg',
        additional_features: [
          '4-stroke 25° single cylinder',
          'Air-cooled system',
          'Semi-dry, oil bath type air cleaner',
          'Professional grade performance'
        ]
      }
    },
    '188F': {
      type: 'gas',
      specs: {
        bore_stroke: '88 x 64 mm',
        displacement: '389 cc',
        compression_ratio: '8.0:1',
        max_power: '13.0 HP @ 3600 rpm',
        max_torque: '23.0 Nm @ 2500 rpm',
        start_model: 'Recoil and hand-operated',
        ignition_system: 'Non-contact transistorized ignition (TCI)',
        fuel_consumption: '374 g/kWh',
        oil_capacity: '1.1 L',
        fuel_tank: '6.5 L',
        dimensions: '465 x 435 x 500 mm',
        dry_weight: '31 kg',
        additional_features: [
          '4-stroke 25° single cylinder',
          'Air-cooled system',
          'Semi-dry, oil bath type air cleaner',
          'Heavy-duty industrial performance'
        ]
      }
    }
  });

  readonly engineCategories = signal<EngineCategory[]>([
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
  ]);

  @ViewChild('imageContainer') imageContainer!: ElementRef;
  @ViewChild('engineDialog') engineDialog!: TemplateRef<any>;

  readonly drumSpecs = computed(() => this.getDrumSpecs());
  readonly unitSpecs = computed(() => this.getUnitSpecs());

  readonly productImages = signal<ProductImage[]>([
    {
      model: 'MT-370',
      src: 'assets/photos/MT-370.3.png'
    },
    {
      model: 'MT-480',
      src: 'assets/photos/MT-480.1.png'
    }
  ]);

  trackByFn: TrackByFunction<ProductImage> = (index, product) => product.model;
  trackByEngine: TrackByFunction<EngineOption> = (index, engine) => engine.name;
  trackByCategory: TrackByFunction<EngineCategory> = (index, category) => category.title;

  constructor(
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngAfterViewInit() {
    // Check if window is defined (to avoid errors during SSR)
    if (typeof window !== 'undefined') {
      this.setupLazyLoading();
    }
  }

  private setupLazyLoading(): void {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      const options = {
        root: null,
        rootMargin: '50px',
        threshold: 0.1
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            img.src = img.dataset['src'] || '';
            observer.unobserve(img);
          }
        });
      }, options);

      const images = this.imageContainer?.nativeElement.querySelectorAll('img[data-src]');
      images?.forEach((img: Element) => observer.observe(img));
    }
  }

  getDrumSpecs(): ComparisonSpec[] {
    const specs = this.productSpecs();
    return [
      {
        label: 'Drum Capacity',
        key: 'capacity',
        mt370Value: specs['MT-370'].drumSpecs.capacity,
        mt480Value: specs['MT-480'].drumSpecs.capacity,
        highlight: 'MT-480'
      },
      {
        label: 'Opening Diameter',
        key: 'openingDiameter',
        mt370Value: specs['MT-370'].drumSpecs.openingDiameter,
        mt480Value: specs['MT-480'].drumSpecs.openingDiameter,
        highlight: 'MT-480'
      },
      {
        label: 'Drum Depth',
        key: 'depth',
        mt370Value: specs['MT-370'].drumSpecs.depth,
        mt480Value: specs['MT-480'].drumSpecs.depth,
        highlight: 'MT-480'
      }
    ];
  }

  getUnitSpecs(): ComparisonSpec[] {
    const specs = this.productSpecs();
    return [
      {
        label: 'Management System',
        key: 'managementSystem',
        mt370Value: specs['MT-370'].unitSpecs.managementSystem,
        mt480Value: specs['MT-480'].unitSpecs.managementSystem
      },
      {
        label: 'Discharge Height',
        key: 'dischargeHeight',
        mt370Value: specs['MT-370'].unitSpecs.dischargeHeight,
        mt480Value: specs['MT-480'].unitSpecs.dischargeHeight,
        highlight: 'MT-480'
      },
      {
        label: 'Wheel Size',
        key: 'wheelSize',
        mt370Value: specs['MT-370'].unitSpecs.wheelSize,
        mt480Value: specs['MT-480'].unitSpecs.wheelSize
      }
    ];
  }

  setActiveTab(tab: 'specs' | 'engines'): void {
    this.activeTab.set(tab);
  }

  openEngineSpecs(engineInput: EngineOption | string): void {
    let spec: EngineSpecification | null = null;

    if (typeof engineInput === 'string') {
      // If a string ID is passed, get specs directly
      const specs = this.engineSpecs();
      spec = specs[engineInput] || null;
    } else {
      // If an EngineOption object is passed, use the existing mapping logic
      spec = this.getEngineSpecForOption(engineInput);
    }

    if (spec) {
      this.selectedEngine.set(spec);
      this.showEngineDialog.set(true);
    } else {
      console.error(`No specification found for engine: ${typeof engineInput === 'string' ? engineInput : engineInput.name}`);
    }
  }

  closeEngineSpecs(): void {
    this.showEngineDialog.set(false);
    this.selectedEngine.set(null);
  }

  requestQuote(model: string): void {
    this.router.navigate(['/contact'], {
      queryParams: {
        product: model,
        type: 'quote'
      }
    });
  }

  downloadManual(model: string, language: 'en' | 'es'): void {
    const fileName = language === 'en' ? 'Manual-Eng.pdf' : 'Manual-Esp.pdf';
    const link = document.createElement('a');
    link.href = `assets/manuals/${model.toLowerCase()}/${fileName}`;
    link.download = `${model}-${fileName}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  getEngineTypeIcon(type: string): string {
    switch (type.toLowerCase()) {
      case 'honda':
        return 'honda';
      case 'gas':
        return 'gas';
      case 'diesel':
        return 'diesel';
      case 'electric':
        return 'electric';
      default:
        return 'engine-icon';
    }
  }

  getEngineSpecificationsByType(type: string): EngineSpecification[] {
    return Object.entries(this.engineSpecs())
      .filter(([_, spec]) => spec.type.toLowerCase() === type.toLowerCase())
      .map(([_, spec]) => spec);
  }

  private getEngineSpecForOption(engine: EngineOption): EngineSpecification | null {
    const engineKey = this.mapEngineOptionToSpecKey(engine);
    const specs = this.engineSpecs();
    return specs[engineKey] || null;
  }

  private mapEngineOptionToSpecKey(engine: EngineOption): string {
    switch (engine.type.toLowerCase()) {
      case 'honda':
        // Honda engines follow GX naming convention
        return `GX${engine.power.replace('HP', '').trim()}H2`;
      case 'diesel':
        // Diesel engines follow 4Power-D naming convention
        return `4Power-D${engine.power.replace(' HP', '')}`;
      case 'gas':
        // 4Power Gasoline engines follow numerical naming
        const power = parseInt(engine.power);
        if (power === 7) return '170F';
        if (power === 9) return '177F';
        if (power === 13) return '188F';
        break;
      case 'electric':
        // Electric engines follow power rating
        const hp = parseInt(engine.power);
        return `electric-${hp}hp`;
    }
    return '';
  }

  // Optional: Add helper method to get quick specs for showcase
  getQuickSpecs(engineId: string): { displacement?: string; torque?: string; weight: string } {
    const specs = this.engineSpecs();
    const engine = specs[engineId];
    if (!engine) return { weight: 'N/A' };

    return {
      displacement: engine.specs.displacement,
      torque: engine.specs.max_torque,
      weight: engine.specs.dry_weight
    };
  }

  getCompatibleEngines(model: string): EngineOption[] {
    return this.engineCategories()
      .flatMap(category => category.options)
      .filter(engine =>
        model === 'MT-370' ? engine.mt370Compatible : engine.mt480Compatible
      );
  }

  formatPowerOutput(power: string): string {
    return power.includes('HP') ? power : `${power} HP`;
  }

  handleKeyboardEvent(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.showEngineDialog()) {
      this.closeEngineSpecs();
    }
  }

  updateImageSrc(img: HTMLImageElement): void {
    if (img.dataset['src']) {
      img.src = img.dataset['src'];
      delete img.dataset['src'];
    }
  }
}

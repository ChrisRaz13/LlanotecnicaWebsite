import { Component, signal, computed, ChangeDetectionStrategy, ViewChild, ElementRef, AfterViewInit, TemplateRef, TrackByFunction, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatDialog, MatDialogModule, MatDialogConfig } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SeoService } from '../../services/seo.service';

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
  dimensions: {
    length: string;
    width: string;
    height: string;
    weight: string;
  };
}

interface ProductImage {
  model: string;
  src: string;
  colors?: ProductColor[];
}

interface ProductColor {
  name: string;
  value: string;
  imageSrc: string;
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

interface ManualDialogData {
  productModel: string;
}

type EngineFilterType = 'all' | 'gas' | 'diesel' | 'electric';

@Component({
  selector: 'app-product-section',
  standalone: true,
  imports: [CommonModule, RouterModule, MatDialogModule, MatButtonModule, TranslateModule],
  templateUrl: './product-section.component.html',
  styleUrls: ['./product-section.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductSectionComponent implements OnInit, AfterViewInit {
  activeTab = signal<'specs' | 'engines'>('specs');
  selectedEngine = signal<EngineSpecification | null>(null);
  showEngineDialog = signal<boolean>(false);
  activeEngineFilter = signal<EngineFilterType>('all');
  // Add this property to store the current product model
  currentProductModel: string = '';

  // Color selection signals
  selectedColors = signal<{ [key: string]: string }>({
    'MT-370': 'GREEN',
    'MT-480': 'GREEN'
  });

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
      },
      dimensions: {
        length: '83 IN (2100MM)',
        width: '47 IN (1190MM)',
        height: '58 IN (1460MM)',
        weight: '276 KG (608 LB)'
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
      },
      dimensions: {
        length: '83 IN (2100MM)',
        width: '47 IN (1190MM)',
        height: '65 IN (1640MM)',
        weight: '290 KG (639 LB)'
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
    },
    'electric-2hp': {
      type: 'electric',
      specs: {
        bore_stroke: 'N/A',
        displacement: 'N/A',
        compression_ratio: 'N/A',
        max_power: '2.0 HP @ 1725 rpm',
        max_torque: '8.3 Nm continuous',
        start_model: 'Electric switch',
        ignition_system: 'Electric motor',
        oil_capacity: 'N/A',
        dimensions: '320 x 210 x 210 mm',
        dry_weight: '15 kg',
        additional_features: [
          'Single phase operation',
          'Thermal protection',
          'IP54 protection rating',
          'Maintenance-free design'
        ]
      }
    },
    'electric-5hp': {
      type: 'electric',
      specs: {
        bore_stroke: 'N/A',
        displacement: 'N/A',
        compression_ratio: 'N/A',
        max_power: '5.0 HP @ 1725 rpm',
        max_torque: '20.5 Nm continuous',
        start_model: 'Electric switch with soft start',
        ignition_system: 'Electric motor',
        oil_capacity: 'N/A',
        dimensions: '380 x 240 x 240 mm',
        dry_weight: '28 kg',
        additional_features: [
          'Three phase operation',
          'Enhanced thermal protection',
          'IP55 protection rating',
          'Industrial grade efficiency'
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
  @ViewChild('manualDialog') manualDialog!: TemplateRef<any>;

  readonly drumSpecs = computed(() => this.getDrumSpecs());
  readonly unitSpecs = computed(() => this.getUnitSpecs());
  readonly filteredEngineCount = computed(() => this.getFilteredEngineCount());

  readonly productImages = signal<ProductImage[]>([
    {
      model: 'MT-370',
      src: 'assets/photos/MT-370-optimized.jpg'
    },
    {
      model: 'MT-480',
      src: 'assets/photos/MT-480-optimized.jpg'
    }
  ]);

  readonly productFeatures = signal<{ [key: string]: string[] }>({
    'MT-370': [
      'Drum with 360° rotation for flexible loading and unloading',
      'Optimized drum blade vanes for best mixing performance',
      'Tubular T-reinforced chassis for maximum strength',
      'V-belt transmission to minimize vibration',
      'Cast iron-toothed parts for long service life',
      'Pedal control for easy position changes by a single operator',
      'All cast parts are easily replaceable'
    ],
    'MT-480': [
      'Drum with 360° rotation for flexible loading and unloading',
      'Optimized drum blade vanes for best mixing performance',
      'Tubular T-reinforced chassis for maximum strength',
      'V-belt transmission to minimize vibration',
      'Cast iron-toothed parts for long service life',
      'Pedal control for easy position changes by a single operator',
      'All cast parts are easily replaceable',
      'Larger capacity ideal for high-volume projects'
    ]
  });

  trackByFn: TrackByFunction<ProductImage> = (index, product) => product.model;
  trackByEngine: TrackByFunction<EngineOption> = (index, engine) => engine.name;
  trackByCategory: TrackByFunction<EngineCategory> = (index, category) => category.title;
  trackByFeature: TrackByFunction<string> = (index, feature) => index;

  // Add this property to track active tabs for each product
  activeProductTabs: { [key: string]: string } = {};

  constructor(
    private router: Router,
    public dialog: MatDialog,
    private seoService: SeoService,
    private translate: TranslateService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.setupSEO();

      // Subscribe to language changes
      this.translate.onLangChange.subscribe(() => {
        this.setupSEO();
      });
    }
  }

  private setupSEO(): void {
    const currentLang = this.translate.currentLang || 'en';
    const currentPath = this.router.url.split('?')[0];

    // Determine canonical URL
    let canonicalPath = '/en/products';
    if (currentPath.includes('/es/') || currentPath.includes('/productos')) {
      canonicalPath = '/es/productos';
    }

    this.translate.get(['PRODUCTS_PAGE.SEO.TITLE', 'PRODUCTS_PAGE.SEO.DESCRIPTION', 'PRODUCTS_PAGE.SEO.KEYWORDS']).subscribe((translations: any) => {
      const title = translations['PRODUCTS_PAGE.SEO.TITLE'] || 'Concrete Mixers MT-370 & MT-480 | Llanotecnica Products';
      const description = translations['PRODUCTS_PAGE.SEO.DESCRIPTION'] || 'Explore our professional concrete mixers: MT-370 (370L) for residential projects and MT-480 (480L) for commercial construction. Compare specs, features, and engines.';
      const keywords = translations['PRODUCTS_PAGE.SEO.KEYWORDS'] || 'MT-370, MT-480, concrete mixer, specifications, Honda engines, diesel engines, electric motors';

      this.seoService.updateMetaTags({
        title: title,
        description: description,
        keywords: keywords,
        image: 'https://www.llanotecnica.com/assets/photos/MT-370-optimized.jpg',
        url: canonicalPath,
        type: 'product'
      });

      // Add hreflang tags
      this.seoService.addHreflangTags([
        { lang: 'en', url: 'https://www.llanotecnica.com/en/products' },
        { lang: 'es', url: 'https://www.llanotecnica.com/es/productos' },
        { lang: 'x-default', url: 'https://www.llanotecnica.com/en/products' }
      ]);

      // Add structured data for products
      this.addProductStructuredData();
    });
  }

  private addProductStructuredData(): void {
    const specs = this.productSpecs();

    const mt370Data = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      'name': 'MT-370 Concrete Mixer',
      'model': 'MT-370',
      'description': 'Professional 370L capacity concrete mixer perfect for medium-duty construction projects. Features 360° drum rotation, reinforced chassis, and single-operator control.',
      'category': 'Construction Equipment',
      'brand': {
        '@type': 'Brand',
        'name': 'Llanotecnica'
      },
      'manufacturer': {
        '@type': 'Organization',
        'name': 'Llanotecnica'
      },
      'image': [
        'https://www.llanotecnica.com/assets/photos/MT-370-optimized.jpg',
        'https://www.llanotecnica.com/assets/photos/MT-370-GREEN-optimized.jpg',
        'https://www.llanotecnica.com/assets/photos/MT-370-YELLOW-optimized.jpg',
        'https://www.llanotecnica.com/assets/photos/MT-370-BLUE-optimized.jpg'
      ],
      'offers': {
        '@type': 'Offer',
        'availability': 'https://schema.org/InStock',
        'priceCurrency': 'USD',
        'seller': {
          '@type': 'Organization',
          'name': 'Llanotecnica'
        },
        'url': 'https://www.llanotecnica.com/en/products'
      },
      'additionalProperty': [
        {
          '@type': 'PropertyValue',
          'name': 'Drum Capacity',
          'value': specs['MT-370'].drumSpecs.capacity
        },
        {
          '@type': 'PropertyValue',
          'name': 'Opening Diameter',
          'value': specs['MT-370'].drumSpecs.openingDiameter
        },
        {
          '@type': 'PropertyValue',
          'name': 'Drum Depth',
          'value': specs['MT-370'].drumSpecs.depth
        },
        {
          '@type': 'PropertyValue',
          'name': 'Discharge Height',
          'value': specs['MT-370'].unitSpecs.dischargeHeight
        },
        {
          '@type': 'PropertyValue',
          'name': 'Length',
          'value': specs['MT-370'].dimensions.length
        },
        {
          '@type': 'PropertyValue',
          'name': 'Width',
          'value': specs['MT-370'].dimensions.width
        },
        {
          '@type': 'PropertyValue',
          'name': 'Height',
          'value': specs['MT-370'].dimensions.height
        },
        {
          '@type': 'PropertyValue',
          'name': 'Weight',
          'value': specs['MT-370'].dimensions.weight
        },
        {
          '@type': 'PropertyValue',
          'name': 'Power Supply Options',
          'value': specs['MT-370'].unitSpecs.powerSupply
        }
      ]
    };

    const mt480Data = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      'name': 'MT-480 Concrete Mixer',
      'model': 'MT-480',
      'description': 'Heavy-duty 480L capacity concrete mixer designed for large commercial construction projects. Built for continuous operation with enhanced durability components.',
      'category': 'Construction Equipment',
      'brand': {
        '@type': 'Brand',
        'name': 'Llanotecnica'
      },
      'manufacturer': {
        '@type': 'Organization',
        'name': 'Llanotecnica'
      },
      'image': [
        'https://www.llanotecnica.com/assets/photos/MT-480-optimized.jpg',
        'https://www.llanotecnica.com/assets/photos/MT-480-GREEN-optimized.jpg',
        'https://www.llanotecnica.com/assets/photos/MT-480-YELLOW-optimized.jpg',
        'https://www.llanotecnica.com/assets/photos/MT-480-BLUE-optimized.jpg'
      ],
      'offers': {
        '@type': 'Offer',
        'availability': 'https://schema.org/InStock',
        'priceCurrency': 'USD',
        'seller': {
          '@type': 'Organization',
          'name': 'Llanotecnica'
        },
        'url': 'https://www.llanotecnica.com/en/products'
      },
      'additionalProperty': [
        {
          '@type': 'PropertyValue',
          'name': 'Drum Capacity',
          'value': specs['MT-480'].drumSpecs.capacity
        },
        {
          '@type': 'PropertyValue',
          'name': 'Opening Diameter',
          'value': specs['MT-480'].drumSpecs.openingDiameter
        },
        {
          '@type': 'PropertyValue',
          'name': 'Drum Depth',
          'value': specs['MT-480'].drumSpecs.depth
        },
        {
          '@type': 'PropertyValue',
          'name': 'Discharge Height',
          'value': specs['MT-480'].unitSpecs.dischargeHeight
        },
        {
          '@type': 'PropertyValue',
          'name': 'Length',
          'value': specs['MT-480'].dimensions.length
        },
        {
          '@type': 'PropertyValue',
          'name': 'Width',
          'value': specs['MT-480'].dimensions.width
        },
        {
          '@type': 'PropertyValue',
          'name': 'Height',
          'value': specs['MT-480'].dimensions.height
        },
        {
          '@type': 'PropertyValue',
          'name': 'Weight',
          'value': specs['MT-480'].dimensions.weight
        },
        {
          '@type': 'PropertyValue',
          'name': 'Power Supply Options',
          'value': specs['MT-480'].unitSpecs.powerSupply
        }
      ]
    };

    this.seoService.addStructuredData(mt370Data);
    this.seoService.addStructuredData(mt480Data);

    // Add breadcrumb schema for products page
    this.addBreadcrumbSchema();
  }

  private addBreadcrumbSchema(): void {
    const currentLang = this.translate.currentLang || 'en';
    const breadcrumbData = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': [
        {
          '@type': 'ListItem',
          'position': 1,
          'name': currentLang === 'es' ? 'Inicio' : 'Home',
          'item': `https://www.llanotecnica.com/${currentLang}`
        },
        {
          '@type': 'ListItem',
          'position': 2,
          'name': currentLang === 'es' ? 'Productos' : 'Products',
          'item': currentLang === 'es' ? 'https://www.llanotecnica.com/es/productos' : 'https://www.llanotecnica.com/en/products'
        }
      ]
    };
    this.seoService.addStructuredData(breadcrumbData);
  }

  ngAfterViewInit() {
    // Check if window is defined (to avoid errors during SSR)
    if (typeof window !== 'undefined') {
      this.setupLazyLoading();

      // Initialize active tabs for each product
      this.productImages().forEach(product => {
        this.activeProductTabs[product.model] = 'basic-specs-' + product.model;
      });

      // We'll replace the setupSpecsTabs() with our own logic
    }
  }

  // Method to switch tabs
  switchTab(event: Event, tabId: string, productModel: string): void {
    event.preventDefault();

    // Get all tab buttons and content for this specific product
    const productTabsContainer = (event.target as HTMLElement).closest('.specs-tabs');
    if (!productTabsContainer) return;

    const tabButtons = productTabsContainer.querySelectorAll('.specs-tab');
    const productContent = productTabsContainer.closest('.product-content');

    if (!productContent) return;

    const tabContents = productContent.querySelectorAll('.specs-content');

    // Deactivate all tabs within this product card only
    tabButtons.forEach(tab => tab.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));

    // Activate clicked tab and content
    (event.target as HTMLElement).classList.add('active');
    const content = document.getElementById(tabId);
    if (content) {
      content.classList.add('active');
    }

    // Update active tab for this product
    this.activeProductTabs[productModel] = tabId;
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

  private setupSpecsTabs(): void {
    const tabButtons = document.querySelectorAll('.specs-tab');
    tabButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const tabId = target.getAttribute('data-tab');

        // Deactivate all tabs
        document.querySelectorAll('.specs-tab').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.specs-content').forEach(content => content.classList.remove('active'));

        // Activate clicked tab
        target.classList.add('active');
        if (tabId) {
          const content = document.getElementById(tabId);
          if (content) content.classList.add('active');
        }
      });
    });
  }

  getDrumSpecs(): ComparisonSpec[] {
    const specs = this.productSpecs();
    return [
      {
        label: 'PRODUCTS_PAGE.COMPARISON_SECTION.TABLES.DRUM_CAPACITY',
        key: 'capacity',
        mt370Value: specs['MT-370'].drumSpecs.capacity,
        mt480Value: specs['MT-480'].drumSpecs.capacity,
        highlight: 'MT-480'
      },
      {
        label: 'PRODUCTS_PAGE.COMPARISON_SECTION.TABLES.OPENING_DIAMETER',
        key: 'openingDiameter',
        mt370Value: specs['MT-370'].drumSpecs.openingDiameter,
        mt480Value: specs['MT-480'].drumSpecs.openingDiameter,
        highlight: 'MT-480'
      },
      {
        label: 'PRODUCTS_PAGE.COMPARISON_SECTION.TABLES.DRUM_DEPTH',
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
        label: 'PRODUCTS_PAGE.COMPARISON_SECTION.TABLES.MANAGEMENT_SYSTEM',
        key: 'managementSystem',
        mt370Value: specs['MT-370'].unitSpecs.managementSystem,
        mt480Value: specs['MT-480'].unitSpecs.managementSystem
      },
      {
        label: 'PRODUCTS_PAGE.COMPARISON_SECTION.TABLES.DISCHARGE_HEIGHT',
        key: 'dischargeHeight',
        mt370Value: specs['MT-370'].unitSpecs.dischargeHeight,
        mt480Value: specs['MT-480'].unitSpecs.dischargeHeight,
        highlight: 'MT-480'
      },
      {
        label: 'PRODUCTS_PAGE.COMPARISON_SECTION.TABLES.WHEEL_SIZE',
        key: 'wheelSize',
        mt370Value: specs['MT-370'].unitSpecs.wheelSize,
        mt480Value: specs['MT-480'].unitSpecs.wheelSize
      }
    ];
  }

  getDimensionSpecs(): ComparisonSpec[] {
    const specs = this.productSpecs();
    return [
      {
        label: 'PRODUCTS_PAGE.COMPARISON_SECTION.TABLES.LENGTH',
        key: 'length',
        mt370Value: specs['MT-370'].dimensions.length,
        mt480Value: specs['MT-480'].dimensions.length
      },
      {
        label: 'PRODUCTS_PAGE.COMPARISON_SECTION.TABLES.WIDTH',
        key: 'width',
        mt370Value: specs['MT-370'].dimensions.width,
        mt480Value: specs['MT-480'].dimensions.width
      },
      {
        label: 'PRODUCTS_PAGE.COMPARISON_SECTION.TABLES.HEIGHT',
        key: 'height',
        mt370Value: specs['MT-370'].dimensions.height,
        mt480Value: specs['MT-480'].dimensions.height,
        highlight: 'MT-480'
      },
      {
        label: 'PRODUCTS_PAGE.COMPARISON_SECTION.TABLES.WEIGHT',
        key: 'weight',
        mt370Value: specs['MT-370'].dimensions.weight,
        mt480Value: specs['MT-480'].dimensions.weight,
        highlight: 'MT-480'
      }
    ];
  }

  setActiveTab(tab: 'specs' | 'engines'): void {
    this.activeTab.set(tab);
  }

  // New method for filter functionality
  setEngineFilter(filter: EngineFilterType): void {
    this.activeEngineFilter.set(filter);
  }

  // Count engines displayed based on filter
  getFilteredEngineCount(): number {
    const currentFilter = this.activeEngineFilter();
    if (currentFilter === 'all') {
      return Object.keys(this.engineSpecs()).length;
    }

    return Object.values(this.engineSpecs())
      .filter(engine => {
        if (currentFilter === 'gas') {
          return engine.type === 'gas' || engine.type === 'honda';
        }
        return engine.type === currentFilter;
      }).length;
  }

  // Helper for the dialog to show engine model
  getEngineModel(engine: EngineSpecification): string {
    if (engine.type === 'honda') {
      // Extract the model number from the key
      const power = engine.specs.max_power.split(' ')[0];
      return `GX ${power} HP Engine`;
    } else if (engine.type === 'gas') {
      return `${engine.specs.max_power.split(' ')[0]} HP Gasoline Engine`;
    } else if (engine.type === 'diesel') {
      return `${engine.specs.max_power.split(' ')[0]} HP Diesel Engine`;
    } else {
      return `${engine.specs.max_power.split(' ')[0]} HP Electric Motor`;
    }
  }

  // Check engine compatibility with models
  isCompatibleWithMT370(engine: EngineSpecification): boolean {
    const power = parseFloat(engine.specs.max_power.split(' ')[0]);

    if (engine.type === 'honda' || engine.type === 'gas') {
      return power <= 9.0;
    } else if (engine.type === 'diesel') {
      return power === 7.0;
    } else if (engine.type === 'electric') {
      return power <= 3.0;
    }

    return false;
  }

  isCompatibleWithMT480(engine: EngineSpecification): boolean {
    const power = parseFloat(engine.specs.max_power.split(' ')[0]);

    if (engine.type === 'honda' || engine.type === 'gas') {
      return power >= 13.0;
    } else if (engine.type === 'diesel') {
      return power >= 9.0;
    } else if (engine.type === 'electric') {
      return power >= 5.0;
    }

    return false;
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

  // Updated openManualDialog method
  openManualDialog(model: string): void {
    const dialogConfig = new MatDialogConfig();

    // Store the model in a component property so you can access it in downloadManual
    this.currentProductModel = model;

    dialogConfig.width = '350px';
    dialogConfig.panelClass = 'manual-dialog-panel';
    dialogConfig.hasBackdrop = true;
    dialogConfig.backdropClass = 'manual-dialog-backdrop';
    dialogConfig.disableClose = false;

    // Remove the position settings that were causing the issue

    // Open the dialog
    this.dialog.open(this.manualDialog, dialogConfig);
  }

  // Updated downloadManual method to use the currentProductModel
  downloadManual(model: string, language: 'en' | 'es'): void {
    const fileName = language === 'en' ? 'Manual-Eng.pdf' : 'Manual-Esp.pdf';
    const link = document.createElement('a');
    link.href = `assets/photos/${fileName}`;
    // Use the currentProductModel instead of the parameter
    link.download = `${this.currentProductModel}-${fileName}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Close the dialog
    this.dialog.closeAll();
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
        return `GX${engine.power.replace('HP', '').trim()}H2`;
      case 'diesel':
        return `4Power-D${engine.power.replace(' HP', '')}`;
      case 'gas':
        const power = parseInt(engine.power);
        if (power === 7) return '170F';
        if (power === 9) return '177F';
        if (power === 13) return '188F';
        break;
      case 'electric':
        const powerRange = engine.power.split('-')[0];
        const hp = parseInt(powerRange);
        return `electric-${hp}hp`;
    }
    return '';
  }

  getRecommendedEngine(model: string): string {
    if (model === 'MT-370') {
      return 'Honda GX270 (9HP) or 4Power Gasoline (7HP)';
    } else {
      return 'Honda GX390 (13HP) or 4Power Diesel (9HP)';
    }
  }

  // Helper method to get quick specs for showcase
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

  // Color selection methods
  selectColor(model: string, color: string): void {
    const currentColors = this.selectedColors();
    this.selectedColors.set({
      ...currentColors,
      [model]: color
    });
  }

  getCurrentImageSrc(model: string): string {
    const selectedColor = this.selectedColors()[model] || 'GREEN';
    return `assets/photos/${model}-${selectedColor}-optimized.jpg`;
  }

  getAvailableColors(): string[] {
    return ['GREEN', 'YELLOW', 'BLUE'];
  }

  getColorDisplayName(color: string): string {
    switch (color) {
      case 'GREEN': return 'Green';
      case 'YELLOW': return 'Yellow';
      case 'BLUE': return 'Blue';
      default: return color;
    }
  }

  isColorSelected(model: string, color: string): boolean {
    return this.selectedColors()[model] === color;
  }
}

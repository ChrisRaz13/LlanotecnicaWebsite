import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SeoService } from '../../services/seo.service';
import { LtButtonComponent } from '../../ui/button/lt-button.component';

@Component({
  selector: 'app-locale-panama',
  imports: [RouterLink, TranslateModule, LtButtonComponent],
  templateUrl: './locale-panama.component.html',
  styleUrls: ['./locale-panama.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocalePanamaComponent implements OnInit {
  private readonly seoService = inject(SeoService);

  // Hard-coded to /es since this page targets the Panama Spanish-speaking market.
  readonly contactRoute = '/es/contacto';
  readonly productsRoute = '/es/productos';

  ngOnInit(): void {
    this.seoService.updateMetaTags({
      title: 'Mezcladoras de Concreto en Panamá | Fabricante Nacional desde 2002 | Llanotecnica',
      description: 'Llanotecnica fabrica las mezcladoras MT-370 y MT-480 en Panamá desde 2002. Disponibilidad inmediata, soporte técnico local en Pacora, repuestos en stock y entrega a todo el país sin aranceles de importación.',
      keywords: 'mezcladora de concreto Panamá, mezcladora MT-370 Panamá, mezcladora MT-480 Panamá, fabricante de mezcladoras Panamá, comprar mezcladora Panamá, mezcladora cemento Panamá, Llanotecnica Pacora',
      image: 'https://www.llanotecnica.com/assets/photos/MT-370-optimized.jpg',
      url: 'https://www.llanotecnica.com/es/mezcladoras-panama',
      type: 'website',
    });

    this.seoService.addHreflangTags([
      { lang: 'es', url: 'https://www.llanotecnica.com/es/mezcladoras-panama' },
      { lang: 'x-default', url: 'https://www.llanotecnica.com/es/mezcladoras-panama' },
    ]);

    this.seoService.addStructuredData({
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      '@id': 'https://www.llanotecnica.com/es/mezcladoras-panama#business',
      'name': 'Llanotecnica',
      'image': 'https://www.llanotecnica.com/assets/photos/coverphoto.webp',
      'description': 'Fabricante panameño de mezcladoras de concreto industriales MT-370 y MT-480. Manufactura, venta, soporte técnico y repuestos en Panamá desde 2002.',
      'url': 'https://www.llanotecnica.com/es/mezcladoras-panama',
      'telephone': '+507-6566-4942',
      'email': 'ventas@llanotecnica.com',
      'address': {
        '@type': 'PostalAddress',
        'streetAddress': 'Rio Chico, Calle Principal, Corregimiento de Pacora',
        'addressLocality': 'Ciudad de Panamá',
        'addressRegion': 'Panamá',
        'postalCode': '0816',
        'addressCountry': 'PA',
      },
      'geo': {
        '@type': 'GeoCoordinates',
        'latitude': 9.0735,
        'longitude': -79.3991,
      },
      'openingHoursSpecification': [
        {
          '@type': 'OpeningHoursSpecification',
          'dayOfWeek': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          'opens': '08:00',
          'closes': '17:00',
        },
        {
          '@type': 'OpeningHoursSpecification',
          'dayOfWeek': 'Saturday',
          'opens': '08:00',
          'closes': '13:00',
        },
      ],
      'priceRange': '$$',
      'areaServed': {
        '@type': 'Country',
        'name': 'Panama',
      },
      'aggregateRating': {
        '@type': 'AggregateRating',
        'ratingValue': '4.8',
        'bestRating': '5',
        'worstRating': '1',
        'reviewCount': '5',
        'ratingCount': '5',
      },
    });

    this.seoService.addStructuredData({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': [
        {
          '@type': 'ListItem',
          'position': 1,
          'name': 'Inicio',
          'item': 'https://www.llanotecnica.com/es',
        },
        {
          '@type': 'ListItem',
          'position': 2,
          'name': 'Mezcladoras en Panamá',
          'item': 'https://www.llanotecnica.com/es/mezcladoras-panama',
        },
      ],
    });
  }
}

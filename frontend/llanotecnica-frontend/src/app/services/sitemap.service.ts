import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

export interface SitemapUrl {
  loc: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
  images?: SitemapImage[];
  videos?: SitemapVideo[];
}

export interface SitemapImage {
  loc: string;
  title: string;
  caption?: string;
}

export interface SitemapVideo {
  thumbnail_loc: string;
  title: string;
  description: string;
  content_loc: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class SitemapService {
  private baseUrl = 'https://llanotecnica.com';

  constructor(private router: Router) {}

  generateSitemap(): string {
    const urls = this.getSitemapUrls();

    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" ';
    sitemap += 'xmlns:xhtml="http://www.w3.org/1999/xhtml" ';
    sitemap += 'xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" ';
    sitemap += 'xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">\n';

    urls.forEach(url => {
      sitemap += '  <url>\n';
      sitemap += `    <loc>${url.loc}</loc>\n`;
      sitemap += `    <lastmod>${url.lastmod}</lastmod>\n`;
      sitemap += `    <changefreq>${url.changefreq}</changefreq>\n`;
      sitemap += `    <priority>${url.priority}</priority>\n`;

      // Add hreflang links for multilingual pages
      if (url.loc.includes('/en/') || url.loc.endsWith('/en') || (!url.loc.includes('/es/') && !url.loc.includes('/en/'))) {
        const enUrl = url.loc.replace('/es/', '/en/').replace('/es', '/en');
        const esUrl = url.loc.replace('/en/', '/es/').replace('/en', '/es');

        sitemap += `    <xhtml:link rel="alternate" hreflang="en" href="${enUrl}" />\n`;
        sitemap += `    <xhtml:link rel="alternate" hreflang="es" href="${esUrl}" />\n`;
        sitemap += `    <xhtml:link rel="alternate" hreflang="x-default" href="${enUrl}" />\n`;
      }

      // Add images if present
      if (url.images && url.images.length > 0) {
        url.images.forEach(image => {
          sitemap += '    <image:image>\n';
          sitemap += `      <image:loc>${image.loc}</image:loc>\n`;
          sitemap += `      <image:title>${this.escapeXml(image.title)}</image:title>\n`;
          if (image.caption) {
            sitemap += `      <image:caption>${this.escapeXml(image.caption)}</image:caption>\n`;
          }
          sitemap += '    </image:image>\n';
        });
      }

      // Add videos if present
      if (url.videos && url.videos.length > 0) {
        url.videos.forEach(video => {
          sitemap += '    <video:video>\n';
          sitemap += `      <video:thumbnail_loc>${video.thumbnail_loc}</video:thumbnail_loc>\n`;
          sitemap += `      <video:title>${this.escapeXml(video.title)}</video:title>\n`;
          sitemap += `      <video:description>${this.escapeXml(video.description)}</video:description>\n`;
          sitemap += `      <video:content_loc>${video.content_loc}</video:content_loc>\n`;
          if (video.duration) {
            sitemap += `      <video:duration>${video.duration}</video:duration>\n`;
          }
          sitemap += '    </video:video>\n';
        });
      }

      sitemap += '  </url>\n';
    });

    sitemap += '</urlset>';
    return sitemap;
  }

  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  private getSitemapUrls(): SitemapUrl[] {
    const currentDate = new Date().toISOString().split('T')[0];

    return [
      // Home pages with videos
      {
        loc: `${this.baseUrl}/en`,
        lastmod: currentDate,
        changefreq: 'weekly',
        priority: 1.0,
        images: [
          {
            loc: `${this.baseUrl}/assets/photos/MT-370-optimized.jpg`,
            title: 'MT-370 Concrete Mixer',
            caption: 'Professional 370L concrete mixer for residential and commercial construction projects'
          },
          {
            loc: `${this.baseUrl}/assets/photos/MT-480-optimized.jpg`,
            title: 'MT-480 Concrete Mixer',
            caption: 'Heavy-duty 480L concrete mixer for large-scale commercial construction'
          }
        ],
        videos: [
          {
            thumbnail_loc: `${this.baseUrl}/assets/photos/coverphoto.webp`,
            title: 'Introduction to Llanotecnica Concrete Mixers',
            description: 'Professional demonstration of MT-370 and MT-480 concrete mixers showcasing features and capabilities',
            content_loc: `${this.baseUrl}/assets/compressedvideos/IntroductionEnglish.mp4`,
            duration: 150
          },
          {
            thumbnail_loc: `${this.baseUrl}/assets/photos/instruction-poster.png`,
            title: 'How to Operate MT-370 and MT-480 Concrete Mixers',
            description: 'Detailed step-by-step instructions for safely operating Llanotecnica concrete mixers',
            content_loc: `${this.baseUrl}/assets/compressedvideos/instruction.mp4`,
            duration: 300
          }
        ]
      },
      {
        loc: `${this.baseUrl}/es`,
        lastmod: currentDate,
        changefreq: 'weekly',
        priority: 1.0,
        images: [
          {
            loc: `${this.baseUrl}/assets/photos/MT-370-optimized.jpg`,
            title: 'Mezcladora de Concreto MT-370',
            caption: 'Mezcladora profesional de 370L para proyectos residenciales y comerciales'
          },
          {
            loc: `${this.baseUrl}/assets/photos/MT-480-optimized.jpg`,
            title: 'Mezcladora de Concreto MT-480',
            caption: 'Mezcladora industrial de 480L para construcción comercial de gran escala'
          }
        ],
        videos: [
          {
            thumbnail_loc: `${this.baseUrl}/assets/photos/coverphoto.webp`,
            title: 'Introducción a Mezcladoras de Concreto Llanotecnica',
            description: 'Demostración profesional de mezcladoras MT-370 y MT-480 mostrando características y capacidades',
            content_loc: `${this.baseUrl}/assets/compressedvideos/IntroductionSpanish.mp4`,
            duration: 150
          },
          {
            thumbnail_loc: `${this.baseUrl}/assets/photos/instruction-poster.png`,
            title: 'Cómo Operar Mezcladoras MT-370 y MT-480',
            description: 'Instrucciones detalladas paso a paso para operar de forma segura las mezcladoras Llanotecnica',
            content_loc: `${this.baseUrl}/assets/compressedvideos/instruction.mp4`,
            duration: 300
          }
        ]
      },

      // Products pages with all product images
      {
        loc: `${this.baseUrl}/en/products`,
        lastmod: currentDate,
        changefreq: 'weekly',
        priority: 0.9,
        images: [
          // MT-370 images
          {
            loc: `${this.baseUrl}/assets/photos/MT-370-GREEN-optimized.jpg`,
            title: 'MT-370 Concrete Mixer - Green',
            caption: 'MT-370 concrete mixer in green color - 370L capacity for medium-duty projects'
          },
          {
            loc: `${this.baseUrl}/assets/photos/MT-370-YELLOW-optimized.jpg`,
            title: 'MT-370 Concrete Mixer - Yellow',
            caption: 'MT-370 concrete mixer in yellow color - Durable construction equipment'
          },
          {
            loc: `${this.baseUrl}/assets/photos/MT-370-BLUE-optimized.jpg`,
            title: 'MT-370 Concrete Mixer - Blue',
            caption: 'MT-370 concrete mixer in blue color - Professional grade mixing equipment'
          },
          // MT-480 images
          {
            loc: `${this.baseUrl}/assets/photos/MT-480-GREEN-optimized.jpg`,
            title: 'MT-480 Concrete Mixer - Green',
            caption: 'MT-480 concrete mixer in green color - 480L capacity for heavy-duty commercial projects'
          },
          {
            loc: `${this.baseUrl}/assets/photos/MT-480-YELLOW-optimized.jpg`,
            title: 'MT-480 Concrete Mixer - Yellow',
            caption: 'MT-480 concrete mixer in yellow color - Industrial strength mixing equipment'
          },
          {
            loc: `${this.baseUrl}/assets/photos/MT-480-BLUE-optimized.jpg`,
            title: 'MT-480 Concrete Mixer - Blue',
            caption: 'MT-480 concrete mixer in blue color - Heavy-duty construction mixer'
          }
        ]
      },
      {
        loc: `${this.baseUrl}/es/productos`,
        lastmod: currentDate,
        changefreq: 'weekly',
        priority: 0.9,
        images: [
          // MT-370 imágenes
          {
            loc: `${this.baseUrl}/assets/photos/MT-370-GREEN-optimized.jpg`,
            title: 'Mezcladora de Concreto MT-370 - Verde',
            caption: 'Mezcladora MT-370 en color verde - Capacidad 370L para proyectos medianos'
          },
          {
            loc: `${this.baseUrl}/assets/photos/MT-370-YELLOW-optimized.jpg`,
            title: 'Mezcladora de Concreto MT-370 - Amarilla',
            caption: 'Mezcladora MT-370 en color amarillo - Equipo de construcción duradero'
          },
          {
            loc: `${this.baseUrl}/assets/photos/MT-370-BLUE-optimized.jpg`,
            title: 'Mezcladora de Concreto MT-370 - Azul',
            caption: 'Mezcladora MT-370 en color azul - Equipo de mezcla de grado profesional'
          },
          // MT-480 imágenes
          {
            loc: `${this.baseUrl}/assets/photos/MT-480-GREEN-optimized.jpg`,
            title: 'Mezcladora de Concreto MT-480 - Verde',
            caption: 'Mezcladora MT-480 en color verde - Capacidad 480L para proyectos comerciales pesados'
          },
          {
            loc: `${this.baseUrl}/assets/photos/MT-480-YELLOW-optimized.jpg`,
            title: 'Mezcladora de Concreto MT-480 - Amarilla',
            caption: 'Mezcladora MT-480 en color amarillo - Equipo de mezcla de resistencia industrial'
          },
          {
            loc: `${this.baseUrl}/assets/photos/MT-480-BLUE-optimized.jpg`,
            title: 'Mezcladora de Concreto MT-480 - Azul',
            caption: 'Mezcladora MT-480 en color azul - Mezcladora de construcción pesada'
          }
        ]
      },

      // About Us pages
      {
        loc: `${this.baseUrl}/en/about-us`,
        lastmod: currentDate,
        changefreq: 'monthly',
        priority: 0.8
      },
      {
        loc: `${this.baseUrl}/es/sobre-nosotros`,
        lastmod: currentDate,
        changefreq: 'monthly',
        priority: 0.8
      },

      // Contact pages
      {
        loc: `${this.baseUrl}/en/contact`,
        lastmod: currentDate,
        changefreq: 'monthly',
        priority: 0.7
      },
      {
        loc: `${this.baseUrl}/es/contacto`,
        lastmod: currentDate,
        changefreq: 'monthly',
        priority: 0.7
      }
    ];
  }
}

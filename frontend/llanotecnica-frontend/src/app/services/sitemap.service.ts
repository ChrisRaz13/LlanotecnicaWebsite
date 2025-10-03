import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

export interface SitemapUrl {
  loc: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
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
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';

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

      sitemap += '  </url>\n';
    });

    sitemap += '</urlset>';
    return sitemap;
  }

  private getSitemapUrls(): SitemapUrl[] {
    const currentDate = new Date().toISOString().split('T')[0];

    return [
      // Home pages - only include language-specific URLs
      {
        loc: `${this.baseUrl}/en`,
        lastmod: currentDate,
        changefreq: 'weekly',
        priority: 1.0
      },
      {
        loc: `${this.baseUrl}/es`,
        lastmod: currentDate,
        changefreq: 'weekly',
        priority: 1.0
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

      // Products pages
      {
        loc: `${this.baseUrl}/en/products`,
        lastmod: currentDate,
        changefreq: 'weekly',
        priority: 0.9
      },
      {
        loc: `${this.baseUrl}/es/productos`,
        lastmod: currentDate,
        changefreq: 'weekly',
        priority: 0.9
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

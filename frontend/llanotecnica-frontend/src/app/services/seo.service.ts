import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

interface SEOConfig {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  robots?: string;
  canonicalUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private baseUrl = 'https://www.llanotecnica.com';

  constructor(
    private meta: Meta,
    private title: Title,
    private router: Router,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  updateMetaTags(config: SEOConfig): void {
    // Set title
    this.title.setTitle(config.title);

    // Set description
    this.meta.updateTag({ name: 'description', content: config.description });

    // Set keywords if provided
    if (config.keywords) {
      this.meta.updateTag({ name: 'keywords', content: config.keywords });
    }

    // Set robots
    this.meta.updateTag({
      name: 'robots',
      content: config.robots || 'index, follow'
    });

    // Set canonical URL
    const canonicalUrl = config.canonicalUrl || this.getCanonicalUrl(config.url);
    this.updateCanonicalUrl(canonicalUrl);

    // Open Graph tags
    this.meta.updateTag({ property: 'og:title', content: config.title });
    this.meta.updateTag({ property: 'og:description', content: config.description });
    this.meta.updateTag({ property: 'og:url', content: canonicalUrl });
    this.meta.updateTag({ property: 'og:type', content: config.type || 'website' });

    if (config.image) {
      this.meta.updateTag({ property: 'og:image', content: config.image });
    }

    // Twitter Card tags
    this.meta.updateTag({ property: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ property: 'twitter:title', content: config.title });
    this.meta.updateTag({ property: 'twitter:description', content: config.description });
    this.meta.updateTag({ property: 'twitter:url', content: canonicalUrl });

    if (config.image) {
      this.meta.updateTag({ property: 'twitter:image', content: config.image });
    }
  }

  private getCanonicalUrl(url?: string): string {
    if (url) {
      return url.startsWith('http') ? url : `${this.baseUrl}${url}`;
    }

    // Get current URL and normalize it
    const currentUrl = this.router.url.split('?')[0].split('#')[0];

    // KEEP language prefix for canonical URL (critical for multilingual SEO)
    // If no language prefix, default to English
    let canonicalPath = currentUrl;

    // Normalize root path to /en
    if (canonicalPath === '/' || canonicalPath === '') {
      canonicalPath = '/en';
    }

    // If accessing language-agnostic route, prepend /en
    // e.g., /products -> /en/products, /about-us -> /en/about-us
    if (!canonicalPath.startsWith('/en') && !canonicalPath.startsWith('/es')) {
      canonicalPath = '/en' + canonicalPath;
    }

    // Ensure URL starts with /
    if (!canonicalPath.startsWith('/')) {
      canonicalPath = '/' + canonicalPath;
    }

    return `${this.baseUrl}${canonicalPath}`;
  }

  updateCanonicalUrl(url: string): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Remove existing canonical link
    const existingCanonical = this.document.querySelector('link[rel="canonical"]');
    if (existingCanonical) {
      existingCanonical.remove();
    }

    // Add new canonical link
    const link: HTMLLinkElement = this.document.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', url);
    this.document.head.appendChild(link);
  }

  addHreflangTags(languages: { lang: string; url: string }[]): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Remove existing hreflang links
    const existingHreflangs = this.document.querySelectorAll('link[rel="alternate"]');
    existingHreflangs.forEach(link => link.remove());

    // Add new hreflang links
    languages.forEach(({ lang, url }) => {
      const link: HTMLLinkElement = this.document.createElement('link');
      link.setAttribute('rel', 'alternate');
      link.setAttribute('hreflang', lang);
      link.setAttribute('href', url);
      this.document.head.appendChild(link);
    });
  }

  addStructuredData(data: any): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Remove existing structured data with same @type to avoid duplicates
    const existingScripts = this.document.querySelectorAll('script[type="application/ld+json"]');
    existingScripts.forEach(script => {
      try {
        const scriptData = JSON.parse(script.textContent || '{}');
        if (scriptData['@type'] === data['@type']) {
          script.remove();
        }
      } catch (e) {
        // Invalid JSON, remove it
        script.remove();
      }
    });

    // Add new structured data
    const script = this.document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(data);
    this.document.head.appendChild(script);
  }

  removeStructuredData(type: string): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const scripts = this.document.querySelectorAll('script[type="application/ld+json"]');
    scripts.forEach(script => {
      try {
        const data = JSON.parse(script.textContent || '{}');
        if (data['@type'] === type) {
          script.remove();
        }
      } catch (e) {
        // Invalid JSON, ignore
      }
    });
  }
}

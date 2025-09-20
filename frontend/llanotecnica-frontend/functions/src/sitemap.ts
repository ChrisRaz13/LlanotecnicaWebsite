import {onRequest} from "firebase-functions/v2/https";
import * as corsLib from "cors";
import {promisify} from "util";

const corsHandler = promisify(corsLib({origin: true}));

interface SitemapUrl {
  loc: string;
  lastmod: string;
  changefreq:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  priority: number;
}

/**
 * Generate XML sitemap for the website
 * @return {string} XML sitemap content
 */
function generateSitemap(): string {
  const baseUrl = "https://llanotecnica.com";
  const currentDate = new Date().toISOString().split("T")[0];

  const urls: SitemapUrl[] = [
    // Home pages
    {
      loc: `${baseUrl}/`,
      lastmod: currentDate,
      changefreq: "weekly",
      priority: 1.0,
    },
    {
      loc: `${baseUrl}/en`,
      lastmod: currentDate,
      changefreq: "weekly",
      priority: 1.0,
    },
    {
      loc: `${baseUrl}/es`,
      lastmod: currentDate,
      changefreq: "weekly",
      priority: 1.0,
    },

    // About Us pages
    {
      loc: `${baseUrl}/en/about-us`,
      lastmod: currentDate,
      changefreq: "monthly",
      priority: 0.8,
    },
    {
      loc: `${baseUrl}/es/sobre-nosotros`,
      lastmod: currentDate,
      changefreq: "monthly",
      priority: 0.8,
    },

    // Products pages
    {
      loc: `${baseUrl}/en/products`,
      lastmod: currentDate,
      changefreq: "weekly",
      priority: 0.9,
    },
    {
      loc: `${baseUrl}/es/productos`,
      lastmod: currentDate,
      changefreq: "weekly",
      priority: 0.9,
    },

    // Contact pages
    {
      loc: `${baseUrl}/en/contact`,
      lastmod: currentDate,
      changefreq: "monthly",
      priority: 0.7,
    },
    {
      loc: `${baseUrl}/es/contacto`,
      lastmod: currentDate,
      changefreq: "monthly",
      priority: 0.7,
    },

    // Direct access pages (without language prefix)
    {
      loc: `${baseUrl}/about-us`,
      lastmod: currentDate,
      changefreq: "monthly",
      priority: 0.8,
    },
    {
      loc: `${baseUrl}/sobre-nosotros`,
      lastmod: currentDate,
      changefreq: "monthly",
      priority: 0.8,
    },
    {
      loc: `${baseUrl}/products`,
      lastmod: currentDate,
      changefreq: "weekly",
      priority: 0.9,
    },
    {
      loc: `${baseUrl}/productos`,
      lastmod: currentDate,
      changefreq: "weekly",
      priority: 0.9,
    },
    {
      loc: `${baseUrl}/contact`,
      lastmod: currentDate,
      changefreq: "monthly",
      priority: 0.7,
    },
    {
      loc: `${baseUrl}/contacto`,
      lastmod: currentDate,
      changefreq: "monthly",
      priority: 0.7,
    },
  ];

  let sitemap = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n";
  sitemap += "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\" " +
    "xmlns:xhtml=\"http://www.w3.org/1999/xhtml\">\n";

  urls.forEach((url) => {
    sitemap += "  <url>\n";
    sitemap += `    <loc>${url.loc}</loc>\n`;
    sitemap += `    <lastmod>${url.lastmod}</lastmod>\n`;
    sitemap += `    <changefreq>${url.changefreq}</changefreq>\n`;
    sitemap += `    <priority>${url.priority}</priority>\n`;

    // Add hreflang links for multilingual pages
    const hasLangPrefix = url.loc.includes("/en/") || url.loc.endsWith("/en") ||
      (!url.loc.includes("/es/") && !url.loc.includes("/en/"));

    if (hasLangPrefix) {
      const enUrl = url.loc.replace("/es/", "/en/").replace("/es", "/en");
      const esUrl = url.loc.replace("/en/", "/es/").replace("/en", "/es");

      sitemap += "    <xhtml:link rel=\"alternate\" hreflang=\"en\" " +
        `href="${enUrl}" />\n`;
      sitemap += "    <xhtml:link rel=\"alternate\" hreflang=\"es\" " +
        `href="${esUrl}" />\n`;
      sitemap += "    <xhtml:link rel=\"alternate\" hreflang=\"x-default\" " +
        `href="${enUrl}" />\n`;
    }

    sitemap += "  </url>\n";
  });

  sitemap += "</urlset>";
  return sitemap;
}

export const serveSitemap = onRequest({
  memory: "128MiB",
  region: "us-central1",
  maxInstances: 10,
}, async (req, res) => {
  try {
    console.log("Sitemap function triggered");

    // Handle CORS
    await corsHandler(req, res);

    if (req.method === "OPTIONS") {
      console.log("Handling OPTIONS preflight request");
      res.status(204).send("");
      return;
    }

    // Only allow GET requests
    if (req.method !== "GET") {
      console.log(`Invalid method: ${req.method}`);
      res.status(405).json({error: "Method Not Allowed"});
      return;
    }

    console.log("Generating sitemap XML");

    // Generate the sitemap
    const sitemapXml = generateSitemap();

    // Set proper headers for XML
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600"); // Cache for 1 hour

    console.log("Sending sitemap XML response");
    res.status(200).send(sitemapXml);
  } catch (error) {
    console.error("Error generating sitemap:", error);
    res.status(500).json({error: "Internal Server Error"});
  }
});

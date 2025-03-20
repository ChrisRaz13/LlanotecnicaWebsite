import { APP_BASE_HREF } from '@angular/common';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import fs from 'fs';
import bootstrap from './src/main.server';

// Determine folder paths
const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = join(serverDistFolder, '../browser');

const engineFunction = (
  filePath: string,
  options: { [key: string]: any },
  callback: (e: any, rendered?: string) => void
) => {
  // Read the HTML template if not provided in options
  let document = options['document'];
  if (!document) {
    try {
      document = fs.readFileSync(filePath, 'utf-8');
    } catch (err) {
      return callback(err);
    }
  }
  const req = options['req'];
  if (!req) {
    return callback(new Error('Request object is missing in render options.'));
  }
  const providers = options['providers'] || [];
  bootstrap({
    document,
    url: req.url,
    providers,
  })
    .then((html: string) => callback(null, html))
    .catch((err: any) => callback(err));
};

export function app(): express.Express {
  const server = express();
  server.engine('html', engineFunction);
  server.set('view engine', 'html');
  server.set('views', serverDistFolder);

  server.get('*.*', express.static(browserDistFolder, { maxAge: '1y' }));
  server.get('*', (req, res) => {
    res.render('index', {
      req,
      providers: [{ provide: APP_BASE_HREF, useValue: req.baseUrl }],
    });
  });
  return server;
}

if (require.main === module) {
  const PORT = process.env['PORT'] || 4000;
  const server = app();
  server.listen(PORT, () => {
    console.log(`Listening on http://localhost:${PORT}`);
  });
}

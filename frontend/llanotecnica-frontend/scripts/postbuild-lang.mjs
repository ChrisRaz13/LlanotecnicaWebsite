/**
 * Post-build pass: rewrite the `<html lang="..">` attribute on each
 * prerendered page to match its locale prefix.
 *
 * The Angular SSR pipeline doesn't expose the document for us to mutate
 * before serialization in the new application-builder, so we patch the
 * already-emitted HTML files in place.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..', 'dist', 'llanotecnica', 'browser');

const localePrefixes = [
  { prefix: 'es', lang: 'es' },
  { prefix: 'en', lang: 'en' },
];

async function* walk(dir) {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else yield full;
  }
}

async function patchHtml(file, lang) {
  const html = await fs.readFile(file, 'utf8');
  const next = html.replace(
    /<html(\s[^>]*?)?\slang="[^"]*"/i,
    (_match, prefix = '') => `<html${prefix} lang="${lang}"`,
  );
  if (next !== html) await fs.writeFile(file, next);
}

let patched = 0;
for (const { prefix, lang } of localePrefixes) {
  const localeDir = path.join(root, prefix);
  for await (const file of walk(localeDir)) {
    if (!file.endsWith('.html')) continue;
    await patchHtml(file, lang);
    patched++;
  }
}

console.log(`postbuild-lang: patched ${patched} prerendered HTML file(s)`);

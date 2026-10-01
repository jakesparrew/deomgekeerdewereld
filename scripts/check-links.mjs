/**
 * Loopt door dist/ en controleert:
 *   1. elke interne link wijst naar een pagina die echt bestaat
 *   2. elk mailto-adres eindigt op @deomgekeerdewereld.be
 *      (de oude site had een restje uit een sjabloon: een fitnesscoach)
 *   3. elke <img> heeft een alt-tekst
 *   4. elke pagina heeft een titel, een beschrijving en precies één h1
 *
 * Gebruik:  npm run build && npm run check
 */

import { readdir, readFile } from 'node:fs/promises';
import { join, relative, dirname, resolve } from 'node:path';
import { existsSync } from 'node:fs';

const DIST = resolve('dist');
const ALLOWED_MAIL_DOMAIN = 'deomgekeerdewereld.be';

/**
 * Mailadressen buiten ons eigen domein die er wél horen te staan.
 * Alles wat hier niet in staat is verdacht: op de oude site stond een
 * restje uit een sjabloon (het adres van een fitnesscoach) bij Partnerships.
 */
const ALLOWED_EXTERNAL_MAIL = new Set([
  // Gegevensbeschermingsautoriteit, genoemd in het privacybeleid
  'contact@apd-gba.be',
]);

/** Bestanden die geen Astro-pagina zijn en dus geen titel of h1 hoeven. */
const NOT_A_PAGE = [/^admin\//];

const problems = [];
const warnings = [];

function report(list, file, message) {
  list.push({ file, message });
}

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else if (entry.name.endsWith('.html')) out.push(full);
  }
  return out;
}

function attr(tag, name) {
  const match = tag.match(new RegExp(`${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, 'i'));
  return match ? (match[2] ?? match[3] ?? '') : null;
}

/** Bestaat /kaart/ als dist/kaart/index.html? */
function pageExists(href) {
  const clean = href.split('#')[0].split('?')[0];
  if (clean === '' || clean === '/') return existsSync(join(DIST, 'index.html'));
  const noSlash = clean.replace(/^\/|\/$/g, '');
  return (
    existsSync(join(DIST, noSlash, 'index.html')) ||
    existsSync(join(DIST, noSlash)) ||
    existsSync(join(DIST, `${noSlash}.html`))
  );
}

const files = await walk(DIST);
if (files.length === 0) {
  console.error('Geen HTML gevonden in dist/. Draai eerst "npm run build".');
  process.exit(1);
}

for (const file of files) {
  const rel = relative(DIST, file).replace(/\\/g, '/');
  const html = await readFile(file, 'utf8');
  const isPage = !NOT_A_PAGE.some((re) => re.test(rel));

  if (isPage) {
    /* ---- titel en beschrijving ---- */
    if (!/<title>[^<]{5,}<\/title>/i.test(html)) {
      report(problems, rel, 'geen bruikbare <title>');
    }
    if (!/<meta\s+name="description"\s+content="[^"]{20,}"/i.test(html)) {
      report(problems, rel, 'geen bruikbare meta description');
    }

    /* ---- precies één h1 ---- */
    const h1Count = (html.match(/<h1[\s>]/gi) || []).length;
    if (h1Count === 0) report(problems, rel, 'geen <h1>');
    if (h1Count > 1) {
      report(problems, rel, `${h1Count} keer een <h1>, dat mag er maar één zijn`);
    }
  }

  /* ---- afbeeldingen ---- */
  for (const tag of html.match(/<img\b[^>]*>/gi) || []) {
    if (attr(tag, 'alt') === null) {
      report(problems, rel, `<img> zonder alt: ${tag.slice(0, 90)}`);
    }
  }

  /* ---- links ---- */
  for (const tag of html.match(/<a\b[^>]*>/gi) || []) {
    const href = attr(tag, 'href');
    if (!href) {
      report(problems, rel, `<a> zonder href: ${tag.slice(0, 90)}`);
      continue;
    }

    if (href.startsWith('mailto:')) {
      const address = decodeURIComponent(href.slice(7).split('?')[0]).toLowerCase();
      if (
        !address.endsWith(`@${ALLOWED_MAIL_DOMAIN}`) &&
        !ALLOWED_EXTERNAL_MAIL.has(address)
      ) {
        report(problems, rel, `mailto naar een vreemd domein: ${address}`);
      }
      continue;
    }

    if (
      href.startsWith('http') ||
      href.startsWith('tel:') ||
      href.startsWith('#') ||
      href.startsWith('data:')
    ) {
      continue;
    }

    // interne link
    const target = href.startsWith('/')
      ? href
      : `/${join(dirname(rel), href).replace(/\\/g, '/')}`;

    if (/\.(svg|png|jpe?g|webp|ico|xml|txt|webmanifest|pdf|css|js|ics)$/i.test(target)) {
      const asset = join(DIST, target.replace(/^\//, '').split('?')[0]);
      if (!existsSync(asset)) report(problems, rel, `bestand ontbreekt: ${href}`);
      continue;
    }

    if (!pageExists(target)) {
      report(problems, rel, `link naar een pagina die niet bestaat: ${href}`);
    }
  }

  /* ---- knoppen zonder tekst ---- */
  for (const match of html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/gi)) {
    const [, attrs, inner] = match;
    const text = inner.replace(/<[^>]*>/g, '').trim();
    const label = attr(`<button ${attrs}>`, 'aria-label');
    if (!text && !label) {
      report(problems, rel, 'een <button> zonder tekst en zonder aria-label');
    }
  }

  /* ---- lege alt op een niet-decoratieve plek is enkel een waarschuwing ---- */
  const emptyAlts = (html.match(/<img\b[^>]*alt=""[^>]*>/gi) || []).length;
  if (emptyAlts > 0) {
    report(warnings, rel, `${emptyAlts} afbeelding(en) met een lege alt — bedoeld?`);
  }
}

/* ---- verslag ---- */
console.log(`\nNagekeken: ${files.length} pagina's in dist/\n`);

if (warnings.length) {
  console.log('Waarschuwingen:');
  for (const w of warnings) console.log(`  ~ ${w.file}: ${w.message}`);
  console.log('');
}

if (problems.length) {
  console.log('Problemen:');
  for (const p of problems) console.log(`  x ${p.file}: ${p.message}`);
  console.log(`\n${problems.length} probleem(en) gevonden.\n`);
  process.exit(1);
}

console.log('Alles in orde: geen kapotte links, geen vreemde mailadressen,');
console.log('elke pagina heeft een titel, een beschrijving en één h1.\n');

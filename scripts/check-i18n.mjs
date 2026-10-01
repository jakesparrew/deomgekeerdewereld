/**
 * Controleert per pagina: canonical, hreflang, x-default en de taalknop.
 * Draaien na een build:  node scripts/check-i18n.mjs
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const DIST = process.argv[2] || 'dist';
const BASE = 'https://deomgekeerdewereld.be';

function walk(d) {
  return readdirSync(d, { withFileTypes: true }).flatMap((e) => {
    const f = join(d, e.name);
    return e.isDirectory() ? walk(f) : e.name.endsWith('.html') ? [f] : [];
  });
}

const rows = [];
for (const f of walk(DIST)) {
  if (f.includes('admin')) continue;
  const html = readFileSync(f, 'utf8');
  const page =
    '/' +
    f
      .split(/[\\/]/)
      .slice(1)
      .join('/')
      .replace(/index\.html$/, '')
      .replace(/\.html$/, '');
  const grab = (re) => html.match(re)?.[1];
  const strip = (u) => (u ? u.replace(BASE, '') || '/' : undefined);
  rows.push({
    page,
    lang: grab(/<html lang="([^"]+)"/),
    canon: strip(grab(/rel="canonical" href="([^"]+)"/)),
    nl: strip(grab(/hreflang="nl-BE" href="([^"]+)"/)),
    en: strip(grab(/hreflang="en" href="([^"]+)"/)),
    xdef: strip(grab(/hreflang="x-default" href="([^"]+)"/)),
    switcher: grab(/class="nav__lang" href="([^"]+)"/),
    noindex: /name="robots" content="noindex/.test(html),
  });
}

rows.sort((a, b) => a.page.localeCompare(b.page));

const pad = (s, n) => String(s ?? '-').padEnd(n);
console.log(
  pad('page', 17),
  pad('lang', 6),
  pad('canonical', 17),
  pad('nl', 15),
  pad('en', 15),
  pad('x-def', 15),
  pad('switch', 15),
  'noindex',
);
console.log('-'.repeat(115));
for (const r of rows) {
  console.log(
    pad(r.page, 17),
    pad(r.lang, 6),
    pad(r.canon, 17),
    pad(r.nl, 15),
    pad(r.en, 15),
    pad(r.xdef, 15),
    pad(r.switcher, 15),
    r.noindex ? 'YES' : '',
  );
}

/* ---- controles ---- */
const problems = [];
const byPage = new Map(rows.map((r) => [r.page, r]));

for (const r of rows) {
  if (r.noindex) continue; // noindex-paginas sturen bewust geen canonical of hreflang
  if (r.canon !== r.page) problems.push(`${r.page}: canonical wijst naar ${r.canon}`);
  if (!r.nl) problems.push(`${r.page}: hreflang nl-BE ontbreekt`);
  // /privacy/ en /cookies/ zijn voor beide talen dezelfde pagina en sturen
  // daarom bewust geen hreflang="en" uit. Dat is geen fout.
  const gedeeld = r.page === '/privacy/' || r.page === '/cookies/';
  if (!r.en && !gedeeld) problems.push(`${r.page}: hreflang en ontbreekt`);
  if (r.xdef !== r.nl) problems.push(`${r.page}: x-default (${r.xdef}) is niet de NL-versie (${r.nl})`);

  // wederkerigheid: de tegenhanger moet terugwijzen
  const twin = r.lang?.startsWith('en') ? r.nl : r.en;
  if (twin && byPage.has(twin)) {
    const t = byPage.get(twin);
    if (t.nl !== r.nl || t.en !== r.en) {
      problems.push(`${r.page} <-> ${twin}: hreflang-paar komt niet overeen`);
    }
  } else if (twin && !twin.startsWith('/privacy') && !twin.startsWith('/cookies')) {
    problems.push(`${r.page}: tegenhanger ${twin} bestaat niet`);
  }

  // de taalwissel in de kop moet naar de andere taal gaan
  const expected = r.lang?.startsWith('en') ? r.nl : r.en;
  if (r.switcher && expected && r.switcher !== expected) {
    problems.push(`${r.page}: taalknop gaat naar ${r.switcher}, verwacht ${expected}`);
  }
}

console.log('');
if (problems.length) {
  console.log('PROBLEMEN:');
  for (const p of problems) console.log('  x', p);
  process.exitCode = 1;
} else {
  console.log('hreflang, canonical en de taalknop kloppen op elke pagina.');
}

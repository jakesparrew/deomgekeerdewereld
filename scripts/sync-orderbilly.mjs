/**
 * Neemt de kaart over van OrderBilly (https://orderbilly.com/de-omgekeerde-wereld).
 *
 *   node scripts/sync-orderbilly.mjs          past content/menu.yaml en highlights.yaml aan
 *   node scripts/sync-orderbilly.mjs --check  toont enkel wat er zou veranderen
 *
 * Wat het overneemt:
 *   - de prijs van elk item
 *   - "even op" (available: false) als OrderBilly het als niet beschikbaar toont
 *   - nieuwe producten: die komen onderaan hun categorie bij
 *   - producten die van OrderBilly verdwenen zijn: die gaan eraf
 *   - het bier van de maand ("BVDM ..." in de PROMO van OrderBilly)
 *
 * Wat het NIET aanraakt: alcoholpercentages, brouwerijen, stijlen, tags, notities
 * en de opgekuiste namen. Die staan enkel in menu.yaml en blijven staan.
 *
 * Koppelen gebeurt op naam. Heet iets op de site anders dan op OrderBilly
 * (bv. "Lagavulin" tegenover "Lagavullin"), zet dan bij dat item:
 *     orderbilly: 'Lagavullin 16 jaar'
 * Een item dat níét op OrderBilly staat maar toch moet blijven:
 *     orderbilly: false
 *
 * Het bestand wordt regel per regel aangepast, zodat alle uitleg en opmaak in
 * menu.yaml blijft staan.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { load } from 'js-yaml';

const SLUG = 'de-omgekeerde-wereld';
const API = 'https://api.orderbilly.com/api';
const MENU_FILE = fileURLToPath(new URL('../content/menu.yaml', import.meta.url));
const HIGHLIGHTS_FILE = fileURLToPath(new URL('../content/highlights.yaml', import.meta.url));
const CHECK_ONLY = process.argv.includes('--check');

/** Categorieën van OrderBilly → categorie op de site. */
const CATEGORY_MAP = {
  PROMO: 'promo',
  BIER: 'bier',
  ALCOHOLVRIJ: 'alcoholvrij',
  FRISDRANK: 'frisdrank',
  WARM: 'warm',
  SPRITZ: 'spritz',
  APERO: 'apero',
  COCKTAILS: 'cocktails',
  RUM: 'rum',
  'ANDERE SPIRITS': 'spirits',
  SHOTS: 'shots',
  ETEN: 'eten',
};
/** Lijstjes die op de site een tag zijn, geen eigen categorie. */
const TAG_LISTS = new Set(['LOKAAL', "FAVO'S"]);

const BEER_STYLES = new Set([
  'pils', 'blond', 'tripel', 'trappist', 'ipa', 'bruin', 'wit', 'fruit',
  'geuze', 'stout', 'cider', 'amber',
]);

/* ---------------------------------------------------------------- helpers */

const norm = (s) =>
  String(s)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\*\*/g, '')
    .replace(/\(.*?\)/g, '')
    .replace(/^\s*op tap\s+/, '')
    .replace(/[^a-z0-9+]+/g, ' ')
    .trim();

const slug = (s) =>
  norm(s).replace(/\+/g, ' plus ').trim().replace(/\s+/g, '-').replace(/-+/g, '-');

const quote = (s) => `'${String(s).replace(/'/g, "''")}'`;
const money = (n) => Number(n).toFixed(2);

/** "**OP TAP La Chouffe (blond)**" → { name: "La Chouffe", style: "blond", tap: true } */
function cleanName(raw) {
  let name = String(raw)
    .replace(/\*+/g, '')
    .replace(/\s+:/g, ':')
    .replace(/\s+/g, ' ')
    .trim();
  const tap = /^op tap\s+/i.test(name);
  name = name.replace(/^op tap\s+/i, '');
  let style;
  const paren = name.match(/\s*\(([^)]*)\)\s*$/);
  if (paren && BEER_STYLES.has(paren[1].trim().toLowerCase())) {
    style = paren[1].trim().toLowerCase();
    name = name.slice(0, paren.index).trim();
  }
  return { name, style, tap };
}

async function getJson(url) {
  const response = await fetch(url, {
    headers: { accept: 'application/json', 'user-agent': 'deomgekeerdewereld-site-sync' },
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) throw new Error(`${url} gaf HTTP ${response.status}`);
  return response.json();
}

/* ------------------------------------------------------- OrderBilly lezen */

async function fetchOrderBilly() {
  const { data: slugData } = await getJson(`${API}/slugs/${SLUG}`);
  const eventIds = (slugData?.events ?? []).map((e) => e.event_id);
  if (eventIds.length === 0) throw new Error('OrderBilly geeft geen kaarten terug.');

  /** naam (genormaliseerd) → { raw, price, available, category } */
  const products = new Map();
  const tagLists = new Map([...TAG_LISTS].map((t) => [t, new Set()]));
  /** naam (genormaliseerd) → alle categorieën waarin het op OrderBilly staat */
  const inCategory = new Map();

  for (const id of eventIds) {
    const { data } = await getJson(`${API}/events/${id}/menu`);
    for (const group of data?.category_groups ?? []) {
      for (const cat of group.categories ?? []) {
        const catName = String(cat.name).trim().toUpperCase();
        for (const p of cat.products ?? []) {
          const key = norm(p.name);
          if (TAG_LISTS.has(catName)) tagLists.get(catName).add(key);
          const category = CATEGORY_MAP[catName];
          if (category) {
            if (!inCategory.has(key)) inCategory.set(key, new Set());
            inCategory.get(key).add(category);
          }
          const existing = products.get(key);
          // De eigen categorie (bv. BIER) wint van een lijstje als FAVO'S.
          if (!existing || (!existing.category && category)) {
            products.set(key, {
              raw: p.name,
              price: Number(p.price),
              available: p.is_available !== false,
              category,
            });
          }
        }
      }
    }
  }

  if (products.size < 50) {
    throw new Error(`OrderBilly geeft maar ${products.size} producten. Te weinig, ik raak niks aan.`);
  }
  return { products, tagLists, inCategory };
}

/* ------------------------------------------------------ menu.yaml lezen */

function splitLines(text) {
  const eol = text.includes('\r\n') ? '\r\n' : '\n';
  return { lines: text.split(/\r?\n/), eol };
}

/** Zoekt de blokjes "  - id: ..." met hun regels eronder. */
function findBlocks(lines) {
  const blocks = [];
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^ {2}- id: *(\S+)\s*$/);
    if (!m) continue;
    let end = i + 1;
    while (end < lines.length && /^ {4}\S/.test(lines[end])) end++;
    blocks.push({ id: m[1].replace(/^['"]|['"]$/g, ''), start: i, end });
  }
  return blocks;
}

/* ---------------------------------------------------------------- sync */

async function main() {
  const { products, tagLists, inCategory } = await fetchOrderBilly();

  const menuText = readFileSync(MENU_FILE, 'utf8');
  const menu = load(menuText);
  const items = menu.items ?? [];
  const { lines, eol } = splitLines(menuText);

  const changes = [];
  const matchedKeys = new Set();
  const removeIds = new Set();
  /** id → { price?, available? } */
  const updates = new Map();

  // Het bier van de maand staat in PROMO als "BVDM <naam>".
  let bvdm;
  for (const [key, p] of products) {
    if (/^bvdm\s/.test(key)) {
      bvdm = { name: cleanName(p.raw.replace(/^\s*\**\s*bvdm\s+/i, '')).name, price: p.price };
      matchedKeys.add(key);
    }
  }

  for (const item of items) {
    if (item.orderbilly === false) continue;
    const aliases = [item.name, ...[item.orderbilly ?? []].flat()].map(norm);
    // Een promo op de site is een aparte aanbieding: die moet ook in PROMO staan,
    // anders telt het gewone bierke met dezelfde naam als "nog op OrderBilly".
    const key = aliases.find(
      (a) => products.has(a) && (item.category !== 'promo' || inCategory.get(a)?.has('promo')),
    );
    if (!key) {
      removeIds.add(item.id);
      changes.push(`weg: ${item.name} (staat niet meer op OrderBilly)`);
      continue;
    }
    matchedKeys.add(key);
    const p = products.get(key);
    const update = {};
    if (typeof item.price === 'number' && Math.abs(item.price - p.price) > 0.001) {
      update.price = p.price;
      changes.push(`prijs: ${item.name} € ${money(item.price)} → € ${money(p.price)}`);
    }
    const isAvailable = item.available !== false;
    if (isAvailable !== p.available) {
      update.available = p.available;
      changes.push(`${p.available ? 'terug' : 'even op'}: ${item.name}`);
    }
    if (Object.keys(update).length) updates.set(item.id, update);
  }

  // Nieuwe producten: enkel uit een eigen categorie, niet uit FAVO'S of LOKAAL alleen.
  const takenIds = new Set(items.map((i) => i.id));
  const additions = [];
  for (const [key, p] of products) {
    if (matchedKeys.has(key) || !p.category) continue;
    const { name, style, tap } = cleanName(p.raw);
    let id = slug(name) || `item-${additions.length + 1}`;
    for (let n = 2; takenIds.has(id); n++) id = `${slug(name)}-${n}`;
    takenIds.add(id);
    const tags = [];
    if (tap) tags.push('op-tap');
    if (p.category === 'alcoholvrij') tags.push('alcoholvrij');
    if (p.category === 'promo') tags.push('promo');
    if (tagLists.get('LOKAAL')?.has(key)) tags.push('lokaal');
    if (tagLists.get("FAVO'S")?.has(key)) tags.push('favo');
    const block = [
      `  - id: ${id}`,
      `    name: ${quote(name)}`,
      `    category: ${p.category}`,
      `    price: ${money(p.price)}`,
      ...(style && p.category === 'bier' ? [`    style: ${style}`] : []),
      ...(p.available ? [] : ['    available: false']),
      ...(name !== p.raw.trim() ? [`    orderbilly: ${quote(p.raw.trim())}`] : []),
      ...(tags.length ? [`    tags: [${tags.join(', ')}]`] : []),
    ];
    additions.push({ category: p.category, block });
    changes.push(`nieuw: ${name} (${p.category}, € ${money(p.price)})`);
  }

  /* ---- Bier van de maand ---- */
  const highlightsText = readFileSync(HIGHLIGHTS_FILE, 'utf8');
  const highlights = load(highlightsText);
  let newHighlights = highlightsText;
  if (bvdm) {
    const current = highlights.beerOfTheMonth ?? {};
    // Zoek het bier op de kaart: "Corona" → "Corona Extra".
    const target = norm(bvdm.name);
    const beer =
      items.find((i) => i.category === 'bier' && norm(i.name) === target) ??
      items.find((i) => i.category === 'bier' && norm(i.name).startsWith(`${target} `));
    const name = beer?.name ?? bvdm.name;
    const sameBeer = norm(current.name ?? '') === norm(name);
    const month = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/Brussels',
      year: 'numeric',
      month: '2-digit',
    }).format(new Date());

    if (!sameBeer || Math.abs((current.price ?? 0) - bvdm.price) > 0.001) {
      changes.push(
        sameBeer
          ? `bier van de maand: prijs € ${money(bvdm.price)}`
          : `bier van de maand: ${current.name ?? '—'} → ${name}`,
      );
      const style = beer?.style ?? (sameBeer ? current.style : undefined);
      const block = [
        'beerOfTheMonth:',
        `  name: ${quote(name)}`,
        ...((beer?.brewery ?? (sameBeer ? current.brewery : undefined))
          ? [`  brewery: ${quote(beer?.brewery ?? current.brewery)}`]
          : []),
        ...(style ? [`  style: ${quote(style[0].toUpperCase() + style.slice(1))}`] : []),
        ...((beer?.abv ?? (sameBeer ? current.abv : undefined)) !== undefined
          ? [`  abv: ${Number(beer?.abv ?? current.abv).toFixed(1)}`]
          : []),
        `  price: ${money(bvdm.price)}`,
        `  month: '${sameBeer && current.month ? current.month : month}'`,
        // Een nieuw bier krijgt geen verzonnen tekstje: dat schrijft ge zelf.
        ...(sameBeer && current.blurb
          ? ['  blurb: >-', `    ${current.blurb}`]
          : []),
        ...(sameBeer && current.blurbEn
          ? ['  blurbEn: >-', `    ${current.blurbEn}`]
          : []),
      ];
      const { lines: hl, eol: heol } = splitLines(highlightsText);
      const start = hl.findIndex((l) => /^beerOfTheMonth:\s*$/.test(l));
      if (start === -1) throw new Error('highlights.yaml mist "beerOfTheMonth:".');
      let end = start + 1;
      while (end < hl.length && (/^ {2}/.test(hl[end]) || hl[end].trim() === '')) end++;
      // Lege regels onderaan het blok laten we staan.
      while (end > start + 1 && hl[end - 1].trim() === '') end--;
      hl.splice(start, end - start, ...block);
      newHighlights = hl.join(heol);

      // Het labeltje "bier van de maand" verhuist mee op de kaart.
      for (const item of items) {
        const has = Boolean(item.tags?.includes('bier-van-de-maand'));
        const should = beer && item.id === beer.id;
        if (has !== Boolean(should)) {
          const u = updates.get(item.id) ?? {};
          u.tags = should
            ? [...(item.tags ?? []), 'bier-van-de-maand']
            : item.tags.filter((t) => t !== 'bier-van-de-maand');
          updates.set(item.id, u);
        }
      }
    }
  }

  if (changes.length === 0) {
    console.log('De kaart is al gelijk met OrderBilly. Niks te doen.');
    return;
  }

  console.log(`${changes.length} wijziging(en) van OrderBilly:`);
  for (const c of changes) console.log(`  - ${c}`);
  if (CHECK_ONLY) return;

  /* ---- menu.yaml herschrijven, van onder naar boven ---- */
  const blocks = findBlocks(lines);
  const lastOfCategory = new Map();
  for (const b of blocks) {
    const cat = lines
      .slice(b.start, b.end)
      .map((l) => l.match(/^ {4}category: *(\S+)/)?.[1])
      .find(Boolean);
    if (cat && !removeIds.has(b.id)) lastOfCategory.set(cat, b.end);
  }
  const lastItemEnd = blocks.length ? blocks[blocks.length - 1].end : lines.length;

  /** regelnummer → regels die erna moeten komen */
  const inserts = new Map();
  for (const a of additions) {
    const at = lastOfCategory.get(a.category) ?? lastItemEnd;
    inserts.set(at, [...(inserts.get(at) ?? []), ...a.block]);
  }

  const out = [];
  const blockAt = new Map(blocks.map((b) => [b.start, b]));
  for (let i = 0; i <= lines.length; i++) {
    if (inserts.has(i)) out.push(...inserts.get(i));
    if (i === lines.length) break;

    const b = blockAt.get(i);
    if (!b) {
      out.push(lines[i]);
      continue;
    }
    const body = lines.slice(b.start, b.end);
    i = b.end - 1;
    if (removeIds.has(b.id)) continue;

    const u = updates.get(b.id);
    if (!u) {
      out.push(...body);
      continue;
    }
    let result = body;
    if (u.price !== undefined) {
      result = result.map((l) => (/^ {4}price:/.test(l) ? `    price: ${money(u.price)}` : l));
    }
    if (u.available !== undefined) {
      result = result.filter((l) => !/^ {4}available:/.test(l));
      if (!u.available) {
        const at = result.findIndex((l) => /^ {4}price:/.test(l));
        result.splice(at === -1 ? result.length : at + 1, 0, '    available: false');
      }
    }
    if (u.tags !== undefined) {
      result = result.filter((l) => !/^ {4}tags:/.test(l));
      if (u.tags.length) result.push(`    tags: [${u.tags.join(', ')}]`);
    }
    out.push(...result);
  }

  // Datum van de laatste aanpassing bovenaan de kaart.
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Brussels' }).format(new Date());
  const updatedAt = out.findIndex((l) => /^updated:/.test(l));
  if (updatedAt !== -1) out[updatedAt] = `updated: '${today}'`;

  const newMenu = out.join(eol);
  // Zekerheid: de nieuwe YAML moet nog leesbaar zijn, anders schrijven we niks weg.
  load(newMenu);
  load(newHighlights);

  writeFileSync(MENU_FILE, newMenu);
  if (newHighlights !== highlightsText) writeFileSync(HIGHLIGHTS_FILE, newHighlights);
  console.log('content/menu.yaml en content/highlights.yaml bijgewerkt.');
}

main().catch((error) => {
  console.error(`[orderbilly] ${error.message}`);
  process.exit(1);
});

/**
 * Rekent het kleurcontrast na, rechtstreeks uit src/styles/tokens.css.
 *
 * Waarom dit bestaat: de site heeft een nacht- en een dagthema. Een kleur die
 * mooi is op zwart kan onleesbaar zijn op crème. Dit script betrapt dat vóór
 * het online staat, in plaats van erna.
 *
 * Draaien:  node scripts/check-contrast.mjs
 *
 * Norm: WCAG 2.2 AA — 4,5:1 voor gewone tekst, 3:1 voor grote tekst,
 * randen van knoppen en invulvelden, en betekenisdragende bolletjes.
 */

import { readFileSync } from 'node:fs';

const CSS = readFileSync(new URL('../src/styles/tokens.css', import.meta.url), 'utf8');

/* ------------------------------------------------------------------ */
/* Kleurgereedschap                                                    */
/* ------------------------------------------------------------------ */

function hexToRgb(hex) {
  let h = hex.trim().replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function relLuminance([r, g, b]) {
  const f = (v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function contrast(a, b) {
  const l1 = relLuminance(a);
  const l2 = relLuminance(b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

/** Bootst color-mix(in srgb, A pct%, B) na. */
function mix(a, b, pct) {
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  return A.map((v, i) => Math.round(v * pct + B[i] * (1 - pct)));
}

/* ------------------------------------------------------------------ */
/* Tokens uit de CSS halen                                             */
/* ------------------------------------------------------------------ */

/** Leest de tokens uit één blok, herkend aan de selector. */
function readBlock(selectorFragment) {
  const start = CSS.indexOf(selectorFragment);
  if (start === -1) throw new Error(`Blok niet gevonden: ${selectorFragment}`);
  const open = CSS.indexOf('{', start);
  let depth = 0;
  let end = open;
  for (let i = open; i < CSS.length; i++) {
    if (CSS[i] === '{') depth++;
    if (CSS[i] === '}') {
      depth--;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }
  const body = CSS.slice(open, end);
  const tokens = {};
  for (const m of body.matchAll(/(--[\w-]+)\s*:\s*(#[0-9a-fA-F]{3,8})\s*;/g)) {
    tokens[m[1]] = m[2];
  }
  return tokens;
}

const THEMES = {
  nacht: readBlock(":root[data-theme='nacht']"),
  dag: readBlock(":root[data-theme='dag']"),
};

/* ------------------------------------------------------------------ */
/* Wat er gecontroleerd wordt                                          */
/* ------------------------------------------------------------------ */

/** [voorgrond, achtergrond, minimum, omschrijving] */
const PAIRS = [
  ['--ink', '--bg', 4.5, 'gewone tekst op de pagina'],
  ['--ink', '--bg-raised', 4.5, 'tekst op een kaart'],
  ['--ink', '--bg-sunk', 4.5, 'tekst in de voettekst'],
  ['--ink-soft', '--bg', 4.5, 'inleidingen'],
  ['--ink-soft', '--bg-raised', 4.5, 'inleidingen op een kaart'],
  ['--ink-soft', '--bg-sunk', 4.5, 'inleidingen in de voettekst'],
  ['--ink-faint', '--bg', 4.5, 'bijschriften'],
  ['--ink-faint', '--bg-raised', 4.5, 'bijschriften op een kaart'],
  ['--ink-faint', '--bg-sunk', 4.5, 'bijschriften in de voettekst'],
  ['--accent-text', '--bg', 4.5, 'links en labels'],
  ['--accent-text', '--bg-raised', 4.5, 'links op een kaart'],
  ['--accent-text', '--bg-sunk', 4.5, 'links in de voettekst'],
  ['--amber', '--bg', 4.5, 'waarschuwing "bijna sluitingstijd"'],
  ['--rose', '--bg', 4.5, 'accentkleur'],
  ['--accent-ink', '--accent', 4.5, 'tekst op een gele knop'],
  ['--line-strong', '--bg', 3, 'rand van een knop'],
  ['--line-strong', '--bg-raised', 3, 'rand op een kaart'],
  ['--line-strong', '--bg-inset', 3, 'rand van een invulveld'],
  ['--open-dot', '--bg', 3, 'het bolleke als het open is'],
  ['--closed-dot', '--bg', 3, 'het bolleke als het toe is'],
  ['--focus-ring', '--bg', 3, 'het focuskader'],
];

/** color-mix-achtergronden die de paginas echt gebruiken. */
const MIXED = [
  {
    label: 'bier van de maand (amber 8% op raised)',
    bg: (t) => mix(t['--amber'], t['--bg-raised'], 0.08),
    fgs: [
      ['--ink', 4.5],
      ['--ink-soft', 4.5],
      ['--accent-text', 4.5],
    ],
  },
  {
    label: 'tegel bij hover (accent 6% op raised)',
    bg: (t) => mix(t['--accent'], t['--bg-raised'], 0.06),
    fgs: [
      ['--ink', 4.5],
      ['--ink-faint', 4.5],
    ],
  },
  {
    label: 'ghost-knop bij hover (accent 8% op bg)',
    bg: (t) => mix(t['--accent'], t['--bg'], 0.08),
    fgs: [
      ['--accent-text', 4.5],
      ['--ink', 4.5],
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Uitvoeren                                                           */
/* ------------------------------------------------------------------ */

const failures = [];
let checks = 0;

for (const [themeName, tokens] of Object.entries(THEMES)) {
  console.log(`\n--- ${themeName} ---`);

  for (const [fg, bg, min, what] of PAIRS) {
    if (!tokens[fg] || !tokens[bg]) {
      failures.push(`${themeName}: token ontbreekt (${!tokens[fg] ? fg : bg})`);
      continue;
    }
    const r = contrast(hexToRgb(tokens[fg]), hexToRgb(tokens[bg]));
    checks++;
    const ok = r >= min;
    if (!ok) failures.push(`${themeName}: ${fg} op ${bg} = ${r.toFixed(2)}, moet ${min} zijn (${what})`);
    console.log(
      `  ${ok ? 'ok  ' : 'FOUT'} ${r.toFixed(2).padStart(5)} (min ${min})  ${fg} op ${bg}  — ${what}`,
    );
  }

  for (const entry of MIXED) {
    const bgArr = entry.bg(tokens);
    const bgHex = '#' + bgArr.map((v) => v.toString(16).padStart(2, '0')).join('');
    for (const [fg, min] of entry.fgs) {
      const r = contrast(hexToRgb(tokens[fg]), bgArr);
      checks++;
      const ok = r >= min;
      if (!ok) {
        failures.push(
          `${themeName}: ${fg} op ${entry.label} (${bgHex}) = ${r.toFixed(2)}, moet ${min} zijn`,
        );
      }
      console.log(
        `  ${ok ? 'ok  ' : 'FOUT'} ${r.toFixed(2).padStart(5)} (min ${min})  ${fg} op ${entry.label}`,
      );
    }
  }
}

console.log(`\n${checks} combinaties nagerekend.`);

if (failures.length) {
  console.log('\nPROBLEMEN:');
  for (const f of failures) console.log('  x', f);
  console.log(
    '\nPas de kleur aan in src/styles/tokens.css. Vergeet het blok voor de\n' +
      'systeemvoorkeur (@media prefers-color-scheme: light) niet: dat moet\n' +
      'dezelfde waarden hebben als het dagthema.\n',
  );
  process.exit(1);
}

console.log('Alle kleurcombinaties halen WCAG AA, in beide themas.\n');

/**
 * Controleert de uren-logica op de randgevallen die er echt toe doen:
 * sluiten na middernacht, een uitzondering op een feestdag, en de
 * zomer/wintertijd. Draaien met:  node scripts/test-hours.mjs
 */

import { load } from 'js-yaml';
import { readFileSync } from 'node:fs';
import {
  getStatus,
  resolveDay,
  brusselsNow,
  toSchemaOpeningHours,
} from '../src/lib/hours.ts';

const hours = load(readFileSync(new URL('../content/hours.yaml', import.meta.url), 'utf8'));

let failed = 0;
let passed = 0;

function check(name, actual, expected) {
  const ok = actual === expected;
  if (ok) {
    passed++;
  } else {
    failed++;
    console.log(`  x ${name}\n      verwacht: ${expected}\n      gekregen: ${actual}`);
  }
}

/** Een moment in Gentse tijd. Maand is 1-gebaseerd. */
function brussels(y, m, d, hh, mm = 0) {
  // Zoek de UTC-tijd die in Brussel op deze wandklok uitkomt.
  for (const offset of [0, 1, 2]) {
    const guess = new Date(Date.UTC(y, m - 1, d, hh - offset, mm));
    const b = brusselsNow(guess);
    if (
      b.year === y &&
      b.month === m &&
      b.day === d &&
      b.minutes === hh * 60 + mm
    ) {
      return guess;
    }
  }
  throw new Error(`Kan geen UTC vinden voor ${y}-${m}-${d} ${hh}:${mm} in Brussel`);
}

console.log('\nUren-logica\n');

/* ---- 1. Gewone dinsdag: open 14:00, toe 02:00 ---- */
console.log('Dinsdag 15 september 2026 (open 14:00 - 02:00)');
check('13:30 is toe', getStatus(hours, brussels(2026, 9, 15, 13, 30)).isOpen, false);
check(
  '13:30 zegt wanneer hij opent',
  getStatus(hours, brussels(2026, 9, 15, 13, 30)).label,
  'Opent om 14:00',
);
check('14:00 is open', getStatus(hours, brussels(2026, 9, 15, 14, 0)).isOpen, true);
check('23:00 is open', getStatus(hours, brussels(2026, 9, 15, 23, 0)).isOpen, true);

/* ---- 2. Na middernacht hoort bij de avond ervoor ---- */
console.log('\nNacht van dinsdag op woensdag');
check(
  '00:30 woensdag is nog altijd open',
  getStatus(hours, brussels(2026, 9, 16, 0, 30)).isOpen,
  true,
);
check(
  '01:30 is bijna sluitingstijd',
  getStatus(hours, brussels(2026, 9, 16, 1, 30)).closingSoon,
  true,
);
check(
  '02:00 is toe',
  getStatus(hours, brussels(2026, 9, 16, 2, 0)).isOpen,
  false,
);
check(
  '03:00 is toe en wacht op 14:00',
  getStatus(hours, brussels(2026, 9, 16, 3, 0)).label,
  'Opent om 14:00',
);

/* ---- 3. Vrijdagnacht loopt door tot 04:00 ---- */
console.log('\nVrijdag 18 september 2026 (toe om 04:00)');
check(
  'zaterdag 03:00 is nog open (vrijdagnacht)',
  getStatus(hours, brussels(2026, 9, 19, 3, 0)).isOpen,
  true,
);
check(
  'zaterdag 04:30 is toe',
  getStatus(hours, brussels(2026, 9, 19, 4, 30)).isOpen,
  false,
);

/* ---- 4. Uitzonderingen winnen van de vaste week ---- */
console.log('\nFeestdagen');
check(
  '25 december staat als gesloten',
  resolveDay(hours, '2026-12-25').closed,
  true,
);
check(
  '25 december om 20:00 is toe',
  getStatus(hours, brussels(2026, 12, 25, 20, 0)).isOpen,
  false,
);
check(
  '24 december om 19:00 is nog open (tot 20:00)',
  getStatus(hours, brussels(2026, 12, 24, 19, 0)).isOpen,
  true,
);
check(
  '24 december om 21:00 is toe',
  getStatus(hours, brussels(2026, 12, 24, 21, 0)).isOpen,
  false,
);
check(
  '25 december wijst naar de volgende open dag',
  getStatus(hours, brussels(2026, 12, 25, 20, 0)).label,
  'Opent zaterdag om 14:00',
);

/* ---- 5. Oudejaar sluit om 05:00, dus nieuwjaar 04:00 is nog open ---- */
console.log('\nOudejaar');
check(
  '1 januari 04:00 is nog open (oudejaarsnacht)',
  getStatus(hours, brussels(2027, 1, 1, 4, 0)).isOpen,
  true,
);
check(
  '1 januari 06:00 is toe',
  getStatus(hours, brussels(2027, 1, 1, 6, 0)).isOpen,
  false,
);
check(
  '1 januari 19:00 is open (uitzondering 18:00 - 03:00)',
  getStatus(hours, brussels(2027, 1, 1, 19, 0)).isOpen,
  true,
);

/* ---- 6. Zomer- en wintertijd ---- */
console.log('\nZomer- en wintertijd');
check(
  'zomertijd: 23:00 in juli is open',
  getStatus(hours, brussels(2026, 7, 15, 23, 0)).isOpen,
  true,
);
check(
  'wintertijd: 23:00 in januari is open',
  getStatus(hours, brussels(2027, 1, 15, 23, 0)).isOpen,
  true,
);
check(
  'zomertijd: 13:00 in juli is toe',
  getStatus(hours, brussels(2026, 7, 15, 13, 0)).isOpen,
  false,
);

/* ---- 7. Engels ---- */
console.log('\nEngelse labels');
check(
  'open in het Engels',
  getStatus(hours, brussels(2026, 9, 15, 20, 0), 'en').label,
  'Open now',
);
check(
  'toe in het Engels',
  getStatus(hours, brussels(2026, 9, 15, 10, 0), 'en').label,
  'Opens at 14:00',
);

/* ---- 8. schema.org ---- */
console.log('\nGestructureerde data');
const spec = toSchemaOpeningHours(hours);
check('drie groepen uren', spec.length, 3);
check(
  'alle zeven dagen komen voor',
  spec.reduce((n, g) => n + g.dayOfWeek.length, 0),
  7,
);

/* ---- Verslag ---- */
console.log(`\n${passed} geslaagd, ${failed} gezakt\n`);
process.exit(failed > 0 ? 1 : 0);

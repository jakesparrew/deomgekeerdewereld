/**
 * Opmaak van prijzen en datums, Belgisch: komma's, geen punten.
 */

import { TIMEZONE } from './hours';

/** 2.7 -> "€ 2,70"  |  55 -> "€ 55,00" */
export function euro(value: number): string {
  return `€ ${value.toFixed(2).replace('.', ',')}`;
}

/** 2.7 -> "2,70" (zonder symbool, voor tabellen met een eigen kolomkop) */
export function euroPlain(value: number): string {
  return value.toFixed(2).replace('.', ',');
}

/** Voor JSON-LD en <data value="">: altijd punt. */
export function euroMachine(value: number): string {
  return value.toFixed(2);
}

const NL_DAYS = [
  'zondag',
  'maandag',
  'dinsdag',
  'woensdag',
  'donderdag',
  'vrijdag',
  'zaterdag',
];

const NL_MONTHS = [
  'januari',
  'februari',
  'maart',
  'april',
  'mei',
  'juni',
  'juli',
  'augustus',
  'september',
  'oktober',
  'november',
  'december',
];

/**
 * "2026-10-03T21:00" wordt gelezen als lokale Gentse tijd.
 * We bouwen de Date expliciet op zodat de server-tijdzone er niet toe doet.
 */
export function parseLocalDateTime(value: string): Date {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/);
  if (!match) return new Date(`${value}`);
  const [, y, m, d, hh = '00', mm = '00'] = match;
  return new Date(
    Date.UTC(
      Number.parseInt(y, 10),
      Number.parseInt(m, 10) - 1,
      Number.parseInt(d, 10),
      Number.parseInt(hh, 10),
      Number.parseInt(mm, 10),
    ),
  );
}

/** "vrijdag 3 oktober" */
export function formatDateNL(value: string, opts: { withYear?: boolean } = {}): string {
  const dt = parseLocalDateTime(value);
  const day = NL_DAYS[dt.getUTCDay()];
  const month = NL_MONTHS[dt.getUTCMonth()];
  const base = `${day} ${dt.getUTCDate()} ${month}`;
  return opts.withYear ? `${base} ${dt.getUTCFullYear()}` : base;
}

/** "Friday 3 October" */
export function formatDateEN(value: string, opts: { withYear?: boolean } = {}): string {
  const dt = parseLocalDateTime(value);
  const fmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'UTC',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    ...(opts.withYear ? { year: 'numeric' } : {}),
  });
  return fmt.format(dt);
}

export function formatDate(value: string, lang: 'nl' | 'en', withYear = false): string {
  return lang === 'en'
    ? formatDateEN(value, { withYear })
    : formatDateNL(value, { withYear });
}

/** "21:00" */
export function formatTime(value: string): string {
  const match = value.match(/T(\d{2}):(\d{2})/);
  return match ? `${match[1]}:${match[2]}` : '';
}

/** "3 okt" — kort, voor de datumblokjes op de agenda. */
export function formatDayBadge(value: string, lang: 'nl' | 'en') {
  const dt = parseLocalDateTime(value);
  const monthFmt = new Intl.DateTimeFormat(lang === 'en' ? 'en-GB' : 'nl-BE', {
    timeZone: 'UTC',
    month: 'short',
  });
  return {
    day: String(dt.getUTCDate()),
    month: monthFmt.format(dt).replace('.', ''),
  };
}

/**
 * ISO-8601 mét de juiste offset voor Gent, voor schema.org en <time datetime>.
 * Levert bv. "2026-10-03T21:00:00+02:00".
 */
export function toIsoWithBrusselsOffset(value: string): string {
  const naive = parseLocalDateTime(value);
  // Zoek de offset door de "wandklok" in Brussel te vergelijken met UTC.
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: TIMEZONE,
    timeZoneName: 'longOffset',
  });
  const part = fmt
    .formatToParts(naive)
    .find((p) => p.type === 'timeZoneName')?.value;
  const offset = part?.replace('GMT', '') || '+01:00';
  const normalised = offset === '' ? '+00:00' : offset;
  const stamp = naive.toISOString().slice(0, 19);
  return `${stamp}${normalised}`;
}

/** "gratis" of "€ 5,00" */
export function priceLabel(
  price: number | undefined,
  lang: 'nl' | 'en',
): string {
  if (!price) return lang === 'en' ? 'Free' : 'Gratis';
  return euro(price);
}

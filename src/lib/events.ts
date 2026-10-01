/**
 * Agenda-logica: terugkerende events uitrekenen, verleden en toekomst splitsen.
 */

import type { EventEntry, EventsData, RecurringEvent } from '../data/types';
import { parseLocalDateTime } from './format';
import { brusselsNow } from './hours';

export interface ResolvedEvent extends EventEntry {
  /** Uit een terugkerende regel gegenereerd, niet handmatig ingevoerd. */
  generated?: boolean;
}

/** Datum van de n-de weekdag van een maand. ordinal -1 = de laatste. */
function nthWeekdayOfMonth(
  year: number,
  month: number,
  weekday: number,
  ordinal: number,
): Date {
  if (ordinal > 0) {
    const first = new Date(Date.UTC(year, month, 1));
    const shift = (weekday - first.getUTCDay() + 7) % 7;
    return new Date(Date.UTC(year, month, 1 + shift + (ordinal - 1) * 7));
  }
  const last = new Date(Date.UTC(year, month + 1, 0));
  const shift = (last.getUTCDay() - weekday + 7) % 7;
  return new Date(Date.UTC(year, month + 1, 0 - shift));
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

/**
 * Zet een terugkerende regel om in echte datums, vanaf `from`.
 * We kijken standaard zes maanden vooruit; dat is ruim genoeg voor een agenda.
 */
export function expandRecurring(
  rule: RecurringEvent,
  from: Date,
  months = 6,
): ResolvedEvent[] {
  if (rule.rule !== 'monthly-weekday') return [];

  const out: ResolvedEvent[] = [];
  const startYear = from.getUTCFullYear();
  const startMonth = from.getUTCMonth();

  for (let i = 0; i < months; i++) {
    const year = startYear + Math.floor((startMonth + i) / 12);
    const month = (startMonth + i) % 12;
    const date = nthWeekdayOfMonth(year, month, rule.weekday, rule.ordinal);
    const isoDate = `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(
      date.getUTCDate(),
    )}`;
    const start = `${isoDate}T${rule.time}`;

    if (parseLocalDateTime(start).getTime() < from.getTime() - 6 * 3600 * 1000) {
      continue;
    }

    // Overgeslagen datums, bv. omdat het café die dag later opent.
    if (rule.skip?.includes(isoDate)) continue;

    out.push({
      id: `${rule.id}-${isoDate}`,
      title: rule.title,
      titleEn: rule.titleEn,
      start,
      type: rule.type,
      price: rule.price,
      description: rule.description,
      descriptionEn: rule.descriptionEn,
      link: rule.link,
      image: rule.image,
      imageAlt: rule.imageAlt,
      generated: true,
    });
  }

  return out;
}

/**
 * Een event telt als "voorbij" zodra het zes uur na de starttijd is.
 * Zo blijft het feestje van gisterenavond nog even bovenaan staan.
 */
const GRACE_MS = 6 * 3600 * 1000;

export interface AgendaSplit {
  upcoming: ResolvedEvent[];
  past: ResolvedEvent[];
  next?: ResolvedEvent;
  /** Wat er vandaag te doen is, voor de "Vandaag" strook op de home. */
  today: ResolvedEvent[];
}

export function buildAgenda(data: EventsData, now: Date): AgendaSplit {
  const manual: ResolvedEvent[] = (data.events ?? []).map((e) => ({ ...e }));
  const generated = (data.recurring ?? []).flatMap((r) => expandRecurring(r, now));

  // Een handmatig event wint altijd van een gegenereerd event op dezelfde dag.
  const manualDays = new Set(manual.map((e) => e.start.slice(0, 10)));
  const all = [
    ...manual,
    ...generated.filter((g) => !manualDays.has(g.start.slice(0, 10))),
  ];

  const cutoff = now.getTime() - GRACE_MS;
  const withTime = all.map((e) => ({
    event: e,
    time: parseLocalDateTime(e.start).getTime(),
  }));

  const upcoming = withTime
    .filter((x) => x.time >= cutoff)
    .sort((a, b) => a.time - b.time)
    .map((x) => x.event);

  const past = withTime
    .filter((x) => x.time < cutoff)
    .sort((a, b) => b.time - a.time)
    .map((x) => x.event);

  // De datum zoals ze in Gent op de klok staat, niet in UTC.
  const todayIso = brusselsNow(now).isoDate;
  const today = upcoming.filter((e) => e.start.slice(0, 10) === todayIso);

  return { upcoming, past, next: upcoming[0], today };
}

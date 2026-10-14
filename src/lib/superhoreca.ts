/**
 * Events uit SuperHoreca, opgehaald bij het bouwen.
 *
 * Welke events hier binnenkomen, beslist ge in SuperHoreca zelf: enkel wat
 * daar op de publieke agenda staat, zit in de feed. De site haalt de feed op
 * tijdens de build en zet de events in haar eigen agenda. Een bezoeker legt
 * dus nooit zelf contact met SuperHoreca, en er is geen script of cookie nodig.
 *
 * Omdat het bij het bouwen gebeurt, verschijnt een nieuw event pas na de
 * volgende build. Een geplande taak op GitHub bouwt de site daarom elk uur
 * opnieuw (zie .github/workflows/superhoreca-sync.yml).
 *
 * Is SuperHoreca onbereikbaar, dan bouwt de site gewoon verder met enkel de
 * events uit content/events.yaml, en staat er een waarschuwing in de bouwlog.
 */

import { site } from '../data/site';
import type { EventEntry, EventType } from '../data/types';

interface FeedItem {
  id: string;
  name: string;
  /** JJJJ-MM-DD */
  date: string;
  startTime?: string | null;
  endTime?: string | null;
  text?: string | null;
  category?: string | null;
  color?: string | null;
  link?: string | null;
}

const TIMEOUT_MS = 10_000;

/** Een vrije categorie uit SuperHoreca omzetten naar een labeltje van de site. */
function typeFromCategory(category: string | null | undefined): EventType {
  const c = (category ?? '').toLowerCase();
  if (/sport|voetbal|match|wedstrijd|football|rugby|tennis|wielren/.test(c)) return 'sport';
  if (/concert|live|band|optreden/.test(c)) return 'concert';
  if (/\bdj\b|dj-|dj set/.test(c)) return 'dj';
  if (/quiz/.test(c)) return 'quiz';
  if (/aper/.test(c)) return 'aperomer';
  if (/open.?air|terras/.test(c)) return 'open-air';
  if (/feest|fiesta|party|fuif|fiestje/.test(c)) return 'feest';
  return 'andere';
}

function nextDay(isoDate: string): string {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

const TIME = /^\d{2}:\d{2}$/;

export function toEventEntry(item: FeedItem): EventEntry | undefined {
  if (!item?.id || !item.name || !/^\d{4}-\d{2}-\d{2}$/.test(item.date ?? '')) return undefined;

  const startTime = item.startTime && TIME.test(item.startTime) ? item.startTime : '';
  const endTime = item.endTime && TIME.test(item.endTime) ? item.endTime : '';

  // Zonder uur blijft het enkel een datum; dan toont de site ook geen uur.
  const start = startTime ? `${item.date}T${startTime}` : item.date;
  // Eindigt het vóór het begint, dan is het na middernacht.
  const end =
    startTime && endTime
      ? `${endTime < startTime ? nextDay(item.date) : item.date}T${endTime}`
      : undefined;

  const link = item.link && /^https?:\/\//i.test(item.link) ? item.link : undefined;
  const text = item.text?.trim() || undefined;

  return {
    id: `superhoreca-${item.id}`,
    title: item.name.trim(),
    start,
    end,
    // Geen categorie in SuperHoreca? Dan geeft de titel soms een hint ("Halloweenparty").
    type: item.category?.trim()
      ? typeFromCategory(item.category)
      : typeFromCategory(item.name),
    // SuperHoreca kent geen prijs. Leeg laten zou "gratis" tonen, en dat weten we niet.
    price: null,
    description: text,
    descriptionEn: text,
    link,
  };
}

async function fetchFeed(): Promise<EventEntry[]> {
  const url = site.reservations.agenda?.trim();
  if (!url) return [];

  // De cache van SuperHoreca geeft soms een verouderde, lege lijst terug.
  // Met een wisselend stukje achter de URL krijgen we altijd de verse versie.
  const fresh = new URL(url);
  fresh.searchParams.set('t', String(Date.now()));

  try {
    const response = await fetch(fresh, {
      headers: { accept: 'application/json' },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = (await response.json()) as { items?: FeedItem[] };
    const items = Array.isArray(data.items) ? data.items : [];
    const entries = items.map(toEventEntry).filter((e): e is EventEntry => Boolean(e));
    console.info(`[superhoreca] ${entries.length} event(s) uit de agenda-feed gehaald.`);
    return entries;
  } catch (error) {
    console.warn(
      `[superhoreca] Kon de agenda niet ophalen (${(error as Error).message}). ` +
        'De site bouwt verder met enkel content/events.yaml.',
    );
    return [];
  }
}

export const superhorecaEvents: EventEntry[] = await fetchFeed();

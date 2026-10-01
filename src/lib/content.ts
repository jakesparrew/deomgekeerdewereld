/**
 * Laadt de YAML-bestanden uit /content en geeft ze getypeerd terug.
 * Alles gebeurt bij het bouwen, dus een fout in de YAML breekt de build
 * meteen in plaats van stilletjes op de site te belanden.
 */

// js-yaml 5 is ESM en heeft geen standaardexport meer: enkel benoemde functies.
import { load } from 'js-yaml';

import hoursRaw from '../../content/hours.yaml?raw';
import menuRaw from '../../content/menu.yaml?raw';
import eventsRaw from '../../content/events.yaml?raw';
import highlightsRaw from '../../content/highlights.yaml?raw';
import bovenzaalRaw from '../../content/bovenzaal.yaml?raw';

import type { HoursConfig } from './hours';
import type { BovenzaalData, EventsData, HighlightsData, MenuData } from '../data/types';

function parse<T>(raw: string, name: string): T {
  try {
    const value = load(raw);
    if (!value || typeof value !== 'object') {
      throw new Error('leeg of geen object');
    }
    return value as T;
  } catch (error) {
    throw new Error(
      `Kan content/${name}.yaml niet lezen. Controleer de inspringing.\n${
        (error as Error).message
      }`,
    );
  }
}

export const hours = parse<HoursConfig>(hoursRaw, 'hours');
export const menu = parse<MenuData>(menuRaw, 'menu');
export const events = parse<EventsData>(eventsRaw, 'events');
export const highlights = parse<HighlightsData>(highlightsRaw, 'highlights');
export const bovenzaal = parse<BovenzaalData>(bovenzaalRaw, 'bovenzaal');

/* ---- Kleine controles zodat een typfout meteen opvalt ---- */

if (!Array.isArray(menu.items) || menu.items.length === 0) {
  throw new Error('content/menu.yaml bevat geen items.');
}

const seenMenuIds = new Set<string>();
for (const item of menu.items) {
  if (!item.id) throw new Error(`Kaartitem zonder id: ${item.name ?? '???'}`);
  if (seenMenuIds.has(item.id)) {
    throw new Error(`Dubbele id in content/menu.yaml: "${item.id}"`);
  }
  seenMenuIds.add(item.id);
  if (!item.name) throw new Error(`Kaartitem zonder naam: ${item.id}`);
  if (item.price === undefined && !item.priceLabel) {
    throw new Error(`Kaartitem zonder prijs: ${item.id}`);
  }
}

if (!Array.isArray(events.events)) {
  throw new Error('content/events.yaml mist de lijst "events".');
}

const seenEventIds = new Set<string>();
for (const entry of events.events) {
  if (!entry.id) throw new Error(`Event zonder id: ${entry.title ?? '???'}`);
  if (seenEventIds.has(entry.id)) {
    throw new Error(`Dubbele id in content/events.yaml: "${entry.id}"`);
  }
  seenEventIds.add(entry.id);
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(entry.start)) {
    throw new Error(
      `Event "${entry.id}" heeft een rare startdatum: "${entry.start}". Gebruik 2026-10-03T21:00`,
    );
  }
}

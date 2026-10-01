/**
 * De vorm van alles wat in /content staat.
 * Wijzig je hier iets, pas dan ook de README en de Decap-config aan.
 */

/* ------------------------------------------------------------------ */
/* Kaart                                                               */
/* ------------------------------------------------------------------ */

export const MENU_CATEGORIES = [
  'lokaal',
  'promo',
  'favos',
  'bier',
  'alcoholvrij',
  'frisdrank',
  'warm',
  'spritz',
  'apero',
  'cocktails',
  'rum',
  'spirits',
  'shots',
  'eten',
] as const;

export type MenuCategory = (typeof MENU_CATEGORIES)[number];

export const MENU_CATEGORY_LABELS: Record<MenuCategory, { nl: string; en: string }> = {
  lokaal: { nl: 'Lokaal', en: 'Local' },
  promo: { nl: 'Promo', en: 'Deals' },
  favos: { nl: "Favo's", en: 'Favourites' },
  bier: { nl: 'Bier', en: 'Beer' },
  alcoholvrij: { nl: 'Alcoholvrij', en: 'Alcohol-free' },
  frisdrank: { nl: 'Frisdrank', en: 'Soft drinks' },
  warm: { nl: 'Warme dranken', en: 'Hot drinks' },
  spritz: { nl: 'Spritz', en: 'Spritz' },
  apero: { nl: 'Apero & wijn', en: 'Aperitifs & wine' },
  cocktails: { nl: 'Cocktails', en: 'Cocktails' },
  rum: { nl: 'Rum', en: 'Rum' },
  spirits: { nl: 'Andere spirits', en: 'Other spirits' },
  shots: { nl: 'Shots', en: 'Shots' },
  eten: { nl: 'Eten', en: 'Food' },
};

/** Bierstijlen, om binnen de categorie "bier" te filteren. */
export const BEER_STYLES = [
  'pils',
  'blond',
  'tripel',
  'trappist',
  'ipa',
  'bruin',
  'wit',
  'fruit',
  'geuze',
  'stout',
  'cider',
  'amber',
] as const;

export type BeerStyle = (typeof BEER_STYLES)[number];

export const BEER_STYLE_LABELS: Record<BeerStyle, { nl: string; en: string }> = {
  pils: { nl: 'Pils', en: 'Lager' },
  blond: { nl: 'Blond', en: 'Blonde' },
  tripel: { nl: 'Tripel', en: 'Tripel' },
  trappist: { nl: 'Trappist', en: 'Trappist' },
  ipa: { nl: 'IPA', en: 'IPA' },
  bruin: { nl: 'Bruin & rood', en: 'Brown & red' },
  wit: { nl: 'Wit', en: 'Wheat' },
  fruit: { nl: 'Fruit', en: 'Fruit' },
  geuze: { nl: 'Geuze & lambiek', en: 'Gueuze & lambic' },
  stout: { nl: 'Stout', en: 'Stout' },
  cider: { nl: 'Cider', en: 'Cider' },
  amber: { nl: 'Amber', en: 'Amber' },
};

/** Losse labels die naast de categorie kunnen staan. */
export const MENU_TAGS = [
  'lokaal',
  'promo',
  'favo',
  'trappist',
  'alcoholvrij',
  'op-tap',
  'gents',
  'bier-van-de-maand',
] as const;

export type MenuTag = (typeof MENU_TAGS)[number];

export const MENU_TAG_LABELS: Record<MenuTag, { nl: string; en: string }> = {
  lokaal: { nl: 'Lokaal', en: 'Local' },
  promo: { nl: 'Promo', en: 'Deal' },
  favo: { nl: 'Favoriet', en: 'Favourite' },
  trappist: { nl: 'Trappist', en: 'Trappist' },
  alcoholvrij: { nl: '0,0', en: '0.0' },
  'op-tap': { nl: 'Van het vat', en: 'On tap' },
  gents: { nl: 'Gents', en: 'From Ghent' },
  'bier-van-de-maand': { nl: 'Bier van de maand', en: 'Beer of the month' },
};

export interface MenuItem {
  /** Stabiele sleutel, kleine letters met streepjes. */
  id: string;
  name: string;
  category: MenuCategory;
  /** Prijs in euro. 5 wordt "€ 5,00". Laat leeg voor "gratis" e.d. */
  price?: number;
  /** Vervangt de prijs als er geen getal is, bv. "Gratis" of "Priceless". */
  priceLabel?: string;
  style?: BeerStyle;
  /** Alcoholpercentage, bv. 8.5 */
  abv?: number;
  brewery?: string;
  /** Korte toelichting, bv. "Half St-Germain, half vodka". */
  note?: string;
  /** Engelse toelichting. Ontbreekt die, dan tonen we de Nederlandse. */
  noteEn?: string;
  tags?: MenuTag[];
  /** Tijdelijk uitverkocht? Zet op false; hij blijft staan maar grijs. */
  available?: boolean;
}

export interface MenuData {
  /** Zinnetje bovenaan de kaart. */
  intro?: { nl: string; en: string };
  updated?: string;
  items: MenuItem[];
}

/* ------------------------------------------------------------------ */
/* Agenda                                                              */
/* ------------------------------------------------------------------ */

export const EVENT_TYPES = [
  'concert',
  'dj',
  'quiz',
  'aperomer',
  'feest',
  'open-air',
  'andere',
] as const;

export type EventType = (typeof EVENT_TYPES)[number];

export const EVENT_TYPE_LABELS: Record<EventType, { nl: string; en: string }> = {
  concert: { nl: 'Concert', en: 'Concert' },
  dj: { nl: 'DJ', en: 'DJ' },
  quiz: { nl: 'Quiz', en: 'Quiz' },
  aperomer: { nl: "Aper'Omer", en: "Aper'Omer" },
  feest: { nl: 'Fiestje', en: 'Party' },
  'open-air': { nl: 'Open air', en: 'Open air' },
  andere: { nl: 'Andere', en: 'Other' },
};

export interface EventEntry {
  id: string;
  title: string;
  titleEn?: string;
  /** ISO datum-tijd zonder tijdzone, lokale Gentse tijd: 2026-10-03T21:00 */
  start: string;
  end?: string;
  type: EventType;
  /** Prijs in euro. 0 of weglaten = gratis. */
  price?: number;
  description?: string;
  descriptionEn?: string;
  /** Facebook-event of Instagram-post. */
  link?: string;
  /** Bestand in /public/images/events/ */
  image?: string;
  imageAlt?: string;
}

/**
 * Terugkerende events (bv. Aper'Omer elke eerste vrijdag).
 * De site rekent zelf uit wanneer die vallen.
 */
export interface RecurringEvent {
  id: string;
  title: string;
  titleEn?: string;
  type: EventType;
  /** Voorlopig enkel "monthly-weekday" ondersteund. */
  rule: 'monthly-weekday';
  /** 0 = zondag, 5 = vrijdag */
  weekday: number;
  /** 1 = eerste van de maand, -1 = laatste */
  ordinal: number;
  time: string;
  /**
   * Datums (JJJJ-MM-DD) waarop deze afspraak NIET doorgaat, bijvoorbeeld omdat
   * het café die dag later opent. De site slaat ze gewoon over.
   */
  skip?: string[];
  price?: number;
  description?: string;
  descriptionEn?: string;
  link?: string;
  image?: string;
  imageAlt?: string;
}

export interface EventsData {
  recurring?: RecurringEvent[];
  events: EventEntry[];
}

/* ------------------------------------------------------------------ */
/* Homepage-hoogtepunten                                               */
/* ------------------------------------------------------------------ */

export interface Highlight {
  /** Naam van het icoon in src/components/Icon.astro */
  icon: string;
  label: string;
  labelEn: string;
  value: string;
  valueEn?: string;
  note?: string;
  noteEn?: string;
  href?: string;
  /** Engelse tegenhanger van de link. Ontbreekt die, dan valt hij terug op href. */
  hrefEn?: string;
}

export interface HighlightsData {
  /** De grote foto bovenaan de homepagina. */
  hero: {
    /** Bestandsnaam in /public/images/. Leeg = de plaatshouder blijft staan. */
    image: string;
    alt: string;
    /** Dezelfde beschrijving in het Engels. Ontbreekt die, dan valt hij terug op alt. */
    altEn?: string;
    /** Wat er op de foto moet staan, voor wie hem nog moet nemen. */
    brief: string;
    briefEn?: string;
    headline: string;
    headlineEn: string;
    lead: string;
    leadEn: string;
  };
  beerOfTheMonth: {
    name: string;
    brewery?: string;
    style?: string;
    abv?: number;
    price?: number;
    blurb?: string;
    blurbEn?: string;
    /** YYYY-MM, puur informatief */
    month?: string;
  };
  tiles: Highlight[];
}

/* ------------------------------------------------------------------ */
/* Bovenverdieping                                                     */
/* ------------------------------------------------------------------ */

export interface Bilingual {
  nl: string;
  en: string;
}

export interface BovenzaalData {
  capaciteit: { zittend: number | null; staand: number | null; oppervlakte: number | null };
  prijs: {
    toon: boolean;
    vanaf: number | null;
    eenheid: string;
    note: string;
    noteEn: string;
  };
  inbegrepen: Bilingual[];
  waarvoor: (Bilingual & { icon: string })[];
  praktisch: Bilingual[];
}

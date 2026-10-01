/**
 * Twee talen: Nederlands (met een Gentse tongval in de titels) en Engels.
 * Nederlands staat op /, Engels op /en/.
 */

export type Lang = 'nl' | 'en';

export const LANGS: Lang[] = ['nl', 'en'];
export const DEFAULT_LANG: Lang = 'nl';

/** Elke pagina met zijn tegenhanger in de andere taal. */
export const ROUTES = {
  home: { nl: '/', en: '/en/' },
  menu: { nl: '/kaart/', en: '/en/menu/' },
  agenda: { nl: '/agenda/', en: '/en/events/' },
  about: { nl: '/over/', en: '/en/about/' },
  reserve: { nl: '/reserveren/', en: '/en/bookings/' },
  upstairs: { nl: '/bovenzaal/', en: '/en/upstairs/' },
  contact: { nl: '/contact/', en: '/en/contact/' },
  privacy: { nl: '/privacy/', en: '/privacy/' },
  cookies: { nl: '/cookies/', en: '/cookies/' },
} as const;

export type RouteKey = keyof typeof ROUTES;

export function route(key: RouteKey, lang: Lang): string {
  return ROUTES[key][lang];
}

/** Hoofdnavigatie, in volgorde. */
export const NAV: { key: RouteKey; nl: string; en: string }[] = [
  { key: 'menu', nl: 'De kaart', en: 'Menu' },
  { key: 'agenda', nl: 'Agenda', en: "What's on" },
  { key: 'about', nl: 'Ons verhaal', en: 'Our story' },
  { key: 'upstairs', nl: 'De bovenzaal', en: 'The upstairs' },
  { key: 'reserve', nl: 'Reserveren', en: 'Bookings' },
  { key: 'contact', nl: 'Contact', en: 'Find us' },
];

/** Zoek de tegenhanger van de huidige URL in de andere taal. */
export function alternateUrl(pathname: string, target: Lang): string {
  const clean = pathname.endsWith('/') ? pathname : `${pathname}/`;
  const source: Lang = clean.startsWith('/en/') ? 'en' : 'nl';
  if (source === target) return clean;

  for (const key of Object.keys(ROUTES) as RouteKey[]) {
    if (ROUTES[key][source] === clean) return ROUTES[key][target];
  }
  return target === 'en' ? '/en/' : '/';
}

interface Dict {
  nl: string;
  en: string;
}

const t = (nl: string, en: string): Dict => ({ nl, en });

export const STRINGS = {
  skipToContent: t('Ga naar de inhoud', 'Skip to content'),
  menuOpen: t('Menu openen', 'Open menu'),
  menuClose: t('Menu sluiten', 'Close menu'),
  nav: t('Hoofdnavigatie', 'Main navigation'),

  /* Openingsuren */
  whenOpen: t("Wanneer is't open?", 'When are we open?'),
  todayLabel: t('Vandaag', 'Today'),
  openEveryDay: t('Elke dag van 14 uur tot laat', 'Every day from 2pm until late'),
  hoursNote: t(
    'Openingstijden kunnen afwijken op feestdagen en tijdens events.',
    'Hours can differ on public holidays and during events.',
  ),
  closed: t('Gesloten', 'Closed'),

  /* Adres */
  whereToFind: t('Hier kunde ons vinden', 'Where to find us'),
  route: t('Route', 'Directions'),
  call: t('Bellen', 'Call'),
  callUs: t('Bel ons', 'Call us'),

  /* Kaart */
  menuTitle: t('De kaart', 'The menu'),
  menuLead: t(
    'Meer dan 69 bierkes, verse cocktails, koffie à volonté en iets om op te knabbelen.',
    'More than 69 beers, fresh cocktails, bottomless coffee and something to nibble on.',
  ),
  search: t('Zoeken op de kaart', 'Search the menu'),
  searchPlaceholder: t('Zoek een bierke, een cocktail…', 'Search a beer, a cocktail…'),
  noResults: t('Niks gevonden. Probeer eens iets anders.', 'Nothing found. Try something else.'),
  clearSearch: t('Wissen', 'Clear'),
  allStyles: t('Alle stijlen', 'All styles'),
  soldOut: t('Even op', 'Sold out'),
  priceChangeNote: t(
    'Prijzen kunnen wijzigen. Aan de toog geldt wat op het bord staat.',
    'Prices may change. What is on the board at the bar is what counts.',
  ),
  viewOnOrderbilly: t('Bekijk op OrderBilly', 'View on OrderBilly'),
  beerOfTheMonth: t('Bier van de maand', 'Beer of the month'),

  /* Agenda */
  agendaTitle: t("Wa is't er te doen?", "What's on"),
  upcoming: t('Wat komt er aan', 'Coming up'),
  pastEvents: t('Al geweest', 'Past events'),
  noEvents: t(
    'Geen event gepland. Wel 69 bierkes, een gratis pooltafel en muziek uit den ouwen doos.',
    'No event planned. Still 69 beers, a free pool table and music from the good old days.',
  ),
  tonight: t('Vanavond', 'Tonight'),
  free: t('Gratis', 'Free'),
  moreInfo: t('Meer info', 'More info'),
  addToCalendar: t('Zet in mijn agenda', 'Add to calendar'),

  /* Formulieren */
  reserveTitle: t('Iets te vieren?', 'Something to celebrate?'),
  name: t('Uw naam', 'Your name'),
  email: t('E-mail', 'Email'),
  phone: t('Telefoon', 'Phone'),
  date: t('Wanneer', 'When'),
  groupSize: t('Met hoeveel zijt ge?', 'How many of you?'),
  requestType: t('Waarover gaat het?', 'What is it about?'),
  message: t('Vertel eens', 'Tell us more'),
  send: t('Versturen', 'Send'),
  optional: t('niet verplicht', 'optional'),
  required: t('verplicht', 'required'),

  /* Nieuwsbrief */
  newsletterTitle: t('Blijf op de hoogte', 'Stay in the loop'),
  newsletterLead: t(
    'Af en toe een mailtje over wijze dingen en plezante events. Niet meer dan dat.',
    'The occasional email about good things and fun events. Nothing more.',
  ),
  newsletterCta: t('Schrijf u in', 'Sign me up'),
  newsletterConsent: t(
    'Ik wil af en toe een mail van den Omgekeerde en ik weet dat ik me altijd kan uitschrijven.',
    'I would like the occasional email and I know I can unsubscribe at any time.',
  ),

  /* Voettekst */
  followUs: t('Volg ons', 'Follow us'),
  legal: t('Het kleine lettertje', 'The small print'),
  privacyPolicy: t('Privacybeleid', 'Privacy policy'),
  cookiePolicy: t('Cookies', 'Cookies'),
  wifiLabel: t('Wifi aan de toog', 'Wifi at the bar'),

  /* Thema en de knipoog */
  themeToggle: t('Dag of nacht', 'Day or night'),
  themeToDay: t('Zet het licht aan', 'Turn on the lights'),
  themeToNight: t('Doe de kaarsen aan', 'Light the candles'),
  flipToggle: t('Zet de wereld op zijn kop', 'Turn the world upside down'),
  flipBack: t('Draai hem terug', 'Turn it back'),

  /* Diversen */
  backHome: t('Terug naar huis', 'Back home'),
  notFound: t('Hier is niks te vinden', 'Nothing to find here'),
  notFoundLead: t(
    'Deze pagina bestaat niet. Ge kunt wel altijd terecht aan de toog.',
    'This page does not exist. You are always welcome at the bar though.',
  ),
} as const;

export type StringKey = keyof typeof STRINGS;

/** s('menuTitle', 'nl') -> 'De kaart' */
export function s(key: StringKey, lang: Lang): string {
  return STRINGS[key][lang];
}

/** Handig in .astro: const T = strings(lang); T.menuTitle */
export function strings(lang: Lang): Record<StringKey, string> {
  const out = {} as Record<StringKey, string>;
  for (const key of Object.keys(STRINGS) as StringKey[]) {
    out[key] = STRINGS[key][lang];
  }
  return out;
}

export const HTML_LANG: Record<Lang, string> = { nl: 'nl-BE', en: 'en' };

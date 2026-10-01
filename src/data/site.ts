/**
 * Vaste bedrijfsgegevens. Verandert bijna nooit.
 * Dingen die WEL vaak veranderen (uren, kaart, events, bier van de maand)
 * staan als YAML in /content — zie de README.
 */

export const site = {
  name: 'De Omgekeerde Wereld',
  shortName: 'Den Omgekeerde',
  legalName: 'De Omgekeerde Wereld SRL',
  founded: 2014,
  url: 'https://deomgekeerdewereld.be',

  address: {
    street: 'Sint-Pietersnieuwstraat 116',
    postalCode: '9000',
    city: 'Gent',
    region: 'Oost-Vlaanderen',
    country: 'BE',
    countryName: 'België',
  },

  geo: {
    // Geverifieerd via OpenStreetMap Nominatim, september 2026.
    lat: 51.047523,
    lon: 3.7270531,
  },

  vat: 'BE 0804 229 473',
  vatRaw: '0804229473',

  phone: '+32 9 310 66 87',
  phoneHref: '+3293106687',

  email: {
    general: 'algemeen@deomgekeerdewereld.be',
    partnerships: 'ran@deomgekeerdewereld.be',
    events: 'tristan@deomgekeerdewereld.be',
  },

  social: {
    instagram: 'https://www.instagram.com/de.omgekeerde.wereld/',
    instagramHandle: '@de.omgekeerde.wereld',
    facebook: 'https://www.facebook.com/deomgekeerdewereld',
    untappd: 'https://untappd.com/v/de-omgekeerde-wereld/2372662',
  },

  /** Externe bestelkaart. Blijft bestaan, maar is niet meer de hoofdweg. */
  orderbilly:
    'https://orderbilly.com/de-omgekeerde-wereld/de-omgekeerde-wereld-menu',

  wifi: {
    ssid: 'de omgekeerde wereld',
    password: 'dewereldomgekeerd',
    /** Zet op false als je het paswoord niet publiek wil. */
    showPublicly: true,
  },

  priceRange: '€',

  /** Voor de kaartlink en routebeschrijving. */
  maps: {
    google:
      'https://www.google.com/maps/dir/?api=1&destination=Sint-Pietersnieuwstraat+116,+9000+Gent,+Belgi%C3%AB',
    osm: 'https://www.openstreetmap.org/?mlat=51.047523&mlon=3.7270531#map=18/51.047523/3.727053',
    appleMaps: 'https://maps.apple.com/?address=Sint-Pietersnieuwstraat%20116,%209000%20Gent,%20Belgi%C3%AB',
  },

  /**
   * SuperHoreca — reservaties.
   *
   * `embed` is het script dat SuperHoreca voor deze zaak serveert. Dat script
   * heeft zijn eigen origin HARD ingebakken: draait het op localhost, dan wijst
   * het boekingsvenster ook naar localhost, en dat werkt enkel op de computer
   * van de ontwikkelaar.
   *
   * Vóór de site live gaat:
   *   1. Zet reservaties aan in het SuperHoreca-dashboard (staat nu op uit).
   *   2. Vraag SuperHoreca om de publieke embed-URL, op https.
   *   3. Zet die URL hieronder. Blijft het een localhost- of http-adres, dan
   *      toont de site geen reserveerknop maar gewoon telefoon en mail.
   */
  reservations: {
    embed: 'http://localhost:3000/embed/omgekeerde-wereld-bv',
    orgName: 'Omgekeerde Wereld BV',
  },

  /** Formulieren. Zie README voor het instellen. */
  forms: {
    /** Netlify Forms staat aan via data-netlify. Wil je Formspree? Zet hier de endpoint. */
    reservationEndpoint: '',
    newsletterEndpoint: '',
    /** Cloudflare Turnstile site key. Leeg = geen widget (enkel honeypot). */
    turnstileSiteKey: '',
  },

  /** Privacyvriendelijke analytics. Leeg = geen script, geen cookiebanner. */
  analytics: {
    plausibleDomain: 'deomgekeerdewereld.be',
    enabled: true,
  },
} as const;

export type Site = typeof site;

/** Straat + postcode + stad op één lijn. */
export const addressLine = `${site.address.street}, ${site.address.postalCode} ${site.address.city}`;

/**
 * Is de reserveerknop klaar om te tonen?
 *
 * We tonen hem liever niet dan kapot. Een script op localhost werkt enkel op de
 * computer van de ontwikkelaar, en een http-script wordt op een https-site door
 * de browser geweigerd. In beide gevallen zou de bezoeker op een knop klikken
 * die niets doet — dan is telefoon en mail eerlijker.
 */
export function reservationsReady(): boolean {
  const url = site.reservations.embed?.trim();
  if (!url) return false;

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }

  const local = ['localhost', '127.0.0.1', '0.0.0.0', '::1'].includes(parsed.hostname);
  const insecure = parsed.protocol !== 'https:';

  // Tijdens `npm run dev` mag localhost wel: dan zijt ge aan het testen.
  if (import.meta.env.DEV) return true;

  return !local && !insecure;
}

/**
 * Eén waarschuwing per bouw, zodat een verkeerd ingestelde reserveerknop niet
 * stilletjes meegaat naar productie.
 */
if (!import.meta.env.DEV) {
  const probleem = reservationsProblemInternal();
  if (probleem) {
    console.warn(
      `\n  [reserveren] De reserveerknop staat UIT: ${probleem}.\n` +
        '  Bezoekers zien nu het telefoonnummer in plaats van een knop.\n' +
        '  Vul de publieke https-URL in bij site.reservations.embed in src/data/site.ts.\n',
    );
  }
}

function reservationsProblemInternal(): string | null {
  const url = site.reservations.embed?.trim();
  if (!url) return 'er staat geen embed-URL in src/data/site.ts';
  try {
    const parsed = new URL(url);
    if (['localhost', '127.0.0.1', '0.0.0.0', '::1'].includes(parsed.hostname)) {
      return `de embed-URL wijst naar ${parsed.hostname}, dat werkt enkel lokaal`;
    }
    if (parsed.protocol !== 'https:') {
      return `de embed-URL gebruikt ${parsed.protocol}, een https-site weigert dat`;
    }
  } catch {
    return `"${url}" is geen geldige URL`;
  }
  return null;
}

/** Uitleg voor in de bouwlog, zodat een verkeerde instelling opvalt. */
export function reservationsProblem(): string | null {
  const url = site.reservations.embed?.trim();
  if (!url) return 'er staat geen embed-URL in src/data/site.ts';
  try {
    const parsed = new URL(url);
    if (['localhost', '127.0.0.1', '0.0.0.0', '::1'].includes(parsed.hostname)) {
      return `de embed-URL wijst naar ${parsed.hostname}, dat werkt enkel lokaal`;
    }
    if (parsed.protocol !== 'https:') {
      return `de embed-URL gebruikt ${parsed.protocol}, een https-site weigert dat`;
    }
  } catch {
    return `"${url}" is geen geldige URL`;
  }
  return null;
}

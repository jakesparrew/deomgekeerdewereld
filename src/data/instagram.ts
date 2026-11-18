/**
 * Foto's die van onze Instagram komen, voor de rij die voorbijschuift
 * (src/components/InstaCarrousel.astro). Nieuwe foto: zet het bestand in
 * public/images/ en voeg hier een regel toe, met de link naar de post.
 */

export interface InstaFoto {
  src: string;
  width: number;
  height: number;
  nl: string;
  en: string;
  /** Link naar de post op Instagram. */
  post: string;
  /** Bij welke reeks hij hoort, om op een pagina enkel die te tonen. */
  reeks: 'kaa-gent' | 'events';
}

const KAA_GENT = 'https://www.instagram.com/p/DfMpj-ogB-M/';

export const INSTA_FOTOS: InstaFoto[] = [
  {
    src: '/images/kaa-gent-in-ow.jpg',
    width: 1074,
    height: 1350,
    nl: 'Twee mannen in blauw-witte KAA Gent-truitjes en sjaals op een leren zetel. Tekst: KAA Gent in OW! Den Omgekeerden is een officieel Buffalopoint.',
    en: 'Two men in blue and white KAA Gent shirts and scarves on a leather sofa. Text: KAA Gent in OW! Den Omgekeerden is an official Buffalo Point.',
    post: KAA_GENT,
    reeks: 'kaa-gent',
  },
  {
    src: '/images/events/afroparty-2026-11.jpg',
    width: 1080,
    height: 1350,
    nl: 'Affiche Rnb - Afroparty, DJ Shiel All Night Long: een dansende menigte in paars licht.',
    en: 'Poster R&B - Afro party, DJ Shiel All Night Long: a dancing crowd in purple light.',
    post: 'https://www.instagram.com/p/DfXbzisgNbx/',
    reeks: 'events',
  },
  {
    src: '/images/kaa-gent-groot-scherm.jpg',
    width: 1074,
    height: 1350,
    nl: 'Twee supporters in KAA Gent-truitjes voor de toog, met de barman erachter. Tekst: Groot scherm. Alle thuis- en uitmatchen met geluid.',
    en: 'Two supporters in KAA Gent shirts in front of the bar, with the barman behind them. Text: Big screen. All home and away matches with sound.',
    post: KAA_GENT,
    reeks: 'kaa-gent',
  },
  {
    src: '/images/events/feestweek-2026.jpg',
    width: 1080,
    height: 1350,
    nl: 'Affiche Feestweek in OW: een dj steekt beide handen in de lucht voor een muur vol foto\'s. 12 jaar Omgekeerde Wereld.',
    en: 'Poster Party week at OW: a DJ with both hands in the air in front of a wall of photos. 12 years of De Omgekeerde Wereld.',
    post: 'https://www.instagram.com/p/DezA3eAgAnR/',
    reeks: 'events',
  },
  {
    src: '/images/kaa-gent-merch-tickets.jpg',
    width: 1074,
    height: 1350,
    nl: 'Twee supporters in KAA Gent-truitjes aan de voordeur van het café. Tekst: Merch en tickets, aan de toog.',
    en: 'Two supporters in KAA Gent shirts at the front door of the bar. Text: Merch and tickets, at the bar.',
    post: KAA_GENT,
    reeks: 'kaa-gent',
  },
  {
    src: '/images/kaa-gent-pintje.jpg',
    width: 1074,
    height: 1350,
    nl: 'Twee supporters klinken aan een tafel voor een muur vol krantenknipsels. Tekst: Pakt u een pintje en geniet van de match!',
    en: 'Two supporters toasting at a table in front of a wall of newspaper clippings. Text: Grab a beer and enjoy the match!',
    post: KAA_GENT,
    reeks: 'kaa-gent',
  },
];

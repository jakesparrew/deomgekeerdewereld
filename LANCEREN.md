# Lanceerlijst

Af te vinken voor, tijdens en na het online zetten. Van boven naar onder werken.

---

## Vooraf: alles nakijken

### Bouwen

- [ ] `npm install` loopt zonder fouten
- [ ] **`npm run verify` loopt volledig groen.** Dat is de belangrijkste vinkje van
      deze hele lijst. Het draait in één keer: de 25 tests op de uren-logica, de 84
      kleurcontroles in beide thema's, de typecontrole, de bouw, de linkcontrole
      (inclusief elk mailadres) en de taalcontrole (canonical, hreflang, taalknop)
- [ ] `npm run preview` toont de site zoals ze online zal staan
- [ ] Er staat een `dist/sitemap-index.xml` en die bevat alle pagina's behalve
      `/404` en `/stijlgids/`

### Elke pagina bekijken

Doe dit één keer op een gsm en één keer op een laptop, in het **nachtthema én het
dagthema**:

- [ ] `/` homepagina
- [ ] `/kaart/` de kaart
- [ ] `/agenda/` de agenda
- [ ] `/over/` ons verhaal
- [ ] `/reserveren/` reserveren
- [ ] `/contact/` contact
- [ ] `/privacy/` en `/cookies/`
- [ ] `/en/`, `/en/menu/`, `/en/events/`, `/en/about/`, `/en/bookings/`, `/en/contact/`
- [ ] `/404` een verzonnen URL, bijvoorbeeld `/bestaatniet/`
- [ ] `/stijlgids/` (moet op noindex staan)

### Links

- [ ] **Elke `mailto:` nagekeken.** Dit was een echte fout op de oude site: de
      partnerships-link wees naar het mailadres van een fitnesscoach uit een sjabloon.
      Klik ze alle drie aan: `algemeen@`, `ran@`, `tristan@`
- [ ] De telefoonlink `tel:` opent de belknop op een gsm
- [ ] De routelink opent Google Maps op het juiste adres
- [ ] De Instagram-, Facebook- en Untappd-links werken
- [ ] De OrderBilly-link werkt nog
- [ ] Geen enkele link geeft een 404. Draai een linkcontrole over `dist/`

### Werkt het ook zonder?

- [ ] **JavaScript uit**: de kaart staat er volledig, de agenda staat er, de uren staan
      er, de navigatie werkt, de formulieren versturen
- [ ] **Trage verbinding**: de pagina toont tekst voor de foto's binnen zijn
- [ ] **Toetsenbord**: met de tabtoets door een hele pagina, het focuskader is altijd
      zichtbaar, de "ga naar de inhoud"-link werkt als eerste
- [ ] **Beweging uit** (`prefers-reduced-motion`): niets springt of schuift

### Reserveren via SuperHoreca

- [ ] Reservaties staan **aan** in het SuperHoreca-dashboard
- [ ] `reservations.embed` in `src/data/site.ts` staat op de publieke **https**-URL,
      niet op localhost. Bouwt ge met een verkeerde URL, dan zegt de bouwlog dat
- [ ] `npm run build` geeft **geen** `[reserveren]`-waarschuwing meer
- [ ] Op `/reserveren/` staat de gele knop "Reserveer een tafel", niet het
      telefoonnummer
- [ ] Klik erop: het venster opent en toont een échte boekingskalender, geen lege
      doos
- [ ] Eén testreservatie doen, en nakijken of ze in SuperHoreca binnenkomt
- [ ] Netwerktabblad openen en de pagina herladen **zonder** te klikken: er mag geen
      enkel verzoek naar SuperHoreca vertrekken. Dat is de reden dat er geen
      cookiebanner staat
- [ ] Hetzelfde nakijken op `/en/bookings/`

### Formulieren

- [ ] Het reservatieformulier echt eens invullen en versturen. Komt de mail aan?
- [ ] Het nieuwsbriefformulier echt eens invullen. Komt de inschrijving in Brevo?
- [ ] Het lokvakje tegen spam zit erin en is onzichtbaar voor gewone bezoekers
- [ ] De verplichte toestemmingsvinkjes kunnen niet overgeslagen worden
- [ ] Een foutmelding is leesbaar en staat níét enkel in het rood

### Gestructureerde data en SEO

- [ ] De JSON-LD door de [Rich Results Test](https://search.google.com/test/rich-results)
      halen: geen fouten
- [ ] `LocalBusiness`/`BarOrPub` bevat adres, uren, telefoon, geo en de link naar de kaart
- [ ] Elk komend event verschijnt als `Event`
- [ ] Elke pagina heeft een eigen titel en een eigen beschrijving, in de juiste taal
- [ ] De `hreflang`-verwijzingen tussen NL en EN kloppen in beide richtingen
- [ ] Het deelkaartje ziet er goed uit: plak een URL in WhatsApp of Slack en kijk
- [ ] `robots.txt` verwijst naar de sitemap
- [ ] Enkel `/stijlgids/` en `/404` staan op noindex

### Snelheid en toegankelijkheid

- [ ] Lighthouse op **mobiel**, in incognito, voor `/` en voor `/kaart/`:
  - [ ] Performance ≥ 95
  - [ ] Accessibility ≥ 95
  - [ ] Best Practices ≥ 95
  - [ ] SEO ≥ 95
- [ ] De homepagina laadt minder dan 100 kB JavaScript
- [ ] Geen enkele pagina schuift horizontaal op een scherm van 320 pixels breed
- [ ] Contrast nagekeken in beide thema's

---

## Online zetten

### Hosting

- [ ] Project op GitHub
- [ ] Gekoppeld aan Netlify (of Vercel, of Cloudflare Pages)
- [ ] Build command `npm run build`, publish directory `dist`, Node 22 of hoger
- [ ] Eerste bouw gelukt, de tijdelijke URL werkt

### Domein en omleidingen

- [ ] `deomgekeerdewereld.be` wijst naar de nieuwe hosting
- [ ] `www.deomgekeerdewereld.be` leidt door naar het kale domein (301)
- [ ] Het oude `deomgekeerdewereldgent.be` leidt door naar de nieuwe site (301)
- [ ] HTTPS staat aan en het certificaat is geldig
- [ ] HTTP leidt automatisch door naar HTTPS
- [ ] De oude WordPress-adressen leiden door:
  - [ ] `/privacy-policy/` → `/privacy/`
  - [ ] `/menukaart/` → `/kaart/`
  - [ ] `/events/` → `/agenda/`
- [ ] `_redirects` staat in de juiste vorm voor de gekozen hosting (Netlify gebruikt
      `_redirects`, Vercel `vercel.json`, Cloudflare Pages een eigen `_redirects`)

### De oude site

- [ ] **Een kopie van de oude WordPress-site bewaard** voor het geval er iets vergeten is
- [ ] De inschrijvers van de oude nieuwsbrief geëxporteerd uit Mailchimp én Brevo
- [ ] Nagekeken of er op de oude site nog inhoud stond die we niet hebben overgezet
- [ ] De WordPress-installatie pas offline halen als de nieuwe site een week goed draait
- [ ] De oude push-berichten (WonderPush) afgezet, anders blijven die doorlopen

### Formulieren en mail

- [ ] In Netlify onder **Forms → Form notifications** de doorstuuradressen ingesteld
- [ ] Eén testreservatie verstuurd vanaf een extern adres en aangekomen
- [ ] De nieuwsbrieflijst in Brevo gekoppeld
- [ ] **Mailchimp opgezegd** — die stond nog naast Brevo op de oude site en dat is
      dubbel betalen

### Beheerscherm

- [ ] Netlify Identity aangezet
- [ ] Git Gateway aangezet
- [ ] Registratie op **Invite only** gezet
- [ ] De beheerders uitgenodigd en één keer laten inloggen
- [ ] Samen één event toegevoegd, om te zien of het werkt

---

## Na de lancering

### Meteen

- [ ] De nieuwe URL in het **Google Bedrijfsprofiel** zetten
- [ ] De uren in het Google Bedrijfsprofiel gelijkzetten met de site
- [ ] De link in de **Instagram-bio** vervangen
- [ ] De link op de **Facebookpagina** vervangen
- [ ] De link op **Untappd** nakijken
- [ ] Google Search Console: de site toevoegen, eigendom bevestigen, de sitemap indienen
- [ ] Bing Webmaster Tools: hetzelfde
- [ ] Plausible: kijken of er statistieken binnenlopen

### De week erna

- [ ] Search Console nakijken op crawlfouten en 404's
- [ ] Kijken welke oude adressen nog aangeklikt worden en er zo nodig een omleiding
      bij zetten
- [ ] Nakijken of er reservaties zijn binnengekomen en of ze bij de juiste persoon
      belanden
- [ ] Eén keer met de zaakvoerders door het beheerscherm lopen

### Elke maand

- [ ] Bier van de maand wisselen
- [ ] Nieuwe events toevoegen
- [ ] Feestdagen die eraan komen in `hours.yaml` zetten
- [ ] Prijzen nakijken als er iets gewijzigd is aan de toog

---

## Als er iets misloopt

**De site bouwt niet meer.** Dan staat er een fout in een van de bestanden in `content/`.
De foutmelding zegt in het Nederlands welk bestand en meestal welke regel. Meestal is het
een tab in plaats van spaties, of een ontbrekende spatie na een dubbele punt. De oude
versie blijft intussen gewoon online staan.

**"Dubbele id in content/menu.yaml".** Twee items met dezelfde sleutel. De melding noemt
de sleutel. Geef er één een andere.

**Het "Nu open" bolleke klopt niet.** Kijk `content/hours.yaml` na. Sluit ge na
middernacht, dan hoort daar gewoon `'02:00'` te staan, niet `'26:00'`.

**Een foto komt niet door.** Staat het bestand in `public/images/`? Klopt de naam exact,
inclusief hoofdletters en de extensie?

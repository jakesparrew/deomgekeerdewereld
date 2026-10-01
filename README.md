# De Omgekeerde Wereld — de website

Alles wat ge moet weten om de site aan te passen, zonder programmeur.

De site is **statisch**: er draait geen database en geen WordPress. Alle inhoud staat
in vier tekstbestandjes in de map `content/`. Past ge daar iets aan, dan bouwt de site
zichzelf opnieuw en staat het binnen een minuut of twee online.

---

## Inhoud

1. [In het kort](#in-het-kort)
2. [De vier bestanden](#de-vier-bestanden)
3. [Een event toevoegen](#een-event-toevoegen)
4. [Het bier van de maand veranderen](#het-bier-van-de-maand-veranderen)
5. [De uren aanpassen](#de-uren-aanpassen)
6. [De kaart aanpassen](#de-kaart-aanpassen)
7. [Foto's toevoegen](#fotos-toevoegen)
8. [Het beheerscherm](#het-beheerscherm)
9. [Online zetten](#online-zetten)
10. [Voor de techneut](#voor-de-techneut)

---

## In het kort

| Wat ge wilt doen | Welk bestand |
| --- | --- |
| Een concertje of quiz aankondigen | `content/events.yaml` |
| Bier van de maand wisselen | `content/highlights.yaml` |
| Uren voor een feestdag zetten | `content/hours.yaml` |
| Een prijs of een nieuw bierke | `content/menu.yaml` |
| Een foto vervangen | map `public/images/` |

Ge hoeft nooit iets anders aan te raken.

---

## De vier bestanden

Ze staan allemaal in de map `content/` en zijn geschreven in YAML. Dat klinkt erger dan
het is. Drie regels om te onthouden:

1. **Inspringen doet ge met spaties, nooit met tabs.** Twee spaties per niveau.
2. **Achter de dubbele punt komt een spatie.** `naam: Duvel`, niet `naam:Duvel`.
3. **Staat er een dubbele punt of een apostrof in uw tekst, zet er dan aanhalingstekens
   rond.** `titel: "Fiestje: het vervolg"`.

Twijfelt ge? Kopieer gewoon een blok dat er al staat en pas het aan. Dat is de veiligste
manier.

Gaat er toch iets mis, dan **weigert de site te bouwen** en blijft de oude versie online
staan. Ge kunt dus niets kapotmaken dat bezoekers te zien krijgen.

---

## Een event toevoegen

Open `content/events.yaml`. Onder `events:` staan de losse events. Kopieer een blok en
zet het bovenaan de lijst:

```yaml
  - id: soulnight-december
    title: 'Soul Night met DJ Bompa'
    titleEn: 'Soul Night with DJ Bompa'
    start: '2026-12-19T21:00'
    end: '2026-12-20T02:00'
    type: dj
    price: 0
    description: >-
      Northern soul, funk en een pak vinyl uit den ouwen doos.
    descriptionEn: >-
      Northern soul, funk and a stack of vinyl from the good old days.
    link: 'https://fb.me/e/...'
```

Waar ge op moet letten:

- **`id`** moet uniek zijn. Neem de naam plus de maand, dan zit ge altijd goed.
- **`start`** is jaar-maand-dag, dan een hoofdletter T, dan uur:minuut. Gentse tijd.
- **`type`** kiest het labeltje: `concert`, `dj`, `quiz`, `aperomer`, `feest`,
  `open-air` of `andere`.
- **`price`** laat ge weg of zet ge op `0` voor gratis.
- **`link`** is optioneel, meestal het Facebook-event.

**Ge moet niets verwijderen.** Zodra een event zes uur voorbij is, verhuist het vanzelf
naar "Al geweest" onderaan de agenda.

### Elke maand hetzelfde event

Aper'Omer staat al onder `recurring:`. Die berekent de site zelf, elke eerste vrijdag van
de maand, tot in het oneindige. Ge moet die dus nooit opnieuw invoeren. Wilt ge er nog
zo één, kopieer dan dat blok en pas `weekday` (0 = zondag, 5 = vrijdag) en `ordinal`
(1 = de eerste, -1 = de laatste) aan.

---

## Het bier van de maand veranderen

Open `content/highlights.yaml` en pas het blok `beerOfTheMonth:` aan:

```yaml
beerOfTheMonth:
  name: 'Ouwen Duiker'
  brewery: 'Brouwerij Van Steenberge'
  style: 'Blond'
  abv: 8.0
  price: 3.50
  month: '2026-09'
  blurb: >-
    Straf blondje van bij ons om de hoek.
```

Dat is één regel of vijf, en het staat meteen op de homepagina én bovenaan de kaart.

Wilt ge dat het bierke ook een labeltje krijgt in de kaart zelf, zoek het dan op in
`content/menu.yaml` en zet `bier-van-de-maand` bij zijn `tags`. Vergeet het bij het
vorige bier weg te halen.

---

## De uren aanpassen

Open `content/hours.yaml`.

**De vaste week** staat bovenaan. Sluit ge na middernacht, schrijf dan gewoon `'02:00'`.
De site snapt dat dat de volgende ochtend is en toont "Nu open" tot dat uur.

**Feestdagen en verlof** zet ge onder `exceptions:`:

```yaml
exceptions:
  - date: '2026-12-25'
    label: 'Kerstmis'
    closed: true
  - date: '2026-12-31'
    label: 'Oudejaarsavond'
    open: '14:00'
    close: '05:00'
```

Een uitzondering wint altijd van de vaste week. Ze verschijnt ook als los lijntje op de
contactpagina, zodat mensen niet voor een gesloten deur staan.

Voorbije uitzonderingen mag ge laten staan; ze verdwijnen vanzelf uit beeld. Ruim ze
één keer per jaar op, dan blijft het bestand overzichtelijk.

---

## De kaart aanpassen

Open `content/menu.yaml`. Elk item ziet er zo uit:

```yaml
  - id: gentse-strop
    name: 'Gentse Strop'
    category: bier
    price: 5.00
    style: blond
    abv: 6.9
    brewery: 'Brouwerij Roman'
    tags: [lokaal, gents]
```

**Een prijs veranderen:** zoek het item en pas `price` aan. Punt, geen komma:
`5.00`, niet `5,00`. Op de site komt daar vanzelf `€ 5,00` van te staan.

**Een bierke toevoegen:** kopieer een bestaand blok, geef het een **nieuwe unieke `id`**
en pas de rest aan.

**Een bierke dat op is:** zet `available: false`. Het blijft op de kaart staan maar krijgt
een grijs "Even op"-labeltje. Zo moet ge niets verwijderen en niets terugzetten.

**De labels** (`tags`) betekenen:

| Label | Betekenis |
| --- | --- |
| `lokaal` | van hier uit de buurt |
| `gents` | in Gent gebrouwen |
| `promo` | staat in promotie |
| `favo` | een van onze favorieten |
| `trappist` | echte trappist |
| `alcoholvrij` | 0,0 |
| `op-tap` | van het vat |
| `bier-van-de-maand` | het bier van deze maand |

**De sleutels (`id`) moeten uniek blijven.** Staan er twee dezelfde, dan weigert de site
te bouwen en krijgt ge een duidelijke foutmelding met de dubbele sleutel erin.

---

## Foto's toevoegen

Zet het bestand in de map `public/images/` en verwijs ernaar met de bestandsnaam.

Voor de grote foto bovenaan de homepagina, in `content/highlights.yaml`:

```yaml
hero:
  image: 'gevel-avond.jpg'
  alt: 'De verlichte gevel bij avond, met de krijtborden naast de deur.'
```

Zolang `image` leeg is, toont de site een nette gestreepte plaatshouder met de opdracht
erin. Er staat dus nooit een kapot fotokader op de site.

**`alt` is niet optioneel.** Dat is de beschrijving die blinden te horen krijgen en die
Google leest. Beschrijf wat er te zien is, in één zin.

De volledige lijst van foto's die we nog nodig hebben, met wat er precies op moet staan,
vindt ge in **`public/images/README.md`**.

Praktisch:

- Liggend voor de grote foto's, vierkant voor de sfeerbeelden.
- Minstens 2000 pixels op de lange kant, opslaan als JPG onder 400 kB.
- Geen flits. Het licht in de zaal is het onderwerp.
- **Herkenbare mensen op de foto? Vraag het hen.** Dat is niet alleen beleefd, het is
  ook wat de privacywet vraagt.

---

## Het beheerscherm

Er zit een beheerscherm bij op **`/admin/`**. Daarmee past ge alles hierboven aan via
gewone invulvelden, zonder ooit een bestand te openen.

Het moet één keer aangezet worden:

1. Zet het project op GitHub.
2. Koppel het aan Netlify (zie [Online zetten](#online-zetten)).
3. In Netlify: **Site configuration → Identity → Enable Identity**.
4. Onder **Identity → Services → Git Gateway**: aanzetten.
5. Onder **Identity → Registration**: op *Invite only* zetten, anders kan iedereen
   binnen.
6. Nodig uzelf uit via **Identity → Invite users**.

Daarna surft ge naar `deomgekeerdewereld.be/admin/`, logt ge in, en past ge de kaart aan
zoals in eender welk ander programma. Elke aanpassing wordt bewaard en de site bouwt
zichzelf opnieuw.

Werkt het beheerscherm niet of hebt ge er geen zin in? **De bestanden in `content/`
rechtstreeks aanpassen doet precies hetzelfde.** Dat kan ook gewoon in de webbrowser via
GitHub: klik het bestand aan, klik op het potloodje, pas aan, en klik onderaan op
*Commit changes*.

---

## Online zetten

De site draait het best op **Netlify**, **Vercel** of **Cloudflare Pages**. Alle drie
gratis voor een site als deze.

**Eén keer instellen:**

| Instelling | Waarde |
| --- | --- |
| Build command | `npm run build` |
| Publish directory | `dist` |
| Node-versie | 22 of hoger |

**De domeinnamen.** Het bestand `public/_redirects` regelt de omleidingen op Netlify:
`www` naar het kale domein, en het oude `deomgekeerdewereldgent.be` naar de nieuwe site.
Werkt ge met Vercel, dan hoort dat in `vercel.json`; met Cloudflare Pages in een
`_redirects` met dezelfde inhoud. Zet het hoofddomein daarnaast ook in de
DNS-instellingen van uw registrar.

**De formulieren** (reservaties en nieuwsbrief) werken op Netlify vanzelf: die vangt ze
op en mailt ze door. Ge moet enkel in Netlify onder **Forms → Form notifications**
instellen naar welk adres ze gaan. Op een andere host zet ge een endpoint in
`src/data/site.ts` bij `forms.reservationEndpoint` en `forms.newsletterEndpoint`.

**Reserveren via SuperHoreca.** De knop op `/reserveren/` opent een boekingsvenster
van SuperHoreca. Eén instelling regelt alles: `reservations.embed` in
`src/data/site.ts`. Daar hoort de publieke `https://`-URL van uw embed-script.

Let op: het script dat SuperHoreca serveert heeft zijn eigen adres hard ingebakken.
Staat daar `localhost`, dan wijst het boekingsvenster ook naar localhost en werkt het
enkel op de computer van de ontwikkelaar. Daarom controleert de site die URL zelf:

- geldige `https`-URL → de gele reserveerknop verschijnt
- localhost, `http`, of leeg → geen knop, wel het telefoonnummer, plus een
  waarschuwing in de bouwlog

Anders dan het knip-en-plakvoorbeeld van SuperHoreca laadt de site hun script **pas
wanneer iemand op de knop duwt**. Voor de bezoeker is dat dezelfde ene klik. Voor ons
betekent het dat wie enkel de kaart komt bekijken, nooit contact legt met SuperHoreca
— en dat is precies waarom deze site geen cookiebanner nodig heeft. Zet dat dus niet
terug naar een gewone `<script async>` in de layout.

**Spam.** Er zit al een verborgen lokvakje in dat de meeste robots tegenhoudt. Krijgt ge
toch rommel binnen, maak dan een gratis Cloudflare Turnstile-sleutel aan en zet die in
`src/data/site.ts` bij `forms.turnstileSiteKey`. Meer moet dat niet zijn.

---

## Voor de techneut

```bash
npm install      # eenmalig
npm run dev      # lokale server op http://localhost:4321
npm run build    # bouwt naar dist/
npm run preview  # bekijkt dist/ zoals het online zal staan
npm run verify   # doet alles hieronder in één keer
```

**`npm run verify` is het commando dat telt.** Het draait, in deze volgorde:

| Stap | Wat het nakijkt |
| --- | --- |
| `test-hours.mjs` | 25 gevallen op de uren-logica: sluiten na middernacht, feestdagen, zomer- en wintertijd |
| `check-contrast.mjs` | 84 kleurcombinaties tegen WCAG AA, in beide thema's |
| `astro check` | typefouten in de code |
| `astro build` | bouwt de site; een fout in `content/` breekt hier |
| `check-links.mjs` | kapotte links, vreemde mailadressen, ontbrekende titels, alt-teksten, `h1` per pagina |
| `check-i18n.mjs` | canonical, hreflang, x-default en de taalknop per pagina |

Loopt dat allemaal groen, dan kunt ge gerust deployen. Draai het ook één keer
nadat ge iets in `content/` hebt aangepast.

**Wat zit waar**

```
content/            de vier YAML-bestanden — dit is wat de zaak aanpast
src/data/site.ts    vaste bedrijfsgegevens (adres, telefoon, mails, socials, geo)
src/data/types.ts   de vorm van de YAML-bestanden
src/lib/            uren-logica, agenda-logica, opmaak, vertalingen
src/styles/         tokens.css (kleuren, typografie, ruimte) en global.css
src/components/     de bouwblokken
src/layouts/        de schil rond elke pagina
src/pages/          de pagina's; /en/ is de Engelse versie
public/             wat één op één mee online gaat
```

**Uitgangspunten**

- Geen jQuery, geen paginabouwer, geen framework. Astro levert HTML; JavaScript is
  enkel een extraatje.
- Alles moet leesbaar zijn **zonder JavaScript**. De kaart, de agenda en de uren staan
  gewoon in de HTML. Zoeken en filteren zijn een extraatje bovenop.
- **Kleuren, lettergroottes en afstanden komen altijd uit `tokens.css`.** Schrijf nooit
  een kleurcode rechtstreeks in een component: dan breekt het dagthema.
- De site heeft een nacht- en een dagthema. Elke kleur is in beide gecontroleerd op
  leesbaarheid (WCAG AA, minstens 4,5:1 voor gewone tekst).
- De uren worden altijd omgerekend naar de klok van Gent, ook als de bezoeker in een
  andere tijdzone zit.

**Wat er bewust níét in zit**

Geen cookiebanner, want er worden geen cookies gezet. De bezoekersstatistieken lopen via
Plausible, dat geen cookies gebruikt en geen persoonsgegevens bewaart. De kaart op de
contactpagina laadt pas nadat de bezoeker erop klikt, zodat OpenStreetMap niet ongevraagd
wordt aangesproken. Zet ge later toch Google Analytics of iets dergelijks aan, dan hebt
ge wél een toestemmingsbanner nodig.

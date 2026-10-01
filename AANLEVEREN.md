# Wat wij nog van jullie nodig hebben

De site staat er en werkt. Wat hieronder staat, maakt hem af. Alles is zonder deze
dingen al bruikbaar — er staat nergens een kapot kader of een lege plek zonder uitleg —
maar met foto's en jullie eigen teksten wordt het pas den Omgekeerde.

Afvinken van boven naar onder. Het eerste blok is het belangrijkste.

---

## 0. De bovenverdieping — cijfers ontbreken nog

De pagina `/bovenzaal/` staat er en werkt. Alleen de getallen moeten er nog in. Alles
staat in één bestand: `content/bovenzaal.yaml`.

- [ ] **Hoeveel mensen kunnen er?** Zittend en staand, plus het aantal m² als je dat
      weet. Zolang die leeg zijn toont de pagina géén cijfers. Dat is met opzet: een
      verkeerd aantal dat in Google belandt, krijg je er niet meer uit
- [ ] **Wat kost het?** Zet `prijs.toon` op `true` en vul `vanaf` in zodra er een
      tarief is. Nu zegt de pagina "in overleg" en stuurt ze door naar het formulier
- [ ] **Klopt de lijst van wat erbij zit?** Ik heb ze afgeleid uit de foto's en uit
      wat op jullie eigen krijtbord staat. Schrap gerust wat niet klopt
- [ ] **Twee foto's bevestigen.** Ik koos `bovenzaal-kicker.jpg` en
      `bovenzaal-zithoek.jpg` omdat ze een aparte ruimte tonen met wereldkaarten,
      zetels en een kicker. Bevestig dat dat écht boven is en niet een hoek beneden
- [ ] **De naam.** Ik noem ze "de bibliotheek", want dat staat op jullie krijtbord:
      *2e verdiep — bibliotheek, gratis pool*. Heet ze anders, zeg het

## 0b. De foto's die ik uit jullie Drive gehaald heb

Dertien foto's staan nu klaar in `public/images/`, uit de reeksen van 2019 en 2022.

- [ ] **Toestemming.** Op bijna elke foto staan herkenbare mensen. Die publiek op een
      website zetten is iets anders dan ze in een gedeelde map bewaren. Check of dat
      geregeld is, zeker bij de feestfoto's
- [ ] **Fotograaf.** Beide reeksen zijn duidelijk door iemand gemaakt. Wil die
      vermeld worden, dan zet ik een creditline in de voettekst
- [ ] **Terras.** Het enige wat ik niet gevonden heb. Daar staat nu een andere foto
- [ ] **Oprichtingsdatum.** Op de gevel staat *Sinds 3 oktober 2014*. De site zegt nu
      alleen "2014". Wil je die datum voluit, dan pas ik het aan

## 1. Foto's — het grootste verschil

Zonder foto's toont de site nette gestreepte plaatshouders met daarin de opdracht. Elke
foto die jullie aanleveren vervangt er één.

**Een groot deel is ondertussen ingevuld** met de foto's hierboven. Wat hieronder nog
als "te schieten" staat, is wat ik in de Drive niet gevonden heb.

**De volledige lijst met wat er precies op moet staan, staat in
[`public/images/README.md`](public/images/README.md).** Kort samengevat:

| Bestand | Wat erop moet | Wanneer schieten |
| --- | --- | --- |
| `gevel-avond.jpg` | De gevel bij avond, licht aan, krijtborden leesbaar | Na zonsondergang |
| `gevel-dag.jpg` | Dezelfde gevel bij daglicht, terras buiten | Zonnige namiddag |
| `toog.jpg` | De toog tijdens de service, iemand die tapt | Druk moment |
| `pool.jpg` | De pooltafel, met volk dat speelt | Avond |
| `kaarslicht.jpg` | Tafels bij kaarslicht | Late avond |
| `terras.jpg` | Het terras vol volk | Zonnige namiddag |
| `concert.jpg` | Een groep die speelt in de hoek | Tijdens een concertje |
| `bierkes.jpg` | Een rij verschillende bierkes op de toog | Eender wanneer |

Praktisch:

- [ ] Minstens 2000 pixels op de lange kant, JPG, onder 400 kB per stuk
- [ ] Liggend voor `gevel-avond` (dat is de grote foto bovenaan én de deelafbeelding)
- [ ] Geen flits — het licht in de zaal is nu juist het onderwerp
- [ ] **Toestemming van herkenbare mensen op de foto.** Beleefd én verplicht onder de
      privacywet. Een mondeling ja volstaat, maar noteer bij wie ge het gevraagd hebt
- [ ] Eén foto van 1200 × 630 pixels voor het deelkaartje op sociale media, op te slaan
      als `public/og/omgekeerde-og.jpg` (mag een uitsnede van de gevelfoto zijn)

---

## 2. Het logo als vectorbestand

- [ ] Het zonnetje met het gezicht als **SVG** of **AI/EPS**

Er staat nu een nagetekende versie in `src/components/SunLogo.astro`. Die is mooi, maar
het is niet exact jullie logo. Hebben jullie het originele bestand van wie het ooit
getekend heeft, dan vervangen we dat in vijf minuten.

- [ ] Twee PNG's voor op het startscherm van een gsm: `public/icons/icon-192.png` en
      `public/icons/icon-512.png` (vierkant, het zonnetje op zwart)

---

## 3. Teksten en gegevens nakijken

- [ ] **De uren kloppen?** Nu staat er: elke dag 14:00, sluiten om 02:00, donderdag 03:00,
      vrijdag en zaterdag 04:00. Aanpassen in `content/hours.yaml`
- [ ] **De feestdagen voor dit jaar.** Er staan nu vier voorbeelden in (Kerstavond,
      Kerstmis, Oudejaar, Nieuwjaar). Vul aan of pas aan
- [ ] **De kaart nakijken.** Ze is overgenomen van OrderBilly in september 2026.
      Prijzen veranderd sinds dan? Bierkes bijgekomen of weg?
- [ ] **De alcoholpercentages en brouwerijen.** We hebben die enkel ingevuld waar we
      zeker waren. Bij de huisbierkes en de minder bekende staat er niets — vul aan wat
      ge weet, of laat het gerust leeg
- [ ] **Het verhaal op `/over/`.** Het is jullie eigen tekst, licht bijgewerkt. Lees het
      eens na of ge uzelf erin herkent
- [ ] **De namen van de drie oprichters.** Die staan er nu niet in. Wilt ge dat wel?
- [ ] **De Engelse teksten laten nalezen** door iemand die vlot Engels spreekt. Ze zijn
      goed, maar een tweede paar ogen is nooit slecht
- [ ] **Het wifi-paswoord op de site zetten, ja of nee?** Staat nu aan. Uit te zetten met
      `showPublicly: false` in `src/data/site.ts`
- [ ] **Hangen er camera's in de zaak?** Zo ja, dan móét dat in het privacybeleid staan.
      De kant-en-klare tekst staat al klaar als commentaar in
      `src/pages/privacy.astro`, onderaan bij het kopje "Uw rechten". Hangen er geen
      camera's, laat dan alles zoals het is. **Wij beweren voorlopig niets**, want een
      verkeerde bewering is erger dan geen
- [ ] **De naam en vestigingsplaats van de hostingpartij** invullen in het
      privacybeleid. Er staan twee stukken commentaar in `src/pages/privacy.astro`
      met de exacte zin die erin moet. Zolang dat niet ingevuld is, staat er op de
      site een correcte maar vage zin die naar `algemeen@` verwijst

---

## 4. Toegangen en sleutels

- [ ] **GitHub**: een account, en het project erop zetten
- [ ] **Netlify** (of Vercel of Cloudflare Pages): een gratis account, gekoppeld aan
      GitHub
- [ ] **De domeinnaam** `deomgekeerdewereld.be`: waar staat die geparkeerd, en wie kan
      aan de DNS-instellingen? Dat hebben we nodig om de site live te zetten
- [ ] **Het oude domein** `deomgekeerdewereldgent.be`: bestaat dat nog en is het van
      jullie? Dan zetten we er een omleiding op
- [ ] **Brevo** (het nieuwsbriefprogramma dat er al op stond): inloggegevens, zodat we
      de bestaande inschrijvers kunnen overzetten en de lijst kunnen koppelen
- [ ] **SuperHoreca** — dit is nodig vóór de reserveerknop iets doet. Drie dingen:
  - [ ] **Zet reservaties aan** in het SuperHoreca-dashboard. Ze staan nu op uit; het
        script zegt dat zelf. Zolang dat uit staat, opent het boekingsvenster leeg
  - [ ] **Vraag de publieke embed-URL**, op `https://` en niet op `localhost`. Het
        script dat SuperHoreca serveert heeft zijn eigen adres hard ingebakken, dus
        de localhost-versie werkt enkel op de computer van de ontwikkelaar
  - [ ] **Zet die URL** bij `reservations.embed` in `src/data/site.ts`. Zolang daar
        een localhost- of http-adres staat, toont de site geen knop maar gewoon het
        telefoonnummer. Bij het bouwen krijgt ge daar een waarschuwing over
- [ ] **Instagram**: wilt ge de laatste zes posts automatisch op de homepagina? Dan
      hebben we een toegangssleutel nodig via het Meta-ontwikkelaarsportaal. Wilt ge dat
      liever niet, dan blijft het bij vaste foto's en een knop naar het profiel — dat is
      sneller en er lekt niets naar Meta
- [ ] **Google Bedrijfsprofiel**: wie beheert dat? De nieuwe URL moet erin, en de uren
      moeten gelijklopen met de site

---

## 5. Beslissingen die jullie moeten nemen

- [ ] **Waar mogen de reservatieformulieren naartoe?** Nu gaat een groepsaanvraag naar
      `tristan@` en een samenwerking naar `ran@`. Klopt dat nog?
- [ ] **Wie beheert het beheerscherm op `/admin/`?** Geef ons de mailadressen, dan
      nodigen we die uit
- [ ] **De nieuwsbrief: hoe vaak?** Er staat nu "af en toe" op de site. Als ge weet dat
      het maandelijks wordt, schrijven we dat er liever bij
- [ ] **De Guido Gids-promo**: loopt die nog en tot wanneer? Ze staat nu in de kaart
- [ ] **De twee "BVDM"-promo's.** Op OrderBilly stonden Tripel D'Anvers en Tripel LeFort
      met de afkorting "BVDM" aan € 3,50. Wij lezen dat als "bier van de maand", maar
      omdat het bier van de maand nu Ouwen Duiker is, staat er op de site het neutralere
      "Maandpromo". Klopt dat, of mogen die eruit?
- [ ] **Het bier van de maand voor volgende maand.** Nu staat Ouwen Duiker erin

---

## 6. Nice to have, geen haast

- [ ] Een korte video van tien seconden van de zaal bij avond, voor sociale media
- [ ] De platendraaier-playlist, als er een is. Zou mooi staan op `/over/`
- [ ] Persknipsels of vermeldingen die we mogen citeren
- [ ] Een foto van de drie oprichters, als ze dat willen

---

**Vragen?** Alles wat hierboven staat is optioneel behalve blok 4 — dat hebben we nodig
om de site online te krijgen. De rest kan er in de weken erna bijkomen, stukje bij
beetje. De site werkt intussen gewoon.

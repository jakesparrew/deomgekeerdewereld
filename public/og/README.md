# De og-afbeelding

Deze map bevat één bestand:

**`omgekeerde-og.jpg` — exact 1200 x 630 pixels, liggend, JPG onder 400 kB.**

Dat is het beeld dat mee verschijnt wanneer iemand een link naar de site deelt in
WhatsApp, Messenger, Facebook, Instagram, LinkedIn of Slack. Voor veel mensen is
dat het eerste wat ze van den Omgekeerde zien.

`src/layouts/Base.astro` verwijst er standaard naar, op elke pagina, met dit pad:

```
/og/omgekeerde-og.jpg
```

Zet het bestand hier met exact die naam en het werkt overal vanzelf. Er hoeft
niks aangepast te worden in de code.

**Waarmee vullen?** Snijd `gevel-avond.jpg` uit `public/images/` bij op
1200 x 630. Hou het midden vrij en zet niks belangrijks aan de randen: sommige
apps snijden er nog een strook af. Tekst of logo in het beeld is niet nodig — de
titel van de pagina staat er in de app al naast.

Zolang dit bestand er niet staat, tonen die apps gewoon een link zonder beeld.
Er breekt niks, het staat er alleen minder mooi bij.

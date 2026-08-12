# Die unsichtbaren Fäden – Die Welt der drei Bände

Immersive Weltseite zum Bildband von Manuel & Uwe.
Band 1 ist der erste geöffnete Teil dieser Welt; Band 2 und Band 3 werden später ergänzt.

**Live:** https://manuelbrandner85.github.io/Buch-landingpage-/

## Veröffentlichen

Einmalig im Repository einstellen:
**Settings → Pages → Build and deployment → Source: `GitHub Actions`**

Danach genügt ein Push auf `main`: Der Workflow prüft die Weltdaten, baut den
statischen Export und veröffentlicht ihn. Pull Requests werden zusätzlich auf
TypeScript und Build geprüft.

Der Unterpfad `/Buch-landingpage-/` steckt in `.github/workflows/deploy.yml`
als `NEXT_PUBLIC_BASIS_PFAD`. Bei einer eigenen Domain fällt er ersatzlos weg –
lokal und auf Vercel läuft die Seite ohne diesen Wert.


```bash
npm install
npm run assets      # erzeugt AVIF/WebP aus assets-quelle/
npm run dev
```

`npm run typecheck` prüft TypeScript im Strict-Modus.
`npm run vorschau` erzeugt `vorschau/welt.html` – eine einzelne, offline lauffähige
Datei zum Ansehen ohne Server. Sie zieht Daten und Stylesheet aus denselben
Dateien wie die Anwendung; nachgebaut ist nur das Rendern.
`npm run build` erzeugt 30 statische Seiten: die Weltseite, sechs Kapitelseiten
und einundzwanzig Ortsseiten.

## Die Kinoebene

Alle Motive laufen in **einem WebGL2-Durchgang** (`src/engine/kino-webgl.js`), nicht
mehr als gestapelte DOM-Bühnen. Das war die Ursache des Flackerns: Zwei Vollbilder,
die sich über `opacity` gegenseitig ausblenden, summieren sich nie auf eins –
dazwischen schien das Schwarz durch. Jetzt gibt es zwei Texturen, zwei Tiefenkarten,
einen Mischwert. Korn, Vignette, Halation, Belichtung und chromatische Aberration
entstehen im selben Durchgang statt als vier Blendschichten.

`npm run tiefenkarten` erzeugt die Tiefenkarten. Das Verfahren ist eine Näherung
aus Bildhöhe und Helligkeit, je Motiv eingestellt – siehe Kopfkommentar des Skripts.
Mit den Originalrenderings sollte hier ein echtes Tiefenmodell laufen; die Kette
ändert sich dadurch nicht, die Engine liest weiterhin `<name>-tiefe.webp`.

Der Übergang gehört zur Szene, nicht zum System: Glut am Feuer, Lichtschwenk in der
Kammer, Brechung unter Wasser, Schichtwischer bei der Grabung. Er steht in den
Szenendaten als `uebergang`.

Trägt WebGL2 nicht – alter Browser, abgeschaltete Beschleunigung, „Bewegung
reduzieren“ –, übernimmt wieder die DOM-Fassung. Das ist kein Notbehelf, sondern
dieselbe Welt in ruhig.

### Kamerafahrten

Jede Szene hat ihre eigene Fahrt, und sie folgt dem Inhalt statt einem Schema
(`fahrt` in den Szenendaten):

| Szene | Fahrt | warum |
|---|---|---|
| Cover | aufsteigen | der Faden steigt vom Feuer zu den Säulen |
| Ostafrikanischer Graben | hinein | in den Graben hinein |
| Woher die Zahlen kommen | hinein | näher an den Fund |
| Ein Kreis aus Licht | hinein | an das Feuer heran |
| Vom Sammeln zur Pflege | aufsteigen | über das Feld zum Siedlungshügel |
| Unter dem Boden | absenken | unter den Boden, wo die Toten liegen |
| Reiche, Glaube und Macht | aufsteigen | an der Zikkurat hinauf |
| Die erste Bibliothek | schwenkLinks | an den Regalen entlang |
| Neun Tage statt neunzig | schwenkRechts | die Nachricht zieht weiter |
| Gesetz, Geld und Imperium | durchfahrt | die Straße hinunter zum Fluchtpunkt |
| Fünfzigtausend Handschriften | durchfahrt | durch die Wand in die Kammer |
| Am Rand des Belegten | heraus | der Nebel gibt den Blick frei |
| Städte, die versanken | schwenkLinks | an den Mauern vorbeitreiben |

Der Shader verrechnet die Fahrt mit der Tiefenkarte: Was vorne liegt, wandert
stärker als der Hintergrund. Erst dadurch wirkt die Bewegung räumlich statt wie
ein geschobenes Bild.

**Bewegtbild am Scroll:** Die Abspielgeschwindigkeit der Videos folgt dem Scroll
(0,45- bis 2-fach). Wer schnell scrollt, treibt die Szene an; wer stehen bleibt,
sieht sie fast still weiterlaufen. Gesucht wird dabei nicht — Springen im Video
ruckelt, Tempo ändern nicht.

Die Motivszenen sind entsprechend länger, damit die Fahrt Zeit hat: rund
190 bis 300 Bildschirmhöhen Scrollstrecke statt 140 bis 220.

### Bewegtbild – Herkunft

**Wichtig:** Bis auf das Cover sind **alle** Szenenmotive eigens für die Website
erzeugt und **nicht die Bilder aus dem Buch**. Die Ausschnitte aus dem Druck-PDF
sind vollständig ersetzt: Sie lagen bei 1000 bis 1200 Pixel im Hochformat und
mussten für das Breitbild stark beschnitten werden.

Stand jetzt: sieben bewegte Szenen aus 1920 × 1080, neun Standbilder aus
4096 × 2304, alle im Querformat 16:9. Das Cover bleibt unverändert das echte
Buchcover. Sie wurden eigens für die
Bewegtfassung erzeugt, weil sich die Buchmotive technisch nicht in die
Generierung einspeisen ließen. Inhaltlich folgen sie den Buchszenen, und sie
tragen dieselbe Herkunftsangabe wie im Band – „Freie Rekonstruktion“ –, aber wer
Buch und Website nebeneinanderlegt, sieht zwei verschiedene Bilder derselben Szene.
Das muss vor dem Livegang entschieden werden: entweder so belassen oder die
Bewegtfassung aus den Originalrenderings neu erzeugen.

Erzeugt mit VideoSlash: Standbilder `seedream-45` (0,2 Credits bei 2K,
0,35 bei 4K), Bewegung `kling-30`, 5 Sekunden, 1080p (11,2 Credits je Szene).

**Auslieferung:** AVIF und WebP in fünf Breiten bis 2560 px, AVIF in Qualität 60
mit vollem Farbunterabtasten. Videos in zwei Stufen – 1920 px in CRF 21 für den
Schirm, 1280 px in CRF 25 für Telefone und schmale Verbindungen. VP9 wird nicht
mehr erzeugt: Die Engine lädt ohnehin nur MP4, und die Kodierung kostete ein
Vielfaches der Zeit bei kaum sichtbarem Gewinn.
`node scripts/motion-holen.mjs <name> <url>` holt das Ergebnis, kodiert MP4 und
WebM, zieht das erste Bild als Standbild und Poster.

### Bewegtbild

Die Engine kann Videotexturen. Eine Szene bekommt in den Szenendaten `motion`,
die Datei heißt `<name>-motion.mp4` neben dem Standbild. Bis dahin – und immer,
wenn Bewegtbild nicht vertretbar ist – bleibt das Standbild stehen:

- bei „Bewegung reduzieren“,
- im Datensparmodus des Browsers,
- auf 2G-Verbindungen,
- solange das Video nicht genug gepuffert hat.

Es laufen höchstens zwei Videos gleichzeitig: die aktuelle Szene und ihre
Nachbarin. Alles weiter weg wird pausiert, nicht nur unsichtbar gemacht.
Das Standbild ist zugleich das Poster – es gibt keinen schwarzen Moment.

### Zwei Fallen, die hier steckten

- Das Trägheitsscrollen kämpfte gegen jeden Ankersprung. Die Schleife übernimmt
  jetzt fremde Scrollbewegungen, statt gegen sie anzulaufen – sonst funktioniert
  „In die Szene“ von der Karte nicht.
- Der Zeitschritt der Kameradämpfung war auf 0,05 s gedeckelt. Auf Geräten unter
  zwanzig Bildern je Sekunde wurde dadurch nur ein Bruchteil der vergangenen Zeit
  verrechnet: Die Kamera blieb dauerhaft eine halbe Szene zurück und stand im
  Übergang, obwohl der Titel längst mittig stand. Jetzt 0,25 s.

## Performance

Gemessen an der ausgelieferten Seite, nicht geschätzt:

| | vorher | nachher |
|---|---|---|
| Anfragen beim Start | 51 | 24 |
| Bilddaten beim Start | 1,25 MB (34 Dateien) | 0,25 MB (8 Dateien) |
| Video beim Start | 1,34 MB | keines |
| Schriftdaten | 0,16 MB | 0,12 MB |

Drei Ursachen steckten dahinter:

1. **Alle Motive wurden sofort geladen.** Die Engine zog beim Start sechzehn
   Texturen, von denen der Besucher eine sah. Jetzt liegt ein Fenster um die
   aktuelle Position – die Szene selbst, die vorige, die nächsten zwei.
2. **Ein Video lud auf dem schwarzen Einstieg.** Die Nachbarszene galt ab dem
   ersten Bild als „nah". Der Abstand wird jetzt an der gleitenden Position
   gemessen: Das Laden beginnt kurz bevor die Szene an der Reihe ist.
3. **Ein Telefon bekam dieselbe Auflösung wie ein 4K-Schirm.** Die Motivbreite
   folgt jetzt Fensterbreite und Pixeldichte, zwischen 640 und 2560 px.
   Auf schmalen Verbindungen und kleinen Geräten läuft zusätzlich die
   kleinere Videofassung.

- GSAP wird erst geladen, wenn die Kamera gebraucht wird. Wer die ruhige Fassung
  wählt oder „Reduce Motion“ gesetzt hat, lädt die Animationsbibliothek nie.
- Die Kinoebene nutzt `image-set()`: der Browser wählt zwischen AVIF und WebP
  und zwischen den Auflösungen. AVIF ist rund fünfzehn Prozent kleiner.
- Das erste Motiv wird per `preload` vorgeladen, damit der Einstieg sofort da ist.

## Aufbau

```
src/
  world/registry.ts     Die Welt = Summe der Bände. Neue Bände nur hier einhängen.
  engine/               Scene Engine, Kinoebene, Cover-Geometrie
  scenes/               Die sieben Szenentypen als Komponenten
  camera/               Scrollkamera (GSAP/ScrollTrigger) und Faden
  animation/ audio/     Partikel und erzeugte Atmosphäre
  ui/                   Kopfzeile, Evidenzregler, Zeitleiste, Kapitelmarke
  data/
    gemeinsam/          Typen, Orte, Zeitleiste – bandübergreifend
    band-1/             Kapitel, Szenen, Assets
    band-2/             leer, wartet auf Inhalte
```

## Die drei Regeln dieses Projekts

1. **Nichts erfinden.** Jede Szene nennt ihre `buchseite`. Zahlen, Zitate und
   Evidenzstufen stammen aus dem Band. Die Herkunftsbadges entsprechen dem
   Bildnachweis (S. 201): kein Motiv ist eine historische Fotografie.
2. **Szenen sind Daten.** Eine neue Szene ist ein Eintrag in `data/<band>/szenen.ts`.
   Die Engine kennt sieben Typen und braucht dafür keine neue Logik.
3. **Orte gehören der Welt, nicht dem Band.** `data/gemeinsam/orte.ts` sammelt alle
   Vorkommen über alle Bände. Ein Ort aus Band 1, der in Band 2 wiederkehrt,
   bekommt dort nur einen weiteren Eintrag in `vorkommen` – kein zweites Asset.

## Band 2 hinzufügen

1. `src/data/band-2/` mit `band.ts`, `szenen.ts`, `assets.ts` füllen
2. Assets nach `public/assets/band-2/szenen/` legen
3. In `src/data/gemeinsam/orte.ts` bei wiederkehrenden Orten `vorkommen` ergänzen
4. `amazonUrl` eintragen

Kein Eingriff in `engine/`, `scenes/` oder `camera/`.

## Begriffe

Im Buch stehen erklärte Fachbegriffe in Gold. In der Welt auch – nur lassen sie sich
antippen; die Erklärung erscheint unter dem Absatz statt als Überlagerung.
`src/data/gemeinsam/begriffe.ts` enthält zehn Begriffe, deren Erklärung **wörtlich**
aus dem Band übernommen werden konnte, dazu `/welt/begriffe` als Übersicht.

Das Glossar des Bandes (S. 196–198) umfasst mehr Einträge. Es wird nachgetragen,
sobald der Text als Datei vorliegt. Aus einer Texterkennung übernommen wäre er an zu
vielen Stellen still verfälscht – und ein Glossar mit falschen Erklärungen ist
schlimmer als ein kurzes. Dasselbe gilt für das Quellenverzeichnis (S. 199–200):
Autorennamen und Jahreszahlen aus einer Erkennung zu übernehmen hieße, falsche
Belege zu behaupten.

## Seiten neben der Welt

- `/ueber` – wie die Welt gemacht ist: Bildherkunft, Evidenzstufen, Kartengrundlagen,
  was lokal gespeichert wird. Ein Buch, das zu jeder Aussage die Beleglage ausweist,
  kann sich keine Website leisten, die über ihre eigenen Grundlagen schweigt.
- `/impressum` – Pflichtangaben nach § 5 DDG und Art. 13 DSGVO, als Entwurf mit
  Platzhaltern in Großbuchstaben. **Vor dem Livegang ausfüllen und rechtlich prüfen
  lassen.** Erfundene Angaben wären hier besonders schädlich.

## Amazon

`AMAZON_BAND_1_URL`, `AMAZON_BAND_2_URL`, `AMAZON_BAND_3_URL` sind Platzhalter in
`src/data/<band>/band.ts`. Sobald die Produktseiten vorliegen, werden nur diese
Werte ersetzt. Es gibt keine eigene Zahlungsabwicklung.

## Interaktive Module

Zwei Argumente des Buches lassen sich nur bedienen, nicht abbilden:

- **Fünf Ringe um einen Menschen** (S. 109) – der Zugang zum Herrscher ist gestaffelt.
  Man kommt nur einen Ring pro Klick weiter; jede Stufe kennt nur die nächste nach innen.
- **Dreihundert Jahre Verdünnung** (S. 138) – der Regler zieht den Silberanteil des
  Denars von 96 auf 5 Prozent. Die Münze sieht dabei unverändert aus. Das ist der Punkt.

- **Neun Tage statt neunzig** (S. 104) – zwei Marken laufen dieselbe Strecke von Susa
  nach Sardes. Man sieht nicht, dass die eine schneller ist; man sieht, wie weit die
  andere noch entfernt ist, wenn die Nachricht längst angekommen ist.
- **Die Prüfung** (S. 173) – die fünf Fragen von Seite 168, Frage für Frage angewendet.
  Das Ergebnis erscheint erst am Ende, damit sichtbar wird, wie es zustande kommt.

Alle vier stehen im Papierregister, weil sie im Buch „Eigene Darstellung“ sind, keine Motive.

Bei der Prüfung fehlen die Evidenzstufen: In der Tabelle auf Seite 173 sind sie im
vorliegenden Scan nicht sicher lesbar. Lieber keine Angabe als eine erfundene.

## Bildabzüge

`npm i -D puppeteer` einmalig, dann `npm run abzug`: legt in `abzug/` Aufnahmen
der wichtigsten Szenen ab. Damit lässt sich das eigene Werk prüfen, ohne den
Browser zu öffnen – drei Fehler sind auf diesem Weg gefunden worden: ein
Buchcover ohne Größenbegrenzung, ein Evidenzregler, der auf Papierseiten
stehenblieb, und der Faden, der über das Papier lief statt in der Nacht zu bleiben.

## Barrierefreiheit

`npm i -D puppeteer axe-core`, dann `npm run pruefe:a11y`: axe-core gegen die Vorschau,
Stufe WCAG 2.1 AA. Stand: **0 Verstöße**, auch im Hochformat.

Vier Befunde wurden dabei behoben:

- Text war an 31 Stellen über Deckkraft abgedunkelt (Quellenzeilen, Fußzeile,
  Ankunftstext). Deckkraft zerstört den Kontrast – heruntergesetzt wird jetzt über Farbe.
- Gold auf Elfenbein kommt auf 1,4 : 1. Im Druck trägt das, auf dem Bildschirm nicht.
  Auf Papierseiten steht die Unterzeile deshalb in tiefem Bronze.
- Geschlossene Ringe und ungeprüfte Fragen waren auf 40 Prozent Deckkraft gesetzt,
  obwohl sie Information tragen. Sie treten jetzt über Farbe zurück.
- Der Herkunftsbadge stand innerhalb der Definitionsliste der Marginalspalte.

## Datenprüfung

`npm run pruefen` läuft automatisch vor jedem Build (`prebuild`). Der Build bricht ab, wenn

- eine Szene mit Buchinhalt keine `buchseite` nennt,
- ein Motiv ohne Herkunftsbadge oder ohne „Woher wir das wissen“ auskommt,
- eine Szene auf ein Asset oder ein Kapitel zeigt, das es nicht gibt,
- eine Evidenzstufe außerhalb von A bis G liegt,
- eine Seitenzahl außerhalb von Band 1 liegt,
- oder eine Bilddatei fehlt.

Der Anspruch des Buches ist Belegbarkeit. Die Website hält ihn technisch durch,
statt sich darauf zu verlassen, dass beim Eintragen niemand etwas vergisst.

## Mobil

Mobil ist eine eigene Erfahrung, keine verkleinerte: Jede Szene bekommt dort
rund 62 Prozent ihrer Scrollstrecke (im Querformat die Hälfte), weil pro
Bildschirmhöhe mehr passieren muss. Die Coverebenen entfallen im Hochformat –
sie greifen dort kaum und kosten auf schwächeren Geräten Rechenzeit. Partikel
laufen in halber Dichte, der Weichzeichner hinter dem Evidenzregler entfällt.

## Erkundung

Die Welt merkt sich lokal im Browser, welche Szenen schon gesehen wurden
(`src/world/fortschritt.ts`, kein Konto, keine Übertragung). Daraus folgen drei Dinge:

- Auf der Karte leuchten besuchte Orte stärker als unbesuchte.
- Wer wiederkommt, bekommt auf der Ankunftsseite einen leisen Ausgang direkt in die Welt.
- Von einem Ort auf der Karte führt „In die Szene“ zurück in das Kapitel, das ihn belegt.

Das ist Orientierung, keine Gamification: es gibt keine Punkte, keine Abzeichen
und nichts freizuschalten.

## Offen

- Coverdatei **ohne Typografie** – sonst parallaxt der Titel mit dem Himmel mit
- Originalrenderings statt PDF-Ausschnitte (Druck-PDF: eine flache Ebene je Seite)
- Freistellung der Tiefenebenen (`layer-01…05.png`); VideoSlash hat dafür keine Funktion
- AI-Motion: sieben Sequenzen, Plan und Kosten in `Stufe4_SceneMap_und_Produktionsplan.md`

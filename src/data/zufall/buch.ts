import type { Buch } from '../gemeinsam/typen';

/**
 * „Alles nur Zufall?" — ein Einzeltitel, keine Reihe.
 *
 * Das Haus kennt bisher nur Reihen mit mehreren Bänden. Ein Einzeltitel ist
 * deshalb eine Reihe mit genau einem Band: Die Datenform bleibt dieselbe, und
 * die Seiten lassen die Bandzählung weg, sobald eine Reihe nur einen Band hat
 * (siehe `istEinzeltitel` in `world/registry.ts`). Kein neuer Typ, eine Regel.
 *
 * Das Buch hat keine begehbare Welt: keine Kapitelseiten, keine Szenen, keine
 * Karte. Es ist ein Lesebuch mit vierzig kurzen Kapiteln, kein Ort. Ein Band
 * ohne Szenen bekommt vom Haus schlicht kein Weltentor.
 */
export const BUCH_ZUFALL: Buch = {
  id: 'zufall',
  reiheId: 'zufall',
  nummer: 1,
  titel: 'Alles nur Zufall?',
  unterzeile: '40 Theorien, die die Welt erklären. Angeblich.',
  suchzeile: '40 Verschwörungstheorien',
  // Seit dem 31.08.2026 im Handel. Beide Ausgaben stehen im KDP-Bücherregal
  // auf „Live"; ASIN, Preise und ISBN sind dort abgelesen, nicht geschätzt.
  //
  // Achtung bei den Preisen: KDP zeigt beim Taschenbuch den NETTO-Preis
  // (28,03 €), auf der Produktseite steht der Ladenpreis mit sieben Prozent
  // Buchsteuer — 29,99 €. Genau der gehört hierher, sonst steht auf der
  // eigenen Seite ein anderer Preis als bei Amazon. Beim E-Book ist der
  // KDP-Wert schon der Ladenpreis.
  status: 'erschienen',
  kaufwege: [
    {
      haendler: 'Amazon', form: 'Taschenbuch',
      url: 'https://www.amazon.de/dp/B0HH65RRKG',
      isbn: '979-8170553914', preis: 29.99,
    },
    {
      haendler: 'Amazon', form: 'E-Book',
      url: 'https://www.amazon.de/dp/B0HH8KFYDY',
      preis: 9.99, hinweis: 'in Kindle Unlimited enthalten',
    },
  ],
  // Das Datum aus dem KDP-Bücherregal: Das Taschenbuch steht dort als „Live,
  // eingereicht am 30. August 2026". Weicht der Erscheinungstermin auf der
  // Produktseite davon ab, gilt der — er ist der öffentliche.
  erschienen: '2026-08-30',
  coverAsset: 'cover-zufall',
  seiten: 456,
  klappentext:
    'Die Erde ist eine Scheibe. Die Mondlandung war ein Filmset. Und über dir '
    + 'versprüht jemand Chemikalien, damit du müde bleibst. Vierzig Theorien, '
    + 'die die Welt erklären — angeblich. Dieses Buch nimmt sie alle ernst, '
    + 'genau so lange, bis man nachsieht. Es liest sich wie eine '
    + 'Kommentarspalte, aus der man nicht mehr herauskommt. Und dann, wenn man '
    + 'am lautesten gelacht hat, steht da ein Logbuch, ein '
    + 'Untersuchungsbericht, eine Tabelle des Statistischen Bundesamtes: '
    + 'öffentlich, kostenlos, fast nie gelesen.',
};

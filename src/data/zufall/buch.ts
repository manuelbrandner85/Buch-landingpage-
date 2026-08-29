import type { Asset, Buch } from '../gemeinsam/typen';

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
  // Beide Ausgaben sind bei KDP eingereicht und liegen in der Prüfung.
  // Solange keine Produktseite existiert, gibt es keinen Kaufweg — und
  // niemals einen erfundenen Link.
  status: 'erscheint',
  kaufwege: [],
  coverAsset: 'cover-zufall',
  seiten: 456,
  stand: {
    kurz: 'Bei Amazon in Prüfung',
    satz: 'Taschenbuch und Kindle-Ausgabe sind eingereicht und liegen in der '
      + 'Prüfung. Sobald die Produktseiten stehen, erscheinen hier die '
      + 'Kaufwege. Der Innenteil ist fertig gesetzt: 456 Seiten, vierzig '
      + 'Kapitel, vierzig Abbildungen, vierzig nachschlagbare Quellen.',
    vom: '2026-08-29',
  },
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

/**
 * Der Umschlag, aus derselben Druckdatei freigestellt wie bei den Fäden
 * (scripts/umschlag.mjs). Rücken 0,1712 der Umschlagbreite — 456 Seiten
 * sind ein dicker Band.
 */
export const ASSETS_ZUFALL: Asset[] = [
  {
    id: 'cover-zufall',
    bandId: 'zufall',
    datei: 'cover-zufall',
    breite: 1200,
    hoehe: 1800,
    herkunft: 'Eigene Darstellung',
    alt: 'Umschlag von „Alles nur Zufall?“: heller Papierton, darüber das '
      + 'goldene Trendonix-Monogramm, der Titel in schwerer Versalschrift, '
      + 'darunter in Rot der Untertitel und ein nachgestellter '
      + 'Kommentarverlauf zwischen vier Sprechenden.',
  },
];

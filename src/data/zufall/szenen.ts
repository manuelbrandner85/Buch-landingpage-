import type { Szene } from '../gemeinsam/typen';

/**
 * Die Welt von „Alles nur Zufall?“ — zwei Szenen, mehr braucht sie nicht.
 *
 * Die Fäden haben Welten aus Landschaften: man geht hindurch, Kapitel für
 * Kapitel. Dieses Buch spielt nicht in einer Landschaft, sondern in einem
 * Telefon, und deshalb sieht seine Welt anders aus. Sie besteht aus einem Weg
 * hinein und aus dem, was drinnen ist.
 *
 * `eintauchen` ist der Weg: Ein ausgeschaltetes Gerät liegt auf Schiefer, die
 * Kamera fährt beim Scrollen hinein, der Bildschirm wacht auf, seine Ränder
 * laufen aus dem Bild. Ab da gibt es kein Außen mehr — genau das ist der
 * Vorgang, den das Buch beschreibt.
 *
 * `feed` ist das Drinnen: vierzig Behauptungen hintereinander, in der zweiten
 * Leseordnung des Buches. Was jede einzelne wert ist, steht nicht hier. Es
 * steht in der Quelle, die daneben verlinkt ist — und im Buch.
 */
export const SZENEN_ZUFALL: Szene[] = [
  {
    id: 'eintauchen',
    bandId: 'zufall',
    typ: 'eintauchen',
    platte: 'buehne-handy',
    hoehe: 300,
    eyebrow: 'Alles nur Zufall?',
    titel: 'Vierzig Theorien, die die Welt erklären',
    unterzeile: 'Angeblich.',
    fliesstext: 'Scrolle. Das Gerät liegt schon da.',
  },
  {
    id: 'feed',
    bandId: 'zufall',
    typ: 'feed',
    eyebrow: 'Der Feed',
    titel: 'Vierzig Behauptungen, ohne Auflösung',
    // Die Reihenfolge ist die des Buches, nicht die Kapitelnummer. Warum,
    // steht in `feed.ts` bei LESEORDNUNG.
    fliesstext: 'Die Konten sind erfunden, die Zahlen darunter auch — das sagt '
      + 'das Buch in seinem Vorwort selbst. Die Quellen dahinter sind es nicht.',
  },
];

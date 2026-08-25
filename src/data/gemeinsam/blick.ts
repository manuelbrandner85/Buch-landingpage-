import type { BandId } from './typen';

/**
 * Blick ins Buch.
 *
 * Bei einem Bildband ist die stärkste Auskunft die Seite selbst: Wer sieht,
 * wie eine Doppelseite gesetzt ist – Motiv, Marginalie, Evidenztabelle,
 * Schlüsselsatz –, weiß in fünf Sekunden mehr als aus jedem Klappentext.
 *
 * Die Bilder stammen aus den Druckdateien der Bände, nicht aus Entwürfen.
 * Erzeugt mit `pdftoppm -r 150`, abgelegt unter `public/blick/`.
 */
export interface Blickseite {
  /** Die Seitenzahl, wie sie unten auf der Seite steht. */
  seite: number;
  /** Was auf dieser Seite zu sehen ist – für Screenreader und Bildunterschrift. */
  was: string;
}

export const BLICK: Record<BandId, Blickseite[]> = {
  'band-1': [
    { seite: 14, was: 'Unterkapitel mit Balkenvergleich, Marginalie und Kasten' },
    { seite: 17, was: 'Fundseite: Motiv, Kennzahlen und „Was der Fund nicht sagt“' },
    { seite: 18, was: 'Zwischenbilanz: gesichert und offen nebeneinander, drei Zahlen' },
    { seite: 30, was: 'Zitatseite mit Herkunft des Satzes' },
  ],
  'band-2': [
    { seite: 12, was: 'Kapitelauftakt mit randabfallendem Motiv' },
    { seite: 15, was: 'Textseite mit Zeitleiste und Gegenüberstellung' },
    { seite: 46, was: 'Kapitelbilanz: Belegtabelle, Zahlen, offene Fragen' },
    { seite: 82, was: 'Kapitelauftakt: Hafenanlagen des Mittelmeers' },
  ],
  'band-3': [
    { seite: 12, was: 'Kapitelauftakt: Maschinenhalle mit der Uhr an der Stirnwand' },
    { seite: 16, was: 'Evidenztabelle: fünf Zeilen, fünf Grade' },
    { seite: 116, was: 'Kapitelbilanz mit Zeitleiste und Behauptet/Nicht behauptet' },
    { seite: 152, was: 'Kapitelauftakt: Kabelanlandung an einer Nordküste' },
  ],
};

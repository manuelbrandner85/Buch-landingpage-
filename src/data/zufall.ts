import type { Reihe } from './gemeinsam/typen';
import { BAND_ZUFALL } from './zufall/index';

/**
 * Die zweite Reihe des Hauses — und die erste, die nur aus einem Band besteht.
 *
 * Sie hat kein Hausmotiv und keine begehbare Welt. Was sie hat, ist ein Buch,
 * und das genügt: Das Haus zeigt Reihen mit Welten als Tor, Reihen ohne Welt
 * ausschließlich im Regal.
 */
export const REIHE_ZUFALL: Reihe = {
  id: 'zufall',
  titel: 'Alles nur Zufall?',
  unterzeile: '40 Theorien, die die Welt erklären. Angeblich.',
  einladung:
    'Man muss nicht wissen, wie etwas funktioniert. Man muss nachsehen, ob es stimmt.',
  /**
   * Die Leitfarbe der Reihe – seit dem 30.08.2026 kein Signalrot mehr.
   *
   * Vorher stand hier #c41e1a. Das ist die Farbe, in der Browser Fehler
   * anzeigen und Formulare meckern; auf dem Nachtblau des Hauses sah der Rand
   * um „Alles nur Zufall?" nach Warnung aus, nicht nach Buch. Neben dem Gold
   * der Fäden war es außerdem der einzige Ton, der zu keiner anderen Fläche
   * der Seite passte.
   *
   * Jetzt ein gebranntes Rot: dieselbe Familie wie das Weinrot der
   * Papierseiten (--weinrot), aber hell genug, um auf dem Nachtblau lesbar zu
   * bleiben – gemessen 5,1:1 gegen den Grund, die Grenze liegt bei 4,5.
   */
  signatur: '#c4685c',
  // Das Tor auf der Startseite zeigt kein Kapitelmotiv, sondern das Gerät —
  // weil man in dieser Welt nicht in eine Landschaft geht, sondern in ein
  // Telefon.
  hausmotiv: 'buehne-handy',
  baende: [BAND_ZUFALL],
};

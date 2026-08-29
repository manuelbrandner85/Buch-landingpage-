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
  signatur: '#c41e1a',
  baende: [BAND_ZUFALL],
};

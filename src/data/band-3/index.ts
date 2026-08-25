import type { Band } from '../gemeinsam/typen';
import { BUCH_BAND_3, KAPITEL_BAND_3 } from './band';
import { SZENEN_BAND_3 } from './szenen';

/**
 * Band 3 ist angelegt und mit Kapiteln in der Welt, aber noch nicht
 * erschienen. `assets` bleibt leer, solange keine Bewegtmotive für die
 * Website erzeugt sind.
 */
export const BAND_3: Band = {
  buch: BUCH_BAND_3,
  kapitel: KAPITEL_BAND_3,
  szenen: SZENEN_BAND_3,
  assets: [],
};

export { STIMMUNG_BAND_3 } from './band';

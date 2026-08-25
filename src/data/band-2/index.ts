import type { Band } from '../gemeinsam/typen';
import { BUCH_BAND_2, KAPITEL_BAND_2 } from './band';
import { SZENEN_BAND_2 } from './szenen';
import { ASSETS_BAND_2 } from './assets';

/**
 * Band 2 ist erschienen und mit Kapiteln, Szenen und Motiven in der Welt.
 * Orte und Objekte kommen weiterhin aus data/gemeinsam/ – ein Ort aus Band 1,
 * der hier wiederkehrt, bekommt dort nur einen weiteren Eintrag in `vorkommen`.
 */
export const BAND_2: Band = {
  buch: BUCH_BAND_2,
  kapitel: KAPITEL_BAND_2,
  szenen: SZENEN_BAND_2,
  assets: ASSETS_BAND_2,
};

export { STIMMUNG_BAND_2 } from './band';

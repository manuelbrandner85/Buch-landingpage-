import type { Band } from '../gemeinsam/typen';
import { BUCH_BAND_2, KAPITEL_BAND_2 } from './band';
import { SZENEN_BAND_2 } from './szenen';

/**
 * Band 2 ist erschienen und mit Kapiteln und Szenen in der Welt.
 * `assets` bleibt leer: Die Bewegtmotive für die Website sind für diesen
 * Band noch nicht erzeugt. Orte und Objekte kommen weiterhin aus
 * data/gemeinsam/ – ein Ort aus Band 1, der hier wiederkehrt, bekommt dort
 * nur einen weiteren Eintrag in `vorkommen`.
 */
export const BAND_2: Band = {
  buch: BUCH_BAND_2,
  kapitel: KAPITEL_BAND_2,
  szenen: SZENEN_BAND_2,
  assets: [],
};

export { STIMMUNG_BAND_2 } from './band';

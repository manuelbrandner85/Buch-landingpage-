import type { Band } from '../gemeinsam/typen';
import { BUCH_BAND_3, KAPITEL_BAND_3 } from './band';
import { SZENEN_BAND_3 } from './szenen';
import { ASSETS_BAND_3 } from './assets';

/** Band 3: gesetzt, begehbar, aber noch nicht im Handel – Zustand „erscheint". */
export const BAND_3: Band = {
  buch: BUCH_BAND_3,
  kapitel: KAPITEL_BAND_3,
  szenen: SZENEN_BAND_3,
  assets: ASSETS_BAND_3,
};

export { STIMMUNG_BAND_3 } from './band';

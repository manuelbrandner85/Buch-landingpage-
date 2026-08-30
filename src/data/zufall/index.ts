import type { Band } from '../gemeinsam/typen';
import { BUCH_ZUFALL } from './buch';
import { ASSETS_ZUFALL } from './assets';
import { SZENEN_ZUFALL } from './szenen';

/**
 * Ein Band mit Welt, aber ohne Kapitelseiten.
 *
 * `kapitel` bleibt leer, und das ist eine Entscheidung, kein Versehen: Eine
 * Kapitelseite je Theorie wäre das Buch in Zweitverwertung. Was die Welt
 * zeigt, ist der Feed — die Behauptung, so wie man ihr sonst auch begegnet.
 * Die Auflösung steht im Band, die Quelle unter /q/01 bis /q/40.
 */
export const BAND_ZUFALL: Band = {
  buch: BUCH_ZUFALL,
  kapitel: [],
  szenen: SZENEN_ZUFALL,
  assets: ASSETS_ZUFALL,
};

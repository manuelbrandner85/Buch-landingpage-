import type { Band } from '../gemeinsam/typen';
import { ASSETS_ZUFALL, BUCH_ZUFALL } from './buch';

/**
 * Ein Band ohne Welt.
 *
 * `kapitel` und `szenen` bleiben leer, und das ist kein Mangel: Die vierzig
 * Kapitel dieses Buches sind Lesestücke, keine Orte. Das Haus baut daraus
 * folgerichtig keine Kapitelseiten und kein Weltentor — es zeigt eine
 * Buchseite, und die ist hier die ganze Sache.
 */
export const BAND_ZUFALL: Band = {
  buch: BUCH_ZUFALL,
  kapitel: [],
  szenen: [],
  assets: ASSETS_ZUFALL,
};

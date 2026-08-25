import type { Reihe } from './gemeinsam/typen';
import { BUCH_BAND_1, KAPITEL_BAND_1, STIMMUNG } from './band-1/band';
import { SZENEN_BAND_1 } from './band-1/szenen';
import { ASSETS_BAND_1 } from './band-1/assets';
import { BAND_2, STIMMUNG_BAND_2 } from './band-2';
import { BAND_3, STIMMUNG_BAND_3 } from './band-3';

/**
 * Die erste Reihe des Hauses: drei Bände, eine durchlaufende Zählung von
 * Kapitel 1 bis 16, eine gemeinsame Weltkarte. Die Zählung gilt innerhalb
 * dieser Reihe – eine zweite Reihe fängt wieder bei Kapitel 1 an.
 */
export const REIHE_FAEDEN: Reihe = {
  id: 'faeden',
  titel: 'Die Unsichtbaren Fäden',
  unterzeile: 'Eine Geschichte der Werkzeuge, die zweierlei bewirkten',
  einladung:
    'Vom ersten geteilten Feuer bis zur zugemauerten Kammer mit fünfzigtausend '
    + 'Handschriften – und weiter bis an die Maschine, die Menschen nach der Uhr einteilt.',
  signatur: '#c9a227',
  // Das geteilte Feuer: der erste Satz des ersten Bandes, als Bild.
  hausmotiv: 'feuerkreis',
  baende: [
    { buch: BUCH_BAND_1, kapitel: KAPITEL_BAND_1, szenen: SZENEN_BAND_1, assets: ASSETS_BAND_1 },
    BAND_2,
    BAND_3,
  ],
};

/**
 * Die Lichtstimmung läuft über die ganze Reihe, nicht über einen Band:
 * Band 1 von nachtblau zu staubig, Band 2 von Weinrot zu Blau, Band 3 kühl
 * und metallisch. Der Schlüssel ist die Kapitelnummer innerhalb der Reihe.
 */
export const STIMMUNG_FAEDEN: Record<number, [number, number, number]> = {
  ...STIMMUNG, ...STIMMUNG_BAND_2, ...STIMMUNG_BAND_3,
};

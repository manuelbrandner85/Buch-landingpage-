import type { Band } from '../gemeinsam/typen';

/**
 * Band 2 ist angelegt, aber noch leer.
 * Beim Erscheinen werden hier Kapitel, Szenen und Assets ergänzt –
 * ohne Eingriff in engine/, scenes/ oder camera/.
 * Orte und Objekte kommen weiterhin aus data/gemeinsam/.
 */
export const BAND_2: Band = {
  buch: {
    id: 'band-2', nummer: 2, titel: 'Band 2', status: 'in Arbeit',
    amazonUrl: 'AMAZON_BAND_2_URL',
    klappentext: 'Der Faden läuft weiter. Dieser Bereich der Welt öffnet sich mit dem Erscheinen.',
  },
  kapitel: [], szenen: [], assets: [],
};

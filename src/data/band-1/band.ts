import type { Buch, Kapitel } from '../gemeinsam/typen';

export const BUCH_BAND_1: Buch = {
  id: 'band-1',
  nummer: 1,
  titel: 'Ursprung und Ordnung',
  unterzeile: 'Von der Menschwerdung bis zu den Imperien der Antike',
  status: 'erschienen',
  amazonUrl: 'AMAZON_BAND_1_URL',
  coverAsset: 'cover',
  seiten: 206,
  klappentext:
    'Am Anfang teilten Menschen ein Feuer. Am Ende dieses Bandes liegt eine zugemauerte Kammer mit fünfzigtausend Handschriften. Dazwischen liegt keine Geschichte des Fortschritts, sondern eine Kette von Werkzeugen, die jeweils zweierlei bewirkten.',
};

export const KAPITEL_BAND_1: Kapitel[] = [
  { id: 1, bandId: 'band-1', titel: 'Feuer, Sprache und Wanderung',
    unterzeile: 'Wie Kooperation zum Überlebensvorteil wurde', seiten: [12, 39] },
  { id: 2, bandId: 'band-1', titel: 'Saat, Besitz und Hierarchie',
    unterzeile: 'Wie aus Vorrat die Frage nach Eigentum wurde', seiten: [40, 71] },
  { id: 3, bandId: 'band-1', titel: 'Reiche, Glaube und Macht',
    unterzeile: 'Was aus Städten Reiche macht', seiten: [72, 98] },
  { id: 4, bandId: 'band-1', titel: 'Krieg, Könige und Geheimbünde',
    unterzeile: 'Ein Reich ist größer als der Blick eines Menschen', seiten: [99, 128] },
  { id: 5, bandId: 'band-1', titel: 'Gesetz, Geld und Imperium',
    unterzeile: 'Wie Herrschaft unabhängig von der Person wurde', seiten: [129, 162] },
  { id: 6, bandId: 'band-1', titel: 'Am Rand des Belegten',
    unterzeile: 'Nicht die Deutung entscheidet, sondern ob sie sich prüfen lässt', seiten: [163, 193] },
];


/**
 * Lichtstimmung je Kapitel – als Kurve über den ganzen Band.
 *
 * Der Band beginnt kalt und nachtblau, wird mit der Sesshaftigkeit wärmer,
 * mit den Imperien staubig-golden und endet am Rand des Belegten entsättigt
 * und neblig. Werte sind Multiplikatoren auf Rot, Grün, Blau; die Engine
 * blendet zwischen benachbarten Szenen weich über.
 */
export const STIMMUNG: Record<number, [number, number, number]> = {
  1: [0.92, 0.97, 1.12],   // Nacht, Feuer als einzige Wärme
  2: [1.06, 1.00, 0.90],   // Erde, Korn, erstes Bleiben
  3: [1.10, 1.00, 0.86],   // Lehm und Ziegel, Sonne über der Stadt
  4: [1.08, 0.99, 0.92],   // Stein und Staub, kühler Schatten
  5: [1.12, 1.02, 0.84],   // Straße und Archiv, warm und staubig
  6: [0.94, 0.96, 1.04],   // Nebel, Wasser, Zurückhaltung
};

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

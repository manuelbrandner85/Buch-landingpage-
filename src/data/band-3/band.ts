import type { Buch, Kapitel } from '../gemeinsam/typen';

/**
 * Band 3 schließt die Reihe. Titel, Untertitel und Klappentext stehen auf dem
 * fertigen Umschlag; Kapitelnamen und Seitenbereiche stammen aus der
 * Kapitelarchitektur (`BAND_3_ARCHITEKTUR.md`), die den Seitenplan 1–206
 * festlegt und mit der Kapitelvorschau verbindlich wird.
 *
 * Stand: Kapitel 12, 13 und 16 sind gesetzt, 14 und 15 sind geplant.
 * Der Band steht deshalb auf „in Arbeit“ – bis zum Erscheinen wird er
 * öffentlich nicht angekündigt.
 */
export const BUCH_BAND_3: Buch = {
  id: 'band-3',
  reiheId: 'faeden',
  nummer: 3,
  titel: 'Krieg, Ordnung und Netz',
  unterzeile: 'Vom Weltkrieg bis zur vernetzten Gegenwart',
  status: 'in Arbeit',
  kaufwege: [],
  seiten: 206,
  klappentext:
    'Am Anfang steht ein Schützengraben, in dem die Ordnung der Fabrik auf den Krieg trifft. Am Ende steht ein Rechenzentrum, dessen Betreiber Regeln setzt, ohne gewählt zu sein. Dazwischen liegen drei Anläufe, die Welt zu ordnen – Verträge, Blöcke, Märkte. Jeder hat gehalten, bis der nächste ihn ablöste.',
};

/**
 * Kapitel 12 bis 16. Die Unterzeile ist die Leitfrage des Kapitels aus der
 * Architektur; auf den gesetzten Auftakten steht sie als Zeile unter dem Titel.
 */
export const KAPITEL_BAND_3: Kapitel[] = [
  { id: 12, bandId: 'band-3', titel: 'Krieg, Maschine und Massengesellschaft',
    unterzeile: 'Was geschieht, wenn die Ordnung der Fabrik die Fabrik verlässt', seiten: [12, 46] },
  { id: 13, bandId: 'band-3', titel: 'Krise, Ideologie und Zusammenbruch',
    unterzeile: 'Warum eine Ordnung zusammenbricht, die auf dem Papier funktioniert', seiten: [47, 81] },
  { id: 14, bandId: 'band-3', titel: 'Vertrag, Dollar und Blöcke',
    unterzeile: 'Wer schreibt die Regeln, wenn eine Welt neu geordnet wird', seiten: [82, 116] },
  { id: 15, bandId: 'band-3', titel: 'Öl, Container und Konzerne',
    unterzeile: 'Wem gehört eine Ordnung, die niemand beschlossen hat', seiten: [117, 151] },
  { id: 16, bandId: 'band-3', titel: 'Kabel, Daten und Abhängigkeit',
    unterzeile: 'Wo verläuft der Faden jetzt – und wer hält ihn', seiten: [152, 186] },
];

/**
 * Lichtstimmung je Kapitel – abgeleitet aus den fünf Kapitelfarben, die die
 * Architektur festlegt (Violettgrau, gebranntes Rotbraun, Petrol, dunkles
 * Ocker, Stahlblau). Band 3 ist kühler und metallischer als Band 2;
 * dieselbe Bewegung trägt hier die Kinoebene.
 */
export const STIMMUNG_BAND_3: Record<number, [number, number, number]> = {
  12: [0.99, 0.96, 1.06],   // Violettgrau – Maschinenhalle, Transmission
  13: [1.11, 0.95, 0.94],   // gebranntes Rotbraun – Bruch, Krise, Feuerschein
  14: [0.92, 1.03, 1.05],   // Petrol – Vertragssaal, Waage, kaltes Licht
  15: [1.08, 1.02, 0.90],   // dunkles Ocker – Öl, Staub, Hafenbecken
  16: [0.90, 0.98, 1.12],   // Stahlblau – Kabel, Nordküste, Rechenzentrum
};

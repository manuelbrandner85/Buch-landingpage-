import type { Buch, Kapitel } from '../gemeinsam/typen';

/**
 * Band 2. Alle Angaben stammen aus dem gesetzten Band selbst:
 * Titel, Untertitel und Klappentext vom Umschlag (206 Seiten, Stand 24.08.2026),
 * die Kapitelnamen aus dem Inhaltsverzeichnis (S. 8–10) und der Umschlagrückseite,
 * die Seitenbereiche aus dem verbindlichen Seitenplan der Kapitelvorschauen.
 */
export const BUCH_BAND_2: Buch = {
  id: 'band-2',
  nummer: 2,
  titel: 'Glaube, Gold und Revolution',
  unterzeile: 'Vom Ende der Antike bis zum Industriezeitalter',
  status: 'erschienen',
  amazonUrl: 'AMAZON_BAND_2_URL',
  seiten: 206,
  klappentext:
    'Am Anfang steht ein Mönch, der abschreibt, was sonst verloren ginge. Am Ende steht eine Fabrik, die Menschen nach der Uhr einteilt. Dazwischen liegt eine Kette von Werkzeugen, die jeweils zweierlei bewirkten: Der Kredit ermöglichte Handel über Meere – und die Schuld als Herrschaftsmittel. Das Schiff verband Kontinente – und verschleppte Millionen. Die Presse verbreitete Aufklärung – und die Verleumdung gleich mit.',
};

/**
 * Kapitel 7 bis 11. Die Reihe zählt über die Bände durch:
 * Band 1 trägt 1–6, Band 2 trägt 7–11, Band 3 trägt 12–16.
 * Die Unterzeile ist die Zeile unter dem Kapiteltitel auf dem Kapitelauftakt.
 */
export const KAPITEL_BAND_2: Kapitel[] = [
  { id: 7, bandId: 'band-2', titel: 'Nach Rom',
    unterzeile: 'Wie Erinnerung überdauert, wenn die Macht zerfällt', seiten: [12, 46] },
  { id: 8, bandId: 'band-2', titel: 'Krone, Kirche und geheime Gemeinschaften',
    unterzeile: 'Wie sich Macht verflocht – und wer davon wusste', seiten: [47, 81] },
  { id: 9, bandId: 'band-2', titel: 'Kaufleute, Banken und globale Finanzen',
    unterzeile: 'Wie aus Vertrauen ein Gewerbe wurde', seiten: [82, 116] },
  { id: 10, bandId: 'band-2', titel: 'Entdeckung, Eroberung und Kolonialreiche',
    unterzeile: 'Wer die Karte hält, bestimmt, was auf ihr fehlt', seiten: [117, 151] },
  { id: 11, bandId: 'band-2', titel: 'Revolution, Industrie und neue Eliten',
    unterzeile: 'Wer die Presse hat, bestimmt, was für selbstverständlich gilt', seiten: [152, 186] },
];

/**
 * Lichtstimmung je Kapitel – abgeleitet aus den Kapitelfarben des Satzes
 * (`pipeline/raster.py`, KAPITELFARBE), nicht frei gewählt. Der Band läuft
 * von Weinrot über Braun und Gold zu Grün und Blau; dieselbe Kurve trägt
 * die Kinoebene. Werte sind Multiplikatoren auf Rot, Grün, Blau.
 */
export const STIMMUNG_BAND_2: Record<number, [number, number, number]> = {
  7:  [1.18, 0.88, 0.87],   // Weinrot – Spätantike, Zerfall und Bewahrung
  8:  [1.15, 0.95, 0.90],   // Braun – Stein, Lehen, Kloster
  9:  [1.11, 1.04, 0.85],   // Gold – Waage, Truhe, Rechnungsbuch
  10: [0.98, 1.04, 0.99],   // Grün – Seewege, Ferne, feuchtes Licht
  11: [0.93, 0.99, 1.08],   // Blau – Presse, Dampf, kalte Fabrikhalle
};

import type { Asset } from '../gemeinsam/typen';

/**
 * Die Motive von Band 3.
 *
 * Die Auftakte der Kapitel 12 bis 15 sind die Bilder aus dem Satz des Bandes;
 * sie liegen dort unter ihrer Buchseite (`kap12_012.jpg` ist Seite 12). Für
 * Kapitel 16 ist das Motiv in der Produktion verlorengegangen – dort steht ein
 * eigens erzeugtes Bild nach der Herkunftszeile des Kapitels.
 *
 * Kein Motiv ist eine historische Fotografie – wie in Band 1 und 2 tragen alle
 * die Herkunftsangabe des Bandes. Der Umschlag
 * stammt aus der Druckdatei des Taschenbuchs; Vorderseite, Rücken und Rückseite
 * sind daraus freigestellt (siehe scripts/umschlag.mjs).
 */
export const ASSETS_BAND_3: Asset[] = [
  { id: 'cover-band-3', bandId: 'band-3', datei: 'cover-band-3',
    breite: 1200, hoehe: 1800, herkunft: 'Eigene Darstellung',
    alt: 'Umschlag von Band 3: Krieg, Ordnung und Netz – eine nächtliche Stadt aus Fabrik und Hochhaus, ein Goldfaden läuft von oben bis zum unteren Rand.' },
  { id: 'b3-kap12-auftakt', bandId: 'band-3', datei: 'b3-kap12-auftakt',
    breite: 2528, hoehe: 1696, herkunft: 'Freie Rekonstruktion',
    alt: 'Menschenleere Maschinenhalle: Transmissionswellen unter der Decke, Lederriemen zu stillstehenden Drehbänken – und an der Stirnwand eine Uhr.' },
  { id: 'b3-kap13-auftakt', bandId: 'band-3', datei: 'b3-kap13-auftakt',
    breite: 2528, hoehe: 1696, herkunft: 'Freie Rekonstruktion',
    alt: 'Leere Schalterhalle einer Bank: Marmor, Messinggitter, ein umgestürzter Stuhl auf dem Boden.' },
  { id: 'b3-kap14-auftakt', bandId: 'band-3', datei: 'b3-kap14-auftakt',
    breite: 2528, hoehe: 1696, herkunft: 'Freie Rekonstruktion',
    alt: 'Konferenzsaal mit langem poliertem Tisch, leeren Stühlen und Mappen an jedem Platz; hinter den Fenstern bewaldete Berge.' },
  { id: 'b3-kap15-auftakt', bandId: 'band-3', datei: 'b3-kap15-auftakt',
    breite: 2528, hoehe: 1696, herkunft: 'Freie Rekonstruktion',
    alt: 'Containerterminal im Morgennebel: gestapelte Container in langen Reihen, zwei Portalkräne über der nassen Kaikante.' },
  { id: 'b3-kap16-auftakt', bandId: 'band-3', datei: 'b3-kap16-auftakt',
    breite: 2560, hoehe: 1440, herkunft: 'Freie Rekonstruktion',
    alt: 'Kabelanlandung an einer Nordküste in der Dämmerung: ein Kabelgraben führt von der grauen See in ein niedriges Betongebäude mit erleuchteten Fenstern.' },
];

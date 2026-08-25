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
    breite: 1838, hoehe: 1930, herkunft: 'Freie Rekonstruktion',
    alt: 'Kabelanlandung an einer Nordküste in der Dämmerung: sechs armdicke schwarze Kabel laufen aus der grauen Brandung über Geröll unter einem Maschendrahtzaun hindurch zu einem fensterlosen Betonbau, an dessen Wand eine einzelne orange Lampe brennt.' },

  // Eine zweite Station je Kapitel. Dieselbe Herkunft wie die Auftakte: die
  // Bilddateien des Satzes, benannt nach der Buchseite, auf der sie stehen.
  { id: 'b3-kap12-motiv', bandId: 'band-3', datei: 'b3-kap12-motiv',
    breite: 2400, hoehe: 1792, herkunft: 'Freie Rekonstruktion',
    alt: 'Ein Stellwerk mit Holzboden und Fensterfront: an der rechten Wand steht eine lange Reihe rot-weißer Hebel, links liegen Blockapparate auf einem Sims, draußen laufen Gleise auseinander.' },
  { id: 'b3-kap13-motiv', bandId: 'band-3', datei: 'b3-kap13-motiv',
    breite: 2528, hoehe: 1696, herkunft: 'Freie Rekonstruktion',
    alt: 'Ein geschlossener Laden im Winter: heruntergelassenes Rollgitter vor der Schaufensterscheibe, an der Holztür ein einzelner weißer Zettel, davor Schnee auf dem Kopfsteinpflaster.' },
  { id: 'b3-kap14-motiv', bandId: 'band-3', datei: 'b3-kap14-motiv',
    breite: 2400, hoehe: 1792, herkunft: 'Freie Rekonstruktion',
    alt: 'Ein weißes Ferienhotel mit rotem Dach und langer Veranda vor bewaldeten Bergen, davor eine geschwungene Zufahrt über eine Rasenfläche.' },
  { id: 'b3-kap15-motiv', bandId: 'band-3', datei: 'b3-kap15-motiv',
    breite: 2528, hoehe: 1696, herkunft: 'Freie Rekonstruktion',
    alt: 'Ein Portalkran über einem leeren Kai: das rostige Spreadergeschirr hängt an Seilen über dem Beton, im Hintergrund gestapelte Container und Hafenwasser.' },
  { id: 'b3-kap12-stoppuhr', bandId: 'band-3', datei: 'b3-kap12-stoppuhr',
    breite: 2400, hoehe: 1792, herkunft: 'Freie Rekonstruktion',
    alt: 'Eine offene Taschenuhr aus Metall liegt auf einer abgenutzten Holzplatte neben einem aufgeschlagenen Notizheft mit handschriftlichen Zeilen und einem Bleistift.' },
  { id: 'b3-kap16-motiv', bandId: 'band-3', datei: 'b3-kap16-motiv',
    breite: 1616, hoehe: 596, herkunft: 'Freie Rekonstruktion',
    alt: 'Eine schmale Gasse zwischen zwei Reihen Serverschränken: blaue Kabelbündel unter der Decke, grüne und gelbe Kontrollleuchten in den Fronten, am Ende der Gasse eine geschlossene Tür.' },
];

/**
 * Welche Vorschaubilder es gibt – und woraus sie bestehen.
 *
 * Bewusst eine schlichte Liste statt eines Zugriffs auf die Weltdaten: Das
 * Bildskript soll ohne TypeScript-Lader laufen. Kommt ein Band dazu, kommt
 * hier eine Zeile dazu; die Prüfung `pruefe-og` merkt es, wenn sie fehlt.
 */
const A = (band, datei) => `public/assets/${band}/szenen/${datei}-1920.avif`;

export default [
  { datei: 'haus', motiv: 'public/assets/band-1/szenen/feuer-1920.webp',
    eyebrow: 'Trendonix', titel: 'Bücher über das, was zwischen den Dingen liegt.' },

  { datei: 'welt-faeden', motiv: 'public/assets/band-1/szenen/feuer-1920.webp',
    eyebrow: 'Die Welten', titel: 'Die Unsichtbaren Fäden',
    unterzeile: 'Drei Bände, drei begehbare Welten' },

  { datei: 'band-1', motiv: 'public/assets/band-1/szenen/graben-1920.webp',
    eyebrow: 'Band 1 · im Handel', titel: 'Ursprung und Ordnung',
    unterzeile: 'Von der Menschwerdung bis zu den Imperien der Antike' },
  { datei: 'band-2', motiv: 'public/assets/band-2/szenen/b2-kap07-auftakt-1920.webp',
    eyebrow: 'Band 2 · erscheint', titel: 'Glaube, Gold und Revolution',
    unterzeile: 'Vom Ende der Antike bis zum Industriezeitalter' },
  { datei: 'band-3', motiv: 'public/assets/band-3/szenen/b3-kap16-auftakt-1600.webp',
    eyebrow: 'Band 3 · erscheint', titel: 'Krieg, Ordnung und Netz',
    unterzeile: 'Vom Weltkrieg bis zur vernetzten Gegenwart' },

  // Ein Einzeltitel ohne Welt: kein Motiv, dafür der Umschlag selbst.
  { datei: 'zufall', umschlag: 'public/assets/zufall/szenen/cover-zufall-1000.webp',
    eyebrow: 'Einzelband · erscheint', titel: 'Alles nur Zufall?',
    unterzeile: '40 Theorien, die die Welt erklären. Angeblich.' },
];

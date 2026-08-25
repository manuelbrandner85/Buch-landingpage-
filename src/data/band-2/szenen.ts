import type { Szene } from '../gemeinsam/typen';

/**
 * Die Reise durch Band 2. Reihenfolge = Dramaturgie.
 *
 * Was hier steht, steht so im Buch:
 *  · `titel` und `unterzeile` der Auftakte stehen auf dem Kapitelauftakt,
 *  · `quelle` ist die Zeile „Woher wir das wissen“ derselben Seite,
 *  · `fliesstext` ist wörtlich aus dem Band übernommen,
 *  · `zitat` der Bilanzen ist der Schlüsselsatz der Kapitelbilanz.
 *
 * `zahlen` und `randnotizen` fehlen bewusst: Die Kennzahlen des Bandes stehen
 * fest, ihre Evidenzstufen aber nicht in einer Form, die sich ohne Deutung
 * übernehmen ließe. Lieber keine Angabe als eine erfundene.
 */
export const SZENEN_BAND_2: Szene[] = [
  {
    id: 'faden-laeuft-weiter', bandId: 'band-2', typ: 'motiv',
    platte: 'welt-ankunft', buchseite: 1, hoehe: 214, grading: '#1b2c52',
    uebergang: 'aufloesen', fahrt: 'durchfahrt', partikel: 'funken',
    badge: 'Eigene Darstellung',
    eyebrow: 'Band 2',
    titel: 'Der Faden läuft weiter',
    unterzeile: 'Glaube, Gold und Revolution',
    fliesstext:
      'Vom Ende Roms bis zur ersten Fabrik. Dreizehn Jahrhunderte in einem Band – erzählt entlang der Frage, wer Wissen bewahrte und wer daran verdiente.',
    quelle: 'Eigene Darstellung zum Umschlagmotiv von Band 2: der Goldfaden, der sich durch die Reihe zieht.',
  },

  // ------------------------------------------------------------ Kapitel 7
  {
    id: 'kapitel-7', bandId: 'band-2', kapitelId: 7, typ: 'auftakt', tor: true,
    platte: 'b2-kap07-auftakt', buchseite: 12, hoehe: 208, grading: '#802a28',
    uebergang: 'lichtschwenk', fahrt: 'hinein', partikel: 'staub',
    titel: 'Nach Rom',
    unterzeile: 'Wie Erinnerung überdauert, wenn die Macht zerfällt',
    quelle: 'Spätantike Kuppelbasilika. Freie Rekonstruktion, kein bestimmtes Bauwerk.',
  },
  {
    id: 'was-bewahrt-wurde', bandId: 'band-2', kapitelId: 7, unterkapitel: '7.5', typ: 'motiv',
    platte: 'b2-kap07-motiv', buchseite: 40, hoehe: 268, grading: '#6e2c26',
    uebergang: 'aufloesen', fahrt: 'hinein', partikel: 'staub',
    badge: 'Freie Rekonstruktion',
    eyebrow: 'Wer bewahrte Wissen – und wer verlor seine Stimme?',
    titel: 'Was abgeschrieben wurde',
    unterzeile: 'Überlieferung ist Auswahl, keine Aufbewahrung',
    fliesstext:
      'Dieses Kapitel handelt nicht vom Untergang. Es handelt davon, was geschieht, wenn eine Ordnung zerfällt und andere ihre Aufgaben übernehmen: Klöster verwalteten, Kaufleute verbanden, Übersetzer bewahrten. Keine dieser Gruppen tat es aus Auftrag.',
    quelle: 'Schreibpult einer Klosterwerkstatt. Freie Rekonstruktion; der Text folgt der Kapitelbilanz auf Seite 46.',
  },
  {
    id: 'faden-7', bandId: 'band-2', kapitelId: 7, typ: 'papier', buchseite: 46,
    titel: 'Der unsichtbare Faden in Kapitel 7',
    zitat: 'Überlieferung ist Auswahl, keine Aufbewahrung.',
    quelle: 'Bilanz zu Kapitel 7: Was geschieht, wenn eine Ordnung zerfällt und andere ihre Aufgaben übernehmen.',
  },

  // ------------------------------------------------------------ Kapitel 8
  {
    id: 'kapitel-8', bandId: 'band-2', kapitelId: 8, typ: 'auftakt', tor: true,
    platte: 'b2-kap08-auftakt', buchseite: 47, hoehe: 208, grading: '#703e30',
    uebergang: 'lichtschwenk', fahrt: 'hinein',
    titel: 'Krone, Kirche und\ngeheime Gemeinschaften',
    unterzeile: 'Wie sich Macht verflocht – und wer davon wusste',
    quelle: 'Romanischer Kirchenraum. Freie Rekonstruktion, kein bestimmtes Bauwerk.',
  },
  {
    id: 'drei-schloesser', bandId: 'band-2', kapitelId: 8, typ: 'motiv',
    platte: 'b2-kap08-motiv', buchseite: 81, hoehe: 274, grading: '#5e3628',
    uebergang: 'lichtschwenk', fahrt: 'hinein', partikel: 'staub',
    badge: 'Freie Rekonstruktion',
    eyebrow: 'Kapitelbilanz',
    titel: 'Eine Tür mit drei Schlössern',
    unterzeile: 'Wer aufsperren darf, muss nichts besitzen',
    fliesstext:
      'Dieses Kapitel handelt nicht von Herrschern. Es handelt von Einrichtungen, die zwischen den Menschen und etwas standen, das diese brauchten: Land, Heil, Schrift, Geld, Aufnahme. Keine von ihnen trug eine Krone. Jede entschied, wer durchkam.',
    quelle: 'Eine Tür mit drei Schlössern. Wer aufsperren darf, muss nichts besitzen.',
  },
  {
    id: 'faden-8', bandId: 'band-2', kapitelId: 8, typ: 'papier', buchseite: 81,
    titel: 'Der unsichtbare Faden in Kapitel 8',
    zitat: 'Wer den Zugang verwaltet, braucht keine Krone.',
    quelle: 'Bilanz zu Kapitel 8: Einrichtungen, die zwischen den Menschen und dem standen, was diese brauchten.',
  },

  // ------------------------------------------------------------ Kapitel 9
  {
    id: 'kapitel-9', bandId: 'band-2', kapitelId: 9, typ: 'auftakt', tor: true,
    platte: 'b2-kap09-auftakt', buchseite: 82, hoehe: 208, grading: '#76602c',
    uebergang: 'wasser', fahrt: 'schwenkRechts', ton: 'wasser',
    titel: 'Kaufleute, Banken\nund globale Finanzen',
    unterzeile: 'Wie aus Vertrauen ein Gewerbe wurde',
    quelle: 'Hafenanlagen des Mittelmeers. Freie Rekonstruktion.',
  },
  {
    id: 'truhen', bandId: 'band-2', kapitelId: 9, typ: 'motiv',
    platte: 'b2-kap09-motiv', buchseite: 116, hoehe: 274, grading: '#6a5628',
    uebergang: 'aufloesen', fahrt: 'hinein',
    badge: 'Freie Rekonstruktion',
    eyebrow: 'Kapitelbilanz',
    titel: 'Eine Reihe Truhen, eine davon offen und leer',
    unterzeile: 'Der Bestand stand im Buch, lange bevor er im Raum war',
    fliesstext:
      'Dieses Kapitel handelt nicht von Reichtum. Es handelt von Aufzeichnung: vom Wechsel, der eine Truhe ersetzt, von der Buchführung, die Fehler sichtbar macht, vom Anteil, der einen Kurs bekommt, und von der Schuld, die handelbar wird.',
    quelle: 'Eine Reihe Truhen, eine davon offen und leer. Der Bestand stand im Buch, lange bevor er im Raum war.',
  },
  {
    id: 'faden-9', bandId: 'band-2', kapitelId: 9, typ: 'papier', buchseite: 116,
    titel: 'Der unsichtbare Faden in Kapitel 9',
    zitat: 'Wer die Bücher führt, bestimmt, was als Tatsache gilt.',
    quelle: 'Bilanz zu Kapitel 9: Macht entsteht nicht aus Besitz, sondern aus dem Führen der Bücher.',
  },

  // ----------------------------------------------------------- Kapitel 10
  {
    id: 'kapitel-10', bandId: 'band-2', kapitelId: 10, typ: 'auftakt', tor: true,
    platte: 'b2-kap10-auftakt', buchseite: 117, hoehe: 208, grading: '#48584a',
    uebergang: 'wasser', fahrt: 'durchfahrt', ton: 'wasser',
    titel: 'Entdeckung, Eroberung\nund Kolonialreiche',
    unterzeile: 'Wer die Karte hält, bestimmt, was auf ihr fehlt',
    quelle: 'Seewesen des 16. Jahrhunderts. Freie Rekonstruktion.',
  },
  {
    id: 'die-linie', bandId: 'band-2', kapitelId: 10, unterkapitel: '10.1', typ: 'motiv',
    platte: 'b2-kap10-motiv', buchseite: 118, hoehe: 280, grading: '#3f4e42',
    uebergang: 'sediment', fahrt: 'hinein',
    badge: 'Freie Rekonstruktion',
    eyebrow: 'Navigation, Karten und Konkurrenz',
    titel: 'Eine Linie über einen unvermessenen Ozean',
    unterzeile: 'Der Tisch eines Kartenmachers',
    fliesstext:
      'Warum konnte ein Schiff seinen Breitengrad bestimmen, seinen Längengrad aber nicht? Und wie teilt man eine Welt entlang einer Linie, die niemand messen kann?',
    quelle: 'Der Tisch eines Kartenmachers. Was hier gezeichnet wurde, entschied darüber, was andere für die Welt hielten.',
  },
  {
    id: 'faden-10', bandId: 'band-2', kapitelId: 10, typ: 'papier', buchseite: 151,
    titel: 'Der unsichtbare Faden in Kapitel 10',
    zitat: 'Eine Karte zeigt nicht die Welt. Sie zeigt, was jemand von ihr gebraucht hat – und was leer bleibt, gilt schnell als frei.',
    quelle: 'Bilanz zu Kapitel 10: Was die Quellenlage hergibt – und wessen Stimme in ihr von vornherein fehlt.',
  },

  // ----------------------------------------------------------- Kapitel 11
  {
    id: 'kapitel-11', bandId: 'band-2', kapitelId: 11, typ: 'auftakt', tor: true,
    platte: 'b2-kap11-auftakt', buchseite: 152, hoehe: 208, grading: '#3a4860',
    uebergang: 'aufloesen', fahrt: 'aufsteigen', ton: 'wind',
    titel: 'Revolution, Industrie\nund neue Eliten',
    unterzeile: 'Wer die Presse hat, bestimmt, was für selbstverständlich gilt',
    quelle: 'Fabrikbauten und Kanäle. Freie Rekonstruktion.',
  },
  {
    id: 'handpresse', bandId: 'band-2', kapitelId: 11, unterkapitel: '11.1', typ: 'motiv',
    platte: 'b2-kap11-motiv', buchseite: 153, hoehe: 280, grading: '#33415a',
    uebergang: 'glut', fahrt: 'hinein', partikel: 'staub',
    badge: 'Freie Rekonstruktion',
    eyebrow: 'Aufklärung und Öffentlichkeit',
    titel: 'Eine Handpresse dieser Bauart',
    unterzeile: 'Sie arbeitete langsam – und veränderte trotzdem mehr als jede Armee dieser Jahre',
    fliesstext:
      'Wie entsteht aus einzelnen Lesern eine Öffentlichkeit – und wann wird sie zur politischen Kraft?',
    quelle: 'Eine Handpresse dieser Bauart. Sie arbeitete langsam – und veränderte trotzdem mehr als jede Armee dieser Jahre.',
  },
  {
    id: 'faden-11', bandId: 'band-2', kapitelId: 11, typ: 'papier', buchseite: 186,
    titel: 'Der unsichtbare Faden in Kapitel 11',
    zitat: 'Ein Satz, der nicht für alle gilt, ist kein toter Satz. Er ist ein Werkzeug, das jeder aufheben kann.',
    quelle: 'Bilanz zu Kapitel 11: Was hier begann, läuft in die Katastrophen und Ordnungsversuche des 20. Jahrhunderts hinein.',
  },

  // ------------------------------------------------------------- Ausblick
  {
    id: 'wohin-dieser-band-fuehrt', bandId: 'band-2', typ: 'motiv',
    platte: 'welt-karte', buchseite: 186, hoehe: 246, grading: '#141c30',
    uebergang: 'aufloesen', fahrt: 'heraus', ton: 'wind',
    badge: 'Eigene Darstellung',
    eyebrow: 'Wohin dieser Band führt',
    titel: 'Damit endet der zweite Band',
    unterzeile: 'Vier Fäden werden weitergereicht',
    fliesstext:
      'Was hier begann – erklärte Rechte, gemessene Zeit, aufgeteilte Kontinente und Gesellschaften, die regieren, ohne gewählt zu sein – läuft in die Katastrophen und Ordnungsversuche des 20. Jahrhunderts hinein.',
    quelle: 'Schlusskasten auf Seite 186, wörtlich. Das Motiv ist eine eigene Darstellung ohne Ortsbezug.',
  },
];

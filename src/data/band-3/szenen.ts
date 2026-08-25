import type { Szene } from '../gemeinsam/typen';

/**
 * Band 3 als Daten.
 *
 * Die Auftaktmotive der Kapitel 12 bis 15 sind **die Bilder aus dem Satz des
 * Bandes** (`09_Produktion\Motive`, benannt nach ihrer Buchseite) – nicht
 * nachträglich erzeugte Entsprechungen. Für Kapitel 16 liegt das Motiv nicht
 * mehr vor; dort steht ein eigens erzeugtes Bild nach der Herkunftszeile des
 * Kapitels.
 * Titel, Leitfragen und Seitenbereiche sind gegen den gedruckten Umschlag des
 * Taschenbuchs geprüft und stimmen mit ihm überein.
 *
 * Die Kapitelbilanzen von 12, 13 und 16 stammen aus dem Satz selbst. Für 14 und
 * 15 fehlen sie hier: Die Druckteile im Ordner von Band 3 tragen den Inhalt von
 * Band 2 (geprüft an den Seiten 81, 82, 117 und 151), es liegt also keine
 * lesbare Fassung dieser beiden Bilanzen vor. Ein Schlüsselsatz, den man nicht
 * gelesen hat, wird hier nicht erfunden – dasselbe gilt für ihre Herkunftszeile.
 */
export const SZENEN_BAND_3: Szene[] = [
  {
    id: 'kapitel-12', bandId: 'band-3', kapitelId: 12, typ: 'auftakt', tor: true,
    platte: 'b3-kap12-auftakt',
    buchseite: 12, hoehe: 196, grading: '#4a425c',
    uebergang: 'aufloesen', fahrt: 'hinein',
    titel: 'Krieg, Maschine und\nMassengesellschaft',
    unterzeile: 'Was geschieht, wenn die Ordnung der Fabrik die Fabrik verlässt',
    quelle: 'Maschinenhalle mit Transmission. Freie Rekonstruktion.',
  },
  {
    id: 'faden-12', bandId: 'band-3', kapitelId: 12, typ: 'papier', buchseite: 46,
    titel: 'Der unsichtbare Faden in Kapitel 12',
    zitat: 'Was in der Fabrik erfunden wurde, um Arbeit zu messen, hat binnen dreißig Jahren gemessen, wer jemand ist.',
    quelle: 'Bilanz zu Kapitel 12: Zeitmessung, Meldewesen und Statistik – die Verwaltung lernt im Krieg, was sie danach behält.',
  },
  {
    id: 'kapitel-13', bandId: 'band-3', kapitelId: 13, typ: 'auftakt', tor: true,
    platte: 'b3-kap13-auftakt',
    buchseite: 47, hoehe: 196, grading: '#603a38',
    uebergang: 'glut', fahrt: 'absenken',
    titel: 'Krise, Ideologie\nund Zusammenbruch',
    unterzeile: 'Warum eine Ordnung zusammenbricht, die auf dem Papier funktioniert',
    quelle: 'Leere Schalterhalle. Freie Rekonstruktion.',
  },
  {
    id: 'faden-13', bandId: 'band-3', kapitelId: 13, typ: 'papier', buchseite: 81,
    titel: 'Der unsichtbare Faden in Kapitel 13',
    zitat: 'Keines der Werkzeuge dieses Kapitels wurde für das erfunden, wofür es gebraucht wurde. Genau das ist der Faden.',
    quelle: 'Bilanz zu Kapitel 13: Währungsordnung, Zustimmung und Verwaltung – geprüft an dem, was die Akten hergeben.',
  },
  {
    id: 'kapitel-14', bandId: 'band-3', kapitelId: 14, typ: 'auftakt', tor: true,
    platte: 'b3-kap14-auftakt',
    buchseite: 82, hoehe: 196, grading: '#38545a',
    uebergang: 'aufloesen', fahrt: 'schwenkRechts',
    titel: 'Vertrag, Dollar\nund Blöcke',
    unterzeile: 'Wer schreibt die Regeln, wenn eine Welt neu geordnet wird',
    quelle: 'Konferenzsaal. Motiv aus dem Satz des Bandes, Seite 82.',
  },
  {
    id: 'kapitel-15', bandId: 'band-3', kapitelId: 15, typ: 'auftakt', tor: true,
    platte: 'b3-kap15-auftakt',
    buchseite: 117, hoehe: 196, grading: '#564a2e',
    uebergang: 'aufloesen', fahrt: 'durchfahrt',
    titel: 'Öl, Container\nund Konzerne',
    unterzeile: 'Wem gehört eine Ordnung, die niemand beschlossen hat',
    quelle: 'Containerterminal im Morgennebel. Motiv aus dem Satz des Bandes, Seite 117.',
  },
  {
    id: 'kapitel-16', bandId: 'band-3', kapitelId: 16, typ: 'auftakt', tor: true,
    platte: 'b3-kap16-auftakt', motion: 'b3-kap16-auftakt',
    buchseite: 152, hoehe: 196, grading: '#304668',
    uebergang: 'wasser', fahrt: 'hinein',
    titel: 'Kabel, Daten\nund Abhängigkeit',
    unterzeile: 'Das Netz ist kein Ort. Es ist ein Bauwerk mit sehr wenigen Engstellen',
    quelle: 'Kabelregister und Betreiberangaben. Kabelanlandung an einer Nordküste, freie Rekonstruktion.',
  },
  {
    id: 'faden-16', bandId: 'band-3', kapitelId: 16, typ: 'papier', buchseite: 186,
    titel: 'Der unsichtbare Faden in Kapitel 16',
    zitat: 'Was global wirkt, ist örtlich gebaut. Und wo etwas gebaut ist, gibt es eine Stelle, an der es eng wird.',
    quelle: 'Bilanz zu Kapitel 16 und Schluss der Reihe: fünf Erleichterungen aus zwölftausend Jahren – Vorrat, Schrift, Geld, Fabrik, Netz.',
  },
  // Der Abschluss dieser Welt zeigt diesen Band – und nur ihn.
  { id: 'abschluss-band-3', bandId: 'band-3', typ: 'buecher' },
];

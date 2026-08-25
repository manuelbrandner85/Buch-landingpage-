import type { Szene } from '../gemeinsam/typen';

/**
 * Band 3 als Daten. Wie in Band 2 gibt es noch keine eigens erzeugten
 * Bewegtmotive für die Website; die Szenen tragen deshalb kein `platte`.
 *
 * Gesetzt sind die Kapitel 12, 13 und 16 – von ihnen stammen Auftaktzeile,
 * Herkunftszeile und der Schlüsselsatz der Kapitelbilanz aus dem Satz selbst.
 * Kapitel 14 und 15 stehen im verbindlichen Seitenplan, sind aber noch nicht
 * gesetzt: Sie bekommen ihren Auftakt, aber keine Bilanz – ein Schlüsselsatz,
 * den es noch nicht gibt, wird hier nicht erfunden.
 */
export const SZENEN_BAND_3: Szene[] = [
  {
    id: 'kapitel-12', bandId: 'band-3', kapitelId: 12, typ: 'auftakt', tor: true,
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
    buchseite: 82, hoehe: 196, grading: '#38545a',
    uebergang: 'aufloesen', fahrt: 'schwenkRechts',
    titel: 'Vertrag, Dollar\nund Blöcke',
    unterzeile: 'Wer schreibt die Regeln, wenn eine Welt neu geordnet wird',
    quelle: 'Kapitel 14 steht im verbindlichen Seitenplan des Bandes; die Seite ist noch nicht gesetzt.',
  },
  {
    id: 'kapitel-15', bandId: 'band-3', kapitelId: 15, typ: 'auftakt', tor: true,
    buchseite: 117, hoehe: 196, grading: '#564a2e',
    uebergang: 'aufloesen', fahrt: 'durchfahrt',
    titel: 'Öl, Container\nund Konzerne',
    unterzeile: 'Wem gehört eine Ordnung, die niemand beschlossen hat',
    quelle: 'Kapitel 15 steht im verbindlichen Seitenplan des Bandes; die Seite ist noch nicht gesetzt.',
  },
  {
    id: 'kapitel-16', bandId: 'band-3', kapitelId: 16, typ: 'auftakt', tor: true,
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
];

import type { Szene } from '../gemeinsam/typen';

/**
 * Band 2 als Daten. Es gibt für diesen Band noch keine eigens erzeugten
 * Bewegtmotive für die Website – deshalb tragen die Szenen kein `platte`
 * und die Kinoebene überspringt sie. Was hier steht, steht so im Buch:
 *
 *  · `titel` und `unterzeile` der Auftakte stehen auf dem Kapitelauftakt,
 *  · `quelle` ist die Zeile „Woher wir das wissen“ derselben Seite,
 *  · `zitat` der Bilanzen ist der Schlüsselsatz der Kapitelbilanz.
 *
 * Sobald Motive vorliegen, bekommen die Auftakte `platte`, und zwischen
 * Auftakt und Bilanz treten Motivszenen – ohne Eingriff in die Engine.
 */
export const SZENEN_BAND_2: Szene[] = [
  {
    id: 'kapitel-7', bandId: 'band-2', kapitelId: 7, typ: 'auftakt', tor: true,
    buchseite: 12, hoehe: 196, grading: '#802a28',
    uebergang: 'aufloesen', fahrt: 'hinein',
    titel: 'Nach Rom',
    unterzeile: 'Wie Erinnerung überdauert, wenn die Macht zerfällt',
    quelle: 'Spätantike Kuppelbasilika. Freie Rekonstruktion, kein bestimmtes Bauwerk.',
  },
  {
    id: 'faden-7', bandId: 'band-2', kapitelId: 7, typ: 'papier', buchseite: 46,
    titel: 'Der unsichtbare Faden in Kapitel 7',
    zitat: 'Überlieferung ist Auswahl, keine Aufbewahrung.',
    quelle: 'Bilanz zu Kapitel 7: Was geschieht, wenn eine Ordnung zerfällt und andere ihre Aufgaben übernehmen.',
  },
  {
    id: 'kapitel-8', bandId: 'band-2', kapitelId: 8, typ: 'auftakt', tor: true,
    buchseite: 47, hoehe: 196, grading: '#703e30',
    uebergang: 'lichtschwenk', fahrt: 'hinein',
    titel: 'Krone, Kirche und\ngeheime Gemeinschaften',
    unterzeile: 'Wie sich Macht verflocht – und wer davon wusste',
    quelle: 'Romanischer Kirchenraum. Freie Rekonstruktion, kein bestimmtes Bauwerk.',
  },
  {
    id: 'faden-8', bandId: 'band-2', kapitelId: 8, typ: 'papier', buchseite: 81,
    titel: 'Der unsichtbare Faden in Kapitel 8',
    zitat: 'Wer den Zugang verwaltet, braucht keine Krone.',
    quelle: 'Bilanz zu Kapitel 8: Einrichtungen, die zwischen den Menschen und dem standen, was diese brauchten.',
  },
  {
    id: 'kapitel-9', bandId: 'band-2', kapitelId: 9, typ: 'auftakt', tor: true,
    buchseite: 82, hoehe: 196, grading: '#76602c',
    uebergang: 'wasser', fahrt: 'schwenkRechts',
    titel: 'Kaufleute, Banken\nund globale Finanzen',
    unterzeile: 'Wie aus Vertrauen ein Gewerbe wurde',
    quelle: 'Hafenanlagen des Mittelmeers. Freie Rekonstruktion.',
  },
  {
    id: 'faden-9', bandId: 'band-2', kapitelId: 9, typ: 'papier', buchseite: 116,
    titel: 'Der unsichtbare Faden in Kapitel 9',
    zitat: 'Wer die Bücher führt, bestimmt, was als Tatsache gilt.',
    quelle: 'Bilanz zu Kapitel 9: Macht entsteht nicht aus Besitz, sondern aus dem Führen der Bücher.',
  },
  {
    id: 'kapitel-10', bandId: 'band-2', kapitelId: 10, typ: 'auftakt', tor: true,
    buchseite: 117, hoehe: 196, grading: '#48584a',
    uebergang: 'wasser', fahrt: 'durchfahrt',
    titel: 'Entdeckung, Eroberung\nund Kolonialreiche',
    unterzeile: 'Wer die Karte hält, bestimmt, was auf ihr fehlt',
    quelle: 'Seewesen des 16. Jahrhunderts. Freie Rekonstruktion.',
  },
  {
    id: 'faden-10', bandId: 'band-2', kapitelId: 10, typ: 'papier', buchseite: 151,
    titel: 'Der unsichtbare Faden in Kapitel 10',
    zitat: 'Eine Karte zeigt nicht die Welt. Sie zeigt, was jemand von ihr gebraucht hat – und was leer bleibt, gilt schnell als frei.',
    quelle: 'Bilanz zu Kapitel 10: Was die Quellenlage hergibt – und wessen Stimme in ihr von vornherein fehlt.',
  },
  {
    id: 'kapitel-11', bandId: 'band-2', kapitelId: 11, typ: 'auftakt', tor: true,
    buchseite: 152, hoehe: 196, grading: '#3a4860',
    uebergang: 'aufloesen', fahrt: 'aufsteigen',
    titel: 'Revolution, Industrie\nund neue Eliten',
    unterzeile: 'Wer die Presse hat, bestimmt, was für selbstverständlich gilt',
    quelle: 'Fabrikbauten und Kanäle. Freie Rekonstruktion.',
  },
  {
    id: 'faden-11', bandId: 'band-2', kapitelId: 11, typ: 'papier', buchseite: 186,
    titel: 'Der unsichtbare Faden in Kapitel 11',
    zitat: 'Ein Satz, der nicht für alle gilt, ist kein toter Satz. Er ist ein Werkzeug, das jeder aufheben kann.',
    quelle: 'Bilanz zu Kapitel 11 und Schluss des Bandes: Was hier begann, läuft in die Katastrophen und Ordnungsversuche des 20. Jahrhunderts hinein.',
    bezuege: { danach: 'kapitel-12' },
  },
];

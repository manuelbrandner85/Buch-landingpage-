/**
 * Datengrundlage der interaktiven Module.
 * Alle Werte stammen aus dem Band; die Quellenangaben stehen bei den Szenen.
 */

/** Fünf Ringe um einen Menschen (S. 109). Von außen nach innen zu lesen. */
export const RINGE = [
  { stufe: 'Untertanen', kontrolle: 'sehen den König nie', evidenz: 'B' },
  { stufe: 'Provinzadel', kontrolle: 'welche Nachrichten die Hauptstadt erreichen', evidenz: 'C' },
  { stufe: 'Hofstaat', kontrolle: 'welche Anliegen als würdig gelten', evidenz: 'C' },
  { stufe: 'Kammerdiener', kontrolle: 'wer überhaupt vorgelassen wird', evidenz: 'B' },
  { stufe: 'König', kontrolle: 'sichtbar für wenige', evidenz: 'B' },
] as const;

/** Silberanteil des Denars (S. 138). Belegte Messpunkte, keine Interpolation. */
export const DENAR = [
  { jahr: -27, marke: 'Augustus', anteil: 96 },
  { jahr: 110, marke: 'Trajan', anteil: 93 },
  { jahr: 170, marke: 'Marcus Aurelius', anteil: 75 },
  { jahr: 200, marke: 'Septimius Severus', anteil: 48 },
  { jahr: 265, marke: 'Gallienus', anteil: 5 },
] as const;

/** Die Königsstraße (S. 104). Zwei Reisearten, dieselbe Strecke. */
export const KOENIGSSTRASSE = {
  von: 'Susa',
  nach: 'Sardes',
  kilometer: 2700,
  stationen: 111,
  zuFuss: 90,
  stafette: 9,
  kern: 'Der Fortschritt lag nicht im Weg, sondern im Wechsel.',
} as const;

/**
 * Die Prüfung (S. 173): die fünf Fragen von Seite 168, auf eine Erzählung angewendet.
 * Die Evidenzstufen des Buches sind in dieser Tabelle nicht sicher lesbar –
 * deshalb steht hier nur der Befund, ohne Stufe. Lieber keine Angabe als eine erfundene.
 */
export const PRUEFUNG = {
  fragen: [
    { frage: 'Gibt es eine zweite Quelle?', befund: 'keine – kein antiker Autor außer Platon' },
    { frage: 'Was sagt sein engster Schüler?', befund: 'Aristoteles hielt es für erfunden' },
    { frage: 'Passen die Zeitangaben?', befund: '9600 v. Chr. – vor jeder Stadtkultur' },
    { frage: 'Gibt es geologische Spuren?', befund: 'keine für eine versunkene Großinsel' },
    { frage: 'Wozu diente die Erzählung?', befund: 'Athen als Vorbild gegen eine Großmacht' },
  ],
  zahlen: [
    { wert: '1', label: 'antike Quelle nennt Atlantis' },
    { wert: '2.400', label: 'Jahre wird danach gesucht' },
    { wert: '0', label: 'geologische Spuren einer versunkenen Großinsel' },
  ],
  ergebnis:
    'Die Fachwissenschaft hält die Erzählung seit langem für eine Erfindung Platons – ein Gedankenspiel über Hochmut und Macht. Diese Deutung ist gut begründet, aber sie ist eine Deutung und kein Fund.',
} as const;

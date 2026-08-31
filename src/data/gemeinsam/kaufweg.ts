import type { Buch, Kaufweg } from './typen';

/**
 * Welcher Kaufweg der große Knopf sein soll.
 *
 * Bis zum 31.08.2026 war das schlicht der erste Eintrag der Liste — und der
 * ist, weil die Ausgaben nach Wertigkeit stehen, das **teuerste** Format.
 * Auf der Buchseite von Band 1 stand damit „Taschenbuch · 39,90 €" als
 * Angebot, obwohl daneben ein E-Book für 12,99 € liegt, das in Kindle
 * Unlimited sogar ohne Zusatzkosten zu lesen ist.
 *
 * Für jemanden, der das Haus seit zwei Minuten kennt, ist das die falsche
 * Frage. Er entscheidet nicht zwischen Taschenbuch und gebundener Ausgabe,
 * sondern zwischen Lesen und Weiterscrollen — und diese Entscheidung fällt
 * am günstigsten Einstieg. Wer das gedruckte Buch will, findet es eine Zeile
 * darunter; wer es nicht gesucht hätte, wäre am Preis abgeprallt.
 *
 * Deshalb: der günstigste Kaufweg zuerst, die übrigen daneben. Eine Ausleihe
 * ist nie der große Knopf — sie kostet nichts und wäre damit immer die
 * billigste, ist aber kein Kauf und auf vielen Seiten gar nicht verfügbar.
 */
export const KAUFBAR = (k: Kaufweg) => k.art !== 'ausleihe';

/**
 * Die Kaufwege in der Reihenfolge, in der sie angeboten werden:
 * günstigster Kauf zuerst, dann die übrigen Käufe in ihrer Reihenfolge,
 * Ausleihen zuletzt.
 *
 * Ein Kaufweg ohne Preis wird nicht nach vorn sortiert — ohne Zahl lässt
 * sich nicht sagen, ob er der Einstieg ist, und geraten wird hier nicht.
 */
export function angebotsreihenfolge(kaufwege: Kaufweg[]): Kaufweg[] {
  const kaeufe = kaufwege.filter(KAUFBAR);
  const ausleihen = kaufwege.filter((k) => !KAUFBAR(k));
  const mitPreis = kaeufe.filter((k) => typeof k.preis === 'number');
  if (mitPreis.length < 2) return [...kaeufe, ...ausleihen];

  const guenstigster = mitPreis.reduce((a, b) => (b.preis! < a.preis! ? b : a));
  return [guenstigster, ...kaeufe.filter((k) => k !== guenstigster), ...ausleihen];
}

/** Der eine Kaufweg, der auf den großen Knopf gehört. */
export const einstieg = (buch: Buch): Kaufweg | undefined =>
  angebotsreihenfolge(buch.kaufwege)[0];

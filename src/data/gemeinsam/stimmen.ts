import type { BandId } from './typen';

/**
 * Was Leser sagen – und was davon nachprüfbar ist.
 *
 * Rezensionen sind das einzige Argument auf dieser Seite, das nicht von hier
 * kommt. Genau deshalb ist es das stärkste: Ein Klappentext lobt sich selbst,
 * eine Sternzahl bei Amazon tut das nicht. Bei 39,90 € für einen unbekannten
 * Titel ist die fehlende erste Bewertung der größte Hemmschuh überhaupt.
 *
 * Zwei Arten von Angaben, weil sie zwei verschiedene Dinge tun:
 *
 *  · `BEWERTUNGEN` – die Zahl: Schnitt und Anzahl bei einem Händler. Sie steht
 *    oben neben dem Kaufweg, wo die Entscheidung fällt, und geht als
 *    `aggregateRating` ins Datenblatt für Suchmaschinen.
 *  · `STIMMEN` – der Satz: ein wörtliches Zitat aus einer Rezension. Es
 *    überzeugt, was eine Zahl nicht kann, und geht als `review` ins Datenblatt.
 *
 * Vier Regeln, die hier nicht verhandelbar sind:
 *
 *  1. Nichts erfinden. Keine Zahl ohne Quelle, kein Zitat ohne Fundstelle.
 *     Ein erfundenes Lob ist bei Google kein Kavaliersdelikt, sondern ein
 *     Grund, die Datenblätter der ganzen Domain zu ignorieren.
 *  2. Nichts anzeigen, solange nichts da ist. Eine leere Liste heißt: Der
 *     ganze Abschnitt erscheint nicht. „Noch keine Bewertungen“ zu schreiben
 *     ist schlechter als zu schweigen – es macht die Lücke zum Thema.
 *  3. Nur zitieren, was öffentlich steht, gekürzt nur an den Rändern und mit
 *     Link zur Fundstelle. Kein Satz, der im Original das Gegenteil sagt.
 *  4. Jede Zahl trägt ihr Datum. Sterne ändern sich; ein Schnitt ohne Stand
 *     ist irgendwann eine falsche Angabe.
 *
 * Eintragen ist eine Zeile. Kommen Rezensionen bei Amazon, tolino, Thalia,
 * Goodreads oder in einer Leserunde, wandern sie hierher – die Seite zeigt sie
 * dann von selbst, oben am Kaufweg, in einem eigenen Abschnitt auf der
 * Buchseite, auf der Startseite und im Datenblatt.
 */

/**
 * Die Sternzahl eines Händlers zu einem Stichtag.
 *
 * Hier steht nur, was eine Plattform selbst ausweist. Ein Durchschnitt aus
 * Zuschriften an dieses Haus gehört nicht hierher: Er ließe sich nirgends
 * nachzählen, stünde aber neben einer Zahl, die sich nachzählen lässt.
 */
export interface Bewertungsstand {
  bandId: BandId;
  /** Wo sie steht: „Amazon“, „tolino“, „Thalia“, „Goodreads“, „BücherTreff“. */
  quelle: string;
  /** Die Seite, auf der die Bewertungen zu sehen sind – zum Nachzählen. */
  url: string;
  /** Der Durchschnitt, wie ihn die Quelle ausweist. */
  schnitt: number;
  /** Wie viele Bewertungen dahinterstehen. Ohne Anzahl keine Anzeige. */
  anzahl: number;
  /** Das Maximum der Skala. Fast überall fünf – Goodreads auch, LovelyBooks zehn. */
  skala?: number;
  /** Wann abgelesen, ISO. Steht sichtbar unter der Zahl. */
  stand: string;
}

/** Ein wörtliches Zitat aus einer Rezension. */
export interface Leserstimme {
  bandId: BandId;
  quelle: string;
  /**
   * Woher die Stimme kommt – und das ist mehr als eine Herkunftsangabe.
   *
   *  · `haendler` (Vorgabe) – sie steht öffentlich bei Amazon, tolino oder
   *    sonstwo. Jeder kann sie dort nachlesen; die Plattform sagt selbst, ob
   *    ein Kauf dahintersteht. Nur diese Stimmen gehen ins Datenblatt für
   *    Suchmaschinen.
   *  · `direkt` – über das Formular auf dieser Seite eingegangen. Echt, aber
   *    nirgends nachprüfbar: Ob der Absender das Buch gekauft hat, weiß hier
   *    niemand. Deshalb steht sie in einem eigenen Abschnitt, zählt nicht in
   *    den Schnitt und erscheint nicht im Datenblatt. Eine selbst
   *    eingesammelte Bewertung als `review` auszuzeichnen ist nicht verboten,
   *    aber es ist der Punkt, an dem eine Domain ihre Sterne bei Google
   *    verlieren kann – und dieser Preis steht in keinem Verhältnis zu dem,
   *    was ein zusätzlicher Eintrag brächte.
   */
  art?: 'haendler' | 'direkt';
  /** Wörtlich. Auslassungen mit […], nichts umformuliert. */
  text: string;
  /** Der Name, unter dem die Rezension öffentlich steht. Sonst weglassen. */
  autor?: string;
  /** Die vergebenen Sterne, wenn die Quelle welche zeigt. */
  sterne?: number;
  skala?: number;
  /** Datum der Rezension, ISO. */
  datum?: string;
  /** Link zur Fundstelle. */
  url?: string;
}

/**
 * Stand 31.08.2026: Band 1 hat zwei Kundenrezensionen bei Amazon, beide fünf
 * Sterne. Die anderen Wege — tolino, Buchhandel, Goodreads — gibt es noch
 * nicht; von dort steht deshalb nichts hier.
 */
export const BEWERTUNGEN: Bewertungsstand[] = [
  // Abgelesen am 31.08.2026 auf der Rezensionsseite: zwei Kundenrezensionen,
  // beide fünf Sterne, also 5,0 im Schnitt.
  //
  // Sie stehen hier einmal und nicht dreimal. Amazon zeigt dieselben
  // Rezensionen bei Taschenbuch, gebundener Ausgabe und Kindle — je Ausgabe
  // gezählt wären es sechs Bewertungen, die es nicht gibt. Beide sind zum
  // Taschenbuch abgegeben.
  {
    bandId: 'band-1',
    quelle: 'Amazon',
    url: 'https://www.amazon.de/dp/B0HG4LPJKV',
    schnitt: 5,
    anzahl: 2,
    stand: '2026-08-31',
  },
];

/**
 * Wörtlich, wie sie öffentlich stehen — auch die Großschreibung.
 *
 * Umformuliert wird nichts: Ein geglättetes Zitat ist kein Zitat mehr, und wer
 * es mit dem Original vergleicht, findet den Unterschied sofort. Zitiert ist
 * jeweils der Rezensionstext, nicht die Überschrift; die Überschriften tragen
 * Emojis, die auf dieser Seite nichts zu suchen haben.
 */
export const STIMMEN: Leserstimme[] = [
  {
    bandId: 'band-1',
    quelle: 'Amazon',
    text: 'SUPER BUCH, VIELEN HERZLICHEN DANK! ICH EMPFEHLE ES UNBEDINGT WEITER!',
    autor: 'Würmchen',
    sterne: 5,
    datum: '2026-08-27',
    url: 'https://www.amazon.de/dp/B0HG4LPJKV',
  },
  {
    bandId: 'band-1',
    quelle: 'Amazon',
    text: 'Gigantisch',
    autor: 'Amazon Kunde',
    sterne: 5,
    datum: '2026-08-27',
    url: 'https://www.amazon.de/dp/B0HG4LPJKV',
  },
];

// Eine Sternzahl über der Skala ist ein Tippfehler, kein Lob – sie würde als
// volle fünf Sterne angezeigt und ins Datenblatt wandern. Solche Zeilen zählen
// hier einfach nicht mit.
const brauchbar = (b: Bewertungsstand) =>
  b.anzahl > 0 && b.schnitt > 0 && b.schnitt <= (b.skala ?? 5);

/** Die Sternzahlen eines Bandes, je Händler eine – nur die belegten. */
export const bewertungenVon = (bandId: BandId) =>
  BEWERTUNGEN.filter((b) => b.bandId === bandId && brauchbar(b));

const vomHaendler = (s: Leserstimme) => (s.art ?? 'haendler') === 'haendler';

/**
 * Die nachprüfbaren Zitate eines Bandes, höchstens so viele wie gewünscht.
 *
 * Nur, was öffentlich bei einem Händler steht. Was über das Formular kam,
 * holt `direktstimmenVon` – getrennt, weil es getrennt gezeigt wird.
 */
export const stimmenVon = (bandId: BandId, hoechstens?: number) => {
  const alle = STIMMEN.filter((s) => s.bandId === bandId && vomHaendler(s));
  return hoechstens === undefined ? alle : alle.slice(0, hoechstens);
};

/** Die Zuschriften über das Formular dieser Seite. */
export const direktstimmenVon = (bandId: BandId, hoechstens?: number) => {
  const alle = STIMMEN.filter((s) => s.bandId === bandId && !vomHaendler(s));
  return hoechstens === undefined ? alle : alle.slice(0, hoechstens);
};

/**
 * Das Gesamturteil über alle Quellen, auf fünf Sterne umgerechnet und nach
 * Anzahl gewichtet.
 *
 * Gewichtet, weil sonst eine einzelne Fünf-Sterne-Stimme auf einem kleinen
 * Portal denselben Ausschlag gäbe wie vierzig bei Amazon. Angezeigt wird die
 * Zahl immer zusammen mit den Quellen, aus denen sie stammt – eine
 * Durchschnittszahl ohne Herkunft ist eine Behauptung.
 */
export const gesamturteil = (bandId: BandId) => {
  const teile = bewertungenVon(bandId);
  if (teile.length === 0) return null;
  const gewicht = teile.reduce((s, b) => s + b.anzahl, 0);
  const summe = teile.reduce((s, b) => s + (b.schnitt / (b.skala ?? 5)) * 5 * b.anzahl, 0);
  return {
    schnitt: Math.round((summe / gewicht) * 10) / 10,
    anzahl: gewicht,
    skala: 5,
    quellen: [...new Set(teile.map((b) => b.quelle))],
    stand: teile.map((b) => b.stand).sort().at(-1) as string,
  };
};

/** Gibt es überhaupt irgendwo etwas zu zeigen? Für die Startseite. */
export const esGibtStimmen = () => BEWERTUNGEN.some(brauchbar) || STIMMEN.length > 0;

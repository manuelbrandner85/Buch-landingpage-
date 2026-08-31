/**
 * Der Film über das Haus.
 *
 * Eine Datei, ein Poster, ein Text — mehr braucht die Startseite nicht zu
 * wissen. Solange `datei` leer ist, erscheint der Abschnitt gar nicht;
 * dieselbe Regel wie beim Verteiler und beim Bewertungsformular. Lieber kein
 * Film als ein Kasten, in dem nichts läuft.
 *
 * `text` ist der gesprochene beziehungsweise geschriebene Inhalt des Films,
 * Satz für Satz. Er steht nicht zur Zierde hier: Vorleseprogramme bekommen
 * ihn, Suchmaschinen lesen ihn, und wer lieber liest als sieht, hat ihn.
 * Ändert sich der Film, ändert sich diese Liste mit — ein Text, der etwas
 * anderes sagt als der Film, ist schlimmer als keiner.
 */
export interface Hausfilmangabe {
  /** Pfad unterhalb der Domain, z. B. `/film/trendonix-film.mp4`. Leer = kein Abschnitt. */
  datei: string;
  /**
   * Dieselbe Fassung kleiner, für schmale Geräte.
   *
   * Nicht Bequemlichkeit, sondern Anstand: Die große Fassung ist rund 13 MB.
   * Über Mobilfunk ist das viel Geld für einen Film, den niemand angefordert
   * hat. Die kleine ist halb so groß und auf einem Telefonbildschirm nicht
   * davon zu unterscheiden.
   */
  dateiKlein?: string;
  poster: string;
  titel: string;
  /** Als Wort, wie es unter dem Abspielknopf steht: „1:26 Minuten“. */
  laenge?: string;
  text: string[];
}

/**
 * Die Fassungsnummer hinter jeder Adresse — und warum sie nicht fehlen darf.
 *
 * Der Webserver schickt zu jeder mp4 den Kopfeintrag
 * `Cache-Control: public, max-age=31536000, immutable` (siehe
 * scripts/htaccess.mjs). Das ist für alles richtig, dessen Dateiname sich mit
 * dem Inhalt ändert — bei Next.js ist das alles. Für eine Datei mit festem
 * Namen, die überschrieben wird, ist es eine Falle: `immutable` heißt, dass
 * der Browser **gar nicht mehr nachfragt**. Ein Jahr lang.
 *
 * Am 31.08.2026 lag deshalb kurzzeitig eine Tonspur mit einem
 * Kodierungsfehler auf der Seite, und wer sie in diesen Stunden geladen
 * hatte, hätte sie bis 2027 behalten — auch nach dem Neuladen.
 *
 * Eine geänderte Adresse ist ein anderer Eintrag im Zwischenspeicher. Also:
 * **Wer den Film austauscht, zählt hier hoch.** Ohne das ist der Austausch
 * für jeden, der schon einmal da war, wirkungslos.
 */
const FASSUNG = '2';

export const HAUSFILM: Hausfilmangabe = {
  datei: `/film/trendonix-film.mp4?f=${FASSUNG}`,
  dateiKlein: `/film/trendonix-film-klein.mp4?f=${FASSUNG}`,
  poster: `/film/trendonix-film.jpg?f=${FASSUNG}`,
  titel: 'Der Film über Trendonix',
  laenge: '1:24 Minuten',
  text: [
    'Vor mehr als drei Millionen Jahren geht jemand durch feuchte Asche.',
    'Was blieb, sind Fußspuren. Mehr nicht.',
    'Und trotzdem wissen wir daraus, dass er aufrecht ging.',
    'Trendonix ist ein Haus für solche Fragen.',
    'Nicht für Antworten, die schon feststehen. Für den Weg dorthin.',
    'Woher wir kommen und was uns geformt hat.',
    'Warum Zufall selten Zufall ist.',
    'Woher Energie kommt, wenn keine mehr da ist.',
    'Wie aus einem Gedanken eine Haltung wird.',
    'Und was von einer Behauptung übrig bleibt, wenn man nachprüft.',
    'Manches lässt sich nicht erzählen. Nur zeigen.',
    'Deshalb bekommt jedes Buch eine Welt.',
    'Orte, die man betreten kann.',
    'Und die Belege stehen dort, wo sie hingehören: daneben.',
    'Ein Haus mit einer einzigen Regel:',
    'Behauptet wird nichts, was sich nicht prüfen lässt.',
  ],
};

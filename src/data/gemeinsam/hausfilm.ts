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
  /**
   * Dieselbe Länge in der Schreibweise, die Suchmaschinen lesen (ISO 8601).
   *
   * Ohne sie zeigt Google den Film im Treffer nicht als Video an — und ein
   * Treffer mit Vorschaubild und Laufzeit wird ungleich häufiger geklickt als
   * eine Textzeile. Zwei Schreibweisen derselben Zahl sind lästig; eine
   * gerechnete wäre schlimmer, weil sie stillschweigend falsch würde.
   */
  dauerISO?: string;
  /** Wann der Film veröffentlicht wurde, ISO. Gehört ins Datenblatt. */
  erschienen?: string;
  /** Ein Satz für das Datenblatt — nicht der Text, sondern worum es geht. */
  worum?: string;
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
const FASSUNG = '3';

export const HAUSFILM: Hausfilmangabe = {
  datei: `/film/trendonix-film.mp4?f=${FASSUNG}`,
  dateiKlein: `/film/trendonix-film-klein.mp4?f=${FASSUNG}`,
  poster: `/film/trendonix-film.jpg?f=${FASSUNG}`,
  titel: 'Der Film über Trendonix',
  laenge: '1:10 Minuten',
  dauerISO: 'PT1M10S',
  erschienen: '2026-09-01',
  worum:
    'Ein Film über das Haus Trendonix: die Fragen, an denen es arbeitet, die '
    + 'Themen, die noch dazukommen, und die eine Regel, nach der hier nichts '
    + 'behauptet wird, was sich nicht prüfen lässt.',
  // Der gesprochene Text — und zugleich das, was Vorleseprogramme unter dem
  // Film bekommen. Eine Quelle, zwei Verwendungen, keine Abweichung möglich.
  //
  // Die Fassung vom 01.09.2026 nennt kein Buch mehr. Der Vorgänger endete bei
  // den Welten der vorhandenen Bände — richtig für den Tag, an dem er entstand,
  // und falsch für jeden Tag danach: Ein Haus, das über Mindset, Energie und
  // Persönlichkeit weiterschreibt, kann sich nicht mit seinem Katalog von 2026
  // vorstellen. Der Film trägt jetzt die Haltung, nicht den Bestand.
  text: [
    'Vor mehr als drei Millionen Jahren geht jemand durch feuchte Asche.',
    'Was blieb, sind Fußspuren. Mehr nicht.',
    'Und trotzdem wissen wir daraus, dass er aufrecht ging.',
    'Trendonix ist ein Haus für solche Fragen.',
    'Nicht für Antworten, die schon feststehen. Für den Weg dorthin.',
    'Kein Verlag für ein Thema. Ein Haus mit vielen Türen.',
    'Woher wir kommen, und was uns geformt hat.',
    'Warum Zufall selten Zufall ist.',
    'Woher Energie kommt, wenn keine mehr da ist.',
    'Wie aus einem Gedanken eine Haltung wird.',
    'Und wer man ist, wenn keiner hinschaut.',
    'Dahinter steht kein Verlag. Sondern jemand, der nachprüft.',
    'Ein Haus mit einer einzigen Regel.',
    'Behauptet wird nichts, was sich nicht prüfen lässt.',
    'Trendonix.',
  ],
};

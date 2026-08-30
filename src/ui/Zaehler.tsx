import { weg } from '@/world/wege';

/**
 * Das Zaehlpixel - ohne Cookie, ohne Kennung, ohne Einwilligung.
 *
 * Eine statisch ausgelieferte Seite kann nicht selbst zaehlen; irgendwo muss
 * ein Zaehler stehen. Frueher stand hier die Vorbereitung fuer einen fremden,
 * cookiefreien Dienst. Jetzt zaehlt die Seite selbst: `public/z.php` liegt
 * neben ihr auf demselben Webspace, schreibt vier Angaben je Aufruf nach
 * `besuche.csv` - Datum, Stunde, Herkunfts-Domain, Handy oder Rechner - und
 * gibt ein durchsichtiges Pixel zurueck. Keine IP, kein Cookie, keine
 * Kennung. Was dort steht, ist die Bewegung auf der Seite, nicht der Mensch
 * davor.
 *
 * Ein Bild und kein Skript, und das mit Absicht: So zaehlt auch der Besuch
 * mit, bei dem JavaScript abgeschaltet ist. Und weil es genau ein Bild je
 * geladener Seite ist, zaehlt es Besuche und nicht jeden Klick - wer sich
 * durch fuenf Unterseiten liest, ist ein Besucher, kein halbes Dutzend.
 *
 * Auf dem Bau-Spiegel unter github.io gibt es kein PHP. Dort erscheint das
 * Pixel gar nicht erst, statt bei jedem Aufruf einen 404 zu holen.
 */
export function Zaehler() {
  if (process.env.NEXT_PUBLIC_SPIEGEL === '1') return null;

  /**
   * Warum das Bild als roher HTML-Text und nicht als `<img>`-Element.
   *
   * React legt fuer jedes `<img>`, das es selbst darstellt, zusaetzlich ein
   * `<link rel="preload" as="image">` in den Kopf der Seite. Gut gemeint, hier
   * gefaehrlich: Damit fragen zwei Stellen dieselbe Adresse an. Chrome nimmt
   * beim Bild die vorgeladene Antwort und zaehlt einmal - darauf ist aber kein
   * Verlass, denn das Skript antwortet mit `no-store`, und ein Browser, der
   * den Vorlade-Speicher dann nicht anfasst, holt das Pixel ein zweites Mal.
   * Der Zaehler stuende doppelt so hoch, gleichmaessig und unbemerkt.
   *
   * Was React nicht als Element sieht, bekommt auch keinen Vorlade-Eintrag.
   * Also genau ein Anfragender, in jedem Browser. Kein Skript, kein
   * Nutzereingriff, keine fremden Daten - nur diese eine feste Zeile.
   *
   * Nicht `display:none` und nicht `hidden`: Ein verstecktes Bild laedt
   * mancher Browser gar nicht erst, und dann zaehlt nichts.
   */
  const pixel = `<img src="${weg('/z.php')}" width="1" height="1" alt=""`
    + ' aria-hidden="true" style="position:absolute;left:-9999px">';
  return <span aria-hidden="true" dangerouslySetInnerHTML={{ __html: pixel }} />;
}

/** Laeuft ueberhaupt ein Zaehler? Das Impressum muss es wissen. */
export const zaehlerLaeuft = (): boolean => process.env.NEXT_PUBLIC_SPIEGEL !== '1';

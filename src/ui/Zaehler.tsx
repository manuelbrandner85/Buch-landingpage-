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
  return (
    <img
      src={weg('/z.php')}
      width={1}
      height={1}
      alt=""
      aria-hidden="true"
      /* Nicht `display:none` und nicht `hidden`: Ein verstecktes Bild laedt
         mancher Browser gar nicht erst, und dann zaehlt nichts. */
      style={{ position: 'absolute', left: '-9999px' }}
    />
  );
}

/** Laeuft ueberhaupt ein Zaehler? Das Impressum muss es wissen. */
export const zaehlerLaeuft = (): boolean => process.env.NEXT_PUBLIC_SPIEGEL !== '1';

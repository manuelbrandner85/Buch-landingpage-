<?php
/**
 * Das Zaehlpixel.
 *
 * Eine statisch ausgelieferte Seite kann nicht selbst zaehlen - irgendwo muss
 * ein Zaehler stehen. Hier steht er auf demselben Server wie die Seite, und
 * er speichert absichtlich zu wenig, um jemanden wiederzuerkennen:
 *
 *   KEINE IP-Adresse. KEIN Cookie. KEINE Kennung, keine Sitzung, kein
 *   Fingerabdruck. Gespeichert werden vier Angaben je Aufruf - Datum, Stunde,
 *   Herkunfts-Domain, Handy oder Rechner. Aus keiner Zeile und aus keiner
 *   Kombination von Zeilen laesst sich ein Mensch herauslesen.
 *
 * Genau deshalb braucht diese Seite kein Einwilligungsbanner: Es wird nichts
 * auf dem Geraet des Besuchers abgelegt oder ausgelesen (kein Fall von
 * Paragraph 25 TDDDG), und ein Personenbezug entsteht nicht.
 *
 * Die Datei besuche.csv legt sich beim ersten Aufruf selbst an. Sie ist per
 * .htaccess gesperrt und wird beim Veroeffentlichen ausdruecklich verschont -
 * ohne diese Ausnahme wuerde der Abgleich sie bei jedem Push loeschen.
 */
declare(strict_types=1);

// Kein Fehlertext ins Bild. Was hier gedruckt wird, landet mitten in der GIF
// und macht aus dem Pixel einen kaputten Platzhalter.
ini_set('display_errors', '0');

$datei = __DIR__ . '/besuche.csv';
$kennung = $_SERVER['HTTP_USER_AGENT'] ?? '';

/**
 * Roboter zaehlen nicht mit.
 *
 * Ohne diese Zeile stuende in der Datei vor allem, wie oft Google, Bing und
 * zwei Dutzend Datensammler vorbeigeschaut haben - und die Zahl unter dem
 * Copyright waere eine Luege. Eine leere Kennung gilt ebenfalls als Maschine:
 * Ein Browser schickt immer eine.
 */
$roboter = $kennung === '' || preg_match(
    '~bot|crawl|spider|slurp|search|scrape|fetch|monitor|uptime|pingdom|'
  . 'lighthouse|headless|phantom|curl|wget|python|java/|go-http|okhttp|'
  . 'libwww|httrack|semrush|ahrefs|mj12|dotbot|petal|yandex|baidu|sogou|'
  . 'duckduck|applebot|gptbot|claudebot|ccbot|bytespider|amazonbot|'
  . 'perplexity|facebookexternalhit|whatsapp|telegram|discord|preview|'
  . 'embed|validator|feed~i',
    $kennung
) === 1;

/**
 * Handy oder Rechner - mehr wird nicht unterschieden.
 *
 * Eine feinere Auswertung (Modell, Fassung, Betriebssystem) waere schon der
 * Anfang eines Fingerabdrucks. Zwei Werte genuegen fuer die einzige Frage,
 * die hier zaehlt: Muss die Seite auf dem kleinen Schirm funktionieren?
 */
$geraet = preg_match('~Mobi|Android|iPhone|iPad|iPod|Windows Phone|IEMobile|Opera Mini~i', $kennung) === 1
    ? 'Handy'
    : 'Rechner';

/**
 * Woher kommt der Besuch?
 *
 * Nur die Domain, nie die volle Adresse: In einem Suchmaschinen-Referer steht
 * mitunter der eingegebene Suchbegriff, und der geht niemanden etwas an. Ein
 * Klick von einer Unterseite auf die naechste ist keine Quelle, sondern
 * derselbe Besuch - eigene Aufrufe zaehlen deshalb als "direkt".
 *
 * Der Referer kommt vom Besucher, ist also nichts, worauf man sich verlassen
 * kann. Deshalb bleibt am Ende nur, was harmlos ist: Buchstaben, Ziffern,
 * Punkt, Strich. Ein Tabulator oder ein Zeilenumbruch darin wuerde sonst die
 * Datei zerlegen, und ein langer Wert sie aufblaehen.
 */
$eigen = strtolower((string) preg_replace('~^www\.~', '', explode(':', (string) ($_SERVER['HTTP_HOST'] ?? ''))[0]));
$quelle = 'direkt';
$verweis = $_SERVER['HTTP_REFERER'] ?? '';
if ($verweis !== '') {
    $host = parse_url($verweis, PHP_URL_HOST);
    if (is_string($host) && $host !== '') {
        $host = strtolower((string) preg_replace('~^www\.~', '', $host));
        if ($host !== $eigen && $host !== '') {
            $quelle = $host;
        }
    }
}
$quelle = (string) preg_replace('~[^a-z0-9.\-]~', '', $quelle);
if ($quelle === '') { $quelle = 'unbekannt'; }
if (strlen($quelle) > 80) { $quelle = substr($quelle, 0, 80); }

/**
 * Eine Zeile, mit Tabulator getrennt: Datum, Stunde, Quelle, Geraet.
 *
 * LOCK_EX ist kein Zierrat: Zwei Besucher im selben Augenblick schreiben
 * sonst ineinander, und aus zwei Zeilen wird eine kaputte. Das @ davor, weil
 * ein voller Webspace den Zaehler stumm machen soll, nicht die Seite.
 */
if (!$roboter) {
    $zeile = implode("\t", [date('Y-m-d'), date('H'), $quelle, $geraet]) . "\n";
    @file_put_contents($datei, $zeile, FILE_APPEND | LOCK_EX);
}

/**
 * Und zuletzt das Bild: ein durchsichtiges Pixel, 42 Byte.
 *
 * Ohne die Sperre gegen den Zwischenspeicher holt der Browser es genau einmal
 * und danach nie wieder - der Zaehler stuende dann still, waehrend die Seite
 * weiter besucht wird. Aus demselben Grund steht in der .htaccess eine Regel,
 * die mod_expires fuer PHP-Dateien abschaltet: Was der Server dort vorgibt,
 * uebersteuert sonst diese Kopfzeilen.
 */
$pixel = base64_decode('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');
header('Content-Type: image/gif');
header('Content-Length: ' . strlen($pixel));
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Expires: 0');
echo $pixel;

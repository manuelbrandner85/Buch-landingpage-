/**
 * Der goldene Faden — als Geometrie, einmal.
 *
 * Er ist das Markenzeichen und muss auf jeder Stufe DIESELBE Silhouette
 * haben: als WebGL-Band mit Schimmer, als schlichter SVG-Strich, als
 * Standbild. Wenn jede Fassung ihre eigene Kurve zeichnet, laufen sie
 * auseinander, und der Faden ist kein Zeichen mehr, sondern eine Dekoration,
 * die zufaellig ueberall etwas anders aussieht.
 *
 * Deshalb liegt die Kurve hier — rein, ohne DOM, ohne Zufall zur Laufzeit.
 *
 * Und deshalb rechnet diese Datei die Bogenlaenge selbst aus. Die bisherige
 * Fassung fragte je Scroll-Ereignis `pfad.getPointAtLength()` und
 * `document.body.scrollHeight` ab; beides zwingt den Browser, das Layout
 * neu zu rechnen, mitten im Scrollen. Eine Tabelle, die einmal entsteht und
 * danach nur noch gelesen wird, kostet nichts.
 */

export interface Punkt {
  x: number;
  y: number;
}

export interface Kurvenvorgabe {
  /** Seitenverhaeltnis des Fensters. Bestimmt, wie weit der Faden ausholt. */
  seitenverhaeltnis: number;
  /** Wie viele Punkte die Feinkurve bekommt. Mehr = glatter und teurer. */
  aufloesung?: number;
  /** Feste Saat — gleiche Saat, gleiche Kurve. Nie `Math.random()`. */
  saat?: number;
  /** Zahl der Schwuenge ueber die volle Hoehe. */
  schwuenge?: number;
}

/**
 * Ein kleiner, reproduzierbarer Zufall.
 *
 * Ausgefuehrt, weil die Kurve selbst noch nicht steht: Der Faden kommt nach
 * der abgesprochenen Reihenfolge erst aus Blender, dann ins Web. Bis dahin
 * ist das hier die Vorgabe, an der sich beide Seiten ausrichten — und diese
 * Funktion ist der Teil davon, der schon benutzbar ist.
 */
export function saatzufall(saat: number): () => number {
  let s = saat >>> 0;
  return () => {
    // xorshift32 — kurz, schnell, und ueberall gleich.
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 100000) / 100000;
  };
}

import type { Budget, Netz } from './typen';

/** Die drei Dateien plus „gar keine". */
type Modellfassung = Budget['modellfassung'];

/**
 * Was die Leitung kann.
 *
 * Die Angaben des Browsers sind grob und in manchen Browsern gar nicht da.
 * Deshalb steht daneben eine echte Messung: die Ladezeit einer kleinen Datei.
 * Sie sagt mehr als jede Selbstauskunft, weil sie den ganzen Weg einschliesst
 * — Funkzelle, Zwischenspeicher, überlastetes Heimnetz.
 */

interface Verbindungsangabe {
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
}

export function netzLesen(): Netz {
  const nav = globalThis.navigator as Navigator & {
    connection?: Verbindungsangabe;
    mozConnection?: Verbindungsangabe;
    webkitConnection?: Verbindungsangabe;
  };
  const v = nav?.connection ?? nav?.mozConnection ?? nav?.webkitConnection;
  return {
    ...(v?.effectiveType !== undefined ? { art: v.effectiveType } : {}),
    ...(v?.downlink !== undefined ? { bandbreite: v.downlink } : {}),
    ...(v?.rtt !== undefined ? { laufzeit: v.rtt } : {}),
    datensparen: v?.saveData === true,
  };
}

/**
 * Eine kleine Datei laden und die Zeit nehmen.
 *
 * `cache: 'no-store'` ist hier nicht Vorsicht, sondern Bedingung: Aus dem
 * Zwischenspeicher gelesen wäre jede Leitung schnell, und die Messung wäre
 * wertlos. Schlägt sie fehl, bleibt der Wert `undefined` — ein Fehler bei der
 * Messung ist kein Beleg für eine langsame Leitung.
 */
export async function netzMessen(pfad: string, netz: Netz): Promise<Netz> {
  const beginn = jetztMs();
  try {
    const antwort = await fetch(pfad, { cache: 'no-store' });
    await antwort.arrayBuffer();
  } catch {
    return netz;
  }
  return { ...netz, gemesseneLadezeit: jetztMs() - beginn };
}

function jetztMs(): number {
  return globalThis.performance?.now?.() ?? Date.now();
}

/**
 * Welche Modellfassung darf über diese Leitung kommen?
 *
 * Bis hierher hing die Modellfassung allein an der Stufe, und die Stufe hing
 * am Gerät. Das übersieht den häufigsten Fall überhaupt: ein starkes Telefon
 * an einer schlechten Leitung. Es bekam die hohe Fassung, weil es sie
 * rechnen kann — und wartete dann Sekunden darauf, dass sie ankommt.
 *
 * Es sind zwei verschiedene Fragen, und deshalb stehen sie hier getrennt:
 *
 *   Was kann das Gerät RECHNEN?   → Stufe, Schatten, Partikel, Nachbearbeitung
 *   Was kann die Leitung TRAGEN?  → allein die Modellfassung
 *
 * Wer bei schwacher Leitung die ganze Stufe senkt, nimmt einem Gerät Schatten
 * und Licht weg, die es mühelos gerechnet hätte. Das Bild würde schlechter,
 * ohne dass es schneller da wäre.
 *
 * Die Schwellen sind aus den gemessenen Dateigrössen gerechnet, nicht
 * geschätzt. Nach der Umstellung auf WebP wiegen die drei Fassungen
 * 640 / 245 / 90 KB. Maßstab ist: das Modell soll in rund drei Sekunden da
 * sein, denn so lange trägt das Standbild die Szene, ohne dass jemand auf
 * etwas wartet.
 *
 *   640 KB in 3 s  ≈ 1,7 Mbit/s
 *   245 KB in 3 s  ≈ 0,7 Mbit/s
 *
 * Ohne jede Angabe wird nicht geraten — dieselbe Regel wie unten beim
 * Streaming. Eine Leitung, über die nichts bekannt ist, gilt nicht als
 * schlecht.
 */
export function modellfassungFuerLeitung(
  fassung: Modellfassung,
  netz: Netz,
): Modellfassung {
  const rang: Modellfassung[] = ['high', 'medium', 'low'];
  const deckeln = (deckel: Modellfassung): Modellfassung => {
    const a = rang.indexOf(fassung);
    // 'keine' steht nicht auf der Leiter: Dort wird gar nichts geladen, und
    // eine schlechte Leitung macht daraus nicht plötzlich ein Modell.
    if (a < 0) return fassung;
    return a > rang.indexOf(deckel) ? fassung : deckel;
  };

  if (netz.datensparen) return deckeln('low');
  if (netz.art === 'slow-2g' || netz.art === '2g') return deckeln('low');
  if (netz.art === '3g') return deckeln('medium');

  if (netz.bandbreite !== undefined) {
    if (netz.bandbreite < 0.7) return deckeln('low');
    if (netz.bandbreite < 1.7) return deckeln('medium');
  }

  // Die eigene Messung schlägt die Selbstauskunft: Sie hat den ganzen Weg
  // gesehen, nicht nur die Funkzelle.
  if (netz.gemesseneLadezeit !== undefined) {
    if (netz.gemesseneLadezeit > 2000) return deckeln('low');
    if (netz.gemesseneLadezeit > 800) return deckeln('medium');
  }

  return fassung;
}

/**
 * Reicht die Leitung für ein Bild aus dem Rechenzentrum?
 *
 * Pixel Streaming überträgt ein Videobild und schickt Eingaben zurück. Was
 * dabei zählt, ist nicht die Spitzenbandbreite, sondern die Laufzeit: Bei mehr
 * als rund 80 ms zwischen Klick und Bild fühlt sich jede Bedienung zäh an, und
 * eine zähe Bedienung ist schlimmer als eine einfachere Grafik.
 *
 * Die Region des Servers zählt deshalb mehr als seine Leistung. Ein starker
 * Server in Übersee ist unbedienbar, ein mittlerer in der Nähe nicht.
 *
 * Rein — deshalb prüfbar.
 */
export function netzTraegtStreaming(netz: Netz): boolean {
  if (netz.datensparen) return false;

  if (netz.art && ['slow-2g', '2g', '3g'].includes(netz.art)) return false;

  // 15 Mbit/s ist die Grenze, unterhalb derer ein Videobild in 1080p sichtbar
  // zusammenbricht, sobald sich etwas in der Szene bewegt.
  if (netz.bandbreite !== undefined && netz.bandbreite < 15) return false;

  if (netz.laufzeit !== undefined && netz.laufzeit > 120) return false;

  if (netz.gemesseneLadezeit !== undefined && netz.gemesseneLadezeit > 1500) {
    return false;
  }

  // Keine einzige Angabe vorhanden: nicht raten. Ohne Beleg wird keine
  // Grafikkarte im Rechenzentrum angemietet.
  return (
    netz.art !== undefined ||
    netz.bandbreite !== undefined ||
    netz.laufzeit !== undefined ||
    netz.gemesseneLadezeit !== undefined
  );
}

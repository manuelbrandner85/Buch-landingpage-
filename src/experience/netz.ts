import type { Netz } from './typen';

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

/**
 * Was gemessen wird – und wovon es abhängt.
 *
 * Dieselbe Bedingung wie beim Zähler: Solange keine Kennung eingetragen ist,
 * gibt es **nichts**. Kein Skript, kein Banner, keine Einwilligungsabfrage,
 * nicht auskommentiert, nicht vorbereitet – gar nicht. Die Seite bleibt dann
 * genau so sauber, wie sie heute ist, und die Datenschutzerklärung bleibt wahr.
 *
 * Steht dagegen eine Kennung da, gilt für Deutschland zwingend: Vor dem ersten
 * Kontakt zu Google muss eine Einwilligung vorliegen (§ 25 Abs. 1 TDDDG). Nicht
 * „Consent Mode mit eingeschränkter Messung", nicht „berechtigtes Interesse" –
 * Analytics ist nicht technisch notwendig, und damit führt kein Weg daran
 * vorbei. Deshalb wird `gtag` erst nach einem Klick auf „Einverstanden"
 * überhaupt in die Seite gehängt.
 *
 * Eintragen als Umgebungsvariable beim Bau:
 *
 *   NEXT_PUBLIC_GA4=G-XXXXXXXXXX
 *
 * Die Kennung ist kein Geheimnis – sie steht in jeder Seite, die sie benutzt.
 * Sie steht deshalb im Klartext in `.github/workflows/deploy.yml`, und nur
 * dort: G-H5TVRKQ9E4, Property „Trendonix Bücher" im Analytics-Konto
 * Trendonix2. Gesetzt wird sie ausschließlich für den Bau, der auf die eigene
 * Domain geht. Der github.io-Spiegel bekommt sie nicht und misst deshalb nie –
 * das ist keine Einstellung, sondern eine fehlende Variable.
 */

/** Die Mess-Kennung, oder leer, wenn nicht gemessen wird. */
export const GA4 = (process.env.NEXT_PUBLIC_GA4 ?? '').trim();

/** Wird überhaupt gemessen? Impressum und Banner müssen es wissen. */
export const messungLaeuft = (): boolean => GA4.length > 0;

/** Der Schlüssel im lokalen Speicher. Drei Zustände: fehlt, 'ja', 'nein'. */
export const ZUSTIMMUNG_SCHLUESSEL = 'trendonix-messung';

/**
 * Ein Ereignis melden — unter denselben drei Bedingungen wie alles andere.
 *
 * Keine Kennung, keine Zustimmung, kein geladenes `gtag`: dann passiert nichts,
 * still und ohne Fehler. Diese Funktion prüft das selbst, damit keine
 * aufrufende Stelle es vergessen kann. Sie wirft nie — eine Messung darf eine
 * Seite nicht kaputtmachen.
 *
 * Gemeldet wird die Strecke, nicht die Person: welcher Punkt einer Welt
 * erreicht wurde, nicht wer ihn erreicht hat. Namen, Adressen, Kennungen gehen
 * hier nie hinein.
 */
export function melden(name: string, daten: Record<string, unknown> = {}): void {
  if (!messungLaeuft() || typeof window === 'undefined') return;
  try {
    if (window.localStorage.getItem(ZUSTIMMUNG_SCHLUESSEL) !== 'ja') return;
  } catch {
    return; // Kein Zugriff auf den Speicher heißt: keine nachweisbare Zustimmung.
  }
  const w = window as unknown as { dataLayer?: unknown[] };
  if (!w.dataLayer) return;
  w.dataLayer.push(['event', name, daten]);
}

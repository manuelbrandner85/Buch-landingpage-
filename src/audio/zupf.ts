'use client';

/**
 * Eine gezupfte Saite – gerechnet, nicht geladen.
 *
 * Karplus-Strong: ein kurzes Rauschen in einen Ring, dessen Länge die Tonhöhe
 * bestimmt, und bei jedem Umlauf der Mittelwert zweier Nachbarn. Das ist von
 * 1983, es sind zwanzig Zeilen, und es klingt nach Saite und nicht nach
 * Synthesizer. Eine Tondatei dafür wären fünfzig Kilobyte für einen einzigen
 * Ton; hier sind es keine.
 *
 * Wann es klingt: nur nach einer ausdrücklichen Geste – man greift den Faden
 * und lässt ihn los. Ungefragt macht die Seite keinen Ton. Steht die Welt auf
 * „Ruhig“, bleibt es auch dann still: Wer die Seite leise gestellt hat, meint
 * die ganze Seite.
 *
 * Die Tonhöhe kommt von der Stelle: Wer weiter außen zupft, hört einen
 * höheren Ton. Fünf Stufen einer Molltonleiter ohne Halbtonschritte – damit
 * kann man nichts Falsches treffen, egal wo man hinlangt.
 */

const STUFEN = [110, 130.81, 146.83, 174.61, 196, 220, 261.63, 293.66];

let ctx: AudioContext | null = null;
const speicher = new Map<number, AudioBuffer>();

function leise(): boolean {
  if (typeof document === 'undefined') return true;
  return Boolean(document.querySelector('.welt')?.classList.contains('ruhig'));
}

function saite(a: AudioContext, hz: number): AudioBuffer {
  const n = Math.round(a.sampleRate / hz);
  const dauer = Math.round(a.sampleRate * 2.2);
  const puffer = a.createBuffer(1, dauer, a.sampleRate);
  const d = puffer.getChannelData(0);
  const ring = new Float32Array(n);
  for (let i = 0; i < n; i += 1) ring[i] = Math.random() * 2 - 1;
  // Der Anschlag ist gedämpft: Ein volles weißes Rauschen klingt nach Zupfen
  // mit dem Plektrum, ein geglättetes nach Zupfen mit dem Finger. Das Buch
  // ist kein Rockkonzert.
  for (let d2 = 0; d2 < 3; d2 += 1) {
    for (let i = 0; i < n; i += 1) ring[i] = (ring[i]! + ring[(i + 1) % n]!) * 0.5;
  }
  let p = 0;
  for (let i = 0; i < dauer; i += 1) {
    const j = (p + 1) % n;
    const wert = (ring[p]! + ring[j]!) * 0.5 * 0.9965;
    d[i] = ring[p]!;
    ring[p] = wert;
    p = j;
  }
  return puffer;
}

/**
 * @param anteil 0..1 – wo am Faden gezupft wurde.
 * @param staerke 0..1 – wie weit er ausgelenkt war.
 */
export function zupfen(anteil: number, staerke: number): void {
  if (leise()) return;
  try {
    const AC = window.AudioContext
      ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    ctx ??= new AC();
    if (ctx.state === 'suspended') void ctx.resume();
    const stufe = Math.min(STUFEN.length - 1,
      Math.max(0, Math.round(anteil * (STUFEN.length - 1))));
    let puffer = speicher.get(stufe);
    if (!puffer) { puffer = saite(ctx, STUFEN[stufe]!); speicher.set(stufe, puffer); }

    const quelle = ctx.createBufferSource();
    quelle.buffer = puffer;
    const lautstaerke = ctx.createGain();
    // Leise bleiben: Der Ton soll bestätigen, dass da etwas gespannt ist,
    // nicht die Aufmerksamkeit an sich reißen.
    const spitze = Math.min(0.22, 0.05 + staerke * 0.012);
    lautstaerke.gain.setValueAtTime(spitze, ctx.currentTime);
    lautstaerke.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.1);
    quelle.connect(lautstaerke).connect(ctx.destination);
    quelle.start();
    quelle.stop(ctx.currentTime + 2.2);
  } catch {
    // Kein Ton ist kein Fehler, der die Seite betrifft.
  }
}

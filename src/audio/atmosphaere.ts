'use client';

/**
 * Atmosphäre wird erzeugt, nicht geladen – und sie folgt der Szene.
 *
 * Feuer, Wind und Wasser unterscheiden sich nicht in der Quelle, sondern im
 * Filter und im Flackern. Drei Klangfarben aus einem Rauschen, ineinander
 * geblendet. Das spart drei Audiodateien und klingt weicher als ein Schnitt.
 */
export type Klang = 'feuer' | 'wind' | 'wasser';

interface Stimme { gain: GainNode; filter: BiquadFilterNode }

const EINSTELLUNG: Record<Klang, { frequenz: number; guete: number; flackern: number; tempo: number }> = {
  feuer:  { frequenz: 480, guete: 0.7, flackern: 0.018, tempo: 0.21 },
  wind:   { frequenz: 900, guete: 0.4, flackern: 0.030, tempo: 0.08 },
  wasser: { frequenz: 320, guete: 1.2, flackern: 0.012, tempo: 0.05 },
};

export interface Atmosphaere {
  an: () => void;
  aus: () => void;
  /** Blendet auf die Klangfarbe der aktuellen Szene um. */
  waehle: (klang: Klang | null) => void;
  frei: () => void;
}

export function erzeugeAtmosphaere(): Atmosphaere {
  let ctx: AudioContext | null = null;
  let haupt: GainNode | null = null;
  const stimmen = new Map<Klang, Stimme>();
  let aktiv: Klang | null = null;
  let an = false;

  const start = () => {
    const AC = window.AudioContext
      ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new AC();
    haupt = ctx.createGain();
    haupt.gain.value = 0;
    haupt.connect(ctx.destination);

    // Ein gemeinsames braunes Rauschen, dreifach gefiltert.
    const n = ctx.sampleRate * 4;
    const puffer = ctx.createBuffer(1, n, ctx.sampleRate);
    const daten = puffer.getChannelData(0);
    let letzt = 0;
    for (let i = 0; i < n; i++) {
      const weiss = Math.random() * 2 - 1;
      letzt = (letzt + 0.02 * weiss) / 1.02;
      daten[i] = letzt * 3.2;
    }

    for (const klang of Object.keys(EINSTELLUNG) as Klang[]) {
      const e = EINSTELLUNG[klang];
      const quelle = ctx.createBufferSource();
      quelle.buffer = puffer; quelle.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass'; filter.frequency.value = e.frequenz; filter.Q.value = e.guete;
      const gain = ctx.createGain(); gain.gain.value = 0;
      quelle.connect(filter).connect(gain).connect(haupt);
      quelle.start();

      const lfo = ctx.createOscillator(); lfo.frequency.value = e.tempo;
      const lfoGain = ctx.createGain(); lfoGain.gain.value = e.flackern;
      lfo.connect(lfoGain).connect(gain.gain); lfo.start();

      stimmen.set(klang, { gain, filter });
    }
  };

  const blende = (klang: Klang | null) => {
    if (!ctx) return;
    const jetzt = ctx.currentTime;
    for (const [name, stimme] of stimmen) {
      const ziel = an && name === klang ? 0.05 : 0;
      stimme.gain.gain.cancelScheduledValues(jetzt);
      stimme.gain.gain.linearRampToValueAtTime(ziel, jetzt + 2.2);
    }
  };

  return {
    an() {
      if (!ctx) start();
      void ctx?.resume();
      an = true;
      haupt?.gain.linearRampToValueAtTime(1, (ctx?.currentTime ?? 0) + 0.4);
      blende(aktiv ?? 'feuer');
    },
    aus() {
      an = false;
      haupt?.gain.linearRampToValueAtTime(0, (ctx?.currentTime ?? 0) + 1.2);
    },
    waehle(klang) { aktiv = klang; if (an) blende(klang); },
    frei() { void ctx?.close(); ctx = null; haupt = null; stimmen.clear(); },
  };
}

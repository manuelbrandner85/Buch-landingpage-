'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { EVIDENZ, type Evidenz } from '@/data/gemeinsam/typen';

/**
 * Die These des Buches als Bedienelement.
 *
 * Vorher stand der Regler auch dort, wo es nichts zu filtern gab – auf der
 * Karte, auf Papierseiten, in ganzen Bänden ohne belegte Angaben. Ein Regler,
 * der nichts bewegt, macht die Idee dahinter unglaubwürdig: Man schiebt, nichts
 * passiert, und das Versprechen „Belege lassen sich prüfen“ wirkt wie Dekor.
 *
 * Deshalb gilt jetzt: Er erscheint nur, wo im sichtbaren Abschnitt tatsächlich
 * Angaben mit einer Stufe stehen, und er sagt, was er getan hat – wie viele
 * Angaben stehen bleiben und wie viele zurücktreten. Beim strengsten Grad
 * bleibt in manchen Abschnitten fast nichts stehen. Das ist keine Panne,
 * sondern die Aussage.
 */

/** Was die Stufen bedeuten. Die Enden benennt der Band selbst. */
const BEDEUTUNG: Record<Evidenz, string> = {
  A: 'gesicherter Befund',
  B: 'starke Indizien',
  C: 'plausibel, aber ohne Primärquelle',
  D: 'einzelne Darstellung',
  E: 'umstritten',
  F: 'schwach belegt',
  G: 'widerlegt',
};

export function EvidenzRegler() {
  const [stufe, setStufe] = useState(EVIDENZ.length - 1);
  const [gesamt, setGesamt] = useState(0);
  const [bleibt, setBleibt] = useState(0);
  const abschnitt = useRef<HTMLElement | null>(null);

  /** Anwenden – und zählen. Beides gehört zusammen: Der Regler soll zeigen, was er tut. */
  const anwenden = useCallback((s: number) => {
    const ziel = abschnitt.current;
    const knoten = Array.from(
      document.querySelectorAll<HTMLElement>('[data-evidenz]'));
    let n = 0;
    let steht = 0;
    knoten.forEach((k) => {
      const eigene = EVIDENZ.indexOf((k.dataset.evidenz ?? 'A') as Evidenz);
      const zurueck = eigene > s;
      k.classList.toggle('verblasst', zurueck);
      k.setAttribute('aria-hidden', zurueck ? 'true' : 'false');
      if (ziel && ziel.contains(k)) { n += 1; if (!zurueck) steht += 1; }
    });
    setGesamt(n);
    setBleibt(steht);
  }, []);

  useEffect(() => {
    const b = new IntersectionObserver(
      (eintraege) => {
        const sichtbarster = eintraege
          .filter((e) => e.isIntersecting)
          .sort((a, c) => c.intersectionRatio - a.intersectionRatio)[0];
        if (!sichtbarster) return;
        abschnitt.current = sichtbarster.target as HTMLElement;
        anwenden(stufe);
      },
      { threshold: [0.2, 0.5, 0.8] });
    document.querySelectorAll('main section[id]').forEach((s) => b.observe(s));
    return () => b.disconnect();
  }, [anwenden, stufe]);

  useEffect(() => { anwenden(stufe); }, [anwenden, stufe]);

  // Kein Ziel, kein Regler. Lieber kein Bedienelement als ein wirkungsloses.
  if (gesamt === 0) return null;

  const weg = gesamt - bleibt;

  return (
    <div className="regler an">
      <label htmlFor="evidenz">
        Ab Stufe <b>{EVIDENZ[stufe]}</b> – {BEDEUTUNG[EVIDENZ[stufe] as Evidenz]}
      </label>
      <input id="evidenz" type="range" min={0} max={EVIDENZ.length - 1} value={stufe}
        aria-describedby="evidenz-stand"
        onChange={(e) => setStufe(Number(e.target.value))} />
      <p className="skala" aria-hidden="true">
        <span>A gesichert</span><span>G widerlegt</span>
      </p>
      <p id="evidenz-stand" aria-live="polite">
        <b>{bleibt} von {gesamt}</b> {gesamt === 1 ? 'Angabe' : 'Angaben'} dieses
        Abschnitts {bleibt === 1 ? 'bleibt' : 'bleiben'} stehen
        {weg > 0 && <>, {weg} {weg === 1 ? 'tritt' : 'treten'} zurück</>}.
      </p>
    </div>
  );
}

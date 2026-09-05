'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { EVIDENZ, type Evidenz } from '@/data/gemeinsam/typen';
import { laessZerfallen } from '@/engine/zerfall';

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
  const vorige = useRef(EVIDENZ.length - 1);
  const zuletzt = useRef(0);

  /**
   * Der Höhepunkt: Auf der strengsten Stufe zerfällt nicht eine Angabe,
   * sondern der Abschnitt.
   *
   * Das ist die These des Bandes, in einem Bild: Wer nur gesicherte Befunde
   * gelten lässt, dem bleibt auf mancher Seite fast nichts stehen. Einzelne
   * zerfallende Zeilen zeigen das nicht – man sieht drei Stellen blasser
   * werden und liest weiter. Erst wenn die ganze Seite für einen Moment
   * verschwindet und danach nur das zurückkommt, was hält, ist der Satz
   * angekommen.
   *
   * Drei Riegel, damit daraus kein Jahrmarkt wird: Er läuft nur beim Eintritt
   * in die Stufe, nur wenn dort wirklich etwas zurücktritt, und höchstens
   * alle sechs Sekunden. Bei „Bewegung reduzieren“ gar nicht – dort bleibt es
   * beim Verblassen, und die Aussage steht trotzdem in der Zeile darunter.
   */
  const hoehepunkt = useCallback((ziel: HTMLElement) => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const jetzt = performance.now();
    if (jetzt - zuletzt.current < 6000) return;
    zuletzt.current = jetzt;

    // Nur was im Bild steht: Körner am oberen Rand, die niemand kommen sah,
    // sehen nach Fehler aus. Sechzehn Blöcke sind die Obergrenze des
    // Kornfeldes – darüber wird aus Zerfall Nebel.
    const bloecke = Array.from(
      ziel.querySelectorAll<HTMLElement>('p, h2, h3, blockquote, figcaption, li'))
      .filter((el) => {
        const r = el.getBoundingClientRect();
        return r.width > 40 && r.height > 8 && r.bottom > 0 && r.top < window.innerHeight;
      })
      .slice(0, 16);
    bloecke.forEach((el) => laessZerfallen(el));
    ziel.classList.add('hoehepunkt');
    window.setTimeout(() => ziel.classList.remove('hoehepunkt'), 1400);
  }, []);

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
      // Nur beim Übergang, nicht bei jedem Anwenden: Der Regler wird auch
      // aufgerufen, wenn nur ein anderer Abschnitt ins Bild kommt. Wer dann
      // alles noch einmal zerfallen ließe, bekäme ein Feuerwerk ohne Anlass.
      if (zurueck && !k.classList.contains('verblasst')) laessZerfallen(k);
      k.classList.toggle('verblasst', zurueck);
      k.setAttribute('aria-hidden', zurueck ? 'true' : 'false');
      if (ziel && ziel.contains(k)) { n += 1; if (!zurueck) steht += 1; }
    });
    setGesamt(n);
    setBleibt(steht);

    // Der Höhepunkt gehört an den Eintritt in die strengste Stufe, nicht an
    // jedes Anwenden: Der Regler wird auch aufgerufen, wenn nur ein anderer
    // Abschnitt ins Bild kommt.
    const eintritt = s === 0 && vorige.current !== 0;
    vorige.current = s;
    if (eintritt && ziel && n - steht > 0) hoehepunkt(ziel);
  }, [hoehepunkt]);

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

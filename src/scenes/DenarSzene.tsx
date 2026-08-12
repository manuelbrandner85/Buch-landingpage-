'use client';

import { useState } from 'react';
import type { Szene } from '@/data/gemeinsam/typen';
import { DENAR } from '@/data/band-1/interaktionen';
import { Quelle } from '@/ui/Quelle';

/**
 * Dreihundert Jahre Verdünnung (S. 138).
 * Der Regler zieht den Silbergehalt von 96 auf 5 Prozent – die Münze
 * sieht dabei die ganze Zeit gleich aus. Das ist der Punkt.
 */
export function DenarSzene({ szene }: { szene: Szene }) {
  const [index, setIndex] = useState(0);
  const punkt = DENAR[index] ?? DENAR[0];
  const jahr = punkt.jahr < 0 ? `${Math.abs(punkt.jahr)} v. Chr.` : `${punkt.jahr} n. Chr.`;

  return (
    <section id={szene.id} className="papier interaktion">
      <div>
        <p className="eyebrow">{szene.unterkapitel} · Geld und Vertrauen</p>
        <h2>{szene.titel}</h2>
        <p className="unterzeile">{szene.unterzeile}</p>

        <div className="denar-buehne">
          <div className="muenze" aria-hidden="true">
            {/* Das Aussehen ändert sich absichtlich nicht. */}
            <span>DENARIVS</span>
          </div>
          <div className="denar-werte">
            <p className="denar-anteil"><b>{punkt.anteil} %</b> Silberanteil</p>
            <p className="denar-jahr">{jahr} · {punkt.marke}</p>
          </div>
        </div>

        <label className="denar-regler" htmlFor="denar">
          Zeitpunkt wählen
          <input id="denar" type="range" min={0} max={DENAR.length - 1} step={1}
            value={index} onChange={(e) => setIndex(Number(e.target.value))} />
        </label>

        <p className="fliess">{szene.fliesstext}</p>
        <Quelle text={szene.quelle} seite={szene.buchseite} />
      </div>
    </section>
  );
}

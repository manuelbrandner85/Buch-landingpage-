'use client';

import { useState } from 'react';
import type { Szene } from '@/data/gemeinsam/typen';
import { RINGE } from '@/data/band-1/interaktionen';
import { Quelle } from '@/ui/Quelle';
import { bandNummer } from '@/world/registry';

/**
 * Fünf Ringe um einen Menschen (S. 109).
 * Der Nutzer versucht, nach innen zu gelangen, und wird auf jeder Stufe gefiltert.
 * Genau das ist die Aussage der Seite – ein Bild könnte sie nur behaupten.
 */
export function RingeSzene({ szene }: { szene: Szene }) {
  const [erreicht, setErreicht] = useState(0);
  const innen = erreicht >= RINGE.length - 1;

  return (
    <section id={szene.id} className="papier interaktion">
      <div>
        <p className="eyebrow">{szene.unterkapitel} · Geheimnisse der Herrscher</p>
        <h2>{szene.titel}</h2>
        <p className="unterzeile">{szene.unterzeile}</p>

        <div className="ringe" role="group" aria-label="Zugangsstufen von außen nach innen">
          {RINGE.map((r, i) => {
            const offen = i <= erreicht;
            return (
              <button key={r.stufe} type="button"
                className={offen ? 'ring offen' : 'ring'}
                data-evidenz={r.evidenz}
                aria-disabled={i > erreicht + 1}
                onClick={() => { if (i === erreicht + 1) setErreicht(i); }}>
                <span className="ring-stufe">{r.stufe}</span>
                <span className="ring-kontrolle">
                  {offen ? r.kontrolle : 'kennt nur den nächsten Ring nach innen'}
                </span>
              </button>
            );
          })}
        </div>

        <p className="ringe-stand" aria-live="polite">
          {innen
            ? 'Angekommen. Vier Stellen haben unterwegs entschieden, ob die Nachricht weitergeht.'
            : `Ring ${erreicht + 1} von ${RINGE.length}. Jede Stufe kann die Nachricht verändern oder aufhalten.`}
        </p>

        <p className="fliess">{szene.fliesstext}</p>
        <Quelle text={szene.quelle} seite={szene.buchseite} band={bandNummer(szene.bandId)} />
      </div>
    </section>
  );
}

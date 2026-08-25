'use client';

import { useState } from 'react';
import type { Szene } from '@/data/gemeinsam/typen';
import { KOENIGSSTRASSE as K } from '@/data/band-1/interaktionen';
import { Quelle } from '@/ui/Quelle';
import { bandNummer } from '@/world/registry';

/**
 * Neun Tage statt neunzig (S. 104).
 * Zwei Marken laufen dieselbe Strecke: der Mensch und die Reiterstafette.
 * Man sieht nicht, dass die eine schneller ist – man sieht, wie weit die andere
 * noch entfernt ist, wenn die Nachricht längst angekommen ist.
 */
export function LaufzeitSzene({ szene }: { szene: Szene }) {
  const [tag, setTag] = useState(0);

  const anteil = (dauer: number) => Math.min(1, tag / dauer);
  const km = (dauer: number) => Math.round(anteil(dauer) * K.kilometer);
  const bote = anteil(K.stafette);
  const laeufer = anteil(K.zuFuss);

  return (
    <section id={szene.id} className="papier interaktion">
      <div>
        <p className="eyebrow">{szene.unterkapitel} · Persien und Griechenland</p>
        <h2>{szene.titel}</h2>
        <p className="unterzeile">{szene.unterzeile}</p>

        <div className="strecke" role="group" aria-label={`Strecke ${K.von} bis ${K.nach}`}>
          <div className="strecke-namen"><span>{K.von}</span><span>{K.nach}</span></div>

          <div className="bahn">
            <div className="stationen" aria-hidden="true">
              {Array.from({ length: K.stationen }, (_, i) => (
                <i key={i} style={{ left: `${(i / (K.stationen - 1)) * 100}%` }} />
              ))}
            </div>
            <div className="marke bote" style={{ left: `${bote * 100}%` }}>
              <span>Reiterstafette</span>
            </div>
            <div className="marke laeufer" style={{ left: `${laeufer * 100}%` }}>
              <span>zu Fuß</span>
            </div>
          </div>

          <p className="strecke-stand" aria-live="polite">
            {tag === 0
              ? `Tag 0. Beide brechen in ${K.von} auf. ${K.kilometer.toLocaleString('de-DE')} Kilometer, ${K.stationen} Stationen.`
              : bote >= 1
                ? `Tag ${tag}. Die Nachricht ist seit ${tag - K.stafette} Tagen in ${K.nach}. Der Läufer hat ${km(K.zuFuss).toLocaleString('de-DE')} von ${K.kilometer.toLocaleString('de-DE')} Kilometern geschafft.`
                : `Tag ${tag}. Die Nachricht ist bei Kilometer ${km(K.stafette).toLocaleString('de-DE')}, der Läufer bei ${km(K.zuFuss).toLocaleString('de-DE')}.`}
          </p>
        </div>

        <label className="denar-regler" htmlFor="tag">
          Tag {tag} von {K.zuFuss}
          <input id="tag" type="range" min={0} max={K.zuFuss} value={tag}
            onChange={(e) => setTag(Number(e.target.value))} />
        </label>

        <p className="fliess">{szene.fliesstext}</p>
        <p className="kernsatz">{K.kern}</p>
        <Quelle text={szene.quelle} seite={szene.buchseite} band={bandNummer(szene.bandId)} />
      </div>
    </section>
  );
}

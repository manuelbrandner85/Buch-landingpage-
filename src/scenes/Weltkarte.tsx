'use client';

import { useState } from 'react';
import type { Szene } from '@/data/gemeinsam/typen';
import { ORTE } from '@/data/gemeinsam/orte';
import { kapitelNach, szeneZuKapitel } from '@/world/registry';
import { useWeltFortschritt } from '@/world/FortschrittKontext';

/**
 * Keine Google-Maps-artige Karte. Reale Koordinaten auf einem Gradnetz,
 * verbunden durch den Faden – in der Reihenfolge der Kapitel, nicht der Geografie.
 * Küstenlinien und Relief kommen in Ausbaustufe 2 auf derselben Datenbasis
 * hinzu, die auch das Buch nutzt (NASA Blue Marble, GMRT, Natural Earth).
 */
const LON: [number, number] = [-12, 115];
const LAT: [number, number] = [-38, 58];
const W = 1000;
const H = Math.round((W * (LAT[1] - LAT[0])) / (LON[1] - LON[0]));
const x = (lon: number) => ((lon - LON[0]) / (LON[1] - LON[0])) * W;
const y = (lat: number) => ((LAT[1] - lat) / (LAT[1] - LAT[0])) * H;

export function Weltkarte({ szene }: { szene: Szene }) {
  const [gewaehlt, setGewaehlt] = useState<string | null>(null);
  const fortschritt = useWeltFortschritt();
  const orte = [...ORTE].sort(
    (a, b) => (a.vorkommen[0]?.kapitel ?? 0) - (b.vorkommen[0]?.kapitel ?? 0));
  const faden = orte.map((o, i) =>
    `${i ? 'L' : 'M'} ${x(o.lon).toFixed(1)} ${y(o.lat).toFixed(1)}`).join(' ');

  const netz: string[] = [];
  for (let l = -10; l <= 110; l += 20) netz.push(`M ${x(l)} 0 L ${x(l)} ${H}`);
  for (let b = -30; b <= 50; b += 20) netz.push(`M 0 ${y(b)} L ${W} ${y(b)}`);

  // Ein Ort gilt als besucht, wenn eine Szene seines Kapitels gesehen wurde.
  const besucht = (kapitel?: number, bandId?: string) => {
    const szene = szeneZuKapitel(kapitel, bandId);
    return Boolean(szene && fortschritt?.kennt(szene.id));
  };

  const ort = ORTE.find((o) => o.id === gewaehlt);
  const sprung = szeneZuKapitel(ort?.vorkommen[0]?.kapitel, ort?.vorkommen[0]?.bandId);
  const kapitel = kapitelNach(ort?.vorkommen[0]?.kapitel, ort?.vorkommen[0]?.bandId);

  return (
    <section id={szene.id} className="karte">
      <div className="karte-huelle">
        <p className="eyebrow">Die Welt</p>
        <h2>{szene.titel}</h2>
        <p className="fliess">{szene.fliesstext}</p>

        <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-label="Karte der Fundorte">
          <path className="karte-netz" d={netz.join(' ')} />
          <path className="karte-faden" d={faden} />
          {orte.map((o) => (
            <g key={o.id} className="ort" tabIndex={0} role="button"
              aria-label={o.name} aria-current={gewaehlt === o.id}
              onClick={() => setGewaehlt(o.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setGewaehlt(o.id); }
              }}>
              <circle cx={x(o.lon)} cy={y(o.lat)} r={3.4}
                className={besucht(o.vorkommen[0]?.kapitel, o.vorkommen[0]?.bandId) ? 'besucht' : undefined} />
              <text x={x(o.lon) + 8} y={y(o.lat) + 4}>{o.name}</text>
            </g>
          ))}
        </svg>

        <div className="ort-info" aria-live="polite">
          {ort ? (
            <>
              <strong>{ort.name}</strong>{ort.text}
              <span className="verweis">
                Band 1 · Kapitel {ort.vorkommen[0]?.kapitel} – {kapitel?.titel}
                {' · Seiten '}{ort.vorkommen[0]?.seiten.join(', ')}
              </span>
              {sprung && (
                <a className="sprung" href={`#${sprung.id}`}>
                  In die Szene · {sprung.titel}
                </a>
              )}
            </>
          ) : (
            <><strong>Einen Punkt wählen</strong>Jeder Ort führt zurück in das Kapitel, das ihn belegt.</>
          )}
        </div>
      </div>
    </section>
  );
}

'use client';

import { useState } from 'react';
import type { Ort, Szene } from '@/data/gemeinsam/typen';
import { ORTE } from '@/data/gemeinsam/orte';
import { bandNummer, kapitelNach, szeneZuKapitel } from '@/world/registry';
import { useWeltFortschritt } from '@/world/FortschrittKontext';

/**
 * Keine Google-Maps-artige Karte. Reale Koordinaten auf einem Gradnetz,
 * verbunden durch den Faden – in der Reihenfolge der Kapitel, nicht der Geografie.
 *
 * Die Karte zeigt nur die Orte des Bandes, in dessen Welt sie steht. Ein Punkt
 * aus einem anderen Band wäre hier ein Fremdkörper: Wer die Welt von Band 3
 * betritt, soll nicht über Uruk stolpern. Ein Ort gehört trotzdem der Welt und
 * nicht dem Band – er kann in mehreren Bänden vorkommen und zeigt dann in jeder
 * Bandkarte die Kapitel und Seiten genau dieses Bandes.
 *
 * Der Ausschnitt wird aus den Punkten gerechnet, nicht gesetzt. Band 1 spielt
 * zwischen Südafrika und China, Band 3 zwischen der Magellanstraße und der
 * Luzonstraße – ein fester Rahmen könnte nur einem von beiden passen.
 */
const W = 1000;
const RAND = 14; // Grad Luft um die äußersten Punkte – auch der Name braucht Platz

function ausschnitt(orte: Ort[]) {
  const lons = orte.map((o) => o.lon);
  const lats = orte.map((o) => o.lat);
  const lon: [number, number] = [Math.min(...lons) - RAND, Math.max(...lons) + RAND];
  const lat: [number, number] = [Math.min(...lats) - RAND, Math.max(...lats) + RAND];
  // Die Karte darf nicht höher als breit werden – sonst kippt sie das Layout.
  const spanneLon = lon[1] - lon[0];
  const spanneLat = lat[1] - lat[0];
  if (spanneLat > spanneLon * 0.62) {
    const fehlt = (spanneLat / 0.62 - spanneLon) / 2;
    lon[0] -= fehlt; lon[1] += fehlt;
  }
  const h = Math.round((W * (lat[1] - lat[0])) / (lon[1] - lon[0]));
  return {
    h,
    x: (l: number) => ((l - lon[0]) / (lon[1] - lon[0])) * W,
    y: (b: number) => ((lat[1] - b) / (lat[1] - lat[0])) * h,
    lon, lat,
  };
}

export function Weltkarte({ szene }: { szene: Szene }) {
  const [gewaehlt, setGewaehlt] = useState<string | null>(null);
  const fortschritt = useWeltFortschritt();

  const band = szene.bandId;
  const eigene = ORTE.filter((o) => o.vorkommen.some((v) => v.bandId === band));
  // Das Vorkommen, das zu diesem Band gehört – nicht das erste überhaupt.
  const hier = (o: Ort) => o.vorkommen.find((v) => v.bandId === band);

  const orte = [...eigene].sort(
    (a, b) => (hier(a)?.kapitel ?? 0) - (hier(b)?.kapitel ?? 0));

  if (orte.length === 0) return null;

  const k = ausschnitt(orte);

  // Beschriftung ohne Gedränge.
  //
  // In Europa liegen sieben Orte dieses Bandes auf der Fläche eines Daumens.
  // Setzt man jeden Namen stur rechts neben seinen Punkt, überschreiben sich
  // die Zeilen, und die Karte wird unleserlich – genau dort, wo am meisten
  // steht. Deshalb bekommt jeder Name die erste Höhe, an der er noch frei ist,
  // und am rechten Rand kippt er auf die andere Seite des Punktes.
  const belegt: { x1: number; x2: number; y1: number; y2: number }[] = [];
  const HOEHE = 11;
  const versatz = [4, -7, 15, -18, 26, -29, 37, -40, 48, -51];
  const schrift = (o: Ort) => {
    const breite = o.name.length * 6 + 10;
    const passtRechts = k.x(o.lon) + breite < W - 4;
    const seiten = passtRechts ? [true, false] : [false, true];
    for (const dy of versatz) {
      for (const rechts of seiten) {
        const px = rechts ? k.x(o.lon) + 8 : k.x(o.lon) - 8;
        const py = k.y(o.lat) + dy;
        const kasten = {
          x1: rechts ? px : px - breite, x2: rechts ? px + breite : px,
          y1: py - HOEHE, y2: py + 2,
        };
        if (kasten.x1 < 0 || kasten.x2 > W) continue;
        const stoesst = belegt.some((b) =>
          kasten.x1 < b.x2 && kasten.x2 > b.x1 && kasten.y1 < b.y2 && kasten.y2 > b.y1);
        if (!stoesst) { belegt.push(kasten); return { px, py, rechts }; }
      }
    }
    // Notfall: lieber nach innen kippen als über den Rand hinausragen.
    const rechts = k.x(o.lon) + breite < W - 4;
    return { px: k.x(o.lon) + (rechts ? 8 : -8), py: k.y(o.lat) + 4, rechts };
  };
  const namen = new Map(orte.map((o) => [o.id, schrift(o)]));
  const faden = orte.map((o, i) =>
    `${i ? 'L' : 'M'} ${k.x(o.lon).toFixed(1)} ${k.y(o.lat).toFixed(1)}`).join(' ');

  const netz: string[] = [];
  const schritt = k.lon[1] - k.lon[0] > 120 ? 30 : 20;
  for (let l = Math.ceil(k.lon[0] / schritt) * schritt; l <= k.lon[1]; l += schritt) {
    netz.push(`M ${k.x(l).toFixed(1)} 0 L ${k.x(l).toFixed(1)} ${k.h}`);
  }
  for (let b = Math.ceil(k.lat[0] / schritt) * schritt; b <= k.lat[1]; b += schritt) {
    netz.push(`M 0 ${k.y(b).toFixed(1)} L ${W} ${k.y(b).toFixed(1)}`);
  }

  // Ein Ort gilt als besucht, wenn eine Szene seines Kapitels gesehen wurde.
  const besucht = (o: Ort) => {
    const v = hier(o);
    const s = szeneZuKapitel(v?.kapitel, v?.bandId);
    return Boolean(s && fortschritt?.kennt(s.id));
  };

  const ort = orte.find((o) => o.id === gewaehlt);
  const v = ort ? hier(ort) : undefined;
  const sprung = szeneZuKapitel(v?.kapitel, v?.bandId);
  const kapitel = kapitelNach(v?.kapitel, v?.bandId);

  return (
    <section id={szene.id} className="karte">
      <div className="karte-huelle">
        <p className="eyebrow">Die Welt</p>
        <h2>{szene.titel}</h2>
        <p className="fliess">{szene.fliesstext}</p>

        <svg viewBox={`0 0 ${W} ${k.h}`} role="group"
          aria-label={`Karte der Orte aus Band ${bandNummer(band)}`}>
          <path className="karte-netz" d={netz.join(' ')} />
          <path className="karte-faden" d={faden} />
          {orte.map((o) => (
            <g key={o.id} className="ort" tabIndex={0} role="button"
              aria-label={o.name} aria-current={gewaehlt === o.id}
              onClick={() => setGewaehlt(o.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setGewaehlt(o.id); }
              }}>
              <circle cx={k.x(o.lon)} cy={k.y(o.lat)} r={3.4}
                className={besucht(o) ? 'besucht' : undefined} />
              <text x={namen.get(o.id)!.px} y={namen.get(o.id)!.py}
                textAnchor={namen.get(o.id)!.rechts ? 'start' : 'end'}>{o.name}</text>
            </g>
          ))}
        </svg>

        <div className="ort-info" aria-live="polite">
          {ort && v ? (
            <>
              <strong>{ort.name}</strong>{ort.text}
              <span className="verweis">
                Band {bandNummer(v.bandId)} · Kapitel {v.kapitel} – {kapitel?.titel}
                {' · Seiten '}{v.seiten.join(', ')}
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

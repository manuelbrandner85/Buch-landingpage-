'use client';

import { useEffect, useRef } from 'react';
import type { Szene } from '@/data/gemeinsam/typen';
import { assetNach } from '@/world/registry';
import { bildSatz } from '@/world/bilder';
import { startePartikel } from '@/animation/partikel';

/**
 * Alle Vollbildmotive liegen in einer festen Ebene hinter dem Text.
 * Nur dadurch können Szenen ineinander überblenden, statt aneinandergereiht
 * zu scrollen. Der Text scrollt normal darüber.
 */
export function KinoEbene({ szenen }: { szenen: Szene[] }) {
  return (
    <div className="kino" aria-hidden="true">
      {szenen.filter((s) => s.platte).map((s, i) => (
        <Buehne key={s.id} szene={s} tiefe={i} />
      ))}
    </div>
  );
}

function Buehne({ szene, tiefe }: { szene: Szene; tiefe: number }) {
  const asset = assetNach(szene.platte);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvas.current || !szene.partikel) return;
    return startePartikel(canvas.current, szene.partikel);
  }, [szene.partikel]);

  if (!asset) return null;
  const quelle = bildSatz(asset);

  return (
    <div className="buehne" id={`buehne-${szene.id}`} style={{ zIndex: tiefe }}>
      <div className="platte" data-platte style={{ backgroundImage: quelle }} />
      <div className="grading" style={{ background: szene.grading ?? '#1a2540' }} />
      <div className="dunst" />
      <div className="vignette" />
      {szene.partikel && <canvas ref={canvas} className="partikel" />}
    </div>
  );
}

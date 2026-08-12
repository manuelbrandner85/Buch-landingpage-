'use client';

import { useEffect, useRef } from 'react';
import type { Szene } from '@/data/gemeinsam/typen';
import { assetNach } from '@/world/registry';
import { bildSatz } from '@/world/bilder';
import { startePartikel } from '@/animation/partikel';
import { useCoverGeometrie } from './useCoverGeometrie';

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
  const buehne = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  useCoverGeometrie(szene.typ === 'cover' ? buehne : null, asset);

  useEffect(() => {
    if (!canvas.current || !szene.partikel) return;
    return startePartikel(canvas.current, szene.partikel);
  }, [szene.partikel]);

  if (!asset) return null;
  const quelle = bildSatz(asset);

  return (
    <div ref={buehne} className={szene.typ === 'cover' ? 'buehne cover-buehne' : 'buehne'} id={`buehne-${szene.id}`} style={{ zIndex: tiefe }}>
      {szene.typ === 'cover' ? (
        <>
          <div className="platte grund" style={{ backgroundImage: quelle }} />
          {szene.ebenen?.map((e, i) => (
            <div key={i} className="ebene" data-tempo={e.tempo} data-von={e.von} data-bis={e.bis}
              style={{
                backgroundImage: quelle,
                maskImage: `linear-gradient(to bottom,transparent,#000 ${i ? 14 : 0}%,#000)`,
                WebkitMaskImage: `linear-gradient(to bottom,transparent,#000 ${i ? 14 : 0}%,#000)`,
                filter: e.unschaerfe ? `blur(${e.unschaerfe}px)` : undefined,
              }} />
          ))}
        </>
      ) : (
        <div className="platte" data-platte style={{ backgroundImage: quelle }} />
      )}
      <div className="grading" style={{ background: szene.grading ?? '#1a2540' }} />
      <div className="dunst" />
      <div className="vignette" />
      {szene.partikel && <canvas ref={canvas} className="partikel" />}
    </div>
  );
}

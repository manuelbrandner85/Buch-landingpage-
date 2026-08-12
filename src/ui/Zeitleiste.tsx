'use client';

import { useEffect } from 'react';
import { ZEITLEISTE } from '@/data/gemeinsam/zeitleiste';

/** Die Falt-Zeitleiste des Buches: drei Bänder mit je eigenem Maßstab. */
export function Zeitleiste({ beiSchliessen }: { beiSchliessen: () => void }) {
  useEffect(() => {
    const zu = (e: KeyboardEvent) => { if (e.key === 'Escape') beiSchliessen(); };
    window.addEventListener('keydown', zu);
    return () => window.removeEventListener('keydown', zu);
  }, [beiSchliessen]);

  return (
    <section className="zeitleiste" role="dialog" aria-modal="true" aria-label="Zeitleiste Band 1">
      <div>
        <p className="eyebrow">Zeitleiste · Band 1</p>
        <h2>Drei Bänder, drei Maßstäbe</h2>
        {ZEITLEISTE.map((band) => (
          <div key={band.name} className="band">
            <h3>{band.name}</h3>
            <div className="bandlinie">
              {band.marken.map((m) => (
                <div key={m.jahr} className="marke" style={{ left: `${m.position}%` }}>
                  <span><b>{m.jahr}</b>{m.was}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
        <p className="quelle">
          <b>Hinweis</b>Jedes Band hat einen eigenen logarithmischen Maßstab – wie im Buch.
        </p>
        <nav><button onClick={beiSchliessen}>Schließen</button></nav>
      </div>
    </section>
  );
}

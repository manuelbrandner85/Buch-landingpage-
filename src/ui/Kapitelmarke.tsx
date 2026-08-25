'use client';

import { useEffect, useState } from 'react';
import { kapitelNach } from '@/world/registry';

/** Leise Orientierung am Rand: in welchem Kapitel bin ich gerade? */
export function Kapitelmarke() {
  const [nr, setNr] = useState<number | null>(null);
  // Kapitelnummern sind nur innerhalb einer Reihe eindeutig. Welche Reihe
  // gemeint ist, sagt der Band der gerade sichtbaren Szene – er steht im DOM.
  const [band, setBand] = useState<string | undefined>(undefined);

  useEffect(() => {
    const b = new IntersectionObserver((eintraege) => {
      for (const e of eintraege) {
        if (!e.isIntersecting) continue;
        const el = e.target as HTMLElement;
        const k = el.dataset.kapitel;
        if (k) { setNr(Number(k)); setBand(el.dataset.band); }
      }
    }, { threshold: 0.35 });
    document.querySelectorAll('[data-kapitel]').forEach((s) => b.observe(s));
    return () => b.disconnect();
  }, []);

  const kapitel = kapitelNach(nr ?? undefined, band);
  return (
    <div className={kapitel ? 'kapitelmarke an' : 'kapitelmarke'} aria-live="polite">
      <b>Kapitel {kapitel?.id}</b> {kapitel?.titel}
    </div>
  );
}

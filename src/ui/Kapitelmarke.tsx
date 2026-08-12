'use client';

import { useEffect, useState } from 'react';
import { kapitelNach } from '@/world/registry';

/** Leise Orientierung am Rand: in welchem Kapitel bin ich gerade? */
export function Kapitelmarke() {
  const [nr, setNr] = useState<number | null>(null);

  useEffect(() => {
    const b = new IntersectionObserver((eintraege) => {
      for (const e of eintraege) {
        if (!e.isIntersecting) continue;
        const k = (e.target as HTMLElement).dataset.kapitel;
        if (k) setNr(Number(k));
      }
    }, { threshold: 0.35 });
    document.querySelectorAll('[data-kapitel]').forEach((s) => b.observe(s));
    return () => b.disconnect();
  }, []);

  const kapitel = kapitelNach(nr ?? undefined);
  return (
    <div className={kapitel ? 'kapitelmarke an' : 'kapitelmarke'} aria-live="polite">
      <b>Kapitel {kapitel?.id}</b> {kapitel?.titel}
    </div>
  );
}

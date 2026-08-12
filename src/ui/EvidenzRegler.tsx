'use client';

import { useEffect, useState } from 'react';
import { EVIDENZ } from '@/data/gemeinsam/typen';

/**
 * Die These des Buches als Bedienelement:
 * Was schwächer belegt ist als die gewählte Stufe, tritt zurück.
 * Bei „A“ bleibt erstaunlich wenig stehen.
 */
export function EvidenzRegler() {
  const [stufe, setStufe] = useState(EVIDENZ.length - 1);
  const [sichtbar, setSichtbar] = useState(false);

  useEffect(() => {
    // Alle Abschnitte beobachten, nicht nur die Motivszenen: Sonst bliebe der
    // Regler auf Papierseiten und auf der Karte stehen, wo er nichts steuert.
    const b = new IntersectionObserver(
      (eintraege) => {
        const sichtbarster = eintraege
          .filter((e) => e.isIntersecting)
          .sort((a, c) => c.intersectionRatio - a.intersectionRatio)[0];
        if (sichtbarster) {
          setSichtbar((sichtbarster.target as HTMLElement).dataset.motiv === '1');
        }
      },
      { threshold: [0.2, 0.5, 0.8] });
    document.querySelectorAll('main section[id]').forEach((s) => b.observe(s));
    return () => b.disconnect();
  }, []);

  useEffect(() => {
    document.querySelectorAll<HTMLElement>('[data-evidenz]').forEach((n) => {
      const eigene = EVIDENZ.indexOf((n.dataset.evidenz ?? 'A') as (typeof EVIDENZ)[number]);
      n.classList.toggle('verblasst', eigene > stufe);
    });
  }, [stufe]);

  return (
    <div className={sichtbar ? 'regler an' : 'regler'}>
      <label htmlFor="evidenz">Evidenzstufe <b>{EVIDENZ[stufe]}</b></label>
      <input id="evidenz" type="range" min={0} max={EVIDENZ.length - 1} value={stufe}
        onChange={(e) => setStufe(Number(e.target.value))} />
      <p>Was schwächer belegt ist als die gewählte Stufe, tritt zurück.</p>
    </div>
  );
}

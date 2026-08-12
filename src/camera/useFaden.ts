'use client';

import { useEffect } from 'react';

/**
 * Der Faden. Er ist Kamerabahn, Fortschrittsanzeige und Metapher zugleich –
 * und er kommt aus dem Buch selbst: das Cover zeigt genau diese Linie.
 * Er wird über den gesamten Scroll gezeichnet und reißt zwischen den Bänden nicht ab.
 */
export function useFaden(pfadId: string, perleId: string, svgId: string): void {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const svg = document.getElementById(svgId);
    const pfad = document.getElementById(pfadId) as SVGPathElement | null;
    const perle = document.getElementById(perleId) as SVGCircleElement | null;
    if (!svg || !pfad || !perle) return;

    let laenge = 0;

    const zeichne = () => {
      const max = document.body.scrollHeight - window.innerHeight;
      const f = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      pfad.style.strokeDashoffset = String(laenge * (1 - f));
      const p = pfad.getPointAtLength(laenge * f);
      perle.setAttribute('cx', String(p.x));
      perle.setAttribute('cy', String(p.y));
      svg.style.opacity = f > 0.03 && f < 0.985 ? '0.85' : '0';
    };

    const kurve = () => {
      const w = window.innerWidth, h = window.innerHeight, x = w * 0.5;
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
      pfad.setAttribute('d',
        `M ${x} ${h} C ${x - w * 0.15} ${h * 0.78}, ${x + w * 0.14} ${h * 0.6}, ${x - w * 0.02} ${h * 0.44}` +
        ` C ${x - w * 0.13} ${h * 0.28}, ${x + w * 0.1} ${h * 0.16}, ${x + w * 0.01} 0`);
      laenge = pfad.getTotalLength();
      pfad.style.strokeDasharray = String(laenge);
      zeichne();
    };

    kurve();
    window.addEventListener('resize', kurve);
    window.addEventListener('scroll', zeichne, { passive: true });
    return () => {
      window.removeEventListener('resize', kurve);
      window.removeEventListener('scroll', zeichne);
    };
  }, [pfadId, perleId, svgId]);
}

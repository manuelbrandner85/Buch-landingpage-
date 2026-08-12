'use client';

import { useEffect } from 'react';

/**
 * Trägheitsscrollen.
 *
 * Der Unterschied, den man zuerst spürt: Der Scroll rastet nicht, er schwingt aus.
 * Umgesetzt ohne zusätzliche Abhängigkeit – die Bibliothek Lenis macht im Kern
 * genau das hier, und eine Bibliothek für vierzig Zeilen zu laden wäre
 * schlechter Tausch.
 *
 * Bei „Bewegung reduzieren“ bleibt das native Scrollen unangetastet.
 */
export function useSanftesScrollen(aktiv: boolean): void {
  useEffect(() => {
    if (!aktiv) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;  // Touch bringt eigene Trägheit mit

    let ziel = window.scrollY;
    let aktuell = window.scrollY;
    let frame = 0;
    let laeuft = true;

    const grenze = () => document.body.scrollHeight - window.innerHeight;

    const beiRad = (e: WheelEvent) => {
      if (e.ctrlKey) return;                       // Zoom nicht abfangen
      e.preventDefault();
      ziel = Math.max(0, Math.min(grenze(), ziel + e.deltaY));
    };

    const beiTaste = (e: KeyboardEvent) => {
      const schritt = { PageDown: 0.9, PageUp: -0.9, ArrowDown: 0.12, ArrowUp: -0.12 }[e.key];
      if (schritt === undefined) return;
      const ziel_el = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(ziel_el.tagName)) return;
      e.preventDefault();
      ziel = Math.max(0, Math.min(grenze(), ziel + window.innerHeight * schritt));
    };

    // Sprungmarken und Ankerlinks müssen weiter funktionieren
    const beiSprung = () => { ziel = window.scrollY; aktuell = window.scrollY; };

    let letzterWert = -1;
    function schleife() {
      if (!laeuft) return;
      // Fremde Scrollbewegungen übernehmen statt gegen sie anzulaufen:
      // Ankerlinks, „In die Szene“, Zurück-Navigation, Sprungmarke.
      if (letzterWert >= 0 && Math.abs(window.scrollY - letzterWert) > 2) {
        ziel = aktuell = window.scrollY;
      }
      aktuell += (ziel - aktuell) * 0.09;
      if (Math.abs(ziel - aktuell) < 0.4) aktuell = ziel;
      window.scrollTo(0, aktuell);
      letzterWert = Math.round(window.scrollY);
      frame = requestAnimationFrame(schleife);
    }
    frame = requestAnimationFrame(schleife);

    window.addEventListener('wheel', beiRad, { passive: false });
    window.addEventListener('keydown', beiTaste);
    window.addEventListener('hashchange', beiSprung);

    return () => {
      laeuft = false;
      cancelAnimationFrame(frame);
      window.removeEventListener('wheel', beiRad);
      window.removeEventListener('keydown', beiTaste);
      window.removeEventListener('hashchange', beiSprung);
    };
  }, [aktiv]);
}

'use client';

import { useEffect, type RefObject } from 'react';
import type { Asset } from '@/data/gemeinsam/typen';

/**
 * Das Cover ist hochformatig, der Bildschirm meist quer.
 * Die Tiefenebenen werden deshalb in Pixeln bildfüllend berechnet –
 * so bleibt die Komposition in jedem Seitenverhältnis unverzerrt.
 */
export function useCoverGeometrie(
  buehne: RefObject<HTMLDivElement | null> | null,
  asset: Asset | undefined,
): void {
  useEffect(() => {
    const el = buehne?.current;
    if (!el || !asset) return;

    const legen = () => {
      const w = el.clientWidth, h = el.clientHeight;
      const k = Math.max(w / asset.breite, h / asset.hoehe) * 1.08;
      const B = asset.breite * k, H = asset.hoehe * k;
      const L = (w - B) / 2, O = (h - H) / 2;
      el.querySelectorAll<HTMLElement>('.ebene').forEach((e) => {
        const von = Number(e.dataset.von ?? 0) / 100;
        const bis = Number(e.dataset.bis ?? 100) / 100;
        Object.assign(e.style, {
          left: `${L}px`, width: `${B}px`,
          top: `${O + von * H}px`, height: `${(bis - von) * H}px`,
          backgroundSize: `${B}px ${H}px`,
          backgroundPosition: `0 ${-von * H}px`,
        });
      });
    };

    legen();
    const ro = new ResizeObserver(legen);
    ro.observe(el);
    return () => ro.disconnect();
  }, [buehne, asset]);
}

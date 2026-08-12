'use client';

import { useEffect } from 'react';

/**
 * Bindet die Kamera an den Scroll.
 * Jede Bühne blendet auf, hält, blendet ab – dadurch gehen Szenen ineinander über,
 * statt aneinandergereiht zu werden. Die Platte fährt langsam hinein (Push-in),
 * Tiefenebenen laufen unterschiedlich schnell.
 *
 * GSAP wird erst hier nachgeladen: Wer die ruhige Fassung wählt oder
 * „Reduce Motion“ gesetzt hat, lädt die Animationsbibliothek gar nicht erst.
 */
export function useScrollKamera(aktiv: boolean): void {
  useEffect(() => {
    if (!aktiv) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let aufraeumen: (() => void) | undefined;
    let verworfen = false;

    void (async () => {
      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ]);
      if (verworfen) return;

      gsap.registerPlugin(ScrollTrigger);
      const ctx = gsap.context(() => {
        document.querySelectorAll<HTMLElement>('[data-abschnitt]').forEach((sec) => {
          const buehne = document.getElementById(`buehne-${sec.dataset.abschnitt}`);
          if (!buehne) return;
          const bereich = { trigger: sec, start: 'top bottom', end: 'bottom top', scrub: 0.6 } as const;

          gsap.timeline({ scrollTrigger: bereich })
            .fromTo(buehne, { opacity: 0 }, { opacity: 1, duration: 0.16, ease: 'none' })
            .to(buehne, { opacity: 1, duration: 0.66, ease: 'none' })
            .to(buehne, { opacity: 0, duration: 0.18, ease: 'none' });

          const platte = buehne.querySelector<HTMLElement>('[data-platte]');
          if (platte) {
            gsap.fromTo(platte,
              { scale: 1.16, yPercent: -2 },
              { scale: 1.02, yPercent: 2, ease: 'none', scrollTrigger: bereich });
          }

          buehne.querySelectorAll<HTMLElement>('[data-tempo]').forEach((ebene) => {
            const tempo = Number(ebene.dataset.tempo ?? 0);
            gsap.to(ebene, {
              yPercent: -tempo * 100, scale: 1 + tempo * 0.1, ease: 'none',
              scrollTrigger: bereich,
            });
          });
        });

        document.querySelectorAll<HTMLElement>('[data-auf]').forEach((n) => {
          gsap.fromTo(n, { opacity: 0, y: 16 },
            { opacity: 1, y: 0, duration: 1, ease: 'power2.out',
              scrollTrigger: { trigger: n, start: 'top 90%' } });
        });
      });
      aufraeumen = () => ctx.revert();
    })();

    return () => { verworfen = true; aufraeumen?.(); };
  }, [aktiv]);
}

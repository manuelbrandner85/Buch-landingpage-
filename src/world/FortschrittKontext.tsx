'use client';

import { createContext, useContext, useEffect } from 'react';
import { useFortschritt } from './fortschritt';

type Wert = ReturnType<typeof useFortschritt>;
const Kontext = createContext<Wert | null>(null);

export function FortschrittGeber({ children }: { children: React.ReactNode }) {
  const wert = useFortschritt();

  // Eine Szene gilt als besucht, sobald sie zur Hälfte im Bild war.
  useEffect(() => {
    const beobachter = new IntersectionObserver((eintraege) => {
      for (const e of eintraege) {
        if (e.isIntersecting) {
          const id = (e.target as HTMLElement).id;
          if (id) wert.merken(id);
        }
      }
    }, { threshold: 0.5 });
    document.querySelectorAll('main section[id]').forEach((s) => beobachter.observe(s));
    return () => beobachter.disconnect();
  }, [wert]);

  return <Kontext.Provider value={wert}>{children}</Kontext.Provider>;
}

export function useWeltFortschritt(): Wert | null {
  return useContext(Kontext);
}

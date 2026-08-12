'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * Was der Besucher schon gesehen hat.
 *
 * Zweck ist nicht Gamification, sondern Orientierung: Auf der Karte leuchten
 * besuchte Orte stärker, und wer wiederkommt, muss den Einstieg nicht noch
 * einmal durchlaufen. Gespeichert wird lokal im Browser – keine Konten,
 * keine Übertragung.
 */
const SCHLUESSEL = 'faeden.fortschritt.v1';

export interface Fortschritt {
  szenen: string[];
  letzterBesuch: number | null;
}

const leer: Fortschritt = { szenen: [], letzterBesuch: null };

function lesen(): Fortschritt {
  if (typeof window === 'undefined') return leer;
  try {
    const roh = window.localStorage.getItem(SCHLUESSEL);
    if (!roh) return leer;
    const daten = JSON.parse(roh) as Partial<Fortschritt>;
    return {
      szenen: Array.isArray(daten.szenen) ? daten.szenen : [],
      letzterBesuch: typeof daten.letzterBesuch === 'number' ? daten.letzterBesuch : null,
    };
  } catch {
    return leer;
  }
}

export function useFortschritt() {
  // Erster Durchlauf serverseitig: immer leer, damit Server- und Client-HTML
  // übereinstimmen. Erst nach dem Mounten wird der gespeicherte Stand geladen.
  const [stand, setStand] = useState<Fortschritt>(leer);
  const [geladen, setGeladen] = useState(false);

  useEffect(() => {
    setStand(lesen());
    setGeladen(true);
  }, []);

  const merken = useCallback((szeneId: string) => {
    setStand((alt) => {
      if (alt.szenen.includes(szeneId)) return alt;
      const neu: Fortschritt = {
        szenen: [...alt.szenen, szeneId],
        letzterBesuch: Date.now(),
      };
      try { window.localStorage.setItem(SCHLUESSEL, JSON.stringify(neu)); } catch { /* Speicher gesperrt */ }
      return neu;
    });
  }, []);

  const zuruecksetzen = useCallback(() => {
    try { window.localStorage.removeItem(SCHLUESSEL); } catch { /* egal */ }
    setStand(leer);
  }, []);

  return {
    stand, geladen, merken, zuruecksetzen,
    kennt: (id: string) => stand.szenen.includes(id),
    warSchonDa: geladen && stand.szenen.length > 2,
  };
}

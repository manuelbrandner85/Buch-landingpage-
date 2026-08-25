'use client';

import { useEffect, useState } from 'react';

/**
 * Der Weg zurück aus der Tiefe.
 *
 * Wer in eine Welt hineinfährt, muss wieder herauskommen. Escape steigt eine
 * Ebene heraus – aus der Szene auf die Weltkarte, von der Karte an den Anfang.
 * Dieselbe Geste liegt sichtbar am unteren Rand, sobald man tief genug ist:
 * Eine Tastenkombination, die niemand kennt, ist kein Rückweg.
 */
export function Ausstieg() {
  const [tief, setTief] = useState(false);

  useEffect(() => {
    // Wo Bücher stehen, ist man nicht in der Tiefe, sondern am Ziel – dort
    // verdeckte der Rückweg sonst die Klappentexte. Gemeint sind beide
    // Bücherbereiche: die Weltenwahl am Anfang und der Abschluss am Ende. Auf
    // dem Handy lag der Knopf sonst mitten auf dem Umschlag von Band 2.
    const pruefen = () => {
      const amZiel = [...document.querySelectorAll('section.buecher')].some((el) => {
        const r = el.getBoundingClientRect();
        return r.top < window.innerHeight * 0.9 && r.bottom > window.innerHeight * 0.1;
      });
      setTief(window.scrollY > window.innerHeight * 1.5 && !amZiel);
    };
    const zu = (ziel: string) => {
      const el = document.getElementById(ziel);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };
    const taste = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      const karte = document.getElementById('karte');
      const obenAufKarte = karte
        && Math.abs(karte.getBoundingClientRect().top) < window.innerHeight * 0.6;
      if (obenAufKarte) window.scrollTo({ top: 0, behavior: 'smooth' });
      else zu('karte');
    };
    window.addEventListener('scroll', pruefen, { passive: true });
    window.addEventListener('keydown', taste);
    pruefen();
    return () => {
      window.removeEventListener('scroll', pruefen);
      window.removeEventListener('keydown', taste);
    };
  }, []);

  return (
    <button
      className={tief ? 'ausstieg an' : 'ausstieg'}
      onClick={() => document.getElementById('karte')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
    >
      Escape · heraus zur Welt
    </button>
  );
}

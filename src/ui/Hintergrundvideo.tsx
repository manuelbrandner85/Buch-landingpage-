'use client';

import { useEffect, useState } from 'react';

/**
 * Bewegter Grund hinter dem Empfang.
 *
 * Das Standbild steht immer – es ist das Poster und zugleich der Rückfall.
 * Die Bewegtfassung kommt nur dazu, wenn sie erwünscht ist: Wer „Bewegung
 * reduzieren“ eingestellt hat, bekommt das Bild und lädt kein Video. Auf
 * schmalen Geräten läuft die kleine Fassung, sonst die große – entschieden
 * wird das erst im Browser, damit nichts doppelt geladen wird.
 */
export function Hintergrundvideo(
  { bild, video, videoKlein, alt }:
  { bild: string; video?: string; videoKlein?: string; alt: string }) {
  const [quelle, setQuelle] = useState<string | null>(null);

  useEffect(() => {
    if (!video) return;
    const ruhig = window.matchMedia('(prefers-reduced-motion: reduce)');
    const schmal = window.matchMedia('(max-width: 760px)');
    const waehlen = () => setQuelle(
      ruhig.matches ? null : (schmal.matches && videoKlein ? videoKlein : video));
    waehlen();
    ruhig.addEventListener('change', waehlen);
    return () => ruhig.removeEventListener('change', waehlen);
  }, [video, videoKlein]);

  return (
    <div className="grund" aria-hidden="true">
      <img src={bild} alt={alt} decoding="async" fetchPriority="high" />
      {quelle && (
        <video key={quelle} src={quelle} poster={bild}
          autoPlay muted loop playsInline preload="auto" />
      )}
      <span className="schleier" />
    </div>
  );
}

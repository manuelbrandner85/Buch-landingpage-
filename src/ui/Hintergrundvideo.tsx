'use client';

import { useEffect, useRef, useState } from 'react';

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
  const huelle = useRef<HTMLDivElement>(null);
  const film = useRef<HTMLVideoElement>(null);

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

  /**
   * Ein Video, das niemand sieht, läuft nicht.
   *
   * Der Empfang ist nur der obere Bildschirm der Seite. Wer weiterscrollt,
   * hätte darunter weiter ein Video dekodiert – auf dem Telefon Akku und Wärme
   * für ein Bild, das längst aus dem Blick ist. Dasselbe gilt für den Tab im
   * Hintergrund: Der Browser hält dort nur das Zeichnen an, nicht das Dekodieren.
   */
  useEffect(() => {
    if (!quelle) return;
    const el = huelle.current;
    if (!el) return;
    let sichtbar = true;
    const richten = () => {
      const v = film.current;
      if (!v) return;
      if (sichtbar && !document.hidden) { v.play().catch(() => undefined); }
      else v.pause();
    };
    const beobachter = new IntersectionObserver(([e]) => {
      sichtbar = Boolean(e?.isIntersecting); richten();
    }, { threshold: 0.05 });
    beobachter.observe(el);
    document.addEventListener('visibilitychange', richten);
    return () => {
      beobachter.disconnect();
      document.removeEventListener('visibilitychange', richten);
    };
  }, [quelle]);

  return (
    <div className="grund" aria-hidden="true" ref={huelle}>
      <img src={bild} alt={alt} decoding="async" fetchPriority="high" />
      {quelle && (
        <video ref={film} key={quelle} src={quelle} poster={bild}
          autoPlay muted loop playsInline preload="auto"
          disablePictureInPicture />
      )}
      <span className="schleier" />
    </div>
  );
}

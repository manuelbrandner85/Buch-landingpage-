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

    // Wer wenig Daten hat, bekommt das Standbild.
    //
    // „Datensparmodus“ und eine langsame Verbindung sind eine Ansage, keine
    // Vermutung: Ein halbes Megabyte Video für einen Hintergrund ist dann
    // respektlos – und die Seite steht ohne es genauso.
    const netz = (navigator as unknown as {
      connection?: { saveData?: boolean; effectiveType?: string };
    }).connection;
    if (netz?.saveData || /^(slow-)?2g$/.test(netz?.effectiveType ?? '')) return;

    const waehlen = () => setQuelle(
      ruhig.matches ? null : (schmal.matches && videoKlein ? videoKlein : video));

    // Erst das Bild, dann der Film.
    //
    // Das Standbild ist das größte Element des ersten Bildschirms – und damit
    // das, woran Google die Ladezeit misst. Lädt daneben schon das Video, wird
    // die Messung schlechter, obwohl der Betrachter nichts davon hat: Das
    // Video wird erst gebraucht, wenn das Bild steht.
    let abgesagt = false;
    const start = () => { if (!abgesagt) waehlen(); };
    const zeitplan = (window as unknown as {
      requestIdleCallback?: (f: () => void, o?: { timeout: number }) => number;
    }).requestIdleCallback;
    const kennung = zeitplan
      ? zeitplan(start, { timeout: 2500 })
      : window.setTimeout(start, 1200);

    ruhig.addEventListener('change', waehlen);
    return () => {
      abgesagt = true;
      const abbrechen = (window as unknown as {
        cancelIdleCallback?: (id: number) => void;
      }).cancelIdleCallback;
      if (zeitplan && abbrechen) abbrechen(kennung); else window.clearTimeout(kennung);
      ruhig.removeEventListener('change', waehlen);
    };
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
          autoPlay muted loop playsInline preload="metadata"
          disablePictureInPicture />
      )}
      <span className="schleier" />
    </div>
  );
}

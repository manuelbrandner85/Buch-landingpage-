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
  { bild, bildsatz, video, videoKlein, alt }:
  { bild: string; bildsatz?: string; video?: string; videoKlein?: string;
    alt: string }) {
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

    /*
     * Sofort, nicht später — die Annahme dahinter war falsch.
     *
     * Bis zum 05.09.2026 wartete der Film hier auf eine Ruhepause des
     * Browsers (bis zu 2,5 s), mit der Begründung: Das Standbild sei das
     * größte Element des ersten Bildschirms, und ein gleichzeitig ladendes
     * Video verschlechtere die Messung.
     *
     * Gemessen stimmt das Gegenteil. Der Browser wählt als größtes Element
     * das Video, sobald es sichtbar wird — nicht das Bild darunter. Die
     * Wartezeit verschob damit genau den Zeitpunkt nach hinten, den sie
     * schützen sollte: 3128 ms auf einer gedrosselten Verbindung, davon
     * gut zwei Sekunden reines Warten.
     *
     * Das Bild ist 41 KB und wird mit hoher Priorität vorgeladen, der Film
     * 157 KB. Sie behindern einander nicht ernsthaft — und wer wenig Daten
     * hat, bekommt oben ohnehin kein Video.
     */
    waehlen();
    ruhig.addEventListener('change', waehlen);
    return () => { ruhig.removeEventListener('change', waehlen); };
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
      {/* `sizes="100vw"`, weil der Grund immer die volle Breite füllt. Damit
          holt ein Telefon die 1000er Stufe statt der 1920er — dasselbe Bild,
          weniger als die Hälfte der Bytes, und es steht früher. */}
      <img src={bild} srcSet={bildsatz} sizes={bildsatz ? '100vw' : undefined}
        alt={alt} decoding="async" fetchPriority="high" />
      {/* Kein `poster`.
          Das Standbild liegt bereits als <img> darunter und ist dasselbe Motiv.
          Ein Poster am Video hieß: dasselbe Bild ein zweites Mal laden — und
          zwar in der festen 1920er Stufe, während das <img> daneben über sein
          `srcset` brav die 1000er nimmt. Am 01.09.2026 auf dem Telefon
          gemessen: 56 KB für ein Bild, das kein Mensch je zu sehen bekommt,
          weil es hinter einem identischen liegt. */}
      {quelle && (
        <video ref={film} key={quelle} src={quelle}
          autoPlay muted loop playsInline preload="metadata"
          disablePictureInPicture />
      )}
      <span className="schleier" />
    </div>
  );
}

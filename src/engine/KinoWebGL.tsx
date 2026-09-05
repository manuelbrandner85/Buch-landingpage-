'use client';

import { useEffect, useRef, useState } from 'react';
import type { Szene } from '@/data/gemeinsam/typen';
import { assetNach, stimmungFuer } from '@/world/registry';
import { bewegt, bildQuelle, ordner } from '@/world/bilder';
import { starteKino, type KinoSteuerung } from './kino-webgl';
import { zeilenAufdecken } from './zeilen';

/**
 * Die Kinoebene als eine Fläche.
 *
 * Meldet zurück, ob WebGL trägt. Tut es das nicht – alter Browser, abgeschaltete
 * Beschleunigung, „Bewegung reduzieren“ –, übernimmt wieder die DOM-Fassung.
 * Das ist kein Notbehelf, sondern dieselbe Welt in ruhiger.
 */
export function KinoWebGL({ szenen, beiRueckfall }: {
  szenen: Szene[];
  beiRueckfall: () => void;
}) {
  const leinwand = useRef<HTMLCanvasElement>(null);
  const [laeuft, setLaeuft] = useState(false);

  useEffect(() => {
    if (!leinwand.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { beiRueckfall(); return; }

    // Auflösung nach Gerät – und mit Reserve für die Kamerafahrt.
    //
    // Die Kamera fährt in die Szene hinein, bis zu Faktor 1,24. Was auf dem
    // Schirm 1440 Punkte breit ist, wird dabei aus einem kleineren Ausschnitt
    // des Motivs gefüllt. Wer nur die Fensterbreite anfordert, bekommt in der
    // Nahaufnahme ein hochgezogenes Bild. Deshalb ein Viertel Zuschlag.
    const dichte = Math.min(window.devicePixelRatio || 1, 2);
    const zielBreite = Math.round(Math.min(2560, Math.max(640,
      window.innerWidth * dichte * 1.25)));

    // Eine Seite ohne Motive braucht keine Kinoebene.
    //
    // Die Schwelle einer Reihe – Ankunft und Weltenwahl – trägt keine Platte.
    // Vorher wurde die Fläche trotzdem gestartet und griff im ersten Bild auf
    // eine leere Szenenliste zu: „Cannot read properties of undefined". Hier
    // gibt es schlicht nichts zu zeigen; der schwarze Grund genügt.
    const bild = szenen.filter((s) => s.platte);
    if (bild.length === 0) return;

    let steuerung: KinoSteuerung | null = null;
    try {
      steuerung = starteKino(leinwand.current, bild.map((s) => {
        const asset = assetNach(s.platte);
        return {
          id: s.id,
          bild: asset ? bildQuelle(asset, zielBreite) : '',
          tiefe: asset ? ordner(`${asset.datei}-tiefe.webp`, asset.bandId ?? 'band-1') : undefined,
          // Bewegtfassung, sobald sie vorliegt. Fehlt sie, bleibt das Standbild –
          // die Engine prüft das selbst und fällt still zurück.
          // Mit Fassung, nicht ohne: Die Szenenvideos liefen bis zum
          // 05.09.2026 als nackte Adresse durch `ordner`. Der Webspace setzt
          // auf mp4 ein Jahr `immutable` — neu gerechnete Dateien waeren bei
          // jedem Wiederkehrer unsichtbar geblieben.
          video: s.motion && asset ? bewegt(`${asset.datei}-motion.mp4`, asset.bandId ?? 'band-1') : undefined,
          videoKlein: s.motion && asset ? bewegt(`${asset.datei}-motion-klein.mp4`, asset.bandId ?? 'band-1') : undefined,
          grading: hexZuRgb(s.grading ?? '#1a2540'),
          uebergang: s.uebergang ?? 'aufloesen',
          fahrt: s.fahrt ?? 'hinein',
          stimmung: stimmungFuer(s.kapitelId, s.bandId),
          tor: Boolean(s.tor),
        };
      }));
    } catch {
      steuerung = null;
    }
    if (!steuerung) { beiRueckfall(); return; }
    setLaeuft(true);
    // Für Messungen von außen erreichbar – die Fläche selbst braucht das nicht.
    (window as unknown as { kino?: KinoSteuerung }).kino = steuerung;

    // Der Fortschritt kommt aus der tatsächlichen Lage der Abschnitte, damit der
    // Übergang genau dort sitzt, wo im Text die nächste Szene beginnt.
    //
    // Gemessen wird die Lage **nicht** in jedem Bild. Vorher las diese Schleife
    // sechzigmal je Sekunde die Maße von rund dreißig Abschnitten – jedes
    // `getBoundingClientRect` zwingt den Browser dabei, das Layout vorzeitig zu
    // berechnen. Auf dem Schreibtisch fiel das kaum auf, auf dem Handy war es
    // der teuerste Posten der Seite. Die Lage der Titel ändert sich aber nur,
    // wenn sich etwas am Layout ändert: beim Drehen, beim Nachladen der
    // Schriften, wenn ein Bild eintrifft. Genau dann – und sonst nie – wird
    // neu gemessen; im Bild bleibt eine einzige Abfrage der Scrollhöhe.
    let anker: number[] = [];
    const messen = () => {
      anker = bild
        .map((s) => document.getElementById(s.id))
        .filter((e): e is HTMLElement => Boolean(e))
        .map((e) => {
          // Verankert an der Überschrift der Szene, nicht am Abschnittsanfang.
          // Steht der Titel in der Bildmitte, steht auch sein Motiv – gemessen,
          // nicht geschätzt: die Titel sitzen je nach Textlänge bei 61 bis 84
          // Prozent der Abschnittshöhe.
          const titel = e.querySelector('h2, h1');
          const r = titel ? titel.getBoundingClientRect() : e.getBoundingClientRect();
          const mitte = titel ? r.top + r.height / 2 : r.top + e.offsetHeight * 0.72;
          return mitte + window.scrollY;
        });
    };
    messen();

    let frame = 0;
    const rechnen = () => {
      if (anker.length > 1) {
        const y = window.scrollY + window.innerHeight * 0.5;
        let i = 0;
        while (i < anker.length - 1 && y >= (anker[i + 1] ?? Infinity)) i++;
        const a = anker[i] ?? 0;
        const b = anker[i + 1] ?? a + window.innerHeight;
        const t = Math.max(0, Math.min(1, (y - a) / Math.max(1, b - a)));
        steuerung?.setzeFortschritt((i + t) / (anker.length - 1));
      }
      frame = requestAnimationFrame(rechnen);
    };
    frame = requestAnimationFrame(rechnen);

    // Neu messen, wenn sich das Layout tatsächlich ändert – gebündelt auf das
    // nächste Bild, damit ein Schwall von Ereignissen eine Messung ergibt.
    let geplant = 0;
    const nachmessen = () => {
      if (geplant) return;
      geplant = requestAnimationFrame(() => { geplant = 0; messen(); });
    };
    addEventListener('resize', nachmessen, { passive: true });
    addEventListener('orientationchange', nachmessen, { passive: true });
    document.fonts?.ready.then(nachmessen).catch(() => undefined);
    const beobachter = new ResizeObserver(nachmessen);
    const buehne = document.querySelector('main');
    if (buehne) beobachter.observe(buehne);

    const aufraeumen = zeilenAufdecken('[data-auf]');
    return () => {
      cancelAnimationFrame(frame);
      if (geplant) cancelAnimationFrame(geplant);
      removeEventListener('resize', nachmessen);
      removeEventListener('orientationchange', nachmessen);
      beobachter.disconnect();
      steuerung?.zerstoeren();
      aufraeumen?.();
    };
  }, [szenen, beiRueckfall]);

  return (
    <div className="kino" aria-hidden="true">
      <canvas ref={leinwand} className="kino-flaeche" style={{ opacity: laeuft ? 1 : 0 }} />
    </div>
  );
}

function hexZuRgb(hex: string): number[] {
  const n = Number.parseInt(hex.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

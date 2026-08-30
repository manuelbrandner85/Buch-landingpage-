'use client';

import { useEffect, useRef, useState } from 'react';
import { BASIS_PFAD } from '@/world/bilder';

/**
 * Der Startbildschirm des Geräts — und die App, die sich öffnet.
 *
 * Gebaut, nicht erzeugt. Ein KI-Bild eines Startbildschirms wäre beim
 * Hineinfahren unscharf geworden und hätte fremde Marken gezeigt. Hier sind
 * die Symbole gezeichnet: die Anwendungen, die auf jedem Telefon liegen, in
 * ihrer eigenen Farbe und mit eigenem Zeichen. Keine fremde Marke.
 *
 * Was ein Symbol echt aussehen lässt, ist nicht das Zeichen darauf, sondern
 * das Material darunter (siehe `auflage`):
 *
 *  · **Superellipse statt Rundung.** Ein `border-radius` erzeugt eine Kante,
 *    an der die Krümmung springt. Die Ecke eines Telefonsymbols tut das nicht.
 *  · **Eigener Schattenton je Farbe.** Unter einem grünen Symbol liegt ein
 *    dunkelgrüner Schatten, kein grauer — grau lässt eine farbige Fläche
 *    ausgestanzt wirken statt aufliegend.
 *  · **Lichtkante oben.** Auf dunklem Grund trägt Schatten kaum; die Höhe
 *    entsteht über die vom Licht getroffene Oberkante.
 *  · **Zwei Schattenebenen**, beide ohne Seitenversatz: eine kurze, die das
 *    Symbol an die Scheibe klebt, und eine weite, die es abhebt.
 */

type App = {
  name: string;
  /** Zwei Stufen derselben Farbe, von oben nach unten. */
  farbe: [string, string];
  /** Schattenton: derselbe Farbton, halbe Sättigung, sehr dunkel. */
  schatten: string;
  /** Dunkles Zeichen auf hellem Grund? */
  dunkel?: boolean;
  zeichen: React.ReactNode;
};

const strich = (d: string, mehr?: React.ReactNode, breite = 2) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={breite} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />{mehr}
  </svg>
);
const flaeche = (d: string, mehr?: React.ReactNode) => (
  <svg viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d={d} />{mehr}
  </svg>
);

const APPS: App[] = [
  { name: 'Telefon', farbe: ['#57e07a', '#17a03c'], schatten: '12 60 26',
    zeichen: flaeche('M6.6 3.2a1.7 1.7 0 0 1 2.2.7l1.7 3.1a1.7 1.7 0 0 1-.4 2.1l-1.3 1a12.4 12.4 0 0 0 5.1 5.1l1-1.3a1.7 1.7 0 0 1 2.1-.4l3.1 1.7a1.7 1.7 0 0 1 .7 2.2l-.8 1.7a2.6 2.6 0 0 1-2.9 1.4C11.4 19.7 4.3 12.6 2.5 5.6A2.6 2.6 0 0 1 3.9 2.7z') },
  { name: 'Nachrichten', farbe: ['#6bea86', '#1da84a'], schatten: '14 62 30',
    zeichen: flaeche('M12 3.4c-5.2 0-9.4 3.3-9.4 7.5 0 2.3 1.3 4.4 3.3 5.8-.2 1.2-.8 2.6-1.8 3.6 1.9-.2 3.6-.9 4.9-1.9 1 .3 2 .4 3 .4 5.2 0 9.4-3.3 9.4-7.9S17.2 3.4 12 3.4Z') },
  { name: 'Kamera', farbe: ['#9a9aa2', '#3a3a40'], schatten: '26 26 30',
    zeichen: flaeche('M9.4 4.6 8.2 6.4H5A2.4 2.4 0 0 0 2.6 8.8v8.6A2.4 2.4 0 0 0 5 19.8h14a2.4 2.4 0 0 0 2.4-2.4V8.8A2.4 2.4 0 0 0 19 6.4h-3.2l-1.2-1.8Z',
      <circle cx="12" cy="13" r="3.5" fill="#2c2c31" />) },
  { name: 'Fotos', farbe: ['#ffffff', '#dcdce4'], schatten: '30 30 36', dunkel: true,
    zeichen: (
      <svg viewBox="0 0 24 24" fill="none">
        <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M12 4v5.4M12 14.6V20M4 12h5.4M14.6 12H20" />
          <path d="M6.7 6.7 10.4 10.4M13.6 13.6l3.7 3.7M17.3 6.7 13.6 10.4M10.4 13.6 6.7 17.3" opacity=".55" />
        </g>
      </svg>) },
  { name: 'Wetter', farbe: ['#5cb4f5', '#1668cc'], schatten: '14 40 76',
    zeichen: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <circle cx="7.6" cy="8" r="3" opacity=".9" />
        <path d="M8.6 18.8h8.6a3.6 3.6 0 0 0 .4-7.2A5.3 5.3 0 0 0 8.2 12a3.4 3.4 0 0 0 .4 6.8Z" />
      </svg>) },
  // Platz 5 gehört der eigenen App.
  { name: 'Trendonix', farbe: ['#1c2440', '#080c16'], schatten: '38 32 12', zeichen: null },
  { name: 'Uhr', farbe: ['#2e2e33', '#0b0b0e'], schatten: '10 10 12',
    zeichen: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
        <circle cx="12" cy="12" r="8.6" opacity=".55" />
        <path d="M12 6.8V12l3.4 2.1" />
      </svg>) },
  { name: 'Karten', farbe: ['#6ecf78', '#2b86c4'], schatten: '20 56 54',
    zeichen: flaeche('M9.2 3.4 3 5.6v15l6.2-2.2 5.6 2.2 6.2-2.2v-15L14.8 5.6Zm0 0v15m5.6-12.8v15',
      <path d="M9.2 3.4v15M14.8 5.6v15" stroke="rgba(0,0,0,.28)" strokeWidth="1.4" fill="none" />) },
  { name: 'Musik', farbe: ['#ff6b7c', '#c8102e'], schatten: '72 12 22',
    zeichen: flaeche('M18.6 3.2 9 5.3a1.2 1.2 0 0 0-1 1.2v9.1a3.2 3.2 0 1 0 2.4 3.1V9.4l7.2-1.6v5.5a3.2 3.2 0 1 0 2.4 3.1V4.4a1.2 1.2 0 0 0-1.4-1.2Z') },
  { name: 'Notizen', farbe: ['#ffdc6b', '#e2a512'], schatten: '76 56 8',
    zeichen: (
      <svg viewBox="0 0 24 24" fill="none" stroke="#7a5405" strokeWidth="2" strokeLinecap="round">
        <path d="M7.6 8.4h8.8M7.6 12.4h8.8M7.6 16.4h5" />
      </svg>) },
  { name: 'Kalender', farbe: ['#ffffff', '#dfdfe6'], schatten: '30 30 36', dunkel: true,
    zeichen: (
      <svg viewBox="0 0 24 24" fill="none">
        <text x="12" y="17.4" textAnchor="middle" fontSize="12" fontWeight="600"
          fill="#e23b3b" fontFamily="system-ui, sans-serif">30</text>
      </svg>) },
  { name: 'Rechner', farbe: ['#ffb066', '#d96a10'], schatten: '74 40 6',
    zeichen: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <rect x="5.4" y="4.4" width="13.2" height="4.4" rx="1.1" opacity=".55" />
        <g>
          <circle cx="7.8" cy="12.4" r="1.35" /><circle cx="12" cy="12.4" r="1.35" />
          <circle cx="16.2" cy="12.4" r="1.35" /><circle cx="7.8" cy="16.6" r="1.35" />
          <circle cx="12" cy="16.6" r="1.35" /><circle cx="16.2" cy="16.6" r="1.35" />
        </g>
      </svg>) },
  { name: 'Podcasts', farbe: ['#bb7ef5', '#6d29b8'], schatten: '48 16 76',
    zeichen: flaeche('M12 3.2a3.2 3.2 0 0 0-3.2 3.2v5.2a3.2 3.2 0 0 0 6.4 0V6.4A3.2 3.2 0 0 0 12 3.2Z',
      <path d="M6.4 11.4v.8a5.6 5.6 0 0 0 11.2 0v-.8M12 17.8V21" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" fill="none" />) },
  { name: 'Kompass', farbe: ['#ee6a6a', '#951f24'], schatten: '62 14 16',
    zeichen: (
      <svg viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="8.8" stroke="currentColor" strokeWidth="1.7" opacity=".5" />
        <path d="m15.6 8.4-2.1 5.1-5.1 2.1 2.1-5.1z" fill="currentColor" />
      </svg>) },
  { name: 'Dateien', farbe: ['#8cc0ff', '#2f6ad0'], schatten: '16 40 76',
    zeichen: flaeche('M3.4 6.6a1.8 1.8 0 0 1 1.8-1.8h4l2.2 2.2h7.4a1.8 1.8 0 0 1 1.8 1.8v8.6a1.8 1.8 0 0 1-1.8 1.8H5.2a1.8 1.8 0 0 1-1.8-1.8Z') },
  { name: 'Einstellungen', farbe: ['#b0b0b6', '#5a5a62'], schatten: '26 26 30',
    zeichen: strich('M12 8.8a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4Z M12 3.2v2.2M12 18.6v2.2M3.2 12h2.2M18.6 12h2.2M5.8 5.8l1.6 1.6M16.6 16.6l1.6 1.6M18.2 5.8l-1.6 1.6M7.4 16.6l-1.6 1.6', undefined, 1.9) },
];

const DOCK: App[] = [
  { name: 'Mail', farbe: ['#5cb4f5', '#1668cc'], schatten: '14 40 76',
    zeichen: flaeche('M3.4 7.4A1.8 1.8 0 0 1 5.2 5.6h13.6a1.8 1.8 0 0 1 1.8 1.8L12 13.4Zm0 2.3v7a1.8 1.8 0 0 0 1.8 1.8h13.6a1.8 1.8 0 0 0 1.8-1.8v-7L12 15.6Z') },
  { name: 'Browser', farbe: ['#6bb6ff', '#1b56b8'], schatten: '12 34 72',
    zeichen: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="8.8" opacity=".6" />
        <path d="M3.2 12h17.6" opacity=".6" />
        <path d="M12 3.2a13.6 13.6 0 0 1 0 17.6 13.6 13.6 0 0 1 0-17.6Z" opacity=".6" />
      </svg>) },
  { name: 'Suche', farbe: ['#33333a', '#0d0d11'], schatten: '10 10 14',
    zeichen: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round">
        <circle cx="11" cy="11" r="6.4" /><path d="m20 20-4.4-4.4" />
      </svg>) },
  { name: 'Video', farbe: ['#ff7d9a', '#c2185b'], schatten: '72 12 36',
    zeichen: flaeche('M4.4 6.6a1.8 1.8 0 0 1 1.8-1.8h7.6a1.8 1.8 0 0 1 1.8 1.8v10.8a1.8 1.8 0 0 1-1.8 1.8H6.2a1.8 1.8 0 0 1-1.8-1.8Zm12.4 3.6 3.4-2.3a.7.7 0 0 1 1.1.6v7a.7.7 0 0 1-1.1.6l-3.4-2.3Z') },
];

const klemmen = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const glaetten = (x: number) => x * x * (3 - 2 * x);

/**
 * Hülle und Symbol sind zwei Elemente, und das hat einen Grund: Ein
 * `clip-path` schneidet den `box-shadow` mit weg. Also trägt die Hülle den
 * Schatten als `drop-shadow` — der folgt der beschnittenen Form —, und das
 * Symbol darin trägt Form, Farbe und Lichtkante.
 */
function Symbol({ app }: { app: App }) {
  return (
    <span className="fw-huelle" style={{ '--sh': app.schatten } as React.CSSProperties}>
      <span className={app.dunkel ? 'fw-symbol fw-symbol-hell' : 'fw-symbol'} style={{
        '--farbe-oben': app.farbe[0], '--farbe-unten': app.farbe[1],
      } as React.CSSProperties}>
        {app.zeichen}
      </span>
    </span>
  );
}

/**
 * `tipp` läuft von 0 auf 1, während auf die App gedrückt wird.
 *
 * Sichtbar gemacht wird das so, wie es eine Bildschirmaufnahme tut: ein
 * weicher Berührungspunkt legt sich auf das Symbol, das Symbol geht unter dem
 * Druck nach innen. Kein gezeichneter Finger — der sähe nach Erklärvideo aus
 * und würde die halbe Kachel verdecken, auf die es ankommt.
 */
export function Startbildschirm({ hell, tipp, oeffnet }: {
  hell: number; tipp: number; oeffnet: number;
}) {
  const symbol = useRef<HTMLSpanElement>(null);
  const [kachel, setKachel] = useState<DOMRect | null>(null);
  const [schirm, setSchirm] = useState<DOMRect | null>(null);

  useEffect(() => {
    const messen = () => {
      const s = symbol.current;
      if (!s) return;
      setKachel(s.getBoundingClientRect());
      const f = s.closest('.fw-fenster');
      if (f) setSchirm(f.getBoundingClientRect());
    };
    messen();
    window.addEventListener('resize', messen);
    window.addEventListener('scroll', messen, { passive: true });
    return () => {
      window.removeEventListener('resize', messen);
      window.removeEventListener('scroll', messen);
    };
  }, []);

  // Der Druck auf die Kachel: Das Symbol geht nach innen und wird eine Spur
  // heller, solange der Berührungspunkt daraufliegt.
  const gedrueckt = tipp > 0 && oeffnet <= 0;
  const druck = glaetten(klemmen(tipp / 0.4));

  const flaeche2 = (() => {
    if (oeffnet <= 0 || !kachel || !schirm) return null;
    const e = glaetten(oeffnet);
    return {
      left: `${(kachel.left - schirm.left) * (1 - e)}px`,
      top: `${(kachel.top - schirm.top) * (1 - e)}px`,
      width: `${kachel.width + (schirm.width - kachel.width) * e}px`,
      height: `${kachel.height + (schirm.height - kachel.height) * e}px`,
      borderRadius: `${23 * (1 - e)}%`,
    };
  })();

  return (
    <div className="fw-start" style={{ opacity: hell * (1 - klemmen((oeffnet - 0.86) / 0.14)) }}>
      {/* Die Superellipse. Ein border-radius hat eine Stelle, an der die
          Krümmung springt; die Ecke eines Telefonsymbols hat das nicht. */}
      <svg className="fw-formen" aria-hidden="true" focusable="false">
        <clipPath id="fw-superellipse" clipPathUnits="objectBoundingBox">
          <path d="M.5 0C.78 0 .871 0 .9355.0645 1 .129 1 .22 1 .5s0 .371-.0645.4355C.871 1 .78 1 .5 1S.129 1 .0645.9355C0 .871 0 .78 0 .5s0-.371.0645-.4355C.129 0 .22 0 .5 0Z" />
        </clipPath>
      </svg>

      <div className="fw-statusleiste">
        <span>9:41</span>
        <span className="fw-statuszeichen" aria-hidden="true">
          <i className="fw-netz" /><i className="fw-funk" /><i className="fw-akku" />
        </span>
      </div>

      <div className="fw-gitter">
        {APPS.map((app, i) => (i === 5 ? (
          <span key="trendonix" className="fw-kachel fw-kachel-eigen">
            <span ref={symbol} className="fw-huelle" style={{
              '--sh': app.schatten,
              transform: `scale(${1 - druck * 0.09})`,
              filter: gedrueckt ? `brightness(${1 + druck * 0.22})` : undefined,
            } as React.CSSProperties}>
              <span className="fw-symbol fw-symbol-eigen">
                <img src={`${BASIS_PFAD}/marke/trendonix-tx.png`} alt="" width={64} height={44} />
              </span>
              {tipp > 0 && oeffnet <= 0 && (
                <span className="fw-tipp" style={{
                  opacity: klemmen(tipp / 0.25) * (1 - klemmen((tipp - 0.9) / 0.1)),
                  transform: `translate(-50%, -50%) scale(${0.72 + druck * 0.28})`,
                }} />
              )}
            </span>
            <span className="fw-kname">Trendonix</span>
          </span>
        ) : (
          <span key={app.name} className="fw-kachel">
            <Symbol app={app} />
            <span className="fw-kname">{app.name}</span>
          </span>
        )))}
      </div>

      <div className="fw-dock" aria-hidden="true">
        {DOCK.map((app) => <Symbol key={app.name} app={app} />)}
      </div>

      {flaeche2 && <div className="fw-appflaeche" style={flaeche2} />}
    </div>
  );
}

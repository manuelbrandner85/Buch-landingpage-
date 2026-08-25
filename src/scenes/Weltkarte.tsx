'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type React from 'react';
import type { Ort, Szene } from '@/data/gemeinsam/typen';
import { ORTE } from '@/data/gemeinsam/orte';
import {
  GRENZEN_PFAD, KARTE_BREITE, KARTE_HOEHE, LAND_PFAD, NETZ_PFAD, kx, ky,
} from '@/data/gemeinsam/karte-pfade';
import { WELT, assetNach, bandNummer, kapitelNach, szeneZuKapitel } from '@/world/registry';
import { bildQuelle } from '@/world/bilder';
import { useWeltFortschritt } from '@/world/FortschrittKontext';

/**
 * Die Welt dieses Bandes – als Flug, nicht als Diagramm.
 *
 * Vorher war das hier ein Gradnetz mit Punkten darauf: mathematisch richtig und
 * vollkommen leer. Ein Ort ohne Küste ist keine Verortung, sondern eine
 * Behauptung mit Koordinaten.
 *
 * Jetzt liegt darunter dieselbe Grundlage, die das Buch nennt: Küstenlinien und
 * Staatsgrenzen aus Natural Earth, erzeugt von `scripts/karte.mjs`. Darüber
 * liegen fünf Ebenen mit echtem Tiefenversatz – Meer, Gradnetz, Land, Faden,
 * Orte. Sie stehen in einem perspektivischen Raum unterschiedlich weit hinten;
 * wenn die Kamera kippt und wandert, wandern sie verschieden schnell. Das ist
 * kein Parallaxe-Trick über eine Grafik, sondern die Grafik selbst in Schichten.
 *
 * Die Kamera hängt am Scrollen: Sie beginnt hoch über der ganzen Welt, senkt
 * sich auf den ersten Ort, fährt den Faden entlang von Ort zu Ort – bei jedem
 * hält sie kurz und steht am tiefsten – und zieht am Ende wieder auf, wenn der
 * Faden vollständig liegt. Der Faden zeichnet sich dabei mit, mit einem Licht
 * an der Spitze.
 *
 * Wo die Seite still sein soll – im Ruhig-Modus, bei „Bewegung reduzieren“ –
 * steht die Karte als vollständige Übersicht da: alle Orte, ganzer Faden,
 * keine Fahrt. Nichts geht verloren, es bewegt sich nur nichts.
 */

const PERSPEKTIVE = 900;

/** Wie weit die Kamera an einem Ort heruntergeht (halbe Breite in Karteneinheiten). */
const NAH = 340;
/** Und wie weit sie zwischen zwei Orten wieder aufzieht. */
const FERN = 900;
/** Die Übersicht am Anfang und am Ende. */
const GANZ = 2500;

const klemm = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const misch = (a: number, b: number, t: number) => a + (b - a) * t;
/** Weiche Beschleunigung – ohne sie fühlt sich jede Fahrt nach Förderband an. */
const sanft = (t: number) => t * t * (3 - 2 * t);

/**
 * Ein Faden, kein Streckenzug.
 *
 * Der erste Versuch war eine Catmull-Rom-Spline durch alle Punkte. Sie sieht
 * weich aus, schießt aber bei scharfen Richtungswechseln weit über das Ziel
 * hinaus – zwischen zwei europäischen Städten schwang der Faden in den
 * Atlantik. Deshalb jetzt: je Abschnitt ein eigener Bogen, seitlich um ein
 * Zwölftel der Strecke ausgelenkt. Er überschießt nie, und er sieht aus wie
 * ein Faden, der über eine Kugel gelegt wurde – was er dem Sinn nach ist.
 */
function faden(punkte: { x: number; y: number }[]): string {
  if (punkte.length < 2) return '';
  const p = punkte;
  let d = `M ${p[0]!.x.toFixed(1)} ${p[0]!.y.toFixed(1)}`;
  for (let i = 0; i < p.length - 1; i += 1) {
    const a = p[i]!;
    const b = p[i + 1]!;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const l = Math.hypot(dx, dy) || 1;
    // Immer zur selben Seite auslenken, damit sich Hin- und Rückwege nicht decken.
    const bogen = Math.min(l / 12, 160);
    const cx = (a.x + b.x) / 2 - (dy / l) * bogen;
    const cy = (a.y + b.y) / 2 + (dx / l) * bogen;
    d += ` Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
  }
  return d;
}

interface Halt {
  ort: Ort;
  x: number;
  y: number;
  kapitel?: number;
  seiten: number[];
}

export function Weltkarte({ szene }: { szene: Szene }) {
  const band = szene.bandId;
  const fortschritt = useWeltFortschritt();
  const abschnitt = useRef<HTMLElement>(null);
  const fadenRef = useRef<SVGPathElement>(null);

  const [p, setP] = useState(0);
  const [ruhig, setRuhig] = useState(false);
  const [laenge, setLaenge] = useState(0);
  const [gewaehlt, setGewaehlt] = useState<string | null>(null);

  /** Nur die Orte dieses Bandes – in der Reihenfolge der Kapitel. */
  const halte = useMemo<Halt[]>(() => {
    const eigene = ORTE.filter((o) => o.vorkommen.some((v) => v.bandId === band));
    return eigene
      .map((ort) => {
        const v = ort.vorkommen.find((w) => w.bandId === band)!;
        return { ort, x: kx(ort.lon), y: ky(ort.lat), kapitel: v.kapitel, seiten: v.seiten };
      })
      .sort((a, b) => (a.kapitel ?? 0) - (b.kapitel ?? 0));
  }, [band]);

  const spur = useMemo(() => faden(halte), [halte]);

  /**
   * Stillstand hat zwei Quellen: die Systemeinstellung und den Ruhig-Knopf in
   * der Kopfzeile. Beide können sich ändern, während die Karte schon steht –
   * deshalb wird beides beobachtet und nicht einmal beim Aufbau abgefragt.
   */
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const welt = document.querySelector('.welt');
    const pruefen = () => setRuhig(mq.matches || Boolean(welt?.classList.contains('ruhig')));
    pruefen();
    mq.addEventListener('change', pruefen);
    const b = welt
      ? new MutationObserver(pruefen)
      : undefined;
    if (welt && b) b.observe(welt, { attributes: true, attributeFilter: ['class'] });
    return () => { mq.removeEventListener('change', pruefen); b?.disconnect(); };
  }, []);

  useEffect(() => {
    if (fadenRef.current) setLaenge(fadenRef.current.getTotalLength());
  }, [spur]);

  const messen = useCallback(() => {
    const el = abschnitt.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const strecke = r.height - window.innerHeight;
    if (strecke <= 0) { setP(0); return; }
    setP(klemm(-r.top / strecke, 0, 1));
  }, []);

  useEffect(() => {
    if (ruhig) return undefined;
    let warte = false;
    const auf = () => {
      if (warte) return;
      warte = true;
      requestAnimationFrame(() => { warte = false; messen(); });
    };
    messen();
    window.addEventListener('scroll', auf, { passive: true });
    window.addEventListener('resize', auf);
    return () => {
      window.removeEventListener('scroll', auf);
      window.removeEventListener('resize', auf);
    };
  }, [messen, ruhig]);

  // ── Die Kamera ────────────────────────────────────────────────────────────
  //
  // Drei Akte: ansetzen, den Faden abfliegen, aufziehen. Die Grenzen sind so
  // gewählt, dass der Blick am Anfang und am Ende jeweils einen Moment steht –
  // eine Fahrt, die sofort losgeht und abrupt endet, wirkt wie ein Fehler.
  const ANSATZ = 0.14;
  const AUSZUG = 0.88;
  const anzahl = Math.max(halte.length - 1, 1);

  const kamera = useMemo(() => {
    if (ruhig || halte.length === 0) {
      return { x: KARTE_BREITE / 2, y: KARTE_HOEHE / 2, w: GANZ, kippung: 0, i: -1 };
    }
    const erster = halte[0]!;
    const letzter = halte[halte.length - 1]!;

    if (p <= ANSATZ) {
      const t = sanft(p / ANSATZ);
      return {
        x: misch(KARTE_BREITE / 2, erster.x, t),
        y: misch(KARTE_HOEHE / 2, erster.y, t),
        w: misch(GANZ, NAH, t),
        kippung: misch(16, 38, t),
        i: 0,
      };
    }
    if (p >= AUSZUG) {
      const t = sanft((p - AUSZUG) / (1 - AUSZUG));
      return {
        x: misch(letzter.x, KARTE_BREITE / 2, t),
        y: misch(letzter.y, KARTE_HOEHE / 2, t),
        w: misch(NAH, GANZ, t),
        kippung: misch(38, 12, t),
        i: halte.length - 1,
      };
    }
    const roh = ((p - ANSATZ) / (AUSZUG - ANSATZ)) * anzahl;
    const i = klemm(Math.floor(roh), 0, anzahl - 1);
    const t = roh - i;
    const a = halte[i]!;
    const b = halte[i + 1] ?? a;
    const s = sanft(t);
    return {
      x: misch(a.x, b.x, s),
      y: misch(a.y, b.y, s),
      // Zwischen zwei Orten zieht die Kamera auf und geht am Ziel wieder herunter.
      w: misch(NAH, FERN, Math.sin(Math.PI * t) ** 0.7),
      kippung: 38 - 10 * Math.sin(Math.PI * t),
      i: t < 0.5 ? i : i + 1,
    };
  }, [p, ruhig, halte, anzahl]);

  const hoehe = (kamera.w * 9) / 16;
  const sichtfeld = `${(kamera.x - kamera.w).toFixed(1)} ${(kamera.y - hoehe).toFixed(1)} `
    + `${(kamera.w * 2).toFixed(1)} ${(hoehe * 2).toFixed(1)}`;

  /** Strichstärken und Schriftgrößen in Karteneinheiten – sonst wachsen sie beim Zoom mit. */
  const e = kamera.w / 900;

  const gezeichnet = ruhig
    ? 0
    : laenge * (1 - klemm((p - ANSATZ) / (AUSZUG - ANSATZ), 0, 1));

  const aktuell = halte[klemm(kamera.i, 0, halte.length - 1)];
  const gezeigt = gewaehlt ? halte.find((h) => h.ort.id === gewaehlt) ?? aktuell : aktuell;
  const kapitel = kapitelNach(gezeigt?.kapitel, band);
  const sprung = szeneZuKapitel(gezeigt?.kapitel, band);
  /**
   * Das Bild zum Ort – aber kein erfundenes: das Motiv des Kapitels, das diesen
   * Ort belegt. So sieht man neben dem Punkt, wovon die Seite handelt, auf der
   * er steht, und nicht eine Fotografie, die es nicht gibt.
   */
  const auftakt = useMemo(() => {
    const k = gezeigt?.kapitel;
    if (k === undefined) return undefined;
    const szenen = WELT[band]?.szenen ?? [];
    const treffer = szenen.find((z) => z.kapitelId === k && z.typ === 'auftakt' && z.platte)
      ?? szenen.find((z) => z.kapitelId === k && z.platte);
    return treffer?.platte ? assetNach(treffer.platte) : undefined;
  }, [gezeigt, band]);

  const besucht = (h: Halt) => {
    const s = szeneZuKapitel(h.kapitel, band);
    return Boolean(s && fortschritt?.kennt(s.id));
  };

  if (halte.length === 0) return null;

  /**
   * Wie lang der Abschnitt sein muss.
   *
   * Nicht als feste Zahl: Band 2 hat vierundzwanzig Orte, Band 1 zwanzig. Bei
   * fester Höhe hätte jeder Ort in Band 2 weniger Weg als in Band 1, und die
   * Fahrt wäre dort ein Vorbeirauschen. Dreißig Bildschirmhöhen je Abschnitt
   * sind genug, um eine Tafel zu lesen, ohne dass das Scrollen zur Arbeit wird.
   */
  const strecke = Math.min(900, 100 + 30 * Math.max(halte.length - 1, 1));

  /** Eine Ebene im Raum: weiter hinten heißt kleiner – und muss zurückskaliert werden. */
  const ebene = (z: number): React.CSSProperties => ({
    transform: `translateZ(${z}px) scale(${((PERSPEKTIVE - z) / PERSPEKTIVE).toFixed(4)})`,
  });

  /**
   * Stillgestellt wird die ganze Welt eingepasst (`meet`), in der Fahrt füllt
   * sie das Bild (`slice`). Sonst stünde im Ruhezustand ein Ausschnitt da, wo
   * eine Übersicht stehen soll.
   */
  const passung = ruhig ? 'xMidYMid meet' : 'xMidYMid slice';
  const svgProps = {
    viewBox: sichtfeld,
    preserveAspectRatio: passung,
    'aria-hidden': true as const,
  };

  return (
    <section id={szene.id} className={ruhig ? 'karte still' : 'karte'} ref={abschnitt}
      style={{ '--hoehe': strecke } as React.CSSProperties}>
      <div className="karte-halt">
        <div className="karte-buehne" style={{ perspective: `${PERSPEKTIVE}px` }}>
          <div className="karte-raum"
            style={{ transform: `rotateX(${kamera.kippung.toFixed(2)}deg)` }}>

            {/* Meer */}
            <div className="karte-ebene" style={ebene(-220)}>
              <svg {...svgProps}>
                <rect x={-KARTE_BREITE} y={-KARTE_HOEHE} width={KARTE_BREITE * 3}
                  height={KARTE_HOEHE * 3} className="karte-meer" />
              </svg>
            </div>

            {/* Gradnetz */}
            <div className="karte-ebene" style={ebene(-140)}>
              <svg {...svgProps}>
                <path d={NETZ_PFAD} className="karte-netz" strokeWidth={0.7 * e} />
              </svg>
            </div>

            {/* Land, Grenzen, Küste */}
            <div className="karte-ebene" style={ebene(0)}>
              <svg {...svgProps}>
                <defs>
                  <linearGradient id="landton" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1a2233" />
                    <stop offset="100%" stopColor="#0d1420" />
                  </linearGradient>
                </defs>
                <path d={LAND_PFAD} className="karte-saum" strokeWidth={7 * e} />
                <path d={LAND_PFAD} className="karte-land" />
                <path d={GRENZEN_PFAD} className="karte-grenzen" strokeWidth={0.7 * e} />
                <path d={LAND_PFAD} className="karte-kueste" strokeWidth={1.1 * e} />
              </svg>
            </div>

            {/* Der Faden */}
            <div className="karte-ebene" style={ebene(70)}>
              <svg {...svgProps}>
                <path d={spur} className="karte-faden-spur" strokeWidth={1.4 * e} />
                <path d={spur} className="karte-faden-schein" strokeWidth={9 * e}
                  strokeDasharray={laenge} strokeDashoffset={gezeichnet} />
                <path ref={fadenRef} d={spur} className="karte-faden"
                  strokeWidth={2.2 * e}
                  strokeDasharray={laenge} strokeDashoffset={gezeichnet} />
              </svg>
            </div>

            {/* Orte */}
            <div className="karte-ebene karte-ebene-orte" style={ebene(130)}>
              <svg viewBox={sichtfeld} preserveAspectRatio={passung}
                role="group" aria-label={`Karte der Orte aus Band ${bandNummer(band)}`}>
                {halte.map((h, i) => {
                  const hier = gezeigt?.ort.id === h.ort.id;
                  const erreicht = ruhig || i <= kamera.i;
                  return (
                    <g key={h.ort.id}
                      className={`ort${hier ? ' hier' : ''}${erreicht ? ' erreicht' : ''}`}
                      tabIndex={0} role="button" aria-label={h.ort.name}
                      aria-current={hier}
                      onClick={() => setGewaehlt(h.ort.id)}
                      onKeyDown={(ev) => {
                        if (ev.key === 'Enter' || ev.key === ' ') {
                          ev.preventDefault(); setGewaehlt(h.ort.id);
                        }
                      }}>
                      {hier && <circle cx={h.x} cy={h.y} r={13 * e} className="ort-hof" />}
                      <circle cx={h.x} cy={h.y} r={3.2 * e}
                        className={besucht(h) ? 'besucht' : undefined} />
                      <text x={h.x + 9 * e} y={h.y + 4 * e}
                        fontSize={13 * e} strokeWidth={3.4 * e}>{h.ort.name}</text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
          {/* Dunst am fernen Rand: Die Welt hört nicht auf, sie verliert sich. */}
          <div className="karte-dunst" aria-hidden="true" />
          <div className="karte-vignette" aria-hidden="true" />
        </div>

        {/* Die Tafel: was an diesem Ort belegt ist */}
        <div className="karte-tafel">
          <p className="eyebrow">{szene.titel}</p>
          {gezeigt && (
            <>
              <h2>{gezeigt.ort.name}</h2>
              <p className="karte-text">{gezeigt.ort.text}</p>
              <p className="karte-beleg">
                Band {bandNummer(band)} · Kapitel {gezeigt.kapitel} – {kapitel?.titel}
                <span>Seiten {gezeigt.seiten.join(', ')}</span>
              </p>
              {sprung && (
                <a className="sprung" href={`#${sprung.id}`}>In die Szene · {sprung.titel}</a>
              )}
            </>
          )}
          <p className="karte-stand" aria-hidden="true">
            {ruhig ? halte.length : Math.min(kamera.i + 1, halte.length)}{' '}
            <span>von {halte.length} Orten</span>
          </p>
          <p className="karte-grundlage">
            Küstenlinien und Grenzen: Natural Earth. Der Faden verbindet die Orte in der
            Reihenfolge der Kapitel, nicht der Geografie.
          </p>
        </div>

        {auftakt && (
          <figure className="karte-motiv" key={auftakt.id}>
            <img src={bildQuelle(auftakt, 1000)} alt="" loading="lazy" decoding="async" />
          </figure>
        )}
      </div>
      <p className="karte-fliess"
        style={{ opacity: ruhig ? 1 : klemm(1 - p / ANSATZ, 0, 1) }}>
        {szene.fliesstext}
      </p>
    </section>
  );
}

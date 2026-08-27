'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { FEDERBREITE, FORM, GESAMTLAENGE, KASTEN, STRICHE } from '@/data/gemeinsam/unterschrift';
import { TRENDONIX } from '@/data/gemeinsam/haus';

/**
 * Die Unterschrift, die sich selbst schreibt.
 *
 * Zu sehen ist der echte Schriftzug – seine Kontur, nicht eine nachgebaute
 * Schrift. Darüber liegt eine Maske: ein dicker Strich entlang der Mittellinie
 * der Tinte, in der Reihenfolge, in der geschrieben wird. Wird dieser Strich
 * von hinten aufgedeckt (stroke-dashoffset), erscheint der Schriftzug genau
 * so, wie eine Feder ihn zieht – auch über Kreuzungen hinweg, weil die Maske
 * dem Weg der Hand folgt und nicht einer Rechteckblende.
 *
 * Drei Zustände:
 *   fertig   – ohne JavaScript, bei „Bewegung reduzieren“ und im Ruhig-Modus:
 *              die Unterschrift steht einfach da. Das ist auch der Grundwert,
 *              damit ohne Skript nichts unsichtbar bleibt.
 *   wartet   – JavaScript ist da, die Unterschrift ist noch nicht im Bild.
 *   schreibt – sie ist ins Bild gekommen und wird geschrieben. Einmal.
 */
/** Wie lange die ganze Unterschrift dauert – ohne die Pausen zwischen den Zügen. */
const DAUER = 4.2;
/** Federgeschwindigkeit in Einheiten je Sekunde. */
const TEMPO = GESAMTLAENGE / DAUER;
/** Absetzen zwischen zwei Zügen. */
const ABSETZEN = 0.022;

export function Unterschrift() {
  const halter = useRef<HTMLDivElement>(null);
  const [zustand, setZustand] = useState<'fertig' | 'wartet' | 'schreibt'>('fertig');
  const kennung = useId().replace(/:/g, '');

  useEffect(() => {
    const knoten = halter.current;
    if (!knoten) return;
    const ruhigGewuenscht = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (ruhigGewuenscht) return;

    setZustand('wartet');
    const beobachter = new IntersectionObserver((eintraege) => {
      for (const e of eintraege) {
        if (e.isIntersecting) {
          setZustand('schreibt');
          beobachter.disconnect();
        }
      }
    }, { threshold: 0.35 });
    beobachter.observe(knoten);
    return () => beobachter.disconnect();
  }, []);

  const maske = `maske-${kennung}`;
  const gold = `gold-${kennung}`;
  const licht = `licht-${kennung}`;
  const schnitt = `schnitt-${kennung}`;
  const [vx = 0, vy = 0, vb = 0, vh = 0] = KASTEN.split(' ').map(Number);

  return (
    <div ref={halter} className={`unterschrift ${zustand}`}>
      <svg viewBox={KASTEN} role="img"
        aria-label={`Unterschrift ${TRENDONIX.name}`}>
        <defs>
          {/* Gold ist kein Ton, sondern eine Folge von Tönen: dunkler Grund,
              helle Kante, ein zweiter Aufhellung weiter hinten. */}
          <linearGradient id={gold} x1="0%" y1="0%" x2="100%" y2="42%">
            <stop offset="0%" stopColor="#a9863f" />
            <stop offset="16%" stopColor="#e6cd94" />
            <stop offset="32%" stopColor="#fbf3d8" />
            <stop offset="46%" stopColor="#d9bd7c" />
            <stop offset="62%" stopColor="#a9863f" />
            <stop offset="80%" stopColor="#f1e2b4" />
            <stop offset="100%" stopColor="#b08f47" />
          </linearGradient>
          <linearGradient id={licht} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0" />
            <stop offset="50%" stopColor="#fffdf2" stopOpacity=".75" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <mask id={maske}>
            {/* Ein Zug nach dem anderen. Die Dauer ist die Länge geteilt durch
                die Federgeschwindigkeit, der Einsatz die Summe alles Vorigen –
                dazu ein Wimpernschlag Pause für das Absetzen. So schreibt die
                Hand gleichmäßig, statt jeden Zug gleich lang zu ziehen. */}
            {(() => {
              let bisher = 0;
              return STRICHE.map((zug, i) => {
                // Die runde Federspitze steht an beiden Enden über den Zug
                // hinaus. Ohne diesen Zuschlag bliebe von jedem noch nicht
                // geschriebenen Zug ein Pünktchen stehen – vierzig Krümel auf
                // der leeren Seite.
                const laenge = zug.l + FEDERBREITE;
                const beginn = bisher / TEMPO + i * ABSETZEN;
                bisher += laenge;
                return (
                  <path key={i} className="feder" d={zug.d} fill="none" stroke="#fff"
                    strokeWidth={FEDERBREITE} strokeLinecap="round" strokeLinejoin="round"
                    style={{
                      ['--zug' as string]: laenge,
                      animationDuration: `${(laenge / TEMPO).toFixed(3)}s`,
                      animationDelay: `${beginn.toFixed(3)}s`,
                    }} />
                );
              });
            })()}
          </mask>
          <clipPath id={schnitt}><path d={FORM} /></clipPath>
        </defs>
        <g mask={`url(#${maske})`}>
          <path d={FORM} fill={`url(#${gold})`} />
          <g clipPath={`url(#${schnitt})`}>
            <rect className="unterschrift-glanz" x={vx} y={vy}
              width={vb * 0.38} height={vh} fill={`url(#${licht})`} />
          </g>
        </g>
      </svg>
    </div>
  );
}

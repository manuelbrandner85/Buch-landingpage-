'use client';

import { useEffect, useMemo, useState } from 'react';
import { FEED, LESEORDNUNG } from '@/data/zufall/feed';

/**
 * Das Netz, das sich beim Lesen knüpft.
 *
 * In der Welt der Fäden hängt ein Faden zwischen Orten, und er trägt: Jeder
 * Ort ist eine Fundstelle, jeder Abschnitt eine belegte Verbindung. Hier ist
 * dieselbe Metapher, einmal andersherum. Wer vierzig Behauptungen hintereinander
 * sieht, knüpft sie im Kopf zusammen — und das Netz, das dabei entsteht, hängt
 * an nichts.
 *
 * Was hier verbunden wird, ist nicht erfunden: Es sind die Hashtags, die im
 * Buch unter den Beiträgen stehen. Und die Rechnung fällt eindeutig aus.
 * Vierunddreißig der vierzig Beiträge teilen ein einziges Wort — `#fyp`, „zeig
 * das jedem". Das ist keine Verbindung, das ist eine Aufforderung. Was zwei
 * Behauptungen wirklich gemeinsam haben, ist selten und lässt sich zählen.
 *
 * Deshalb zwei Sorten Faden: die vielen blassen, die nur `#fyp` teilen, und
 * die wenigen hellen, in denen zweimal dasselbe steht. Und deshalb der Zug am
 * Ende: Was an einem Wort hängt, hält nicht.
 *
 * Technisch ist das ein Bild, kein System: zwei Pfade und vierzig Kreise. Die
 * blassen Fäden stehen zu Hunderten in EINEM Pfad statt in Hunderten Knoten —
 * sonst wäre der Schluss ein halbes Tausend Elemente schwer.
 */

const PLATTFORM = 'fyp';
const MITTE = 100;
const RADIUS = 78;

/** Immer dasselbe Zittern: eine Pinnwand von Hand, aber reproduzierbar. */
const streu = (n: number) => {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

interface Pin { nr: number; x: number; y: number; titel: string }

const PINS: Pin[] = LESEORDNUNG.map((nr, i) => {
  const w = (i / LESEORDNUNG.length) * Math.PI * 2 - Math.PI / 2;
  const r = RADIUS - 7 + streu(nr) * 14;
  return {
    nr,
    x: MITTE + Math.cos(w) * r,
    y: MITTE + Math.sin(w) * r,
    titel: FEED.find((k) => k.nr === nr)?.titel ?? '',
  };
});

const marken = (nr: number) => new Set(FEED.find((k) => k.nr === nr)?.hashtags ?? []);

interface Kante { a: number; b: number; echt: boolean }

const KANTEN: Kante[] = (() => {
  const raus: Kante[] = [];
  for (let i = 0; i < PINS.length; i += 1) {
    const ma = marken(PINS[i]!.nr);
    for (let j = i + 1; j < PINS.length; j += 1) {
      const gemeinsam = [...marken(PINS[j]!.nr)].filter((h) => ma.has(h));
      if (gemeinsam.length === 0) continue;
      raus.push({ a: i, b: j, echt: gemeinsam.some((h) => h !== PLATTFORM) });
    }
  }
  return raus;
})();

const ECHTE = KANTEN.filter((k) => k.echt);
const HAELT = new Set(ECHTE.flatMap((k) => [k.a, k.b]));
const MIT_PLATTFORM = PINS.filter((p) => marken(p.nr).has(PLATTFORM)).length;

const linien = (kanten: Kante[], bis: number) => kanten
  .filter((k) => k.a < bis && k.b < bis)
  .map((k) => `M${PINS[k.a]!.x.toFixed(1)} ${PINS[k.a]!.y.toFixed(1)}`
    + `L${PINS[k.b]!.x.toFixed(1)} ${PINS[k.b]!.y.toFixed(1)}`)
  .join('');

export function FeedNetz(
  { gesehen, gross = false }: { gesehen: number; gross?: boolean }) {
  const [gezogen, setGezogen] = useState(false);
  const bis = Math.max(0, Math.min(gesehen, PINS.length));

  const blass = useMemo(() => linien(KANTEN.filter((k) => !k.echt), bis), [bis]);
  const hell = useMemo(() => linien(ECHTE, bis), [bis]);

  // Wer den Feed noch einmal durchläuft, bekommt ein ganzes Netz.
  useEffect(() => { if (bis < PINS.length) setGezogen(false); }, [bis]);

  return (
    <div className={`fw-geflecht${gross ? ' fw-geflecht-gross' : ''}${gezogen ? ' faellt' : ''}`}>
      <svg viewBox="0 0 200 200" aria-hidden="true">
        <path className="fw-geflecht-blass" d={blass} />
        <path className="fw-geflecht-hell" d={hell} />
        {PINS.slice(0, bis).map((p, i) => (
          <circle key={p.nr} cx={p.x} cy={p.y} r={gross ? 2.4 : 2}
            className={HAELT.has(i) ? 'fw-pin haelt' : 'fw-pin'}
            style={{ animationDelay: `${(streu(p.nr) * 420).toFixed(0)}ms` }} />
        ))}
      </svg>

      {gross && (
        <div className="fw-geflecht-wort">
          {!gezogen ? (
            <>
              <p>
                <b>{MIT_PLATTFORM} von {PINS.length}</b> dieser Beiträge tragen dasselbe
                Wort: <i>#{PLATTFORM}</i> – zeig das jedem. Das ist keine Verbindung,
                das ist eine Aufforderung.
              </p>
              <button type="button" onClick={() => setGezogen(true)}>
                Daran ziehen
              </button>
            </>
          ) : (
            <p>
              Übrig: <b>{ECHTE.length} {ECHTE.length === 1 ? 'Faden' : 'Fäden'}</b> zwischen{' '}
              {HAELT.size} Behauptungen – die, in denen zweimal dasselbe steht.
              Der Rest hing an einem Wort.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

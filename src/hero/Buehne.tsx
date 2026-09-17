'use client';

import { useEffect, useRef } from 'react';
import type { Budget } from '@/experience/typen';
// `buehne-bauen`, nicht `buehne`: Ein Dateiname, der sich von `Buehne.tsx`
// nur in der Gross-/Kleinschreibung unterscheidet, faellt unter Windows und
// macOS auf dasselbe Ziel. TypeScript bricht deshalb ab, und auf einem
// Linux-Server baut dieselbe Ablage anstandslos — der Fehler taucht dann
// erst auf dem Rechner auf, auf dem gearbeitet wird.
import { buehneStarten, type Buehnensteuerung } from './buehne-bauen';

/**
 * Die Buehne als React-Komponente — und zwar so wenig React wie moeglich.
 *
 * Die Komponente legt eine Leinwand an, uebergibt sie der Buehne und haelt
 * sich danach heraus. Sie hat keinen Zustand, der sich je Bild aendert, und
 * sie baut nichts neu auf, wenn gescrollt wird: Der Scrollwert geht ueber ein
 * Ref direkt in die Schleife.
 */

interface Eigenschaften {
  budget: Budget;
  /** Je Bild aufzurufen, damit der Regler misst. */
  beiBild(zeitstempel: number): void;
  /** Die Buehne traegt nicht — die Grenze zeigt das Standbild. */
  beiAusfall(grund: string): void;
  beiBereit(): void;
}

export function Buehne({ budget, beiBild, beiAusfall, beiBereit }: Eigenschaften) {
  const leinwand = useRef<HTMLCanvasElement>(null);
  const steuerung = useRef<Buehnensteuerung | null>(null);

  // Das Budget in einem Ref mitfuehren: Ein Stufenwechsel darf die Buehne
  // NICHT neu aufbauen — das wuerde das Modell erneut laden und mitten in
  // der Szene ein schwarzes Bild erzeugen.
  const budgetRef = useRef(budget);
  budgetRef.current = budget;

  useEffect(() => {
    steuerung.current?.budgetAnwenden(budget);
  }, [budget]);

  useEffect(() => {
    const element = leinwand.current;
    if (!element) return;

    let abgebaut = false;
    let schleife = 0;
    let vorher: number | undefined;

    void buehneStarten(element, budgetRef.current)
      .then((s) => {
        if (abgebaut) {
          s.abbauen();
          return;
        }
        steuerung.current = s;

        const messen = () => {
          const eltern = element.parentElement;
          s.groesseSetzen(
            eltern?.clientWidth ?? element.clientWidth,
            eltern?.clientHeight ?? element.clientHeight,
          );
        };
        messen();

        const beobachter =
          typeof ResizeObserver === 'function' ? new ResizeObserver(messen) : null;
        if (beobachter && element.parentElement) beobachter.observe(element.parentElement);

        /**
         * Der Scrollwert wird EINMAL je Bild gelesen, nicht je Ereignis.
         *
         * Die bisherige Fadenanimation der Seite las `document.body.scrollHeight`
         * bei jedem Scroll-Ereignis und rief `getPointAtLength()` — beides
         * erzwingt eine Layoutberechnung mitten im Scrollen. Hier liest die
         * Schleife nur `scrollY` und die Hoehe des eigenen Elements, und das
         * kostet nichts.
         */
        const bild = (t: number) => {
          if (abgebaut) return;
          const delta = vorher === undefined ? 16.667 : t - vorher;
          vorher = t;

          const kasten = element.parentElement?.getBoundingClientRect();
          if (kasten && kasten.height > 0) {
            s.fortschrittSetzen(-kasten.top / kasten.height);
          }

          s.schritt(delta, t);
          beiBild(t);
          schleife = requestAnimationFrame(bild);
        };
        schleife = requestAnimationFrame(bild);
        beiBereit();

        return () => beobachter?.disconnect();
      })
      .catch((f: unknown) => {
        if (!abgebaut) beiAusfall(f instanceof Error ? f.message : 'Buehne nicht startbar');
      });

    return () => {
      abgebaut = true;
      cancelAnimationFrame(schleife);
      steuerung.current?.abbauen();
      steuerung.current = null;
    };
    // Absichtlich leer: Die Buehne wird EINMAL aufgebaut. Budgetwechsel
    // laufen ueber den Effekt darueber, Scrollwerte ueber die Schleife.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <canvas ref={leinwand} className="hero-buehne" aria-hidden="true" />;
}

'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';

/**
 * Eine Seite wird nicht geladen – sie löst die vorherige ab.
 *
 * Der Browser kann das seit der View-Transition-Schnittstelle selbst: Er hält
 * den alten Stand als Bild fest, baut den neuen auf und blendet zwischen
 * beiden über – auf dem Compositor, ohne dass eine Bibliothek dafür geladen
 * wird. Was hier steht, ist nur die Klammer darum: Ein Klick auf einen
 * internen Verweis wird abgefangen, der Wechsel in `startViewTransition`
 * gelegt und erst aufgelöst, wenn die neue Adresse tatsächlich steht.
 *
 * Was bewusst nicht abgefangen wird: Verweise nach außen, mit Zielfenster,
 * mit Herunterladen, mit gedrückter Sondertaste, mit Sprungmarke auf
 * derselben Seite – und die mittlere Maustaste. Wer einen Verweis in einem
 * neuen Tab öffnen will, soll das können; ein Übergang, der das verhindert,
 * ist ein Fehler und kein Effekt.
 *
 * Browser ohne die Schnittstelle merken nichts: Dann läuft der Klick, wie er
 * immer gelaufen ist. Und wer „Bewegung reduzieren“ gesetzt hat, bekommt den
 * Wechsel ohne Blende – das steht in global.css, nicht hier, weil es eine
 * Frage der Darstellung ist.
 */
type MitUebergang = Document & {
  startViewTransition?: (f: () => void | Promise<void>) => { finished: Promise<void> };
};

export function Seitenwechsel() {
  const router = useRouter();
  const pfad = usePathname();
  const fertig = useRef<(() => void) | null>(null);

  // Die neue Seite steht: Der Übergang darf sich auflösen.
  useEffect(() => { fertig.current?.(); fertig.current = null; }, [pfad]);

  useEffect(() => {
    const doc = document as MitUebergang;
    if (typeof doc.startViewTransition !== 'function') return;

    const beiKlick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement | null)?.closest?.('a');
      if (!a || !(a instanceof HTMLAnchorElement)) return;
      if (a.target && a.target !== '_self') return;
      if (a.hasAttribute('download') || a.getAttribute('rel')?.includes('external')) return;
      if (a.origin !== location.origin) return;
      // Sprungmarken auf derselben Seite sind kein Seitenwechsel.
      if (a.pathname === location.pathname && a.hash) return;
      if (a.pathname === location.pathname && a.search === location.search) return;

      e.preventDefault();
      const ziel = a.pathname + a.search + a.hash;
      doc.startViewTransition!(() => new Promise<void>((aufloesen) => {
        // Falls der Wechsel hängt – abgebrochene Navigation, Fehlerseite –
        // löst sich der Übergang nach einer Sekunde von selbst auf. Ein
        // eingefrorenes Bild wäre schlimmer als ein harter Schnitt.
        const notausgang = window.setTimeout(aufloesen, 1000);
        fertig.current = () => { window.clearTimeout(notausgang); aufloesen(); };
        router.push(ziel);
      }));
    };

    document.addEventListener('click', beiKlick);
    return () => document.removeEventListener('click', beiKlick);
  }, [router]);

  return null;
}

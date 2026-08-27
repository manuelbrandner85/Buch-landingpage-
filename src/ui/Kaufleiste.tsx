'use client';

import { useEffect, useRef, useState } from 'react';
import type { Buch } from '@/data/gemeinsam/typen';

/**
 * Der Kaufweg, der auf dem Telefon nicht verschwindet.
 *
 * Auf der Buchseite steht der Kaufknopf oben neben dem Umschlag. Wer den
 * Klappentext liest, den Blick ins Buch anschaut, die Kapitelliste durchgeht –
 * und sich dann entscheidet – müsste dafür zurückscrollen. Das tut kaum
 * jemand; die Entscheidung verfällt einfach.
 *
 * Deshalb kommt der Weg mit: Sobald der eigentliche Kaufblock nach oben aus
 * dem Bild gescrollt ist, legt sich unten eine schmale Leiste an den Rand –
 * Titel, Ausgabe, Knopf. Sie erscheint nur auf schmalen Geräten (auf dem
 * Schreibtisch ist der Weg ohnehin nie weit), sie verschwindet wieder, sobald
 * der Kaufblock zurück im Bild ist, und sie taucht gar nicht erst auf, wenn es
 * nichts zu kaufen gibt.
 */
export function Kaufleiste(
  { buch, urteil }:
  { buch: Buch; urteil?: { schnitt: number; anzahl: number } | null },
) {
  const [sichtbar, setSichtbar] = useState(false);
  const weg = buch.kaufwege[0];
  const gemerkt = useRef(false);

  useEffect(() => {
    if (!weg) return;
    const block = document.querySelector('.buchkopf .wege');
    if (!block) return;

    const schmal = window.matchMedia('(max-width: 900px)');
    const beobachter = new IntersectionObserver(([e]) => {
      // Nur, wenn der Block oben hinausgescrollt ist – nicht, wenn er noch
      // unter dem Bild liegt und der Leser gleich von selbst hinkommt.
      const raus = !e?.isIntersecting && (e?.boundingClientRect.top ?? 0) < 0;
      setSichtbar(schmal.matches && raus);
    }, { threshold: 0 });
    beobachter.observe(block);

    const beiWechsel = () => setSichtbar((war) => war && schmal.matches);
    schmal.addEventListener('change', beiWechsel);
    return () => {
      beobachter.disconnect();
      schmal.removeEventListener('change', beiWechsel);
    };
  }, [weg]);

  useEffect(() => {
    // Die Leiste liegt über dem Text. Damit sie den letzten Absatz nicht
    // verdeckt, bekommt die Seite unten so viel Luft, wie die Leiste hoch ist.
    document.body.classList.toggle('mit-kaufleiste', sichtbar);
    if (sichtbar) gemerkt.current = true;
    return () => { document.body.classList.remove('mit-kaufleiste'); };
  }, [sichtbar]);

  if (!weg) return null;

  return (
    <div className={`kaufleiste${sichtbar ? ' da' : ''}`} aria-hidden={!sichtbar}>
      <span className="kaufleiste-text">
        <b>{buch.titel}</b>
        <em>
          {weg.form}{weg.haendler ? ` · ${weg.haendler}` : ''}
          {urteil && (
            <>
              {' · '}
              <span aria-hidden="true">★ </span>
              {urteil.schnitt.toFixed(1).replace('.', ',')}
              <span className="nur-lesen">
                {' '}von 5 Sternen aus {urteil.anzahl}
                {urteil.anzahl === 1 ? ' Bewertung' : ' Bewertungen'}
              </span>
            </>
          )}
        </em>
      </span>
      <a className="kaufen" href={weg.url} target="_blank" rel="noopener noreferrer"
        tabIndex={sichtbar ? 0 : -1}>
        Kaufen
      </a>
    </div>
  );
}

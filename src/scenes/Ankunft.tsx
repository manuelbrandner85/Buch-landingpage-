'use client';

import type { Szene } from '@/data/gemeinsam/typen';
import { useWeltFortschritt } from '@/world/FortschrittKontext';

/**
 * Dunkelheit, ein Lichtpunkt, ein Satz.
 * Wer schon einmal hier war, bekommt zusätzlich einen leisen Ausgang:
 * die Welt direkt betreten, ohne den Einstieg erneut zu durchlaufen.
 */
export function Ankunft({ szene }: { szene: Szene }) {
  const fortschritt = useWeltFortschritt();

  return (
    <section id={szene.id} className="ankunft">
      <div className="funke" aria-hidden="true" />
      <p>{szene.fliesstext}</p>
      {fortschritt?.warSchonDa ? (
        <p className="hinweis wiederkehr">
          <a href="#karte">Zur Welt</a>
          <span aria-hidden="true"> · </span>
          <a href="#ankunft" onClick={(e) => { e.preventDefault(); }}>oder weiterscrollen</a>
        </p>
      ) : (
        <p className="hinweis">Scrollen</p>
      )}
    </section>
  );
}

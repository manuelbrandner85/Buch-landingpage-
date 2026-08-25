'use client';

import type { Szene } from '@/data/gemeinsam/typen';
import { useWeltFortschritt } from '@/world/FortschrittKontext';
import { TRENDONIX } from '@/world/registry';
import { BASIS_PFAD } from '@/world/bilder';
import { wegHaus } from '@/world/wege';

/**
 * Die Schwelle: Dunkelheit, ein Lichtpunkt, ein Name.
 *
 * Sie trägt jetzt die Überschrift der Welt – vorher lag die einzige `h1` der
 * Seite unsichtbar in der Coverszene, und die ist fort. Eine Seite ohne
 * sichtbare Hauptüberschrift ist für Suchmaschinen und für Screenreader eine
 * Seite ohne Titel.
 *
 * Wer schon einmal hier war, bekommt zusätzlich einen leisen Ausgang: die Welt
 * direkt betreten, ohne den Einstieg erneut zu durchlaufen.
 */
export function Ankunft({ szene }: { szene: Szene }) {
  const fortschritt = useWeltFortschritt();

  return (
    <section id={szene.id} className="ankunft">
      <div className="funke" aria-hidden="true" />
      <a className="hausmarke" href={wegHaus()}>
        <img src={`${BASIS_PFAD}/marke/trendonix-klein.png`}
          alt={TRENDONIX.name} width={210} height={210}
          fetchPriority="high" decoding="async" />
      </a>
      {szene.titel && <h1>{szene.titel}</h1>}
      {szene.unterzeile && <p className="unterzeile">{szene.unterzeile}</p>}
      <p className="fliess">{szene.fliesstext}</p>
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

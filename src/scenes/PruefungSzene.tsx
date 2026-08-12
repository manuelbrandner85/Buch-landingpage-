'use client';

import { useState } from 'react';
import type { Szene } from '@/data/gemeinsam/typen';
import { PRUEFUNG } from '@/data/band-1/interaktionen';
import { Quelle } from '@/ui/Quelle';

/**
 * Die Prüfung (S. 173): die fünf Fragen von Seite 168, angewendet.
 * Der Nutzer prüft selbst mit, Frage für Frage – nicht um eine Antwort zu
 * erzwingen, sondern um sichtbar zu machen, wie das Ergebnis zustande kommt.
 */
export function PruefungSzene({ szene }: { szene: Szene }) {
  const [offen, setOffen] = useState(0);
  const fertig = offen >= PRUEFUNG.fragen.length;

  return (
    <section id={szene.id} className="papier interaktion">
      <div>
        <p className="eyebrow">{szene.unterkapitel} · Am Rand des Belegten</p>
        <h2>{szene.titel}</h2>
        <p className="unterzeile">{szene.unterzeile}</p>

        <ol className="pruefung">
          {PRUEFUNG.fragen.map((f, i) => (
            <li key={f.frage} className={i < offen ? 'geprueft' : ''}>
              <span className="pruef-frage">{f.frage}</span>
              <span className="pruef-befund">{i < offen ? f.befund : '—'}</span>
            </li>
          ))}
        </ol>

        {!fertig ? (
          <button type="button" className="pruef-knopf" onClick={() => setOffen((o) => o + 1)}>
            {offen === 0 ? 'Prüfung beginnen' : `Frage ${offen + 1} prüfen`}
          </button>
        ) : (
          <div className="pruef-ergebnis" aria-live="polite">
            <div className="zahlen">
              {PRUEFUNG.zahlen.map((z) => (
                <div key={z.label} className="zahl">{z.wert}<span>{z.label}</span></div>
              ))}
            </div>
            <p className="fliess">{PRUEFUNG.ergebnis}</p>
            <p className="kernsatz">{szene.fliesstext}</p>
          </div>
        )}

        <Quelle text={szene.quelle} seite={szene.buchseite} />
      </div>
    </section>
  );
}

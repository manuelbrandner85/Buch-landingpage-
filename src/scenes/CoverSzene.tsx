import type React from 'react';
import type { Szene } from '@/data/gemeinsam/typen';

/** Das Cover erwacht: vier Tiefenebenen, Funken, der Faden setzt an. */
export function CoverSzene({ szene }: { szene: Szene }) {
  return (
    <section id={szene.id} className="szene" data-abschnitt={szene.id}
      style={{ '--hoehe': szene.hoehe ?? 180 } as React.CSSProperties}>
      <h1 className="nur-lesen">
        Die unsichtbaren Fäden – Band 1: Ursprung und Ordnung
      </h1>
    </section>
  );
}

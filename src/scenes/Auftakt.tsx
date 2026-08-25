import type React from 'react';
import type { Szene } from '@/data/gemeinsam/typen';
import { kapitelNach, bandNummer } from '@/world/registry';
import { Quelle } from '@/ui/Quelle';

/** Kapitelauftakt mit dem schwarzen Band aus dem Buch. */
export function Auftakt({ szene }: { szene: Szene }) {
  const kapitel = kapitelNach(szene.kapitelId, szene.bandId);
  return (
    <section id={szene.id} className="szene" data-abschnitt={szene.id}
      data-kapitel={szene.kapitelId} data-band={szene.bandId} style={{ '--hoehe': szene.hoehe ?? 150 } as React.CSSProperties}>
      <div className="block">
        <div className="kapitelband">
          <div className="ziffer" aria-hidden="true">{szene.kapitelId}</div>
          <div>
            <p className="eyebrow">Kapitel {szene.kapitelId}</p>
            <h2 data-auf>
              {(szene.titel ?? kapitel?.titel ?? '').split('\n').map((z, i) => (
                <span key={i}>{z}<br /></span>
              ))}
            </h2>
            <p className="unterzeile" data-auf>{szene.unterzeile ?? kapitel?.unterzeile}</p>
            <Quelle text={szene.quelle} seite={szene.buchseite} band={bandNummer(szene.bandId)} />
          </div>
        </div>
      </div>
    </section>
  );
}

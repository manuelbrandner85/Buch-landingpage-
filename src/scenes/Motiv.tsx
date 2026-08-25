import type React from 'react';
import type { Szene } from '@/data/gemeinsam/typen';
import { Quelle } from '@/ui/Quelle';
import { bandNummer } from '@/world/registry';
import { Begriffstext } from '@/ui/Begriffstext';

/**
 * Die Analyseseite als Szene: Kennzahlen, Marginalspalte, Herkunftsbadge
 * und Evidenzstufe – genau die Bauteile, die auch die Buchseite trägt.
 */
export function Motiv({ szene }: { szene: Szene }) {
  return (
    <section id={szene.id} className="szene" data-abschnitt={szene.id}
      data-kapitel={szene.kapitelId} data-motiv="1"
      style={{ '--hoehe': szene.hoehe ?? 200 } as React.CSSProperties}>
      <div className="block">
        <div className="raster">
          <div className="text">
            <p className="eyebrow">{szene.unterkapitel} · {szene.eyebrow}</p>
            <h2 data-auf>{szene.titel}</h2>
            <p className="unterzeile" data-auf>{szene.unterzeile}</p>
            {szene.fliesstext && (
              <div data-auf><Begriffstext text={szene.fliesstext} /></div>
            )}

            {szene.zahlen && (
              <div className="zahlen">
                {szene.zahlen.map((z) => (
                  <div key={z.wert} className="zahl" data-evidenz={z.evidenz} data-auf>
                    {z.wert}<span>{z.label}</span>
                  </div>
                ))}
              </div>
            )}
            <Quelle text={szene.quelle} seite={szene.buchseite} band={bandNummer(szene.bandId)} />
          </div>

          {szene.randnotizen && (
            <div className="marginal-spalte">
              {/* Der Herkunftsbadge steht außerhalb der Liste: eine Definitionsliste
                  darf nur Begriff-und-Erklärung-Paare enthalten. */}
              {szene.badge && <p className="badge">{szene.badge}</p>}
              <dl className="marginal">
                {szene.randnotizen.map((r) => (
                  <div key={r.begriff} data-evidenz={r.evidenz}>
                    <dt>{r.begriff}</dt><dd>{r.text}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

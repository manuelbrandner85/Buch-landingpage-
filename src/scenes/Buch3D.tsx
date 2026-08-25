import type { Asset, BandId } from '@/data/gemeinsam/typen';
import { bildQuelle, ordner } from '@/world/bilder';

/**
 * Ein gebundener Band im Raum.
 *
 * Kein Bild eines Buches, sondern ein Körper: sechs Flächen, die aus dem
 * gedruckten Umschlag stammen — Vorderseite, Rücken und Rückseite sind aus
 * derselben Druckdatei freigestellt, in der sie beim Buchbinder liegen. Der
 * Schnitt ist Papier, oben und unten der Deckelrand.
 *
 * Gedreht wird nicht auf Klick, sondern beim Lesen: `animation-timeline: view()`
 * bindet die Drehung an die Scrollstrecke, sodass die Kamera beim Vorbeiziehen
 * um den Band herumgeht — Vorderseite, Rücken, Rückseite. Trägt der Browser
 * das nicht, bleibt der Band in seiner Ausgangsdrehung stehen und ist immer
 * noch ein Körper. Bei „Bewegung reduzieren" dreht er sich nicht.
 *
 * Rücken und Rückseite sind Flächen dieses Körpers, keine eigenen Bildwerke:
 * Sie tragen deshalb keinen Alternativtext, sondern hängen am Umschlag, dessen
 * Beschreibung für den ganzen Band gilt.
 */
/** Rückenstärke im Verhältnis zur Umschlagbreite – aus der Druckdatei gemessen. */
const RUECKEN: Record<string, number> = { 'band-1': 0.0775, 'band-2': 0.0808 };
export const rueckenstaerke = (band: BandId) => RUECKEN[band] ?? 0.078;

export function Buch3D({ cover, band, tiefe = rueckenstaerke(band) }:
  { cover: Asset; band: BandId; tiefe?: number }) {
  const basis = cover.datei;
  const flaeche = (teil: string) => ordner(`${basis}-${teil}.webp`, band);

  return (
    <div className="buch3d" style={{ ['--tiefe' as string]: tiefe }}>
      <div className="korpus">
        <div className="flaeche vorn">
          <img src={bildQuelle(cover, 1000)} alt={cover.alt}
            width={cover.breite} height={cover.hoehe} loading="lazy" decoding="async" />
          <span className="lack" aria-hidden="true" />
          <span className="licht" aria-hidden="true" />
        </div>
        <div className="flaeche hinten">
          <img src={flaeche('rueckseite')} alt="" aria-hidden="true"
            loading="lazy" decoding="async" />
          <span className="lack" aria-hidden="true" />
          <span className="licht" aria-hidden="true" />
        </div>
        <div className="flaeche ruecken">
          <img src={flaeche('ruecken')} alt="" aria-hidden="true"
            loading="lazy" decoding="async" />
          <span className="lack" aria-hidden="true" />
          <span className="licht" aria-hidden="true" />
        </div>
        <div className="flaeche schnitt" aria-hidden="true"><span className="licht" /></div>
        <div className="flaeche kopfschnitt" aria-hidden="true"><span className="licht" /></div>
        <div className="flaeche fussschnitt" aria-hidden="true"><span className="licht" /></div>
      </div>
      <div className="standschatten" aria-hidden="true" />
    </div>
  );
}

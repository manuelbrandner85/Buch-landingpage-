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
const RUECKEN: Record<string, number> = {
  'band-1': 0.0775, 'band-2': 0.0808, 'band-3': 0.0806,
  zufall: 0.1712,
};
export const rueckenstaerke = (band: BandId) => RUECKEN[band] ?? 0.078;

/**
 * Der Band bekommt seine Flächen in der Größe, in der er wirklich steht.
 *
 * Bis zum 31.08.2026 holte jeder Band seinen Umschlag in 1000 Pixeln Breite,
 * überall gleich. Im Empfang ist er 176 Pixel breit, im Regal 208 — dort wurde
 * also das Vierfache der gebrauchten Fläche geladen und wieder weggeworfen.
 * Gemessen auf dem Telefon: rund 46 KB je Band, siebenmal auf der Startseite.
 */
export function Buch3D({
  cover, band, tiefe = rueckenstaerke(band), breite = 368, rundum = true, marke,
}: {
  cover: Asset; band: BandId; tiefe?: number;
  /**
   * Name für den Seitenwechsel — der Umschlag wandert dann mit.
   *
   * Wer im Regal auf einen Band tippt, sieht ihn nicht verschwinden und einen
   * anderen erscheinen: Derselbe Umschlag wandert an seine neue Stelle und
   * wird dabei größer. Der Browser macht das allein, sobald beide Seiten
   * dasselbe Element bei demselben Namen nennen.
   *
   * Der Name muss auf einer Seite einmalig sein — steht er zweimal, lässt der
   * Browser den ganzen Übergang aus und schreibt einen Fehler in die Konsole.
   * Deshalb trägt ihn nur, wer auch wirklich zur Buchseite führt: die Karte im
   * Regal und die Buchseite selbst. Die kleinen Bände in der Reihenleiste
   * führen in die Welt und bleiben ohne.
   */
  marke?: string;
  /** Angezeigte Breite in CSS-Pixeln. Bestimmt, welche Bildstufe geladen wird. */
  breite?: number;
  /**
   * Dreht sich der Band an dieser Stelle bis auf die Rückseite?
   *
   * Wo er das nicht tut — im Empfang wiegt er nur zwischen 9 und 31 Grad —,
   * ist die Rückseite ein Bild, das niemand je zu sehen bekommt. Sie wiegt
   * 78 bis 87 KB je Band. Die Fläche bleibt, sie ist dann eine dunkle Platte;
   * der Körper ist genauso geschlossen, nur ohne die Ladung.
   */
  rundum?: boolean;
}) {
  const basis = cover.datei;
  // Rücken und Rückseite lagen als WebP und als AVIF nebeneinander, geladen
  // wurde immer das WebP — bei der Rückseite 78 statt 61 KB, bei einem Rücken
  // 22 statt 10. Die Vorderseite kommt seit jeher als AVIF; für die übrigen
  // Flächen gilt derselbe Browserstand, und ein eigener Rückfallweg für sie
  // wäre ein Fallnetz für einen Fall, den es beim Umschlag schon nicht gibt.
  const flaeche = (teil: string) => ordner(`${basis}-${teil}.avif`, band);

  // Zwei Hüllen um den Band. Sie sind normalerweise nicht da – `display:contents`
  // macht sie für das Layout unsichtbar. Erst wo der Band sich beim Scrollen
  // ganz um sich selbst drehen soll, bekommen sie eine Aufgabe: `buchlauf` ist
  // die Strecke, über die gedreht wird, `buchhalt` hält den Band dabei im Bild
  // stehen. Ohne diese Trennung ginge beides nicht zusammen: Ein Element, das
  // klebt, bewegt sich zum Fenster nicht mehr – und eine Drehung, die an der
  // eigenen Lage im Fenster hängt, bliebe damit stehen.
  return (
    <div className="buchlauf">
    <div className="buchhalt">
    <div className="buch3d" style={{ ['--tiefe' as string]: tiefe }}>
      <div className="korpus">
        <div className="flaeche vorn">
          <img src={bildQuelle(cover, breite * 2)} alt={cover.alt}
            width={cover.breite} height={cover.hoehe} loading="lazy" decoding="async"
            style={marke ? { viewTransitionName: marke } : undefined} />
          <span className="lack" aria-hidden="true" />
          <span className="licht" aria-hidden="true" />
        </div>
        <div className="flaeche hinten">
          {rundum && (
            <img src={flaeche('rueckseite')} alt="" aria-hidden="true"
              loading="lazy" decoding="async" />
          )}
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
    </div>
    </div>
  );
}

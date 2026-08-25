import Image from 'next/image';
import { BAENDE, assetNach } from '@/world/registry';
import { bildQuelle } from '@/world/bilder';
import { Quelle } from '@/ui/Quelle';

/**
 * Der Buchbereich ist Teil der Welt, kein Shop.
 * Amazon ist der externe Verkaufsort; die URLs bleiben Platzhalter,
 * bis die echten Produktseiten vorliegen.
 */
export function Buecher() {
  const [band1, ...spaeter] = BAENDE.map((b) => b.buch);
  if (!band1) return null;
  const cover = assetNach(band1.coverAsset);

  return (
    <>
      <section id="buecher" className="buecher">
        <div className="buch-raster">
          {cover && (
            <Image className="buch-cover" src={bildQuelle(cover, 640)}
              alt={cover.alt} width={cover.breite} height={cover.hoehe} sizes="(max-width: 900px) 60vw, 17rem" />
          )}
          <div>
            <p className="eyebrow">Band {band1.nummer} · {band1.status}</p>
            <h2>{band1.titel}</h2>
            <p className="unterzeile">{band1.unterzeile}</p>
            <p className="fliess">{band1.klappentext}</p>
            <a className="kaufen" href={band1.amazonUrl} target="_blank" rel="noopener noreferrer">
              Band {band1.nummer} auf Amazon ansehen
            </a>
            <Quelle label="Hinweis" text="Platzhalter, bis die Amazon-Produktseite vorliegt." />
          </div>
        </div>

        <div className="spaeter">
          {spaeter.map((b) => (
            <div key={b.id}>
              <p className="eyebrow">Band {b.nummer} · {b.status}</p>
              {b.status === 'erschienen' ? (
                <>
                  <h3>{b.titel}</h3>
                  {b.unterzeile && <p className="unterzeile">{b.unterzeile}</p>}
                  <p>{b.klappentext}</p>
                </>
              ) : (
                // Ein Band, der noch nicht erschienen ist, wird hier auch nicht
                // angedeutet – weder mit Titel noch mit Inhalt.
                <p>Der Faden läuft weiter. Dieser Bereich der Welt öffnet sich mit dem Erscheinen.</p>
              )}
            </div>
          ))}
        </div>
      </section>
      <footer>
        Manuel &amp; Uwe · Die Welt der drei Bände · Alle Motive stammen aus dem Buch
        und wurden eigens dafür erzeugt.
      </footer>
    </>
  );
}

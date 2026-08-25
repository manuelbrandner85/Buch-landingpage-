import Image from 'next/image';
import type { Buch } from '@/data/gemeinsam/typen';
import { BAENDE, WELT, assetNach, szeneZuKapitel } from '@/world/registry';
import { bildQuelle } from '@/world/bilder';

/**
 * Die drei Welten — und der Weg zum Buch.
 *
 * Der Bereich ist kein Shop, aber er verschweigt auch nicht, dass es die Bände
 * zu kaufen gibt: Jedes Tor führt an zwei Stellen weiter, in die Welt und zum
 * Buch. Der Kaufweg steht dabei zuerst.
 *
 * Ein Band, der noch nicht erschienen ist, bekommt ein versiegeltes Tor —
 * ohne Titel, ohne Klappentext, ohne Umschlag. Er liegt vollständig in den
 * Daten; sichtbar wird er, sobald `buch.status` auf „erschienen“ steht.
 */

/** Solange die Produktseite ein Platzhalter ist, gibt es nichts zu verlinken. */
const istPlatzhalter = (url: string) => url.startsWith('AMAZON_');

function Tor({ buch }: { buch: Buch }) {
  const offen = buch.status === 'erschienen';
  const cover = assetNach(buch.coverAsset);
  const ziel = szeneZuKapitel(WELT[buch.id].kapitel[0]?.id);

  if (!offen) {
    return (
      <div className="tor versiegelt">
        <p className="band-nr">Band {buch.nummer}</p>
        <div className="rahmen">
          <div className="platte"><span className="siegel">Noch verschlossen</span></div>
        </div>
        <div className="abglanz" aria-hidden="true" />
        <h3>Der dritte Band</h3>
        <p className="klappe">
          Der Faden läuft weiter. Dieser Teil der Welt öffnet sich mit dem Erscheinen.
        </p>
      </div>
    );
  }

  return (
    <div className="tor">
      <p className="band-nr">Band {buch.nummer} · {buch.seiten} Seiten</p>
      <div className="rahmen">
        <div className="platte">
          {cover && (
            <Image src={bildQuelle(cover, 1000)} alt={cover.alt}
              width={cover.breite} height={cover.hoehe}
              sizes="(max-width: 900px) 60vw, 17rem" />
          )}
        </div>
      </div>
      <div className="abglanz" aria-hidden="true">
        {cover && (
          <Image src={bildQuelle(cover, 640)} alt="" aria-hidden="true"
            width={cover.breite} height={cover.hoehe} sizes="17rem" />
        )}
      </div>
      <h3>{buch.titel}</h3>
      {buch.unterzeile && <p className="unterzeile">{buch.unterzeile}</p>}
      <p className="klappe">{buch.klappentext}</p>
      <div className="wege">
        {istPlatzhalter(buch.amazonUrl)
          ? <span className="kaufen wartet">Erscheint in Kürze</span>
          : <a className="kaufen" href={buch.amazonUrl} target="_blank" rel="noopener noreferrer">
              Band {buch.nummer} kaufen
            </a>}
        {ziel && <a className="eintauchen" href={`#${ziel.id}`}>In die Welt</a>}
      </div>
    </div>
  );
}

export function Buecher() {
  const buecher = BAENDE.map((b) => b.buch);
  const wartend = buecher.filter((b) => b.status === 'erschienen' && istPlatzhalter(b.amazonUrl));

  return (
    <>
      <section id="buecher" className="buecher">
        <div className="kopf">
          <p className="eyebrow">Die Reihe</p>
          <h2>Drei Bände, eine Welt</h2>
          <p>
            Jeder Band ist ein eigener Abschnitt derselben Welt und lässt sich einzeln
            begehen. Zu jeder Aussage weist er aus, wie gut sie belegt ist — von
            gesichertem Befund bis zur offenen Frage.
          </p>
        </div>

        <div className="tore">
          {buecher.map((b) => <Tor key={b.id} buch={b} />)}
        </div>

        {wartend.length > 0 && (
          <p className="hinweis-zeile">
            Die Produktseiten {wartend.length === 1 ? 'zu diesem Band' : 'zu diesen Bänden'} sind
            noch nicht freigeschaltet. Hier steht ein Platzhalter statt eines Links —
            erfundene Adressen gibt es in dieser Welt nicht.
          </p>
        )}
      </section>
      <footer>
        Manuel &amp; Uwe · Die Welt der drei Bände · Alle Motive stammen aus dem Buch
        und wurden eigens dafür erzeugt.
      </footer>
    </>
  );
}

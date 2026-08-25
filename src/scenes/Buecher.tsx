import type { Buch, Szene } from '@/data/gemeinsam/typen';
import { BAENDE, WELT, assetNach, szeneZuKapitel } from '@/world/registry';
import { Buch3D } from './Buch3D';

/** Rückenstärke im Verhältnis zur Umschlagbreite – aus der Druckdatei gemessen. */
const RUECKEN: Record<string, number> = { 'band-1': 0.0775, 'band-2': 0.0808 };

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

/** Was auf dem Knopf steht, hängt am Zustand des Bandes – nicht am Wunsch. */
function Kaufweg({ buch }: { buch: Buch }) {
  if (buch.status === 'erscheint') {
    return <span className="kaufen wartet">Erscheint in Kürze</span>;
  }
  if (istPlatzhalter(buch.amazonUrl)) {
    return <span className="kaufen wartet">Produktseite folgt</span>;
  }
  return (
    <a className="kaufen" href={buch.amazonUrl} target="_blank" rel="noopener noreferrer">
      Band {buch.nummer} kaufen
    </a>
  );
}

function Tor({ buch }: { buch: Buch }) {
  // Offen ist alles, was nicht mehr in Arbeit ist – auch ein Band, der erst
  // erscheint. Seine Welt ist begehbar, nur zu kaufen gibt es ihn noch nicht.
  const offen = buch.status !== 'in Arbeit';
  const cover = assetNach(buch.coverAsset);
  const ziel = szeneZuKapitel(WELT[buch.id].kapitel[0]?.id);

  if (!offen) {
    return (
      <div className="tor versiegelt">
        <p className="band-nr">Band {buch.nummer}</p>
        <div className="siegelplatte"><span className="siegel">Noch verschlossen</span></div>
        <h3>Der dritte Band</h3>
        <p className="klappe">
          Der Faden läuft weiter. Dieser Teil der Welt öffnet sich mit dem Erscheinen.
        </p>
      </div>
    );
  }

  return (
    <div className="tor">
      <p className="band-nr">
        Band {buch.nummer} · {buch.seiten} Seiten
        {buch.status === 'erscheint' && <> · erscheint</>}
      </p>
      {cover && <Buch3D cover={cover} band={buch.id} tiefe={RUECKEN[buch.id] ?? 0.078} />}
      <h3>{buch.titel}</h3>
      {buch.unterzeile && <p className="unterzeile">{buch.unterzeile}</p>}
      <p className="klappe">{buch.klappentext}</p>
      <div className="wege">
        <Kaufweg buch={buch} />
        {ziel && <a className="eintauchen" href={`#${ziel.id}`}>In die Welt</a>}
      </div>
    </div>
  );
}

export function Buecher({ szene }: { szene?: Szene }) {
  const buecher = BAENDE.map((b) => b.buch);
  const wartend = buecher.filter((b) => b.status === 'erschienen' && istPlatzhalter(b.amazonUrl));
  // Dieselben Tore, zwei Auftritte: am Anfang die Wahl, am Ende der Abschluss.
  const amAnfang = szene?.id === 'welten';

  return (
    <>
      <section id={amAnfang ? 'welten' : 'buecher'}
        className={amAnfang ? 'buecher tor-eingang' : 'buecher'}>
        <div className="kopf">
          <p className="eyebrow">{amAnfang ? 'Drei Welten' : 'Die Reihe'}</p>
          <h2>{amAnfang ? 'Wo willst du hinein?' : 'Drei Bände, eine Welt'}</h2>
          <p>
            {amAnfang
              ? 'Jeder Band ist eine eigene Welt und lässt sich einzeln betreten. Wähle einen – oder scrolle weiter und geh alle drei der Reihe nach.'
              : 'Jeder Band ist ein eigener Abschnitt derselben Welt. Zu jeder Aussage weist er aus, wie gut sie belegt ist — von gesichertem Befund bis zur offenen Frage.'}
          </p>
        </div>

        <div className="tore">
          {buecher.map((b) => <Tor key={b.id} buch={b} />)}
        </div>

        {!amAnfang && wartend.length > 0 && (
          <p className="hinweis-zeile">
            Die Produktseite {wartend.length === 1 ? 'zu diesem Band ist' : 'zu diesen Bänden sind'}
            {' '}noch nicht eingetragen. Hier steht ein Platzhalter statt eines Links —
            erfundene Adressen gibt es in dieser Welt nicht.
          </p>
        )}
        {amAnfang && (
          <p className="hinweis-zeile weiter">Oder weiter nach unten — der Faden führt von selbst.</p>
        )}
      </section>
      {!amAnfang && (
        <footer>
          Manuel &amp; Uwe · Trendonix · Die Welt der drei Bände · Alle Motive stammen
          aus dem Buch und wurden eigens dafür erzeugt.
        </footer>
      )}
    </>
  );
}

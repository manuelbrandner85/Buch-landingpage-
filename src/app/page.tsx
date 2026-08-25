import type { Metadata } from 'next';
import type { Buch, Reihe } from '@/data/gemeinsam/typen';
import {
  LEITBUCH, OEFFENTLICHE_REIHEN, TRENDONIX,
  assetNach, oeffentlicheBaendeVon, reiheZuBand,
} from '@/world/registry';
import { bildQuelle, ordner } from '@/world/bilder';
import { wegBuch, wegImpressum, wegReihe, wegUeber } from '@/world/wege';
import { Buch3D } from '@/scenes/Buch3D';
import { Kaufwege } from '@/scenes/Buecher';
import { Hintergrundvideo } from '@/ui/Hintergrundvideo';

/**
 * Das Haus.
 *
 * Wer hier ankommt, kommt meist von einem kurzen Video und hat zehn Sekunden
 * Geduld. Deshalb steht oben kein Verzeichnis, sondern das Buch, das es zu
 * kaufen gibt – mit dem Kaufweg daneben und der Tür in seine Welt darunter.
 * Erst danach kommt, was das Haus sonst noch führt.
 *
 * Die Seite lädt bewusst nicht die Kinoebene: Sie ist der Vorraum, nicht die
 * Welt. Ein Standbild, ein Video im Hintergrund, ein Buchkörper – mehr braucht
 * der erste Eindruck nicht, und er steht dadurch sofort.
 */
export const metadata: Metadata = {
  title: `${TRENDONIX.name} – ${TRENDONIX.versprechen}`,
  description: TRENDONIX.arbeitsweise,
  openGraph: {
    type: 'website',
    title: `${TRENDONIX.name} – ${TRENDONIX.versprechen}`,
    description: TRENDONIX.arbeitsweise,
  },
};

function Weltentor({ reihe }: { reihe: Reihe }) {
  const baende = oeffentlicheBaendeVon(reihe);
  const motiv = assetNach(reihe.hausmotiv);
  return (
    <a className="weltentor" href={wegReihe(reihe.id)}
      style={{ ['--signatur' as string]: reihe.signatur }}>
      {motiv && (
        <img src={bildQuelle(motiv, 1000)} alt="" aria-hidden="true"
          loading="lazy" decoding="async" />
      )}
      <span className="tortext">
        <b>{reihe.titel}</b>
        {reihe.unterzeile && <i>{reihe.unterzeile}</i>}
        <em>{baende.length} {baende.length === 1 ? 'Band' : 'Bände'} · begehbar</em>
      </span>
      <span className="toraktion">Welt betreten</span>
    </a>
  );
}

function Buchkarte({ buch }: { buch: Buch }) {
  const cover = assetNach(buch.coverAsset);
  const reihe = reiheZuBand(buch.id);
  return (
    <article className="buchkarte">
      {cover && <Buch3D cover={cover} band={buch.id} />}
      <div className="text">
        <p className="band-nr">
          {reihe?.titel} · Band {buch.nummer}
          {buch.seiten ? ` · ${buch.seiten} Seiten` : ''}
        </p>
        <h3><a href={wegBuch(buch.id)}>{buch.titel}</a></h3>
        {buch.unterzeile && <p className="unterzeile">{buch.unterzeile}</p>}
        <p className="klappe">{buch.klappentext}</p>
        <div className="wege">
          <Kaufwege buch={buch} />
          {reihe && <a className="eintauchen" href={wegReihe(reihe.id)}>In die Welt</a>}
        </div>
      </div>
    </article>
  );
}

export default function Haus() {
  const leitreihe = reiheZuBand(LEITBUCH?.id);
  const leitcover = assetNach(LEITBUCH?.coverAsset);
  const motiv = assetNach(leitreihe?.hausmotiv);
  const buecher = OEFFENTLICHE_REIHEN
    .flatMap((r) => oeffentlicheBaendeVon(r))
    .map((b) => b.buch);

  const strukturierteDaten = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: TRENDONIX.name,
    description: TRENDONIX.arbeitsweise,
    member: TRENDONIX.autoren.map((n) => ({ '@type': 'Person', name: n })),
  };

  return (
    <main className="haus">
      <section className="hausbild">
        {motiv && (
          <Hintergrundvideo
            bild={bildQuelle(motiv, 1920)}
            video={ordner(`${motiv.datei}-motion.mp4`, motiv.bandId ?? 'band-1')}
            videoKlein={ordner(`${motiv.datei}-motion-klein.mp4`, motiv.bandId ?? 'band-1')}
            alt={motiv.alt}
          />
        )}
        <div className="hausinhalt">
          <p className="marke">{TRENDONIX.name}</p>
          <h1>{TRENDONIX.versprechen}</h1>
          {LEITBUCH && (
            <div className="leitbuch">
              {leitcover && <Buch3D cover={leitcover} band={LEITBUCH.id} />}
              <div className="leittext">
                <p className="eyebrow">
                  {leitreihe?.titel} · Band {LEITBUCH.nummer}
                  {LEITBUCH.status === 'erschienen' ? ' · im Handel' : ''}
                </p>
                <h2>{LEITBUCH.titel}</h2>
                {LEITBUCH.unterzeile && <p className="unterzeile">{LEITBUCH.unterzeile}</p>}
                <p className="klappe">{LEITBUCH.klappentext}</p>
                <div className="wege">
                  <Kaufwege buch={LEITBUCH} />
                  {leitreihe && (
                    <a className="eintauchen" href={wegReihe(leitreihe.id)}>
                      Welt betreten
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="welten" id="welten">
        <div className="kopf">
          <p className="eyebrow">Die Welten</p>
          <h2>Jedes Buch ist ein Ort, den man betreten kann</h2>
          <p>
            Eine Welt ist keine Leseprobe. Sie ist der Band, durchgeschritten:
            Motive in Bewegung, Kapitel als Stationen, zu jeder Aussage die
            Angabe, wie gut sie belegt ist.
          </p>
        </div>
        <div className="weltentore">
          {OEFFENTLICHE_REIHEN.map((r) => <Weltentor key={r.id} reihe={r} />)}
        </div>
      </section>

      <section className="buecherwand" id="buecher">
        <div className="kopf">
          <p className="eyebrow">Alle Bücher</p>
          <h2>Im Regal von {TRENDONIX.name}</h2>
        </div>
        {buecher.map((b) => <Buchkarte key={b.id} buch={b} />)}
      </section>

      <section className="arbeitsweise">
        <div className="kopf">
          <p className="eyebrow">Wie hier gearbeitet wird</p>
          <h2>Behauptet wird nichts, was sich nicht prüfen lässt</h2>
          <p>{TRENDONIX.arbeitsweise}</p>
          <p><a className="eintauchen" href={wegUeber()}>Wie diese Welt gemacht ist</a></p>
        </div>
      </section>

      <footer>
        {TRENDONIX.name} · {TRENDONIX.autoren.join(' & ')}
        {' · '}<a href={wegUeber()}>Über</a>
        {' · '}<a href={wegImpressum()}>Impressum</a>
        <span className="feinschrift">
          Kein Motiv dieser Seite ist eine historische Fotografie. Alle Bilder
          wurden eigens für die Bände erzeugt und tragen dieselbe Herkunftsangabe
          wie im Buch.
        </span>
      </footer>

      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(strukturierteDaten) }} />
    </main>
  );
}

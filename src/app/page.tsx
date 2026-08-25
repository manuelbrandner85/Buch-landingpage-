import type { Metadata } from 'next';
import type { Buch, Reihe } from '@/data/gemeinsam/typen';
import {
  OEFFENTLICHE_REIHEN, TRENDONIX,
  assetNach, oeffentlicheBaendeVon, reiheZuBand,
} from '@/world/registry';
import { BASIS_PFAD, bildQuelle, ordner } from '@/world/bilder';
import { wegBuch, wegImpressum, wegReihe, wegUeber, wegVorschau, wegWelt } from '@/world/wege';
import { Buch3D } from '@/scenes/Buch3D';
import { Kaufwege } from '@/scenes/Buecher';
import { Hintergrundvideo } from '@/ui/Hintergrundvideo';
import { Partner } from '@/ui/Partner';

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
    images: wegVorschau('haus'),
  },
  twitter: { card: 'summary_large_image', images: wegVorschau('haus') },
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
          {reihe && (
            <a className="eintauchen" href={wegWelt(reihe.id, buch.id)}>
              In die Welt von Band {buch.nummer}
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

/**
 * Der Empfang zeigt das Haus, nicht ein einzelnes Buch.
 *
 * Vorher stand oben immer der zuletzt erschienene Band – also dauerhaft Band 1,
 * mit seinem Kaufweg. Das bewarb einen Titel statt der Reihe und ließ die
 * anderen Bände wie Zubehör aussehen. Jetzt stehen die Bände nebeneinander,
 * jeder führt in seine eigene Welt, und die Kaufwege stehen im Regal darunter –
 * bei dem Buch, zu dem sie gehören.
 */
export default function Haus() {
  const leitreihe = OEFFENTLICHE_REIHEN[0];
  const leitbaende = leitreihe ? oeffentlicheBaendeVon(leitreihe) : [];
  const motiv = assetNach(leitreihe?.hausmotiv);
  const buecher = OEFFENTLICHE_REIHEN
    .flatMap((r) => oeffentlicheBaendeVon(r))
    .map((b) => b.buch);

  const strukturierteDaten = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: TRENDONIX.name,
    description: TRENDONIX.arbeitsweise,
    slogan: TRENDONIX.versprechen,
    logo: `${BASIS_PFAD}/marke/trendonix.png`,
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
          <p className="marke">
            <img src={`${BASIS_PFAD}/marke/trendonix-tx.png`} alt=""
              width={140} height={94} fetchPriority="high" decoding="async" />
            <span>{TRENDONIX.name}</span>
          </p>
          <h1>{TRENDONIX.versprechen}</h1>
          {leitreihe && (
            <div className="reihenschau">
              <div className="reihenbaende">
                {leitbaende.map((b) => {
                  const cover = assetNach(b.buch.coverAsset);
                  return (
                    <a key={b.buch.id} className="reihenband"
                      href={wegWelt(leitreihe.id, b.buch.id)}
                      aria-label={`Welt von Band ${b.buch.nummer}: ${b.buch.titel}`}>
                      {cover && <Buch3D cover={cover} band={b.buch.id} />}
                      <span className="bandzeile">
                        Band {b.buch.nummer}
                        {b.buch.status === 'erscheint' && <em> · erscheint</em>}
                      </span>
                    </a>
                  );
                })}
              </div>
              <div className="reihentext">
                <p className="eyebrow">{leitreihe.titel}</p>
                <p className="klappe">{leitreihe.einladung}</p>
                <div className="wege">
                  <a className="kaufen" href={wegReihe(leitreihe.id)}>
                    Die Welten betreten
                    <small>{leitbaende.length} Bände · begehbar</small>
                  </a>
                  <a className="eintauchen" href="#buecher">Zu den Büchern</a>
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
        <img className="fussmarke" src={`${BASIS_PFAD}/marke/trendonix-tx.png`}
          alt={TRENDONIX.name} width={120} height={80} loading="lazy" decoding="async" />
        <span className="fusslinks">
          <a href={wegUeber()}>Über</a>
          <span aria-hidden="true">·</span>
          <a href={wegImpressum()}>Impressum</a>
        </span>
        <span className="feinschrift">
          Kein Motiv dieser Seite ist eine historische Fotografie. Alle Bilder
          wurden eigens für die Bände erzeugt und tragen dieselbe Herkunftsangabe
          wie im Buch.
        </span>
        <Partner />
      </footer>

      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(strukturierteDaten) }} />
    </main>
  );
}

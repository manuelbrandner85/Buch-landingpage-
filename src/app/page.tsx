import type { Metadata } from 'next';
import type { Buch, Reihe } from '@/data/gemeinsam/typen';
import { kanalAdressen } from '@/data/gemeinsam/kanaele';
import {
  OEFFENTLICHE_REIHEN, REIHEN_MIT_WELT, TRENDONIX, bandzeile, hatWelt, WELT,
  assetNach, istEinzeltitel, oeffentlicheBaendeVon, reiheZuBand,
} from '@/world/registry';
import { BASIS_PFAD, bildQuelle, bildSatzHtml, ordner } from '@/world/bilder';
import { WEG_COCKPIT, weg, wegAbsolut, wegBuch, wegHaus, wegImpressum, wegReihe, wegUeber, wegVollstaendig, wegVorschau, wegWelt } from '@/world/wege';
import { Buch3D } from '@/scenes/Buch3D';
import { Kaufwege } from '@/scenes/Buecher';
import { Hintergrundvideo } from '@/ui/Hintergrundvideo';
import { Hausfilm } from '@/ui/Hausfilm';
import { og } from '@/world/og';
import { HAUSFILM } from '@/data/gemeinsam/hausfilm';
import { Kanaele } from '@/ui/Kanaele';
import { Partner } from '@/ui/Partner';
import { Verteiler } from '@/ui/Verteiler';
import { Hausmarke } from '@/ui/Hausmarke';
import { Besucherzahl } from '@/ui/Besucherzahl';
import { Unterschrift } from '@/ui/Unterschrift';
import { Sternzeile, Stimmenwand } from '@/ui/Stimmen';
import { esGibtStimmen } from '@/data/gemeinsam/stimmen';
import { einstieg } from '@/data/gemeinsam/kaufweg';

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
  description: TRENDONIX.kurzfassung,
  openGraph: og({
    type: 'website',
    title: `${TRENDONIX.name} – ${TRENDONIX.versprechen}`,
    description: TRENDONIX.kurzfassung,
    images: wegVorschau('haus'),
  }, wegVollstaendig(wegHaus())),
  twitter: { card: 'summary_large_image', images: wegVorschau('haus') },
  // Eine Adresse zählt. Ohne diese Zeile hat die Startseite unter vier
  // Schreibweisen gleichzeitig existiert.
  alternates: { canonical: wegVollstaendig(wegHaus()) ?? wegHaus() },
};

function Weltentor({ reihe }: { reihe: Reihe }) {
  const baende = oeffentlicheBaendeVon(reihe);
  const motiv = assetNach(reihe.hausmotiv);
  // Eine Reihe mit mehreren Bänden hat eine Schwelle, auf der man wählt. Ein
  // Einzeltitel hat nichts zu wählen — sein Tor führt direkt hinein.
  const erster = baende[0];
  const hinein = erster && istEinzeltitel(reihe)
    ? wegWelt(reihe.id, erster.buch.id)
    : wegReihe(reihe.id);
  return (
    <a className="weltentor" href={hinein}
      style={{ ['--signatur' as string]: reihe.signatur }}>
      {motiv && (
        <img src={bildQuelle(motiv, 1000)} alt="" aria-hidden="true"
          loading="lazy" decoding="async" />
      )}
      <span className="tortext">
        <b>{reihe.titel}</b>
        {reihe.unterzeile && <i>{reihe.unterzeile}</i>}
        <em>{istEinzeltitel(reihe) ? 'Einzelband' : `${baende.length} Bände`} · begehbar</em>
      </span>
      <span className="toraktion">Welt betreten</span>
    </a>
  );
}

function Buchkarte({ buch }: { buch: Buch }) {
  const cover = assetNach(buch.coverAsset);
  const reihe = reiheZuBand(buch.id);
  const band = WELT[buch.id];
  // Wo bei einem Band „Die Unsichtbaren Fäden · Band 2“ steht, stünde bei
  // einem Einzeltitel nichts – die Zeile fiele auf die Seitenzahl zusammen
  // und sähe aus wie ein Fehler. „Einzelband“ ist keine Zählung, sondern
  // eine Auskunft: Dieses Buch gehört zu keiner Reihe.
  const zeile = istEinzeltitel(reihe) ? 'Einzelband' : bandzeile(buch);
  return (
    <article className="buchkarte">
      {/* Im Regal steht der Band 208 Pixel breit — die 640er Stufe reicht. */}
      {cover && <Buch3D cover={cover} band={buch.id} breite={208} />}
      <div className="text">
        <p className="band-nr">
          {[zeile, buch.seiten ? `${buch.seiten} Seiten` : '']
            .filter(Boolean).join(' · ')}
        </p>
        <h3><a href={wegBuch(buch.id)}>{buch.titel}</a></h3>
        <Sternzeile bandId={buch.id} nach={`${wegBuch(buch.id)}#stimmen`} />
        {buch.unterzeile && <p className="unterzeile">{buch.unterzeile}</p>}
        <p className="klappe">{buch.klappentext}</p>
        <div className="wege">
          <Kaufwege buch={buch} />
          {reihe && band && hatWelt(band) && (
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
  // Das Regal zeigt die Reihen. Darunter steht, was zu keiner gehört.
  //
  // Ein Einzeltitel mitten zwischen den Bänden einer Reihe sieht aus wie ein
  // vierter Band, dem die Nummer abhandengekommen ist. Deshalb zwei
  // Abschnitte statt einer Liste. Der zweite erscheint nur, wenn es etwas
  // gibt, das hineingehört – solange nicht, ist die Startseite genau die,
  // die sie vorher war.
  const inReihen = buecher.filter((b) => !istEinzeltitel(reiheZuBand(b.id)));
  const einzelbaende = buecher.filter((b) => istEinzeltitel(reiheZuBand(b.id)));

  // Was außerhalb der Reihen steht, stand bis zum 31.08.2026 erst nach vier
  // Bildschirmen — hinter dem Film, den Welten und dem ganzen Regal. Für
  // „Alles nur Zufall?“ hieß das: Der Titel, den es seit gestern zu kaufen
  // gibt und der mit 9,99 € der günstigste Einstieg ins Haus ist, kam auf dem
  // ersten Bildschirm nicht vor.
  //
  // Er bekommt jetzt eine Zeile unter der Reihe. Keine zweite Kachel: Der
  // Empfang gehört der Reihe, und ein vierter Buchkörper daneben sähe aus wie
  // ein Band, dem die Nummer fehlt. Eine Zeile reicht, um zu wissen, dass es
  // ihn gibt.
  //
  // Genommen wird der zuletzt erschienene Einzeltitel, der wirklich zu kaufen
  // ist. Gibt es keinen, fehlt die Zeile — sie erfindet nichts.
  const neuling = einzelbaende
    .filter((b) => b.status === 'erschienen' && b.kaufwege.length > 0)
    .sort((a, b) => (b.erschienen ?? '').localeCompare(a.erschienen ?? ''))[0];
  const neulingWeg = neuling ? einstieg(neuling) : undefined;

  // Das Datenblatt zum Film.
  //
  // Google zeigt zu einem Treffer ein Vorschaubild mit Laufzeit an, wenn es
  // weiß, dass dort ein Video liegt — und nur dann. Der Film steht seit dem
  // 31.08.2026 auf dieser Seite, und ohne diese zwölf Zeilen wüsste keine
  // Suchmaschine davon.
  //
  // `description` ist der Satz, worum es geht, nicht der gesprochene Text.
  // Der steht als `transcript` daneben: Er ist der eigentliche Inhalt, und er
  // ist derselbe, den Vorleseprogramme unter dem Film bekommen — eine Quelle,
  // zwei Verwendungen, keine Abweichung möglich.
  const filmblatt = HAUSFILM.datei && wegVollstaendig(wegHaus())
    ? {
      '@context': 'https://schema.org',
      '@type': 'VideoObject',
      name: HAUSFILM.titel,
      description: HAUSFILM.worum ?? TRENDONIX.kurzfassung,
      // Ohne die Fassungsnummer: Sie gehört an die Adresse im Browser, damit
      // ein Austausch ankommt — im Datenblatt wäre sie eine Adresse, die sich
      // bei jeder neuen Fassung ändert, und Google zählte den Film zweimal.
      thumbnailUrl: wegAbsolut(HAUSFILM.poster.replace(/\?.*$/, '')),
      contentUrl: wegAbsolut(HAUSFILM.datei.replace(/\?.*$/, '')),
      embedUrl: wegVollstaendig(wegHaus()),
      ...(HAUSFILM.dauerISO ? { duration: HAUSFILM.dauerISO } : {}),
      ...(HAUSFILM.erschienen ? { uploadDate: HAUSFILM.erschienen } : {}),
      inLanguage: 'de',
      transcript: HAUSFILM.text.join(' '),
      publisher: { '@type': 'Organization', name: TRENDONIX.name },
    }
    : null;

  const strukturierteDaten = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: TRENDONIX.name,
    description: TRENDONIX.arbeitsweise,
    slogan: TRENDONIX.versprechen,
    logo: `${BASIS_PFAD}/marke/trendonix.png`,
    // Damit Suchmaschinen die sechs Profile diesem Haus zuordnen und nicht
    // sechs Fremde daraus machen.
    sameAs: kanalAdressen(),
  };

  return (
    <main className="haus">
      <section className="hausbild">
        {motiv && (
          <Hintergrundvideo
            bild={bildQuelle(motiv, 1920)}
            bildsatz={bildSatzHtml(motiv)}
            video={ordner(`${motiv.datei}-motion.mp4`, motiv.bandId ?? 'band-1')}
            videoKlein={ordner(`${motiv.datei}-motion-klein.mp4`, motiv.bandId ?? 'band-1')}
            alt={motiv.alt}
          />
        )}
        <div className="hausinhalt">
          <p className="marke">
            <Hausmarke breite={140} hoehe={94} zuerst />
            <span>{TRENDONIX.name}</span>
          </p>
          {/* Hier stand bis zum 30.08.2026 die Besucherzahl — zwischen dem
              Namen des Hauses und der Überschrift.

              Sie war damit das Zweite, was ein Besucher liest, noch vor dem
              Satz, um dessentwillen die Seite existiert. Bei 53 Besuchen sagt
              die Zahl über das Haus nichts, was für den Leser gilt; sie sagt
              nur, dass hier wenig los ist. Eine Auskunft, die niemand verlangt
              hat, und die an dieser Stelle gegen die Seite arbeitet.

              In der Fußzeile steht sie weiter. Dort ist sie das, was sie sein
              soll: eine Angabe für den, der nachsieht. */}
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
                      {/* 176 CSS-Pixel breit, und die Wiege zeigt die
                          Rückseite nie: kleinere Bildstufe, kein
                          Rückseitenbild. Beides zusammen spart auf dem
                          ersten Bildschirm rund 370 KB. */}
                      {cover && (
                        <Buch3D cover={cover} band={b.buch.id}
                          breite={176} rundum={false} />
                      )}
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
          {neuling && (
            <a className="neuzeile" href={wegBuch(neuling.id)}>
              <span className="neumarke">Neu</span>
              <span className="neutext">
                <b>{neuling.titel}</b>
                {neuling.unterzeile && <i>{neuling.unterzeile}</i>}
              </span>
              {neulingWeg?.preis !== undefined && (
                <span className="neupreis">
                  ab {neulingWeg.preis.toFixed(2).replace('.', ',')} €
                </span>
              )}
              <span className="neupfeil" aria-hidden="true">→</span>
            </a>
          )}
        </div>
      </section>

      {/* Der Film über das Haus.
          Er steht hier und nicht ganz oben: Oben entscheidet sich in zwei
          Sekunden, ob jemand bleibt, und dafür ist ein Standbild mit einem
          Satz schneller als jedes Video. Wer weiterscrollt, ist geblieben —
          und genau dann läuft der Film an, von selbst und, sobald der Browser
          es zulässt, mit Ton. Warum das nicht immer sofort geht, steht in
          ui/Hausfilm.tsx. */}
      {HAUSFILM.datei && (
        <Hausfilm
          film={weg(HAUSFILM.datei)}
          filmKlein={HAUSFILM.dateiKlein ? weg(HAUSFILM.dateiKlein) : undefined}
          poster={weg(HAUSFILM.poster)}
          titel={HAUSFILM.titel}
          laenge={HAUSFILM.laenge}
          text={HAUSFILM.text} />
      )}

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
          {REIHEN_MIT_WELT.map((r) => <Weltentor key={r.id} reihe={r} />)}
        </div>
      </section>

      {inReihen.length > 0 && (
        <section className="buecherwand" id="buecher">
          <div className="kopf">
            <p className="eyebrow">Alle Bücher</p>
            <h2>Im Regal von {TRENDONIX.name}</h2>
          </div>
          {inReihen.map((b) => <Buchkarte key={b.id} buch={b} />)}
        </section>
      )}

      {einzelbaende.length > 0 && (
        <section className="buecherwand weitere" id="weitere-buecher">
          <div className="kopf">
            <p className="eyebrow">Weitere Bücher</p>
            <h2>Einzeln, außerhalb der Reihen</h2>
            <p>
              Nicht jedes Buch gehört in eine Reihe. Diese hier stehen für
              sich – dasselbe Haus, dieselbe Arbeitsweise, dieselbe Regel:
              Behauptet wird nichts, was sich nicht prüfen lässt.
            </p>
          </div>
          {einzelbaende.map((b) => <Buchkarte key={b.id} buch={b} />)}
        </section>
      )}

      {esGibtStimmen() && (
        <section className="leserstimmen" id="leserstimmen">
          <div className="kopf">
            <p className="eyebrow">Von denen, die es gelesen haben</p>
            <h2>Was Leser sagen</h2>
          </div>
          <Stimmenwand baende={buecher.map((b) => b.id)} />
        </section>
      )}

      <section className="arbeitsweise">
        <div className="kopf">
          <p className="eyebrow">Wie hier gearbeitet wird</p>
          <h2>Behauptet wird nichts, was sich nicht prüfen lässt</h2>
          <p>{TRENDONIX.arbeitsweise}</p>
          <p><a className="eintauchen" href={wegUeber()}>Wie diese Welt gemacht ist</a></p>
          <Unterschrift />
        </div>
      </section>

      <Verteiler />

      <section className="kanaele" id="kanaele">
        <div className="kopf">
          <p className="eyebrow">Zwischen den Bänden</p>
          <h2>Wo es weitergeht</h2>
          <p>
            Ein Buch erscheint einmal, die Arbeit daran läuft weiter: Motive,
            Fundstücke, Zwischenstände. Auf jedem Kanal steht dasselbe Haus –
            gesucht wird überall unter {TRENDONIX.name}.
          </p>
        </div>
        <Kanaele variante="wand" />
      </section>

      <footer>
        <Hausmarke klasse="fussmarke" alt={TRENDONIX.name} breite={120} hoehe={80} />
        <span className="fusslinks">
          <a href={wegUeber()}>Über</a>
          <span aria-hidden="true">·</span>
          <a href={wegImpressum()}>Impressum</a>
          <span aria-hidden="true">·</span>
          <a className="verwaltung" href={WEG_COCKPIT} rel="nofollow noopener">Admin</a>
        </span>
        <span className="feinschrift">
          Kein Motiv dieser Seite ist eine historische Fotografie. Alle Bilder
          wurden eigens für die Bände erzeugt und tragen dieselbe Herkunftsangabe
          wie im Buch.
        </span>
        {/* Die Zahl steht ganz unten, wo sonst das Copyright steht: eine
            Auskunft, keine Werbung. Gezählt wird auf dem eigenen Server —
            siehe public/z.php. */}
        <Besucherzahl />
        <Kanaele />
        <Partner />
      </footer>

      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(strukturierteDaten) }} />
      {filmblatt && (
        <script type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(filmblatt) }} />
      )}
    </main>
  );
}

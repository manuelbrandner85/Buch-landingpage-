import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  OEFFENTLICHE_BUECHER, TRENDONIX, WELT, assetNach, bandzeile, buchNach,
  hatWelt, istEinzeltitel, reiheZuBand,
} from '@/world/registry';
import { wegBuch, wegHaus, wegKapitel, wegLeseprobe, wegReihe, wegVollstaendig, wegVorschau, wegWelt } from '@/world/wege';
import { ausgaben, brotkrumen, stimmen as stimmenBlatt, urteil } from '@/world/schema';
import { PREISSTAND } from '@/data/gemeinsam/stand';
import { gesamturteil, stimmenVon } from '@/data/gemeinsam/stimmen';
import { Datenblatt } from '@/ui/Datenblatt';
import { BASIS_PFAD } from '@/world/bilder';
import { BLICK } from '@/data/gemeinsam/blick';
import { leseprobeVon } from '@/data/gemeinsam/leseprobe';
import { Buch3D } from '@/scenes/Buch3D';
import { Kaufwege } from '@/scenes/Buecher';
import { Rueckweg } from '@/ui/Rueckweg';
import { Kanaele } from '@/ui/Kanaele';
import { Kaufleiste } from '@/ui/Kaufleiste';
import { Verteiler } from '@/ui/Verteiler';

/** „24. August 2026“ – dieselbe Schreibweise wie im Journal. */
const standDatum = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString('de-DE', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
import { Leserstimmen, Sternzeile } from '@/ui/Stimmen';

/**
 * Die Seite eines einzelnen Buches.
 *
 * Die Welt ist für die, die schon verführt sind. Diese Seite ist für die, die
 * aus einer Suchmaschine kommen und wissen wollen, was drinsteht: Titel,
 * Umfang, Klappentext, Inhalt, Kaufweg – in dieser Reihenfolge, ohne Umweg.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return OEFFENTLICHE_BUECHER.map((b) => ({ id: b.id }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const buch = buchNach((await params).id);
  if (!buch) return {};
  const reihe = reiheZuBand(buch.id);
  return {
    // Mit Reihentitel wird der Treffer bei zwei von drei Baenden zu lang und
    // reisst mitten im Wort ab. Dann traegt ihn die Bandzahl allein.
    title: (() => {
      if (istEinzeltitel(reihe)) return buch.titel;
      const lang = `${buch.titel} – ${reihe?.titel} Band ${buch.nummer}`;
      return lang.length <= 52 ? lang : `${buch.titel} – Band ${buch.nummer}`;
    })(),
    description: buch.unterzeile ?? buch.klappentext.slice(0, 160),
    alternates: { canonical: wegVollstaendig(wegBuch(buch.id)) ?? wegBuch(buch.id) },
    openGraph: {
      type: 'book', title: buch.titel, description: buch.klappentext,
      images: wegVorschau(buch.id),
    },
    twitter: { card: 'summary_large_image', images: wegVorschau(buch.id) },
  };
}

export default async function BuchSeite({ params }: { params: Promise<{ id: string }> }) {
  const buch = buchNach((await params).id);
  if (!buch) notFound();

  const reihe = reiheZuBand(buch.id);
  const welt = Boolean(reihe && hatWelt(WELT[buch.id]!));
  const cover = assetNach(buch.coverAsset);
  const kapitel = WELT[buch.id]?.kapitel ?? [];
  const blick = BLICK[buch.id] ?? [];
  const probe = leseprobeVon(buch.id);
  // Sterne und Zitate kommen aus data/gemeinsam/stimmen.ts. Steht dort für
  // diesen Band nichts, bleibt hier alles unsichtbar; steht etwas drin,
  // erscheint es oben am Kaufweg, weiter unten als Abschnitt und im
  // Datenblatt. Für Band 1 stehen seit dem 31.08.2026 zwei Rezensionen drin.
  const bewertet = gesamturteil(buch.id);
  const zitate = stimmenVon(buch.id);

  const strukturierteDaten = {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: istEinzeltitel(reihe)
      ? buch.titel : `${reihe?.titel} – Band ${buch.nummer}: ${buch.titel}`,
    ...(istEinzeltitel(reihe) ? {} : { bookEdition: `Band ${buch.nummer}` }),
    inLanguage: 'de',
    numberOfPages: buch.seiten,
    description: buch.klappentext,
    publisher: { '@type': 'Organization', name: TRENDONIX.name },
    author: { '@type': 'Organization', name: TRENDONIX.name },
    // Das Cover: Google zeigt es im Buchtreffer an. Preis, ISBN und
    // Erscheinungsdatum fehlen hier bewusst – sie stehen nirgends auf der
    // Seite, und was die Seite nicht zeigt, behauptet das Datenblatt nicht.
    ...(wegVorschau(buch.id) ? { image: wegVorschau(buch.id) } : {}),
    url: wegVollstaendig(wegBuch(buch.id)) ?? wegBuch(buch.id),
    ...(buch.erschienen ? { datePublished: buch.erschienen } : {}),
    ...(buch.kaufwege.length ? { workExample: ausgaben(buch.kaufwege) } : {}),
    // Nur, wenn dieselben Zahlen auch auf der Seite stehen.
    ...(urteil(bewertet) ? { aggregateRating: urteil(bewertet) } : {}),
    ...(zitate.length ? { review: stimmenBlatt(zitate) } : {}),
  };

  return (
    <main className="lesefassung buchseite">
      {/* Zurück wohin?
          In die Welt, wenn es eine gibt — bei einem Einzeltitel direkt in seine,
          denn eine Reihenschwelle hat er nicht; die Seite gibt es gar nicht.
          Ohne Welt ins Regal, denn ins Leere zu verweisen ist schlimmer als
          eine Ebene zu überspringen. */}
      <Rueckweg
        nach={welt && reihe
          ? (istEinzeltitel(reihe) ? wegWelt(reihe.id, buch.id) : wegReihe(reihe.id))
          : wegHaus()}
        text={!welt || !reihe ? 'Zurück ins Regal'
          : istEinzeltitel(reihe) ? 'In die Welt dieses Buches'
          : `Zurück in ${reihe.titel}`} />
      {bandzeile(buch) && <p className="eyebrow">{bandzeile(buch)}</p>}
      <h1>{buch.titel}</h1>
      {buch.unterzeile && <p className="unterzeile">{buch.unterzeile}</p>}

      <div className="buchkopf">
        {cover && <Buch3D cover={cover} band={buch.id} />}
        <div>
          <p className="klappe">{buch.klappentext}</p>
          {buch.seiten && (
            <p className="quelle"><b>Umfang</b>{buch.seiten} Seiten</p>
          )}
          <Sternzeile bandId={buch.id} />
          <div className="wege"><Kaufwege buch={buch} /></div>
        </div>
      </div>

      {buch.kaufwege.length > 0 && (
        <>
          <h2>Wo es das Buch gibt</h2>
          <ul className="ausgabenliste">
            {buch.kaufwege.map((k) => (
              <li key={`${k.form}-${k.haendler}-${k.url}`}>
                <a href={k.url} target="_blank" rel="noopener noreferrer">
                  {k.form} {k.art === 'ausleihe' ? 'ausleihen bei' : 'bei'} {k.haendler}
                </a>
                {k.preis !== undefined && k.art !== 'ausleihe' && (
                  <span className="seite">
                    {' · '}{k.preis.toFixed(2).replace('.', ',')} €
                  </span>
                )}
                {k.isbn && <span className="seite">{' · ISBN '}{k.isbn}</span>}
                {k.hinweis && <span className="seite">{' · '}{k.hinweis}</span>}
              </li>
            ))}
          </ul>
          <p className="quelle">
            <b>Hinweis</b>Hier steht, was es wirklich gibt, mit den Preisen vom
            {' '}{PREISSTAND}. Kommt eine Ausgabe dazu – eine eigene ISBN, der
            Buchhandel, tolino –, steht sie an dieser Stelle, sobald sie
            bestellbar ist.
          </p>
        </>
      )}

      {/* Wo ein Band steht, der noch nicht zu haben ist.
          Hier stand vorher nichts — nur ein Knopf, auf dem „Erscheint in
          Kürze“ zu lesen war. Wer auf einer Buchseite landet, die nichts
          verkauft, hat genau eine Frage: warum nicht, und wann? Die zweite
          Hälfte bleibt unbeantwortet, solange kein Datum feststeht — die
          erste lässt sich beantworten, und zwar wahr. */}
      {buch.status === 'erscheint' && buch.stand && (
        <>
          <h2>Wo dieser Band steht</h2>
          <p>{buch.stand.satz}</p>
          <p>
            Ein Erscheinungsdatum steht hier erst, wenn es eines gibt. Das ist
            keine Geheimniskrämerei, sondern dieselbe Regel wie im Buch:
            angekündigt wird, was zu haben ist. Ein „demnächst“ wäre schneller
            geschrieben und weniger wert.
          </p>
          {welt && (
            <p>
              Durchschreiten lässt sich der Band trotzdem schon —{' '}
              <a href={wegWelt(reihe!.id, buch.id)}>
                in die Welt von Band {buch.nummer}
              </a>. Die Kapitel, die Orte und die Motive sind dieselben wie im
              gedruckten Band.
            </p>
          )}
          <p>
            Und wer ihn zuerst lesen will: Der nächste Band geht als
            Leseexemplar zuerst an den Verteiler, bevor er erscheint.{' '}
            <a href="#verteiler">Weiter unten auf dieser Seite</a> steht das
            Feld dafür.
          </p>
          <p className="quelle">
            <b>Stand</b>{standDatum(buch.stand.vom)}. Diese Zeile bewegt sich,
            wenn die Arbeit sich bewegt.
          </p>
        </>
      )}

      <Leserstimmen bandId={buch.id} />

      {blick.length > 0 && (
        <>
          <h2>Blick ins Buch</h2>
          <p>
            Vier Seiten aus der Druckdatei, unverändert. So ist der Band gesetzt:
            Motiv, Marginalie, Belegtabelle, Schlüsselsatz.
          </p>
          <div className="blick">
            {blick.map((b) => (
              <figure key={b.seite}>
                <a href={`${BASIS_PFAD}/blick/${buch.id}-${b.seite}.webp`}
                  target="_blank" rel="noopener noreferrer">
                  <picture>
                    <source srcSet={`${BASIS_PFAD}/blick/${buch.id}-${b.seite}.avif`} type="image/avif" />
                    <img src={`${BASIS_PFAD}/blick/${buch.id}-${b.seite}.webp`}
                      alt={`Seite ${b.seite}: ${b.was}`} loading="lazy" decoding="async" />
                  </picture>
                </a>
                <figcaption>Seite {b.seite} · {b.was}</figcaption>
              </figure>
            ))}
          </div>
        </>
      )}

      {probe && (
        <div className="leseprobe">
          <div>
            <h2>Leseprobe</h2>
            <p>{probe.inhalt}</p>
            <p className="quelle">
              <b>Datei</b>PDF, {probe.seiten} Seiten, {probe.groesse}. Ohne Konto,
              ohne E-Mail-Adresse, ohne Weiterleitung.
            </p>
          </div>
          <a className="knopf" href={wegLeseprobe(probe.datei)}
            download={probe.datei} type="application/pdf">
            Leseprobe laden
          </a>
        </div>
      )}

      {kapitel.length > 0 && (
        <>
          <h2>Was drinsteht</h2>
          <ul className="kapitelliste">
            {kapitel.map((k) => (
              <li key={k.id}>
                {reihe
                  ? <a href={wegKapitel(reihe.id, k.id)}>Kapitel {k.id} – {k.titel}</a>
                  : <>Kapitel {k.id} – {k.titel}</>}
                <span className="seite"> · {k.unterzeile} · Seiten {k.seiten[0]}–{k.seiten[1]}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      {/* Wer bis hierher gelesen und die Leseprobe genommen hat, ist der
          einzige Mensch auf dieser Seite, für den der Verteiler etwas bedeutet.
          Auf der Startseite steht er auch – hier steht er richtig. */}
      <Verteiler />

      {/* Wohin von hier aus weiter.
          Ein Band mit Welt führt in seine Welt. Ein Buch ohne Welt – „Alles
          nur Zufall?“ ist das erste – hat keine Reihenschwelle; sein Weg
          zurück ist das Regal, in dem es steht. Bis zum 29.08.2026 stand hier
          für beide dasselbe, und für das zweite führte es auf eine Seite, die
          es nicht gibt. */}
      <nav className="fusszeile">
        {welt && reihe
          ? (
            <a href={istEinzeltitel(reihe) ? wegWelt(reihe.id, buch.id) : wegReihe(reihe.id)}>
              {istEinzeltitel(reihe) ? 'In die Welt dieses Buches' : 'In die Welt dieses Bandes'}
            </a>
          )
          : <a href={`${wegHaus()}#buecher`}>Zurück ins Regal</a>}
      </nav>
      <Kanaele />
      <Kaufleiste buch={buch} urteil={bewertet} />
      <Datenblatt daten={strukturierteDaten} />
      <Datenblatt daten={brotkrumen([
        { name: 'Start', weg: wegHaus() },
        // Nur eine Reihe mit mehreren Bänden hat eine eigene Seite. Bei einem
        // Einzeltitel stünde dort ohnehin zweimal derselbe Titel.
        ...(welt && reihe && !istEinzeltitel(reihe)
          ? [{ name: reihe.titel, weg: wegReihe(reihe.id) }] : []),
        { name: buch.titel, weg: wegBuch(buch.id) },
      ])} />
    </main>
  );
}

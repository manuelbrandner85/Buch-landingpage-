import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  OEFFENTLICHE_BUECHER, TRENDONIX, WELT, assetNach, buchNach, reiheZuBand,
} from '@/world/registry';
import { wegBuch, wegHaus, wegKapitel, wegLeseprobe, wegReihe, wegVollstaendig, wegVorschau } from '@/world/wege';
import { ausgaben, brotkrumen } from '@/world/schema';
import { Datenblatt } from '@/ui/Datenblatt';
import { BASIS_PFAD } from '@/world/bilder';
import { BLICK } from '@/data/gemeinsam/blick';
import { leseprobeVon } from '@/data/gemeinsam/leseprobe';
import { Buch3D } from '@/scenes/Buch3D';
import { Kaufwege } from '@/scenes/Buecher';
import { Rueckweg } from '@/ui/Rueckweg';
import { Kanaele } from '@/ui/Kanaele';
import { Kaufleiste } from '@/ui/Kaufleiste';

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
  const cover = assetNach(buch.coverAsset);
  const kapitel = WELT[buch.id]?.kapitel ?? [];
  const blick = BLICK[buch.id] ?? [];
  const probe = leseprobeVon(buch.id);

  const strukturierteDaten = {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: `${reihe?.titel} – Band ${buch.nummer}: ${buch.titel}`,
    bookEdition: `Band ${buch.nummer}`,
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
  };

  return (
    <main className="lesefassung buchseite">
      <Rueckweg nach={reihe ? wegReihe(reihe.id) : wegHaus()}
        text={reihe ? `Zurück in ${reihe.titel}` : 'Zurück'} />
      <p className="eyebrow">{reihe?.titel} · Band {buch.nummer}</p>
      <h1>{buch.titel}</h1>
      {buch.unterzeile && <p className="unterzeile">{buch.unterzeile}</p>}

      <div className="buchkopf">
        {cover && <Buch3D cover={cover} band={buch.id} />}
        <div>
          <p className="klappe">{buch.klappentext}</p>
          {buch.seiten && (
            <p className="quelle"><b>Umfang</b>{buch.seiten} Seiten</p>
          )}
          <div className="wege"><Kaufwege buch={buch} /></div>
        </div>
      </div>

      {buch.kaufwege.length > 0 && (
        <>
          <h2>Wo es das Buch gibt</h2>
          <ul className="ausgabenliste">
            {buch.kaufwege.map((k) => (
              <li key={`${k.form}-${k.haendler}`}>
                <a href={k.url} target="_blank" rel="noopener noreferrer">
                  {k.form} bei {k.haendler}
                </a>
                {k.preis !== undefined && (
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
            <b>Hinweis</b>Hier steht, was es wirklich gibt. Kommt eine Ausgabe
            dazu – eine eigene ISBN, der Buchhandel, tolino –, steht sie an
            dieser Stelle, sobald sie bestellbar ist.
          </p>
        </>
      )}

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

      <nav className="fusszeile">
        {reihe && <a href={wegReihe(reihe.id)}>In die Welt dieses Bandes</a>}
      </nav>
      <Kanaele />
      <Kaufleiste buch={buch} />
      <Datenblatt daten={strukturierteDaten} />
      <Datenblatt daten={brotkrumen([
        { name: 'Start', weg: wegHaus() },
        ...(reihe ? [{ name: reihe.titel, weg: wegReihe(reihe.id) }] : []),
        { name: buch.titel, weg: wegBuch(buch.id) },
      ])} />
    </main>
  );
}

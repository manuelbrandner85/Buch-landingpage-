import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  OEFFENTLICHE_BUECHER, TRENDONIX, WELT, assetNach, buchNach, reiheZuBand,
} from '@/world/registry';
import { wegHaus, wegKapitel, wegLeseprobe, wegReihe, wegVorschau } from '@/world/wege';
import { BASIS_PFAD } from '@/world/bilder';
import { BLICK } from '@/data/gemeinsam/blick';
import { leseprobeVon } from '@/data/gemeinsam/leseprobe';
import { Buch3D } from '@/scenes/Buch3D';
import { Kaufwege } from '@/scenes/Buecher';
import { Rueckweg } from '@/ui/Rueckweg';

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
    title: `${buch.titel} – ${reihe?.titel} Band ${buch.nummer}`,
    description: buch.unterzeile ?? buch.klappentext.slice(0, 160),
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
    ...(buch.kaufwege.length
      ? { workExample: buch.kaufwege.map((k) => ({
        '@type': 'Book', bookFormat: k.form === 'E-Book'
          ? 'https://schema.org/EBook' : 'https://schema.org/Paperback',
        url: k.url, inLanguage: 'de',
      })) }
      : {}),
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
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(strukturierteDaten) }} />
    </main>
  );
}
